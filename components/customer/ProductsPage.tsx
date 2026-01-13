
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, BannerItem, Category, SiteSettings } from '../../types';
import { XMarkIcon, PlusIcon, MinusIcon, CartIcon, CheckCircleIcon, RocketIcon } from '../common/icons';
import ProductGrid from './ProductGrid';
import HorizontalProductScroller from './HorizontalProductScroller';

interface SizeSelectionModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

const SizeSelectionModal: React.FC<SizeSelectionModalProps> = ({ product, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const currentStock = product.stock;

    const handleAddToCart = () => {
        const sizeName = `سيرية (${product.series_count} قطع)`;
        for(let i=0; i<quantity; i++) {
            onAddToCart(product, sizeName);
        }
        onClose();
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && newQty <= currentStock) {
            setQuantity(newQty);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-[35px] sm:rounded-3xl shadow-2xl transform transition-all animate-slide-up relative overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-14 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer opacity-80"></div>
                </div>
                <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-10">
                    <XMarkIcon className="w-5 h-5" />
                </button>
                <div className="p-6 pt-2 flex flex-col gap-6 overflow-y-auto">
                    <div className="flex gap-4 items-start text-right relative">
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2">
                            <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow pt-1">
                             <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2 pl-8">{product.name}</h3>
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">سعر السيرية</span>
                                <div className="text-primary dark:text-primary-light font-extrabold text-xl dir-ltr">
                                    {product.price.toLocaleString()} <span className="text-xs font-normal">د.ع</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">تفاصيل السيرية</h4>
                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md font-bold">متبقي: {currentStock} سيرية</span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl text-center">
                            <p className="text-xs text-blue-800 dark:text-blue-300 font-bold mb-2">محتويات السيرية:</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">{product.series_sizes}</p>
                            <p className="text-[10px] text-blue-500 dark:text-blue-500 mt-2">إجمالي العدد: {product.series_count} قطعة</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">عدد السيريات</span>
                            <div className={`flex items-center bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-1 h-10 ${currentStock === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= currentStock} className="w-8 h-full flex items-center justify-center text-primary hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"><PlusIcon className="w-4 h-4" /></button>
                                <div className="w-8 text-center font-bold text-gray-800 dark:text-white text-lg">{quantity}</div>
                                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"><MinusIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <button onClick={handleAddToCart} disabled={currentStock === 0} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:bg-gray-300 active:scale-95 transition-all">
                            <CartIcon className="w-5 h-5" />
                            <span>{currentStock > 0 ? 'أضف للسلة' : 'نفذت الكمية'}</span>
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
                <div onClick={onExploreClick} className="mx-4 mt-2 bg-gradient-to-l from-primary/10 to-orange-50 dark:from-primary/20 dark:to-transparent border border-primary/10 rounded-[28px] p-5 flex items-center justify-between cursor-pointer active:scale-98 transition-all">
                    <div className="flex flex-col items-start text-right">
                        <h2 className="font-black text-lg text-gray-900 dark:text-white mb-1">{promoSettings.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold leading-relaxed max-w-[180px]">{promoSettings.subtitle}</p>
                        <button className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-primary/30">{promoSettings.buttonText}</button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-inner border border-primary/5">
                        <RocketIcon className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                </div>

                {/* Main Categories Scroller */}
                <div className="mt-6">
                    <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar">
                        {categories.filter(c => !c.parentId).map(cat => (
                            <button key={cat.id} onClick={() => onCategorySelect(cat)} className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm hover:border-primary active:scale-95 transition-all">
                                <span className="font-bold text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">{cat.name}</span>
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
