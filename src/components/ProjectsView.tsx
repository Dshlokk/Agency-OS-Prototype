'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  List, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  X,
  Trash2
} from 'lucide-react';
import mockDb from '../lib/services/db';
import { Task, TaskStatus, TaskPriority, Project, User } from '../lib/types/db';

interface ProjectsViewProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const STATUSES: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-zinc-100 text-zinc-900 border-zinc-300' },
  { id: 'review', label: 'In Review', color: 'bg-zinc-100 text-zinc-900 border-zinc-350' },
  { id: 'done', label: 'Done', color: 'bg-zinc-100 text-zinc-400 border-zinc-200' }
];

const PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
  { id: 'low', label: 'Low', color: 'text-zinc-400 bg-zinc-50 border-zinc-200' },
  { id: 'medium', label: 'Medium', color: 'text-zinc-600 bg-zinc-50 border-zinc-200' },
  { id: 'high', label: 'High', color: 'text-zinc-900 bg-zinc-100 border-zinc-300' },
  { id: 'urgent', label: 'Urgent', color: 'text-rose-600 bg-rose-50 border-rose-100' }
];

export default function ProjectsView({ refreshTrigger, triggerRefresh }: ProjectsViewProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Create Task Form State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigneeId: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadData = async () => {
      const allTasks = await mockDb.getTasks();
      setTasks(allTasks);

      const allProjects = await mockDb.getProjects();
      setProjects(allProjects);
      if (allProjects.length > 0 && !formData.projectId) {
        setFormData(prev => ({ ...prev, projectId: allProjects[0].id }));
      }

      const allUsers = await mockDb.getUsers();
      setUsers(allUsers.filter(u => u.role !== 'client'));
      if (allUsers.length > 0 && !formData.assigneeId) {
        setFormData(prev => ({ ...prev, assigneeId: allUsers[0].id }));
      }
    };
    loadData();
  }, [refreshTrigger]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const updated = await mockDb.updateTaskStatus(taskId, newStatus);
    if (updated) {
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
      triggerRefresh();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    const ok = await mockDb.deleteTask(taskId);
    if (ok) {
      setSelectedTask(null);
      triggerRefresh();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId || !formData.assigneeId) return;

    const proj = projects.find(p => p.id === formData.projectId);
    const user = users.find(u => u.id === formData.assigneeId);

    await mockDb.createTask({
      projectId: formData.projectId,
      projectName: proj?.name || 'Campaign',
      title: formData.title,
      description: formData.description,
      status: 'todo',
      priority: formData.priority,
      assigneeId: formData.assigneeId,
      assigneeName: user?.name || 'Emma Stone',
      dueDate: new Date(formData.dueDate).toISOString()
    });

    setFormData(prev => ({
      ...prev,
      title: '',
      description: '',
      priority: 'medium'
    }));
    setShowAddModal(false);
    triggerRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Projects Dashboard</h2>
          <p className="text-xs text-zinc-500">Track milestones and analyze workload balancing dynamically.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-zinc-500">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban' ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/50' : 'hover:text-zinc-800'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list' ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/50' : 'hover:text-zinc-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List View</span>
            </button>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {STATUSES.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-4 flex flex-col h-[calc(100vh-230px)] min-w-[200px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 shrink-0">
                  <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 uppercase tracking-wide">
                    {col.label}
                    <span className="text-[10px] bg-white border border-zinc-200 text-zinc-400 px-1.5 py-0.5 rounded font-bold">
                      {colTasks.length}
                    </span>
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 no-scrollbar">
                  {colTasks.map(task => {
                    const hasDelay = task.delayPrediction && task.delayPrediction.includes('delay');
                    const priorityDetail = PRIORITIES.find(p => p.id === task.priority);
                    
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="p-4 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg cursor-pointer transition-all relative overflow-hidden group shadow-2xs"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider truncate">
                              {task.projectName}
                            </span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${priorityDetail?.color}`}>
                              {task.priority}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-zinc-800 group-hover:text-zinc-950 leading-snug line-clamp-2">
                            {task.title}
                          </h4>

                          {hasDelay && (
                            <div className="flex items-center gap-1 text-[9px] text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-lg">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span className="truncate font-semibold">Delay prediction warning</span>
                            </div>
                          )}

                          {/* Footer details */}
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[9px] text-zinc-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-zinc-600 font-bold truncate max-w-[80px]">
                              {task.assigneeName}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Task Title</th>
                <th className="p-4">Project</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Assignee</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">AI Prediction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-600">
              {tasks.map(task => {
                const priorityDetail = PRIORITIES.find(p => p.id === task.priority);
                const statusDetail = STATUSES.find(s => s.id === task.status);
                const isDelayed = task.delayPrediction && task.delayPrediction.includes('delay');

                return (
                  <tr 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-zinc-50/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-zinc-800">{task.title}</td>
                    <td className="p-4 text-zinc-500">{task.projectName}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusDetail?.color}`}>
                        {statusDetail?.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${priorityDetail?.color}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">{task.assigneeName}</td>
                    <td className="p-4 text-zinc-400 font-medium">
                      {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 max-w-[200px] truncate">
                      {isDelayed ? (
                        <span className="text-[10px] text-rose-600 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          Delay predicted
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-zinc-400" />
                          On track
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TASK DETAILED SLIDEOVER */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div 
            onClick={() => setSelectedTask(null)}
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs"
          />
          <div className="relative w-full sm:w-[480px] h-full bg-white border-l border-zinc-200 shadow-2xl flex flex-col p-6 md:p-8 space-y-5 overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                  {selectedTask.projectName}
                </span>
                <h3 className="text-md font-bold text-zinc-800">{selectedTask.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
              <div className="space-y-1">
                <span className="text-zinc-400 block font-medium">Assignee</span>
                <strong className="text-zinc-700">{selectedTask.assigneeName}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 block font-medium">Due Date</span>
                <strong className="text-zinc-700">
                  {new Date(selectedTask.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Description</span>
              <p className="text-xs text-zinc-650 leading-relaxed bg-zinc-50/50 p-4 rounded-xl border border-zinc-200">
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>

            {/* Status Change Selector */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Move Status</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {STATUSES.map(stat => (
                  <button
                    key={stat.id}
                    onClick={() => handleStatusChange(selectedTask.id, stat.id)}
                    className={`py-1.5 px-3 border rounded-lg font-semibold text-center transition-all ${
                      selectedTask.status === stat.id
                        ? 'bg-zinc-950 border-zinc-900 text-white shadow-xs'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-500'
                    }`}
                  >
                    {stat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Predictions */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
              <h5 className="text-[10px] font-bold text-zinc-750 flex items-center gap-1.5 uppercase tracking-wider">
                AI Timeline Audit
              </h5>
              <p className="text-xs text-zinc-600 leading-normal">
                {selectedTask.delayPrediction || 'On track.'}
              </p>
            </div>

            {/* Delete button */}
            <div className="pt-6 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold rounded-lg text-rose-600 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Task
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-white border border-zinc-250 rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Create Task</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Project Workspace</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full text-xs"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.clientName} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Set up dynamic cart abandonment triggers"
                  className="w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instructions..."
                  rows={3}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Assignee</label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full text-xs"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role.replace('-', ' ')})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow"
              >
                <span>Save & Create Task</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
