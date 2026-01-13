
import React from 'react';
import { 
    WalletIcon, ChartUpIcon, PencilIcon, 
    QuestionIcon, ChevronLeftIcon, GaugeHighIcon, ChartPieIcon,
    ShieldIcon, MoneyCheckDollarIcon, BookmarkOutlineIcon
} from './icons';
import { AccountSubPageView } from '../App';
import { User } from '../types';

const MenuItem: React.FC<{
  icon: React.ElementType,
  label: string,
  onClick: () => void;
  isLogout?: boolean;
}> = ({ icon: Icon, label, onClick, isLogout = false }) => (
    <button onClick={onClick} className="w-full flex justify-between items-center text-right p-4 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600">
        <div className="flex items-center gap-4">
            <Icon className={`w-6 h-6 ${isLogout ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className={`font-semibold ${isLogout ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>{label}</span>
        </div>
        {!isLogout && <ChevronLeftIcon className="w-5 h-5 text-gray-400" />}
    </button>
);

const menuItems: { icon: React.ElementType, label: string, view: AccountSubPageView}[] = [
    { icon: PencilIcon, label: 'تحرير معلومات المستخدم', view: 'editProfile' },
    { icon: BookmarkOutlineIcon, label: 'المنتجات المحفوظة', view: 'savedProducts' },
    { icon: QuestionIcon, label: 'الاسئلة الشائعة', view: 'instructions' },
    { icon: ShieldIcon, label: 'سياسة الخصوصية والاستخدام', view: 'privacyPolicy' },
    { icon: MoneyCheckDollarIcon, label: 'رسوم الخدمة', view: 'serviceFees' },
];

interface AccountPageProps {
    onMenuClick: (view: AccountSubPageView) => void;
    currentUser: User | null;
    realizedBalance: number;
    pendingProfit: number;
    hasPendingWithdrawal: boolean;
    isLoadingWithdrawals: boolean;
    onNavigateToWithdrawals: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ onMenuClick, currentUser, realizedBalance, pendingProfit, hasPendingWithdrawal, isLoadingWithdrawals, onNavigateToWithdrawals }) => {
    return (
        <div className="p-4 space-y-4">
            {/* تم حذف حقل الاسم والايميل من هنا بناءً على الطلب */}

            {/* EARNINGS CARD */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-3 border border-gray-200/80 dark:border-gray-700/80">
                <div className="flex gap-3">
                    {/* Realized Balance Card */}
                    <button 
                        onClick={onNavigateToWithdrawals}
                        disabled={isLoadingWithdrawals || realizedBalance <= 0 || hasPendingWithdrawal}
                        className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3 flex justify-between items-center text-right transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                            <WalletIcon className="text-green-600 text-xl" />
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">{realizedBalance.toLocaleString()} <span className="text-sm font-medium">د.ع</span></p>
                            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mt-1">الارباح المحققة</p>
                        </div>
                    </button>

                    {/* Pending Profit Card */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-3 flex justify-between items-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <ChartUpIcon className="text-orange-500 text-xl" />
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-orange-500 dark:text-orange-400">{pendingProfit.toLocaleString()} <span className="text-sm font-medium">د.ع</span></p>
                            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mt-1">الارباح القادمة</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                {currentUser?.is_admin && (
                    <MenuItem icon={GaugeHighIcon} label="لوحة التحكم" onClick={() => onMenuClick('adminDashboard')} />
                )}
                {menuItems.map(item => (
                    <MenuItem key={item.label} icon={item.icon} label={item.label} onClick={() => onMenuClick(item.view)} />
                ))}
            </div>
        </div>
    );
};

export default AccountPage;
