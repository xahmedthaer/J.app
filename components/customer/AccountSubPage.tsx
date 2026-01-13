
import React, { useState, useEffect, useMemo } from 'react';
import { AccountSubPageView, HeaderConfig } from '../../App';
import { SearchIcon, EditIcon, TrashIcon, AvatarIcon, UserPlusIcon, PlusIcon, XMarkIcon, ShieldIcon, CheckCircleIcon, Headset, RocketIcon } from '../common/icons';
import { Customer, Product, User, Order, WithdrawalRequest, FaqItem, SiteSettings, SupportInfo, Category, Ticket, TicketMessage, Coupon, Supplier, SupplierWithdrawal, AppNotification, AdminView } from '../../types';
import ProductCard from '../common/ProductCard';
import AdminDashboardPage from '../admin/AdminDashboardPage';
import SearchBar from '../common/SearchBar';
import MyTicketsPage from './MyTicketsPage';

// --- Change Password Modal ---
const ChangePasswordModal: React.FC<{
    onClose: () => void;
    onSave: (newPass: string) => void;
}> = ({ onClose, onSave }) => {
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const handleSubmit = () => {
        if (!currentPass || !newPass || !confirmPass) {
            alert('يرجى ملء جميع الحقول');
            return;
        }
        if (newPass.length < 6) {
            alert('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        if (newPass !== confirmPass) {
            alert('كلمات المرور الجديدة غير متطابقة');
            return;
        }
        // In a real application, you would verify currentPass here or pass it to the backend.
        onSave(newPass);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4 animate-slide-up shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <ShieldIcon className="w-5 h-5 text-primary"/>
                        تغيير كلمة المرور
                    </h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500 hover:text-red-500" /></button>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="block text-right text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">كلمة المرور الحالية</label>
                        <input type="password" placeholder="********" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-right text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">كلمة المرور الجديدة</label>
                        <input type="password" placeholder="********" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-right text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">تأكيد كلمة المرور الجديدة</label>
                        <input type="password" placeholder="********" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">إلغاء</button>
                    <button onClick={handleSubmit} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors">حفظ التغيير</button>
                </div>
            </div>
        </div>
    );
};

// --- Delete Account Modal ---
const DeleteAccountModal: React.FC<{
    onClose: () => void;
    onConfirm: () => void;
}> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4 animate-slide-up shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center space-y-3 pt-2">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                        <i className="fa-solid fa-triangle-exclamation text-3xl text-red-600 dark:text-red-500"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">هل تريد حذف الحساب؟</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-2">
                        سيتم إزالة الحساب وجميع البيانات المتعلقة به نهائياً. لا يمكن التراجع عن هذا الإجراء.
                    </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                    <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                        إلغاء
                    </button>
                    <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">
                        حذف الحساب
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Edit Profile View ---
const EditProfilePage: React.FC<{ 
    currentUser: User | null;
    onUpdateUser: (user: Partial<User> & { password?: string }) => void;
    onDeleteUser: (userId: string) => void;
    addNotification: (message: string) => void; 
}> = ({ currentUser, onUpdateUser, onDeleteUser, addNotification }) => {
    const [name, setName] = useState(currentUser?.name || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [storeName, setStoreName] = useState(currentUser?.store_name || '');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const email = currentUser?.email || '';

    const handleSaveChanges = () => {
        if (!currentUser) return;
        if (!name) {
            addNotification('الاسم حقل مطلوب.');
            return;
        }
        if (!phone) {
            addNotification('رقم الهاتف حقل مطلوب.');
            return;
        }
        onUpdateUser({
            name,
            phone,
            store_name: storeName,
        });
    };

    const handlePasswordUpdate = (newPassword: string) => {
        onUpdateUser({ password: newPassword });
    };

    const handleConfirmDelete = () => {
        if (!currentUser) return;
        onDeleteUser(currentUser.id);
    };

    return (
        <div className="p-4 space-y-6 pb-24 dark:bg-slate-900">
            {isPasswordModalOpen && (
                <ChangePasswordModal 
                    onClose={() => setIsPasswordModalOpen(false)} 
                    onSave={handlePasswordUpdate} 
                />
            )}
            
            {isDeleteModalOpen && (
                <DeleteAccountModal
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                />
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 space-y-4">
                <h3 className="font-bold text-lg dark:text-gray-100 border-b dark:border-gray-700 pb-2">المعلومات الشخصية</h3>
                
                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">الاسم</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">اسم المتجر</label>
                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="اسم متجرك / صفحتك" className="w-full mt-1 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                </div>

                 <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">رقم الهاتف</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">البريد الإلكتروني</label>
                    <input type="email" value={email} readOnly className="w-full mt-1 p-3 border rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed" />
                </div>
                
                <div className="pt-2 flex flex-col gap-3">
                    <button onClick={handleSaveChanges} className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition-colors">
                        حفظ المعلومات
                    </button>
                    
                    <button 
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShieldIcon className="w-4 h-4"/>
                        تغيير كلمة المرور
                    </button>
                </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
                <button 
                    onClick={() => setIsDeleteModalOpen(true)} 
                    className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-bold py-3.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                >
                    <TrashIcon className="w-5 h-5"/>
                    حذف الحساب
                </button>
            </div>
        </div>
    );
};

// --- Saved Products View ---
const SavedProductsPage: React.FC<{ 
    savedProductIds: string[]; 
    onSaveToggle: (id: string) => void;
    products: Product[];
}> = ({ savedProductIds, onSaveToggle, products }) => {
    const savedProducts = products.filter(p => savedProductIds.includes(p.id));
    
    if (savedProducts.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)] text-gray-500 dark:text-gray-400 dark:bg-slate-900">
                <h2 className="text-xl font-bold">لا يوجد منتجات محفوظة</h2>
            </div>
        );
    }

    return (
        <div className="p-4 grid grid-cols-2 gap-4 dark:bg-slate-900">
            {savedProducts.map(product => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => {}} 
                    isSaved={true} 
                    onSaveToggle={onSaveToggle}
                />
            ))}
        </div>
    );
};

