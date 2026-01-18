
import React, { useState, useMemo } from 'react';
import { CartItem } from '../../types';
import { TrashIcon, PlusIcon, MinusIcon } from '../common/icons';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: string, quantity: number) => void;
  onUpdatePrice: (productId: string, size: string, price: number) => void;
  onCheckout: () => void;
  onClearCart: () => void;
}

const CartItemCard: React.FC<{ 
    item: CartItem; 
    onUpdateQuantity: (productId: string, size: string, quantity: number) => void; 
    onUpdatePrice: (productId: string, size: string, price: number) => void;
}> = React.memo(({ item, onUpdateQuantity, onUpdatePrice }) => {
  const currentPrice = item.customer_price || 0;
  const isPriceValid = currentPrice > 0 && currentPrice > item.product.price;
  const profit = isPriceValid ? (currentPrice - item.product.price) * item.quantity : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 mb-4 transition-all">
        {/* Header Row: Image Right, Details Left */}
        <div className="flex gap-3 mb-3">
            {/* Image */}
            <div className="w-24 h-24 flex-shrink-0 bg-gray-50 dark:bg-gray-700 rounded-2xl p-1 border border-gray-100 dark:border-gray-600">
                <img 
                    src={item.product.image_urls[0]} 
                    alt={item.product.name} 
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
                />
            </div>

            {/* Details */}
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1 text-right">
                        {item.product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                        سعر الجملة: <span className="font-bold text-gray-800 dark:text-gray-200 dir-ltr">{item.product.price.toLocaleString()} د.ع</span>
                    </p>
                </div>

                {/* Size & Qty Row */}
                <div className="flex items-center justify-between mt-2">
                     {/* Trash Button */}
                     <button 
                        onClick={() => onUpdateQuantity(item.product.id, item.size, 0)}
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                     >
                        <TrashIcon className="w-4 h-4" />
                     </button>

                     {/* Quantity Stepper */}
                     <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-full p-1 border border-gray-200 dark:border-gray-600">
                        <button onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity + 1)} className="w-7 h-7 rounded-full bg-white dark:bg-gray-600 shadow-sm flex items-center justify-center text-primary"><PlusIcon className="w-3 h-3"/></button>
                        <span className="w-8 text-center font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.product.id, item.size, item.quantity - 1)} className="w-7 h-7 rounded-full bg-white dark:bg-gray-600 shadow-sm flex items-center justify-center text-primary"><MinusIcon className="w-3 h-3"/></button>
                     </div>
                </div>
            </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-3"></div>

        {/* Price Input Section */}
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
                <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">حدد سعر الزبون</span>
            </div>

            <div className="flex-grow">
                 <div className="relative">
                    <input 
                        type="tel" 
                        value={item.customer_price === 0 ? '' : item.customer_price} 
                        onChange={(e) => onUpdatePrice(item.product.id, item.size, Number(e.target.value))}
                        placeholder="ادخل السعر النهائي"
                        className={`w-full h-11 bg-gray-100 dark:bg-gray-700/50 rounded-xl text-center font-bold text-gray-800 dark:text-white text-lg outline-none border-2 transition-all placeholder:text-gray-400 text-sm ${!isPriceValid && item.customer_price !== 0 ? 'border-red-500 bg-red-50/10' : 'border-transparent focus:border-primary/30'}`}
                    />
                 </div>
            </div>
        </div>
        
        {/* Valid Price Check / Profit */}
        {isPriceValid ? (
            <div className="mt-3 bg-green-50 dark:bg-green-900/20 rounded-xl py-2 px-4 flex justify-between items-center border border-green-100 dark:border-green-900/30">
                 <span className="text-green-700 dark:text-green-400 font-bold text-sm">ربحك من هذا المنتج</span>
                 <span className="text-green-700 dark:text-green-400 font-extrabold text-base">{profit.toLocaleString()} د.ع</span>
            </div>
        ) : (
            item.customer_price !== 0 && (
                 <div className="mt-2 text-red-500 text-xs text-center font-bold">
                    * يجب أن يكون سعر الزبون أكبر من سعر الجملة لتحقيق ربح.
                 </div>
            )
        )}
    </div>
  );
});

const CartPage: React.FC<CartPageProps> = ({ cartItems, onUpdateQuantity, onUpdatePrice, onCheckout, onClearCart }) => {
  
  const areAllPricesValid = useMemo(() => {
      if (cartItems.length === 0) return false;
      return cartItems.every(item => {
          const price = item.customer_price || 0;
          return price > 0 && price > item.product.price;
      });
  }, [cartItems]);

  const totals = useMemo(() => {
      let totalWholesale = 0;
      let totalCustomer = 0;
      let totalProfit = 0;
      
      cartItems.forEach(item => {
          const price = item.customer_price || 0; 
          const wholesale = item.product.price;
          const qty = item.quantity;
          
          totalWholesale += wholesale * qty;
          if (price > wholesale) {
              totalCustomer += price * qty;
              totalProfit += (price - wholesale) * qty;
          }
      });
      
      return { totalWholesale, totalCustomer, totalProfit };
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-gray-500 dark:text-gray-400">
        <h2 className="text-xl font-bold">السلة فارغة</h2>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-900 flex flex-col h-full">
        <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-48">
            {cartItems.map(item => (
                <CartItemCard 
                    key={`${item.product.id}-${item.size}`} 
                    item={item} 
                    onUpdateQuantity={onUpdateQuantity}
                    onUpdatePrice={onUpdatePrice}
                />
            ))}
        </div>

        {/* Fixed Summary Footer */}
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-700 z-10" style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`}}>
             <div className="p-4 pb-0 space-y-2 mb-3">
                 <div className="flex justify-between text-sm">
                     <span className="text-gray-600 dark:text-gray-400">تكلفة الجملة الكلية</span>
                     <span className="font-bold dark:text-gray-200">{totals.totalWholesale.toLocaleString()} د.ع</span>
                 </div>
                 <div className="flex justify-between text-green-600 dark:text-green-400 text-sm font-bold">
                     <span>إجمالي أرباحك الصافية</span>
                     <span>{totals.totalProfit.toLocaleString()} د.ع</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold text-primary dark:text-primary-light pt-2 border-t dark:border-gray-700">
                     <span>المبلغ المطلوب من الزبون</span>
                     <span>{totals.totalCustomer.toLocaleString()} د.ع</span>
                 </div>
             </div>
             
             <div className="px-4">
                <button 
                    onClick={onCheckout} 
                    disabled={!areAllPricesValid}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    استمرار (تأكيد بيانات الزبون)
                </button>
             </div>
        </div>
    </div>
  );
};

export default CartPage;
