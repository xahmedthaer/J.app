
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';

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
            <div className="grid grid-cols-2 gap-3 mt-2 px-1">
                {Array.from({ length: 8 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
            </div>
        );
    }
    
    if (products.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
                <p>لا توجد منتجات تطابق بحثك.</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-2 gap-3 mt-2 px-1">
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
