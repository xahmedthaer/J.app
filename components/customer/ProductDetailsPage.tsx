
import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { BookmarkIcon, PlusIcon, MinusIcon, ChevronDownIcon, XMarkIcon, CopyIcon, CartIcon, CubesStackIcon, CheckCircleIcon } from '../common/icons';

const ImageGalleryModal: React.FC<{
  images: string[];
  initialIndex: number;
  onClose: () => void;
  productName: string;
}> = ({ images, initialIndex, onClose, productName }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const distance = touchStart - touchEnd;
        const swipeThreshold = 50;

        if (distance > swipeThreshold) { // Swiped left
            goToNext();
        } else if (distance < -swipeThreshold) { // Swiped right
            goToPrevious();
        }
        setTouchStart(null);
    };
    
    return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex flex-col items-center justify-center animate-fade-in" 
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
        >
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-end px-4">
                <button onClick={onClose} className="text-white p-2" aria-label="إغلاق المعرض">
                    <XMarkIcon className="w-7 h-7" />
                </button>
            </div>

            <div className="relative w-full h-full flex items-center justify-center">
                 <img src={images[currentIndex]} alt={`${productName} - صورة ${currentIndex + 1}`} className="max-h-[80%] max-w-[90%] object-contain" />
            </div>

            <div className="absolute bottom-4 text-white text-lg font-mono">
                {currentIndex + 1} / {images.length}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};


