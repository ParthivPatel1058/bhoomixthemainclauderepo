import React from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Bell,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Download,
  Plus,
  Filter,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface DashboardViewProps {
  theme: ThemeMode;
  activeItem: string;
  activeSubItem: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  theme,
  activeItem,
  activeSubItem,
}) => {
  const isDark = theme === 'dark';

  const textPrimary = isDark ? 'text-white' : 'text-neutral-900';
  const textSecondary = isDark ? 'text-[#8E8A98]' : 'text-neutral-500';
  const cardBg = isDark
    ? 'bg-[#151319] border border-white/[0.06]'
    : 'bg-white border border-neutral-200/80 shadow-sm';

  const TRANSACTIONS = [
    {
      id: 'tx-1',
      title: 'Apple Store NYC',
      category: 'Electronics & Tech',
      date: 'Today, 2:45 PM',
      amount: '-$1,299.00',
      status: 'Completed',
      type: 'expense',
    },
    {
      id: 'tx-2',
      title: 'Stripe Payout: Client Invoice',
      category: 'Income & Revenue',
      date: 'Today, 9:12 AM',
      amount: '+$8,450.00',
      status: 'Received',
      type: 'income',
    },
    {
      id: 'tx-3',
      title: 'Whole Foods Market',
      category: 'Groceries & Household',
      date: 'Yesterday, 6:30 PM',
      amount: '-$184.20',
      status: 'Completed',
      type: 'expense',
    },
    {
      id: 'tx-4',
      title: 'Figma Annual Subscription',
      category: 'Software & Tools',
      date: 'Yesterday, 11:15 AM',
      amount: '-$180.00',
      status: 'Completed',
      type: 'expense',
    },
    {
      id: 'tx-5',
      title: 'Amazon Web Services Refund',
      category: 'Refunds & Overcharge',
      date: 'Sep 04, 2026',
      amount: '+$420.50',
      status: 'Refunded',
      type: 'income',
    },
  ];

  return (
    <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold tracking-tight ${textPrimary}`}>
              {activeItem === 'activity'
                ? `Activity • ${activeSubItem.charAt(0).toUpperCase() + activeSubItem.slice(1)}`
                : activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
              Live Feed
            </span>
          </div>
          <p className={`text-sm ${textSecondary} mt-0.5`}>
            Account #8492-MEDT • Primary Operating Treasury
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              isDark
                ? 'bg-white/5 border-white/10 text-neutral-300'
                : 'bg-white border-neutral-200 text-neutral-600'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search activity, transactions..."
              className="bg-transparent outline-none w-48 text-xs"
            />
          </div>

          <button
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm'
            }`}
          >
            <Bell className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#F04469] via-[#9934E2] to-[#5C4DF2] hover:opacity-95 shadow-md shadow-purple-500/20 transition-all active:scale-95">
            <Plus className="w-3.5 h-3.5" />
            New Transfer
          </button>
        </div>
      </div>

      {/* Main Stats Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Primary Treasury Balance */}
        <div className={`p-5 rounded-3xl ${cardBg} relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
              Total Balance
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-500 gap-1">
              <TrendingUp className="w-3 h-3" /> +14.2%
            </span>
          </div>

          <div className="mt-3">
            <h2 className={`text-3xl font-extrabold tracking-tight ${textPrimary}`}>
              $142,850.40
            </h2>
            <p className={`text-xs ${textSecondary} mt-1`}>
              Available liquid capital across 3 sub-accounts
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className={textSecondary}>Vault Savings:</span>
            <span className={`font-semibold ${textPrimary}`}>$94,500.00</span>
          </div>
        </div>

        {/* Card 2: Monthly Inflow / Outflow */}
        <div className={`p-5 rounded-3xl ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
              Monthly Flow
            </span>
            <span className={`text-xs ${textSecondary}`}>September 2026</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                <ArrowDownLeft className="w-3.5 h-3.5" /> Inflow
              </div>
              <p className="text-lg font-bold text-emerald-500 mt-1">+$42,190</p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> Outflow
              </div>
              <p className="text-lg font-bold text-rose-500 mt-1">-$16,840</p>
            </div>
          </div>
        </div>

        {/* Card 3: Virtual Medtbank Black Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1F1B24] via-[#16141B] to-[#0D0B10] text-white border border-white/10 shadow-xl relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">
              Medtbank Infinite
            </span>
            <CreditCard className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="mt-4 font-mono text-sm tracking-widest text-neutral-300">
            •••• •••• •••• 4289
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <div>
              <p className="text-[9px] uppercase text-neutral-500">Cardholder</p>
              <p className="font-semibold text-white">Jason Brown</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-neutral-500">Expires</p>
              <p className="font-semibold text-white">09/29</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className={`p-5 sm:p-6 rounded-3xl ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div>
            <h3 className={`text-base font-bold ${textPrimary}`}>Recent Transactions</h3>
            <p className={`text-xs ${textSecondary}`}>
              Showing latest real-time settlements and card authorizations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isDark
                  ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Filter className="w-3 h-3" /> Filter
            </button>
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isDark
                  ? 'border-white/10 text-neutral-300 hover:bg-white/5'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
        </div>

        {/* Transaction Rows */}
        <div className="divide-y divide-white/5 pt-2">
          {TRANSACTIONS.map((tx) => (
            <div
              key={tx.id}
              className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : isDark
                      ? 'bg-white/5 text-neutral-300'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <p className={`text-xs sm:text-sm font-semibold ${textPrimary}`}>
                    {tx.title}
                  </p>
                  <p className={`text-[11px] ${textSecondary}`}>{tx.category} • {tx.date}</p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    tx.type === 'income' ? 'text-emerald-500' : textPrimary
                  }`}
                >
                  {tx.amount}
                </p>
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${
                    tx.status === 'Received'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : tx.status === 'Refunded'
                      ? 'bg-purple-500/10 text-purple-400'
                      : isDark
                      ? 'bg-white/5 text-neutral-400'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
