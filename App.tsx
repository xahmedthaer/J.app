
import React, { useState, useEffect, useMemo } from 'react';

// Import types
import { Product, CartItem, Order, User, Customer, WithdrawalRequest, FaqItem, SiteSettings, Category, Coupon, Supplier, SupplierWithdrawal, AppNotification, AdminView, Ticket } from './types';

// Import mock data
import { mockProducts, mockOrders, mockUsers, mockCustomers, mockWithdrawalRequests, mockFaqItems, mockSiteSettings, mockCategories, mockSystemNotifications, mockSuppliers, mockSupplierWithdrawals } from './data/mockData';

// Import components (Updated Paths)
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import ProductsPage from './components/customer/ProductsPage';
import OrdersPage from './components/customer/OrdersPage';
import AccountPage from './components/customer/AccountPage';
import ProductDetailsPage from './components/customer/ProductDetailsPage';
import CartPage from './components/customer/CartPage';
import CheckoutPage from './components/customer/CheckoutPage';
import OrderDetailsPage from './components/customer/OrderDetailsPage';
import AccountSubPage from './components/customer/AccountSubPage';
import WithdrawalsPage from './components/customer/WithdrawalsPage';
import StatisticsPage from './components/customer/StatisticsPage';
import CategoriesPage from './components/customer/CategoriesPage';
import TicketChatModal from './components/customer/TicketChatModal';

export type Page = 'products' | 'orders' | 'account' | 'financial' | 'productDetails' | 'cart' | 'checkout' | 'orderDetails' | 'accountSubPage' | 'statistics' | 'categories';
export type MainView = 'products' | 'orders' | 'account' | 'financial';
// Removed 'notifications' from subpage views
export type AccountSubPageView = 'editProfile' | 'savedProducts' | 'customerDetails' | 'instructions' | 'adminDashboard' | 'serviceFees' | 'myTickets' | 'privacyPolicy' | 'termsAndConditions';
export type SelectedStatus = Order['status'] | 'all' | 'cancelled_rejected' | 'prepared' | 'postponed' | 'partially_delivered' | null;

