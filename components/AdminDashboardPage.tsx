
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, User, WithdrawalRequest, Category, Customer, Ticket, TicketMessage, FaqItem, SiteSettings, Coupon, Supplier, SupplierWithdrawal, AppNotification, AdminView } from '../types';
import { PlusIcon, TrashIcon, EditIcon, XMarkIcon, SearchIcon, BoxOpenIcon, ClipboardListIcon, UsersGearIcon, MoneyBillTransferIcon, CopyIcon, CameraIcon, PaletteIcon, ChevronLeftIcon, ChartPieIcon, ChartUpIcon, TicketIcon, TagIcon, BellIcon, SendIcon, HandshakeIcon, CheckCircleIcon, ClockIcon, WalletIcon, PhoneIcon, IdCardIcon } from './icons';
import AdminSiteSettingsView from './AdminSiteSettingsView';
import AdminUserDetailsPage from './AdminUserDetailsPage';
import AdminDashboardOverviewView from './AdminDashboardOverviewView';
import { HeaderConfig } from '../App';
import AdminProductEditPage from './AdminProductEditPage';
import AdminProductStatsView from './AdminProductStatsView';
import AdminProductsMainView from './AdminProductsMainView';
import AdminOrdersView from './AdminOrdersView';
import AdminTicketsView from './AdminTicketsView';
import AdminCouponsView from './AdminCouponsView';
import AdminSuppliersView from './AdminSuppliersView';
import AdminSupplierDetailsPage from './AdminSupplierDetailsPage';
import AdminEmployeesView from './AdminEmployeesView'; // Import the new component

