
import React, { useState, useEffect, useMemo } from 'react';

// Import types
import { Product, Order, User, Customer, WithdrawalRequest, FaqItem, SiteSettings, Category, Coupon, Supplier, SupplierWithdrawal, AppNotification, AdminView } from './types';

// Import mock data
import { mockProducts, mockOrders, mockUsers, mockCustomers, mockWithdrawalRequests, mockFaqItems, mockSiteSettings, mockCategories, mockSystemNotifications, mockSuppliers, mockSupplierWithdrawals } from './data/mockData';

// Import components
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import AuthPage from './components/auth/AuthPage';
import { BellIcon, ChevronLeftIcon, LogoutIcon, ShieldIcon, PlusIcon } from './components/common/icons';

// Header Config Interface (Local to this dashboard)
export interface DashboardHeaderConfig {
    title: string;
    showBack: boolean;
    onBack?: () => void;
    showAddProduct?: boolean;
    onAddProduct?: () => void;
    showProductStats?: boolean;
    onProductStatsClick?: () => void;
}

const Dashboard1: React.FC = () => {
    // --- State Management (Independent from App.tsx) ---
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(mockSiteSettings);
    const [categories, setCategories] = useState<Category[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [supplierWithdrawals, setSupplierWithdrawals] = useState<SupplierWithdrawal[]>([]);
    const [notifications, setNotifications] = useState<{ id: number, message: string }[]>([]);
    const [systemNotifications, setSystemNotifications] = useState<AppNotification[]>([]);

    // UI States
    const [adminView, setAdminView] = useState<AdminView>('overview');
    const [headerConfig, setHeaderConfig] = useState<DashboardHeaderConfig | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark for admin dashboard usually looks better

    // --- Initialization ---
    useEffect(() => {
        // Initialize Data
        setProducts(mockProducts);
        setOrders(mockOrders);
        setUsers(mockUsers);
        setCustomers(mockCustomers);
        setWithdrawalRequests(mockWithdrawalRequests);
        setFaqItems(mockFaqItems);
        setSiteSettings(mockSiteSettings);
        setCategories(mockCategories);
        setSuppliers(mockSuppliers);
        setSupplierWithdrawals(mockSupplierWithdrawals);
        setSystemNotifications(mockSystemNotifications);
        
        // Theme
        document.documentElement.classList.add('dark');
        
        // Auto-login purely for demo (Remove in production)
        const adminUser = mockUsers.find(u => u.is_admin);
        if (adminUser) {
            setCurrentUser(adminUser);
            setIsAuthenticated(true);
        }
    }, []);

    const addNotification = (message: string) => {
        const newId = Date.now();
        setNotifications(prev => [...prev, { id: newId, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newId));
        }, 3000); 
    };

    // --- Handlers (CRUD Logic duplicated/separated for Admin) ---

    // Auth
    const handleLogout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    // Products
    const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...newProductData,
            id: `prod-${Date.now()}`,
            created_at: new Date().toISOString(),
        };
        setProducts(prev => [newProduct, ...prev]);
        addNotification(`تمت إضافة المنتج "${newProduct.name}"`);
    };

    const handleUpdateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        addNotification(`تم تحديث المنتج "${updatedProduct.name}"`);
    };

    const handleDeleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        addNotification('تم حذف المنتج');
    };

    // Orders
    const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        addNotification(`تم تحديث حالة الطلب #${orderId}`);
    };

    const handleAdminUpdateOrder = (orderId: string, updates: Partial<Order>) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
        addNotification(`تم تعديل بيانات الطلب #${orderId}`);
    };

    // Users & Customers
    const handleDeleteUser = (userId: string) => {
        if (window.confirm("هل أنت متأكد؟ سيؤدي هذا لحذف المستخدم وكل بياناته.")) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            // Cascade delete (simulated)
            setOrders(prev => prev.filter(o => o.user_id !== userId));
            addNotification('تم حذف المستخدم');
        }
    };

    const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'user_id'>) => {
        // Since admin might add customer manually, assign to current admin or a default
        const newCustomer: Customer = { 
            ...customerData, 
            id: `cust-${Date.now()}`, 
            user_id: currentUser?.id || 'admin' 
        };
        setCustomers(prev => [newCustomer, ...prev]);
        addNotification('تمت إضافة الزبون');
        return newCustomer;
    };

    const handleUpdateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        addNotification('تم تحديث الزبون');
    };

    const handleDeleteCustomer = (customerId: string) => {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        addNotification('تم حذف الزبون');
    };

    // Withdrawals
    const handleProcessWithdrawal = (request: WithdrawalRequest) => {
        setWithdrawalRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'completed', processed_date: new Date().toISOString() } : r));
        addNotification('تم تأكيد التحويل');
    };

    // Settings
    const handleSetFaqItems = (items: FaqItem[]) => setFaqItems(items);
    const handleUpdateSiteSettings = (settings: Partial<SiteSettings>) => setSiteSettings(prev => ({ ...prev, ...settings }));
    const handleSetCategories = (newCats: Category[]) => setCategories(newCats);

    // Tickets (Mock logic)
    const handleUpdateTicketThreadStatus = (id: string, status: any) => { /* logic */ };
    const handleAddTicketMessage = (id: string, text?: string, img?: string) => { /* logic */ };

    // Coupons
    const handleAddCoupon = (c: any) => {
        setCoupons(prev => [...prev, { ...c, id: `cpn-${Date.now()}`, used_count: 0 }]);
    };
    const handleUpdateCoupon = (c: Coupon) => setCoupons(prev => prev.map(x => x.id === c.id ? c : x));
    const handleDeleteCoupon = (id: string) => setCoupons(prev => prev.filter(x => x.id !== id));

    // Suppliers
    const handleAddSupplier = (s: any) => {
        setSuppliers(prev => [...prev, { ...s, id: `sup-${Date.now()}`, joined_at: new Date().toISOString().split('T')[0] }]);
        addNotification('تم إضافة المورد');
    };
    const handleAddSupplierWithdrawal = (w: any) => {
        setSupplierWithdrawals(prev => [...prev, { ...w, id: `sw-${Date.now()}` }]);
        addNotification('تم تسجيل السحب للمورد');
    };

    // Employees
    const handleAddEmployee = (e: any) => {
        setUsers(prev => [...prev, { ...e, id: `emp-${Date.now()}`, is_admin: true, registration_date: new Date().toISOString() }]);
        addNotification('تم إضافة الموظف');
    };
    const handleUpdateEmployee = (e: User) => {
        setUsers(prev => prev.map(u => u.id === e.id ? e : u));
        addNotification('تم تحديث الموظف');
    };
    const handleDeleteEmployee = (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        addNotification('تم حذف الموظف');
    };


    // --- Render ---

    if (!isAuthenticated) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center font-cairo">
                <div className="w-full max-w-md">
                    <AuthPage addNotification={(msg) => {
                        // Simulated Login Check
                        const admin = mockUsers.find(u => u.is_admin); // Just grab the admin from mock
                        if(admin) {
                            setCurrentUser(admin);
                            setIsAuthenticated(true);
                        }
                    }} />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-slate-900 text-white font-cairo flex flex-col overflow-hidden" dir="rtl">
            
            {/* --- Admin Header --- */}
            <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-6 shadow-md z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <ShieldIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold tracking-wide">
                        {headerConfig?.title || 'لوحة القيادة المركزية'}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Dynamic Header Actions */}
                    {headerConfig?.showProductStats && (
                        <button onClick={headerConfig.onProductStatsClick} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-gray-300 transition-colors" title="الإحصائيات">
                            <i className="fa-solid fa-chart-pie"></i>
                        </button>
                    )}
                    
                    {headerConfig?.showAddProduct && (
                        <button onClick={headerConfig.onAddProduct} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                            <PlusIcon className="w-4 h-4" />
                            <span>منتج جديد</span>
                        </button>
                    )}

                    <div className="h-8 w-px bg-slate-600 mx-2"></div>

                    <div className="flex items-center gap-3">
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-bold text-white">{currentUser?.name}</p>
                            <p className="text-xs text-gray-400">مسؤول النظام</p>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="تسجيل الخروج">
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* --- Main Content Area --- */}
            <main className="flex-grow overflow-hidden relative">
                <AdminDashboardPage 
                    // Data Props
                    products={products}
                    orders={orders}
                    users={users}
                    customers={customers}
                    withdrawalRequests={withdrawalRequests}
                    faqItems={faqItems}
                    siteSettings={siteSettings}
                    categories={categories}
                    tickets={[]} // Pass tickets if available
                    coupons={coupons}
                    suppliers={suppliers}
                    supplierWithdrawals={supplierWithdrawals}
                    
                    // User
                    currentUser={currentUser}

                    // Handlers
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onAdminUpdateOrder={handleAdminUpdateOrder}
                    onDeleteUser={handleDeleteUser}
                    onProcessWithdrawal={handleProcessWithdrawal}
                    addNotification={addNotification}
                    onSetFaqItems={handleSetFaqItems}
                    onUpdateSiteSettings={handleUpdateSiteSettings}
                    onSetCategories={handleSetCategories}
                    onAdminOrderClick={(order) => { console.log('Order Clicked', order)}}
                    
                    // Ticket Handlers (Stubbed)
                    onUpdateTicketThreadStatus={handleUpdateTicketThreadStatus}
                    onAddTicketMessage={handleAddTicketMessage}
                    onOpenTicketChat={() => {}}
                    
                    // Config
                    setHeaderConfig={setHeaderConfig as any}
                    
                    // Coupons
                    onAddCoupon={handleAddCoupon}
                    onUpdateCoupon={handleUpdateCoupon}
                    onDeleteCoupon={handleDeleteCoupon}

                    // Suppliers
                    onAddSupplier={handleAddSupplier}
                    onAddSupplierWithdrawal={handleAddSupplierWithdrawal}

                    // Employees
                    onAddEmployee={handleAddEmployee}
                    onUpdateEmployee={handleUpdateEmployee}
                    onDeleteEmployee={handleDeleteEmployee}

                    // Navigation Control
                    view={adminView}
                    onViewChange={setAdminView}
                />
            </main>

            {/* Notification Toast */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-2 pointer-events-none items-center w-full max-w-sm px-4">
                {notifications.map(n => (
                    <div 
                        key={n.id} 
                        className="pointer-events-auto bg-slate-800 text-white shadow-xl shadow-black/20 rounded-full py-3 px-6 flex items-center gap-3 animate-bounce-in border border-slate-700"
                    >
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-check text-white text-[10px]"></i>
                        </div>
                        <span className="text-sm font-bold">{n.message}</span>
                    </div>
                ))}
            </div>
            
            <style>{`
                @keyframes bounce-in {
                    0% { transform: translateY(-20px); opacity: 0; }
                    50% { transform: translateY(5px); }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-bounce-in { animation: bounce-in 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Dashboard1;
