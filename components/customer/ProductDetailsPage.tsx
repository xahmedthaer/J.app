import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { BookmarkIcon, PlusIcon, MinusIcon, ChevronDownIcon, XMarkIcon, CopyIcon, CartIcon, CubesStackIcon, CheckCircleIcon, BoxOpenIcon } from '../common/icons';

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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Parse sizes from comma separated string
  const availableSizes = useMemo(() => {
    return product.series_sizes.split(',').map(s => s.trim()).filter(Boolean);
  }, [product.series_sizes]);

  const isSizeAvailable = (size: string) => {
    if (product.stock_by_size && product.stock_by_size[size] !== undefined) {
        return product.stock_by_size[size] > 0;
    }
    return product.stock > 0;
  };

  // Auto-select first available size
  React.useEffect(() => {
    const firstAvailable = availableSizes.find(size => isSizeAvailable(size));
    if (firstAvailable) {
        setSelectedSize(firstAvailable);
    }
  }, [availableSizes]);
  
  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleAddToCartClick = () => {
    if (!selectedSize) return;
    const sizeName = `قطعة واحدة (${selectedSize})`;
    for (let i = 0; i < quantity; i++) {
        onAddToCart(product, sizeName);
    }
  };

  const handleQuantityChange = (delta: number) => {
      const newQty = quantity + delta;
      const maxStockForSize = (product.stock_by_size && selectedSize) 
        ? Math.min(product.stock_by_size[selectedSize] || 0, product.stock)
        : product.stock;

      if (newQty >= 1 && newQty <= maxStockForSize) {
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
        className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-b-[40px] overflow-hidden shadow-sm z-0 touch-pan-y"
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
          
          {/* Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
              {product.image_urls.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentMainImageIndex(idx); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentMainImageIndex === idx ? 'bg-primary w-5' : 'bg-white/50'}`}
                  />
              ))}
          </div>
      </div>

      <div className="px-5 pt-6">
          {/* 2. Product Name & Title Area */}
          <div className="text-right mb-6">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {product.name}
              </h1>
              <div className="flex items-center gap-2 justify-end mt-2">
                 <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{product.category}</span>
                 <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">نظام مفرد</span>
              </div>
          </div>

          {/* Wholesale Price & Stock Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 font-bold mb-1">السعر للمسوق (جملة)</span>
                  <p className="text-xl font-black text-primary dark:text-primary-light">
                      {displayPrice.toLocaleString()} <span className="text-[10px] font-bold">د.ع</span>
                  </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 font-bold mb-1">المخزون المتوفر</span>
                  <p className="text-xl font-black text-gray-800 dark:text-gray-200 dir-ltr">
                      {product.stock} <span className="text-[10px] font-bold opacity-60">قطعة</span>
                  </p>
              </div>
          </div>

          {/* 3. Unified Preparation Details Card (The Smart Card) */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-[32px] border-2 border-slate-100 dark:border-gray-700 p-6 mb-8 shadow-sm relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-gray-700 pb-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-sm text-primary">
                      <BoxOpenIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                      <h3 className="text-base font-black text-gray-900 dark:text-white">تفاصيل المحتوى والتجهيز</h3>
                      <p className="text-[10px] text-gray-400 font-bold">ما الذي سيصل للزبون بالضبط؟</p>
                  </div>
              </div>

              {/* Card Content (Size Selection) */}
              <div className="space-y-5">
                  <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-700/50 p-4 rounded-3xl border border-slate-100 dark:border-gray-600">
                          <label className="text-xs font-black text-gray-400 block mb-4 text-right">القياسات المتوفرة</label>
                          <div className="grid grid-cols-4 gap-3">
                              {availableSizes.map((size) => {
                                  const available = isSizeAvailable(size);
                                  return (
                                      <button
                                          key={size}
                                          onClick={() => available && setSelectedSize(size)}
                                          disabled={!available}
                                          className={`h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all border
                                              ${selectedSize === size 
                                                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                                                  : available 
                                                      ? 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-slate-100 dark:border-gray-700' 
                                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 cursor-not-allowed opacity-50 relative'
                                              }`}
                                      >
                                          {size}
                                          {!available && (
                                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full border border-white">غير متوفر</span>
                                          )}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Integrated Quantity Controls */}
              <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                           <button onClick={() => handleQuantityChange(1)} className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-700 text-primary shadow-sm flex items-center justify-center active:scale-90 transition-all border border-slate-100 dark:border-gray-600"><PlusIcon className="w-5 h-5" /></button>
                           <span className="font-black text-xl text-gray-900 dark:text-white w-8 text-center">{quantity}</span>
                           <button onClick={() => handleQuantityChange(-1)} className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-700 text-gray-400 shadow-sm flex items-center justify-center active:scale-90 transition-all border border-slate-100 dark:border-gray-600"><MinusIcon className="w-5 h-5" /></button>
                       </div>
                       <div className="text-right">
                           <span className="text-xs font-black text-gray-400 block mb-1">عدد القطع</span>
                           <span className="text-sm font-black text-gray-800 dark:text-white">حدد الكمية المطلوبة</span>
                       </div>
                  </div>
              </div>
          </div>

          {/* 4. Marketing Copy Section */}
          <div className="pb-10">
              {product.telegramUrl && (
                  <a 
                    href={product.telegramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9] hover:text-white py-4 rounded-[24px] transition-all duration-300 text-sm font-black border border-[#229ED9]/20 shadow-sm mb-6"
                  >
                    <i className="fa-brands fa-telegram text-xl"></i>
                    <span>حمل صور او فيديو المنتج من تليكرام</span>
                  </a>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-bullhorn text-[12px] text-primary"></i>
                         </div>
                         <h3 className="font-black text-gray-800 dark:text-gray-200 text-xs">الوصف التسويقي الجاهز</h3>
                      </div>
                      <button 
                        onClick={() => handleCopyText(marketingText)}
                        className="flex items-center gap-2 bg-white dark:bg-gray-700 text-primary dark:text-primary-light border border-slate-200 dark:border-gray-600 rounded-xl px-4 py-2 transition-all shadow-sm active:scale-95 text-[10px] font-black"
                      >
                          <CopyIcon className="w-3 h-3" />
                          <span>نسخ الوصف</span>
                      </button>
                  </div>
                  <div className="p-6">
                      <div className="text-right text-gray-800 dark:text-gray-200 text-base font-bold leading-loose whitespace-pre-wrap">
                          {marketingText}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 5. Sticky CTA Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-6 py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={handleAddToCartClick}
            disabled={!selectedSize || (product.stock === 0)}
            className="w-full bg-primary text-white active:scale-95 transition-all duration-500 font-black text-base py-4 rounded-[24px] shadow-xl shadow-primary/30 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
              <CartIcon className="w-6 h-6" />
              <span>
                  {product.stock === 0 ? 'للأسف، غير متوفر حالياً' : !selectedSize ? 'اختر القياس أولاً' : `أضف للسلة • ${displayPrice.toLocaleString()} د.ع`}
              </span>
          </button>
      </div>
    </div>
  );
};

export default ProductDetailsPage;