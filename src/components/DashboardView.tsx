'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  FolderKanban, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ArrowUpRight,
  Zap,
  Clock,
  Briefcase
} from 'lucide-react';
import mockDb from '../lib/services/db';
import { Lead, Project, Task, Client } from '../lib/types/db';

interface DashboardViewProps {
  onNavigate: (section: string) => void;
  onOpenAssistant: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function DashboardView({ onNavigate, onOpenAssistant, refreshTrigger, triggerRefresh }: DashboardViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const allLeads = await mockDb.getLeads();
      const allProjects = await mockDb.getProjects();
      const allTasks = await mockDb.getTasks();
      const allClients = await mockDb.getClients();

      setLeads(allLeads);
      setProjects(allProjects);
      setTasks(allTasks);
      setClients(allClients);
    };
    loadData();
  }, [refreshTrigger]);

  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  const delayedProjectsCount = projects.filter(p => p.status === 'delayed').length;
  const completedProjectsCount = projects.filter(p => p.status === 'completed').length;

  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done');
  const delayedTasks = tasks.filter(t => t.delayPrediction && t.delayPrediction.includes('delay') && t.status !== 'done');

  const monthlyRevenue = 34500;
  const activeClientsCount = clients.length;

  return (
    <div className="space-y-6 pb-10">
      
      {/* CO-PILOT CARD PANEL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-zinc-50 border border-zinc-200 rounded-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-white shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-zinc-900">
              AI Copilot Monitor Active
            </h3>
            <p className="text-[10px] text-zinc-500 leading-normal">Operational triggers, lead conversions, and workload capacities are monitored automatically.</p>
          </div>
        </div>
        <button 
          onClick={onOpenAssistant}
          className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 text-zinc-700 transition-all shrink-0"
        >
          <span>Ask AI for recommendations</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>

      {/* METRIC CARD GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white border border-zinc-200 hover:border-zinc-300 p-5 rounded-xl cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Monthly Revenue</span>
            <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-lg font-bold tracking-tight text-zinc-900">${monthlyRevenue.toLocaleString()}</h4>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2%
          </span>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigate('clients')}
          className="bg-white border border-zinc-200 hover:border-zinc-300 p-5 rounded-xl cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Active Clients</span>
            <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-lg font-bold tracking-tight text-zinc-900">{activeClientsCount}</h4>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +1 new client
          </span>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigate('crm')}
          className="bg-white border border-zinc-200 hover:border-zinc-300 p-5 rounded-xl cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Total Leads</span>
            <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-lg font-bold tracking-tight text-zinc-900">{leads.length}</h4>
          <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1 mt-1">
            Pipeline Avg Score: 78%
          </span>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white border border-zinc-200 hover:border-zinc-300 p-5 rounded-xl cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Projects Active</span>
            <div className="w-7 h-7 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-lg font-bold tracking-tight text-zinc-900">{activeProjectsCount}</h4>
          <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {delayedProjectsCount} delayed
          </span>
        </div>

      </div>

      {/* BOTTOM SECTION: AI INSIGHTS & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI INSIGHTS PANEL (Takes 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
              <h3 className="font-bold text-xs text-zinc-900 flex items-center gap-1.5 uppercase tracking-wide">
                AI Recommendations
              </h3>
            </div>

            <div className="space-y-3">
              
              {/* Insight 1 */}
              <div className="flex gap-3.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg transition-colors">
                <div className="w-7.5 h-7.5 rounded bg-white border border-zinc-250 flex items-center justify-center text-zinc-700 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-zinc-800">High-Conversion Opportunity</p>
                  <p className="text-zinc-500 leading-normal">
                    Lead **Delta Health Group** has scored **92/100**. Conversion probability is **88%**. Recommend sending the revised contract today.
                  </p>
                  <div className="pt-1">
                    <button 
                      onClick={() => onNavigate('crm')}
                      className="text-[10px] text-zinc-900 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>Check CRM board</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Insight 2 */}
              <div className="flex gap-3.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg transition-colors">
                <div className="w-7.5 h-7.5 rounded bg-white border border-zinc-250 flex items-center justify-center text-zinc-700 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-zinc-800">Critical Project Delay Warning</p>
                  <p className="text-zinc-500 leading-normal">
                    Campaign **Quantum Tech Competitor Comparison Hub** is **delayed**. AI predicts a 4-day downstream launch lag due to unapproved copy draft.
                  </p>
                  <div className="pt-1">
                    <button 
                      onClick={() => onNavigate('projects')}
                      className="text-[10px] text-zinc-900 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>Check project tasks</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Insight 3 */}
              <div className="flex gap-3.5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg transition-colors">
                <div className="w-7.5 h-7.5 rounded bg-white border border-zinc-250 flex items-center justify-center text-zinc-700 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-zinc-800">Workload Capacity Optimization</p>
                  <p className="text-zinc-500 leading-normal">
                    **Liam Neeson** is at **90%** resource utilization capacity, while **Sophia Loren** is at **72%**. Reallocate incoming technical SEO checklist items to Sophia.
                  </p>
                  <div className="pt-1">
                    <button 
                      onClick={() => onNavigate('team')}
                      className="text-[10px] text-zinc-900 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>Check team workspace</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* UPCOMING PRIORITIES */}
        <div className="space-y-6">
          <div className="p-5 bg-white border border-zinc-200 rounded-xl h-full flex flex-col justify-between">
            <div className="space-y-4.5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-bold text-xs text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Upcoming Priorities
                </h3>
              </div>

              <div className="space-y-3">
                {urgentTasks.length === 0 && delayedTasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-400">
                    <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-zinc-300" />
                    No high priority concerns.
                  </div>
                ) : (
                  <>
                    {urgentTasks.map(task => (
                      <div key={task.id} className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-1.5 hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                            Urgent
                          </span>
                          <span className="text-[9px] text-zinc-400">Due soon</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-700 truncate">{task.title}</p>
                        <p className="text-[9px] text-zinc-400">Assignee: {task.assigneeName}</p>
                      </div>
                    ))}
                    
                    {delayedTasks.map(task => (
                      <div key={task.id} className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-1.5 hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                            Delayed
                          </span>
                          <span className="text-[9px] text-zinc-400">Warning</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-700 truncate">{task.title}</p>
                        <p className="text-[9px] text-zinc-500 leading-normal line-clamp-2">{task.delayPrediction}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <button 
              onClick={() => onNavigate('projects')}
              className="w-full mt-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-xs font-semibold rounded-lg text-white transition-colors text-center"
            >
              Open project lists
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
