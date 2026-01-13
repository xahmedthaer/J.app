
import React from 'react';
import { CartIcon, BellIcon, ChevronLeftIcon, TrashIcon, BookmarkOutlineIcon, PlusIcon, ChartUpIcon } from './icons';
import { Page, HeaderConfig } from '../App';

interface HeaderProps {
  page: Page;
  onBack: () => void;
  cartItemCount: number;
  onCartClick: () => void;
  onNotificationsClick: () => void;
  onSavedProductsClick: () => void;
  onClearCart?: () => void;
  accountSubPageTitle?: string;
  orderId?: string;
  checkoutPageTitle?: string;
  categoryTitle?: string;
  orderStatusTitle?: string;
  headerConfig: HeaderConfig | null;
  notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({ page, onBack, cartItemCount, onCartClick, onNotificationsClick, onSavedProductsClick, onClearCart, accountSubPageTitle, orderId, checkoutPageTitle, categoryTitle, orderStatusTitle, headerConfig, notificationCount = 0 }) => {
  
  const getPageConfig = () => {
    if (headerConfig) {
      return { 
        title: <h1 className="text-xl font-bold">{headerConfig.title}</h1>, 
        showBack: headerConfig.showBack, 
        actions: [],
        onBack: headerConfig.onBack,
        customActions: {
            showAddProduct: headerConfig.showAddProduct,
            onAddProduct: headerConfig.onAddProduct,
            showProductStats: headerConfig.showProductStats,
            onProductStatsClick: headerConfig.onProductStatsClick,
            showAddTicket: headerConfig.showAddTicket,
            onAddTicket: headerConfig.onAddTicket,
        }
      };
    }

    switch(page) {
      case 'products':
        return { title: <h1 className="text-xl font-bold">{categoryTitle || 'المنتجات'}</h1>, showBack: !!categoryTitle, actions: ['cart', 'notifications']};
      case 'orders':
        return { title: <h1 className="text-xl font-bold">{orderStatusTitle || 'الطلبات'}</h1>, showBack: !!orderStatusTitle, actions: ['cart', 'notifications']};
      case 'tickets':
        return { title: <h1 className="text-xl font-bold">التذاكر</h1>, showBack: false, actions: ['cart', 'notifications']};
      case 'categories':
        return { title: <h1 className="text-xl font-bold">الأقسام</h1>, showBack: false, actions: ['cart', 'notifications']};
      case 'account':
        return { title: <h1 className="text-xl font-bold">حسابي</h1>, showBack: false, actions: []};
      case 'productDetails':
        return { title: <h1 className="text-xl font-bold">تفاصيل المنتج</h1>, showBack: true, actions: ['cart']};
      case 'cart':
        return { title: <h1 className="text-xl font-bold">سلة التسوق</h1>, showBack: true, actions: ['delete']};
      case 'checkout':
         return { title: <h1 className="text-xl font-bold">{checkoutPageTitle}</h1>, showBack: true, actions: []};
      case 'orderDetails':
        return { title: <h1 className="text-xl font-bold">{orderId || 'تفاصيل الطلب'}</h1>, showBack: true, actions: []};
      case 'accountSubPage':
        return { title: <h1 className="text-xl font-bold">{accountSubPageTitle || ''}</h1>, showBack: true, actions: []};
      case 'statistics':
        return { title: <h1 className="text-xl font-bold">الاحصائيات</h1>, showBack: true, actions: []};
      default:
        return { title: <h1 className="text-xl font-bold">المنتجات</h1>, showBack: false, actions: ['cart', 'notifications']};
    }
  }

  const config = getPageConfig();
  const justifyClass = config.showBack || config.customActions?.showAddProduct || config.customActions?.showProductStats || config.customActions?.showAddTicket ? 'justify-between' : (config.actions.length > 0 ? 'justify-between' : 'justify-center');

  return (
    <header 
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 z-20 flex-shrink-0 border-b border-gray-200 dark:border-gray-700" 
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className={`container mx-auto px-4 h-16 flex items-center ${justifyClass}`}>
        
        {/* Left Action Icons */}
        <div className="flex items-center gap-2">
            {config.actions.includes('cart') && (
              <button onClick={onCartClick} className="p-2 relative" aria-label="سلة التسوق">
                <CartIcon className="w-6 h-6" />
                {cartItemCount > 0 && 
                  <span className="absolute top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">{cartItemCount}</span>
                }
              </button>
            )}
            {config.actions.includes('delete') && onClearCart && (
              <button onClick={onClearCart} className="p-2" aria-label="إفراغ السلة">
                <TrashIcon className="w-6 h-6" />
              </button>
            )}
            {config.customActions?.showAddProduct && config.customActions.onAddProduct && (
                <button onClick={config.customActions.onAddProduct} className="p-2 bg-primary-light text-primary rounded-lg flex items-center justify-center" aria-label="إضافة منتج">
                    <PlusIcon className="w-6 h-6" />
                </button>
            )}
            {config.customActions?.showAddTicket && config.customActions.onAddTicket && (
              <button onClick={config.customActions.onAddTicket} className="font-bold text-primary flex items-center gap-1 text-sm bg-primary-light px-3 py-2 rounded-lg">
                  <span>إنشاء تذكرة</span>
                  <PlusIcon className="w-4 h-4" />
              </button>
            )}
            {config.customActions?.showProductStats && config.customActions.onProductStatsClick && (
                <button onClick={config.customActions.onProductStatsClick} className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" aria-label="إحصائيات المنتجات">
                    <ChartUpIcon className="w-6 h-6" />
                </button>
            )}
        </div>

        {/* Title / Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          {config.title}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
            {config.actions.includes('saved') && (
              <button onClick={onSavedProductsClick} className="p-2" aria-label="المنتجات المحفوظة">
                <BookmarkOutlineIcon className="w-6 h-6" />
              </button>
            )}
            {config.actions.includes('notifications') && (
              <button onClick={onNotificationsClick} className="p-2 relative" aria-label="الإشعارات">
                <BellIcon className="w-6 h-6" />
                {notificationCount > 0 && (
                    <span className="absolute top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                )}
              </button>
            )}
            {config.showBack && (
              <button onClick={config.onBack || onBack} className="p-2" aria-label="العودة للخلف">
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
