
import { Product, Order, User, Customer, WithdrawalRequest, FaqItem, SiteSettings, Category, AppNotification, Supplier, SupplierWithdrawal, Coupon, Ticket } from '../types';

// FIX: Added missing imports and complete mock data exports to resolve compilation errors

export const mockCategories: Category[] = [
  { id: 'cat-all', name: 'الكل', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200' },
  { id: 'cat-new', name: 'جديد', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200' },
  { id: 'cat-clothes', name: 'ملابس', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200' }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'تيشيرت صيفي قطن 100%',
    brand: 'FashionMix',
    price: 15000, 
    supplierPrice: 10000,
    supplierId: 'sup-2',
    min_sell_price: 18000,
    max_sell_price: 22000,
    promo: 'خصم خاص',
    description: 'تيشيرت صيفي مريح مصنوع من القطن الطبيعي 100%. متوفرة بعدة ألوان وقياسات.',
    marketing_description: '👕 تيشيرت الأناقة والراحة!\n\nاحصل على تيشيرت بخامة قطنية 100% باردة للصيف.\n✅ خامة ممتازة\n✅ ألوان ثابتة\n✅ قياسات نظامية\n\nالسعر للقطعة الواحدة هو 15,000 د.ع فقط! 💥',
    image_urls: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800'
    ],
    series_count: 1,
    series_sizes: "S, M, L, XL, XXL",
    stock: 120,
    category: 'ملابس',
    tags: ['bestseller'],
    telegramUrl: 'https://t.me/lookat_store/prod1',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'ساعة ذكية رياضية',
    brand: 'SmartTech',
    price: 35000,
    min_sell_price: 45000,
    max_sell_price: 60000,
    promo: 'الأكثر طلباً',
    description: 'ساعة رياضية ذكية مع تتبع نبضات القلب والخطوات.',
    image_urls: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'],
    series_count: 1,
    series_sizes: 'One Size',
    stock: 45,
    category: 'إلكترونيات',
    tags: ['bestseller'],
    created_at: new Date().toISOString()
  }
];

export const mockUsers: User[] = [
  { id: 'user-1', name: 'مدير النظام', email: 'admin@lookat.iq', is_admin: true, permissions: ['overview', 'products', 'orders', 'users', 'withdrawals', 'settings', 'tickets', 'notifications', 'suppliers', 'coupons', 'employees'] },
  { id: 'user-2', name: 'أحمد محمود', email: 'ahmed@example.com', is_admin: false, phone: '07701112223' },
  { id: 'user-3', name: 'سارة جاسم', email: 'marketer@example.com', is_admin: false, store_name: 'سارة شوب', phone: '07804445556' }
];

export const mockCustomers: Customer[] = [
  { id: 'cust-1', user_id: 'user-3', name: 'علي حسن', phone: '07701234567', address: 'بغداد، الكرادة', governorate: 'بغداد', region: 'الكرادة', notes: 'مقابل ساحة كهرمانة' }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-5001',
    user_id: 'user-3',
    items: [{ product: mockProducts[1], quantity: 1, size: 'One Size', customer_price: 50000 }],
    customer: mockCustomers[0],
    total_cost: 55000,
    profit: 15000,
    delivery_fee: 5000,
    discount: 0,
    status: 'under_implementation',
    date: '2024/05/15',
    time: '02:30 PM',
    created_at: new Date().toISOString()
  }
];

export const mockWithdrawalRequests: WithdrawalRequest[] = [
  { id: 'wd-101', user_id: 'user-3', amount: 25000, status: 'pending', created_at: new Date().toISOString(), wallet_type: 'زين كاش', wallet_number: '07804445556' }
];

export const mockFaqItems: FaqItem[] = [
  { question: 'ما هي مدة التوصيل؟', answer: 'يستغرق التوصيل داخل بغداد 24 ساعة، وللمحافظات من 2-3 أيام عمل.' }
];

export const mockSiteSettings: SiteSettings = {
  promoCard: {
    title: 'أهلاً بك في لوكات بزنس',
    subtitle: 'ابدأ تجارتك اليوم وحقق أرباحاً إضافية بكل سهولة من منزلك.',
    buttonText: 'تصفح المنتجات'
  },
  support_info: { email: 'support@lookat.iq', phone: '0774402688', hours: '9 صباحاً - 9 مساءً' },
  banners: [
    { imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800' }
  ],
  privacyPolicy: 'محتوى سياسة الخصوصية...',
  termsAndConditions: 'محتوى الشروط والأحكام...',
  serviceFeesDescription: 'محتوى رسوم الخدمة...'
};

export const mockSystemNotifications: AppNotification[] = [
  { id: 'sys-noti-1', type: 'system', title: 'تنبيه أمني', description: 'تم تسجيل دخول جديد لحسابك.', timestamp: 'منذ دقيقتين', isRead: false }
];

export const mockSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'تجهيزات النور', email: 'noor@example.com', phone: '07709998887', joined_at: '2023-11-20' },
  { id: 'sup-2', name: 'FashionMix Global', email: 'info@fashionmix.com', phone: '07801112223', joined_at: '2024-02-15' }
];

export const mockSupplierWithdrawals: SupplierWithdrawal[] = [
  { id: 'sw-501', supplierId: 'sup-1', amount: 500000, date: '2024-04-10', note: 'مستحقات أسبوعية' }
];
