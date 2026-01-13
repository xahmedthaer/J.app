
import React from 'react';
import { type Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isSaved: boolean;
  onSaveToggle: (productId: string) => void;
  onAddToCartClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isSaved, onSaveToggle }) => {
  const totalStock = product.inventory.reduce((acc, item) => acc + item.stock, 0);
  const isOutOfStock = totalStock === 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full relative group active:scale-[0.98] transition-all duration-200 overflow-hidden"
      role="button"
      aria-label={`عرض تفاصيل ${product.name}`}
    >
      {/* Image Container - Inside Padding, Rounded, Filled, No Border Frame */}
      <div className="p-2">
        <div className="relative w-full aspect-square rounded-[18px] overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img 
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-60 grayscale-[50%]' : ''}`} 
                src={product.image_urls[0]} 
                alt={product.name} 
                loading="lazy" 
            />
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                    <span className="bg-red-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md border border-white/20 backdrop-blur-sm">
                        نفذت الكمية
                    </span>
                </div>
            )}
            
            {/* Promo Tag - Floating Pill at Bottom Center - UPDATED STYLE */}
            {product.promo && !isOutOfStock && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-sm rounded-full py-1.5 px-3 min-w-[max-content] border border-gray-100 dark:border-gray-600/50">
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white whitespace-nowrap block leading-none tracking-wide">
                        {product.promo}
                    </span>
                </div>
            )}
        </div>
      </div>
      
      {/* Content Body - Flex Grow to push footer down */}
      <div className="px-3 pb-3 flex flex-col flex-grow">
        {/* Title - Single Line */}
        <div className="mb-2 mt-1">
            <h3 className={`text-[14px] font-bold truncate text-right ${isOutOfStock ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`} title={product.name}>
                {product.name}
            </h3>
        </div>
        
        {/* Footer: Price & Action - Pushed to bottom */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 dark:border-gray-700/50">
            {/* Price (Right) */}
            <div className="flex flex-col items-start">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-0.5">سعر جملة</span>
                <div className="flex items-baseline gap-0.5">
                    <span className={`text-lg font-extrabold leading-none ${isOutOfStock ? 'text-gray-400 dark:text-gray-600' : 'text-primary dark:text-primary-light'}`}>
                        {product.price.toLocaleString()} 
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">د.ع</span>
                </div>
            </div>

            {/* Actions (Left) */}
            <div className="flex items-center gap-2">
                {/* Save Button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onSaveToggle(product.id);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full shadow-sm transition-colors 
                        ${isSaved 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    aria-label={isSaved ? 'إلغاء حفظ المنتج' : 'حفظ المنتج'}
                >
                    <i className={`${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark text-sm`}></i>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
