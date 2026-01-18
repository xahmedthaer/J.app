
import React from 'react';
import { type Product } from '../../types';
import { BookmarkIcon, CubesStackIcon } from './icons';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isSaved: boolean;
  onSaveToggle: (productId: string) => void;
  onAddToCartClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isSaved, onSaveToggle }) => {
  const isOutOfStock = product.stock === 0;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col h-full relative group active:scale-[0.97] transition-all duration-300 overflow-hidden"
      role="button"
      aria-label={`عرض تفاصيل ${product.name}`}
    >
      {/* Image Section */}
      <div className="p-1.5">
        <div className="relative w-full aspect-[1/1] rounded-[20px] overflow-hidden bg-gray-50 dark:bg-gray-900/50">
            <img 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`} 
                src={product.image_urls[0]} 
                alt={product.name} 
                loading="lazy" 
            />
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg">
                        نفذت الكمية
                    </span>
                </div>
            )}
            
            {/* Save Button - Floating Top Left */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onSaveToggle(product.id);
                }}
                className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-all duration-300 z-10
                    ${isSaved 
                        ? 'bg-primary text-white scale-110' 
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-primary dark:text-gray-500'
                    }`}
            >
                <BookmarkIcon filled={isSaved} className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="px-3 pb-3 flex flex-col flex-grow text-right">
        {/* Product Title */}
        <h3 className={`text-[14px] font-bold leading-tight line-clamp-2 min-h-[34px] mt-2 ${isOutOfStock ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {product.name}
        </h3>
        
        {/* Pricing Info */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
            {/* Price Line (Wholesale Only) */}
            <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold shrink-0">سعر الجملة:</span>
                <div className="flex items-baseline gap-0.5 shrink-0">
                    <span className={`text-[16px] font-black tracking-tight ${isOutOfStock ? 'text-gray-300' : 'text-primary dark:text-primary-light'}`}>
                        {product.price.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">د.ع</span>
                </div>
            </div>
            
            {/* تم حذف وسم الـ Promo البرتقالي من هنا كما طلب المستخدم */}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
