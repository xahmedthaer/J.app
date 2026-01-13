
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number; // Wholesale price (Per Series)
  supplierPrice?: number; // Cost price from supplier (Per Series)
  supplierId?: string;
  min_sell_price: number; // Per Series
  max_sell_price: number; // Per Series
  promo: string;
  description: string;
  marketing_description?: string;
  image_urls: string[];
  
  // Flattened Series Data (Since it's the only mode now)
  series_count: number; // Number of pieces in one series
  series_sizes: string; // e.g., "S, M, L, XL, XXL"
  stock: number; // How many full series are available
  
  details?: Record<string, string>;
  category: string;
  subcategory?: string;
  created_at?: string;
  telegramUrl?: string;
  tags?: string[];
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  joined_at: string;
  notes?: string;
}

export interface SupplierWithdrawal {
  id: string;
  supplierId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string; // Will store the series description (e.g. "سيرية كاملة")
  customer_price?: number;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address: string;
  governorate: string;
  region: string;
  notes: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  customer: Customer;
  total_cost: number;
  profit: number;
  delivery_fee: number;
  discount: number;
  status: 'under_implementation' | 'shipped' | 'completed' | 'cancelled' | 'rejected' | 'prepared' | 'postponed' | 'partially_delivered';
  date: string;
  time: string;
  created_at: string;
  admin_note?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  store_name?: string;
  wallet_type?: 'زين كاش' | 'كي كارد' | 'اخرى';
  wallet_number?: string;
  is_admin: boolean;
  registration_date?: string;
  permissions?: string[];
}

export interface WithdrawalRequest {
  id:string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed';
  request_date?: string;
  created_at?: string;
  processed_date?: string | null;
  wallet_type: string;
  wallet_number: string;
}

export interface BannerItem {
  imageUrl: string;
  categoryLink?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SupportInfo {
  email: string;
  phone: string;
  hours: string;
}

export interface SiteSettings {
  promoCard: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  support_info: SupportInfo;
  banners: BannerItem[];
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  parentId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  customer_name: string;
  status: 'pending' | 'resolved';
  created_at: string;
  messages: TicketMessage[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_order_amount?: number;
  expiration_date?: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
}

export interface AppNotification {
  id: string;
  type: 'order' | 'product' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export type AdminView = 'dashboard' | 'overview' | 'products' | 'orders' | 'users' | 'withdrawals' | 'settings' | 'userDetails' | 'tickets' | 'notifications' | 'suppliers' | 'supplierDetails' | 'coupons' | 'employees';
