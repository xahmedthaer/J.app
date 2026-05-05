
import React, { useState } from 'react';
import { CartIcon, SupportIcon, SearchIcon, ChevronLeftIcon, XMarkIcon, BookmarkIcon } from './icons';
import { Page, HeaderConfig } from '../../App';

interface HeaderProps {
  page: Page;
  onBack: () => void;
  cartItemCount: number;
  onCartClick: () => void;
  onSupportClick: () => void;
  onSavedProductsClick: () => void;
  onClearCart?: () => void;
  accountSubPageTitle?: string;
  orderId?: string;
  checkoutPageTitle?: string;
  categoryTitle?: string;
  orderStatusTitle?: string;
  headerConfig: HeaderConfig | null;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  isProductSaved?: boolean;
  onSaveToggle?: () => void;
}

const HeaderActionBtn: React.FC<{ onClick: () => void; children: React.ReactNode; badge?: number; active?: boolean }> = ({ onClick, children, badge, active }) => (
    <button 
        onClick={onClick}
        className={`w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border rounded-[12px] shadow-sm active:scale-90 transition-all relative ${active ? 'border-primary text-primary' : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
    >
        {children}
        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold border-2 border-white dark:border-gray-800">
                {badge}
            </span>
        )}
    </button>
);

const Header: React.FC<HeaderProps> = ({ page, onBack, cartItemCount, onCartClick, onSupportClick, accountSubPageTitle, orderId, checkoutPageTitle, categoryTitle, orderStatusTitle, headerConfig, searchQuery = '', setSearchQuery, isProductSaved, onSaveToggle }) => {
  const [isSearching, setIsSearching] = useState(false);

  const getHeaderInfo = () => {
    if (headerConfig) {
        return { title: headerConfig.title, subtitle: 'إدارة القسم الحالي', showBack: headerConfig.showBack };
    }

    switch(page) {
      case 'products':
        return { title: categoryTitle || 'الرئيسية', subtitle: 'اكتشف أحدث المنتجات', showBack: !!categoryTitle };
      case 'orders':
        return { title: 'الطلبات', subtitle: 'تتبع جميع طلباتك', showBack: !!orderStatusTitle };
      case 'categories':
        return { title: 'الأقسام', subtitle: 'تصفح حسب الفئة', showBack: true };
      case 'account':
        return { title: 'حسابي', subtitle: 'إدارة ملفك الشخصي', showBack: false };
      case 'financial':
        return { title: 'الحسابات', subtitle: 'إدارة أرباحك وسحوباتك', showBack: false };
      case 'productDetails':
        return { title: 'التفاصيل', subtitle: 'معلومات المنتج الكاملة', showBack: true };
      case 'cart':
        return { title: 'السلة', subtitle: 'مراجعة المنتجات المختارة', showBack: true };
      case 'checkout':
        return { title: checkoutPageTitle || 'الدفع', subtitle: 'إكمال عملية الطلب', showBack: true };
      case 'orderDetails':
        return { title: 'تفاصيل الطلب', subtitle: `#${orderId || ''}`, showBack: true };
      case 'accountSubPage':
        return { title: accountSubPageTitle || 'الإعدادات', subtitle: 'تعديل التفضيلات', showBack: true };
      default:
        return { title: 'مبيعاتنا', subtitle: 'تسوق بذكاء', showBack: false };
    }
  }

  const { title, subtitle, showBack } = getHeaderInfo();

  return (
    <header 
        className="bg-white dark:bg-slate-900 z-40 flex-shrink-0 border-b border-gray-50 dark:border-gray-800/50" 
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="container mx-auto px-5 h-20 flex items-center justify-between">
        
        {isSearching ? (
            <div className="flex items-center w-full gap-3 animate-fade-in">
                <button 
                    onClick={() => {
                        setIsSearching(false);
                        if(setSearchQuery) setSearchQuery('');
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتج..."
                    className="flex-grow bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm text-right focus:ring-1 focus:ring-primary outline-none dark:text-white"
                />
            </div>
        ) : (
            <>
                {/* Right Side (Start in RTL): Title and Subtitle Only */}
                <div className="flex flex-col items-start text-right">
                    <h1 className="text-[18px] font-black text-gray-900 dark:text-white leading-tight">
                        {title}
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        {subtitle}
                    </p>
                </div>

                {/* Left Side (End in RTL): Action Buttons (Including Back button now) */}
                <div className="flex items-center gap-2">
                    {page === 'productDetails' ? (
                        <>
                            {onSaveToggle && (
                                <HeaderActionBtn onClick={onSaveToggle} active={isProductSaved}>
                                    <BookmarkIcon filled={isProductSaved} className="w-5 h-5" />
                                </HeaderActionBtn>
                            )}
                            <HeaderActionBtn onClick={onCartClick} badge={cartItemCount}>
                                <CartIcon className="w-5 h-5" />
                            </HeaderActionBtn>
                        </>
                    ) : (
                        <>
                            {!showBack && (
                                <HeaderActionBtn onClick={() => setIsSearching(true)}>
                                    <SearchIcon className="w-5 h-5" />
                                </HeaderActionBtn>
                            )}
                            
                            {!['cart', 'checkout', 'orderDetails', 'accountSubPage'].includes(page) && (
                                <HeaderActionBtn onClick={onCartClick} badge={cartItemCount}>
                                    <CartIcon className="w-5 h-5" />
                                </HeaderActionBtn>
                            )}

                            {!showBack && (
                                <HeaderActionBtn onClick={onSupportClick}>
                                    <SupportIcon className="w-5 h-5" />
                                </HeaderActionBtn>
                            )}
                        </>
                    )}

                    {/* Back Button positioned next to other icons on the left */}
                    {showBack && (
                        <HeaderActionBtn onClick={onBack}>
                            <ChevronLeftIcon className="w-5 h-5" />
                        </HeaderActionBtn>
                    )}
                </div>
            </>
        )}

      </div>
    </header>
  );
};

export default Header;
