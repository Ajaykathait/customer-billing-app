import React from 'react';
import { Button } from '../ui/Button';
import {
  Hexagon,
  Receipt,
  Users,
  UserPlus,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'billing' | 'customers';
  onSelectTab: (tab: 'billing' | 'customers') => void;
  onOpenNewCustomer: () => void;
  customerCount: number;
  invoiceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewCustomer,
  customerCount,
  invoiceCount,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
              <Hexagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Customer Billing
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onSelectTab('billing')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === 'billing'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Invoices</span>
              <span className="ml-1 text-[11px] bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded-full font-bold">
                {invoiceCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('customers')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === 'customers'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
              <span className="ml-1 text-[11px] bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded-full font-bold">
                {customerCount}
              </span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenNewCustomer}
              icon={<UserPlus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              New Customer
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
