
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, User, WithdrawalRequest, Category, Customer, Ticket, TicketMessage, FaqItem, SiteSettings, Coupon, Supplier, SupplierWithdrawal, AppNotification, AdminView } from '../../types';
import { PlusIcon, TrashIcon, EditIcon, XMarkIcon, SearchIcon, BoxOpenIcon, ClipboardListIcon, UsersGearIcon, MoneyBillTransferIcon, CopyIcon, CameraIcon, PaletteIcon, ChevronLeftIcon, ChartPieIcon, ChartUpIcon, TicketIcon, TagIcon, BellIcon, SendIcon, HandshakeIcon, CheckCircleIcon, ClockIcon, WalletIcon, PhoneIcon, MenuIcon, LayoutDashboardIcon } from '../common/icons';
import AdminSiteSettingsView from './AdminSiteSettingsView';
import AdminUserDetailsPage from './AdminUserDetailsPage';
import AdminDashboardOverviewView from './AdminDashboardOverviewView';
import { HeaderConfig } from '../../App';
import AdminProductEditPage from './AdminProductEditPage';
import AdminProductStatsView from './AdminProductStatsView';
import AdminProductsMainView from './AdminProductsMainView';
import AdminOrdersView from './AdminOrdersView';

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
        <div className="p-6">
             <div className="relative mb-6">
                <input type="text" placeholder="...ابحث بالاسم، الايميل، أو الهاتف" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-4 pr-12 border border-gray-200 dark:border-gray-700 rounded-2xl text-right bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm" />
                <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-end hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 w-full justify-end mb-2">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100 text-right">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                <UsersGearIcon className="w-5 h-5"/>
                            </div>
                        </div>
                        <div className="w-full h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
                        <div className="flex gap-2 w-full">
                            <button onClick={() => onDeleteUser(user.id)} className="flex-1 py-2 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-1">
                                <TrashIcon className="w-4 h-4"/>
                                <span className="text-xs font-bold">حذف</span>
                            </button>
                             <button onClick={() => onUserClick(user)} className="flex-[2] py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                التفاصيل
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ... (Keeping WithdrawalDetailsModal & AdminWithdrawalsView essentially same but cleaning up if needed. Reusing existing logic)
const WithdrawalDetailsModal: React.FC<{
    request: WithdrawalRequest;
    user: User | undefined;
    userOrders: Order[];
    onClose: () => void;
    onProcess: () => void;
}> = ({ request, user, userOrders, onClose, onProcess }) => {
    
    const handleCopy = (text: string) => navigator.clipboard.writeText(text);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4" onClick={onClose}>
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
  orders: Order[];
}> = ({ withdrawalRequests, onProcessWithdrawal, users, orders }) => {
    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

    const filteredRequests = useMemo(() => {
        return withdrawalRequests
            .filter(r => r.status === filter)
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    }, [withdrawalRequests, filter]);
    
    const getUser = (userId: string) => users.find(u => u.id === userId);
    
    const selectedUserOrders = useMemo(() => {
        if (!selectedRequest) return [];
        return orders
            .filter(o => o.user_id === selectedRequest.user_id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [selectedRequest, orders]);

    const handleProcess = () => {
        if (selectedRequest) {
            onProcessWithdrawal(selectedRequest);
            setSelectedRequest(null);
        }
    };

    return (
        <div className="p-6">
            {selectedRequest && (
                <WithdrawalDetailsModal 
                    request={selectedRequest}
                    user={getUser(selectedRequest.user_id)}
                    userOrders={selectedUserOrders}
                    onClose={() => setSelectedRequest(null)}
                    onProcess={handleProcess}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex text-sm font-bold shadow-inner">
                    <button 
                        onClick={() => setFilter('completed')}
                        className={`px-6 py-2.5 rounded-lg transition-all ${filter === 'completed' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        مكتملة
                    </button>
                    <button 
                        onClick={() => setFilter('pending')}
                        className={`px-6 py-2.5 rounded-lg transition-all ${filter === 'pending' ? 'bg-white dark:bg-gray-700 text-yellow-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        غير مكتملة
                    </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">إدارة السحوبات</h3>
            </div>

             {filteredRequests.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRequests.map(request => {
                        const user = getUser(request.user_id);
                        return (
                            <div 
                                key={request.id} 
                                onClick={() => setSelectedRequest(request)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:border-primary/50 cursor-pointer transition-all active:scale-[0.99] shadow-sm hover:shadow-md"
                            >
                                 <div className="flex justify-between items-start">
                                    <div className="text-left">
                                        <p className="font-extrabold text-2xl text-primary dark:text-primary-light">{request.amount.toLocaleString()}</p>
                                        <p className="text-xs font-bold text-gray-400 mt-1">د.ع</p>
                                        <span className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 w-fit mt-3 ${request.status === 'pending' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20' : 'bg-green-50 text-green-700 dark:bg-green-900/20'}`}>
                                            {request.status === 'pending' ? <ClockIcon className="w-3 h-3"/> : <CheckCircleIcon className="w-3 h-3"/>}
                                            {request.status === 'pending' ? 'قيد الانتظار' : 'تم التحويل'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{user?.name || 'مستخدم محذوف'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-end gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-lg">
                                            <span dir="ltr" className="font-mono">{request.wallet_number}</span>
                                            <WalletIcon className="w-4 h-4"/>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-3">{new Date(request.request_date || request.created_at!).toLocaleDateString('ar-IQ')}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                 </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                    <MoneyBillTransferIcon className="w-20 h-20 mb-4 opacity-20"/>
                    <p className="text-lg">لا توجد طلبات في هذه القائمة.</p>
                </div>
             )}
        </div>
    );
};

// =================================================================
// MAIN ADMIN DASHBOARD COMPONENT WITH SIDEBAR LAYOUT
// =================================================================

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
  currentUser?: User | null; 
  
  view?: AdminView; 
  onViewChange?: (view: AdminView) => void;
  onAdminUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

// Sidebar Item Component
const SidebarItem: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
    badgeCount?: number;
}> = ({ icon: Icon, label, isActive, onClick, badgeCount }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-all duration-200 group ${
            isActive 
            ? 'bg-primary text-white shadow-md shadow-primary/30' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
        <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary'}`} strokeWidth={2} />
            <span className={`font-bold text-sm ${isActive ? 'text-white' : ''}`}>{label}</span>
        </div>
        {badgeCount !== undefined && badgeCount > 0 && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                {badgeCount > 99 ? '99+' : badgeCount}
            </span>
        )}
    </button>
);

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  products, onAddProduct, onUpdateProduct, onDeleteProduct, orders, users, customers, 
  onUpdateOrderStatus, onDeleteUser, withdrawalRequests, onProcessWithdrawal, 
  addNotification, faqItems, siteSettings, onSetFaqItems, onUpdateSiteSettings, 
  categories, onSetCategories, onAdminOrderClick, tickets, onUpdateTicketThreadStatus, 
  onAddTicketMessage, onOpenTicketChat, setHeaderConfig, coupons, onAddCoupon, 
  onUpdateCoupon, onDeleteCoupon, currentUser, view = 'overview', onViewChange, onAdminUpdateOrder
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when view changes on mobile
  useEffect(() => {
      setSidebarOpen(false);
  }, [view]);

  const setView = (newView: AdminView) => {
      if (onViewChange) {
          onViewChange(newView);
      }
  };

  // --- Header Config Logic ---
  // We will utilize the main App header for the mobile toggle mainly, 
  // but the dashboard has its own layout now.
  useEffect(() => {
      setHeaderConfig({
          title: 'لوحة التحكم',
          showBack: false, // We use internal navigation
      });
      return () => setHeaderConfig(null);
  }, [setHeaderConfig]);


  const pendingWithdrawalsCount = useMemo(() => {
    return withdrawalRequests.filter(r => r.status === 'pending').length;
  }, [withdrawalRequests]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'under_implementation').length;
  }, [orders]);

  const allMenuItems = [
    { label: 'نظرة عامة', view: 'overview' as AdminView, icon: LayoutDashboardIcon },
    { label: 'الطلبات', view: 'orders' as AdminView, icon: ClipboardListIcon, badgeCount: pendingOrdersCount },
    { label: 'المنتجات', view: 'products' as AdminView, icon: BoxOpenIcon },
    { label: 'السحوبات', view: 'withdrawals' as AdminView, icon: MoneyBillTransferIcon, badgeCount: pendingWithdrawalsCount },
    { label: 'المستخدمين', view: 'users' as AdminView, icon: UsersGearIcon },
    { label: 'الإعدادات', view: 'settings' as AdminView, icon: PaletteIcon },
  ];

  const menuItems = useMemo(() => {
      if (!currentUser?.permissions || currentUser.permissions.length === 0) {
          return allMenuItems;
      }
      return allMenuItems.filter(item => 
          currentUser.permissions?.includes(item.view) || item.view === 'overview' // Always show overview
      );
  }, [currentUser, allMenuItems]);

  // Handle Internal Routing Logic for Detail Views
  const handleUserClick = (user: User) => { setSelectedUser(user); setView('userDetails'); };
  const handleBackToUsers = () => { setSelectedUser(null); setView('users'); };

  const userOrders = useMemo(() => selectedUser ? orders.filter(o => o.user_id === selectedUser.id) : [], [orders, selectedUser]);
  const userCustomers = useMemo(() => selectedUser ? customers.filter(c => c.user_id === selectedUser.id) : [], [customers, selectedUser]);
  const userWithdrawals = useMemo(() => selectedUser ? withdrawalRequests.filter(w => w.user_id === selectedUser.id) : [], [withdrawalRequests, selectedUser]);

  const renderContent = () => {
    // Permission Check
    if (view !== 'dashboard' && view !== 'overview' && currentUser?.permissions && currentUser.permissions.length > 0 && !currentUser.permissions.includes(view)) {
        if (!(view === 'userDetails' && currentUser.permissions.includes('users'))) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-center p-10">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4"><XMarkIcon className="w-10 h-10 text-red-500"/></div>
                    <h3 className="text-xl font-bold text-gray-800">صلاحيات محدودة</h3>
                    <p className="text-gray-500 mt-2">ليس لديك صلاحية للوصول لهذا القسم.</p>
                </div>
             );
        }
    }

    if (view === 'userDetails' && selectedUser) {
        return <AdminUserDetailsPage user={selectedUser} userOrders={userOrders} userCustomers={userCustomers} userWithdrawals={userWithdrawals} onOrderClick={onAdminOrderClick} onBack={handleBackToUsers} addNotification={addNotification} setHeaderConfig={setHeaderConfig} />;
    }

    switch (view) {
        case 'dashboard': // Fallback alias
        case 'overview': return <AdminDashboardOverviewView users={users} orders={orders} />;
        case 'products': return <AdminProductsMainView products={products} onAddProduct={onAddProduct} onUpdateProduct={onUpdateProduct} onDeleteProduct={onDeleteProduct} orders={orders} categories={categories} setHeaderConfig={setHeaderConfig} onBackToAdminDashboardMenu={() => {}} />;
        case 'orders': return <AdminOrdersView orders={orders} onUpdateOrderStatus={onUpdateOrderStatus} onAdminOrderClick={onAdminOrderClick} addNotification={addNotification} setHeaderConfig={setHeaderConfig} onAdminUpdateOrder={onAdminUpdateOrder} />;
        case 'users': return <AdminUsersView users={users} onDeleteUser={onDeleteUser} onUserClick={handleUserClick} />;
        case 'withdrawals': return <AdminWithdrawalsView withdrawalRequests={withdrawalRequests} onProcessWithdrawal={onProcessWithdrawal} users={users} orders={orders} />;
        case 'settings': return <div className="p-6"><AdminSiteSettingsView faqItems={faqItems} siteSettings={siteSettings} onSetFaqItems={onSetFaqItems} onUpdateSiteSettings={onUpdateSiteSettings} categories={categories} onSetCategories={onSetCategories}/></div>;
        default: return <div>جاري التحميل...</div>;
    }
  };

  const currentViewLabel = useMemo(() => {
      return allMenuItems.find(i => i.view === view)?.label || 'لوحة التحكم';
  }, [view]);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-slate-900 relative text-right font-cairo">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
                onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Sidebar Navigation */}
        <aside 
            className={`
                fixed top-0 right-0 bottom-0 w-72 bg-white dark:bg-gray-800 z-50 flex flex-col border-l border-gray-100 dark:border-gray-700 shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-full
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <BoxOpenIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-xl text-gray-800 dark:text-white">إلك ستور</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">لوحة التحكم</p>
                    </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-red-500">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map(item => (
                    <SidebarItem 
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={view === item.view}
                        onClick={() => setView(item.view)}
                        badgeCount={item.badgeCount}
                    />
                ))}
            </div>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center text-gray-400 shadow-sm">
                        <UsersGearIcon className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm text-gray-800 dark:text-white truncate">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Mobile Header (Visible only on small screens) */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <h2 className="font-bold text-lg dark:text-gray-100">{currentViewLabel}</h2>
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Content View */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {renderContent()}
            </div>
        </main>
    </div>
  );
};

export default AdminDashboardPage;
