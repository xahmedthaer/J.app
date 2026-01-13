
import { Product, Order, User, Customer, WithdrawalRequest, FaqItem, SiteSettings, Category, Ticket, TicketMessage, Supplier, SupplierWithdrawal, AppNotification } from '../types';

export const mockSuppliers: Supplier[] = [
    { id: 'sup-1', name: 'مركز دبي التجاري', email: 'dubai@store.com', phone: '07700001111', joined_at: '2023-01-01', notes: 'مورد رئيسي للأجهزة الإلكترونية' },
    { id: 'sup-2', name: 'مصنع الأناقة', email: 'style@factory.com', phone: '07800002222', joined_at: '2023-03-15', notes: 'مختص بالملابس والمنسوجات' }
];

export const mockSupplierWithdrawals: SupplierWithdrawal[] = [
    { id: 'sw-1', supplierId: 'sup-1', amount: 50000, date: '2024-05-01T10:00:00Z', note: 'تسليم يدوي - الدفعة الاولى' },
];

export const mockUsers: User[] = [
  { id: 'user-1', name: 'علي حسن', email: 'ali@example.com', is_admin: false, phone: '07712345678', wallet_type: 'زين كاش', wallet_number: '07712345678', registration_date: '2023-01-15' },
  { id: 'user-2', name: 'فاطمة أحمد', email: 'fatima@example.com', is_admin: false, phone: '07812345678', wallet_type: 'كي كارد', wallet_number: '1234567890123456', registration_date: '2023-02-20' },
  { id: 'admin-1', name: 'المسؤول', email: 'admin@example.com', is_admin: true, phone: '07912345678', registration_date: '2023-01-01' },
];

export const mockCustomers: Customer[] = [
  { id: 'cust-1', user_id: 'user-1', name: 'محمد علي', phone: '07701112222', address: 'بغداد، المنصور، شارع 14 رمضان', governorate: 'بغداد', region: 'المنصور', notes: 'اتصل قبل الوصول' },
  { id: 'cust-2', user_id: 'user-1', name: 'أحمد خالد', phone: '07803334444', address: 'البصرة، الجبيلة، قرب مول تايم سكوير', governorate: 'البصرة', region: 'الجبيلة', notes: '' },
  { id: 'cust-3', user_id: 'user-2', name: 'سارة حسين', phone: '07505556666', address: 'أربيل، عينكاوة، شارع 40 متري', governorate: 'أربيل', region: 'عينكاوة', notes: 'التسليم بعد الظهر' },
];

