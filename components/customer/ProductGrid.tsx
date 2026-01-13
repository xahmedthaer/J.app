
import React from 'react';
import { Product } from '../../types';
import ProductCard from '../common/ProductCard';
import ProductCardSkeleton from '../common/ProductCardSkeleton';

interface ProductGridProps {
    products: Product[];
    isLoading: boolean;
    onProductClick: (product: Product) => void;
    savedProductIds: string[];
    onSaveToggle: (productId: string) => void;
    onAddToCartClick: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    isLoading,
    onProductClick,
    savedProductIds,
    onSaveToggle,
    onAddToCartClick
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 mt-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        );
    }
    
    if (products.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 pt-20 flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-magnifying-glass text-2xl opacity-20"></i>
                </div>
                <p className="font-bold">عذراً، لم نجد أي منتجات</p>
                <p className="text-xs mt-1">حاول تغيير معايير البحث</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-2 gap-4 mt-2">
            {products.map((product) => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => onProductClick(product)}
                    isSaved={savedProductIds.includes(product.id)}
                    onSaveToggle={onSaveToggle}
                    onAddToCartClick={onAddToCartClick}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