export interface HeaderConfig {
    title: string;
    showBack: boolean;
    onBack?: () => void;
    showAddProduct?: boolean;
    onAddProduct?: () => void;
    showProductStats?: boolean;
    onProductStatsClick?: () => void;
    showAddTicket?: boolean;
    onAddTicket?: () => void;
}

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import * as firebaseService from './services/firebaseService';
import AuthPage from './components/auth/AuthPage';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(mockSiteSettings);
    const [categories, setCategories] = useState<Category[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    
    // Support/Tickets State
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [activeTicketChat, setActiveTicketChat] = useState<Ticket | null>(null);

    const [page, setPage] = useState<Page>('products');
    const [mainView, setMainView] = useState<MainView>('products');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [accountSubPageView, setAccountSubPageView] = useState<AccountSubPageView>('editProfile');
    const [checkoutStep, setCheckoutStep] = useState(1);
    const [pageHistory, setPageHistory] = useState<Page[]>(['products']);
    const [notifications, setNotifications] = useState<{ id: number, message: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedOrderStatus, setSelectedOrderStatus] = useState<SelectedStatus>(null);
    const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);
    const [adminView, setAdminView] = useState<AdminView>('overview'); 

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    // Stabilize loadRealData to prevent re-renders when passed down
    const loadRealData = React.useCallback(async (user: User) => {
        setIsLoadingProducts(true);
        try {
            const [fetchedProducts, fetchedCategories, fetchedSettings, fetchedFaqs] = await Promise.all([
                firebaseService.getProducts(),
                firebaseService.getCategories(),
                firebaseService.getSiteSettings(),
                Promise.resolve([]) // Add faq fetch if needed
            ]);

            if (fetchedProducts.length > 0) setProducts(fetchedProducts);
            if (fetchedCategories.length > 0) setCategories(fetchedCategories);
            if (fetchedSettings) setSiteSettings(fetchedSettings);
            
            // User specific data
            const [fetchedOrders, fetchedCustomers, fetchedWithdrawals] = await Promise.all([
                firebaseService.getOrders(user.is_admin ? undefined : user.id),
                firebaseService.getCustomers(user.id),
                firebaseService.getWithdrawalRequests(user.is_admin ? undefined : user.id)
            ]);
            
            setOrders(fetchedOrders);
            setCustomers(fetchedCustomers);
            setWithdrawalRequests(fetchedWithdrawals);

        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setIsLoadingProducts(false);
        }
    }, [mockProducts, mockCategories]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Ensure initial data exists in Firestore - only bootstrap admin triggers it
                if (user.email?.toLowerCase() === 'xahmedthaer@gmail.com') {
                    import('./services/seedService').then(m => m.seedInitialData());
                }
                
                const profile = await firebaseService.syncUserProfile(user);
                setCurrentUser(profile);
                if (profile) loadRealData(profile);
            } else {
                setCurrentUser(null);
                setProducts(mockProducts);
                setCategories(mockCategories);
            }
            setIsAuthChecking(false);
        });
        return () => unsubscribe();
    }, [loadRealData]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Clear all states to prevent data leakage between sessions
            setCurrentUser(null);
            setOrders([]);
            setCustomers([]);
            setWithdrawalRequests([]);
            setCartItems([]);
            setSavedProductIds([]);
            setPage('products');
            setMainView('products');
            addNotification('تم تسجيل الخروج بنجاح');
        } catch (error) {
            console.error("Logout failed", error);
            addNotification('فشل تسجيل الخروج');
        }
    };

    const addNotification = (message: string) => {
        const newId = Date.now();
        setNotifications(prev => [...prev, { id: newId, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newId));
        }, 3000); 
    };

    const navigateTo = (newPage: Page) => {
        setPageHistory(prev => [...prev, page]);
        setPage(newPage);
    };

    const handleBack = React.useCallback(() => {
        if (headerConfig?.showBack && headerConfig.onBack) {
            headerConfig.onBack();
            return;
        }
        if (page === 'products' && (selectedCategory || globalSearchQuery)) {
            setSelectedCategory(null);
            setGlobalSearchQuery('');
            return;
        }
        if (page === 'orders' && selectedOrderStatus) {
            setSelectedOrderStatus(null);
            return;
        }
        const lastPage = pageHistory[pageHistory.length - 1] || 'products';
        setPageHistory(prev => prev.slice(0, -1));
        setPage(lastPage);
    }, [headerConfig, page, selectedCategory, globalSearchQuery, selectedOrderStatus, pageHistory]);

    const handleMainViewChange = React.useCallback((view: MainView) => {
        if (view === 'products') {
            setSelectedCategory(null);
            setGlobalSearchQuery('');
        }
        if (view !== 'orders') {
            setSelectedOrderStatus(null);
        }
        setMainView(view);
        navigateTo(view as Page);
    }, [navigateTo]);
    
    const handleCategorySelect = React.useCallback((category: Category) => {
        if (category.name === 'الكل') {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(category);
        }
    }, []);
    
    const handleCategorySelectForPage = React.useCallback((category: Category) => {
        if (category.name === 'الكل') {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(category);
        }
        setMainView('products'); 
        navigateTo('products');
    }, [navigateTo]);

    const handleProductClick = React.useCallback((product: Product) => {
        setSelectedProduct(product);
        navigateTo('productDetails');
    }, [navigateTo]);

    const handleSaveToggle = React.useCallback((productId: string) => {
        setSavedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
        // We use a small hack for notification because we don't want savedProductIds in dependency
        addNotification('تم تحديث المحفوظات');
    }, [addNotification]);

    const handleAddToCart = React.useCallback((product: Product, size: string) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.product.id === product.id && item.size === size);
            if (existingItem) {
                return prev.map(item =>
                    item.product.id === product.id && item.size === size
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1, size, customer_price: 0 }];
        });
        addNotification(`تمت إضافة "${product.name}" إلى السلة`);
    }, [addNotification]);

    const handleUpdateCartQuantity = React.useCallback((productId: string, size: string, quantity: number) => {
        if (quantity <= 0) {
            setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
        } else {
            setCartItems(prev =>
                prev.map(item =>
                    item.product.id === productId && item.size === size ? { ...item, quantity } : item
                )
            );
        }
    }, []);
    
    const handleUpdateCartPrice = React.useCallback((productId: string, size: string, price: number) => {
        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId && item.size === size ? { ...item, customer_price: price } : item
            )
        );
    }, []);
    
    const handleClearCart = React.useCallback(() => {
        if (window.confirm("هل أنت متأكد من رغبتك في إفراغ السلة؟")) {
            setCartItems([]);
        }
    }, [])

    const handleOrderClick = React.useCallback((order: Order) => {
        setSelectedOrder(order);
        navigateTo('orderDetails');
    }, [navigateTo]);

    const handleOrderConfirmed = React.useCallback(async (orderData: Omit<Order, 'id' | 'user_id' | 'date' | 'time' | 'status' | 'created_at'>) => {
        if (!currentUser) {
            addNotification("يجب تسجيل الدخول لإكمال الطلب.");
            return;
        }
        const newOrder: Order = {
            ...orderData,
            id: `order-${Date.now()}`,
            user_id: currentUser.id,
            status: 'under_implementation',
            date: new Date().toLocaleDateString('ar-IQ'),
            time: new Date().toLocaleTimeString('ar-IQ'),
            created_at: new Date().toISOString(),
        };
        
        await firebaseService.createOrder(newOrder);
        setOrders(prev => [newOrder, ...prev]);
        setCartItems([]);
        setCheckoutStep(1);
        navigateTo('orders');
        addNotification("تم إرسال طلبك بنجاح!");
    }, [currentUser, navigateTo, addNotification]);

    const handleAddCustomer = React.useCallback(async (customerData: Omit<Customer, 'id' | 'user_id'>) => {
        if (!currentUser) return null;
        const newCustomer: Customer = { ...customerData, id: `cust-${Date.now()}`, user_id: currentUser.id };
        const savedCustomer = await firebaseService.addCustomer(newCustomer);
        if (savedCustomer) {
            setCustomers(prev => [savedCustomer, ...prev]);
            addNotification('تمت إضافة الزبون بنجاح');
            return savedCustomer;
        }
        return null;
    }, [currentUser, addNotification]);

    const handleUpdateCustomer = React.useCallback(async (updatedCustomer: Customer) => {
        await firebaseService.addCustomer(updatedCustomer); 
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? { ...c, ...updatedCustomer } : c));
        addNotification('تم تحديث بيانات الزبون');
    }, [addNotification]);

    const handleDeleteCustomer = React.useCallback((customerId: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الزبون؟")) {
            setCustomers(prev => prev.filter(c => c.id !== customerId));
            addNotification('تم حذف الزبون');
        }
    }, [addNotification]);

    const handleAccountMenuClick = React.useCallback((view: AccountSubPageView) => {
        setAccountSubPageView(view);
        if (view === 'adminDashboard') {
            setAdminView('overview');
        }
        navigateTo('accountSubPage');
        if (view !== 'adminDashboard') {
            setHeaderConfig(null);
        }
    }, [navigateTo]);
    
    const handleUpdateUser = React.useCallback((updatedUserData: Partial<User>) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updatedUserData };
        setCurrentUser(updatedUser);
        addNotification('تم تحديث الملف الشخصي بنجاح');
    }, [currentUser, addNotification]);

    const handleAddProduct = React.useCallback(async (newProductData: Omit<Product, 'id'>) => {
        const product = await firebaseService.addProduct(newProductData);
        if (product) {
            setProducts(prev => [product, ...prev]);
            addNotification(`تمت إضافة المنتج "${product.name}"`);
        }
    }, [addNotification]);

    const handleUpdateProduct = React.useCallback(async (updatedProduct: Product) => {
        await firebaseService.updateProduct(updatedProduct);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        addNotification(`تم تحديث المنتج "${updatedProduct.name}"`);
    }, [addNotification]);

    const handleDeleteProduct = React.useCallback(async (productId: string) => {
        await firebaseService.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        addNotification('تم حذف المنتج');
    }, [addNotification]);

    const handleUpdateOrderStatus = React.useCallback(async (orderId: string, status: Order['status']) => {
        await firebaseService.updateOrderStatus(orderId, status);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status } : prev);
        addNotification(`تم تحديث حالة الطلب #${orderId}`);
    }, [addNotification]);

    const handleAdminUpdateOrder = React.useCallback(async (orderId: string, updates: Partial<Order>) => {
        await firebaseService.updateOrder(orderId, updates);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
        setSelectedOrder(prev => prev?.id === orderId ? { ...prev, ...updates } : prev);
        addNotification(`تم تعديل بيانات الطلب #${orderId}`);
    }, [addNotification]);

    const handleDeleteUser = (userId: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته المتعلقة.")) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setOrders(prev => prev.filter(o => o.user_id !== userId));
            setCustomers(prev => prev.filter(c => c.user_id !== userId));
            setWithdrawalRequests(prev => prev.filter(w => w.user_id !== userId));
            addNotification('تم حذف المستخدم');
        }
    };

    const handleProcessWithdrawal = async (request: WithdrawalRequest) => {
        if (window.confirm(`هل تؤكد إتمام تحويل مبلغ ${request.amount.toLocaleString()} IQD للمستخدم؟`)) {
            const updates = { status: 'completed' as const, processed_date: new Date().toISOString() };
            await firebaseService.updateWithdrawalRequest(request.id, updates);
            setWithdrawalRequests(prev => prev.map(r => r.id === request.id ? { ...r, ...updates } : r));
            addNotification('تمت معالجة طلب السحب');
        }
    };

    const handleAddWithdrawalRequest = async (walletType: string, walletNumber: string) => {
        if (!currentUser || realizedBalance <= 0 || withdrawalRequests.some(r => r.user_id === currentUser.id && r.status === 'pending')) {
            addNotification('لا يمكن إنشاء طلب سحب حاليًا.');
            return;
        }
        const newRequest: WithdrawalRequest = {
            id: `wd-${Date.now()}`,
            user_id: currentUser.id,
            amount: realizedBalance,
            status: 'pending',
            request_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            wallet_type: walletType,
            wallet_number: walletNumber,
        };
        await firebaseService.createWithdrawalRequest(newRequest);
        setWithdrawalRequests(prev => [newRequest, ...prev]);
        addNotification('تم إرسال طلب سحب الأرباح بنجاح');
    };
    
    const handleSetFaqItems = (items: FaqItem[]) => {
        setFaqItems(items);
        addNotification('تم تحديث قسم التعليمات');
    };

    const handleUpdateSiteSettings = (settings: Partial<SiteSettings>) => {
        setSiteSettings(prev => ({ ...prev, ...settings }));
        addNotification('تم تحديث إعدادات المتجر');
    };
    
    const handleSetCategories = (newCategories: Category[]) => {
        setCategories(newCategories);
        addNotification('تم تحديث فئات المتجر');
    };

    // Support Logic - Updated to WhatsApp
    const handleWhatsAppSupport = () => {
        const phone = "+964774402688";
        const message = "مرحباً دعم لوكات بزنس، أحتاج للمساعدة بخصوص...";
        const url = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const totalEarnings = React.useMemo(() => {
        if (!currentUser) return 0;
        return orders
            .filter(o => o.user_id === currentUser.id && (o.status === 'completed' || o.status === 'partially_delivered'))
            .reduce((sum, o) => sum + o.profit, 0); 
    }, [orders, currentUser]);

    const pendingProfit = React.useMemo(() => {
        if (!currentUser) return 0;
        return orders
            .filter(o => o.user_id === currentUser.id && (o.status === 'under_implementation' || o.status === 'shipped'))
            .reduce((sum, o) => sum + o.profit, 0);
    }, [orders, currentUser]);

    const totalWithdrawn = React.useMemo(() => {
        if (!currentUser) return 0;
        return withdrawalRequests
            .filter(r => r.user_id === currentUser.id && r.status === 'completed')
            .reduce((sum, r) => sum + r.amount, 0);
    }, [withdrawalRequests, currentUser]);

    const realizedBalance = React.useMemo(() => {
        const pendingWithdrawalsAmount = withdrawalRequests
            .filter(r => r.user_id === currentUser?.id && r.status === 'pending')
            .reduce((sum, r) => sum + r.amount, 0);
        
        return totalEarnings - totalWithdrawn - pendingWithdrawalsAmount;
    }, [totalEarnings, totalWithdrawn, withdrawalRequests, currentUser]);

    const totalReturns = React.useMemo(() => {
        if (!currentUser) return 0;
        return orders
            .filter(o => o.user_id === currentUser.id && (o.status === 'cancelled' || o.status === 'rejected'))
            .reduce((sum, o) => sum + o.profit, 0);
    }, [orders, currentUser]);


    const userOrders = useMemo(() => orders.filter(o => o.user_id === currentUser?.id), [orders, currentUser]);
    const userTickets = useMemo(() => tickets.filter(t => t.user_id === currentUser?.id), [tickets, currentUser]);

    const renderPage = () => {
        switch (page) {
            case 'products':
                return <ProductsPage 
                    products={products} 
                    onProductClick={handleProductClick} 
                    savedProductIds={savedProductIds} 
                    onSaveToggle={handleSaveToggle} 
                    banners={siteSettings.banners}
                    isLoadingProducts={isLoadingProducts}
                    onAddToCart={handleAddToCart}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    onExploreClick={() => navigateTo('categories')} 
                    promoSettings={siteSettings.promoCard}
                    externalSearchQuery={globalSearchQuery}
                />;
            case 'categories':
                return <CategoriesPage 
                    categories={categories}
                    onCategorySelect={handleCategorySelectForPage}
                />;
            case 'orders':
                return <OrdersPage 
                    orders={userOrders} 
                    onOrderClick={handleOrderClick} 
                    currentUser={currentUser} 
                    selectedStatus={selectedOrderStatus}
                    onStatusSelect={setSelectedOrderStatus}
                    addNotification={addNotification}
                    onInitiateTicketThread={() => {}} 
                />;
            case 'account':
                return <AccountPage 
                    onMenuClick={handleAccountMenuClick} 
                    currentUser={currentUser} 
                    realizedBalance={realizedBalance}
                    pendingProfit={pendingProfit}
                    hasPendingWithdrawal={withdrawalRequests.some(r => r.user_id === currentUser?.id && r.status === 'pending')}
                    isLoadingWithdrawals={false}
                    onNavigateToWithdrawals={() => handleMainViewChange('financial')}
                    onLogout={handleLogout}
                />;
            case 'financial':
                return <WithdrawalsPage 
                    realizedBalance={realizedBalance}
                    pendingProfit={pendingProfit}
                    totalReturns={totalReturns}
                    totalWithdrawn={totalWithdrawn}
                    hasPendingWithdrawal={withdrawalRequests.some(r => r.user_id === currentUser?.id && r.status === 'pending')}
                    onAddWithdrawalRequest={handleAddWithdrawalRequest}
                    withdrawalRequests={withdrawalRequests.filter(r => r.user_id === currentUser?.id)}
                    onBack={() => {}} 
                />;
            case 'productDetails':
                if (!selectedProduct) return <div>لم يتم العثور على المنتج.</div>;
                return <ProductDetailsPage 
                    product={selectedProduct} 
                    onAddToCart={handleAddToCart} 
                    addNotification={addNotification} 
                    isSaved={savedProductIds.includes(selectedProduct.id)}
                    onSaveToggle={handleSaveToggle}
                />;
            case 'cart':
                return <CartPage 
                            cartItems={cartItems} 
                            onUpdateQuantity={handleUpdateCartQuantity} 
                            onUpdatePrice={handleUpdateCartPrice}
                            onCheckout={() => { setCheckoutStep(1); navigateTo('checkout'); }} 
                            onClearCart={handleClearCart} 
                       />;
            case 'checkout':
                return <CheckoutPage 
                    cartItems={cartItems} 
                    onOrderConfirmed={handleOrderConfirmed}
                    customers={customers.filter(c => c.user_id === currentUser?.id)}
                    onAddCustomer={handleAddCustomer}
                    onUpdateCustomer={handleUpdateCustomer}
                    onDeleteCustomer={handleDeleteCustomer}
                    step={checkoutStep}
                    setStep={setCheckoutStep}
                    coupons={[]} 
                />;
            case 'orderDetails':
                if (!selectedOrder) return <div>لم يتم العثور على الطلب.</div>;
                const orderingUser = users.find(u => u.id === selectedOrder.user_id) || null;
                return <OrderDetailsPage 
                    order={selectedOrder} 
                    orderingUser={orderingUser}
                    onUpdateStatus={handleUpdateOrderStatus} 
                    onBack={handleBack} 
                    addNotification={addNotification} 
                    userTicketsForOrder={tickets.filter(t => t.order_id === selectedOrder.id && t.user_id === currentUser?.id)}
                    onInitiateTicketThread={() => {}}
                    onOpenTicketChat={(ticket) => setActiveTicketChat(ticket)}
                    currentUser={currentUser} 
                    onAdminUpdateOrder={handleAdminUpdateOrder}
                />;
            case 'accountSubPage':
                return <AccountSubPage 
                    view={accountSubPageView}
                    savedProductIds={savedProductIds}
                    onSaveToggle={handleSaveToggle}
                    products={products}
                    customers={customers}
                    addNotification={addNotification}
                    currentUser={currentUser}
                    orders={orders}
                    users={users}
                    withdrawalRequests={withdrawalRequests}
                    faqItems={faqItems}
                    siteSettings={siteSettings}
                    categories={categories}
                    tickets={tickets}
                    userTickets={userTickets}
                    userOrders={userOrders}
                    coupons={[]} 
                    onAddCustomer={handleAddCustomer}
                    onUpdateCustomer={handleUpdateCustomer}
                    onDeleteCustomer={handleDeleteCustomer}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onUpdateUser={handleUpdateUser}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onDeleteUser={handleDeleteUser}
                    onProcessWithdrawal={handleProcessWithdrawal}
                    onSetFaqItems={handleSetFaqItems}
                    onUpdateSiteSettings={handleUpdateSiteSettings}
                    onSetCategories={handleSetCategories}
                    onAdminOrderClick={handleOrderClick}
                    onUpdateTicketThreadStatus={() => {}}
                    onAddTicketMessage={() => {}}
                    onOpenTicketChat={(ticket) => setActiveTicketChat(ticket)}
                    onInitiateTicketThread={() => {}}
                    setHeaderConfig={setHeaderConfig}
                    onAddCoupon={() => {}} 
                    onUpdateCoupon={() => {}} 
                    onDeleteCoupon={() => {}} 
                    systemNotifications={[]}
                    onMarkSystemNotificationAsRead={() => {}}
                    adminView={adminView}
                    setAdminView={setAdminView}
                    onAdminUpdateOrder={handleAdminUpdateOrder}
                />;
            case 'statistics':
                return <StatisticsPage 
                    orders={userOrders}
                    totalEarnings={totalEarnings}
                />;
            default:
                return <ProductsPage 
                    products={products} 
                    onProductClick={handleProductClick} 
                    savedProductIds={savedProductIds} 
                    onSaveToggle={handleSaveToggle} 
                    banners={siteSettings.banners}
                    isLoadingProducts={isLoadingProducts}
                    onAddToCart={handleAddToCart}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    onExploreClick={() => navigateTo('categories')}
                    promoSettings={siteSettings.promoCard}
                    externalSearchQuery={globalSearchQuery}
                />;
        }
    };
    
    const showBottomNav = ['products', 'orders', 'account', 'financial', 'categories'].includes(page);
    const showMainHeader = true; 

    const getCheckoutTitle = () => {
        if (page !== 'checkout') return '';
        switch (checkoutStep) {
            case 1: return 'معلومات الزبون';
            case 2: return 'تأكيد الطلب';
            default: return 'إتمام الطلب';
        }
    };

    const orderStatusMap: { [key: string]: string } = {
        all: 'جميع الطلبات',
        under_implementation: 'قيد معالجة',
        shipped: 'جاري التوصيل',
        completed: 'تم التسليم',
        cancelled_rejected: 'ملغي / راجع',
        prepared: 'تم التجهيز',
        postponed: 'مؤجل',
        partially_delivered: 'واصل جزئي',
    };

    if (isAuthChecking) {
        return (
            <div className="h-screen w-screen bg-white dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <AuthPage addNotification={addNotification} />;
    }

    return (
        <div className="h-screen w-screen max-w-lg mx-auto bg-white dark:bg-slate-900 flex flex-col font-cairo" dir="rtl">
            {showMainHeader && <Header 
                page={page} 
                onBack={handleBack}
                cartItemCount={cartItems.length}
                onCartClick={() => navigateTo('cart')}
                onSupportClick={handleWhatsAppSupport} 
                onSavedProductsClick={() => handleAccountMenuClick('savedProducts')}
                onClearCart={handleClearCart}
                orderId={selectedOrder?.id}
                isProductSaved={selectedProduct ? savedProductIds.includes(selectedProduct.id) : false}
                onSaveToggle={selectedProduct ? () => handleSaveToggle(selectedProduct.id) : undefined}
                accountSubPageTitle={
                    accountSubPageView === 'editProfile' ? 'تعديل الملف الشخصي' :
                    accountSubPageView === 'savedProducts' ? 'المنتجات المحفوظة' :
                    accountSubPageView === 'customerDetails' ? 'تفاصيل الزبائن' :
                    accountSubPageView === 'instructions' ? 'الاسئلة الشائعة' :
                    accountSubPageView === 'adminDashboard' ? 'لوحة التحكم' : 
                    accountSubPageView === 'privacyPolicy' ? 'سياسة الخصوصية' :
                    accountSubPageView === 'termsAndConditions' ? 'الشروط والأحكام' : 
                    accountSubPageView === 'serviceFees' ? 'رسوم الخدمة' :
                    accountSubPageView === 'myTickets' ? 'تذاكري' : ''
                }
                checkoutPageTitle={getCheckoutTitle()}
                categoryTitle={selectedCategory?.name}
                orderStatusTitle={selectedOrderStatus ? orderStatusMap[selectedOrderStatus] : undefined}
                headerConfig={headerConfig}
                searchQuery={globalSearchQuery}
                setSearchQuery={setGlobalSearchQuery}
            />}
            <main className={`flex-grow overflow-y-auto ${showBottomNav ? 'pb-16' : ''}`}>
                {renderPage()}
            </main>
            {showBottomNav && <BottomNav activeView={mainView} setActiveView={handleMainViewChange} />}

            {/* Support Chat Modal */}
            {activeTicketChat && (
                <TicketChatModal 
                    ticketThread={activeTicketChat}
                    order={orders.find(o => o.id === activeTicketChat.order_id)!}
                    currentUser={currentUser!}
                    onClose={() => setActiveTicketChat(null)}
                    onSendMessage={() => {}}
                    isAdminView={currentUser?.is_admin || false}
                    onUpdateTicketStatus={() => {}}
                    addNotification={addNotification}
                />
            )}

            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-2 pointer-events-none items-center w-full max-w-sm px-4">
                {notifications.map(n => (
                    <div 
                        key={n.id} 
                        className="pointer-events-auto bg-[#1E1E1E]/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-black shadow-xl shadow-black/5 rounded-full py-2.5 px-5 flex items-center gap-3 animate-notification border border-white/5 dark:border-black/5"
                    >
                        <div className="w-4 h-4 bg-[#2ecc71] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(46,204,113,0.4)]">
                            <i className="fa-solid fa-check text-white text-[8px]"></i>
                        </div>
                        <span className="text-[11px] font-bold tracking-wide leading-none pt-0.5">
                            {n.message}
                        </span>
                    </div>
                ))}
            </div>
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    @keyframes notification-enter {
                        0% { transform: translateY(-150%) scale(0.9); opacity: 0; }
                        60% { transform: translateY(4px) scale(1.02); }
                        100% { transform: translateY(0) scale(1); opacity: 1; }
                    }
                    .animate-notification {
                        animation: notification-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    }
                `}
            </style>
        </div>
    );
};

export default App;
