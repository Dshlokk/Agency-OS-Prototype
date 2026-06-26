export type UserRole = 'super-admin' | 'owner' | 'team-member' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  productivityScore?: number; // 0-100
  resourceUtilization?: number; // 0-100 (percentage)
}

export type PipelineStage = 'new' | 'discovery' | 'proposal-sent' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  revenueRange: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  leadSource: string;
  notes: string;
  stage: PipelineStage;
  score: number; // 0-100
  quality: 'High' | 'Medium' | 'Low';
  conversionProbability: number; // 0-100 (percentage)
  suggestedServices: string[];
  suggestedFollowUp: string;
  generatedMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  revenueRange: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  businessDescription: string;
  onboardingChecklist: OnboardingChecklistItem[];
  createdAt: string;
  updatedAt: string;
  // Audit Results
  websiteAudit?: {
    seoScore: number;
    speedScore: number;
    mobileScore: number;
    uxScore: number;
    conversionScore: number;
    contentScore: number;
    details: string;
  };
  socialAudit?: {
    frequency: string;
    engagementRate: number; // percentage
    growthRate: number; // percentage
    consistency: 'High' | 'Medium' | 'Low';
    details: string;
  };
  competitorAudit?: {
    competitors: string[];
    positioning: string;
    opportunities: string;
  };
  deliverables?: {
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    growthOpportunities: string[];
    recommendedServices: string[];
    strategicRoadmap: string[];
  };
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  status: 'planning' | 'active' | 'delayed' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  delayPrediction?: string; // AI generated
  createdAt: string;
  updatedAt: string;
}

export interface ProposalSection {
  title: string;
  content: string;
}

export interface Proposal {
  id: string;
  leadId?: string;
  clientId?: string;
  clientName: string;
  goals: string;
  servicesRequired: string[];
  budget: string;
  timeline: string;
  sections: ProposalSection[];
  pricingRecommendations: string;
  upsellRecommendations: string;
  serviceRecommendations: string[];
  profitabilityEstimation: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Strategy {
  id: string;
  clientId: string;
  clientName: string;
  type: 'seo' | 'social' | 'paid' | 'brand';
  title: string;
  content: {
    overview: string;
    details: { [key: string]: any };
    roadmap: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  clientId?: string; // Null if agency report
  clientName?: string;
  type: 'seo' | 'social' | 'paid' | 'agency';
  title: string;
  data: {
    metrics: { label: string; value: string | number; change?: string; isPositive?: boolean }[];
    chartData: { name: string; [key: string]: any }[];
  };
  executiveSummary: string;
  insights: string[];
  opportunities: string[];
  nextSteps: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  entityType: 'task' | 'project' | 'proposal' | 'client';
  entityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  messages: Message[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