export const mockCategories: Category[] = [
    { id: 'cat-all', name: 'الكل', imageUrl: 'https://via.placeholder.com/128' },
    { id: 'cat-kitch', name: 'اجهزة المطبخ', imageUrl: 'https://via.placeholder.com/128' },
    { id: 'cat-home', name: 'اجهزة المنزل', imageUrl: 'https://via.placeholder.com/128' },
    { id: 'cat-elec', name: 'الكترونيات', imageUrl: 'https://via.placeholder.com/128' },
    { id: 'cat-new', name: 'جديد', imageUrl: 'https://via.placeholder.com/128' },
    { id: 'cat-misc', name: 'منوعات', imageUrl: 'https://via.placeholder.com/128' },
    { id: 'cat-cloth', name: 'ملابس', imageUrl: 'https://via.placeholder.com/128' },
    { id: 'cat-bags', name: 'حقائب', imageUrl: 'https://via.placeholder.com/128' },
    // Subcategories
    { id: 'sub-tshirt', name: 'تيشيرتات', imageUrl: 'https://via.placeholder.com/128', parentId: 'cat-cloth' },
    { id: 'sub-jeans', name: 'جينز', imageUrl: 'https://via.placeholder.com/128', parentId: 'cat-cloth' },
    { id: 'sub-watches', name: 'ساعات', imageUrl: 'https://via.placeholder.com/128', parentId: 'cat-elec' },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'ساعة ذكية رياضية',
    brand: 'TechPro',
    price: 350000, // Price for full series
    supplierPrice: 250000,
    supplierId: 'sup-1',
    min_sell_price: 450000,
    max_sell_price: 550000,
    promo: 'اربح 100,000 د.ع',
    description: 'ساعة ذكية مقاومة للماء مع تتبع لمعدل ضربات القلب و GPS. مثالية للرياضيين.',
    marketing_description: '🔥 عرض خاص لفترة محدودة! 🔥\n\nاحصل الآن على الساعة الذكية الرياضية TechPro 5.\n✅ مقاومة للماء\n✅ بطارية تدوم 7 أيام\n✅ تدعم الاشعارات والمكالمات\n\nتوصيل لجميع المحافظات 🚚',
    image_urls: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800',
        'https://images.unsplash.com/photo-1579586337278-35d9addb017d?q=80&w=800',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'
    ],
    series_count: 10,
    series_sizes: "لون أسود 5، لون أبيض 5",
    stock: 5, // 5 series available
    details: { 'الموديل': 'T-Watch 5', 'البطارية': 'تدوم 7 أيام', 'التوافق': 'iOS, Android' },
    category: 'الكترونيات',
    subcategory: 'ساعات',
    created_at: '2024-05-20T10:00:00Z',
    telegramUrl: 'https://t.me/elak_store/123',
    tags: ['bestseller'],
  },
  {
    id: 'prod-2',
    name: 'حقيبة ظهر عصرية',
    brand: 'UrbanGo',
    price: 250000,
    supplierPrice: 180000,
    supplierId: 'sup-1',
    min_sell_price: 350000,
    max_sell_price: 450000,
    promo: 'اربح 100,000 د.ع',
    description: 'حقيبة ظهر أنيقة ومتينة مع جيوب متعددة، مناسبة للعمل والسفر.',
    marketing_description: '🎒 حقيبة الظهر المثالية لكل يوم!\n\nتصميم عصري ومساحة واسعة لكل احتياجاتك.\n🔹 خامة مقاومة للماء\n🔹 جيوب متعددة للتنظيم\n🔹 مريحة للظهر\n\nاطلبها الآن.',
    image_urls: [
        'https://images.unsplash.com/photo-1553062407-98eeb6e06a72?q=80&w=800',
        'https://images.unsplash.com/photo-1587375989822-dc7114c18599?q=80&w=800',
    ],
    series_count: 10,
    series_sizes: "قياس واحد (ألوان مشكلة)",
    stock: 8,
    details: { 'المادة': 'قماش مقاوم للماء', 'السعة': '20 لتر' },
    category: 'حقائب',
    created_at: '2024-05-18T12:30:00Z',
    telegramUrl: 'https://t.me/elak_store/124',
    tags: ['bestseller'],
  },
    {
    id: 'prod-3',
    name: 'قميص قطني رجالي',
    brand: 'ClassicWear',
    price: 65000,
    supplierPrice: 50000,
    supplierId: 'sup-2',
    min_sell_price: 80000,
    max_sell_price: 100000,
    promo: 'اربح 15,000 د.ع',
    description: 'قميص رجالي مريح وأنيق مصنوع من القطن عالي الجودة. يباع كسيرية كاملة.',
    marketing_description: '👕 أناقة وراحة في آن واحد!\n\nقميص قطني 100% بتصميم كلاسيكي يناسب كل الأوقات.\nمتوفر بمقاسات M, L, XL.\n\nاحجز نسختك الآن!',
    image_urls: [
        'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=800',
        'https://images.unsplash.com/photo-1598032895397-b9472444bf93?q=80&w=800',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800',
    ],
    series_count: 5,
    series_sizes: "S, M, L, XL, XXL",
    stock: 50, // Available packs
    details: { 'الخامة': '100% قطن', 'طول ردن': '33cm', 'طول': '44cm', 'عرض': '50cm' },
    category: 'ملابس',
    subcategory: 'تيشيرتات',
    created_at: '2024-05-21T09:00:00Z',
    telegramUrl: 'https://t.me/elak_store/125'
  },
];

