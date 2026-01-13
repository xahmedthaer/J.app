
import React from 'react';
import { HomeIcon, BagIcon, UserIcon, TicketIcon } from './icons';

type MainView = 'products' | 'orders' | 'account' | 'tickets';

interface BottomNavProps {
  activeView: MainView;
  setActiveView: (view: MainView) => void;
  unreadTicketsCount?: number;
}

const NavItem: React.FC<{
  label: string;
  Icon: React.FC<{ className?: string; active?: boolean }>;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ label, Icon, isActive, onClick, badgeCount }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center h-full flex-1 relative transition-colors duration-200 group ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
    aria-label={label}
  >
    <div className="relative p-1">
        {/* Standard Icon Size: w-6 h-6 (24px) */}
        <Icon className={`w-6 h-6 mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.5px] group-hover:stroke-[2px]'}`} active={isActive} />
        
        {badgeCount && badgeCount > 0 ? (
            <span className="absolute top-0 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-gray-800 text-[9px] text-white items-center justify-center font-bold">
                  {badgeCount > 9 ? '+9' : badgeCount}
                </span>
            </span>
        ) : null}
    </div>
    {/* Standard Text Size: text-xs (12px) */}
    <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, unreadTicketsCount = 0 }) => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 z-50 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Increased height to h-16 (64px) for better touch targets */}
      <div className="flex justify-around items-center h-16 px-2">
        <NavItem
          label="الرئيسية"
          Icon={HomeIcon}
          isActive={activeView === 'products'}
          onClick={() => setActiveView('products')}
        />
        <NavItem
          label="الطلبات"
          Icon={BagIcon}
          isActive={activeView === 'orders'}
          onClick={() => setActiveView('orders')}
        />
        <NavItem
          label="التذاكر"
          Icon={TicketIcon}
          isActive={activeView === 'tickets'}
          onClick={() => setActiveView('tickets')}
          badgeCount={unreadTicketsCount}
        />
        <NavItem
          label="حسابي"
          Icon={UserIcon}
          isActive={activeView === 'account'}
          onClick={() => setActiveView('account')}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
