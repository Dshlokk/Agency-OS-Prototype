import { Lead, Client, Project, Task, Proposal, Strategy, Report, Comment, Notification, User, PipelineStage, TaskStatus, TaskPriority, AIConversation, Message, OnboardingChecklistItem, ProposalSection, Invoice, InvoiceItem } from '../types/db';

// Simple helper to check if window is available
const isClient = typeof window !== 'undefined';

// Initial Dummy Data
const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Emma Stone', email: 'emma@agencyos.ai', role: 'owner', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', productivityScore: 94, resourceUtilization: 85 },
  { id: 'u2', name: 'Liam Neeson', email: 'liam@agencyos.ai', role: 'team-member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', productivityScore: 88, resourceUtilization: 90 },
  { id: 'u3', name: 'Sophia Loren', email: 'sophia@agencyos.ai', role: 'team-member', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', productivityScore: 92, resourceUtilization: 72 }
];

const DEFAULT_LEADS: Lead[] = [];
const DEFAULT_CLIENTS: Client[] = [];
const DEFAULT_PROJECTS: Project[] = [];
const DEFAULT_TASKS: Task[] = [];
const DEFAULT_PROPOSALS: Proposal[] = [];
const DEFAULT_STRATEGIES: Strategy[] = [];
const DEFAULT_REPORTS: Report[] = [];
const DEFAULT_COMMENTS: Comment[] = [];
const DEFAULT_NOTIFICATIONS: Notification[] = [];
const DEFAULT_CONVERSATIONS: AIConversation[] = [
  {
    id: 'conv1',
    messages: [
      { id: 'm1', role: 'assistant', content: 'Hello! I am AgencyOS AI. How can I help you manage your agency operations today?', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  }
];
const DEFAULT_INVOICES: Invoice[] = [];

// In-memory Database state
class MockDatabase {
  private leads: Lead[] = [];
  private clients: Client[] = [];
  private projects: Project[] = [];
  private tasks: Task[] = [];
  private proposals: Proposal[] = [];
  private strategies: Strategy[] = [];
  private reports: Report[] = [];
  private comments: Comment[] = [];
  private notifications: Notification[] = [];
  private conversations: AIConversation[] = [];
  private users: User[] = [];
  private invoices: Invoice[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (isClient) {
      const hasCleaned = localStorage.getItem('agencyos_cleaned_v2');
      if (!hasCleaned) {
        // Clear all old keys containing dummy data
        const keysToClear = ['leads', 'clients', 'projects', 'tasks', 'proposals', 'strategies', 'reports', 'comments', 'notifications', 'conversations', 'users', 'invoices'];
        keysToClear.forEach(key => localStorage.removeItem(`agencyos_${key}`));
        localStorage.setItem('agencyos_cleaned_v2', 'true');
      }

      const getStored = <T>(key: string, defaultValue: T): T => {
        const item = localStorage.getItem(`agencyos_${key}`);
        return item ? JSON.parse(item) : defaultValue;
      };

      this.leads = getStored('leads', DEFAULT_LEADS);
      this.clients = getStored('clients', DEFAULT_CLIENTS);
      this.projects = getStored('projects', DEFAULT_PROJECTS);
      this.tasks = getStored('tasks', DEFAULT_TASKS);
      this.proposals = getStored('proposals', DEFAULT_PROPOSALS);
      this.strategies = getStored('strategies', DEFAULT_STRATEGIES);
      this.reports = getStored('reports', DEFAULT_REPORTS);
      this.comments = getStored('comments', DEFAULT_COMMENTS);
      this.notifications = getStored('notifications', DEFAULT_NOTIFICATIONS);
      this.conversations = getStored('conversations', DEFAULT_CONVERSATIONS);
      this.users = getStored('users', DEFAULT_USERS);
      this.invoices = getStored('invoices', DEFAULT_INVOICES);
    } else {
      this.leads = [...DEFAULT_LEADS];
      this.clients = [...DEFAULT_CLIENTS];
      this.projects = [...DEFAULT_PROJECTS];
      this.tasks = [...DEFAULT_TASKS];
      this.proposals = [...DEFAULT_PROPOSALS];
      this.strategies = [...DEFAULT_STRATEGIES];
      this.reports = [...DEFAULT_REPORTS];
      this.comments = [...DEFAULT_COMMENTS];
      this.notifications = [...DEFAULT_NOTIFICATIONS];
      this.conversations = [...DEFAULT_CONVERSATIONS];
      this.users = [...DEFAULT_USERS];
      this.invoices = [...DEFAULT_INVOICES];
    }
  }

  private saveToStorage(key: string, data: any) {
    if (isClient) {
      localStorage.setItem(`agencyos_${key}`, JSON.stringify(data));
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return [...this.leads];
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    return this.leads.find(l => l.id === id);
  }

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'score' | 'quality' | 'conversionProbability' | 'suggestedServices' | 'suggestedFollowUp' | 'generatedMessage'>): Promise<Lead> {
    const score = Math.floor(Math.random() * 50) + 45; // AI scoring simulation
    const conversionProbability = Math.floor(score * 0.9);
    const quality = score > 80 ? 'High' : score > 50 ? 'Medium' : 'Low';
    
    // Simulate AI Service Pitch logic
    const servicesMap: { [key: string]: string[] } = {
      'SaaS': ['Technical SEO Audit', 'SEO Campaign', 'B2B Paid Ads'],
      'E-commerce': ['Shopify CRO Audit', 'Meta Ads scale', 'Email Marketing Flow Setup'],
      'Healthcare': ['Compliance Ad Funnels', 'Local SEO Retainer'],
      'Food & Retail': ['Social Media Branding', 'Influencer UGC Package']
    };
    
    const suggestedServices = servicesMap[leadData.industry] || ['General Digital Growth Strategy', 'SEO Content Retainer'];
    
    const newLead: Lead = {
      ...leadData,
      id: `l_${Math.random().toString(36).substr(2, 9)}`,
      score,
      quality,
      conversionProbability,
      suggestedServices,
      suggestedFollowUp: `Review site URL and draft initial audit points within 24 hours.`,
      generatedMessage: `Hi ${leadData.name.split(' ')[0]},\n\nThanks for reaching out! I checked out your website ${leadData.website} and saw some massive growth opportunities, especially in ranking for ${suggestedServices[0]} campaigns.\n\nLet me know when you are free for a 10-minute discovery call.\n\nBest,\nEmma`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.leads.push(newLead);
    this.saveToStorage('leads', this.leads);

    // Create a notification
    await this.createNotification('New Lead Captured', `AI scored lead ${newLead.companyName} at ${score}/100.`);

    return newLead;
  }

  async updateLeadStage(id: string, stage: PipelineStage): Promise<Lead | undefined> {
    const lead = this.leads.find(l => l.id === id);
    if (!lead) return undefined;

    lead.stage = stage;
    lead.updatedAt = new Date().toISOString();
    
    if (stage === 'won') {
      // Trigger Automation: Move to Client
      await this.convertLeadToClient(lead);
    }

    this.saveToStorage('leads', this.leads);
    return lead;
  }

  async updateLead(updatedLead: Lead): Promise<Lead | undefined> {
    const idx = this.leads.findIndex(l => l.id === updatedLead.id);
    if (idx === -1) return undefined;
    this.leads[idx] = { ...updatedLead, updatedAt: new Date().toISOString() };
    this.saveToStorage('leads', this.leads);
    return this.leads[idx];
  }

  // Automation: Lead to Client
  private async convertLeadToClient(lead: Lead) {
    // Check if client already exists
    const exists = this.clients.find(c => c.companyName === lead.companyName);
    if (exists) return;

    const newClientId = `c_${Math.random().toString(36).substr(2, 9)}`;

    // 1. Create Onboarding Checklist Items
    const onboardingChecklist: OnboardingChecklistItem[] = [
      { id: `ob_${Math.random().toString(36).substr(2, 5)}`, task: 'Complete onboarding questionnaire', completed: false },
      { id: `ob_${Math.random().toString(36).substr(2, 5)}`, task: 'Request client brand kit & assets', completed: false },
      { id: `ob_${Math.random().toString(36).substr(2, 5)}`, task: 'Set up communication channel (Slack/Teams)', completed: false },
      { id: `ob_${Math.random().toString(36).substr(2, 5)}`, task: 'Configure analytics and data access keys', completed: false },
      { id: `ob_${Math.random().toString(36).substr(2, 5)}`, task: 'Kickoff meeting scheduled', completed: false }
    ];

    // 2. Mock AI audits
    const newClient: Client = {
      id: newClientId,
      name: lead.name,
      companyName: lead.companyName,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      industry: lead.industry,
      revenueRange: lead.revenueRange,
      socialLinks: lead.socialLinks,
      businessDescription: lead.notes || `${lead.companyName} is an active client in the ${lead.industry} space.`,
      onboardingChecklist,
      websiteAudit: {
        seoScore: Math.floor(Math.random() * 30) + 60,
        speedScore: Math.floor(Math.random() * 40) + 50,
        mobileScore: Math.floor(Math.random() * 20) + 75,
        uxScore: Math.floor(Math.random() * 30) + 65,
        conversionScore: Math.floor(Math.random() * 35) + 50,
        contentScore: Math.floor(Math.random() * 30) + 60,
        details: 'Initial AI site audit. Speed indices show blockage on asset script delivery. Content SEO tags present but missing high-volume keyword mappings.'
      },
      socialAudit: {
        frequency: '1-2 posts per week',
        engagementRate: parseFloat((Math.random() * 3 + 1).toFixed(2)),
        growthRate: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        consistency: 'Medium',
        details: 'Channel is moderately active. AI recommends refining visual posting styles to establish strong brand guidelines and launching dynamic short-form videos.'
      },
      competitorAudit: {
        competitors: ['Competitor Alpha', 'Competitor Beta'],
        positioning: `Mid-market, focusing on quick turnarounds and cost.`,
        opportunities: `Leverage their slow customer support responses by emphasizing 24/7 dedicated account manager positioning in copy.`
      },
      deliverables: {
        swot: {
          strengths: ['Established localized reputation', 'Decent initial site layout structure'],
          weaknesses: ['Slow page loading on mobile views', 'Low keyword volume coverage'],
          opportunities: ['Target competitors pricing query listings', 'Automate lead funnel emails'],
          threats: ['Aggressive keyword bidding by larger enterprise agencies']
        },
        growthOpportunities: [
          'Optimize mobile script execution load times.',
          'Execute targeted brand positioning refresh strategy.'
        ],
        recommendedServices: lead.suggestedServices,
        strategicRoadmap: [
          'Week 1-2: Setup kickoff dashboard and finalize asset collection.',
          'Week 3-4: Perform code optimization and landing page CRO review.'
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.clients.push(newClient);
    this.saveToStorage('clients', this.clients);

    // 3. Create Project Workspace automatically
    const newProjectId = `p_${Math.random().toString(36).substr(2, 9)}`;
    const newProject: Project = {
      id: newProjectId,
      clientId: newClientId,
      clientName: lead.companyName,
      name: `Onboarding & Core ${lead.suggestedServices[0] || 'Campaign'}`,
      status: 'planning',
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.projects.push(newProject);
    this.saveToStorage('projects', this.projects);

    // 4. Create tasks automatically
    const newTasks: Task[] = [
      {
        id: `t_${Math.random().toString(36).substr(2, 9)}`,
        projectId: newProjectId,
        projectName: newProject.name,
        title: 'Review brand assets and set color guidelines',
        description: 'Verify client logos and brand files. Define global typography standards for all campaign deliverables.',
        status: 'todo',
        priority: 'medium',
        assigneeId: 'u3',
        assigneeName: 'Sophia Loren',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        delayPrediction: 'On track. Assignee workload is currently optimized.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `t_${Math.random().toString(36).substr(2, 9)}`,
        projectId: newProjectId,
        projectName: newProject.name,
        title: 'Run full technical search engine audit',
        description: 'Analyze page canonicals, robots file, duplicate title tags, and page speed index benchmarks.',
        status: 'todo',
        priority: 'high',
        assigneeId: 'u2',
        assigneeName: 'Liam Neeson',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        delayPrediction: 'On track.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.tasks.push(...newTasks);
    this.saveToStorage('tasks', this.tasks);

    // Trigger Notification
    await this.createNotification(
      'Client Onboarded Automatically',
      `Lead "${lead.companyName}" won! Created onboarding client workspace, checklist, and projects.`
    );
  }

  async createNewClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'onboardingChecklist'>): Promise<Client> {
    const newClientId = `c_${Math.random().toString(36).substr(2, 9)}`;

    const onboardingChecklist = [
      { id: `ob_${Math.random().toString(36).substr(2, 5)}`, task: 'Complete onboarding questionnaire', completed: false },
      { id: `ob_${Math.random().toString(36).substr(2, 5)}`, task: 'Request client brand kit & assets', completed: false },
      { id: `ob_${Math.random().toString(36).substr(2, 5)}`, task: 'Set up communication channel (Slack/Teams)', completed: false }
    ];

    const newClient: Client = {
      ...clientData,
      id: newClientId,
      onboardingChecklist,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.clients.push(newClient);
    this.saveToStorage('clients', this.clients);

    await this.createNotification(
      'Client Created Manually',
      `New Client "${newClient.companyName}" added to the workspace directories.`
    );

    return newClient;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return [...this.clients];
  }

  async getClientById(id: string): Promise<Client | undefined> {
    return this.clients.find(c => c.id === id);
  }

  async updateClient(updatedClient: Client): Promise<Client | undefined> {
    const idx = this.clients.findIndex(c => c.id === updatedClient.id);
    if (idx === -1) return undefined;
    this.clients[idx] = { ...updatedClient, updatedAt: new Date().toISOString() };
    this.saveToStorage('clients', this.clients);
    return this.clients[idx];
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return [...this.projects];
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.projects.find(p => p.id === id);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: `p_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.push(newProject);
    this.saveToStorage('projects', this.projects);
    return newProject;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.tasks.find(t => t.id === id);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task | undefined> {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return undefined;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    this.saveToStorage('tasks', this.tasks);
    return task;
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'delayPrediction'>): Promise<Task> {
    // Generate an AI delay prediction
    const assignee = this.users.find(u => u.id === taskData.assigneeId);
    const activeTasksCount = this.tasks.filter(t => t.assigneeId === taskData.assigneeId && t.status !== 'done').length;
    
    let delayPrediction = 'On track. Assignee workload is currently optimized.';
    if (activeTasksCount > 3) {
      delayPrediction = `Potential 2-day delay predicted: ${assignee?.name || 'Assignee'} has ${activeTasksCount} other active tasks this week.`;
    }

    const newTask: Task = {
      ...taskData,
      id: `t_${Math.random().toString(36).substr(2, 9)}`,
      delayPrediction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    this.saveToStorage('tasks', this.tasks);
    return newTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const startLen = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveToStorage('tasks', this.tasks);
    return this.tasks.length < startLen;
  }

  // Proposals
  async getProposals(): Promise<Proposal[]> {
    return [...this.proposals];
  }

  async getProposalById(id: string): Promise<Proposal | undefined> {
    return this.proposals.find(p => p.id === id);
  }

  async createProposal(proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'sections' | 'pricingRecommendations' | 'upsellRecommendations' | 'serviceRecommendations' | 'profitabilityEstimation' | 'status'>): Promise<Proposal> {
    // Simulate AI Generator logic
    const budgetVal = parseFloat(proposalData.budget.replace(/[^0-9.]/g, '')) || 3000;
    const pricingRecommendations = `Retainer of $${budgetVal} / month. High margin services include automated SEO auditing. Upsell recommended: Brand Voice Guidelines ($2,500 one-time).`;
    const upsellRecommendations = `Recommend adding an onboarding creative asset package ($2,000 flat) and a Klaviyo newsletter setup ($1,500).`;
    const serviceRecommendations = [...proposalData.servicesRequired, 'Dynamic Landing Page Optimization'];
    const profitabilityEstimation = `Estimated team delivery costs: $${Math.floor(budgetVal * 0.45)} / month. Projected Gross Profit Margin: 55%.`;

    const sections: ProposalSection[] = [
      {
        title: 'Executive Summary',
        content: `AgencyOS AI has evaluated ${proposalData.clientName}'s current digital presence. Our target goals include: "${proposalData.goals}". Over the ${proposalData.timeline} timeframe, we will deploy unified optimization tracks to hit these benchmarks.`
      },
      {
        title: 'Business Challenges',
        content: `Understanding ${proposalData.clientName}'s target audience indicates current search authority gap. Low conversion rates on standard product categories limit organic and paid returns.`
      },
      {
        title: 'Proposed Solution',
        content: `We propose launching the following operational scopes: ${proposalData.servicesRequired.join(', ')}. By setting up targeted customer review channels and landing page layouts, we expect to scale conversions.`
      },
      {
        title: 'Deliverables & Retainer Pricing',
        content: `• Retainer Services: ${proposalData.servicesRequired.join(' & ')} - total of ${proposalData.budget}\n• Timeline Commitment: ${proposalData.timeline}\n• Payment terms: Invoiced monthly on 1st, Net 15.`
      },
      {
        title: 'Terms & Conditions',
        content: 'Services will require data and access sharing within 7 days of signature. Either party may cancel the monthly retainer with a written 30-day notice.'
      }
    ];

    const newProposal: Proposal = {
      ...proposalData,
      id: `prop_${Math.random().toString(36).substr(2, 9)}`,
      sections,
      pricingRecommendations,
      upsellRecommendations,
      serviceRecommendations,
      profitabilityEstimation,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.proposals.push(newProposal);
    this.saveToStorage('proposals', this.proposals);
    return newProposal;
  }

  async updateProposal(updatedProposal: Proposal): Promise<Proposal | undefined> {
    const idx = this.proposals.findIndex(p => p.id === updatedProposal.id);
    if (idx === -1) return undefined;
    this.proposals[idx] = { ...updatedProposal, updatedAt: new Date().toISOString() };
    this.saveToStorage('proposals', this.proposals);
    return this.proposals[idx];
  }

  async updateProposalStatus(id: string, status: 'draft' | 'sent' | 'approved' | 'rejected'): Promise<Proposal | undefined> {
    const proposal = this.proposals.find(p => p.id === id);
    if (!proposal) return undefined;
    proposal.status = status;
    proposal.updatedAt = new Date().toISOString();
    
    if (status === 'approved') {
      // Trigger Automation: Create project, milestones, tasks, and assign team members automatically!
      const newProjectId = `p_${Math.random().toString(36).substr(2, 9)}`;
      const newProject: Project = {
        id: newProjectId,
        clientId: proposal.clientId || 'c1', // Fallback to client 1
        clientName: proposal.clientName,
        name: `Campaign: ${proposal.servicesRequired[0] || 'Web Marketing'}`,
        status: 'active',
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.projects.push(newProject);
      this.saveToStorage('projects', this.projects);

      // Create AI-generated tasks
      const newTasks: Task[] = [
        {
          id: `t_${Math.random().toString(36).substr(2, 9)}`,
          projectId: newProjectId,
          projectName: newProject.name,
          title: 'Conduct initial market positioning sync',
          description: `Align brand goals: "${proposal.goals}" with targeted competitor list.`,
          status: 'todo',
          priority: 'medium',
          assigneeId: 'u3',
          assigneeName: 'Sophia Loren',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          delayPrediction: 'On track.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `t_${Math.random().toString(36).substr(2, 9)}`,
          projectId: newProjectId,
          projectName: newProject.name,
          title: 'Establish paid search campaign groups',
          description: `Construct negative lists and set search parameters as defined in proposal solution. Budget scope: ${proposal.budget}.`,
          status: 'todo',
          priority: 'high',
          assigneeId: 'u2',
          assigneeName: 'Liam Neeson',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          delayPrediction: 'On track.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      this.tasks.push(...newTasks);
      this.saveToStorage('tasks', this.tasks);

      await this.createNotification(
        'Proposal Approved - Project Created',
        `Proposal for "${proposal.clientName}" approved. Created project "${newProject.name}" and initialized tasks.`
      );
    }

    this.saveToStorage('proposals', this.proposals);
    return proposal;
  }

  // Strategies
  async getStrategies(): Promise<Strategy[]> {
    return [...this.strategies];
  }

  async createStrategy(strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Strategy> {
    const newStrategy: Strategy = {
      ...strategy,
      id: `strat_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.strategies.push(newStrategy);
    this.saveToStorage('strategies', this.strategies);
    return newStrategy;
  }

  // Reports
  async getReports(): Promise<Report[]> {
    return [...this.reports];
  }

  async createReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    const newReport: Report = {
      ...report,
      id: `rep_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reports.push(newReport);
    this.saveToStorage('reports', this.reports);
    return newReport;
  }

  // Comments
  async getComments(entityType: 'task' | 'project' | 'proposal' | 'client', entityId: string): Promise<Comment[]> {
    return this.comments.filter(c => c.entityType === entityType && c.entityId === entityId);
  }

  async createComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'userId' | 'userName' | 'userAvatar'>): Promise<Comment> {
    const newComment: Comment = {
      ...commentData,
      id: `com_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'u1', // Default as the active user (Emma Stone, owner)
      userName: 'Emma Stone',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date().toISOString()
    };
    this.comments.push(newComment);
    this.saveToStorage('comments', this.comments);
    return newComment;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return [...this.notifications];
  }

  async createNotification(title: string, description: string): Promise<Notification> {
    const newNotif: Notification = {
      id: `n_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.saveToStorage('notifications', this.notifications);
    return newNotif;
  }

  async markAllNotificationsAsRead(): Promise<void> {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage('notifications', this.notifications);
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return [...this.invoices];
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    return this.invoices.find(i => i.id === id);
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.invoices.push(newInvoice);
    this.saveToStorage('invoices', this.invoices);
    return newInvoice;
  }

  async updateInvoice(updatedInvoice: Invoice): Promise<Invoice | undefined> {
    const idx = this.invoices.findIndex(i => i.id === updatedInvoice.id);
    if (idx === -1) return undefined;
    this.invoices[idx] = { ...updatedInvoice, updatedAt: new Date().toISOString() };
    this.saveToStorage('invoices', this.invoices);
    return this.invoices[idx];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const startLen = this.invoices.length;
    this.invoices = this.invoices.filter(i => i.id !== id);
    this.saveToStorage('invoices', this.invoices);
    return this.invoices.length < startLen;
  }

  // AI Assistant Conversations
  async getConversations(): Promise<AIConversation[]> {
    return [...this.conversations];
  }

  async addMessageToConversation(convId: string, content: string): Promise<{ userMsg: Message; aiMsg: Message }> {
    const conv = this.conversations.find(c => c.id === convId);
    if (!conv) {
      throw new Error('Conversation not found');
    }

    const userMsg: Message = {
      id: `m_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };
    conv.messages.push(userMsg);

    // AI thinking/generating delay simulation
    let aiResponseText = `I processed your request, but I didn't recognize a specific command. You can ask me to:
- "Show leads likely to convert"
- "Generate proposal for [Company]"
- "Create SEO strategy for [Client]"
- "Show delayed projects"
- "Generate monthly report"`;

    const normalizedContent = content.toLowerCase();    if (normalizedContent.includes('lead') || normalizedContent.includes('convert')) {
      const sortedLeads = [...this.leads].sort((a, b) => b.score - a.score);
      if (sortedLeads.length === 0) {
        aiResponseText = "There are no leads currently registered in the database. Add some leads via the CRM pipeline to get AI predictions!";
      } else {
        aiResponseText = `Based on our lead scoring models, here are your top leads sorted by conversion probability:
      
1. **${sortedLeads[0].companyName}** (${sortedLeads[0].name}) - Score: **${sortedLeads[0].score}**, Probability: **${sortedLeads[0].conversionProbability}%** (Suggested Pitch: ${sortedLeads[0].suggestedServices.join(', ')})
${sortedLeads[1] ? `2. **${sortedLeads[1].companyName}** (${sortedLeads[1].name}) - Score: **${sortedLeads[1].score}**, Probability: **${sortedLeads[1].conversionProbability}%**` : ''}

*Action suggestion:* Click the "Move Stage" button in CRM and transition ${sortedLeads[0].companyName} to 'Proposal Sent'. I've drafted a follow-up template for you in their profile.`;
      }
    } 
    else if (normalizedContent.includes('proposal') || normalizedContent.includes('generate')) {
      const firstLead = this.leads[0];
      if (!firstLead) {
        aiResponseText = "To generate a proposal, please make sure you have at least one lead in the CRM pipeline.";
      } else {
        aiResponseText = `I have initialized a new Proposal Draft for **${firstLead.companyName}**.
      
- **Recommended Retainer**: $4,500 / month
- **Gross Profit Margin**: 55%
- **Status**: Draft created.

*Action suggestion:* Go to the **CRM** section, open **${firstLead.companyName}**, and click **View Proposal** to review and send the generated document.`;
      }
    } 
    else if (normalizedContent.includes('seo strategy') || normalizedContent.includes('strategy')) {
      const firstClient = this.clients[0];
      if (!firstClient) {
        aiResponseText = "No clients found. Please add or convert a lead to a client first to build an SEO strategy.";
      } else {
        aiResponseText = `I've compiled an **SEO Growth Blueprint** for **${firstClient.companyName}**.

**Core Keywords to Capture:**
- *high-intent search terms* tailored to ${firstClient.industry}
- *comparison page keywords*

**Technical Recommendations:**
- Optimize page speed performance indicators.
- Create canonical SEO page structures.

*Action suggestion:* Navigate to **Clients** -> **${firstClient.companyName}** -> **Strategies** to view the full roadmap.`;
      }
    } 
    else if (normalizedContent.includes('delayed') || normalizedContent.includes('project')) {
      const delayed = this.projects.filter(p => p.status === 'delayed');
      if (delayed.length === 0) {
        aiResponseText = "Outstanding! All current client projects are currently on track and meeting milestones.";
      } else {
        aiResponseText = `I detected **${delayed.length} delayed project(s)**:

1. **${delayed[0].name}** (Client: ${delayed[0].clientName})
   - *AI Delay Prediction:* Project milestone delay predicted. Review assignee workload.

*Action suggestion:* Go to **Projects** -> **List View** to filter delayed tasks and coordinate with the team assignee.`;
      }
    }
    else if (normalizedContent.includes('report') || normalizedContent.includes('monthly')) {
      if (this.reports.length === 0) {
        aiResponseText = "No reports generated yet. Create a report in the Reports dashboard tab to get started!";
      } else {
        aiResponseText = `I've compiled the monthly performance reports:

${this.reports.map((r, i) => `${i + 1}. **${r.title}** for ${r.clientName} (${r.type.toUpperCase()})`).join('\n')}

*Action suggestion:* Navigate to **Reports** to view metrics and export summaries.`;
      }
    }
    else if (normalizedContent.includes('growth potential') || normalizedContent.includes('potential')) {
      const firstClient = this.clients[0];
      if (!firstClient) {
        aiResponseText = "Please register active clients in the database to run growth capability analysis.";
      } else {
        aiResponseText = `Based on organic performance analytics, **${firstClient.companyName}** shows high immediate growth potential. 

We recommend implementing localized comparison listings and page speed optimizations to grow organic inbound queries next month.`;
      }
    }

    const aiMsg: Message = {
      id: `m_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponseText,
      createdAt: new Date().toISOString()
    };
    conv.messages.push(aiMsg);

    this.saveToStorage('conversations', this.conversations);
    return { userMsg, aiMsg };
  }
}

export const mockDb = new MockDatabase();
export default mockDb;
