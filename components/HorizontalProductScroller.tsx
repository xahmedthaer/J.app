
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface HorizontalProductScrollerProps {
  title: string;
  products: Product[];
  onProductClick: (product: Product) => void;
  savedProductIds: string[];
  onSaveToggle: (productId: string) => void;
  onAddToCartClick: (product: Product) => void;
  onViewAllClick?: () => void;
}

const HorizontalProductScroller: React.FC<HorizontalProductScrollerProps> = ({
  title,
  products,
  onProductClick,
  savedProductIds,
  onSaveToggle,
  onAddToCartClick,
  onViewAllClick,
}) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center px-4 mb-3">
        <h2 className="font-bold text-lg text-right text-gray-800 dark:text-gray-100">{title}</h2>
        {onViewAllClick && (
          <button onClick={onViewAllClick} className="text-xs font-semibold text-primary hover:underline">
            مشاهدة الكل
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 px-4 no-scrollbar">
        {products.map(product => (
          <div key={product.id} className="flex-shrink-0 w-44">
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
              isSaved={savedProductIds.includes(product.id)}
              onSaveToggle={onSaveToggle}
              onAddToCartClick={onAddToCartClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalProductScroller;
