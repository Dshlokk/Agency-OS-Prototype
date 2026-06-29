'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  BarChart3, 
  Users2, 
  Bot, 
  Settings, 
  Bell, 
  X, 
  Menu, 
  Sparkles, 
  ChevronRight,
  UserCheck,
  Lock,
  Mail,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mockDb from '../lib/services/db';
import { Notification, AIConversation, Message } from '../lib/types/db';

import DashboardView from './DashboardView';
import CrmView from './CrmView';
import ClientsView from './ClientsView';
import ProjectsView from './ProjectsView';
import ReportsView from './ReportsView';
import TeamView from './TeamView';
import SettingsView from './SettingsView';

export default function AppShell() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar: string; role: string }>({
    name: 'Emma Stone',
    email: 'emma@agencyos.ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: 'Owner'
  });
  const [loginEmail, setLoginEmail] = useState<string>('emma@agencyos.ai');
  const [loginPassword, setLoginPassword] = useState<string>('password');
  const [loginError, setLoginError] = useState<string>('');

  // Registration Flow State
  const [loginView, setLoginView] = useState<'login' | 'plans' | 'register'>('login');
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; features: string[] } | null>(null);
  const [registerName, setRegisterName] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');

  // Check login session on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check cookies session first by calling API
      fetch('/api/auth/session')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('No cookie session');
        })
        .then(data => {
          if (data.authenticated && data.user) {
            setIsAuthenticated(true);
            setCurrentUser({
              name: data.user.name || 'User',
              email: data.user.email || '',
              avatar: data.user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              role: data.user.role || 'Owner'
            });
            localStorage.setItem('agencyos_session', 'authenticated');
            localStorage.setItem('agencyos_user', JSON.stringify({
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.avatar,
              role: data.user.role
            }));
          }
        })
        .catch(() => {
          // Fallback to legacy local storage sandbox session
          const session = localStorage.getItem('agencyos_session');
          if (session === 'authenticated') {
            setIsAuthenticated(true);
            const userJson = localStorage.getItem('agencyos_user');
            if (userJson) {
              try {
                setCurrentUser(JSON.parse(userJson));
              } catch (e) {
                console.error(e);
              }
            }
          }
        });
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadInitData = async () => {
      const notifs = await mockDb.getNotifications();
      setNotifications(notifs);

      const convs = await mockDb.getConversations();
      setConversations(convs);
      if (convs.length > 0) {
        setActiveConversationId(convs[0].id);
      }
    };
    loadInitData();
  }, [refreshTrigger, isAuthenticated]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === 'emma@agencyos.ai' && loginPassword === 'password') {
      setIsAuthenticated(true);
      setLoginError('');
      const defaultUser = {
        name: 'Emma Stone',
        email: 'emma@agencyos.ai',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        role: 'Owner'
      };
      setCurrentUser(defaultUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('agencyos_session', 'authenticated');
        localStorage.setItem('agencyos_user', JSON.stringify(defaultUser));
      }
      triggerRefresh();
    } else {
      setLoginError('Invalid credentials. Use emma@agencyos.ai / password');
    }
  };



  const handleNotificationRead = async () => {
    await mockDb.markAllNotificationsAsRead();
    triggerRefresh();
    setShowNotifications(false);
  };

  const handleSendChatMessage = async (text: string) => {
    if (!text.trim() || !activeConversationId) return;

    setChatInput('');
    setIsAiTyping(true);

    try {
      await mockDb.addMessageToConversation(activeConversationId, text);
      setTimeout(() => {
        setIsAiTyping(false);
        triggerRefresh();
      }, 1000);
    } catch (e) {
      console.error(e);
      setIsAiTyping(false);
    }
  };

  const handleQuickCommand = (command: string) => {
    handleSendChatMessage(command);
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveSection} onOpenAssistant={() => setIsAssistantOpen(true)} refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      case 'crm':
        return <CrmView refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      case 'clients':
        return <ClientsView refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      case 'projects':
        return <ProjectsView refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
      case 'reports':
        return <ReportsView refreshTrigger={refreshTrigger} />;
      case 'team':
        return <TeamView refreshTrigger={refreshTrigger} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveSection} onOpenAssistant={() => setIsAssistantOpen(true)} refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'crm', name: 'CRM Pipeline', icon: UserCheck },
    { id: 'clients', name: 'Client Intel', icon: Users },
    { id: 'projects', name: 'Projects', icon: FolderKanban },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'team', name: 'Team Hub', icon: Users2 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  // RENDER AUTHENTICATION FLOW
  if (!isAuthenticated) {
    if (loginView === 'plans') {
      return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 md:p-12">
          <div className="max-w-4xl w-full space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex w-10 h-10 rounded-lg bg-zinc-900 items-center justify-center shadow-xs mb-2">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Choose Your AgencyOS Plan</h1>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">Select a subscription plan to unlock full dashboard access and client analytics.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Starter',
                  price: '$49',
                  desc: 'Perfect for freelance marketers and small campaigns.',
                  features: ['3 Active Clients', 'Basic PDF Exports', 'Standard Social Audits', 'Core CRM Pipeline'],
                  popular: false
                },
                {
                  name: 'Growth',
                  price: '$99',
                  desc: 'Our most popular plan for scaling agencies.',
                  features: ['Unlimited Clients', 'Full Presentation Decks', 'Real-Time Social Analytics', 'AI Copilot Drawer', 'Team Collaboration'],
                  popular: true
                },
                {
                  name: 'Enterprise',
                  price: '$249',
                  desc: 'Custom workflows for high-volume enterprise teams.',
                  features: ['White-label Pitch Decks', 'Custom Webhooks Integration', 'Database API Sync', 'Dedicated Audit Manager', '24/7 Priority Support'],
                  popular: false
                }
              ].map(plan => (
                <div 
                  key={plan.name}
                  className={`bg-white border rounded-xl p-6 shadow-xs flex flex-col justify-between relative transition-all duration-200 hover:shadow-md ${
                    plan.popular ? 'border-zinc-900 ring-2 ring-zinc-900/5' : 'border-zinc-200'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-md text-zinc-900">{plan.name}</h3>
                      <p className="text-[11px] text-zinc-400 mt-1">{plan.desc}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-zinc-900">{plan.price}</span>
                      <span className="text-xs text-zinc-400">/ month</span>
                    </div>
                    <ul className="space-y-2 pt-2 border-t border-zinc-100">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-zinc-600">
                          <svg className="w-3.5 h-3.5 text-zinc-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setLoginView('register');
                      if (typeof document !== 'undefined') {
                        document.cookie = `agencyos_pending_plan=${plan.name}; path=/; max-age=600`;
                      }
                    }}
                    className={`w-full py-2 mt-6 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                      plan.popular 
                        ? 'bg-zinc-950 hover:bg-zinc-800 text-white' 
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                    }`}
                  >
                    Choose {plan.name}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setLoginView('login')}
                className="text-xs text-zinc-400 hover:text-zinc-900 font-medium hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (loginView === 'register') {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-md font-bold text-zinc-900 tracking-tight">Create AgencyOS Account</h1>
              {selectedPlan && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded-full text-[10px] text-zinc-600 font-semibold">
                  <span>Selected: <strong>{selectedPlan.name} Plan</strong> ({selectedPlan.price})</span>
                  <button onClick={() => setLoginView('plans')} className="text-zinc-400 hover:text-zinc-950 font-bold underline ml-1">Change</button>
                </div>
              )}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!registerName || !registerEmail || !registerPassword) return;
                const newUser = {
                  name: registerName,
                  email: registerEmail,
                  avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(registerName)}`,
                  role: selectedPlan ? `${selectedPlan.name} Plan` : 'Starter Plan'
                };
                setIsAuthenticated(true);
                setCurrentUser(newUser);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('agencyos_session', 'authenticated');
                  localStorage.setItem('agencyos_user', JSON.stringify(newUser));
                }
                triggerRefresh();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full pl-3 pr-3"
                  placeholder="Emma Stone"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full pl-3 pr-3"
                  placeholder="emma@agencyos.ai"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Password</label>
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full pl-3 pr-3"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow transition-colors"
              >
                Register & Start Trial
              </button>
            </form>

            <div className="relative flex py-1 items-center text-zinc-400">
              <div className="flex-grow border-t border-zinc-200"></div>
              <span className="flex-shrink mx-4 text-[9px] font-bold uppercase tracking-wider">or sign up with</span>
              <div className="flex-grow border-t border-zinc-200"></div>
            </div>

            <a
              href="/api/auth/github/login"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-zinc-200 hover:border-zinc-950 bg-white hover:bg-zinc-50 text-zinc-800 hover:text-zinc-950 rounded-lg text-xs font-semibold shadow-xs transition-all duration-200 group relative overflow-hidden"
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              <span>Sign up with GitHub</span>
              <span className="absolute inset-0 w-full h-full bg-zinc-950/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </a>

            <div className="text-center pt-2 border-t border-zinc-100">
              <button 
                onClick={() => setLoginView('login')}
                className="text-[9px] text-zinc-400 hover:text-zinc-900 font-semibold"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default Login View
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-md font-bold text-zinc-900 tracking-tight">Sign in to AgencyOS AI</h1>
            <p className="text-xs text-zinc-400">Owner Access credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg font-semibold leading-normal">
                {loginError}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9"
                  placeholder="emma@agencyos.ai"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="relative flex py-2 items-center text-zinc-400">
            <div className="flex-grow border-t border-zinc-200"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold uppercase tracking-wider">or continue with</span>
            <div className="flex-grow border-t border-zinc-200"></div>
          </div>

          <a
            href="/api/auth/github/login"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-zinc-200 hover:border-zinc-950 bg-white hover:bg-zinc-50 text-zinc-800 hover:text-zinc-950 rounded-lg text-xs font-semibold shadow-xs transition-all duration-200 group relative overflow-hidden"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
            <span>Sign in with GitHub</span>
            <span className="absolute inset-0 w-full h-full bg-zinc-950/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </a>

          <div className="text-center pt-2 border-t border-zinc-100 flex flex-col gap-1.5">
            <button 
              onClick={() => setLoginView('plans')}
              className="text-[9px] text-zinc-900 hover:underline font-bold"
            >
              Don&apos;t have an account? Choose a plan &amp; Register
            </button>
            <span className="text-[9px] text-zinc-400">Default Sandbox User: emma@agencyos.ai / password</span>
          </div>
        </div>
      </div>
    );
  }

  // RENDER MAIN APPLICATION LAYOUT
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col md:flex-row relative overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[230px] bg-zinc-50 border-r border-zinc-200 h-screen sticky top-0 z-20 shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7.5 h-7.5 rounded-md bg-zinc-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none tracking-tight text-zinc-900">AgencyOS</h1>
              <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">AI Platform</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group ${
                  isActive 
                    ? 'bg-zinc-900 text-white font-bold' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'}`} />
                  <span>{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-zinc-200/80 bg-zinc-50 space-y-2">
          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-zinc-200 bg-white">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full object-cover border border-zinc-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-zinc-900 truncate leading-tight">{currentUser.name}</p>
              <p className="text-[9px] text-zinc-400 truncate">{currentUser.role}</p>
            </div>

          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-5 py-3 bg-white border-b border-zinc-200 sticky top-0 z-30 font-semibold text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-zinc-900">AgencyOS</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-950" />
              )}
            </button>
          </div>

          <button 
            onClick={() => setIsAssistantOpen(true)}
            className="p-1.5 rounded-lg text-zinc-900 bg-zinc-100 border border-zinc-200"
          >
            <Bot className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CORE CONTENT LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative bg-white">
        
        {/* DESKTOP HEADER */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-zinc-200/80 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-bold capitalize tracking-wide text-zinc-900">{activeSection}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-full text-[10px] text-zinc-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                Active Campaigns: <strong>6</strong>
              </span>
              <span className="text-zinc-300">|</span>
              <span className="flex items-center gap-1">
                Target ROAS: <strong>3.5x</strong>
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-zinc-950" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      <div className="p-3.5 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                        <span className="font-bold text-xs text-zinc-700">Notifications</span>
                        <button 
                          onClick={handleNotificationRead}
                          className="text-[10px] text-zinc-900 hover:underline font-bold"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-zinc-400">No notifications</div>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className={`p-4 text-xs transition-colors ${notif.read ? 'opacity-60' : 'bg-zinc-50/50'}`}>
                              <p className="font-semibold text-zinc-800 mb-0.5">{notif.title}</p>
                              <p className="text-zinc-500 leading-normal">{notif.description}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* AI Assistant Button */}
            <button 
              onClick={() => setIsAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Bot className="w-4 h-4" />
              <span>AI Copilot</span>
            </button>
          </div>
        </header>

        {/* SCREEN VIEW */}
        <main className="flex-1 p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-zinc-200 flex items-center justify-around z-30">
        {[
          { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
          { id: 'crm', name: 'CRM', icon: UserCheck },
          { id: 'clients', name: 'Intel', icon: Users },
          { id: 'projects', name: 'Projects', icon: FolderKanban },
          { id: 'more', name: 'Menu', icon: Menu }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id || (item.id === 'more' && ['reports', 'team', 'settings'].includes(activeSection));
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  setActiveSection(activeSection === 'settings' ? 'reports' : activeSection === 'reports' ? 'team' : 'settings');
                } else {
                  setActiveSection(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 w-12 h-12 text-zinc-500 hover:text-zinc-900 ${
                isActive ? 'text-zinc-950 font-bold' : ''
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold tracking-tight">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* PERSISTENT AI AGENCY ASSISTANT DRAWER */}
      <AnimatePresence>
        {isAssistantOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssistantOpen(false)}
              className="fixed inset-0 bg-zinc-950/40 z-40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-zinc-200 z-50 shadow-xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-zinc-955 flex items-center gap-1.5">
                      AgencyOS AI Copilot
                    </h3>
                    <p className="text-[9px] text-zinc-400">Natural language commands desk</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAssistantOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 bg-white border border-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                {activeConversation && activeConversation.messages.map((msg: Message) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`flex gap-2.5 max-w-[85%] ${isAssistant ? '' : 'flex-row-reverse'}`}>
                        {isAssistant ? (
                          <div className="w-6 h-6 rounded-md bg-zinc-100 border border-zinc-250 flex items-center justify-center shrink-0">
                            <Bot className="w-3.5 h-3.5 text-zinc-700" />
                          </div>
                        ) : (
                          <img 
                            src={currentUser.avatar} 
                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-zinc-200"
                            alt={currentUser.name}
                          />
                        )}
                        <div 
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            isAssistant 
                              ? 'bg-zinc-50 border border-zinc-200 text-zinc-700' 
                              : 'bg-zinc-900 text-white font-medium'
                          }`}
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* AI Typing Loader */}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
                      </div>
                      <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl flex items-center gap-1">
                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50/30">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-2 px-1">Quick Actions</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Show leads likely to convert",
                    "Generate proposal for Acme Corp",
                    "Create SEO strategy for Quantum Tech",
                    "Show delayed projects",
                    "Generate monthly report"
                  ].map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => handleQuickCommand(cmd)}
                      className="px-2 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-500 hover:text-zinc-900 rounded-md transition-all font-semibold"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input box */}
              <div className="p-4 border-t border-zinc-150 bg-white">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage(chatInput);
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AI to query or draft..."
                    className="w-full pl-3 pr-10 py-2.5 bg-white border border-zinc-200 focus:border-zinc-900 rounded-lg text-xs placeholder:text-zinc-400"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
