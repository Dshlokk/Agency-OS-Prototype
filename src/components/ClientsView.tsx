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
import { Client, Proposal, Strategy, Invoice, InvoiceItem } from '../lib/types/db';

interface ClientsViewProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function ClientsView({ refreshTrigger, triggerRefresh }: ClientsViewProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'onboarding' | 'intel' | 'strategies' | 'proposals' | 'invoices'>('onboarding');
  
  // Invoices & Proposals & Strategies for selected client
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
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

  // Invoice Creator State
  const [showInvoiceCreator, setShowInvoiceCreator] = useState<boolean>(false);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 10,
    notes: 'Thank you for your business! Payment is due within 30 days.',
    items: [] as Omit<InvoiceItem, 'id'>[]
  });
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    rate: 0
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

        const allInvoices = await mockDb.getInvoices();
        setInvoices(allInvoices.filter(i => i.clientId === selectedClient.id));
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

  // PPTX Presentation Deck downloader
  const handleDownloadDeckPPTX = async (prop: Proposal) => {
    try {
      const pptxgen = (await import('pptxgenjs')).default;
      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.layout = 'LAYOUT_16x9';

      // Slide 1: Cover (Premium Dark Mode)
      const slide1 = pptx.addSlide();
      slide1.background = { fill: '09090B' };
      // Accent sidebar bar on left
      slide1.addShape('rect', { x: 0, y: 0, w: 0.3, h: '100%', fill: { color: '6366F1' } });
      // Title content
      slide1.addText('GROWTH PITCH DECK', {
        x: 1.2, y: 2.0, w: 8.0, h: 0.4,
        fontSize: 13, bold: true, color: '6366F1', fontFace: 'Trebuchet MS'
      });
      slide1.addText(`Campaign Proposal for\n${prop.clientName}`, {
        x: 1.2, y: 2.5, w: 11.0, h: 2.0,
        fontSize: 40, bold: true, color: 'FFFFFF', fontFace: 'Trebuchet MS', lineSpacing: 10
      });
      slide1.addText('Target metrics, challenges, and retainer roadmap overview', {
        x: 1.2, y: 4.8, w: 10.0, h: 0.6,
        fontSize: 15, color: 'A1A1AA', fontFace: 'Trebuchet MS'
      });
      slide1.addText('AgencyOS AI Operating System | Slide 1 of 5', {
        x: 1.2, y: 6.2, w: 11.0, h: 0.4,
        fontSize: 10, color: '71717A', fontFace: 'Trebuchet MS'
      });

      // Slide 2: Goals (Light Mode Card Layout)
      const slide2 = pptx.addSlide();
      slide2.background = { fill: 'FAFAFA' };
      // Vertical accent bar next to title
      slide2.addShape('rect', { x: 0.9, y: 0.7, w: 0.05, h: 0.4, fill: { color: '6366F1' } });
      slide2.addText('01 / CORE GOALS', { x: 1.1, y: 0.7, w: 11.0, h: 0.4, fontSize: 11, bold: true, color: '71717A', fontFace: 'Trebuchet MS' });
      slide2.addText('Client Growth Intent', { x: 1.1, y: 1.1, w: 11.0, h: 0.7, fontSize: 26, bold: true, color: '09090B', fontFace: 'Trebuchet MS' });
      
      // Card Container background
      slide2.addShape('roundRect', { x: 0.9, y: 2.0, w: 11.5, h: 3.7, fill: { color: 'FFFFFF' }, line: { color: 'E4E4E7', width: 1 } });
      slide2.addText(prop.goals, { x: 1.3, y: 2.4, w: 10.7, h: 2.9, fontSize: 15, color: '27272A', fontFace: 'Trebuchet MS', lineSpacing: 22 });
      slide2.addText(`${prop.clientName} | Slide 2 of 5`, { x: 0.9, y: 6.2, w: 11.0, h: 0.4, fontSize: 10, color: 'A1A1AA', fontFace: 'Trebuchet MS' });

      // Slide 3: Challenges (Two-Column Side-by-Side Cards)
      const slide3 = pptx.addSlide();
      slide3.background = { fill: 'FAFAFA' };
      slide3.addShape('rect', { x: 0.9, y: 0.7, w: 0.05, h: 0.4, fill: { color: 'EF4444' } }); // Red accent for risk
      slide3.addText('02 / AUDIT CONCERNS', { x: 1.1, y: 0.7, w: 11.0, h: 0.4, fontSize: 11, bold: true, color: '71717A', fontFace: 'Trebuchet MS' });
      slide3.addText('Core Business Obstacles', { x: 1.1, y: 1.1, w: 11.0, h: 0.7, fontSize: 26, bold: true, color: '09090B', fontFace: 'Trebuchet MS' });
      
      // Left Card (Audit concerns)
      slide3.addShape('roundRect', { x: 0.9, y: 2.0, w: 5.5, h: 3.7, fill: { color: 'FFFFFF' }, line: { color: 'EF4444', width: 1 } });
      slide3.addText('AUDIT GAP ANALYSIS', { x: 1.2, y: 2.3, w: 4.9, h: 0.4, fontSize: 11, bold: true, color: 'EF4444', fontFace: 'Trebuchet MS' });
      slide3.addText(prop.sections[1]?.content || 'Reviewing standard analytics parameters...', { x: 1.2, y: 2.8, w: 4.9, h: 2.6, fontSize: 13, color: '52525B', fontFace: 'Trebuchet MS', lineSpacing: 20 });

      // Right Card (Identified barriers)
      slide3.addShape('roundRect', { x: 6.9, y: 2.0, w: 5.5, h: 3.7, fill: { color: 'FFFFFF' }, line: { color: 'E4E4E7', width: 1 } });
      slide3.addText('IDENTIFIED GROWTH BARRIERS', { x: 7.2, y: 2.3, w: 4.9, h: 0.4, fontSize: 11, bold: true, color: '71717A', fontFace: 'Trebuchet MS' });
      slide3.addText(`Our system diagnostics confirm that optimization is critical for ${prop.clientName} to address competitor gaps and expand conversion rates.`, { x: 7.2, y: 2.8, w: 4.9, h: 2.6, fontSize: 13, color: '52525B', fontFace: 'Trebuchet MS', lineSpacing: 20 });
      slide3.addText(`${prop.clientName} | Slide 3 of 5`, { x: 0.9, y: 6.2, w: 11.0, h: 0.4, fontSize: 10, color: 'A1A1AA', fontFace: 'Trebuchet MS' });

      // Slide 4: Strategy (Two-Column Side-by-Side Cards)
      const slide4 = pptx.addSlide();
      slide4.background = { fill: 'FAFAFA' };
      slide4.addShape('rect', { x: 0.9, y: 0.7, w: 0.05, h: 0.4, fill: { color: '10B981' } }); // Green accent for growth
      slide4.addText('03 / STRATEGY RETAINER', { x: 1.1, y: 0.7, w: 11.0, h: 0.4, fontSize: 11, bold: true, color: '71717A', fontFace: 'Trebuchet MS' });
      slide4.addText('Proposed Solutions Retainer', { x: 1.1, y: 1.1, w: 11.0, h: 0.7, fontSize: 26, bold: true, color: '09090B', fontFace: 'Trebuchet MS' });
      
      // Left Card (Retainer services list)
      slide4.addShape('roundRect', { x: 0.9, y: 2.0, w: 5.5, h: 3.7, fill: { color: 'FFFFFF' }, line: { color: '10B981', width: 1 } });
      slide4.addText('CAMPAIGN SCOPE INCLUSIONS', { x: 1.2, y: 2.3, w: 4.9, h: 0.4, fontSize: 11, bold: true, color: '10B981', fontFace: 'Trebuchet MS' });
      const strategyItems = prop.servicesRequired.map(s => `• ${s}`).join('\n') || '• Strategic Growth Management\n• Platform Analytics Integration';
      slide4.addText(strategyItems, { x: 1.2, y: 2.8, w: 4.9, h: 2.6, fontSize: 14, color: '27272A', fontFace: 'Trebuchet MS', lineSpacing: 22 });

      // Right Card (Plan summary details)
      slide4.addShape('roundRect', { x: 6.9, y: 2.0, w: 5.5, h: 3.7, fill: { color: 'FFFFFF' }, line: { color: 'E4E4E7', width: 1 } });
      slide4.addText('TACTICAL PLAN SUMMARY', { x: 7.2, y: 2.3, w: 4.9, h: 0.4, fontSize: 11, bold: true, color: '71717A', fontFace: 'Trebuchet MS' });
      slide4.addText(prop.sections[2]?.content || 'Deploying technical and content optimizations...', { x: 7.2, y: 2.8, w: 4.9, h: 2.6, fontSize: 13, color: '52525B', fontFace: 'Trebuchet MS', lineSpacing: 20 });
      slide4.addText(`${prop.clientName} | Slide 4 of 5`, { x: 0.9, y: 6.2, w: 11.0, h: 0.4, fontSize: 10, color: 'A1A1AA', fontFace: 'Trebuchet MS' });

      // Slide 5: Investment (High Contrast Price Card on Left)
      const slide5 = pptx.addSlide();
      slide5.background = { fill: 'FAFAFA' };
      slide5.addShape('rect', { x: 0.9, y: 0.7, w: 0.05, h: 0.4, fill: { color: '6366F1' } });
      slide5.addText('04 / RETAINER INVESTMENT', { x: 1.1, y: 0.7, w: 11.0, h: 0.4, fontSize: 11, bold: true, color: '71717A', fontFace: 'Trebuchet MS' });
      slide5.addText('Committed Retainer Scope', { x: 1.1, y: 1.1, w: 11.0, h: 0.7, fontSize: 26, bold: true, color: '09090B', fontFace: 'Trebuchet MS' });
      
      // Left Panel (Dark visual price card)
      slide5.addShape('roundRect', { x: 0.9, y: 2.0, w: 5.5, h: 3.7, fill: { color: '09090B' } });
      slide5.addText('ESTIMATED BUDGET RETAINER', { x: 1.2, y: 2.3, w: 4.9, h: 0.4, fontSize: 11, bold: true, color: 'A1A1AA', fontFace: 'Trebuchet MS' });
      slide5.addText(prop.budget, { x: 1.2, y: 2.7, w: 4.9, h: 1.0, fontSize: 32, bold: true, color: '6366F1', fontFace: 'Trebuchet MS' });
      slide5.addText(`Committed Timeline: ${prop.timeline}`, { x: 1.2, y: 3.7, w: 4.9, h: 0.5, fontSize: 14, color: 'FFFFFF', fontFace: 'Trebuchet MS' });
      slide5.addText('*Invoiced monthly. All prices in USD.', { x: 1.2, y: 4.7, w: 4.9, h: 0.4, fontSize: 10, color: '71717A', fontFace: 'Trebuchet MS' });

      // Right Panel (Written terms details)
      slide5.addShape('roundRect', { x: 6.9, y: 2.0, w: 5.5, h: 3.7, fill: { color: 'FFFFFF' }, line: { color: 'E4E4E7', width: 1 } });
      slide5.addText('COMMITTED DELIVERABLES', { x: 7.2, y: 2.3, w: 4.9, h: 0.4, fontSize: 11, bold: true, color: '71717A', fontFace: 'Trebuchet MS' });
      slide5.addText(prop.sections[3]?.content || 'Details regarding payment schedules...', { x: 7.2, y: 2.8, w: 4.9, h: 2.6, fontSize: 13, color: '52525B', fontFace: 'Trebuchet MS', lineSpacing: 20 });
      slide5.addText(`${prop.clientName} | Slide 5 of 5`, { x: 0.9, y: 6.2, w: 11.0, h: 0.4, fontSize: 10, color: 'A1A1AA', fontFace: 'Trebuchet MS' });

      const safeName = prop.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      await pptx.writeFile({ fileName: `${safeName}_pitch_deck.pptx` });
    } catch (err) {
      console.error('Failed to generate PowerPoint deck:', err);
      alert('Failed to generate PowerPoint presentation. Please check console.');
    }
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
              background-color: #f4f4f5;
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
              justify-content: flex-start;
              position: relative;
              background: #ffffff;
              overflow: hidden;
            }
            .slide-dark {
              background: #09090b;
              color: #ffffff;
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
            .slide-dark .slide-footer {
              border-top-color: #27272a;
              color: #71717a;
            }
            h1 {
              font-size: 44px;
              font-weight: 800;
              margin: 0 0 16px 0;
              letter-spacing: -0.04em;
              line-height: 1.1;
            }
            .slide-dark h1 {
              color: #ffffff;
            }
            h2 {
              font-size: 26px;
              font-weight: 800;
              margin: 0 0 20px 0;
              letter-spacing: -0.02em;
              color: #09090b;
            }
            .tag {
              display: inline-block;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              color: #6366f1;
              margin-bottom: 16px;
            }
            .slide-dark .tag {
              color: #818cf8;
            }
            .card-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 25px;
              margin-top: 10px;
            }
            .card {
              background: #ffffff;
              border: 1px solid #e4e4e7;
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
              position: relative;
            }
            .card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: #6366f1;
              border-radius: 12px 12px 0 0;
            }
            .card-red::before {
              background: #ef4444;
            }
            .card-green::before {
              background: #10b981;
            }
            .card h3 {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin: 0 0 12px 0;
              color: #71717a;
            }
            .card-red h3 {
              color: #ef4444;
            }
            .card-green h3 {
              color: #10b981;
            }
            .card p {
              font-size: 13.5px;
              line-height: 1.6;
              color: #52525b;
              margin: 0;
            }
            .pricing-panel {
              background: #09090b;
              border-radius: 12px;
              padding: 30px;
              color: #ffffff;
              height: 100%;
              box-sizing: border-box;
              position: relative;
              border: 1px solid #27272a;
            }
            .pricing-title {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #a1a1aa;
              margin-bottom: 12px;
            }
            .pricing-value {
              font-size: 36px;
              font-weight: 800;
              color: #6366f1;
              margin-bottom: 10px;
            }
            .pricing-timeline {
              font-size: 14px;
              color: #ffffff;
              font-weight: 600;
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
          <div class="slide slide-dark">
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: #6366f1;"></div>
            <span class="tag">Growth Pitch Deck</span>
            <h1 style="margin-top: 40px; font-size: 52px;">Strategic Campaign Retainer Proposal</h1>
            <p style="color: #a1a1aa; font-size: 18px; margin-bottom: 40px;">Prepared for the team at <strong>${prop.clientName}</strong></p>
            <div class="slide-footer">
              <span>AgencyOS AI Operating System</span>
              <span>Slide 1 of 5</span>
            </div>
          </div>

          <!-- Slide 2: Target Goals -->
          <div class="slide">
            <span class="tag">01 / Goals</span>
            <h2>Client Growth Intent</h2>
            <div class="card" style="margin-top: 10px; padding: 35px; min-height: 250px;">
              <h3>Campaign Target Parameters</h3>
              <p style="font-size: 16px; line-height: 1.7; color: #27272a;">${prop.goals}</p>
            </div>
            <div class="slide-footer">
              <span>${prop.clientName}</span>
              <span>Slide 2 of 5</span>
            </div>
          </div>

          <!-- Slide 3: Challenges -->
          <div class="slide">
            <span class="tag">02 / System Audit Concerns</span>
            <h2>Core Business Obstacles</h2>
            <div class="card-grid">
              <div class="card card-red" style="min-height: 250px;">
                <h3>Audit Gap Analysis</h3>
                <p>${prop.sections[1]?.content || 'Reviewing standard analytics parameters...'}</p>
              </div>
              <div class="card" style="min-height: 250px;">
                <h3>Identified Growth Barriers</h3>
                <p>Based on our platform audit metrics, we've identified major latency, content quality, or organic keyword gaps. Optimizing these areas will drive primary conversions for ${prop.clientName}.</p>
              </div>
            </div>
            <div class="slide-footer">
              <span>${prop.clientName}</span>
              <span>Slide 3 of 5</span>
            </div>
          </div>

          <!-- Slide 4: Proposed Solution -->
          <div class="slide">
            <span class="tag">03 / Strategy Retainer</span>
            <h2>Strategic Marketing Scope</h2>
            <div class="card-grid">
              <div class="card card-green" style="min-height: 250px;">
                <h3>Campaign Retainer Inclusions</h3>
                <p style="white-space: pre-line; line-height: 1.8; font-weight: 500;">
                  ${prop.servicesRequired.map(s => `• ${s}`).join('\n') || '• Strategic Growth Management\n• Platform Analytics Integration'}
                </p>
              </div>
              <div class="card" style="min-height: 250px;">
                <h3>Proposed Execution Path</h3>
                <p>${prop.sections[2]?.content || 'Deploying technical and content optimizations...'}</p>
              </div>
            </div>
            <div class="slide-footer">
              <span>${prop.clientName}</span>
              <span>Slide 4 of 5</span>
            </div>
          </div>

          <!-- Slide 5: Investment scope -->
          <div class="slide">
            <span class="tag">04 / Budget Investment</span>
            <h2>Proposed Engagement Terms</h2>
            <div class="card-grid">
              <div class="pricing-panel">
                <div class="pricing-title">Estimated Monthly Budget Retainer</div>
                <div class="pricing-value">${prop.budget}</div>
                <div class="pricing-timeline">Committed Timeline: ${prop.timeline}</div>
                <p style="color: #71717a; font-size: 11px; margin-top: 25px; line-height: 1.4;">*Agreement will automatically roll over into standard monthly terms upon successful milestone deliveries.</p>
              </div>
              <div class="card" style="min-height: 250px;">
                <h3>Deliverables & Payment Schedules</h3>
                <p>${prop.sections[3]?.content || 'Details regarding payment schedules...'}</p>
              </div>
            </div>
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

  // PDF Contract builder using custom settings and template details
  const handleDownloadContract = (prop: Proposal) => {
    if (!selectedClient) return;

    // Load owner profile settings from localStorage
    let ownerSettings = {
      companyName: 'AgencyOS AI',
      ownerName: 'Emma Stone',
      designation: 'Founder & CEO',
      address: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
      email: 'emma@agencyos.ai',
      phone: '+1 (555) 839-2019',
      country: 'United States',
      stateProvince: 'California',
      includedRevisions: '3',
      extraRevisionFee: '$50',
      paymentTermsDays: '15'
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agencyos_owner_profile');
      if (saved) {
        try {
          ownerSettings = { ...ownerSettings, ...JSON.parse(saved) };
        } catch (e) {
          console.error('Failed to parse owner profile:', e);
        }
      }
    }

    const clientDetails = {
      companyName: selectedClient.companyName || prop.clientName || 'Client Company',
      name: selectedClient.name || 'Representative Name',
      address: selectedClient.website ? `Website: ${selectedClient.website}` : 'Client Address',
      email: selectedClient.email || 'client@email.com',
      phone: selectedClient.phone || 'Client Phone'
    };

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const services = prop.servicesRequired || [];
    const isSocialMedia = services.some(s => /social|instagram|facebook|twitter/i.test(s));
    const isContentCreation = services.some(s => /content|copy|writing/i.test(s));
    const isGraphicDesign = services.some(s => /design|graphic|branding/i.test(s));
    const isPaidAds = services.some(s => /ads|advertising|campaign/i.test(s));
    const isSEO = services.some(s => /seo|search/i.test(s));
    const isWebDev = services.some(s => /website|development|coding/i.test(s));

    const contractHtml = `
      <html>
        <head>
          <title>Digital Marketing Services Agreement - ${clientDetails.companyName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 20mm;
            }
            body {
              font-family: "Georgia", serif;
              font-size: 13px;
              line-height: 1.6;
              color: #1c1917;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }
            .header-container {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px double #1c1917;
              padding-bottom: 20px;
            }
            h1 {
              font-family: "Georgia", serif;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 25px;
              margin-bottom: 10px;
              border-bottom: 1px solid #1c1917;
              padding-bottom: 4px;
              page-break-after: avoid;
            }
            h2 {
              font-family: "Georgia", serif;
              font-size: 13px;
              font-weight: bold;
              margin-top: 15px;
              margin-bottom: 8px;
            }
            p {
              margin-top: 0;
              margin-bottom: 12px;
              text-align: justify;
            }
            ul, ol {
              margin-top: 0;
              margin-bottom: 12px;
              padding-left: 20px;
            }
            li {
              margin-bottom: 4px;
            }
            .checkbox-group {
              margin: 15px 0;
            }
            .checkbox-item {
              font-family: "Courier New", Courier, monospace;
              font-size: 12px;
              margin-bottom: 4px;
            }
            .checkbox-item span {
              font-family: "Georgia", serif;
              font-size: 13px;
            }
            .parties-table {
              width: 100%;
              border-collapse: collapse;
              margin: 25px 0;
            }
            .parties-table td {
              width: 50%;
              vertical-align: top;
              padding: 15px;
              border: 1px solid #d6d3d1;
              line-height: 1.5;
            }
            .deliverables-box {
              background-color: #fafaf9;
              border-left: 3px solid #78716c;
              padding: 12px 16px;
              margin: 12px 0;
              font-style: italic;
              font-size: 12.5px;
            }
            .signatures-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 50px;
              page-break-inside: avoid;
            }
            .signatures-table td {
              width: 45%;
              vertical-align: top;
              border-top: 1px solid #1c1917;
              padding-top: 15px;
            }
            .signatures-table td.spacer {
              width: 10%;
              border-top: none;
            }
            .signature-line {
              margin-top: 40px;
              border-bottom: 1px solid #78716c;
              height: 1px;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px; line-height: 1.2;">Digital Marketing Services Agreement</h2>
            <p style="font-size: 11px; color: #57534e; margin: 5px 0 0 0; font-style: italic; text-align: center;">This agreement is legally binding and governs professional services delivery.</p>
          </div>

          <p>This Digital Marketing Services Agreement ("Agreement") is entered into on <strong>${formattedDate}</strong> by and between the following Parties:</p>

          <table class="parties-table">
            <tr>
              <td>
                <strong style="text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #57534e; display: block; margin-bottom: 8px;">Service Provider</strong>
                Company Name: <strong>${ownerSettings.companyName}</strong><br/>
                Representative: <strong>${ownerSettings.ownerName}</strong><br/>
                Title: <strong>${ownerSettings.designation}</strong><br/>
                Address: ${ownerSettings.address}<br/>
                Email: ${ownerSettings.email}<br/>
                Phone: ${ownerSettings.phone}
              </td>
              <td>
                <strong style="text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #57534e; display: block; margin-bottom: 8px;">Client</strong>
                Company Name: <strong>${clientDetails.companyName}</strong><br/>
                Representative: <strong>${clientDetails.name}</strong><br/>
                Title: <strong>Representative</strong><br/>
                Address: ${clientDetails.address}<br/>
                Email: ${clientDetails.email}<br/>
                Phone: ${clientDetails.phone}
              </td>
            </tr>
          </table>

          <p>The Client wishes to engage the Service Provider to provide digital marketing and related services, and the Service Provider agrees to perform such services under the terms outlined in this Agreement.</p>

          <h1>2. Scope of Services</h1>
          <p>The Service Provider shall provide the following services as agreed between the Parties:</p>
          
          <table style="width: 100%; border: none; margin-bottom: 15px;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding: 2px 0; border: none;">
                <div class="checkbox-item">[ ${isSocialMedia ? 'X' : ' '} ] <span>Social Media Management</span></div>
                <div class="checkbox-item">[ ${isContentCreation ? 'X' : ' '} ] <span>Content Creation</span></div>
                <div class="checkbox-item">[ ${isGraphicDesign ? 'X' : ' '} ] <span>Graphic Design</span></div>
                <div class="checkbox-item">[   ] <span>Video Production & Editing</span></div>
                <div class="checkbox-item">[ ${isPaidAds ? 'X' : ' '} ] <span>Paid Advertising Management</span></div>
                <div class="checkbox-item">[ ${isSEO ? 'X' : ' '} ] <span>Search Engine Optimization (SEO)</span></div>
              </td>
              <td style="width: 50%; vertical-align: top; padding: 2px 0; border: none;">
                <div class="checkbox-item">[ ${isWebDev ? 'X' : ' '} ] <span>Website Design & Development</span></div>
                <div class="checkbox-item">[   ] <span>Branding & Identity Design</span></div>
                <div class="checkbox-item">[   ] <span>Email Marketing</span></div>
                <div class="checkbox-item">[   ] <span>Influencer Marketing</span></div>
                <div class="checkbox-item">[   ] <span>Marketing Consultation</span></div>
                <div class="checkbox-item">[ ${services.length > 0 ? 'X' : ' '} ] <span>Other: ${services.join(', ')}</span></div>
              </td>
            </tr>
          </table>

          <h2>Deliverables</h2>
          <div class="deliverables-box">
            ${prop.goals}
          </div>

          <h1>3. Project Term</h1>
          <p>Start Date: <strong>${formattedDate}</strong><br/>
             End Date: <strong>${prop.timeline === '12 Months' ? '12 Months from Start Date' : '6 Months from Start Date'}</strong>
          </p>
          
          <p>Contract Type:</p>
          <table style="width: 100%; border: none; margin-bottom: 15px;">
            <tr>
              <td style="border: none;">[   ] One-Time Project</td>
              <td style="border: none;">[ X ] Monthly Retainer</td>
              <td style="border: none;">[   ] Quarterly Retainer</td>
              <td style="border: none;">[   ] Annual Retainer</td>
            </tr>
          </table>
          <p>The Agreement shall remain effective until completion of services or termination according to this Agreement.</p>

          <div class="page-break"></div>

          <h1>4. Fees and Payment</h1>
          <p>Service Fee: <strong>${prop.budget}</strong></p>
          <p>Payment Structure:</p>
          <table style="width: 100%; border: none; margin-bottom: 15px;">
            <tr>
              <td style="border: none;">[   ] 100% Advance</td>
              <td style="border: none;">[   ] 50% Advance, 50% Upon Completion</td>
              <td style="border: none;">[ X ] Monthly Retainer</td>
              <td style="border: none;">[   ] Milestone-Based</td>
            </tr>
          </table>

          <h2>Payment Due Date</h2>
          <p>Invoices are payable within <strong>${ownerSettings.paymentTermsDays}</strong> days from the invoice date.</p>
          <p>Late payments may result in suspension of services, delay of deliverables, or late payment charges as permitted by law. All completed work and deliverables remain the property of the Service Provider until full payment is received.</p>

          <h1>5. Client Obligations</h1>
          <p>The Client agrees to:</p>
          <ul>
            <li>Provide all necessary information, assets, and approvals required for project execution.</li>
            <li>Grant access to relevant platforms, accounts, and marketing tools.</li>
            <li>Review and approve submitted work within a reasonable time.</li>
            <li>Ensure all provided materials do not violate any laws, copyrights, or third-party rights.</li>
          </ul>
          <p>Any delays caused by the Client may result in corresponding project delays.</p>

          <h1>6. Revisions</h1>
          <p>The following revisions are included: <strong>${ownerSettings.includedRevisions}</strong> revisions.</p>
          <p>Any additional revisions requested beyond the included limit may be charged separately at the rate of: <strong>${ownerSettings.extraRevisionFee}</strong> per revision. Major changes to approved concepts, strategies, or designs may be treated as a new project and billed accordingly.</p>

          <h1>7. Intellectual Property Rights</h1>
          <p>Upon receipt of full payment, final approved deliverables shall be transferred to the Client. Preliminary concepts, drafts, templates, frameworks, methodologies, and internal processes remain the property of the Service Provider unless otherwise agreed in writing.</p>
          <p>The Service Provider may showcase completed work in portfolios, presentations, social media, marketing materials, and case studies unless restricted by a separate confidentiality agreement.</p>

          <h1>8. Advertising & Third-Party Costs</h1>
          <p>Any advertising budgets, software subscriptions, media buying costs, influencer fees, stock assets, hosting fees, domain costs, or third-party expenses are separate from the Service Provider's fees. The Client shall bear all such expenses directly.</p>

          <div class="page-break"></div>

          <h1>9. Performance Disclaimer</h1>
          <p>The Client understands and agrees that marketing outcomes depend on various factors outside the Service Provider's control. The Service Provider does not guarantee specific revenue or profits, lead volume, sales conversions, search engine rankings, social media growth, or return on advertising spend.</p>

          <h1>10. Confidentiality</h1>
          <p>Both Parties agree to maintain the confidentiality of all proprietary, financial, technical, and business information shared during the engagement. This obligation survives termination of this Agreement.</p>

          <h1>11. Independent Contractor Relationship</h1>
          <p>The Service Provider acts as an independent contractor. Nothing in this Agreement shall be construed as creating an employer-employee relationship, partnership, joint venture, or agency relationship between the Parties.</p>

          <h1>12. Limitation of Liability</h1>
          <p>The Service Provider shall not be liable for indirect damages, consequential losses, loss of profits, business interruption, platform account suspensions, or third-party actions. The maximum liability of the Service Provider shall not exceed the total amount paid by the Client under this Agreement.</p>

          <h1>13. Termination</h1>
          <p>Either Party may terminate this Agreement by providing <strong>30</strong> days written notice. Upon termination, the Client shall pay for all work completed up to the termination date, and any unpaid invoices become immediately due.</p>

          <h1>14. Force Majeure</h1>
          <p>Neither Party shall be held responsible for delays or failure to perform obligations due to events beyond reasonable control, including natural disasters, government restrictions, internet outages, cyberattacks, platform disruptions, war, or labor disputes.</p>

          <h1>15. Non-Solicitation</h1>
          <p>During the term of this Agreement and for a period of <strong>12</strong> months thereafter, the Client agrees not to directly hire or solicit employees, contractors, or freelancers engaged by the Service Provider without written consent.</p>

          <h1>16. Dispute Resolution</h1>
          <p>The Parties agree to first attempt to resolve disputes through good-faith negotiations. If unresolved, disputes shall be submitted to mediation or arbitration before pursuing legal action.</p>

          <h1>17. Governing Law</h1>
          <p>This Agreement shall be governed by the laws of:<br/>
             Country: <strong>${ownerSettings.country}</strong> &nbsp;|&nbsp; State/Province: <strong>${ownerSettings.stateProvince}</strong>
          </p>

          <h1>18. Entire Agreement</h1>
          <p>This Agreement constitutes the entire understanding between the Parties and supersedes all prior discussions, proposals, negotiations, and communications.</p>

          <table class="signatures-table">
            <tr>
              <td style="border: none; border-top: 1px solid #1c1917;">
                <strong style="text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #57534e;">Service Provider</strong><br/><br/>
                Company Name: ${ownerSettings.companyName}<br/>
                By: ${ownerSettings.ownerName}<br/>
                Title: ${ownerSettings.designation}<br/>
                <div class="signature-line"></div>
                <div style="margin-top: 8px;">Date: ____________________</div>
              </td>
              <td class="spacer"></td>
              <td style="border: none; border-top: 1px solid #1c1917;">
                <strong style="text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #57534e;">Client</strong><br/><br/>
                Company Name: ${clientDetails.companyName}<br/>
                By: ${clientDetails.name}<br/>
                Title: Authorized Representative<br/>
                <div class="signature-line"></div>
                <div style="margin-top: 8px;">Date: ____________________</div>
              </td>
            </tr>
          </table>

          <div class="page-break"></div>

          <div class="header-container" style="border-bottom: 2px solid #1c1917; margin-bottom: 30px; padding-bottom: 10px; text-align: left;">
            <h2 style="font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Schedule A - Project Details</h2>
          </div>
          
          <p><strong>Project Name:</strong> ${clientDetails.companyName} Campaign Rollout</p>
          
          <p><strong>Services Included:</strong></p>
          <ul>
            ${services.map(s => `<li>${s}</li>`).join('')}
          </ul>

          <p><strong>Deliverables:</strong></p>
          <p>${prop.goals}</p>

          <p><strong>Project Timeline:</strong> ${prop.timeline}</p>
          <p><strong>Payment Schedule:</strong> Invoiced monthly, payable within ${ownerSettings.paymentTermsDays} days of invoice date.</p>
          <p><strong>Special Terms:</strong> Scope changes requested after contract signing will be billed at the standard hourly rates unless otherwise agreed in writing.</p>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(contractHtml);
    printWindow.document.close();
  };

  // Invoice Handlers
  const handleAddBlankRow = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const handleUpdateLineItem = (index: number, field: 'description' | 'quantity' | 'rate', value: any) => {
    const updatedItems = [...invoiceForm.items];
    if (field === 'description') {
      updatedItems[index].description = value;
    } else if (field === 'quantity') {
      updatedItems[index].quantity = parseInt(value) || 0;
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    } else if (field === 'rate') {
      updatedItems[index].rate = parseFloat(value) || 0;
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    setInvoiceForm(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    // Filter out rows that are completely blank (no description)
    const validItems = invoiceForm.items
      .filter(item => item.description.trim() !== '')
      .map(item => ({
        id: `item_${Math.random().toString(36).substr(2, 9)}`,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      }));

    if (validItems.length === 0) {
      alert("Please enter a description for at least one line item.");
      return;
    }

    const subtotal = validItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * invoiceForm.taxRate) / 100;
    const total = subtotal + taxAmount;

    await mockDb.createInvoice({
      clientId: selectedClient.id,
      clientName: selectedClient.companyName,
      invoiceNumber: invoiceForm.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      items: validItems,
      subtotal,
      taxRate: invoiceForm.taxRate,
      taxAmount,
      total,
      status: 'sent',
      notes: invoiceForm.notes
    });

    // Reset form
    setInvoiceForm({
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      taxRate: 10,
      notes: 'Thank you for your business! Payment is due within 30 days.',
      items: []
    });
    setShowInvoiceCreator(false);

    // Refresh invoices
    const allInvoices = await mockDb.getInvoices();
    setInvoices(allInvoices.filter(i => i.clientId === selectedClient.id));
    triggerRefresh();
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    await mockDb.deleteInvoice(invoiceId);
    if (selectedClient) {
      const allInvoices = await mockDb.getInvoices();
      setInvoices(allInvoices.filter(i => i.clientId === selectedClient.id));
    }
    triggerRefresh();
  };

  const handleToggleInvoiceStatus = async (invoice: Invoice) => {
    const newStatus = invoice.status === 'paid' ? 'sent' : 'paid';
    await mockDb.updateInvoice({
      ...invoice,
      status: newStatus
    });
    if (selectedClient) {
      const allInvoices = await mockDb.getInvoices();
      setInvoices(allInvoices.filter(i => i.clientId === selectedClient.id));
    }
    triggerRefresh();
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (!selectedClient) return;

    // Load owner profile settings from localStorage
    let ownerSettings = {
      companyName: 'AgencyOS AI',
      ownerName: 'Emma Stone',
      designation: 'Founder & CEO',
      address: '100 Innovation Way, Suite 400, San Francisco, CA 94105',
      email: 'emma@agencyos.ai',
      phone: '+1 (555) 839-2019',
      country: 'United States',
      stateProvince: 'California',
      paymentTermsDays: '15'
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agencyos_owner_profile');
      if (saved) {
        try {
          ownerSettings = { ...ownerSettings, ...JSON.parse(saved) };
        } catch (e) {
          console.error('Failed to parse owner profile:', e);
        }
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber} - ${selectedClient.companyName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 20mm;
            }
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #27272a;
              margin: 0;
              padding: 0;
              font-size: 13px;
              line-height: 1.5;
            }
            .address-box h3 {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #71717a;
              border-bottom: 1px solid #e4e4e7;
              padding-bottom: 5px;
              margin: 0 0 10px 0;
            }
            .address-box p {
              margin: 0 0 4px 0;
              line-height: 1.4;
            }
            .address-box .company-name {
              font-weight: 700;
              font-size: 14px;
              color: #09090b;
              margin-bottom: 6px;
            }
            table.items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            table.items-table th {
              background-color: #f4f4f5;
              font-weight: 600;
              text-align: left;
              padding: 10px 12px;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #e4e4e7;
            }
            table.items-table td {
              padding: 12px;
              border-bottom: 1px solid #f4f4f5;
            }
            table.items-table .text-right {
              text-align: right;
            }
            table.items-table .text-center {
              text-align: center;
            }
            .totals-table {
              width: 100%;
              border-collapse: collapse;
            }
            .totals-table td {
              padding: 6px 12px;
            }
            .totals-table .label {
              text-align: left;
              color: #71717a;
            }
            .totals-table .value {
              text-align: right;
              font-weight: 600;
            }
            .totals-table tr.grand-total {
              border-top: 2px solid #e4e4e7;
              font-size: 16px;
            }
            .totals-table tr.grand-total td {
              padding-top: 12px;
              color: #09090b;
              font-weight: 800;
            }
            .notes-section {
              border-top: 1px dashed #e4e4e7;
              padding-top: 20px;
            }
            .notes-section h4 {
              margin: 0 0 5px 0;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #71717a;
            }
            .notes-section p {
              margin: 0;
              color: #71717a;
              font-style: italic;
            }
            .badge-paid {
              color: #16a34a;
              font-weight: bold;
              border: 1px solid #16a34a;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: uppercase;
              font-size: 10px;
              display: inline-block;
            }
            .badge-sent {
              color: #2563eb;
              font-weight: bold;
              border: 1px solid #2563eb;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: uppercase;
              font-size: 10px;
              display: inline-block;
            }
            .meta-label {
              font-weight: 600;
              color: #71717a;
            }
          </style>
        </head>
        <body>
          <!-- Header Layout Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border-bottom: 2px solid #e4e4e7; padding-bottom: 20px;">
            <tr>
              <td style="vertical-align: top; text-align: left; padding-bottom: 20px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #09090b; margin: 0 0 5px 0; letter-spacing: -0.5px;">\${ownerSettings.companyName}</h1>
                <p style="margin: 0; color: #71717a;">\${ownerSettings.ownerName} &bull; \${ownerSettings.designation}</p>
              </td>
              <td style="vertical-align: top; text-align: right; padding-bottom: 20px;">
                <h2 style="font-size: 28px; font-weight: 300; color: #71717a; margin: 0 0 10px 0; letter-spacing: 1px;">INVOICE</h2>
                <table style="display: inline-table; border-collapse: collapse; text-align: left;">
                  <tr>
                    <td class="meta-label" style="padding: 2px 10px 2px 0;">Invoice #:</td>
                    <td style="font-weight: bold; color: #09090b; text-align: right; padding: 2px 0;">\${invoice.invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td class="meta-label" style="padding: 2px 10px 2px 0;">Date:</td>
                    <td style="color: #09090b; text-align: right; padding: 2px 0;">\${invoice.issueDate}</td>
                  </tr>
                  <tr>
                    <td class="meta-label" style="padding: 2px 10px 2px 0;">Due Date:</td>
                    <td style="color: #09090b; text-align: right; padding: 2px 0;">\${invoice.dueDate}</td>
                  </tr>
                  <tr>
                    <td class="meta-label" style="padding: 2px 10px 2px 0; vertical-align: middle;">Status:</td>
                    <td style="text-align: right; padding: 2px 0;">
                      <span class="\${invoice.status === 'paid' ? 'badge-paid' : 'badge-sent'}">\${invoice.status}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Addresses Layout Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                <div class="address-box">
                  <h3>From</h3>
                  <p class="company-name">\${ownerSettings.companyName}</p>
                  <p>\${ownerSettings.address}</p>
                  <p>Email: \${ownerSettings.email}</p>
                  <p>Phone: \${ownerSettings.phone}</p>
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 20px;">
                <div class="address-box">
                  <h3>Bill To</h3>
                  <p class="company-name">\${selectedClient.companyName}</p>
                  <p>Attn: \${selectedClient.name}</p>
                  <p>Email: \${selectedClient.email}</p>
                  <p>Phone: \${selectedClient.phone || 'N/A'}</p>
                  <p>Website: \${selectedClient.website || 'N/A'}</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 55%;">Description</th>
                <th class="text-center" style="width: 10%;">Qty</th>
                <th class="text-right" style="width: 15%;">Unit Price</th>
                <th class="text-right" style="width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
              \${invoice.items.map(item => \`
                <tr>
                  <td>\${item.description}</td>
                  <td class="text-center">\${item.quantity}</td>
                  <td class="text-right">$\${item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">$\${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>

          <!-- Totals Layout Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 50px;">
            <tr>
              <td style="width: 60%; vertical-align: top;"></td>
              <td style="width: 40%; vertical-align: top;">
                <table class="totals-table">
                  <tr>
                    <td class="label">Subtotal</td>
                    <td class="value">$\${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td class="label">Tax (\${invoice.taxRate}%)</td>
                    <td class="value">$\${invoice.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr class="grand-total">
                    <td class="label">Total Due</td>
                    <td class="value">$\${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          \${invoice.notes ? \`
            <div class="notes-section">
              <h4>Notes & Payment Instructions</h4>
              <p>\${invoice.notes}</p>
            </div>
          \` : ''}

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
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
                    { id: 'proposals', label: 'Proposal Desk' },
                    { id: 'invoices', label: 'Invoice Desk' }
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
                              <button 
                                onClick={() => handleDownloadContract(prop)}
                                className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-lg text-zinc-600 flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5 text-zinc-400" /> Download PDF Contract
                              </button>
                              <button 
                                onClick={() => handleDownloadDeck(prop)}
                                className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-lg text-zinc-600 flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5 text-zinc-450" /> Download Pitch Deck (PDF)
                              </button>
                              <button 
                                onClick={() => handleDownloadDeckPPTX(prop)}
                                className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-lg text-zinc-600 flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5 text-zinc-450" /> Download Pitch Deck (PPTX)
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

              {/* TAB CONTENT: INVOICES */}
              {activeSubTab === 'invoices' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Invoice Desk</h4>
                      <p className="text-[10px] text-zinc-500">Create, monitor, and print professional services invoices using custom agency profiles.</p>
                    </div>
                    {!showInvoiceCreator && (
                      <button
                        onClick={() => {
                          setShowInvoiceCreator(true);
                          setInvoiceForm({
                            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                            issueDate: new Date().toISOString().split('T')[0],
                            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            taxRate: 10,
                            notes: 'Thank you for your business! Payment is due within 30 days.',
                            items: [
                              { description: '', quantity: 1, rate: 0, amount: 0 },
                              { description: '', quantity: 1, rate: 0, amount: 0 },
                              { description: '', quantity: 1, rate: 0, amount: 0 },
                              { description: '', quantity: 1, rate: 0, amount: 0 }
                            ]
                          });
                        }}
                        className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Invoice
                      </button>
                    )}
                  </div>

                  {showInvoiceCreator ? (
                    <form onSubmit={handleCreateInvoice} className="bg-white border border-zinc-200 rounded-xl p-5 space-y-6 shadow-xs animate-fade-in">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                        <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">New Invoice Details</h5>
                        <button
                          type="button"
                          onClick={() => setShowInvoiceCreator(false)}
                          className="text-xs text-zinc-500 hover:text-zinc-800 px-2 py-1 rounded border border-zinc-200"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Invoice Number</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. INV-2026-001"
                            value={invoiceForm.invoiceNumber}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                            className="w-full text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Issue Date</label>
                          <input
                            type="date"
                            required
                            value={invoiceForm.issueDate}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                            className="w-full text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Due Date</label>
                          <input
                            type="date"
                            required
                            value={invoiceForm.dueDate}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                            className="w-full text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Tax Rate (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            required
                            value={invoiceForm.taxRate}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: parseFloat(e.target.value) || 0 })}
                            className="w-full text-xs"
                          />
                        </div>
                      </div>

                      {/* Invoice Items Workspace */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Line Items (Fill blanks to auto-calculate)</label>
                          <button
                            type="button"
                            onClick={handleAddBlankRow}
                            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded text-[10px] font-semibold flex items-center gap-1 shadow-2xs"
                          >
                            <Plus className="w-3 h-3" /> Add Row
                          </button>
                        </div>
                        
                        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                <th className="p-3 pl-4">Description</th>
                                <th className="p-3 text-center w-24">Qty</th>
                                <th className="p-3 text-right w-36">Rate ($)</th>
                                <th className="p-3 text-right w-40">Amount ($)</th>
                                <th className="p-3 text-center w-12"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceForm.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-zinc-150 last:border-none hover:bg-zinc-50/20">
                                  <td className="p-2 pl-4">
                                    <input
                                      type="text"
                                      placeholder="e.g. Content Creation & Marketing..."
                                      value={item.description}
                                      onChange={(e) => handleUpdateLineItem(idx, 'description', e.target.value)}
                                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-xs placeholder-zinc-300 font-medium text-zinc-800"
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateLineItem(idx, 'quantity', e.target.value)}
                                      className="w-16 bg-transparent border border-zinc-200 rounded text-center py-0.5 px-1 text-xs focus:ring-1 focus:ring-zinc-400"
                                    />
                                  </td>
                                  <td className="p-2 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.rate === 0 ? '' : item.rate}
                                      placeholder="0.00"
                                      onChange={(e) => handleUpdateLineItem(idx, 'rate', e.target.value)}
                                      className="w-28 bg-transparent border border-zinc-200 rounded text-right py-0.5 px-1.5 text-xs focus:ring-1 focus:ring-zinc-400 inline-block"
                                    />
                                  </td>
                                  <td className="p-2 text-right text-zinc-900 font-bold pr-4">
                                    ${(item.quantity * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveLineItem(idx)}
                                      className="text-red-500 hover:text-red-700 font-bold text-base"
                                      title="Remove Row"
                                    >
                                      &times;
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Calculations & Notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Invoice Notes / Terms</label>
                          <textarea
                            rows={3.5}
                            value={invoiceForm.notes}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                            className="w-full text-xs"
                          />
                        </div>
                        <div className="bg-zinc-50 border border-zinc-150 rounded-lg p-3.5 flex flex-col justify-between">
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-zinc-500">
                              <span>Subtotal</span>
                              <span>${invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                              <span>Tax ({invoiceForm.taxRate}%)</span>
                              <span>${((invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0) * invoiceForm.taxRate) / 100).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-end border-t border-zinc-200 pt-3 mt-3">
                            <span className="text-xs font-bold text-zinc-800">Total Invoice Amount</span>
                            <span className="text-base font-extrabold text-zinc-950">
                              ${(
                                invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0) +
                                (invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0) * invoiceForm.taxRate) / 100
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 pt-4 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowInvoiceCreator(false)}
                          className="px-4 py-2 border border-zinc-250 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Save & Issue Invoice
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Invoice List workspace */
                    <div className="space-y-4">
                      {invoices.length > 0 ? (
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-zinc-200 bg-zinc-50/50 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                  <th className="p-3.5 pl-4">Invoice #</th>
                                  <th className="p-3.5">Issue Date</th>
                                  <th className="p-3.5">Due Date</th>
                                  <th className="p-3.5 text-center">Status</th>
                                  <th className="p-3.5 text-right">Total</th>
                                  <th className="p-3.5 text-center w-48">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoices.map((inv) => (
                                  <tr key={inv.id} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50/30 transition-colors">
                                    <td className="p-3.5 pl-4 text-zinc-900 font-bold">{inv.invoiceNumber}</td>
                                    <td className="p-3.5 text-zinc-600">{inv.issueDate}</td>
                                    <td className="p-3.5 text-zinc-600">{inv.dueDate}</td>
                                    <td className="p-3.5 text-center">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                          inv.status === 'paid'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250/50'
                                            : 'bg-blue-50 text-blue-700 border-blue-250/50'
                                        }`}
                                      >
                                        {inv.status}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-right text-zinc-900 font-bold">${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td className="p-3.5 text-center flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handleToggleInvoiceStatus(inv)}
                                        className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                                          inv.status === 'paid'
                                            ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border-zinc-200'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-250'
                                        }`}
                                      >
                                        {inv.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                      </button>
                                      <button
                                        onClick={() => handleDownloadInvoice(inv)}
                                        className="p-1 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200"
                                        title="Print / Save PDF"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteInvoice(inv.id)}
                                        className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                        title="Delete Invoice"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[250px] bg-white border border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                          <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200 mb-3">
                            <FileText className="w-5 h-5 text-zinc-400" />
                          </div>
                          <h3 className="font-bold text-xs text-zinc-600">No invoices issued</h3>
                          <p className="text-[10px] max-w-xs mx-auto mt-0.5">Click the "Create Invoice" button in the upper-right corner to issue a new client invoice record.</p>
                        </div>
                      )}
                    </div>
                  )}
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
