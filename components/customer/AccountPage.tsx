
import React from 'react';
import { 
    PencilIcon, 
    QuestionIcon, ChevronLeftIcon, GaugeHighIcon, 
    BookmarkOutlineIcon,
    BellIcon
} from '../common/icons';
import { AccountSubPageView } from '../../App';
import { User } from '../../types';
import { requestNotificationPermission } from '../../services/notificationService';

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
];

interface AccountPageProps {
    onMenuClick: (view: AccountSubPageView) => void;
    onLogout: () => void;
    currentUser: User | null;
    realizedBalance: number;
    pendingProfit: number;
    hasPendingWithdrawal: boolean;
    isLoadingWithdrawals: boolean;
    onNavigateToWithdrawals: () => void;
    addNotification: (message: string) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ onMenuClick, onLogout, currentUser, addNotification }) => {
    const handleEnableNotifications = async () => {
        if (!currentUser) return;
        
        try {
            addNotification('جاري طلب إذن الإشعارات...');
            const token = await requestNotificationPermission(currentUser.id);
            if (token) {
                addNotification('تم تفعيل الإشعارات بنجاح!');
            } else {
                addNotification('لم يتم تفعيل الإشعارات. تأكد من منح الإذن أو استخدام متصفح يدعم هذه الميزة.');
            }
        } catch (error) {
            console.error("Notification permission error:", error);
            addNotification('حدث خطأ أثناء طلب الإذن.');
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                {/* سيظهر هذا العنصر فقط إذا كان المستخدم Admin */}
                {currentUser?.is_admin && (
                    <MenuItem icon={GaugeHighIcon} label="لوحة التحكم" onClick={() => onMenuClick('adminDashboard')} />
                )}
                
                {menuItems.map(item => (
                    <MenuItem key={item.label} icon={item.icon} label={item.label} onClick={() => onMenuClick(item.view)} />
                ))}

                {/* زر تفعيل الإشعارات */}
                <MenuItem 
                    icon={BellIcon} 
                    label="تفعيل الإشعارات" 
                    onClick={handleEnableNotifications} 
                />

                {/* زر تسجيل الخروج */}
                <MenuItem 
                    icon={() => (
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    )} 
                    label="تسجيل الخروج" 
                    onClick={onLogout} 
                    isLogout 
                />
            </div>

            {/* تنبيه لمستخدمي الآيفون */}
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                <div className="flex gap-3">
                    <QuestionIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">ملاحظة لمستخدمي الآيفون</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                            لتصلك الإشعارات، يجب إضافة التطبيق للشاشة الرئيسية (Share {">"} Add to Home Screen) ثم تفعيل الإشعارات من هذا القسم.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