const iraqiGovernorates = [
    'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك', 'كركوك',
    'الأنبار', 'صلاح الدين', 'ديالى', 'واسط', 'ميسان', 'ذي قار',
    'المثنى', 'الديوانية', 'بابل', 'كربلاء', 'النجف'
];

// Customer Add/Edit Modal (Local to CustomerDetailsPage)
const CustomerFormModal: React.FC<{
    customerToEdit?: Customer | null;
    onClose: () => void;
    onSave: (customer: Customer | Omit<Customer, 'id' | 'user_id'>) => void;
}> = ({ customerToEdit, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [governorate, setGovernorate] = useState('');
    const [region, setRegion] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if(customerToEdit) {
            setName(customerToEdit.name);
            setPhone(customerToEdit.phone);
            setGovernorate(customerToEdit.governorate || '');
            setRegion(customerToEdit.region || '');
            setNotes(customerToEdit.notes);
        }
    }, [customerToEdit]);

    const handleSave = () => {
        const errors: string[] = [];
        if (!name) errors.push('حقل الاسم مطلوب.');
        if (!phone) errors.push('حقل رقم الهاتف مطلوب.');
        if (!governorate) errors.push('حقل المحافظة مطلوب.');
        if (!region) errors.push('حقل المنطقة مطلوب.');
        if (phone && !/^\d{11}$/.test(phone)) errors.push('رقم الهاتف يجب أن يتكون من 11 رقمًا.');

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        const address = `${governorate}، ${region}`;
        const customerData = { name, phone, address, governorate, region, notes };
        if (customerToEdit) {
            onSave({ ...customerData, id: customerToEdit.id, user_id: customerToEdit.user_id });
        } else {
            onSave(customerData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-right dark:text-gray-100">{customerToEdit ? 'تعديل الزبون' : 'إضافة زبون جديد'}</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-300" /></button>
                </div>
                <input type="text" placeholder="الاسم" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white" />
                <input type="tel" placeholder="رقم الهاتف (11 رقم)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white" />
                <select value={governorate} onChange={e => setGovernorate(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white">
                    <option value="">اختر المحافظة</option>
                    {iraqiGovernorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                </select>
                <input type="text" placeholder="المنطقة" value={region} onChange={e => setRegion(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white" />
                <textarea placeholder="ملاحظات (اختياري)" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right h-24 bg-white dark:bg-gray-700 dark:text-white"></textarea>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg">إلغاء</button>
                    <button onClick={handleSave} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg">حفظ</button>
                </div>
            </div>
        </div>
    );
};


// --- Customer Details View ---
const CustomerDetailsPage: React.FC<{ 
    customers: Customer[];
    onAddCustomer: (customer: Omit<Customer, 'id' | 'user_id'>) => void;
    onUpdateCustomer: (customer: Customer) => void;
    onDeleteCustomer: (customerId: string) => void;
}> = ({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer }) => {
    const [modalState, setModalState] = useState<{isOpen: boolean, customerToEdit?: Customer | null}>({isOpen: false, customerToEdit: null});
    const [searchQuery, setSearchQuery] = useState('');

    const handleSave = (customerData: Customer | Omit<Customer, 'id' | 'user_id'>) => {
        if('id' in customerData) {
            onUpdateCustomer(customerData);
        } else {
            onAddCustomer(customerData);
        }
    };
    
    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers;
        const lcQuery = searchQuery.toLowerCase().trim();
        return customers.filter(c => 
            c.name.toLowerCase().includes(lcQuery) ||
            c.phone.includes(lcQuery) ||
            c.address.toLowerCase().includes(lcQuery)
        );
    }, [customers, searchQuery]);
    
    return (
    <div className="bg-white dark:bg-slate-900">
        {modalState.isOpen && (
            <CustomerFormModal 
                onClose={() => setModalState({isOpen: false})}
                onSave={handleSave}
                customerToEdit={modalState.customerToEdit}
            />
        )}
        <div className="px-4 py-3 flex justify-between items-center gap-4 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b dark:border-gray-800">
            <button onClick={() => setModalState({isOpen: true, customerToEdit: null})} className="p-3 bg-primary text-white rounded-full flex-shrink-0">
                <UserPlusIcon className="w-6 h-6"/>
            </button>
            <div className="flex-grow">
                <SearchBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="...بحث بالاسم، الهاتف، أو العنوان"
                />
            </div>
        </div>
        <div className="p-4 pt-4 space-y-3">
            {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                    <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                                <button onClick={() => onDeleteCustomer(customer.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                                <button onClick={() => setModalState({isOpen: true, customerToEdit: customer})} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><EditIcon className="w-5 h-5" /></button>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{customer.name}</span>
                                    <AvatarIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{customer.phone}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">{customer.address}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
                    <p>لا يوجد زبائن لعرضهم.</p>
                </div>
            )}
        </div>
    </div>
    );
};

// --- Instructions (FAQ) View ---
const InstructionsPage: React.FC<{ faqItems: FaqItem[] }> = ({ faqItems }) => (
    <div className="p-4 space-y-3 dark:bg-slate-900 min-h-screen">
        {faqItems.map((faq, i) => (
            <details key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{faq.question}</span>
                    <PlusIcon className="w-5 h-5 text-primary transform group-open:rotate-45 transition-transform" />
                </summary>
                <div className="mt-4 pt-4 border-t dark:border-gray-700 text-gray-600 dark:text-gray-300 text-right leading-relaxed text-sm">
                    {faq.answer}
                </div>
            </details>
        ))}
    </div>
);

// --- Static Pages ---
const StaticPageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 space-y-4 dark:bg-slate-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-right mb-6 pb-2 border-b dark:border-gray-700 dark:text-gray-100">{title}</h2>
            <div className="text-right max-w-none space-y-4 leading-relaxed text-gray-700 dark:text-gray-300 text-sm">
                {children}
            </div>
        </div>
    </div>
);

const PrivacyPolicyPage: React.FC<{ content: string }> = ({ content }) => (
    <StaticPageLayout title="سياسة الخصوصية والاستخدام">
        <div className="whitespace-pre-wrap leading-loose">{content || 'سيتم إضافة المحتوى قريباً.'}</div>
    </StaticPageLayout>
);

const TermsAndConditionsPage: React.FC<{ content: string }> = ({ content }) => (
    <StaticPageLayout title="الشروط والأحكام">
        <div className="whitespace-pre-wrap leading-loose">{content || 'سيتم إضافة المحتوى قريباً.'}</div>
    </StaticPageLayout>
);

const ServiceFeesPage: React.FC<{ content: string }> = ({ content }) => (
    <StaticPageLayout title="رسوم الخدمة">
        <div className="whitespace-pre-wrap leading-loose">{content || 'سيتم إضافة المحتوى قريباً.'}</div>
    </StaticPageLayout>
);

// --- Main AccountSubPage Component ---

interface AccountSubPageProps {
    view: AccountSubPageView;
    savedProductIds: string[];
    onSaveToggle: (id: string) => void;
    products: Product[];
    customers: Customer[];
    addNotification: (message: string) => void;
    currentUser: User | null;
    orders: Order[];
    users: User[];
    withdrawalRequests: WithdrawalRequest[];
    faqItems: FaqItem[];
    siteSettings: SiteSettings;
    categories: Category[];
    tickets: Ticket[];
    userTickets: Ticket[];
    userOrders: Order[];
    coupons: Coupon[];
    onAddCustomer: (customer: Omit<Customer, 'id' | 'user_id'>) => Customer;
    onUpdateCustomer: (customer: Customer) => void;
    onDeleteCustomer: (customerId: string) => void;
    onAddProduct: (newProductData: Omit<Product, 'id'>) => void;
    onUpdateProduct: (updatedProduct: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onUpdateUser: (updatedUserData: Partial<User>) => void;
    onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
    onDeleteUser: (userId: string) => void;
    onProcessWithdrawal: (request: WithdrawalRequest) => void;
    onSetFaqItems: (items: FaqItem[]) => void;
    onUpdateSiteSettings: (settings: Partial<SiteSettings>) => void;
    onSetCategories: (categories: Category[]) => void;
    onAdminOrderClick: (order: Order) => void;
    onUpdateTicketThreadStatus: (ticketId: string, status: Ticket['status']) => void;
    onAddTicketMessage: (threadId: string, text?: string, imageUrl?: string) => void;
    onOpenTicketChat: (ticketThread: Ticket) => void;
    onInitiateTicketThread: (order: Order, initialMessageText: string) => void;
    setHeaderConfig: (config: HeaderConfig | null) => void;
    onAddCoupon: (coupon: Omit<Coupon, 'id' | 'used_count'>) => void;
    onUpdateCoupon: (coupon: Coupon) => void;
    onDeleteCoupon: (couponId: string) => void;
    
    // Notifications props
    systemNotifications: AppNotification[];
    onMarkSystemNotificationAsRead: (id: string) => void;

    // Admin View State
    adminView?: AdminView;
    setAdminView?: (view: AdminView) => void;
    onAdminUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

const AccountSubPage: React.FC<AccountSubPageProps> = (props) => {
    const { view, currentUser, setHeaderConfig } = props;

    useEffect(() => {
        if (view !== 'adminDashboard') {
            setHeaderConfig(null);
        }
    }, [view, setHeaderConfig]);

    switch (view) {
        case 'editProfile':
            return <EditProfilePage 
                        currentUser={currentUser} 
                        onUpdateUser={props.onUpdateUser} 
                        onDeleteUser={props.onDeleteUser} 
                        addNotification={props.addNotification} 
                   />;
        case 'savedProducts':
            return <SavedProductsPage savedProductIds={props.savedProductIds} onSaveToggle={props.onSaveToggle} products={props.products} />;
        case 'customerDetails':
            return <CustomerDetailsPage 
                        customers={props.customers} 
                        onAddCustomer={props.onAddCustomer} 
                        onUpdateCustomer={props.onUpdateCustomer} 
                        onDeleteCustomer={props.onDeleteCustomer} 
                    />;
        case 'instructions':
            return <InstructionsPage faqItems={props.faqItems} />;
        case 'privacyPolicy':
            return <PrivacyPolicyPage content={""} />; 
        case 'termsAndConditions':
            return <TermsAndConditionsPage content={""} />;
        case 'serviceFees':
            return <ServiceFeesPage content={""} />;
        case 'myTickets':
            return <MyTicketsPage 
                      tickets={props.userTickets} 
                      currentUser={currentUser} 
                      onOpenTicketChat={props.onOpenTicketChat}
                      userOrders={props.userOrders}
                      onInitiateTicketThread={props.onInitiateTicketThread}
                      addNotification={props.addNotification}
                   />;
        case 'adminDashboard':
            return currentUser?.is_admin ? (
                <AdminDashboardPage 
                    products={props.products}
                    onAddProduct={props.onAddProduct}
                    onUpdateProduct={props.onUpdateProduct}
                    onDeleteProduct={props.onDeleteProduct}
                    orders={props.orders}
                    users={props.users}
                    customers={props.customers}
                    onUpdateOrderStatus={props.onUpdateOrderStatus}
                    onDeleteUser={props.onDeleteUser}
                    withdrawalRequests={props.withdrawalRequests}
                    onProcessWithdrawal={props.onProcessWithdrawal}
                    addNotification={props.addNotification}
                    faqItems={props.faqItems}
                    siteSettings={props.siteSettings}
                    onSetFaqItems={props.onSetFaqItems}
                    onUpdateSiteSettings={props.onUpdateSiteSettings}
                    categories={props.categories}
                    onSetCategories={props.onSetCategories}
                    onAdminOrderClick={props.onAdminOrderClick}
                    tickets={props.tickets}
                    onUpdateTicketThreadStatus={props.onUpdateTicketThreadStatus}
                    onAddTicketMessage={props.onAddTicketMessage}
                    onOpenTicketChat={props.onOpenTicketChat}
                    setHeaderConfig={setHeaderConfig}
                    coupons={props.coupons}
                    onAddCoupon={props.onAddCoupon}
                    onUpdateCoupon={props.onUpdateCoupon}
                    onDeleteCoupon={props.onDeleteCoupon}
                    onAdminUpdateOrder={props.onAdminUpdateOrder}
                    view={props.adminView}
                    onViewChange={props.setAdminView}
                    currentUser={currentUser}
                />
            ) : (
                <div className="text-center text-red-500 p-4">لا تملك صلاحيات الوصول إلى لوحة التحكم.</div>
            );
        default:
            return <div className="p-4 text-center text-gray-500">الصفحة غير موجودة.</div>;
    }
};

export default AccountSubPage;
