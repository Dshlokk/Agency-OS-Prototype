'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart,
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Globe, 
  Download
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import mockDb from '../lib/services/db';
import { Report } from '../lib/types/db';

interface ReportsViewProps {
  refreshTrigger: number;
}

export default function ReportsView({ refreshTrigger }: ReportsViewProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      const allReports = await mockDb.getReports();
      setReports(allReports);
      if (allReports.length > 0 && !selectedReport) {
        setSelectedReport(allReports[0]);
      }
    };
    fetchReports();
  }, [refreshTrigger]);

  const handleExportPDF = () => {
    alert('Generating PDF report for client download...');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Campaign Reports</h2>
          <p className="text-xs text-zinc-500">Review search marketing traffic, ads CPA, and organic keyword growth reports.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedReport?.id || ''}
            onChange={(e) => {
              const rep = reports.find(r => r.id === e.target.value);
              if (rep) setSelectedReport(rep);
            }}
            className="text-xs bg-white border border-zinc-200 focus:border-zinc-900 rounded-lg py-2 px-3 text-zinc-700 font-semibold"
          >
            {reports.map(rep => (
              <option key={rep.id} value={rep.id}>
                {rep.clientName ? `${rep.clientName} - ` : ''}{rep.title}
              </option>
            ))}
          </select>

          <button 
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {selectedReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* STATS & METRICS DISPLAY */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Metric Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {selectedReport.data.metrics.map(metric => (
                <div key={metric.label} className="p-4 bg-white border border-zinc-200 rounded-xl space-y-1.5 shadow-2xs">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">
                    {metric.label}
                  </span>
                  <h4 className="text-base font-bold text-zinc-900">{metric.value}</h4>
                  {metric.change && (
                    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                      metric.isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {metric.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {metric.change}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Chart Area */}
            <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-4">
              <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Metrics Growth Schedule</h4>
              
              <div className="h-60 w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={selectedReport.data.chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#18181b" stopOpacity={0.06}/>
                          <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#a1a1aa" 
                        style={{ fontSize: '9px', fontWeight: '500' }} 
                      />
                      <YAxis 
                        stroke="#a1a1aa" 
                        style={{ fontSize: '9px', fontWeight: '500' }} 
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e4e4e7',
                          borderRadius: '6px',
                          color: '#09090b',
                          fontSize: '11px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={selectedReport.type === 'seo' ? 'traffic' : 'sales'} 
                        stroke="#18181b" 
                        strokeWidth={1.5}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-zinc-50 border border-zinc-200 rounded-xl shimmer flex items-center justify-center text-xs text-zinc-400">
                    Loading trend analytics...
                  </div>
                )}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-2">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Executive Summary</span>
              <p className="text-xs text-zinc-650 leading-relaxed font-medium">
                {selectedReport.executiveSummary}
              </p>
            </div>

          </div>

          {/* AI INSIGHTS BLOCK */}
          <div className="space-y-6">
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h3 className="font-bold text-xs text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-zinc-600" />
                  AI Summary Audit
                </h3>
              </div>

              {/* Insights */}
              <div className="space-y-4">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Key Performance Observations</span>
                <div className="space-y-2.5 text-xs leading-normal">
                  {selectedReport.insights.map(ins => (
                    <div key={ins} className="p-3 bg-white border border-zinc-200 rounded-lg text-zinc-600 shadow-2xs">
                      {ins}
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunities */}
              <div className="space-y-4 pt-2 border-t border-zinc-200">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Growth Opportunities</span>
                <div className="space-y-2.5 text-xs leading-normal">
                  {selectedReport.opportunities.map(opp => (
                    <div key={opp} className="p-3 bg-white border border-zinc-200 rounded-lg text-zinc-600 shadow-2xs">
                      {opp}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="space-y-4 pt-2 border-t border-zinc-200">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">AI Suggested Action Checklist</span>
                <div className="space-y-2 text-xs">
                  {selectedReport.nextSteps.map(step => (
                    <div key={step} className="flex items-start gap-2 text-zinc-700 leading-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0 mt-1.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="h-[400px] bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-center p-6 text-zinc-400">
          <h3 className="font-bold text-sm text-zinc-500">No report available</h3>
        </div>
      )}

    </div>
  );
}