interface ProductDetailsPageProps {
  product: Product;
  onAddToCart: (product: Product, size: string) => void;
  addNotification: (message: string) => void;
  isSaved: boolean;
  onSaveToggle: (productId: string) => void;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product, onAddToCart, addNotification, isSaved, onSaveToggle }) => {
  const [quantity, setQuantity] = useState(1);
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const isBundle = product.name.includes("بكج") || product.tags?.includes("bundle") || false;
  const bundleCount = 3; 

  const handleAddToCartClick = () => {
    const sizeName = isBundle ? `بكج ألوان مختلطة (${bundleCount} سيريات)` : `سيرية (${product.series_count} قطع)`;
    for (let i = 0; i < quantity; i++) {
        onAddToCart(product, sizeName);
    }
  };

  const handleQuantityChange = (delta: number) => {
      const newQty = quantity + delta;
      let maxStock = product.stock;
      if (newQty >= 1 && newQty <= maxStock) {
          setQuantity(newQty);
      }
  };

  const handleCopyText = (text: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      addNotification('تم نسخ النص');
  };

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
  }

  const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
  }

  const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe) {
           setCurrentMainImageIndex((prev) => (prev === product.image_urls.length - 1 ? 0 : prev + 1));
      }
      if (isRightSwipe) {
          setCurrentMainImageIndex((prev) => (prev === 0 ? product.image_urls.length - 1 : prev - 1));
      }
  }

  const marketingText = product.marketing_description || product.promo || 'لا يوجد نص ترويجي محدد.';
  const displayPrice = product.price;

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen pb-32 font-cairo relative">
       {isGalleryOpen && (
            <ImageGalleryModal
                images={product.image_urls}
                initialIndex={currentMainImageIndex}
                onClose={() => setIsGalleryOpen(false)}
                productName={product.name}
            />
        )}

      {/* 1. Curved Image Header */}
      <div 
        className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-b-[30px] overflow-hidden shadow-sm z-0 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
          <img 
            src={product.image_urls[currentMainImageIndex]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-opacity duration-300 cursor-zoom-in"
            onClick={() => setIsGalleryOpen(true)}
          />
          
          {/* Bundle Badge Overlay */}
          {isBundle && (
              <div className="absolute top-6 right-0 bg-red-600 text-white px-4 py-1.5 rounded-l-full font-black text-xs shadow-lg animate-pulse">
                   بكج 3 ألوان إجباري 🔥
              </div>
          )}

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {product.image_urls.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentMainImageIndex(idx); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentMainImageIndex === idx ? 'bg-yellow-400 w-3' : 'bg-white/80 hover:bg-white'}`}
                  />
              ))}
          </div>
      </div>

      <div className="px-4 pt-6">
          {/* 2. Product Name Heading */}
          <div className="text-right mb-4">
              <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  {product.name}
                  {isBundle && <span className="block text-sm text-red-500 mt-1">(هذا المنتج يباع كـ بكج 3 سيريات ألوان مختلفة)</span>}
              </h1>
          </div>

          {/* Wholesale Price & Stock */}
          <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1 text-right">
                      {isBundle ? 'سعر البكج (جملة)' : 'سعر السيرية (جملة)'}
                  </span>
                  <p className="text-2xl font-black text-primary dark:text-primary-light leading-none">
                      {displayPrice.toLocaleString()} <span className="text-xs font-bold text-gray-500 dark:text-gray-400">د.ع</span>
                  </p>
              </div>
              
              <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">المخزون المتاح</span>
                  <p className="text-base font-black text-gray-800 dark:text-gray-200 leading-none dir-ltr">
                      {product.stock} {isBundle ? 'بكج' : 'سيرية'}
                  </p>
              </div>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-100 dark:border-gray-800 mb-4"></div>

          {/* 3. Bundle Content Info Box */}
          {isBundle && (
              <div className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800/40 rounded-2xl p-4 mb-6 shadow-sm">
                  <h3 className="text-sm font-black text-orange-800 dark:text-orange-300 flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-layer-group"></i>
                      مكونات هذا البكج:
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 p-2 rounded-xl">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>سيرية كاملة - لون أسود</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 p-2 rounded-xl">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>سيرية كاملة - لون أبيض</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 p-2 rounded-xl">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span>سيرية كاملة - لون نيلي</span>
                      </div>
                  </div>
              </div>
          )}

          {/* 4. Streamlined Size & Quantity Row */}
          <div id="size-selection-section" className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl mb-4 text-center">
                  <p className="text-sm font-black text-blue-800 dark:text-blue-300">محتويات السيرية الواحدة</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 font-bold">{product.series_sizes}</p>
                  <p className="text-[10px] text-blue-400 dark:text-blue-500 mt-2 font-bold">إجمالي عدد القطع في كل لون: {product.series_count}</p>
              </div>

              {/* Quantity Selector */}
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <span className="font-black text-gray-700 dark:text-gray-300 text-sm">
                      {isBundle ? 'عدد البكجات المطلوبة' : 'الكمية (بالسيرية)'}
                  </span>
                  
                  <div className="flex items-center gap-4 h-full">
                       <button 
                          onClick={() => handleQuantityChange(1)}
                          className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 text-primary shadow-sm flex items-center justify-center active:scale-95 transition-all border border-gray-100 dark:border-gray-600 hover:border-primary/30"
                      >
                          <PlusIcon className="w-5 h-5" />
                      </button>
                      <span className="font-black text-xl text-gray-800 dark:text-white w-8 text-center">{quantity}</span>
                      <button 
                          onClick={() => handleQuantityChange(-1)}
                          className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 text-gray-500 shadow-sm flex items-center justify-center active:scale-95 transition-all border border-gray-100 dark:border-gray-600 hover:bg-gray-50"
                      >
                          <MinusIcon className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>

          {/* Straight Line Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 mb-6"></div>

          {/* 5. Promo Content Section */}
          <div className="pb-8">
              {product.telegramUrl && (
                  <div className="mb-6 w-full">
                      <a 
                          href={product.telegramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-3 bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9] hover:text-white py-3 rounded-2xl transition-all duration-300 text-sm font-black border border-[#229ED9]/20 shadow-sm"
                      >
                          <i className="fa-brands fa-telegram text-xl"></i>
                          <span>حمل صور او فيديو المنتج من تليكرام</span>
                      </a>
                  </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-700/30">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                            <i className="fa-solid fa-bullhorn text-[10px] text-primary"></i>
                         </div>
                         <h3 className="font-black text-gray-800 dark:text-gray-200 text-xs">وصف ترويجي للنشر</h3>
                      </div>
                      <button 
                        onClick={() => handleCopyText(marketingText)}
                        className="flex items-center gap-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-primary dark:text-primary-light border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 transition-all shadow-sm active:scale-95 text-xs font-black"
                      >
                          <CopyIcon className="w-3.5 h-3.5" />
                          <span>نسخ النص</span>
                      </button>
                  </div>
                  <div className="p-5">
                      <div className="text-right text-gray-800 dark:text-gray-200 text-base font-bold leading-loose whitespace-pre-wrap">
                          {marketingText}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 6. Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-4 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] z-10 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={handleAddToCartClick}
            disabled={(product.stock === 0)}
            className="w-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all duration-300 font-black text-base py-3.5 rounded-2xl shadow-lg shadow-primary/25 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
              <CartIcon className="w-5 h-5" />
              <span>
                  {product.stock === 0 ? 'نفذت الكمية تماماً' : isBundle ? 'أضف البكج الكامل للسلة الآن' : 'أضف السيرية إلى السلة الآن'}
              </span>
          </button>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
