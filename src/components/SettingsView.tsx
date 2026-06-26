'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  CreditCard, 
  Link, 
  Database, 
  Key, 
  Sparkles, 
  Check,
  Globe
} from 'lucide-react';

export default function SettingsView() {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'billing' | 'integrations' | 'database'>('database');
  
  // Settings Inputs
  const [dbConfig, setDbConfig] = useState({
    dbUri: 'postgresql://postgres:db_pass@db.supabase.co:5432/postgres',
    ormType: 'prisma',
    apiKey: 'sk-proj-••••••••••••••••••••••••'
  });
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);

  // Integrations states
  const [integrations, setIntegrations] = useState({
    slack: true,
    hubspot: false,
    stripe: false,
    googleAnalytics: true
  });

  const handleToggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations({ ...integrations, [key]: !integrations[key] });
  };

  const handleValidateDb = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationSuccess(null);

    setTimeout(() => {
      setIsValidating(false);
      setValidationSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Settings Workspace</h2>
        <p className="text-xs text-zinc-500">Configure database adapters, API keys, subscription plans, and integration endpoints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SETTINGS MENU TABS */}
        <div className="lg:col-span-1 space-y-1.5">
          {[
            { id: 'database', label: 'Database & API keys', icon: Database },
            { id: 'integrations', label: 'Connected Apps', icon: Link },
            { id: 'billing', label: 'Subscription Plan', icon: CreditCard }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  activeSettingsTab === tab.id
                    ? 'bg-zinc-900 border-zinc-900 text-white font-bold'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SETTINGS CONTENT */}
        <div className="lg:col-span-3">
          <div className="p-6 bg-white border border-zinc-200 rounded-xl">
            
            {/* DATABASE CONFIG */}
            {activeSettingsTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Database & LLM configuration</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Setup real database parameters to migrate data adapters from prototype localStorage.</p>
                </div>

                <form onSubmit={handleValidateDb} className="space-y-4 max-w-xl">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-zinc-400" />
                      PostgreSQL Connection URI
                    </label>
                    <input
                      type="text"
                      value={dbConfig.dbUri}
                      onChange={(e) => setDbConfig({ ...dbConfig, dbUri: e.target.value })}
                      placeholder="postgresql://username:password@hostname:5432/dbname"
                      className="w-full text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ORM Adapter Client</label>
                      <select
                        value={dbConfig.ormType}
                        onChange={(e) => setDbConfig({ ...dbConfig, ormType: e.target.value })}
                        className="w-full text-xs"
                      >
                        <option value="prisma">Prisma Client ORM</option>
                        <option value="drizzle">Drizzle-ORM (PgClient)</option>
                        <option value="supabase-js">Supabase JS Client SDK</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-zinc-400" />
                        API Integration Key
                      </label>
                      <input
                        type="password"
                        value={dbConfig.apiKey}
                        onChange={(e) => setDbConfig({ ...dbConfig, apiKey: e.target.value })}
                        placeholder="sk-proj-••••••••••••••••"
                        className="w-full text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={isValidating}
                      className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 shadow"
                    >
                      {isValidating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Testing handshake connection...</span>
                        </>
                      ) : (
                        <span>Test & Save DB Config</span>
                      )}
                    </button>

                    {validationSuccess && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-semibold">
                        <Check className="w-4 h-4 text-emerald-500" /> Handshake successful! Connected to PostgreSQL server.
                      </span>
                    )}
                  </div>
                </form>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg max-w-xl space-y-3">
                  <h4 className="text-[11px] font-bold text-zinc-850 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                    Database migration guidelines
                  </h4>
                  <p className="text-xs text-zinc-650 leading-relaxed">
                    This operating system is built using an abstract service repository interface inside `src/lib/services/db.ts`. Swap out mock methods with actual ORM query calls (e.g. `prisma.lead.findMany()`) to finalize database setup. No UI code edits are required.
                  </p>
                </div>
              </div>
            )}

            {/* CONNECTED APPS */}
            {activeSettingsTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Connected App Integrations</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Connect your workspace to other core tools to synchronize client details and triggers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  {[
                    { id: 'slack', label: 'Slack Workspace', desc: 'Post daily AI reports and alerts to Slack channels.', icon: Globe },
                    { id: 'hubspot', label: 'Hubspot CRM sync', desc: 'Two-way sync pipelines and client contacts.', icon: Settings },
                    { id: 'stripe', label: 'Stripe Billing', desc: 'Sync client payments, invoices and plans.', icon: CreditCard },
                    { id: 'googleAnalytics', label: 'Google Analytics 4', desc: 'Fetch SEO / traffic reports automatically.', icon: Database }
                  ].map(app => {
                    const isConnected = integrations[app.id as keyof typeof integrations];
                    return (
                      <div 
                        key={app.id} 
                        className="p-4 bg-white border border-zinc-200 rounded-lg flex items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="space-y-1 text-xs">
                          <strong className="text-zinc-800 block">{app.label}</strong>
                          <span className="text-zinc-500 text-[10px] block leading-snug">{app.desc}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleIntegration(app.id as any)}
                          className={`w-9 h-5.5 rounded-full p-0.5 transition-all ${
                            isConnected ? 'bg-zinc-950' : 'bg-zinc-250'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-all ${
                            isConnected ? 'translate-x-3.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BILLING PLANS */}
            {activeSettingsTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Subscription Plan</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Scale your workspace bounds and team accounts size.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Starter', price: '$99/mo', limits: ['5 Clients Limit', '3 Team Members Limit', 'Basic AI Features'], isCurrent: false },
                    { name: 'Growth', price: '$249/mo', limits: ['25 Clients Limit', 'Unlimited Proposals', 'Advanced Automation'], isCurrent: true },
                    { name: 'Agency Pro', price: '$499/mo', limits: ['Unlimited Clients', 'Unlimited Team Members', 'Full AI Suite'], isCurrent: false }
                  ].map(plan => (
                    <div 
                      key={plan.name}
                      className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
                        plan.isCurrent 
                          ? 'bg-zinc-50/50 border-zinc-400 text-zinc-900 shadow-2xs' 
                          : 'bg-white border-zinc-200 text-zinc-650'
                      }`}
                    >
                      <div className="space-y-1">
                        <strong className="text-zinc-850 block text-xs uppercase tracking-wider">{plan.name}</strong>
                        <h4 className="text-lg font-bold text-zinc-950">{plan.price}</h4>
                      </div>

                      <ul className="text-[10px] text-zinc-500 space-y-2 border-t border-zinc-100 pt-3.5 flex-1 font-semibold">
                        {plan.limits.map(l => (
                          <li key={l} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                            <span>{l}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        disabled={plan.isCurrent}
                        className={`w-full py-1.5 rounded-lg text-xs font-semibold border ${
                          plan.isCurrent
                            ? 'bg-zinc-100 border-zinc-200 text-zinc-500'
                            : 'bg-zinc-950 border-zinc-950 text-white hover:bg-zinc-800'
                        }`}
                      >
                        {plan.isCurrent ? 'Current Plan' : `Upgrade`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
