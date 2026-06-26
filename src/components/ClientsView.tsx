'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Globe, 
  Share2, 
  Download, 
  CheckSquare, 
  Square,
  Lightbulb,
  FileText,
  Plus,
  X,
  Users,
  Edit2,
  Save,
  Check
} from 'lucide-react';
import mockDb from '../lib/services/db';
import { Client, Proposal, Strategy } from '../lib/types/db';

interface ClientsViewProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function ClientsView({ refreshTrigger, triggerRefresh }: ClientsViewProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'onboarding' | 'intel' | 'strategies' | 'proposals'>('onboarding');
  
  // Proposals & Strategies for selected client
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  
  // Proposal Generator Form State
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [proposalForm, setProposalForm] = useState({
    goals: '',
    servicesRequired: [] as string[],
    budget: '$5,000 / month',
    timeline: '6 Months'
  });

  // Client Intelligence Inputs State
  const [intelInputs, setIntelInputs] = useState({
    websiteUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    businessDescription: ''
  });
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Proposal Edit Desk State
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [editingProposalData, setEditingProposalData] = useState<Proposal | null>(null);

  // Add Client Modal State
  const [showAddClientModal, setShowAddClientModal] = useState<boolean>(false);
  const [newClientForm, setNewClientForm] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: 'SaaS',
    revenueRange: '$1M - $5M',
    businessDescription: '',
    instagramUrl: '',
    facebookUrl: '',
    linkedinUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const allClients = await mockDb.getClients();
      setClients(allClients);

      if (selectedClient) {
        const freshClient = allClients.find(c => c.id === selectedClient.id);
        if (freshClient) setSelectedClient(freshClient);

        const allProposals = await mockDb.getProposals();
        setProposals(allProposals.filter(p => p.clientId === selectedClient.id || p.clientName === selectedClient.companyName));

        const allStrategies = await mockDb.getStrategies();
        setStrategies(allStrategies.filter(s => s.clientId === selectedClient.id));
      }
    };
    fetchData();
  }, [selectedClient?.id, refreshTrigger]);

  const handleToggleChecklist = async (clientId: string, itemId: string, currentStatus: boolean) => {
    if (!selectedClient) return;

    const updatedChecklist = selectedClient.onboardingChecklist.map(item => {
      if (item.id === itemId) return { ...item, completed: !currentStatus };
      return item;
    });

    const updatedClient = { ...selectedClient, onboardingChecklist: updatedChecklist };
    await mockDb.updateClient(updatedClient);
    setSelectedClient(updatedClient);
    triggerRefresh();
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsAuditing(true);

    try {
      const url = intelInputs.websiteUrl.trim();
      const igUrl = intelInputs.instagramUrl.trim();
      
      // Fetch SEO Audit
      const seoRes = await fetch(`/api/audit?url=${encodeURIComponent(url)}`);
      const seoData = await seoRes.json();

      // Fetch Instagram analytics
      let socialAudit = selectedClient.socialAudit;
      if (igUrl) {
        const socialRes = await fetch(`/api/social?platform=instagram&url=${encodeURIComponent(igUrl)}`);
        const socialData = await socialRes.json();
        socialAudit = {
          frequency: socialData.frequency,
          engagementRate: socialData.engagementRate,
          growthRate: socialData.growthRate,
          consistency: socialData.consistency,
          details: socialData.details
        };
      }

      const updatedClient: Client = {
        ...selectedClient,
        website: url,
        socialLinks: {
          ...selectedClient.socialLinks,
          instagram: igUrl,
          facebook: intelInputs.facebookUrl.trim(),
          linkedin: intelInputs.linkedinUrl.trim()
        },
        businessDescription: seoData.description || selectedClient.businessDescription,
        websiteAudit: seoData.websiteAudit,
        socialAudit,
        deliverables: {
          swot: seoData.swot,
          growthOpportunities: seoData.success
            ? [
                `Optimize title and description tags based on crawled: "${seoData.title}"`,
                seoData.websiteAudit.seoScore < 80 ? 'Inject missing canonical tags' : 'Audit mobile page asset blocking scripts',
                igUrl ? 'Structure new video creative hooks for Instagram reels' : 'Launch comparative competitor benchmarks'
              ]
            : [
                'Fix Core Web Vitals to increase page load speeds.',
                'Inject keywords on collection subfolders.'
              ],
          recommendedServices: selectedClient.deliverables?.recommendedServices || ['SEO Content Retainer', 'Meta Paid Ads'],
          strategicRoadmap: selectedClient.deliverables?.strategicRoadmap || [
            'Month 1: Setup data tracking and optimize site speed.',
            'Month 2: Launch target campaign ad sets.'
          ]
        }
      };

      await mockDb.updateClient(updatedClient);
      setSelectedClient(updatedClient);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    await mockDb.createProposal({
      clientId: selectedClient.id,
      clientName: selectedClient.companyName,
      goals: proposalForm.goals,
      servicesRequired: proposalForm.servicesRequired,
      budget: proposalForm.budget,
      timeline: proposalForm.timeline
    });

    setShowGenerator(false);
    setProposalForm({
      goals: '',
      servicesRequired: [],
      budget: '$5,000 / month',
      timeline: '6 Months'
    });
    triggerRefresh();
  };

  const handleProposalStatus = async (proposalId: string, status: 'approved' | 'rejected') => {
    await mockDb.updateProposalStatus(proposalId, status);
    triggerRefresh();
  };

  const startEditingProposal = (proposal: Proposal) => {
    setEditingProposalId(proposal.id);
    setEditingProposalData(JSON.parse(JSON.stringify(proposal)));
  };

  const handleSaveProposalEdits = async () => {
    if (!editingProposalData) return;
    await mockDb.updateProposal(editingProposalData);
    setEditingProposalId(null);
    setEditingProposalData(null);
    triggerRefresh();
  };

  const updateProposalSectionContent = (index: number, content: string) => {
    if (!editingProposalData) return;
    const updatedSections = [...editingProposalData.sections];
    updatedSections[index].content = content;
    setEditingProposalData({ ...editingProposalData, sections: updatedSections });
  };

  // Add Client Handler
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.companyName || !newClientForm.name) return;

    const createdClient = await mockDb.createNewClient({
      companyName: newClientForm.companyName,
      name: newClientForm.name,
      email: newClientForm.email,
      phone: newClientForm.phone,
      website: newClientForm.website,
      industry: newClientForm.industry,
      revenueRange: newClientForm.revenueRange,
      businessDescription: newClientForm.businessDescription,
      socialLinks: {
        instagram: newClientForm.instagramUrl,
        facebook: newClientForm.facebookUrl,
        linkedin: newClientForm.linkedinUrl
      }
    });

    setNewClientForm({
      companyName: '',
      name: '',
      email: '',
      phone: '',
      website: '',
      industry: 'SaaS',
      revenueRange: '$1M - $5M',
      businessDescription: '',
      instagramUrl: '',
      facebookUrl: '',
      linkedinUrl: ''
    });
    setShowAddClientModal(false);
    setSelectedClient(createdClient);
    setActiveSubTab('onboarding');
    triggerRefresh();
  };

  // PDF Deck slide downloader
  const handleDownloadDeck = (prop: Proposal) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const slidesHtml = `
      <html>
        <head>
          <title>${prop.clientName} - Pitch Deck Presentation</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #ffffff;
              color: #09090b;
              -webkit-print-color-adjust: exact;
            }
            .slide {
              width: 297mm;
              height: 210mm;
              box-sizing: border-box;
              padding: 25mm;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: center;
              position: relative;
              background: #ffffff;
            }
            .slide-footer {
              position: absolute;
              bottom: 15mm;
              left: 25mm;
              right: 25mm;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #a1a1aa;
              border-top: 1px solid #e4e4e7;
              padding-top: 5mm;
              font-weight: 500;
            }
            h1 {
              font-size: 42px;
              font-weight: 800;
              margin: 0 0 12px 0;
              letter-spacing: -0.04em;
              color: #09090b;
            }
            h2 {
              font-size: 28px;
              font-weight: 800;
              margin: 0 0 20px 0;
              letter-spacing: -0.02em;
              color: #09090b;
              border-left: 3px solid #09090b;
              padding-left: 15px;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
              color: #52525b;
              margin: 0 0 25px 0;
            }
            .tag {
              display: inline-block;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #71717a;
              margin-bottom: 12px;
            }
            @media print {
              body {
                background: none;
              }
              .slide {
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <!-- Slide 1: Cover -->
          <div class="slide">
            <span class="tag">Growth Pitch Deck</span>
            <h1>Campaign Proposal for ${prop.clientName}</h1>
            <p>Target metrics, challenges, and retainer roadmap overview.</p>
            <div class="slide-footer">
              <span>AgencyOS AI Operating System</span>
              <span>Slide 1 of 5</span>
            </div>
          </div>

          <!-- Slide 2: Target Goals -->
          <div class="slide">
            <span class="tag">01 / Goals</span>
            <h2>Client Growth Intent</h2>
            <p>${prop.goals}</p>
            <div class="slide-footer">
              <span>${prop.clientName}</span>
              <span>Slide 2 of 5</span>
            </div>
          </div>

          <!-- Slide 3: Challenges -->
          <div class="slide">
            <span class="tag">02 / Audit Concerns</span>
            <h2>Business Obstacles</h2>
            <p>${prop.sections[1]?.content || 'Reviewing standard analytics parameters...'}</p>
            <div class="slide-footer">
              <span>${prop.clientName}</span>
              <span>Slide 3 of 5</span>
            </div>
          </div>

          <!-- Slide 4: Proposed Solution -->
          <div class="slide">
            <span class="tag">03 / Strategy</span>
            <h2>Proposed Solutions Retainer</h2>
            <p>${prop.sections[2]?.content || 'Deploying technical and content optimizations...'}</p>
            <div class="slide-footer">
              <span>${prop.clientName}</span>
              <span>Slide 4 of 5</span>
            </div>
          </div>

          <!-- Slide 5: Investment scope -->
          <div class="slide">
            <span class="tag">04 / Budget</span>
            <h2>Retainer Investment</h2>
            <p><strong>Monthly Investment:</strong> ${prop.budget}</p>
            <p><strong>Timeline:</strong> ${prop.timeline}</p>
            <p style="font-size: 13px; color: #71717a; margin-top: 15px;">*Agreement will roll into monthly cycle upon target milestones delivery.</p>
            <div class="slide-footer">
              <span>${prop.clientName}</span>
              <span>Slide 5 of 5</span>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(slidesHtml);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Client Workspace</h2>
          <p className="text-xs text-zinc-500">Run actual meta crawler audits, build custom strategies, and manage proposals in a white minimal canvas.</p>
        </div>
        <button
          onClick={() => setShowAddClientModal(true)}
          className="flex items-center gap-1 px-4.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* CLIENTS LIST SIDE PANEL */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Clients Directory</span>
          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => {
                  setSelectedClient(client);
                  setIntelInputs({
                    websiteUrl: client.website || '',
                    instagramUrl: client.socialLinks.instagram || '',
                    facebookUrl: client.socialLinks.facebook || '',
                    linkedinUrl: client.socialLinks.linkedin || '',
                    businessDescription: client.businessDescription || ''
                  });
                  setEditingProposalId(null);
                }}
                className={`p-3.5 rounded-lg cursor-pointer border transition-all text-xs ${
                  selectedClient?.id === client.id
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-900 font-semibold'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600'
                }`}
              >
                <h4 className="truncate">{client.companyName}</h4>
                <p className="text-[10px] text-zinc-400 font-normal truncate">{client.name}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-500 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  <span>
                    Onboarding: {client.onboardingChecklist.filter(c => c.completed).length}/{client.onboardingChecklist.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CLIENT WORKSPACE PANEL */}
        <div className="lg:col-span-3">
          {selectedClient ? (
            <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-6">
              
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-5 gap-4">
                <div>
                  <h3 className="text-md font-bold text-zinc-900">{selectedClient.companyName}</h3>
                  <a href={`https://${selectedClient.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="underline">{selectedClient.website || 'No website entered'}</span>
                  </a>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex bg-zinc-100/80 p-0.5 rounded-lg border border-zinc-200 self-start">
                  {[
                    { id: 'onboarding', label: 'Onboarding' },
                    { id: 'intel', label: 'AI Intelligence' },
                    { id: 'strategies', label: 'Strategies' },
                    { id: 'proposals', label: 'Proposal Desk' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveSubTab(tab.id as any);
                        setEditingProposalId(null);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        activeSubTab === tab.id
                          ? 'bg-white text-zinc-900 border border-zinc-200/80 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB CONTENT: ONBOARDING */}
              {activeSubTab === 'onboarding' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Client Onboarding Checklist</h4>
                    <p className="text-[10px] text-zinc-500">Interactive onboarding tasks automatically generated on won conversion.</p>
                  </div>

                  <div className="space-y-2 max-w-lg">
                    {selectedClient.onboardingChecklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(selectedClient.id, item.id, item.completed)}
                        className={`p-3 bg-white border border-zinc-200 rounded-lg cursor-pointer flex items-center gap-2.5 hover:bg-zinc-50 transition-colors ${
                          item.completed ? 'bg-zinc-50/60 opacity-60' : ''
                        }`}
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-zinc-800" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-300" />
                        )}
                        <span className={`text-xs ${item.completed ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: AI INTEL (AUDIT RUNNER) */}
              {activeSubTab === 'intel' && (
                <div className="space-y-6">
                  
                  {/* Run Audit Form */}
                  <div className="p-5 bg-zinc-50/50 border border-zinc-200 rounded-xl space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                        <Bot className="w-4 h-4" />
                        Live Website & Social Audit Crawler
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Input a live URL and social link. The server will fetch page structures and parse live social parameters.</p>
                    </div>
                    
                    <form onSubmit={handleAuditSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Website URL</label>
                          <input
                            type="text"
                            required
                            value={intelInputs.websiteUrl}
                            onChange={(e) => setIntelInputs({ ...intelInputs, websiteUrl: e.target.value })}
                            placeholder="e.g. apple.com"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Instagram URL</label>
                          <input
                            type="text"
                            value={intelInputs.instagramUrl}
                            onChange={(e) => setIntelInputs({ ...intelInputs, instagramUrl: e.target.value })}
                            placeholder="e.g. instagram.com/brand"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">LinkedIn URL</label>
                          <input
                            type="text"
                            value={intelInputs.linkedinUrl}
                            onChange={(e) => setIntelInputs({ ...intelInputs, linkedinUrl: e.target.value })}
                            placeholder="e.g. linkedin.com/company/brand"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Business Brief Description</label>
                        <textarea
                          value={intelInputs.businessDescription}
                          onChange={(e) => setIntelInputs({ ...intelInputs, businessDescription: e.target.value })}
                          placeholder="Optional focus parameters..."
                          rows={2}
                          className="w-full"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isAuditing}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isAuditing ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Auditing live channels...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Launch Live Audit</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Audit Results display */}
                  {selectedClient.websiteAudit ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Audit Scores */}
                      <div className="md:col-span-1 space-y-4">
                        
                        {/* Website score grid */}
                        <div className="p-5 border border-zinc-200 rounded-xl space-y-4 bg-white">
                          <h5 className="text-xs font-bold text-zinc-800">Crawl Metrics</h5>
                          <div className="space-y-3.5 text-xs">
                            {[
                              { label: 'SEO Audit Score', val: selectedClient.websiteAudit.seoScore },
                              { label: 'Page Speed Index', val: selectedClient.websiteAudit.speedScore },
                              { label: 'Mobile Optimization', val: selectedClient.websiteAudit.mobileScore },
                              { label: 'UX & Accessibility', val: selectedClient.websiteAudit.uxScore },
                              { label: 'Conversion Funnel CRO', val: selectedClient.websiteAudit.conversionScore }
                            ].map(metric => (
                              <div key={metric.label} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-medium">
                                  <span className="text-zinc-500">{metric.label}</span>
                                  <span className="text-zinc-900">{metric.val}%</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-zinc-900"
                                    style={{ width: `${metric.val}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Real-time Social Media metrics block */}
                        {selectedClient.socialAudit && (
                          <div className="p-5 border border-zinc-200 rounded-xl space-y-3.5 bg-white">
                            <h5 className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                              <Globe className="w-4 h-4 text-zinc-500" />
                              Live Social Analytics
                            </h5>
                            
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                                <span className="text-zinc-500">Audited Followers:</span>
                                <strong className="text-zinc-900">{selectedClient.socialAudit.frequency}</strong>
                              </div>
                              <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                                <span className="text-zinc-500">Engagement Rate:</span>
                                <strong className="text-zinc-900">{selectedClient.socialAudit.engagementRate}%</strong>
                              </div>
                              <div className="flex justify-between border-b border-zinc-100 pb-1.5">
                                <span className="text-zinc-500">Growth Velocity:</span>
                                <strong className="text-zinc-900">+{selectedClient.socialAudit.growthRate}%</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Posting Frequency:</span>
                                <strong className="text-zinc-900">{selectedClient.socialAudit.consistency}</strong>
                              </div>
                            </div>

                            <p className="text-[10px] text-zinc-500 bg-zinc-50 p-2.5 rounded border border-zinc-150 leading-relaxed mt-2.5">
                              {selectedClient.socialAudit.details}
                            </p>
                          </div>
                        )}

                      </div>

                      {/* AI SWOT & Opportunities */}
                      <div className="md:col-span-2 space-y-5">
                        
                        {/* SWOT Grid */}
                        {selectedClient.deliverables && (
                          <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-3 text-[10px]">
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                                <span className="font-bold text-zinc-800 block mb-1">Strengths</span>
                                <ul className="list-disc pl-3 text-zinc-500 space-y-1">
                                  {selectedClient.deliverables.swot.strengths.map(s => <li key={s}>{s}</li>)}
                                </ul>
                              </div>
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                                <span className="font-bold text-zinc-800 block mb-1">Weaknesses</span>
                                <ul className="list-disc pl-3 text-zinc-500 space-y-1">
                                  {selectedClient.deliverables.swot.weaknesses.map(w => <li key={w}>{w}</li>)}
                                </ul>
                              </div>
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                                <span className="font-bold text-zinc-800 block mb-1">Opportunities</span>
                                <ul className="list-disc pl-3 text-zinc-500 space-y-1">
                                  {selectedClient.deliverables.swot.opportunities.map(o => <li key={o}>{o}</li>)}
                                </ul>
                              </div>
                              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                                <span className="font-bold text-zinc-800 block mb-1">Threats</span>
                                <ul className="list-disc pl-3 text-zinc-500 space-y-1">
                                  {selectedClient.deliverables.swot.threats.map(t => <li key={t}>{t}</li>)}
                                </ul>
                              </div>
                            </div>

                            {/* Growth Opportunities */}
                            <div className="p-4 border border-zinc-200 rounded-xl space-y-2.5 bg-white">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">AI crawler insights</span>
                              <div className="text-xs space-y-1.5">
                                {selectedClient.deliverables.growthOpportunities.map(opp => (
                                  <p key={opp} className="text-zinc-600 flex items-start gap-1.5 leading-normal">
                                    <Lightbulb className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                                    <span>{opp}</span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-12 text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                      Enter site URL details above to crawl and generate dynamic audit dashboards.
                    </div>
                  )}

                </div>
              )}

              {/* TAB CONTENT: STRATEGIES */}
              {activeSubTab === 'strategies' && (
                <div className="space-y-6">
                  {strategies.length === 0 ? (
                    <div className="text-center py-12 text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                      <Sparkles className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                      No strategy records created. Use the AI chat assistant to initialize a campaign plan.
                    </div>
                  ) : (
                    strategies.map(strat => (
                      <div key={strat.id} className="p-6 border border-zinc-200 rounded-xl space-y-4 bg-white">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-800">{strat.title}</h4>
                            <span className="text-[9px] bg-zinc-100 text-zinc-600 font-bold px-2 py-0.5 rounded border uppercase tracking-wider">
                              {strat.type} Campaign Strategy
                            </span>
                          </div>
                          <button className="text-[10px] text-zinc-500 hover:text-zinc-800 flex items-center gap-1 font-semibold">
                            <Share2 className="w-3.5 h-3.5 text-zinc-400" /> Share Link
                          </button>
                        </div>
                        <p className="text-xs text-zinc-650 leading-normal">{strat.content.overview}</p>

                        {/* Keyword list */}
                        {strat.content.details.keywordOpportunities && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Target Keywords</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                              {strat.content.details.keywordOpportunities.map((kw: any) => (
                                <div key={kw.keyword} className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-1">
                                  <p className="font-bold text-zinc-750 truncate">{kw.keyword}</p>
                                  <div className="flex justify-between text-[10px] text-zinc-500">
                                    <span>Vol: {kw.volume}</span>
                                    <span className="text-zinc-600 font-medium">Difficulty: {kw.difficulty}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Roadmap */}
                        {strat.content.details.contentRoadmap && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Campaign Content Schedule</span>
                            <div className="space-y-1.5 text-xs text-zinc-650">
                              {strat.content.details.contentRoadmap.map((roadmapItem: string) => (
                                <p key={roadmapItem} className="p-2.5 bg-zinc-50/30 border border-zinc-200 rounded-lg">
                                  {roadmapItem}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB CONTENT: PROPOSALS (REAL PROPOSAL DESK) */}
              {activeSubTab === 'proposals' && (
                <div className="space-y-6">
                  
                  {/* Actions Header */}
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Proposal Workspace</h4>
                    {!showGenerator && !editingProposalId && (
                      <button 
                        onClick={() => setShowGenerator(true)}
                        className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-md text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Generate Proposal
                      </button>
                    )}
                  </div>

                  {/* Proposal generation form */}
                  {showGenerator && (
                    <div className="p-5 bg-zinc-50/50 border border-zinc-200 rounded-xl space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                        <span className="text-xs font-bold text-zinc-800">Proposal Parameter Setup</span>
                        <button 
                          onClick={() => setShowGenerator(false)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <form onSubmit={handleGenerateProposal} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Campaign Target Goals</label>
                          <input
                            type="text"
                            required
                            value={proposalForm.goals}
                            onChange={(e) => setProposalForm({ ...proposalForm, goals: e.target.value })}
                            placeholder="e.g. Scale organic transactions by 35%..."
                            className="w-full text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Monthly Budget Scope</label>
                            <input
                              type="text"
                              value={proposalForm.budget}
                              onChange={(e) => setProposalForm({ ...proposalForm, budget: e.target.value })}
                              placeholder="e.g. $6,000 / month"
                              className="w-full text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Campaign Timeline</label>
                            <input
                              type="text"
                              value={proposalForm.timeline}
                              onChange={(e) => setProposalForm({ ...proposalForm, timeline: e.target.value })}
                              placeholder="e.g. 6 Months"
                              className="w-full text-xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Select Retainer Services</label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {['SEO Campaign Retainer', 'Google Search Ads Management', 'Meta Retargeting Campaign', 'Shopify CRO Pack'].map(srv => {
                              const isChecked = proposalForm.servicesRequired.includes(srv);
                              return (
                                <button
                                  key={srv}
                                  type="button"
                                  onClick={() => {
                                    if (isChecked) {
                                      setProposalForm({ ...proposalForm, servicesRequired: proposalForm.servicesRequired.filter(s => s !== srv) });
                                    } else {
                                      setProposalForm({ ...proposalForm, servicesRequired: [...proposalForm.servicesRequired, srv] });
                                    }
                                  }}
                                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between ${
                                    isChecked ? 'bg-zinc-100 border-zinc-400 text-zinc-950 font-semibold' : 'bg-white border-zinc-200 text-zinc-500'
                                  }`}
                                >
                                  <span>{srv}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Generate Draft Proposal</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* PROPOSALS DIRECTORY DISPLAY */}
                  <div className="space-y-6">
                    
                    {/* Render active editing Desk */}
                    {editingProposalId && editingProposalData ? (
                      <div className="p-6 border border-zinc-300 rounded-xl space-y-6 bg-white shadow-xs">
                        
                        {/* Editor Header */}
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                          <div>
                            <span className="text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              PROPOSAL DESK EDITOR
                            </span>
                            <h4 className="text-xs font-bold text-zinc-900 mt-1">Modify Contract Parameters</h4>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProposalId(null);
                                setEditingProposalData(null);
                              }}
                              className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs text-zinc-600 font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveProposalEdits}
                              className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 rounded-lg text-xs text-white font-semibold flex items-center gap-1"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Changes</span>
                            </button>
                          </div>
                        </div>

                        {/* Editable Form Stats */}
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Goals Context</label>
                            <input 
                              type="text" 
                              value={editingProposalData.goals}
                              onChange={(e) => setEditingProposalData({ ...editingProposalData, goals: e.target.value })}
                              className="w-full text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Budget Retainer</label>
                            <input 
                              type="text" 
                              value={editingProposalData.budget}
                              onChange={(e) => setEditingProposalData({ ...editingProposalData, budget: e.target.value })}
                              className="w-full text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Timeline</label>
                            <input 
                              type="text" 
                              value={editingProposalData.timeline}
                              onChange={(e) => setEditingProposalData({ ...editingProposalData, timeline: e.target.value })}
                              className="w-full text-xs"
                            />
                          </div>
                        </div>

                        {/* Editable Document Sections */}
                        <div className="space-y-4">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Contract Copy Editor</span>
                          
                          <div className="space-y-4">
                            {editingProposalData.sections.map((section, idx) => (
                              <div key={section.title} className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{section.title}</label>
                                <textarea
                                  value={section.content}
                                  onChange={(e) => updateProposalSectionContent(idx, e.target.value)}
                                  rows={4}
                                  className="w-full text-xs font-sans leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      // Display Standard proposals list
                      proposals.map(prop => (
                        <div key={prop.id} className="p-6 border border-zinc-200 rounded-xl space-y-6 bg-white shadow-2xs">
                          
                          {/* Proposal Header */}
                          <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                            <div>
                              <span className="text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                ID: {prop.id}
                              </span>
                              <p className="text-[10px] text-zinc-500 mt-1">Timeline: {prop.timeline} | Retainer: {prop.budget}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                prop.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                prop.status === 'sent' ? 'bg-zinc-100 text-zinc-600 border-zinc-300' :
                                'bg-zinc-50 text-zinc-400 border-zinc-200'
                              }`}>
                                Status: {prop.status}
                              </span>
                            </div>
                          </div>

                          {/* Pricing Recommendations */}
                          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs leading-relaxed">
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Pricing optimization</span>
                              <p className="text-zinc-650">{prop.pricingRecommendations}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Upsell Pitch</span>
                              <p className="text-zinc-650">{prop.upsellRecommendations}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Profitability</span>
                              <p className="text-zinc-650">{prop.profitabilityEstimation}</p>
                            </div>
                          </div>

                          {/* Preview Sections */}
                          <div className="space-y-4">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Contract Sections</span>
                            <div className="space-y-3">
                              {prop.sections.map(sec => (
                                <div key={sec.title} className="p-4 bg-zinc-50/20 border border-zinc-200 rounded-xl space-y-1">
                                  <h5 className="text-xs font-bold text-zinc-800">{sec.title}</h5>
                                  <p className="text-[11px] text-zinc-600 whitespace-pre-line leading-relaxed">{sec.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 flex-wrap gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-lg text-zinc-600 flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5 text-zinc-400" /> Download PDF Contract
                              </button>
                              <button 
                                onClick={() => handleDownloadDeck(prop)}
                                className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-lg text-zinc-600 flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5 text-zinc-450" /> Download Pitch Deck (PDF)
                              </button>
                              <button 
                                onClick={() => startEditingProposal(prop)}
                                className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-lg text-zinc-600 flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-zinc-400" /> Edit in Desk
                              </button>
                            </div>

                            {prop.status === 'sent' && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleProposalStatus(prop.id, 'approved')}
                                  className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold"
                                >
                                  Approve & Launch Campaign
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="h-[400px] bg-white border border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <Users className="w-12 h-12 text-zinc-300 mb-3" />
              <h3 className="font-bold text-sm text-zinc-600">No client selected</h3>
              <p className="text-xs max-w-xs mx-auto mt-1">Select an active client from the side panel to view onboarding metrics, AI audit logs, generated proposals, and roadmaps.</p>
            </div>
          )}
        </div>

      </div>

      {/* ADD CLIENT MODAL FORM */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAddClientModal(false)}
            className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-lg bg-white border border-zinc-250 rounded-xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Add Client Account</h3>
              <button 
                onClick={() => setShowAddClientModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newClientForm.companyName}
                    onChange={(e) => setNewClientForm({ ...newClientForm, companyName: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={newClientForm.name}
                    onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    placeholder="e.g. john@acme.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 000-0000"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Website URL</label>
                  <input
                    type="text"
                    value={newClientForm.website}
                    onChange={(e) => setNewClientForm({ ...newClientForm, website: e.target.value })}
                    placeholder="e.g. acme.com"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Industry</label>
                  <select
                    value={newClientForm.industry}
                    onChange={(e) => setNewClientForm({ ...newClientForm, industry: e.target.value })}
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
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Revenue Range</label>
                  <select
                    value={newClientForm.revenueRange}
                    onChange={(e) => setNewClientForm({ ...newClientForm, revenueRange: e.target.value })}
                    className="w-full"
                  >
                    <option value="$100k - $500k">$100k - $500k</option>
                    <option value="$500k - $1M">$500k - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M - $10M">$5M - $10M</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Instagram Handle</label>
                  <input
                    type="text"
                    value={newClientForm.instagramUrl}
                    onChange={(e) => setNewClientForm({ ...newClientForm, instagramUrl: e.target.value })}
                    placeholder="e.g. acme_ig"
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Facebook Handle</label>
                  <input
                    type="text"
                    value={newClientForm.facebookUrl}
                    onChange={(e) => setNewClientForm({ ...newClientForm, facebookUrl: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">LinkedIn Handle</label>
                  <input
                    type="text"
                    value={newClientForm.linkedinUrl}
                    onChange={(e) => setNewClientForm({ ...newClientForm, linkedinUrl: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Business Brief Description</label>
                <textarea
                  value={newClientForm.businessDescription}
                  onChange={(e) => setNewClientForm({ ...newClientForm, businessDescription: e.target.value })}
                  placeholder="Describe client goals, context details..."
                  rows={2.5}
                  className="w-full"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Create Account Workspace
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