// =================================================================
// NOTIFICATIONS SENDER VIEW
// =================================================================
const AdminNotificationsSender: React.FC<{ addNotification: (msg: string) => void }> = ({ addNotification }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if(!title.trim() || !message.trim()) {
            alert('يرجى كتابة عنوان ورسالة الإشعار');
            return;
        }
        addNotification(`تم إرسال الإشعار: "${title}" إلى جميع المستخدمين بنجاح!`);
        setTitle('');
        setMessage('');
    };

    return (
        <div className="p-4 space-y-4 dark:bg-slate-900 h-full">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-end gap-3 mb-6">
                    <h2 className="text-xl font-bold dark:text-gray-100">إرسال إشعار عام</h2>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <BellIcon className="w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-right text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان الإشعار</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: خصومات الجمعة البيضاء!" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-right focus:ring-2 focus:ring-primary outline-none dark:text-white"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-right text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نص الرسالة</label>
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="اكتب نص الإشعار هنا..." 
                            className="w-full p-3 h-32 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-right focus:ring-2 focus:ring-primary outline-none resize-none dark:text-white"
                        ></textarea>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 text-right">
                        <i className="fa-solid fa-circle-info ml-2"></i>
                        سيتم إرسال هذا الإشعار إلى جميع المستخدمين المسجلين في التطبيق فوراً.
                    </div>

                    <button 
                        onClick={handleSend}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        <SendIcon className="w-5 h-5" />
                        إرسال الإشعار
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// 3. USERS MANAGEMENT VIEW
// =================================================================
const AdminUsersView: React.FC<{
  users: User[];
  onDeleteUser: (userId: string) => void;
  onUserClick: (user: User) => void;
}> = ({ users, onDeleteUser, onUserClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredUsers = useMemo(() => {
        let list = users.filter(u => !u.is_admin);

        if (!searchQuery.trim()) return list;
        const lcQuery = searchQuery.toLowerCase().trim();
        return list.filter(u =>
            u.name.toLowerCase().includes(lcQuery) ||
            u.email.toLowerCase().includes(lcQuery) ||
            (u.phone && u.phone.includes(lcQuery))
        );
    }, [users, searchQuery]);

    return (
        <div className="p-4">
            <h3 className="text-xl font-bold mb-4 text-right dark:text-gray-100">إدارة المستخدمين ({filteredUsers.length})</h3>
             <div className="relative mb-4">
                <input type="text" placeholder="...ابحث بالاسم، الايميل، أو الهاتف" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-3 pr-10 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="space-y-3">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex justify-between items-center text-right">
                        <div className="flex gap-2">
                             <button onClick={() => onUserClick(user)} className="text-sm font-semibold text-primary">التفاصيل</button>
                            <button onClick={() => onDeleteUser(user.id)} className="text-red-500"><TrashIcon/></button>
                        </div>
                        <div>
                            <p className="font-bold dark:text-gray-200">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// =================================================================
// 4. WITHDRAWALS MANAGEMENT VIEW
// =================================================================

const WithdrawalDetailsModal: React.FC<{
    request: WithdrawalRequest;
    user: User | undefined;
    userOrders: Order[];
    onClose: () => void;
    onProcess: () => void;
}> = ({ request, user, userOrders, onClose, onProcess }) => {
    
    const handleCopy = (text: string) => navigator.clipboard.writeText(text);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
                    <div className="text-right">
                        <h2 className="text-xl font-bold dark:text-gray-100">تفاصيل طلب السحب</h2>
                        <p className="text-xs text-gray-500">#{request.id}</p>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-5 space-y-6">
                    {/* User Info Section */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-right flex items-center justify-end gap-2">
                            <span>بيانات المستخدم</span>
                            <UsersGearIcon className="w-5 h-5 text-primary" />
                        </h3>
                        {user ? (
                            <div className="space-y-2 text-right text-sm">
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{user.name}</span>
                                    <span className="text-gray-500">الاسم</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{user.email}</span>
                                    <span className="text-gray-500">البريد الإلكتروني</span>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => user.phone && handleCopy(user.phone)} className="text-primary text-xs bg-primary/10 px-2 py-1 rounded">نسخ</button>
                                        <span className="font-bold text-gray-800 dark:text-gray-100" dir="ltr">{user.phone || 'غير متوفر'}</span>
                                    </div>
                                    <span className="text-gray-500">رقم الهاتف</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500 text-right">المستخدم غير موجود (ربما تم حذفه)</p>
                        )}
                    </div>

                    {/* Withdrawal Amount Section */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">المبلغ المطلوب</p>
                        <p className="text-3xl font-extrabold text-primary dark:text-primary-light">{request.amount.toLocaleString()} د.ع</p>
                        <div className="mt-3 flex justify-center gap-4 text-sm">
                            <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border dark:border-gray-600 shadow-sm">
                                <span className="text-gray-500 block text-xs">طريقة السحب</span>
                                <span className="font-bold dark:text-gray-200">{request.wallet_type}</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border dark:border-gray-600 shadow-sm flex items-center gap-2">
                                <button onClick={() => handleCopy(request.wallet_number)} className="text-gray-400 hover:text-primary"><CopyIcon className="w-3 h-3"/></button>
                                <div>
                                    <span className="text-gray-500 block text-xs">رقم المحفظة</span>
                                    <span className="font-bold dark:text-gray-200" dir="ltr">{request.wallet_number}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Orders History */}
                    <div>
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-right flex items-center justify-end gap-2">
                            <span>سجل طلبات المستخدم ({userOrders.length})</span>
                            <ClipboardListIcon className="w-5 h-5 text-gray-500" />
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {userOrders.length > 0 ? userOrders.map(order => (
                                <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 text-xs">
                                    <div className={`px-2 py-1 rounded-full font-bold ${
                                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.status === 'completed' ? 'مكتمل' : 
                                         order.status === 'cancelled' ? 'ملغي' : 'قيد التنفيذ'}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold dark:text-gray-200">#{order.id}</div>
                                        <div className="text-gray-500">{order.date}</div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 text-sm">لا توجد طلبات لهذا المستخدم</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
                    {request.status === 'pending' ? (
                        <button 
                            onClick={onProcess}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircleIcon className="w-5 h-5"/>
                            تأكيد التحويل وإكمال الطلب
                        </button>
                    ) : (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold py-3 rounded-xl text-center flex items-center justify-center gap-2 cursor-default">
                            <CheckCircleIcon className="w-5 h-5"/>
                            تمت معالجة هذا الطلب
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminWithdrawalsView: React.FC<{
  withdrawalRequests: WithdrawalRequest[];
  onProcessWithdrawal: (request: WithdrawalRequest) => void;
  users: User[];
  orders: Order[]; // Needed to show user history
}> = ({ withdrawalRequests, onProcessWithdrawal, users, orders }) => {
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

    const filteredRequests = useMemo(() => {
        return withdrawalRequests
            .filter(r => r.status === filter)
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    }, [withdrawalRequests, filter]);
    
    const getUser = (userId: string) => users.find(u => u.id === userId);
    
    // Get orders for the selected user (when modal is open)
    const selectedUserOrders = useMemo(() => {
        if (!selectedRequest) return [];
        return orders
            .filter(o => o.user_id === selectedRequest.user_id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [selectedRequest, orders]);

    const handleProcess = () => {
        if (selectedRequest) {
            onProcessWithdrawal(selectedRequest);
            setSelectedRequest(null); // Close modal after processing
        }
    };

    return (
        <div className="p-4">
            {selectedRequest && (
                <WithdrawalDetailsModal 
                    request={selectedRequest}
                    user={getUser(selectedRequest.user_id)}
                    userOrders={selectedUserOrders}
                    onClose={() => setSelectedRequest(null)}
                    onProcess={handleProcess}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">إدارة السحوبات</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex text-sm font-bold">
                    <button 
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded-md transition-all ${filter === 'completed' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        مكتملة
                    </button>
                    <button 
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-md transition-all ${filter === 'pending' ? 'bg-white dark:bg-gray-600 text-yellow-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        غير مكتملة
                    </button>
                </div>
            </div>

             {filteredRequests.length > 0 ? (
                 <div className="space-y-3">
                    {filteredRequests.map(request => {
                        const user = getUser(request.user_id);
                        return (
                            <div 
                                key={request.id} 
                                onClick={() => setSelectedRequest(request)}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-primary cursor-pointer transition-all active:scale-98 shadow-sm"
                            >
                                 <div className="flex justify-between items-start">
                                    <div className="text-left">
                                        <p className="font-bold text-lg text-primary dark:text-primary-light">{request.amount.toLocaleString()} د.ع</p>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit mt-1 ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                            {request.status === 'pending' ? <ClockIcon className="w-3 h-3"/> : <CheckCircleIcon className="w-3 h-3"/>}
                                            {request.status === 'pending' ? 'قيد الانتظار' : 'تم التحويل'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{user?.name || 'مستخدم محذوف'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-end gap-1">
                                            <span dir="ltr">{request.wallet_number}</span>
                                            <WalletIcon className="w-3 h-3"/>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(request.request_date || request.created_at!).toLocaleDateString('ar-IQ')}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                 </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                    <MoneyBillTransferIcon className="w-16 h-16 mb-2 opacity-20"/>
                    <p>لا توجد طلبات في هذه القائمة.</p>
                </div>
             )}
        </div>
    );
};

// =================================================================
// MAIN ADMIN DASHBOARD COMPONENT
// =================================================================

interface AdminDashboardCardProps {
  icon: React.ElementType;
  label: string;
  theme: 'purple' | 'green' | 'blue' | 'cyan' | 'rose' | 'orange' | 'indigo' | 'slate' | 'yellow';
  onClick: () => void;
  isActive: boolean;
  badgeCount?: number;
}

const AdminDashboardCard: React.FC<AdminDashboardCardProps> = ({ icon: Icon, label, theme, onClick, isActive, badgeCount }) => {
    
    const themes = {
        purple: { bg: 'bg-purple-50 dark:bg-purple-900/10', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/30' },
        green: { bg: 'bg-green-50 dark:bg-green-900/10', icon: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-900/30' },
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/10', icon: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30' },
        cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/10', icon: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-900/30' },
        rose: { bg: 'bg-rose-50 dark:bg-rose-900/10', icon: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/30' },
        orange: { bg: 'bg-orange-50 dark:bg-orange-900/10', icon: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/30' },
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/10', icon: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/30' },
        slate: { bg: 'bg-slate-50 dark:bg-slate-800', icon: 'text-slate-600 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-700' },
        yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', icon: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-100 dark:border-yellow-900/30' },
    };

    const currentTheme = themes[theme] || themes.blue;

    return (
        <button
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-center p-5 rounded-[2rem] transition-all duration-300 group
                bg-white dark:bg-gray-800 border 
                ${isActive ? 'border-primary ring-1 ring-primary' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'}
                hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-95
            `}
        >
            {badgeCount && badgeCount > 0 ? (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold h-6 min-w-[24px] px-1.5 flex items-center justify-center rounded-full shadow-sm animate-pulse z-10">
                    {badgeCount > 99 ? '99+' : badgeCount}
                </div>
            ) : null}
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${currentTheme.bg}`}>
                <Icon className={`w-8 h-8 ${currentTheme.icon}`} strokeWidth={1.5} />
            </div>
            
            <p className="font-bold text-base text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {label}
            </p>
        </button>
    );
};


interface AdminDashboardPageProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  orders: Order[];
  users: User[];
  customers: Customer[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteUser: (userId: string) => void;
  withdrawalRequests: WithdrawalRequest[];
  onProcessWithdrawal: (request: WithdrawalRequest) => void;
  addNotification: (message: string) => void;
  faqItems: FaqItem[];
  siteSettings: SiteSettings;
  onSetFaqItems: (items: FaqItem[]) => void;
  onUpdateSiteSettings: (settings: Partial<SiteSettings>) => void;
  categories: Category[];
  onSetCategories: (categories: Category[]) => void;
  onAdminOrderClick: (order: Order) => void;
  tickets: Ticket[];
  onUpdateTicketThreadStatus: (ticketId: string, status: Ticket['status']) => void;
  onAddTicketMessage: (threadId: string, text?: string, imageUrl?: string) => void;
  onOpenTicketChat: (ticketThread: Ticket) => void;
  setHeaderConfig: (config: HeaderConfig | null) => void;
  coupons: Coupon[];
  onAddCoupon: (coupon: Omit<Coupon, 'id' | 'used_count'>) => void;
  onUpdateCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  // Suppliers
  suppliers: Supplier[];
  supplierWithdrawals: SupplierWithdrawal[]; 
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'joined_at'>) => void;
  onAddSupplierWithdrawal: (withdrawal: Omit<SupplierWithdrawal, 'id'>) => void; 
  
  // Employees Handlers
  onAddEmployee: (employee: Omit<User, 'id' | 'is_admin' | 'registration_date'>) => void;
  onUpdateEmployee: (employee: User) => void;
  onDeleteEmployee: (employeeId: string) => void;
  currentUser?: User | null; 
  
  view?: AdminView; 
  onViewChange?: (view: AdminView) => void;
  onAdminUpdateOrder: (orderId: string, updates: Partial<Order>) => void; // New Prop
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders,
  users,
  customers,
  onUpdateOrderStatus,
  onDeleteUser,
  withdrawalRequests,
  onProcessWithdrawal, 
  addNotification,
  faqItems,
  siteSettings,
  onSetFaqItems,
  onUpdateSiteSettings,
  categories,
  onSetCategories,
  onAdminOrderClick,
  tickets,
  onUpdateTicketThreadStatus,
  onAddTicketMessage,
  onOpenTicketChat,
  setHeaderConfig,
  coupons,
  onAddCoupon,
  onUpdateCoupon,
  onDeleteCoupon,
  suppliers,
  supplierWithdrawals, 
  onAddSupplier,
  onAddSupplierWithdrawal,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  currentUser,
  view = 'dashboard',
  onViewChange,
  onAdminUpdateOrder
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const setView = (newView: AdminView) => {
      if (onViewChange) {
          onViewChange(newView);
      }
  };

  const adminUnreadTicketsCount = useMemo(() => {
    return tickets.filter(ticket => {
        const lastMessage = ticket.messages[ticket.messages.length - 1];
        return lastMessage && !lastMessage.senderId.includes('admin');
    }).length;
  }, [tickets]);

  const pendingWithdrawalsCount = useMemo(() => {
    return withdrawalRequests.filter(r => r.status === 'pending').length;
  }, [withdrawalRequests]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'under_implementation').length;
  }, [orders]);

  const allMenuItems = [
    { label: 'الطلبات', view: 'orders' as AdminView, icon: ClipboardListIcon, theme: 'green', badgeCount: pendingOrdersCount },
    { label: 'التذاكر', view: 'tickets' as AdminView, icon: TicketIcon, theme: 'rose', badgeCount: adminUnreadTicketsCount },
    { label: 'المنتجات', view: 'products' as AdminView, icon: BoxOpenIcon, theme: 'blue' },
    { label: 'السحوبات', view: 'withdrawals' as AdminView, icon: MoneyBillTransferIcon, theme: 'orange', badgeCount: pendingWithdrawalsCount },
    { label: 'المستخدمين', view: 'users' as AdminView, icon: UsersGearIcon, theme: 'purple' },
    { label: 'الكوبونات', view: 'coupons' as AdminView, icon: TagIcon, theme: 'cyan' },
    { label: 'الموردين', view: 'suppliers' as AdminView, icon: HandshakeIcon, theme: 'orange' },
    { label: 'الموظفين', view: 'employees' as AdminView, icon: IdCardIcon, theme: 'indigo' },
    { label: 'الاعدادات', view: 'settings' as AdminView, icon: PaletteIcon, theme: 'slate' },
    { label: 'الملخص', view: 'overview' as AdminView, icon: ChartPieIcon, theme: 'yellow' },
    { label: 'إشعار', view: 'notifications' as AdminView, icon: BellIcon, theme: 'yellow' },
  ];

  const menuItems = useMemo(() => {
      if (!currentUser?.permissions || currentUser.permissions.length === 0) {
          return allMenuItems;
      }
      return allMenuItems.filter(item => 
          currentUser.permissions?.includes(item.view)
      );
  }, [currentUser, allMenuItems]);

  const dashboardGridItems = menuItems;


  useEffect(() => {
    if (view === 'dashboard') {
      setHeaderConfig(null);
      return;
    }

    if ((view === 'userDetails' && selectedUser) || (view === 'supplierDetails' && selectedSupplier)) {
    } else {
      const currentMenuItem = allMenuItems.find(item => item.view === view);
      if (currentMenuItem) {
        setHeaderConfig({
          title: currentMenuItem.label,
          showBack: true,
          onBack: () => {
            setView('dashboard');
          },
        });
      }
    }
  }, [view, selectedUser, selectedSupplier, setHeaderConfig]);


  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setView('userDetails');
  };
  
  const handleBackToUsers = () => {
    setSelectedUser(null);
    setView('users');
  }

  const handleSupplierClick = (supplier: Supplier) => {
      setSelectedSupplier(supplier);
      setView('supplierDetails');
  };

  const handleBackToSuppliers = () => {
      setSelectedSupplier(null);
      setView('suppliers');
  };

  const userOrders = useMemo(() => selectedUser ? orders.filter(o => o.user_id === selectedUser.id) : [], [orders, selectedUser]);
  const userCustomers = useMemo(() => selectedUser ? customers.filter(c => c.user_id === selectedUser.id) : [], [customers, selectedUser]);
  const userWithdrawals = useMemo(() => selectedUser ? withdrawalRequests.filter(w => w.user_id === selectedUser.id) : [], [withdrawalRequests, selectedUser]);
  
  const employeesList = useMemo(() => users.filter(u => u.is_admin && u.permissions && u.permissions.length > 0), [users]);


  const renderViewContent = () => {
    if (view !== 'dashboard' && currentUser?.permissions && currentUser.permissions.length > 0 && !currentUser.permissions.includes(view)) {
        if (!(view === 'userDetails' && currentUser.permissions.includes('users')) && 
            !(view === 'supplierDetails' && currentUser.permissions.includes('suppliers'))) {
             return <div className="text-center p-10 text-red-500">ليس لديك صلاحية للوصول لهذا القسم.</div>;
        }
    }

    if (view === 'userDetails' && selectedUser) {
      return (
        <div className="p-4">
            <AdminUserDetailsPage
            user={selectedUser}
            userOrders={userOrders}
            userCustomers={userCustomers}
            userWithdrawals={userWithdrawals}
            onOrderClick={onAdminOrderClick}
            onBack={handleBackToUsers}
            addNotification={addNotification}
            setHeaderConfig={setHeaderConfig}
            />
        </div>
      );
    }

    if (view === 'supplierDetails' && selectedSupplier) {
        return (
            <AdminSupplierDetailsPage 
                supplier={selectedSupplier}
                products={products}
                orders={orders}
                withdrawals={supplierWithdrawals.filter(sw => sw.supplierId === selectedSupplier.id)}
                onAddWithdrawal={onAddSupplierWithdrawal}
                setHeaderConfig={setHeaderConfig}
                onBack={handleBackToSuppliers}
            />
        );
    }

    switch (view) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 dark:bg-slate-900">
            {dashboardGridItems.map(item => (
              <AdminDashboardCard
                key={item.view}
                label={item.label}
                icon={item.icon}
                theme={item.theme as any}
                onClick={() => setView(item.view)}
                isActive={view === item.view}
                badgeCount={item.badgeCount}
              />
            ))}
          </div>
        );
      case 'overview':
        return <AdminDashboardOverviewView users={users} orders={orders} />;
      case 'products':
        return <AdminProductsMainView
                    products={products}
                    onAddProduct={onAddProduct}
                    onUpdateProduct={onUpdateProduct}
                    onDeleteProduct={onDeleteProduct}
                    orders={orders}
                    categories={categories}
                    suppliers={suppliers} 
                    setHeaderConfig={setHeaderConfig}
                    onBackToAdminDashboardMenu={() => setView('dashboard')}
                />;
      case 'orders':
        return <AdminOrdersView 
                    orders={orders} 
                    onUpdateOrderStatus={onUpdateOrderStatus} 
                    onAdminOrderClick={onAdminOrderClick} 
                    addNotification={addNotification}
                    setHeaderConfig={setHeaderConfig}
                    onAdminUpdateOrder={onAdminUpdateOrder}
                />;
      case 'users':
        return <AdminUsersView users={users} onDeleteUser={onDeleteUser} onUserClick={handleUserClick} />;
      case 'employees': 
        return <AdminEmployeesView 
                    employees={employeesList}
                    onAddEmployee={onAddEmployee}
                    onUpdateEmployee={onUpdateEmployee}
                    onDeleteEmployee={onDeleteEmployee}
                    setHeaderConfig={setHeaderConfig}
               />;
      case 'suppliers': 
        return <AdminSuppliersView 
                    suppliers={suppliers}
                    onAddSupplier={onAddSupplier}
                    onSupplierClick={handleSupplierClick}
                    setHeaderConfig={setHeaderConfig}
               />;
      case 'withdrawals':
        return <AdminWithdrawalsView 
                    withdrawalRequests={withdrawalRequests} 
                    onProcessWithdrawal={onProcessWithdrawal} 
                    users={users} 
                    orders={orders}
                />;
      case 'tickets':
        return <AdminTicketsView 
                    tickets={tickets} 
                    onUpdateTicketThreadStatus={onUpdateTicketThreadStatus}
                    onAddTicketMessage={onAddTicketMessage}
                    onOpenTicketChat={onOpenTicketChat}
                    addNotification={addNotification} 
                    setHeaderConfig={setHeaderConfig} 
                />;
      case 'coupons':
          return <AdminCouponsView 
                    coupons={coupons}
                    onAddCoupon={onAddCoupon}
                    onUpdateCoupon={onUpdateCoupon}
                    onDeleteCoupon={onDeleteCoupon}
                    addNotification={addNotification}
                    setHeaderConfig={setHeaderConfig}
                 />;
      case 'settings':
        return <div className="p-4">
                <AdminSiteSettingsView faqItems={faqItems} siteSettings={siteSettings} onSetFaqItems={onSetFaqItems} onUpdateSiteSettings={onUpdateSiteSettings} categories={categories} onSetCategories={onSetCategories}/>
               </div>;
      case 'notifications':
        return <AdminNotificationsSender addNotification={addNotification} />;
      default:
        return <div>حدد طريقة العرض</div>;
    }
  };


  return (
    <div className="dark:bg-slate-900 min-h-screen">
        {renderViewContent()}
    </div>
  );
};

export default AdminDashboardPage;
