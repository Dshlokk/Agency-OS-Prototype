import { Lead, Client, Project, Task, Proposal, Strategy, Report, Comment, Notification, User, PipelineStage, TaskStatus, TaskPriority, AIConversation, Message, OnboardingChecklistItem, ProposalSection } from '../types/db';

// Simple helper to check if window is available
const isClient = typeof window !== 'undefined';

// Initial Dummy Data
const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Emma Stone', email: 'emma@agencyos.ai', role: 'owner', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', productivityScore: 94, resourceUtilization: 85 },
  { id: 'u2', name: 'Liam Neeson', email: 'liam@agencyos.ai', role: 'team-member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', productivityScore: 88, resourceUtilization: 90 },
  { id: 'u3', name: 'Sophia Loren', email: 'sophia@agencyos.ai', role: 'team-member', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', productivityScore: 92, resourceUtilization: 72 },
  { id: 'u4', name: 'Alice Vance', email: 'alice@quantumtech.io', role: 'client', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: 'u5', name: 'Marcus Brody', email: 'marcus@zenith.com', role: 'client', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'John Doe',
    companyName: 'Acme Corp',
    email: 'john@acmecorp.com',
    phone: '+1 (555) 123-4567',
    website: 'acmecorp.com',
    industry: 'SaaS',
    revenueRange: '$1M - $5M',
    socialLinks: { linkedin: 'https://linkedin.com/company/acmecorp', instagram: 'https://instagram.com/acme' },
    leadSource: 'Google Search',
    notes: 'Looking for a comprehensive SEO overhaul and Google Ads management. Frustrated with high CPC and low conversion rates on their current landing pages.',
    stage: 'proposal-sent',
    score: 85,
    quality: 'High',
    conversionProbability: 75,
    suggestedServices: ['Technical SEO Audit', 'SEO Campaign (6 mo)', 'Google Ads Management'],
    suggestedFollowUp: 'Send proposal revision with adjusted budget options by Friday.',
    generatedMessage: `Hi John,

I hope you're having a great week.

Following up on our discovery call, I've prepared our comprehensive SEO and Ads growth proposal for Acme Corp. It targets reducing your CPC by 22% through refined ad mapping while scaling organic search authority.

Please let me know your thoughts on the milestones. We can kick off as early as next Tuesday.

Best,
Emma`,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'l2',
    name: 'Jane Smith',
    companyName: 'Stellar Bakery',
    email: 'jane@stellarbakery.com',
    phone: '+1 (555) 987-6543',
    website: 'stellarbakery.com',
    industry: 'Food & Retail',
    revenueRange: '$100k - $500k',
    socialLinks: { instagram: 'https://instagram.com/stellarbakery', facebook: 'https://facebook.com/stellarbakery' },
    leadSource: 'Instagram',
    notes: 'Local bakery wanting to expand into nationwide e-commerce shipping. Needs social media branding, content calendar creation, and Shopify store optimization.',
    stage: 'discovery',
    score: 48,
    quality: 'Medium',
    conversionProbability: 40,
    suggestedServices: ['Social Media Branding', 'Shopify Design & CRO', 'Email Marketing Setup'],
    suggestedFollowUp: 'Schedule a 15-minute call to discuss national shipping logistics.',
    generatedMessage: `Hi Jane,

I love the brand you've built with Stellar Bakery! The engagement on your Instagram reels is fantastic.

For scaling into national shipping, a key lever will be optimizing your Shopify checkout conversion rate and running hyper-local social ads to test ship-friendly locations.

I've put together a few content pillars for your national launch. Let me know when you're free for a quick sync!

Warmly,
Emma`,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'l3',
    name: 'Robert Johnson',
    companyName: 'Delta Health Group',
    email: 'r.johnson@deltahealth.com',
    phone: '+1 (555) 333-8888',
    website: 'deltahealthgroup.com',
    industry: 'Healthcare',
    revenueRange: '$5M - $10M',
    socialLinks: { linkedin: 'https://linkedin.com/company/deltahealth' },
    leadSource: 'LinkedIn Referral',
    notes: 'Large healthcare provider needing HIPAA-compliant lead generation campaigns and local SEO for 5 new clinics. Decent budget but long corporate approval loop.',
    stage: 'negotiation',
    score: 92,
    quality: 'High',
    conversionProbability: 88,
    suggestedServices: ['Local SEO Optimization', 'HIPAA-Compliant Lead Funnel', 'Reputation Management'],
    suggestedFollowUp: 'Address the legal team\'s concerns regarding data tracking in the paid ad funnel.',
    generatedMessage: `Hi Robert,

Thank you for coordinating the call with your legal team yesterday.

To confirm, all funnel interfaces and data collection forms we implement will use end-to-end encryption and sync directly with your HIPAA-compliant CRM (Salesforce Health Cloud) without storing sensitive health data in intermediary databases.

I've updated section 8 of the agreement to reflect these security compliance measures. Looking forward to your approval.

Best regards,
Emma`,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Alice Vance',
    companyName: 'Quantum Tech',
    email: 'alice@quantumtech.io',
    phone: '+1 (555) 234-5678',
    website: 'quantumtech.io',
    industry: 'B2B SaaS',
    revenueRange: '$3M - $8M',
    socialLinks: { linkedin: 'https://linkedin.com/company/quantumtech' },
    businessDescription: 'Quantum Tech provides cloud infrastructure monitoring software for developer-first companies. They want to drive trial signups via SEO, developer documentation optimization, and developer-targeted paid search ads.',
    onboardingChecklist: [
      { id: 'ob1', task: 'Kickoff call completed', completed: true },
      { id: 'ob2', task: 'Google Analytics & GSC access shared', completed: true },
      { id: 'ob3', task: 'Brand guidelines & logo assets uploaded', completed: true },
      { id: 'ob4', task: 'Target developer persona workshop', completed: false },
      { id: 'ob5', task: 'Set up reporting dashboard templates', completed: false }
    ],
    websiteAudit: {
      seoScore: 78,
      speedScore: 62,
      mobileScore: 85,
      uxScore: 70,
      conversionScore: 55,
      contentScore: 80,
      details: 'Slow page load times on core landing pages (First Contentful Paint > 2.8s) due to heavy unoptimized script assets. Good structural HTML hierarchy, but lacking relevant semantic links and schema markup on product docs.'
    },
    socialAudit: {
      frequency: '2 posts per month',
      engagementRate: 0.8,
      growthRate: 1.2,
      consistency: 'Low',
      details: 'LinkedIn channel is highly under-utilized. Brand voice is overly dry and corporate; could benefit from developer memes, tech-tip posts, and open-source contributions highlight.'
    },
    competitorAudit: {
      competitors: ['Datadog', 'LogRocket', 'Dynatrace'],
      positioning: 'Quantum Tech positions itself as the simple, lightweight alternative to enterprise bloat, yet their marketing feels heavy and enterprise-focused.',
      opportunities: 'Create product comparison pages (e.g., "Quantum Tech vs Datadog") targeting high-intent search terms.'
    },
    deliverables: {
      swot: {
        strengths: ['Highly technical product with strong dev satisfaction', 'Clean, modern UI/UX in-app', 'Low churn rate for existing customers'],
        weaknesses: ['Low organic web traffic', 'Long onboarding cycle', 'Poor search engine rankings for core terms'],
        opportunities: ['SEO comparison pages targeting competitors', 'Developer advocacy program on Twitter/GitHub', 'Targeted interactive calculator tool for pricing transparency'],
        threats: ['Aggressive budget spend by enterprise competitors', 'Feature replication by larger platforms']
      },
      growthOpportunities: [
        'Build and rank comparison hubs targeting high-intent developer keywords.',
        'Implement an interactive API Latency Calculator tool to capture organic leads.',
        'Run targeted cold developer-relations outreach and retargeting ads.'
      ],
      recommendedServices: ['Technical & Content SEO Retainer', 'Developer Product Marketing', 'LinkedIn Thought Leadership'],
      strategicRoadmap: [
        'Month 1: Technical website fixes & speed optimization.',
        'Month 2: Content production for 5 competitor comparison pages.',
        'Month 3: Launch interactive pricing and latency calculator.',
        'Month 4: Scale retargeting campaigns on LinkedIn & Twitter.'
      ]
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c2',
    name: 'Marcus Brody',
    companyName: 'Zenith Apparel',
    email: 'marcus@zenith.com',
    phone: '+1 (555) 777-6666',
    website: 'zenithapparel.com',
    industry: 'E-commerce',
    revenueRange: '$1M - $3M',
    socialLinks: { instagram: 'https://instagram.com/zenithapparel', facebook: 'https://facebook.com/zenithapparel' },
    businessDescription: 'Zenith Apparel sells sustainable, eco-friendly luxury activewear. They want to scale e-commerce sales using Meta ads, TikTok organic campaigns, and newsletter marketing.',
    onboardingChecklist: [
      { id: 'ob6', task: 'Kickoff call completed', completed: true },
      { id: 'ob7', task: 'Shopify partner store access granted', completed: true },
      { id: 'ob8', task: 'Meta Pixel & TikTok Pixel setup verified', completed: true },
      { id: 'ob9', task: 'Access to creative brand folders shared', completed: true },
      { id: 'ob10', task: 'Set up ad account budgets', completed: true }
    ],
    websiteAudit: {
      seoScore: 68,
      speedScore: 82,
      mobileScore: 94,
      uxScore: 88,
      conversionScore: 64,
      contentScore: 50,
      details: 'Excellent mobile UX and site speeds. However, the store lacks basic e-commerce SEO (meta descriptions on product collections, alt text on images) and has high checkout abandonment.'
    },
    socialAudit: {
      frequency: '5 posts per week',
      engagementRate: 3.8,
      growthRate: 8.5,
      consistency: 'High',
      details: 'Strong, visually stunning Instagram presence. Highly active, but lacks a structured marketing funnel (too many random posts, not enough clear calls to action or product linking).'
    },
    competitorAudit: {
      competitors: ['Girlfriend Collective', 'Outdoor Voices', 'Lululemon'],
      positioning: 'Zenith stands out for its extreme dedication to zero-waste packaging and 100% recycled nylon, but this message is buried on their product pages.',
      opportunities: 'Launch a campaign called "Active for the Planet" highlighting the exact recycled bottle count per leggings pair.'
    },
    deliverables: {
      swot: {
        strengths: ['Highly visual product with strong aesthetic appeal', 'Eco-friendly and sustainable unique selling proposition', 'High repeat customer rate'],
        weaknesses: ['Poor organic search rankings', 'High dependency on paid ads', 'No email lifecycle marketing'],
        opportunities: ['Automated cart abandonment email flows', 'User-generated content (UGC) campaign on TikTok', 'SEO-driven sustainable lifestyle blog'],
        threats: ['Fast-fashion copycats offering cheap alternatives', 'Rising customer acquisition costs (CAC) on Meta']
      },
      growthOpportunities: [
        'Set up automated Klaviyo email flows (Welcome Series, Cart Abandonment, Post-Purchase).',
        'Partner with micro-influencers on TikTok for high-volume UGC content.',
        'Write collection-specific SEO content to capture "sustainable gym wear" searches.'
      ],
      recommendedServices: ['Meta & TikTok Paid Ads Management', 'Klaviyo Email Marketing Setup', 'SEO Content Retainer'],
      strategicRoadmap: [
        'Month 1: Klaviyo flow setup & Pixel audit.',
        'Month 2: Launch Meta ad creatives (UGC focus) & influencer onboarding.',
        'Month 3: Shopify conversion rate audit & theme optimization.',
        'Month 4: Launch TikTok Shop integration and campaigns.'
      ]
    },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    clientId: 'c1',
    clientName: 'Quantum Tech',
    name: 'Technical SEO & Content Hub',
    status: 'active',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p2',
    clientId: 'c2',
    clientName: 'Zenith Apparel',
    name: 'Meta Ads Scale & Klaviyo Flow Setup',
    status: 'active',
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p3',
    clientId: 'c1',
    clientName: 'Quantum Tech',
    name: 'Competitor Comparison Hub Design',
    status: 'delayed',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Past due
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    projectName: 'Technical SEO & Content Hub',
    title: 'Fix website speed & optimize asset payloads',
    description: 'Compress heavy images in the asset folder, defer non-critical Javascript, and configure service worker caching to bring mobile FCP down to < 1.8s.',
    status: 'in-progress',
    priority: 'high',
    assigneeId: 'u2',
    assigneeName: 'Liam Neeson',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    delayPrediction: 'No delay predicted. Liam is on track based on historical commit cycles.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 't2',
    projectId: 'p1',
    projectName: 'Technical SEO & Content Hub',
    title: 'Conduct semantic keyword research for dev persona',
    description: 'Identify developer-intent search queries targeting light-weight APM, cloud logging cost optimization, and developer infrastructure monitoring tools.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'u3',
    assigneeName: 'Sophia Loren',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't3',
    projectId: 'p2',
    projectName: 'Meta Ads Scale & Klaviyo Flow Setup',
    title: 'Design and deploy Klaviyo Cart Abandonment flow',
    description: 'Set up a high-converting, 3-step dynamic cart abandonment sequence featuring customer reviews, sustainability badges, and a 10% coupon code trigger.',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u3',
    assigneeName: 'Sophia Loren',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    delayPrediction: 'Potential 2-day delay: Sophia currently has 4 other active tasks due this week.',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 't4',
    projectId: 'p3',
    projectName: 'Competitor Comparison Hub Design',
    title: 'Review landing page copy with client',
    description: 'Walk through Quantum Tech vs Datadog page draft with Alice. Need final approval on product feature assertions before going to design.',
    status: 'review',
    priority: 'urgent',
    assigneeId: 'u1',
    assigneeName: 'Emma Stone',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    delayPrediction: 'Critical Delay: Client feedback is overdue by 3 days. Automated email reminder sent.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 't5',
    projectId: 'p2',
    projectName: 'Meta Ads Scale & Klaviyo Flow Setup',
    title: 'Write ad copy for sustainable activewear campaign',
    description: 'Write 3 different ad copy angles (Eco-friendly luxury, high-performance athletic, durability focus) with varying headlines for meta creatives.',
    status: 'done',
    priority: 'medium',
    assigneeId: 'u1',
    assigneeName: 'Emma Stone',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_PROPOSALS: Proposal[] = [
  {
    id: 'prop1',
    leadId: 'l1',
    clientName: 'Acme Corp',
    goals: 'Reduce Google Ads CPA by 25% and increase organic traffic by 40% over 6 months.',
    servicesRequired: ['SEO Campaign Retainer', 'Google Ads Funnel Audit & Setup'],
    budget: '$5,000 / month',
    timeline: '6 Months',
    pricingRecommendations: 'Retainer of $4,500/mo (SEO + Ads) + 10% of ad spend. Upsell opportunities identified: Landing Page Optimization package ($3,000 flat).',
    upsellRecommendations: 'Add dynamic landing page testing package ($3,000 one-time) to boost paid traffic ROI.',
    serviceRecommendations: ['Technical SEO Audit', 'SEO Campaign Retainer', 'Google Ads Setup', 'CRO Pack'],
    profitabilityEstimation: 'Estimated cost of delivery: $2,100/mo. Gross margin: 53%. Direct net margin high due to automated reporting setups.',
    status: 'sent',
    sections: [
      {
        title: 'Executive Summary',
        content: 'Acme Corp is positioned to capture high organic search volume for cloud monitoring services. By aligning strategic technical SEO with optimized Google Search ad configurations, we will drive high-intent visitors and slash acquisition costs.'
      },
      {
        title: 'Business Challenges',
        content: 'Current high CPC ($12.50 average) on broad search queries resulting in low-quality leads and poor conversion rates. Brand lacks visibility on crucial developer comparative queries.'
      },
      {
        title: 'Proposed Solution',
        content: '1. Build specific competitor comparison hubs to win high-intent search traffic.\n2. Overhaul paid search ad groups using negative keyword mapping and exact match setups.\n3. Implement conversion-centered design improvements on core landing pages.'
      },
      {
        title: 'Deliverables & Pricing',
        content: '• Technical SEO Retainer: $2,500 / month\n• Paid Search Ad Management: $2,000 / month (or 10% of spend, whichever is greater)\n• Optional Addon: CRO Landing Page Setup: $3,000 (one-time fee)'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_STRATEGIES: Strategy[] = [
  {
    id: 'strat1',
    clientId: 'c1',
    clientName: 'Quantum Tech',
    type: 'seo',
    title: 'Developer SEO Growth Blueprint',
    content: {
      overview: 'Strategic organic SEO roadmap targeting developer-intent and competitor-specific search keywords.',
      details: {
        keywordOpportunities: [
          { keyword: 'lightweight app monitoring', volume: 1800, difficulty: 'Medium', priority: 'High' },
          { keyword: 'datadog pricing alternative', volume: 3400, difficulty: 'High', priority: 'High' },
          { keyword: 'how to track cloud container latency', volume: 950, difficulty: 'Low', priority: 'Medium' }
        ],
        contentRoadmap: [
          'Page 1: "Quantum Tech vs Datadog: The APM Comparison You Need"',
          'Page 2: "Step-by-Step Guide: Optimizing Kubernetes Latency Overhead"',
          'Page 3: "5 Open Source Infrastructure Monitoring Solutions vs Quantum"'
        ],
        technicalImprovements: [
          'Decompress web asset payload size (currently 5.4MB) to improve Core Web Vitals.',
          'Inject structured product schema JSON-LD on all comparison endpoints.',
          'Resolve canonical loop redirect issues on documentation subdomains.'
        ]
      },
      roadmap: [
        'Week 1: Address top 3 site speed script blocks.',
        'Week 3: Draft and review Datadog comparison hub copywriting.',
        'Week 6: Launch first 2 container monitoring educational blogs.',
        'Week 8: Conduct first backlink outreach program.'
      ]
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_REPORTS: Report[] = [
  {
    id: 'rep1',
    clientId: 'c1',
    clientName: 'Quantum Tech',
    type: 'seo',
    title: 'Organic Search Performance Report',
    data: {
      metrics: [
        { label: 'Organic Traffic', value: '14,820', change: '+24.5%', isPositive: true },
        { label: 'Avg Position', value: '14.2', change: '-3.1 ranks', isPositive: true },
        { label: 'Lead Conversions', value: '284', change: '+12.8%', isPositive: true },
        { label: 'Domain Authority', value: '42', change: '+2', isPositive: true }
      ],
      chartData: [
        { name: 'Jan', traffic: 8200, conversions: 180 },
        { name: 'Feb', traffic: 9800, conversions: 210 },
        { name: 'Mar', traffic: 11400, conversions: 230 },
        { name: 'Apr', traffic: 12100, conversions: 242 },
        { name: 'May', traffic: 13500, conversions: 260 },
        { name: 'Jun', traffic: 14820, conversions: 284 }
      ]
    },
    executiveSummary: 'Quantum Tech saw strong organic search growth in June, fueled by the competitor comparison pages ranking for Datadog alternative searches. Technical performance optimization also reduced mobile page bounce rates by 12%.',
    insights: [
      'The Datadog comparison page accounts for 32% of all organic conversion completions this month.',
      'Google mobile ranking queries rose by 14% following the FCP speed enhancements.'
    ],
    opportunities: [
      'Write targeted comparison content for Dynatrace and LogRocket to duplicate this success.',
      'Build out additional developer cheat sheets to capture low-difficulty search keywords.'
    ],
    nextSteps: [
      'Begin copydrafting the Dynatrace comparison layout.',
      'Initiate backlinks campaign for the newly launched latency tool.'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'rep2',
    clientId: 'c2',
    clientName: 'Zenith Apparel',
    type: 'paid',
    title: 'Meta Ads Conversion Performance',
    data: {
      metrics: [
        { label: 'ROAS', value: '3.42x', change: '+18.2%', isPositive: true },
        { label: 'Total Purchase Value', value: '$48,220', change: '+32.4%', isPositive: true },
        { label: 'Avg CTR', value: '2.14%', change: '+0.45%', isPositive: true },
        { label: 'Cost Per Purchase', value: '$18.40', change: '-12.5%', isPositive: true }
      ],
      chartData: [
        { name: 'Week 1', adSpend: 3200, sales: 8800 },
        { name: 'Week 2', adSpend: 3500, sales: 11200 },
        { name: 'Week 3', adSpend: 3800, sales: 13100 },
        { name: 'Week 4', adSpend: 4000, sales: 15120 }
      ]
    },
    executiveSummary: 'Paid ad scaling has exceeded expectations with ROAS hitting 3.42x. UGC creatives featuring our zero-waste packaging yielded the highest engagement rates and lowered CPA significantly.',
    insights: [
      'Video ad creatives highlighting green shipping practices convert 44% higher than model-only studio images.',
      'Audience retargeting ad sets targeting checkout abandoners yielded a 5.8x ROAS.'
    ],
    opportunities: [
      'Create 3 new hook variations for the zero-waste video packaging creatives.',
      'Set up a custom audience targeting high-value repeat buyers (2+ purchases) with exclusive pre-releases.'
    ],
    nextSteps: [
      'Brief creator network on recording UGC hooks focusing on zero-waste.',
      'Launch Zenith VIP retargeting ad set.'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_COMMENTS: Comment[] = [
  { id: 'com1', entityType: 'task', entityId: 't4', userId: 'u1', userName: 'Emma Stone', content: 'Hey @Alice Vance, just wanted to ping you here. Let me know if you had any questions on the product comparison angles. We would love to publish this next week.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'com2', entityType: 'task', entityId: 't4', userId: 'u4', userName: 'Alice Vance', content: 'Hi Emma! Overall looks good. One detail: under datadog pricing comparison, please specify that their custom metrics model has added costs. Our legal team wants to make sure we make a clear distinction.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New Lead Generated', description: 'Acme Corp has completed the initial CRM intake form. AI score: 85/100.', read: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n2', title: 'Task Delayed Warning', description: 'Task "Review landing page copy" is delayed. AI predicted impact: 4-day delay on project milestone.', read: false, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const DEFAULT_CONVERSATIONS: AIConversation[] = [
  {
    id: 'conv1',
    messages: [
      { id: 'm1', role: 'assistant', content: 'Hello! I am AgencyOS AI. How can I help you manage your agency operations today?', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  }
];

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

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (isClient) {
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

    const normalizedContent = content.toLowerCase();
    
    if (normalizedContent.includes('lead') || normalizedContent.includes('convert')) {
      const sortedLeads = [...this.leads].sort((a, b) => b.score - a.score);
      aiResponseText = `Based on our lead scoring models, here are your top leads sorted by conversion probability:
      
1. **${sortedLeads[0]?.companyName || 'Lead A'}** (${sortedLeads[0]?.name || ''}) - Score: **${sortedLeads[0]?.score || 0}**, Probability: **${sortedLeads[0]?.conversionProbability || 0}%** (Suggested Pitch: ${sortedLeads[0]?.suggestedServices.join(', ') || ''})
2. **${sortedLeads[1]?.companyName || 'Lead B'}** (${sortedLeads[1]?.name || ''}) - Score: **${sortedLeads[1]?.score || 0}**, Probability: **${sortedLeads[1]?.conversionProbability || 0}%**

*Action suggestion:* Click the "Move Stage" button in CRM and transition ${sortedLeads[0]?.companyName || 'them'} to 'Proposal Sent'. I've drafted a follow-up template for you in their profile.`;
    } 
    else if (normalizedContent.includes('proposal') || normalizedContent.includes('generate')) {
      aiResponseText = `I have initialized a new Proposal Draft for Acme Corp.
      
- **Recommended Retainer**: $4,500 / month
- **Gross Profit Margin**: 55%
- **Upsell Recommendation**: Included CRO landing pages add-on ($3,000 one-time)
- **Status**: Draft created.

*Action suggestion:* Go to the **CRM** section, open **Acme Corp**, and click **View Proposal** to review and send the generated PDF document.`;
    } 
    else if (normalizedContent.includes('seo strategy') || normalizedContent.includes('strategy')) {
      aiResponseText = `I've compiled a **Developer SEO Growth Blueprint** for Quantum Tech.

**Core Keywords to Capture:**
- *datadog pricing alternative* (3.4k monthly searches, High intent)
- *lightweight app monitoring* (1.8k monthly searches, Med intent)

**Technical Recommendations:**
- Optimize image assets payload (FCP takes >2.8s)
- Create canonical and product comparison endpoints.

*Action suggestion:* Navigate to **Clients** -> **Quantum Tech** -> **Strategies** to view the full roadmap.`;
    } 
    else if (normalizedContent.includes('delayed') || normalizedContent.includes('project')) {
      const delayed = this.projects.filter(p => p.status === 'delayed');
      aiResponseText = `I detected **${delayed.length} delayed project(s)**:

1. **${delayed[0]?.name || 'Competitor Comparison Hub Design'}** (Client: ${delayed[0]?.clientName || 'Quantum Tech'})
   - *AI Delay Prediction:* Critical Delay. Client assets feedback is overdue by 3 days. Emma Stone has sent automated follow-up messages.

*Action suggestion:* Go to **Projects** -> **List View** to filter delayed tasks and ping Emma Stone or send a portal nudge to Alice Vance.`;
    }
    else if (normalizedContent.includes('report') || normalizedContent.includes('monthly')) {
      aiResponseText = `I've compiled the monthly performance reports:

- **SEO organic rankings** for Quantum Tech grew by **24.5%** in traffic (conversions: +12.8%).
- **Meta Ads ROAS** for Zenith Apparel hit **3.42x** ($48k purchase value generated).

*Action suggestion:* Navigate to **Reports** to view dashboard metrics. You can export these reports directly as a PDF.`;
    }
    else if (normalizedContent.includes('growth potential') || normalizedContent.includes('potential')) {
      aiResponseText = `Based on organic performance analytics, **Quantum Tech** shows the highest immediate growth potential. 

By scaling comparison layout campaigns (converting at a high 12.8% benchmark) and optimizing site speeds, we can expect organic inbound leads to grow by **35%** next month.`;
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
