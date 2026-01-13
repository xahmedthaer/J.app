
import React, { useState, useEffect, useMemo } from 'react';

// Import types
import { Product, CartItem, Order, User, Customer, WithdrawalRequest, FaqItem, SiteSettings, Category, Coupon, Supplier, SupplierWithdrawal, AppNotification, AdminView, Ticket } from './types';

// Import mock data
import { mockProducts, mockOrders, mockUsers, mockCustomers, mockWithdrawalRequests, mockFaqItems, mockSiteSettings, mockCategories, mockSystemNotifications } from './data/mockData';

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

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[2]);
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
        setTimeout(() => {
            setProducts(mockProducts);
            setOrders(mockOrders);
            setUsers(mockUsers);
            setCustomers(mockCustomers);
            setWithdrawalRequests(mockWithdrawalRequests);
            setFaqItems(mockFaqItems);
            setSiteSettings(mockSiteSettings);
            setCategories(mockCategories);
            setIsLoadingProducts(false);
        }, 1000);
    }, []);

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

    const handleBack = () => {
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
    };

    const handleMainViewChange = (view: MainView) => {
        if (view === 'products') {
            setSelectedCategory(null);
            setGlobalSearchQuery('');
        }
        if (view !== 'orders') {
            setSelectedOrderStatus(null);
        }
        setMainView(view);
        navigateTo(view as Page);
    };
    
    const handleCategorySelect = (category: Category) => {
        if (category.name === 'الكل') {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(category);
        }
    };
    
    const handleCategorySelectForPage = (category: Category) => {
        if (category.name === 'الكل') {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(category);
        }
        setMainView('products'); 
        navigateTo('products');
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        navigateTo('productDetails');
    };

    const handleSaveToggle = (productId: string) => {
        setSavedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
        addNotification(savedProductIds.includes(productId) ? 'تمت إزالة المنتج من المحفوظات' : 'تم حفظ المنتج');
    };

    const handleAddToCart = (product: Product, size: string) => {
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
    };

    const handleUpdateCartQuantity = (productId: string, size: string, quantity: number) => {
        if (quantity <= 0) {
            setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
        } else {
            setCartItems(prev =>
                prev.map(item =>
                    item.product.id === productId && item.size === size ? { ...item, quantity } : item
                )
            );
        }
    };
    
    const handleUpdateCartPrice = (productId: string, size: string, price: number) => {
        setCartItems(prev =>
            prev.map(item =>
                item.product.id === productId && item.size === size ? { ...item, customer_price: price } : item
            )
        );
    };
    
    const handleClearCart = () => {
        if (window.confirm("هل أنت متأكد من رغبتك في إفراغ السلة؟")) {
            setCartItems([]);
        }
    }

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        navigateTo('orderDetails');
    };

    const handleOrderConfirmed = (orderData: Omit<Order, 'id' | 'user_id' | 'date' | 'time' | 'status' | 'created_at'>) => {
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
        setOrders(prev => [newOrder, ...prev]);
        setCartItems([]);
        setCheckoutStep(1);
        navigateTo('orders');
        addNotification("تم إرسال طلبك بنجاح!");
    };

    const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'user_id'>) => {
        if (!currentUser) return null;
        const newCustomer: Customer = { ...customerData, id: `cust-${Date.now()}`, user_id: currentUser.id };
        setCustomers(prev => [newCustomer, ...prev]);
        addNotification('تمت إضافة الزبون بنجاح');
        return newCustomer;
    };

    const handleUpdateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? { ...c, ...updatedCustomer } : c));
        addNotification('تم تحديث بيانات الزبون');
    };

    const handleDeleteCustomer = (customerId: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الزبون؟")) {
            setCustomers(prev => prev.filter(c => c.id !== customerId));
            addNotification('تم حذف الزبون');
        }
    };

    const handleAccountMenuClick = (view: AccountSubPageView) => {
        setAccountSubPageView(view);
        if (view === 'adminDashboard') {
            setAdminView('overview');
        }
        navigateTo('accountSubPage');
        if (view !== 'adminDashboard') {
            setHeaderConfig(null);
        }
    };
    
    const handleUpdateUser = (updatedUserData: Partial<User>) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updatedUserData };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        addNotification('تم تحديث الملف الشخصي بنجاح');
    };

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

    const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, status } : null);
        }
        addNotification(`تم تحديث حالة الطلب #${orderId}`);
    };

    const handleAdminUpdateOrder = (orderId: string, updates: Partial<Order>) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, ...updates } : null);
        }
        addNotification(`تم تعديل بيانات الطلب #${orderId}`);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته المتعلقة.")) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setOrders(prev => prev.filter(o => o.user_id !== userId));
            setCustomers(prev => prev.filter(c => c.user_id !== userId));
            setWithdrawalRequests(prev => prev.filter(w => w.user_id !== userId));
            addNotification('تم حذف المستخدم');
        }
    };

    const handleProcessWithdrawal = (request: WithdrawalRequest) => {
        if (window.confirm(`هل تؤكد إتمام تحويل مبلغ ${request.amount.toLocaleString()} IQD للمستخدم؟`)) {
            setWithdrawalRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'completed', processed_date: new Date().toISOString() } : r));
            addNotification('تمت معالجة طلب السحب');
        }
    };

    const handleAddWithdrawalRequest = (walletType: string, walletNumber: string) => {
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
        const message = "مرحباً دعم إلك، أحتاج للمساعدة بخصوص...";
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
                    onAddCustomer={handleAddCustomer as any}
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
                    onAddCustomer={handleAddCustomer as any}
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

    return (
        <div className="h-screen w-screen max-w-lg mx-auto bg-white dark:bg-slate-900 flex flex-col font-cairo" dir="rtl">
            {showMainHeader && <Header 
                page={page} 
                onBack={handleBack}
                cartItemCount={cartItems.length}
                onCartClick={() => navigateTo('cart')}
                onSupportClick={handleWhatsAppSupport} // Updated to WhatsApp handler
                onSavedProductsClick={() => handleAccountMenuClick('savedProducts')}
                onClearCart={handleClearCart}
                orderId={selectedOrder?.id}
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
