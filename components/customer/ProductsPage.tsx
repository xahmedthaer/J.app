import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, BannerItem, Category, SiteSettings } from '../../types';
import { XMarkIcon, PlusIcon, MinusIcon, CartIcon, CheckCircleIcon, RocketIcon, BoxOpenIcon, CubesStackIcon } from '../common/icons';
import ProductGrid from './ProductGrid';
import HorizontalProductScroller from './HorizontalProductScroller';

interface SizeSelectionModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

const SizeSelectionModal: React.FC<SizeSelectionModalProps> = ({ product, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    
    // Parse sizes from comma separated string
    const availableSizes = useMemo(() => {
        return product.series_sizes.split(',').map(s => s.trim()).filter(Boolean);
    }, [product.series_sizes]);

    const isSizeAvailable = (size: string) => {
        // If we have size-specific stock, check it
        if (product.stock_by_size && product.stock_by_size[size] !== undefined) {
            return product.stock_by_size[size] > 0;
        }
        // Otherwise use total stock
        return product.stock > 0;
    };

    // Auto-select first available size
    useEffect(() => {
        const firstAvailable = availableSizes.find(size => isSizeAvailable(size));
        if (firstAvailable) {
            setSelectedSize(firstAvailable);
        }
    }, [availableSizes]);

    const handleAddToCart = () => {
        if (!selectedSize) return;
        const sizeName = `قطعة واحدة (${selectedSize})`;
        for(let i=0; i<quantity; i++) {
            onAddToCart(product, sizeName);
        }
        onClose();
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        // Limit quantity by selected size stock if available, else total stock
        const maxStock = (product.stock_by_size && selectedSize) 
            ? Math.min(product.stock_by_size[selectedSize] || 0, product.stock)
            : product.stock;
            
        if (newQty >= 1 && newQty <= maxStock) {
            setQuantity(newQty);
        }
    };

    const currentStock = product.stock;

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] shadow-2xl transform transition-all animate-slide-up relative overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                <div className="w-full flex justify-center pt-4 pb-1" onClick={onClose}>
                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"></div>
                </div>
                <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors z-10 rounded-full shadow-sm">
                    <XMarkIcon className="w-5 h-5" />
                </button>
                <div className="p-8 pt-4 flex flex-col gap-6 overflow-y-auto">
                    {/* Header Info */}
                    <div className="flex gap-5 items-start text-right">
                        <div className="w-24 h-24 flex-shrink-0 bg-slate-50 dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 p-2 shadow-sm">
                            <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow pt-2">
                             <h3 className="font-black text-gray-900 dark:text-white text-lg leading-snug line-clamp-2">{product.name}</h3>
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <div className="text-primary dark:text-primary-light font-black text-xl dir-ltr">
                                    {product.price.toLocaleString()} <span className="text-[10px]">د.ع</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold">:سعر القطعة</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-gray-800 w-full"></div>

                    {/* Size Selection Block */}
                    <div className="bg-slate-50 dark:bg-gray-800/60 p-5 rounded-[32px] border border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4 justify-end">
                            <h4 className="font-black text-gray-800 dark:text-gray-200 text-xs">اختر القياس المطلوب</h4>
                            <CubesStackIcon className="w-4 h-4 text-primary" />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {availableSizes.map((size) => {
                                const available = isSizeAvailable(size);
                                return (
                                    <button
                                        key={size}
                                        onClick={() => available && setSelectedSize(size)}
                                        disabled={!available}
                                        className={`h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border
                                            ${selectedSize === size 
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                                                : available 
                                                    ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-slate-100 dark:border-gray-600 hover:border-primary' 
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 cursor-not-allowed opacity-50 relative'
                                            }`}
                                    >
                                        {size}
                                        {!available && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full border border-white">نفذ</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center bg-white dark:bg-gray-700 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-600 p-1.5">
                                <button onClick={() => handleQuantityChange(1)} className="w-9 h-9 rounded-xl flex items-center justify-center text-primary active:scale-90 transition-all"><PlusIcon className="w-4 h-4" /></button>
                                <div className="w-8 text-center font-black text-gray-800 dark:text-white text-lg">{quantity}</div>
                                <button onClick={() => handleQuantityChange(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 active:scale-90 transition-all"><MinusIcon className="w-4 h-4" /></button>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-400 block">الكمية (قطعة)</span>
                                <span className="text-xs font-black text-gray-700 dark:text-gray-200">العدد المطلوب</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleAddToCart} 
                        disabled={!selectedSize || currentStock === 0} 
                        className="w-full h-16 bg-primary text-white font-black rounded-[24px] shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:bg-gray-300 active:scale-95 transition-all mb-4"
                    >
                        <CartIcon className="w-6 h-6" />
                        <span>{currentStock > 0 ? (selectedSize ? 'أضف للسلة' : 'اختر القياس أولاً') : 'نفذت الكمية'}</span>
                    </button>
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
  onExploreClick: () => void;
  promoSettings: SiteSettings['promoCard'];
  externalSearchQuery?: string;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
  products, onProductClick, savedProductIds, onSaveToggle, banners, isLoadingProducts, 
  onAddToCart, categories, selectedCategory, onCategorySelect, onExploreClick, promoSettings, externalSearchQuery = ''
}) => {
  const [productForSizeSelection, setProductForSizeSelection] = useState<Product | null>(null);

  const bestsellerProducts = useMemo(() => products.filter(p => p.tags?.includes('bestseller')), [products]);
  const newArrivalsProducts = useMemo(() => [...products].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 8), [products]);

  const productsForGrid = useMemo(() => {
    let list = products;
    if (selectedCategory && selectedCategory.name !== 'الكل') {
        if (selectedCategory.name === 'جديد') list = [...products].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        else list = products.filter(p => p.category === selectedCategory.name);
    }
    if (!externalSearchQuery.trim()) return list;
    const q = externalSearchQuery.toLowerCase().trim();
    return list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [products, selectedCategory, externalSearchQuery]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex-grow overflow-y-auto pt-2">
        {!selectedCategory && !externalSearchQuery.trim() ? (
            <>
                {/* Promo Card */}
                <div onClick={onExploreClick} className="mx-4 mt-2 bg-gradient-to-l from-primary/10 to-orange-50 dark:from-primary/20 dark:to-transparent border border-primary/10 rounded-[32px] p-6 flex items-center justify-between cursor-pointer active:scale-98 transition-all shadow-sm">
                    <div className="flex flex-col items-start text-right">
                        <h2 className="font-black text-xl text-gray-900 dark:text-white mb-1">{promoSettings.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold leading-relaxed max-w-[180px]">{promoSettings.subtitle}</p>
                        <button className="mt-4 bg-primary text-white px-8 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-primary/30">تصفح الآن</button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-inner border border-primary/5">
                        <RocketIcon className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                </div>

                {/* Main Categories Scroller */}
                <div className="mt-6">
                    <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar">
                        {categories.filter(c => !c.parentId).map(cat => (
                            <button key={cat.id} onClick={() => onCategorySelect(cat)} className="flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm hover:border-primary active:scale-95 transition-all">
                                <span className="font-black text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <HorizontalProductScroller title="وصلنا حديثاً 🔥" products={newArrivalsProducts} onProductClick={onProductClick} savedProductIds={savedProductIds} onSaveToggle={onSaveToggle} onAddToCartClick={setProductForSizeSelection} />
                <HorizontalProductScroller title="الأكثر طلباً 📈" products={bestsellerProducts} onProductClick={onProductClick} savedProductIds={savedProductIds} onSaveToggle={onSaveToggle} onAddToCartClick={setProductForSizeSelection} />
            </>
        ) : (
            <div className="px-4 pb-6">
                <ProductGrid products={productsForGrid} isLoading={isLoadingProducts} onProductClick={onProductClick} savedProductIds={savedProductIds} onSaveToggle={onSaveToggle} onAddToCartClick={setProductForSizeSelection} />
            </div>
        )}
      </div>

      {productForSizeSelection && (
        <SizeSelectionModal product={productForSizeSelection} onClose={() => setProductForSizeSelection(null)} onAddToCart={onAddToCart} />
      )}
    </div>
  );
};

export default ProductsPage;