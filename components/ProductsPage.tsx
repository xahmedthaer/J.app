
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, BannerItem, Category } from '../types';
import { XMarkIcon, PlusIcon, MinusIcon, CartIcon, CheckCircleIcon } from './icons';
import SearchBar from './SearchBar';
import ProductGrid from './ProductGrid';
import HorizontalProductScroller from './HorizontalProductScroller';

interface SizeSelectionModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

const SizeSelectionModal: React.FC<SizeSelectionModalProps> = ({ product, onClose, onAddToCart }) => {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Calculate stock for the selected size
    const currentStock = useMemo(() => {
        if (!selectedSize) return 0;
        return product.inventory.find(i => i.size === selectedSize)?.stock || 0;
    }, [selectedSize, product]);

    const handleAddToCart = () => {
        if (selectedSize) {
            for(let i=0; i<quantity; i++) {
                onAddToCart(product, selectedSize);
            }
            onClose();
        }
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && (selectedSize ? newQty <= currentStock : true)) {
            setQuantity(newQty);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Card - Bottom Sheet Design */}
            <div 
                className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-[35px] sm:rounded-3xl shadow-2xl transform transition-all animate-slide-up relative overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle (Visual only) */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-14 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer opacity-80"></div>
                </div>

                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 left-4 p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="p-6 pt-2 flex flex-col gap-6 overflow-y-auto">
                    {/* 1. Product Header */}
                    <div className="flex gap-4 items-start text-right relative">
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2">
                            <img 
                                src={product.image_urls[0]} 
                                alt={product.name} 
                                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
                            />
                        </div>
                        <div className="flex-grow pt-1">
                             <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2 pl-8">
                                {product.name}
                            </h3>
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">سعر القطعة</span>
                                <div className="text-primary dark:text-primary-light font-extrabold text-xl dir-ltr">
                                    {product.price.toLocaleString()} <span className="text-xs font-normal">د.ع</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

                    {/* 2. Size Selection */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">اختر القياس</h4>
                            {selectedSize && (
                                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md font-bold">
                                    متبقي: {currentStock}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-end">
                            {product.inventory.map((inv) => {
                                const isOutOfStock = inv.stock === 0;
                                const isSelected = selectedSize === inv.size;
                                
                                return (
                                    <button
                                        key={inv.size}
                                        onClick={() => {
                                            if (!isOutOfStock) {
                                                setSelectedSize(inv.size);
                                                setQuantity(1);
                                            }
                                        }}
                                        disabled={isOutOfStock}
                                        className={`
                                            min-w-[60px] h-12 px-3 rounded-xl border-2 transition-all duration-200 relative flex items-center justify-center
                                            ${isSelected 
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 transform -translate-y-1' 
                                                : isOutOfStock 
                                                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed decoration-slice'
                                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary/50 hover:bg-primary/5'
                                            }
                                        `}
                                    >
                                        <span className="text-sm font-bold">{inv.size}</span>
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600 rotate-45"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {product.inventory.every(i => i.stock === 0) && (
                            <p className="text-red-500 text-xs mt-2 text-center font-bold">هذا المنتج نافذ من المخزون حالياً</p>
                        )}
                    </div>

                    {/* 3. Action Bar (Quantity + Add Button) */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl flex flex-col gap-4 mt-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">الكمية المطلوبة</span>
                            
                            {/* Quantity Stepper */}
                            <div className={`flex items-center bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-1 h-10 ${!selectedSize ? 'opacity-50 pointer-events-none' : ''}`}>
                                <button 
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={!selectedSize || quantity >= currentStock}
                                    className="w-8 h-full flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                                <div className="w-8 text-center font-bold text-gray-800 dark:text-white text-lg leading-none pt-0.5">
                                    {quantity}
                                </div>
                                <button 
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30"
                                >
                                    <MinusIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Add Button */}
                        <button 
                            onClick={handleAddToCart}
                            disabled={!selectedSize}
                            className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-between px-6 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:shadow-none disabled:cursor-not-allowed active:scale-98 transition-all overflow-hidden relative group"
                        >
                            <span className="flex items-center gap-2 z-10">
                                <span className="bg-white/20 p-1.5 rounded-lg">
                                    <CartIcon className="w-5 h-5" />
                                </span>
                                <span>{selectedSize ? 'إضافة للسلة' : 'يرجى اختيار قياس'}</span>
                            </span>
                            
                            {selectedSize && (
                                <div className="flex flex-col items-end z-10 leading-tight">
                                    <span className="text-[10px] opacity-80 font-normal">المجموع</span>
                                    <span className="text-lg font-extrabold dir-ltr">{(product.price * quantity).toLocaleString()}</span>
                                </div>
                            )}
                            
                            {/* Hover effect background */}
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface ProductsPageProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  savedProductIds: string[];
  onSaveToggle: (productId: string) => void;
  banners: BannerItem[];
  isLoadingProducts: boolean;
  onAddToCart: (product: Product, size: string) => void;
  categories: Category[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
}

const CategoryList: React.FC<{categories: Category[], onCategorySelect: (category: Category) => void}> = ({categories, onCategorySelect}) => {
    const mainCategories = categories.filter(c => !c.parentId);

    return (
        <div className="pb-2 pt-1">
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar items-center">
                {mainCategories.map(category => (
                    <button 
                        key={category.id} 
                        onClick={() => onCategorySelect(category)} 
                        className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:border-primary active:scale-95 transition-all duration-300"
                    >
                        <span className="font-bold text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">{category.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  onProductClick,
  savedProductIds,
  onSaveToggle,
  banners,
  isLoadingProducts,
  onAddToCart,
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [productForSizeSelection, setProductForSizeSelection] = useState<Product | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null);

  useEffect(() => {
      setSelectedSubCategory(null);
  }, [selectedCategory]);

  const bestsellerProducts = useMemo(() => {
    return products.filter(p => p.tags?.includes('bestseller'));
  }, [products]);

  const newArrivalsProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 8);
  }, [products]);

  const subCategories = useMemo(() => {
      if (!selectedCategory) return [];
      return categories.filter(c => c.parentId === selectedCategory.id);
  }, [categories, selectedCategory]);

  const productsForGrid = useMemo(() => {
    let productList = products;
    
    if (selectedCategory) {
        if (selectedCategory.name === 'جديد') {
             productList = [...products].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        } else if (selectedCategory.name !== 'الكل') {
            productList = products.filter(p => p.category === selectedCategory.name);
            
            if (selectedSubCategory) {
                productList = productList.filter(p => p.subcategory === selectedSubCategory.name);
            }
        }
    }
    
    if (!searchQuery.trim()) {
        return productList;
    }

    const lcQuery = searchQuery.toLowerCase().trim();
    return productList.filter(p => 
        p.name.toLowerCase().includes(lcQuery) ||
        p.brand.toLowerCase().includes(lcQuery) ||
        p.description.toLowerCase().includes(lcQuery) ||
        p.category.toLowerCase().includes(lcQuery)
    );
  }, [products, selectedCategory, searchQuery, selectedSubCategory]);

  
  const handleAddToCartClick = (product: Product) => {
    setProductForSizeSelection(product);
  };
  
  const handleViewAllNewArrivals = () => {
    const newCategory = categories.find(c => c.name === 'جديد');
    if (newCategory) {
        onCategorySelect(newCategory);
    }
  };

  const isMainProductsView = !selectedCategory;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex-grow overflow-y-auto">
        
        <div className="px-4 pt-4 pb-2 bg-white dark:bg-slate-900">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
          {!isMainProductsView && subCategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-2 px-1 items-center">
                  <button 
                      onClick={() => setSelectedSubCategory(null)}
                      className={`
                          flex-shrink-0 flex items-center justify-center px-6 py-2 rounded-full border transition-all duration-300
                          ${selectedSubCategory === null 
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                          }
                      `}
                  >
                      <span className="font-bold text-xs whitespace-nowrap">الكل</span>
                  </button>

                  {subCategories.map(sub => {
                      const isSelected = selectedSubCategory?.id === sub.id;
                      return (
                        <button 
                            key={sub.id} 
                            onClick={() => setSelectedSubCategory(sub)}
                            className={`
                                flex-shrink-0 flex items-center justify-center px-6 py-2 rounded-full border transition-all duration-300
                                ${isSelected 
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                                }
                            `}
                        >
                            <span className="font-bold text-xs whitespace-nowrap">{sub.name}</span>
                        </button>
                      );
                  })}
              </div>
          )}
        </div>
        
        {isMainProductsView ? (
            <>
                {!searchQuery.trim() && (
                    <>
                        {banners.length > 0 && (
                          <div className="p-3 pt-0">
                             <div className="relative overflow-hidden rounded-2xl shadow-sm">
                                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                                  {banners.map((banner, index) => (
                                    <div key={index} className="w-full h-40 flex-shrink-0 snap-center">
                                        <img src={banner.imageUrl} alt={`Banner ${index + 1}`} className="w-full h-full object-cover"/>
                                    </div>
                                  ))}
                                </div>
                              </div>
                          </div>
                        )}
                        
                        <CategoryList categories={categories} onCategorySelect={onCategorySelect} />

                        <HorizontalProductScroller
                            title="جديد"
                            products={newArrivalsProducts}
                            onProductClick={onProductClick}
                            savedProductIds={savedProductIds}
                            onSaveToggle={onSaveToggle}
                            onAddToCartClick={handleAddToCartClick}
                            onViewAllClick={handleViewAllNewArrivals}
                        />

                        {bestsellerProducts.length > 0 && (
                            <HorizontalProductScroller
                                title="الأكثر مبيعاً"
                                products={bestsellerProducts}
                                onProductClick={onProductClick}
                                savedProductIds={savedProductIds}
                                onSaveToggle={onSaveToggle}
                                onAddToCartClick={handleAddToCartClick}
                                onViewAllClick={() => {
                                    const allCategory = categories.find(c => c.name === 'الكل');
                                    if (allCategory) onCategorySelect(allCategory);
                                }}
                            />
                        )}
                    </>
                )}

                {searchQuery.trim() && (
                    <div className="p-3 pt-0">
                        <ProductGrid 
                          products={productsForGrid}
                          isLoading={isLoadingProducts}
                          onProductClick={onProductClick}
                          savedProductIds={savedProductIds}
                          onSaveToggle={onSaveToggle}
                          onAddToCartClick={handleAddToCartClick}
                        />
                    </div>
                )}
            </>
        ) : (
            <div className="p-3 pt-0">
                <ProductGrid 
                  products={productsForGrid}
                  isLoading={isLoadingProducts}
                  onProductClick={onProductClick}
                  savedProductIds={savedProductIds}
                  onSaveToggle={onSaveToggle}
                  onAddToCartClick={handleAddToCartClick}
                />
            </div>
        )}
      </div>

      {productForSizeSelection && (
        <SizeSelectionModal
          product={productForSizeSelection}
          onClose={() => setProductForSizeSelection(null)}
          onAddToCart={onAddToCart}
        />
      )}
      <style>
          {`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              @keyframes slide-up {
                  from { transform: translateY(100%); }
                  to { transform: translateY(0); }
              }
              .animate-slide-up {
                  animation: slide-up 0.3s ease-out forwards;
              }
          `}
      </style>
    </div>
  );
};

export default ProductsPage;
