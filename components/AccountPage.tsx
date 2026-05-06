
import React, { useState, useEffect } from 'react';
import { 
    WalletIcon, ChartUpIcon, PencilIcon, 
    QuestionIcon, ChevronLeftIcon, GaugeHighIcon,
    ShieldIcon, MoneyCheckDollarIcon, BookmarkOutlineIcon,
    BellIcon
} from './icons';
import { AccountSubPageView } from '../App';
import { User } from '../types';
import { getNotificationStatus, triggerNotification, requestNotificationPermission } from '../services/notificationService';

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
    onLogout: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ onMenuClick, currentUser, realizedBalance, pendingProfit, hasPendingWithdrawal, isLoadingWithdrawals, onNavigateToWithdrawals, onLogout }) => {
    const [notifStatus, setNotifStatus] = useState<any>(null);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const status = await getNotificationStatus();
            setNotifStatus(status);
        };
        checkStatus();
    }, []);

    const handleTestNotification = async () => {
        if (!currentUser) return;
        setIsTesting(true);
        try {
            // First ensure we have permission/token
            await requestNotificationPermission(currentUser.id);
            // Wait a bit for token to save
            await new Promise(r => setTimeout(r, 1500));
            
            const result = await triggerNotification(
                currentUser.id,
                'اختبار الإشعارات',
                'هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح'
            );
            
            if (result?.success) {
                alert('تم إرسال الإشعار بنجاح! تحقق من هاتفك.');
            } else {
                alert('فشل الإرسال: ' + (result?.message || 'سبب غير معروف'));
            }
        } catch (error) {
            alert('خطأ في الاختبار: ' + error);
        } finally {
            setIsTesting(false);
            const status = await getNotificationStatus();
            setNotifStatus(status);
        }
    };

    return (
        <div className="p-4 space-y-4">
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
                <MenuItem icon={() => <i className="fa-solid fa-right-from-bracket rotate-180"></i>} label="تسجيل الخروج" onClick={onLogout} isLogout={true} />
            </div>

            {/* Notification Diagnostics */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <BellIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">تشخيص الإشعارات</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">تحقق من حالة وصول التنبيهات لهاتفك</p>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-3 text-sm space-y-2">
                    <div className="flex justify-between items-center text-right">
                        <span className="text-gray-500">الحالة:</span>
                        <span className={`font-semibold ${notifStatus?.supported ? 'text-green-600' : 'text-red-500'}`}>
                            {notifStatus?.reason || 'جاري التحقق...'}
                        </span>
                    </div>
                    {notifStatus?.supported && (
                        <div className="flex justify-between items-center text-right">
                            <span className="text-gray-500">الإذن:</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {notifStatus.permission === 'granted' ? 'مسموح' : 
                                 notifStatus.permission === 'denied' ? 'مرفوض' : 'غير محدد'}
                            </span>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleTestNotification}
                    disabled={isTesting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                    {isTesting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            جاري الاختبار...
                        </>
                    ) : 'إرسال إشعار تجريبي'}
                </button>
            </div>
        </div>
    );
};

export default AccountPage;