export const mockOrders: Order[] = [
  {
    id: 'order-101',
    user_id: 'user-1',
    items: [
      { product: mockProducts[0], quantity: 1, size: 'سيرية (10 قطع)', customer_price: 500000 },
    ],
    customer: mockCustomers[0],
    total_cost: 500000,
    profit: 150000,
    delivery_fee: 5000,
    discount: 0,
    status: 'completed',
    date: '2024-05-10',
    time: '03:45 PM',
    created_at: '2024-05-10T15:45:00Z',
  },
  {
    id: 'order-102',
    user_id: 'user-2',
    items: [{ product: mockProducts[2], quantity: 3, size: 'سيرية (5 قطع)', customer_price: 90000 }],
    customer: mockCustomers[2],
    total_cost: 275000,
    profit: 75000,
    delivery_fee: 5000,
    discount: 0,
    status: 'shipped',
    date: '2024-05-12',
    time: '11:20 AM',
    created_at: '2024-05-12T11:20:00Z',
  },
];

export const mockWithdrawalRequests: WithdrawalRequest[] = [
    { id: 'wd-1', user_id: 'user-1', amount: 150000, status: 'completed', request_date: '2024-04-20', processed_date: '2024-04-21', wallet_type: 'زين كاش', wallet_number: '07712345678', created_at: '2024-04-20T10:00:00Z' },
    { id: 'wd-2', user_id: 'user-2', amount: 85000, status: 'pending', request_date: '2024-05-12', processed_date: null, wallet_type: 'كي كارد', wallet_number: '1234567890123456', created_at: '2024-05-12T10:00:00Z' },
];

export const mockFaqItems: FaqItem[] = [
    { question: 'كيف أطلب منتج؟', answer: 'يمكنك طلب المنتج عن طريق إضافته إلى السلة ثم المتابعة لإكمال الطلب باختيار الزبون وتحديد سعر البيع.' },
    { question: 'متى تصل أرباحي؟', answer: 'تصبح الأرباح قابلة للسحب بعد اكتمال الطلب وتسليمه للزبون. يمكنك بعد ذلك طلب سحبها من صفحة الأرباح.' },
];

export const mockSiteSettings: SiteSettings = {
    promoCard: {
        title: 'ابدأ رحلة الربح',
        subtitle: 'استكشف آلاف المنتجات واربح بدون رأس مال',
        buttonText: 'استكشف'
    },
    support_info: {
        email: 'support@example.com',
        phone: '600-123-456',
        hours: '9 صباحًا - 5 مساءً',
    },
    banners: [
        { imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop', categoryLink: 'الكترونيات' },
        { imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop', categoryLink: 'ملابس' }
    ]
};

export const mockSystemNotifications: AppNotification[] = [
    {
        id: '1',
        type: 'order',
        title: 'تحديث حالة الطلب #order-101',
        description: 'تم تغيير حالة طلبك إلى "تم التسليم".',
        timestamp: 'منذ 5 دقائق',
        isRead: false,
    },
    {
        id: '2',
        type: 'product',
        title: 'منتج جديد متاح!',
        description: 'تمت إضافة "سماعات لاسلكية Pro" إلى قسم الإلكترونيات. لا تفوتها!',
        timestamp: 'منذ ساعتين',
        isRead: false,
    },
    {
        id: '4',
        type: 'order',
        title: 'تم شحن طلبك #order-102',
        description: 'طلبك في طريقه إليك الآن! يمكنك تتبعه من صفحة الطلبات.',
        timestamp: 'منذ يومين',
        isRead: true,
    },
    {
        id: '5',
        type: 'system',
        title: 'مرحباً بك في إلك!',
        description: 'شكراً لانضمامك. استكشف المنتجات وابدأ في تحقيق الأرباح اليوم.',
        timestamp: 'منذ أسبوع',
        isRead: true,
    }
];
