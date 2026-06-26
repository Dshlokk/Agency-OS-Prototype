'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  Mail, 
  Phone, 
  Globe, 
  X,
  Target
} from 'lucide-react';
import mockDb from '../lib/services/db';
import { Lead, PipelineStage } from '../lib/types/db';

interface CrmViewProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'new', label: 'New Lead', color: 'bg-zinc-100 text-zinc-700 border-zinc-250' },
  { id: 'discovery', label: 'Discovery Call', color: 'bg-zinc-100 text-zinc-700 border-zinc-250' },
  { id: 'proposal-sent', label: 'Proposal Sent', color: 'bg-zinc-100 text-zinc-700 border-zinc-250' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-zinc-100 text-zinc-700 border-zinc-250' },
  { id: 'won', label: 'Won', color: 'bg-zinc-100 text-zinc-700 border-zinc-250' },
  { id: 'lost', label: 'Lost', color: 'bg-zinc-100 text-zinc-750 border-zinc-250' }
];

export default function CrmView({ refreshTrigger, triggerRefresh }: CrmViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  
  // New Lead Form State
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    industry: 'SaaS',
    revenueRange: '$1M - $5M',
    socialLinks: { linkedin: '', instagram: '' },
    leadSource: 'Google Search',
    notes: ''
  });

  useEffect(() => {
    const fetchLeads = async () => {
      const allLeads = await mockDb.getLeads();
      setLeads(allLeads);
    };
    fetchLeads();
  }, [refreshTrigger]);

  const handleStageChange = async (leadId: string, newStage: PipelineStage) => {
    const updated = await mockDb.updateLeadStage(leadId, newStage);
    if (updated) {
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, stage: newStage });
      }
      triggerRefresh();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyName) return;

    await mockDb.createLead({
      name: formData.name,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      industry: formData.industry,
      revenueRange: formData.revenueRange,
      socialLinks: formData.socialLinks,
      leadSource: formData.leadSource,
      notes: formData.notes,
      stage: 'new'
    });

    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      website: '',
      industry: 'SaaS',
      revenueRange: '$1M - $5M',
      socialLinks: { linkedin: '', instagram: '' },
      leadSource: 'Google Search',
      notes: ''
    });
    setShowAddModal(false);
    triggerRefresh();
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('AI-generated outbound copy template copied!');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Leads Pipeline</h2>
          <p className="text-xs text-zinc-500 font-medium">Track accounts and qualify opportunities. Converting to Won provisions projects.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Capture Lead</span>
        </button>
      </div>

      {/* PIPELINE GRID BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto no-scrollbar">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.id);
          return (
            <div 
              key={stage.id} 
              className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-4 min-w-[200px] flex flex-col h-[calc(100vh-220px)]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 shrink-0">
                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">
                  {stage.label}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">{stageLeads.length}</span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar pr-0.5">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-6 text-[10px] text-zinc-400 border border-dashed border-zinc-200 rounded-lg bg-white/50">
                    Empty column
                  </div>
                ) : (
                  stageLeads.map(lead => (
                    <div 
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="p-3 bg-white border border-zinc-200 hover:border-zinc-350 rounded-lg cursor-pointer transition-all duration-150 relative overflow-hidden group shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-zinc-800 group-hover:text-zinc-950 truncate">{lead.companyName}</h4>
                          <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 border border-zinc-200 px-1 py-0.5 rounded leading-none">
                            {lead.score}%
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate">{lead.name}</p>
                        
                        <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1.5 border-t border-zinc-100">
                          <span>{lead.industry}</span>
                          <span>{lead.revenueRange}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* LEAD DETAILED SLIDEOVER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div 
            onClick={() => setSelectedLead(null)}
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs"
          />
          <div className="relative w-full sm:w-[540px] h-full bg-white border-l border-zinc-200 shadow-2xl flex flex-col overflow-y-auto p-6 md:p-8 space-y-5">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-md font-bold text-zinc-900">{selectedLead.companyName}</h3>
                <p className="text-xs text-zinc-400">Contact: {selectedLead.name} ({selectedLead.industry})</p>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Quick Contact Info */}
            <div className="grid grid-cols-2 gap-3.5 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-zinc-600">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span className="truncate">{selectedLead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>{selectedLead.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 col-span-2">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <a href={`https://${selectedLead.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{selectedLead.website}</a>
              </div>
            </div>

            {/* Stagepicker */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Change Stage</span>
              <div className="grid grid-cols-3 gap-2">
                {STAGES.map(stg => (
                  <button
                    key={stg.id}
                    onClick={() => handleStageChange(selectedLead.id, stg.id)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border text-center transition-all ${
                      selectedLead.stage === stg.id
                        ? 'bg-zinc-950 border-zinc-900 text-white'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600'
                    }`}
                  >
                    {stg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Context Notes</span>
              <div className="p-4 border border-zinc-200 rounded-xl text-xs text-zinc-600 leading-relaxed bg-white">
                {selectedLead.notes || 'No description added yet.'}
              </div>
            </div>

            {/* AI SCORE PANEL */}
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h4 className="font-bold text-xs text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-zinc-600" />
                  AI Lead Qualification
                </h4>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-zinc-500 font-medium">Conversion Probability:</span>
                  <span className="font-bold text-zinc-900 bg-white border border-zinc-250 px-2 py-0.5 rounded">{selectedLead.conversionProbability}%</span>
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Heuristics Score:</span>
                    <strong className="text-zinc-850">{selectedLead.score} / 100</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Quality Rating:</span>
                    <strong className="text-zinc-850 font-semibold">{selectedLead.quality}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-[10px] uppercase tracking-wider block font-bold">Suggested Pitch Services</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedLead.suggestedServices.map(srv => (
                        <span key={srv} className="text-[9px] bg-white border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Recommended Action</span>
                  <p className="text-zinc-600 leading-normal bg-white p-3 rounded-lg border border-zinc-200">
                    {selectedLead.suggestedFollowUp}
                  </p>
                </div>
              </div>

              {/* Generated message */}
              <div className="space-y-2 pt-2.5 border-t border-zinc-200">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">AI Outbound Template copy</span>
                  <button 
                    onClick={() => handleCopyMessage(selectedLead.generatedMessage)}
                    className="text-[10px] text-zinc-900 hover:underline font-bold"
                  >
                    Copy Template
                  </button>
                </div>
                <pre className="p-3 bg-white border border-zinc-250 rounded-lg text-[10px] font-sans text-zinc-600 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {selectedLead.generatedMessage}
                </pre>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* CAPTURE NEW LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-white border border-zinc-250 rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Capture Lead</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@acme.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Website URL</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="acme.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full"
                  >
                    <option value="SaaS">B2B SaaS</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Food & Retail">Food & Retail</option>
                    <option value="Agency">Agency</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Revenue</label>
                  <select
                    value={formData.revenueRange}
                    onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })}
                    className="w-full"
                  >
                    <option value="$100k - $500k">$100k - $500k</option>
                    <option value="$500k - $1M">$500k - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M - $10M">$5M - $10M</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Notes & Goals Context</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Hurdles, details, active systems..."
                  rows={2}
                  className="w-full"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Initialize AI Score & Save</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
