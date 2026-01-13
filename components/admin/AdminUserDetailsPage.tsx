import React, { useState, useMemo, useEffect } from 'react';
import { User, Order, Customer, WithdrawalRequest } from '../../types';
import { ChevronLeftIcon, CopyIcon, AvatarIcon, XMarkIcon, ClipboardListIcon, ChartUpIcon, UsersIcon, MoneyBillTransferIcon, CheckIcon } from '../common/icons';
import { HeaderConfig } from '../../App';

const BanIcon: React.FC<{className?: string}> = ({className}) => <i className={`fa-solid fa-ban ${className}`}></i>;

// Copied and adapted from OrdersPage
const OrderCard: React.FC<{ order: Order; onClick: () => void; }> = ({ order, onClick }) => {
    const getStatusInfo = (status: Order['status']) => {
        const statuses = {
            under_implementation: { text: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
            shipped: { text: 'قيد التوصيل', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
            completed: { text: 'تم التسليم للزبون', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
            cancelled: { text: 'تم الغاء الطلب', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
            rejected: { text: 'مرفوض', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
            partially_delivered: { text: 'واصل جزئي', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300' },
        };
        return statuses[status] || statuses.under_implementation;
    };

    const statusInfo = getStatusInfo(order.status);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-primary active:scale-95 transition-transform duration-200">
            <div className="flex justify-between items-start">
                <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-gray-100">طلب رقم #{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.date} - ${order.time}</p>
                    <div className={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-full ${statusInfo.className}`}>
                        {statusInfo.text}
                    </div>
                </div>
                <div className="text-left">
                    <p className="font-bold text-primary dark:text-primary-light text-lg">{order.total_cost.toLocaleString()} د.ع</p>
                    <p className="text-sm text-green-600 dark:text-green-400">الربح: {order.profit.toLocaleString()} د.ع</p>
                </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
                 <div className="flex -space-x-4">
                    {order.items.slice(0, 3).map((item, index) => (
                        <img key={index} src={item.product.image_urls[0]} alt={item.product.name} className="w-10 h-10 object-contain bg-gray-100 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-800" />
                    ))}
                 </div>
                 <p className="text-sm text-gray-600 dark:text-gray-300">{totalItems} منتج</p>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{label: string, value: string | undefined, onCopy?: () => void}> = ({label, value, onCopy}) => (
    <div className="flex justify-between items-center text-right py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <div className="flex items-center gap-2">
            {onCopy && (
                <button onClick={onCopy} className="text-gray-400 hover:text-primary p-1"><CopyIcon className="w-4 h-4" /></button>
            )}
            <span className="font-bold text-gray-800 dark:text-gray-200 text-left">{value || 'غير متوفر'}</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
);


const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    onClick?: () => void;
}> = ({ icon: Icon, label, value, color, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 text-center flex flex-col items-center justify-center transition-transform duration-200 ${onClick ? 'cursor-pointer hover:border-primary hover:scale-105 active:scale-95' : ''}`}
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-1 h-10 flex items-center text-center leading-tight">{label}</p>
    </div>
);

const CustomerListModal: React.FC<{ customers: Customer[]; onClose: () => void }> = ({ customers, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold dark:text-gray-100">زبائن المستخدم ({customers.length})</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" /></button>
                </div>
                <div className="p-4 overflow-y-auto space-y-3">
                    {customers.length > 0 ? customers.map(customer => (
                        <div key={customer.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 text-right border dark:border-gray-600">
                            <p className="font-bold dark:text-gray-200">{customer.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{customer.address}</p>
                        </div>
                    )) : <p className="text-center text-gray-500 dark:text-gray-400 py-6">لا يوجد زبائن لهذا المستخدم.</p>}
                </div>
            </div>
        </div>
    );
};


interface AdminUserDetailsPageProps {
    user: User;
    userOrders: Order[];
    userCustomers: Customer[];
    userWithdrawals: WithdrawalRequest[];
    onOrderClick: (order: Order) => void;
    onBack: () => void; // Function to go back to the users list in AdminDashboardPage
    addNotification: (message: string) => void;
    setHeaderConfig: (config: HeaderConfig | null) => void; // New prop
}

const AdminUserDetailsPage: React.FC<AdminUserDetailsPageProps> = ({ user, userOrders, userCustomers, userWithdrawals, onOrderClick, onBack, addNotification, setHeaderConfig }) => {
    const [detailsView, setDetailsView] = useState<'completed' | 'cancelled' | 'upcoming' | 'all' | null>(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // Effect to manage the main header configuration
    useEffect(() => {
        // Set header when this component mounts or user changes
        setHeaderConfig({
            title: `تفاصيل المستخدم: ${user.name}`,
            showBack: true,
            onBack: () => {
                // When clicking back from user details, go back to the users list view
                setHeaderConfig(null); // Clear this specific config
                onBack(); // Call the prop passed from AdminDashboardPage to go back to 'users' view
            },
        });

        // Cleanup function to reset header when component unmounts
        return () => {
            setHeaderConfig(null);
        };
    }, [user, setHeaderConfig, onBack]);

    const stats = useMemo(() => {
        const totalOrders = userOrders.length;
        const completedOrders = userOrders.filter(o => o.status === 'completed' || o.status === 'partially_delivered');
        const cancelledOrRejectedOrders = userOrders.filter(o => o.status === 'cancelled' || o.status === 'rejected');
        const upcomingOrders = userOrders.filter(o => o.status === 'under_implementation' || o.status === 'shipped');
        
        const pendingProfit = upcomingOrders.reduce((sum, o) => sum + o.profit, 0);
        const withdrawnEarnings = userWithdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0);
        const totalCustomers = new Set(userCustomers.map(o => o.id)).size;

        return { totalOrders, completedOrders, cancelledOrRejectedOrders, upcomingOrders, pendingProfit, withdrawnEarnings, totalCustomers };
    }, [userOrders, userCustomers, userWithdrawals]);

    const handleCopy = (text: string | undefined, label: string) => {
        if (!text) {
            addNotification('لا يوجد شيء لنسخه');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            addNotification(`تم نسخ ${label}`);
        }).catch(() => {
            addNotification('فشل النسخ');
        });
    };

    const renderDetailsView = () => {
        if (!detailsView) return null;

        let ordersToShow: Order[] = [];
        let title = '';

        switch (detailsView) {
            case 'all':
                ordersToShow = userOrders;
                title = 'إجمالي الطلبات';
                break;
            case 'completed':
                ordersToShow = stats.completedOrders;
                title = 'الطلبات المكتملة (بما في ذلك واصل جزئي)';
                break;
            case 'cancelled':
                ordersToShow = stats.cancelledOrRejectedOrders;
                title = 'الطلبات الملغاة/المرفوضة';
                break;
            case 'upcoming':
                ordersToShow = stats.upcomingOrders;
                title = 'الطلبات القادمة';
                break;
        }


        return (
            <div>
                {/* Internal header for details view - this will be removed as main header takes over */}
                <div className="flex items-center justify-between my-4">
                    <h3 className="text-xl font-bold dark:text-gray-100">{title} ({ordersToShow.length})</h3>
                    <button onClick={() => setDetailsView(null)} className="text-sm font-semibold text-primary bg-primary-light px-3 py-1 rounded-md">
                        العودة للإحصائيات
                    </button>
                </div>
                <div className="space-y-3">
                    {ordersToShow.length > 0 ? (
                        ordersToShow.map(order => <OrderCard key={order.id} order={order} onClick={() => onOrderClick(order)} />)
                    ) : (
                        <div className="text-center text-gray-500 py-8 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                            <p>لا توجد طلبات لعرضها.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            {isCustomerModalOpen && <CustomerListModal customers={userCustomers} onClose={() => setIsCustomerModalOpen(false)} />}

            {/* Removed the internal header as the main app header will now handle it */}
            {detailsView ? renderDetailsView() : (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard icon={ClipboardListIcon} label="إجمالي الطلبات" value={stats.totalOrders} color="bg-blue-500" onClick={() => setDetailsView('all')} />
                    <StatCard icon={ChartUpIcon} label="الأرباح القادمة" value={`${stats.pendingProfit.toLocaleString()} د.ع`} color="bg-teal-500" onClick={() => setDetailsView('upcoming')} />
                    <StatCard icon={MoneyBillTransferIcon} label="الأرباح المسحوبة" value={`${stats.withdrawnEarnings.toLocaleString()} د.ع`} color="bg-indigo-500" onClick={() => setDetailsView('completed')} />
                    <StatCard icon={CheckIcon} label="طلبات مكتملة" value={stats.completedOrders.length} color="bg-green-500" onClick={() => setDetailsView('completed')} />
                    <StatCard icon={BanIcon} label="طلبات ملغاة/مرفوضة" value={stats.cancelledOrRejectedOrders.length} color="bg-red-500" onClick={() => setDetailsView('cancelled')} />
                    <StatCard icon={UsersIcon} label="عدد الزبائن" value={stats.totalCustomers} color="bg-purple-500" onClick={() => setIsCustomerModalOpen(true)} />
                </div>
            )}
        </div>
    );
};

export default AdminUserDetailsPage;