
import React, { useState, useMemo, useRef } from 'react';
import { Product, Order, Category } from '../types';
import { PlusIcon, TrashIcon, EditIcon, SearchIcon, CubesStackIcon, XCircleIcon, CheckCircleIcon, ChartUpIcon } from './icons';
import SearchBar from './SearchBar';

interface ProductOverviewStatsCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  bgColorClass: string;
  textColorClass: string;
}

const ProductOverviewStatsCard: React.FC<ProductOverviewStatsCardProps> = ({ label, value, icon: Icon, bgColorClass, textColorClass }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-sm border ${bgColorClass} ${textColorClass} border-gray-200 dark:border-gray-700`}>
    <Icon className={`w-8 h-8 mb-2 ${textColorClass}`} />
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-sm font-semibold text-center mt-1">{label}</p>
  </div>
);

// =================================================================
// PRODUCT LIST ITEM COMPONENT - REDESIGNED
// =================================================================
const ProductListItem: React.FC<{
  product: Product;
  onEdit: (product: Product) => void;
}> = ({ product, onEdit }) => {
  const totalStock = product.inventory.reduce((acc, item) => acc + item.stock, 0);
  const isOutOfStock = totalStock === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center text-right relative overflow-hidden group">
      {/* Right side (image and text details) */}
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 flex-shrink-0">
            <img 
                src={product.image_urls[0]} 
                alt={product.name} 
                className={`w-full h-full object-contain bg-gray-100 dark:bg-gray-700 rounded-lg transition-all duration-300 ${isOutOfStock ? 'grayscale opacity-50' : ''}`} 
                loading="lazy" 
            />
            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-sm whitespace-nowrap">
                        نفذت
                    </span>
                </div>
            )}
        </div>
        
        <div>
          <p className={`font-bold text-gray-800 dark:text-gray-100 ${isOutOfStock ? 'text-gray-500 dark:text-gray-400 line-through decoration-red-500/50' : ''}`}>{product.name}</p>
          <p className={`text-sm mt-1 ${isOutOfStock ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
            {isOutOfStock ? 'نفذت الكمية' : `متوفر: ${totalStock}`}
          </p>
          <p className="text-sm text-primary dark:text-primary-light font-semibold">سعر جملة: {product.price.toLocaleString()} د.ع</p>
        </div>
      </div>
      {/* Left side (Edit button) */}
      <button 
        onClick={() => onEdit(product)} 
        className="bg-primary-light text-primary font-bold py-2 px-4 rounded-xl hover:bg-primary/20 transition-colors flex-shrink-0"
        aria-label={`تعديل المنتج ${product.name}`}
      >
        تعديل
      </button>
    </div>
  );
};


interface AdminProductsListPageProps {
  products: Product[];
  categories: Category[]; // Not directly used here, but can be passed down if needed for filtering
  onNavigateToProductEdit: (product: Product | null) => void; // Used for both edit and add
}

const AdminProductsListPage: React.FC<AdminProductsListPageProps> = ({
  products,
  onNavigateToProductEdit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Removed selectedProductIds and fileInputKey as bulk actions are removed from this view.

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const lcQuery = searchQuery.toLowerCase().trim();
    return products.filter(p => p.name.toLowerCase().includes(lcQuery) || p.id.toLowerCase().includes(lcQuery));
  }, [products, searchQuery]);

  // Removed totalProducts, inStockProducts, outOfStockProducts as overview stats are removed.

  // Removed handleToggleSelectProduct, handleSelectAll, handleExportSelected, handleImportProducts, handleDeleteSelected.

  return (
    <div className="dark:bg-slate-900 pt-2">
        {/* Product Overview Stats - Removed as per image */}
        {/* Action Buttons - Removed as per image, now in header */}

        {/* Search Bar */}
        <div className="mb-4 px-4">
            <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                placeholder="...بحث بالاسم أو الكود"
            />
        </div>

        {/* Select All & Import/Export Controls - Removed as per image */}
        {/* The section title "المنتجات" */}
        <h2 className="text-xl font-bold text-right dark:text-gray-100 mb-3 px-4">المنتجات</h2>

        {/* Product List */}
        {filteredProducts.length > 0 ? (
            <div className="space-y-3 pb-4 px-4">
                {filteredProducts.map(product => (
                    <ProductListItem
                        key={product.id}
                        product={product}
                        onEdit={onNavigateToProductEdit} // Pass product for editing
                    />
                ))}
            </div>
        ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                <p>لا توجد منتجات تطابق بحثك.</p>
            </div>
        )}

        {/* Floating Bulk Action Bar - Removed as per image */}
    </div>
  );
};

export default AdminProductsListPage;
