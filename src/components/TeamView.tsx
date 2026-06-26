'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  Sparkles, 
  CheckCircle2, 
  Calendar
} from 'lucide-react';
import mockDb from '../lib/services/db';
import { User } from '../lib/types/db';

interface TeamViewProps {
  refreshTrigger: number;
}

export default function TeamView({ refreshTrigger }: TeamViewProps) {
  const [team, setTeam] = useState<User[]>([]);

  useEffect(() => {
    const loadTeam = async () => {
      const allUsers = await mockDb.getUsers();
      setTeam(allUsers.filter(u => u.role !== 'client'));
    };
    loadTeam();
  }, [refreshTrigger]);

  const mockMeetings = [
    {
      id: 'm1',
      title: 'Weekly Alignment & Campaign Sync',
      date: 'June 24, 2026',
      summary: 'Discussed launching comparative content hubs for Quantum Tech. Verified Core Web Vitals script blockage. Liam Neeson will optimize asset scripts and payload overhead. Sophia Loren will finalize target developer queries.',
      actionItems: [
        'Liam: Compress heavy JS script bundles and test speed updates.',
        'Sophia: Finalize developer search queries listing.',
        'Emma: Coordinate next sync meeting.'
      ]
    },
    {
      id: 'm2',
      title: 'Paid Ads Performance briefing',
      date: 'June 20, 2026',
      summary: 'Reviewed Zenith Apparel Meta ad performance parameters. High purchase rate from environmentally friendly shipping video assets. Scaled target campaign budgets by 20%.',
      actionItems: [
        'Sophia: Deploy Cart Abandonment flow setup.',
        'Emma: Monitor lookalike target ad configurations.'
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Team Hub</h2>
        <p className="text-xs text-zinc-500">Monitor resource capacities, velocities, and review transcribed alignment meetings.</p>
      </div>

      {/* TEAM DIRECTORY CARDS */}
      <div className="space-y-3">
        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Active Accounts</span>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {team.map(member => (
            <div key={member.id} className="p-5 bg-white border border-zinc-200 rounded-xl space-y-3.5 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <img 
                  src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-zinc-800">{member.name}</h4>
                  <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">{member.role.replace('-', ' ')}</p>
                  <p className="text-[10px] text-zinc-500 font-normal">{member.email}</p>
                </div>
              </div>

              {/* Stats */}
              {member.productivityScore && member.resourceUtilization && (
                <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-[10px] font-normal block">Productivity Score</span>
                    <strong className="text-zinc-800 block">{member.productivityScore}%</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-[10px] font-normal block">Workload Utilization</span>
                    <strong className={`block ${member.resourceUtilization > 85 ? 'text-rose-600' : 'text-zinc-700'}`}>
                      {member.resourceUtilization}%
                    </strong>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MEETING TRANSCRIPTS summaries */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">AI Meeting Transcripts</span>
          
          <div className="space-y-4">
            {mockMeetings.map(meet => (
              <div key={meet.id} className="p-5 bg-white border border-zinc-200 rounded-xl space-y-4 shadow-2xs">
                <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800">{meet.title}</h4>
                    <span className="text-[9px] text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {meet.date}
                    </span>
                  </div>
                  <span className="text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    AI Summary
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1 text-xs">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Brief Transcript Summary</span>
                    <p className="text-zinc-650 leading-relaxed">{meet.summary}</p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Assigned Actions</span>
                    <div className="space-y-1">
                      {meet.actionItems.map(item => (
                        <div key={item} className="flex items-start gap-2 text-zinc-700 leading-normal">
                          <CheckCircle2 className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROD INSIGHTS */}
        <div className="space-y-4">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">AI Resource Audit</span>

          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-5">
            <h3 className="font-bold text-xs text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-zinc-600" />
              Resource Optimization
            </h3>

            <div className="space-y-4 text-xs leading-normal">
              <div className="space-y-1">
                <strong className="text-zinc-850 block">Workload Balance Warning</strong>
                <p className="text-zinc-600">
                  **Liam Neeson** has an active workload of **90%**. Sophia Loren has a capacity of **72%**. Reallocating new campaign tasks to Sophia will keep projects on timeline.
                </p>
              </div>

              <div className="space-y-1 pt-3.5 border-t border-zinc-200">
                <strong className="text-zinc-850 block">Productivity Velocity</strong>
                <p className="text-zinc-600">
                  Team productivity maintains a steady **91%**, showing an increase following optimized comparison layout workflows.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
