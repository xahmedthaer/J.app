
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { BookmarkIcon, PlusIcon, MinusIcon, ChevronDownIcon, XMarkIcon, CopyIcon, CartIcon } from './icons';

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
  // Initialize size as null to force user selection
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'promo'>('details');
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleAddToCartClick = () => {
    if (selectedSize) {
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product, selectedSize);
        }
    } else {
        addNotification('يرجى اختيار القياس أولاً');
        // Shake effect or visual cue could be added here
        const sizeSection = document.getElementById('size-selection-section');
        if(sizeSection) {
            sizeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            sizeSection.classList.add('animate-pulse');
            setTimeout(() => sizeSection.classList.remove('animate-pulse'), 1000);
        }
    }
  };

  const handleQuantityChange = (delta: number) => {
      setQuantity(prev => Math.max(1, prev + delta));
  };

  // Calculate total stock across all variants
  const totalStock = useMemo(() => {
      return product.inventory.reduce((a, b) => a + b.stock, 0);
  }, [product.inventory]);

  // Find selected inventory item to check strictly for 0 stock if needed for logic, 
  // but display will use totalStock
  const selectedInventoryItem = useMemo(() => {
    if (!selectedSize) return null;
    return product.inventory.find(inv => inv.size === selectedSize);
  }, [product.inventory, selectedSize]);

  const handleCopyText = (text: string) => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      addNotification('تم نسخ النص');
  };

  const handleCopyDetails = () => {
      let fullDetails = product.name + '\n\n';
      
      if (product.details) {
          const detailsText = Object.entries(product.details)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
          fullDetails += detailsText + '\n\n';
      }
      
      if (product.description) {
          fullDetails += product.description;
      }
      
      handleCopyText(fullDetails.trim());
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

  // Determine content for Promo Tab
  const marketingText = product.marketing_description || product.promo || 'لا يوجد نص ترويجي محدد.';

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

      {/* 1. Curved Image Header with Swipe - Square Aspect Ratio */}
      <div 
        className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-b-[30px] overflow-hidden shadow-sm z-0 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
          <img 
            src={product.image_urls[currentMainImageIndex]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-opacity duration-300"
            onClick={() => setIsGalleryOpen(true)}
          />
          
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

      <div className="px-4 pt-4">
          {/* 2. Title & Action Row */}
          <div className="flex justify-between items-start mb-2">
              {/* Right Side: Title */}
              <div className="text-right flex-1 pl-2">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h1>
              </div>

              {/* Left Side: Icons (Bookmark) */}
              <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => onSaveToggle(product.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 ${isSaved ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                      <BookmarkIcon filled={isSaved} className="text-[16px]" />
                  </button>
              </div>
          </div>

          {/* Wholesale Price & Stock */}
          <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">سعر الجملة</span>
                  <p className="text-xl font-bold text-primary dark:text-primary-light leading-none">
                      {product.price.toLocaleString()} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">د.ع</span>
                  </p>
              </div>
              
              <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">المخزون</span>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200 leading-none dir-ltr">
                      {totalStock}
                  </p>
              </div>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-100 dark:border-gray-800 mb-3"></div>

          {/* 3. Primary Color Price Range Bar (Curved Soft Rectangle - Telegram Style) */}
          <div className="w-full bg-[#E6F7F5] dark:bg-primary/10 text-primary dark:text-primary-light py-3 px-4 rounded-2xl border border-primary/20 flex justify-between items-center mb-6 shadow-sm">
              <span className="text-xs font-bold flex items-center gap-2">
                  <i className="fa-solid fa-tags"></i>
                  سعر الزبون المقترح
              </span>
              <span className="font-bold dir-ltr text-sm">
                  {product.min_sell_price.toLocaleString()} - {product.max_sell_price.toLocaleString()} <span className="text-[10px]">د.ع</span>
              </span>
          </div>

          {/* 4. Streamlined Size & Quantity Row - Clean Style */}
          <div id="size-selection-section" className="mb-6">
              <div className="flex items-center gap-4 h-12">
                  {/* Size Selector (Scrollable) */}
                  <div className="flex-1 flex items-center overflow-hidden h-full relative">
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full py-1 h-full pl-6">
                          {product.inventory.map((inv) => {
                              const isSelected = selectedSize === inv.size;
                              const isOutOfStock = inv.stock === 0;
                              return (
                                  <button
                                      key={inv.size}
                                      onClick={() => !isOutOfStock && setSelectedSize(inv.size)}
                                      disabled={isOutOfStock}
                                      className={`
                                          flex-shrink-0 px-4 h-9 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center min-w-[45px] border
                                          ${isSelected 
                                              ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
                                              : isOutOfStock
                                                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                                                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                          }
                                      `}
                                  >
                                      {inv.size}
                                  </button>
                              );
                          })}
                      </div>
                      {/* Left Fade for scroll indication */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Quantity Selector (Compact - Clean Style) */}
                  <div className="flex-shrink-0 flex items-center gap-3 h-full">
                       <button 
                          onClick={() => handleQuantityChange(1)}
                          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-primary shadow-sm flex items-center justify-center active:scale-95 transition-transform border border-transparent hover:border-primary/30"
                      >
                          <PlusIcon className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg text-gray-800 dark:text-white w-6 text-center">{quantity}</span>
                      <button 
                          onClick={() => handleQuantityChange(-1)}
                          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 shadow-sm flex items-center justify-center active:scale-95 transition-transform hover:bg-gray-200"
                      >
                          <MinusIcon className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </div>

          {/* Straight Line Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 mb-4"></div>

          {/* 5. Tabs & Content */}
          <div>
              {/* Telegram Link Button - Moved Here (Above Tabs) - Soft Rectangle */}
              {product.telegramUrl && (
                  <div className="mb-4 w-full">
                      <a 
                          href={product.telegramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9] hover:text-white py-2.5 rounded-2xl transition-all duration-300 text-xs font-bold border border-[#229ED9]/20"
                      >
                          <i className="fa-brands fa-telegram text-base"></i>
                          <span>حمل صور او فيديو هذا المنتج من التليكرام</span>
                      </a>
                  </div>
              )}

              {/* Updated Tab Buttons - Underline Style */}
              <div className="flex w-full mb-6 border-b border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 pb-3 text-center text-sm font-bold transition-all relative ${
                        activeTab === 'details' 
                        ? 'text-primary' 
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                    }`}
                  >
                      تفاصيل المنتج
                      {activeTab === 'details' && (
                          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full"></span>
                      )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('promo')}
                    className={`flex-1 pb-3 text-center text-sm font-bold transition-all relative ${
                        activeTab === 'promo' 
                        ? 'text-primary' 
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                    }`}
                  >
                      وصف ترويجي
                      {activeTab === 'promo' && (
                          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full"></span>
                      )}
                  </button>
              </div>

              <div className="text-right leading-relaxed min-h-[100px] animate-fade-in pb-4">
                  {activeTab === 'details' ? (
                      <div className="relative">
                          {/* Use block and float for button to wrap text around it */}
                          <div className="block">
                              <button 
                                onClick={handleCopyDetails}
                                className="float-left ml-0 mr-2 mb-2 flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-3 py-1.5 transition-all shadow-sm active:scale-95 text-xs font-bold"
                                aria-label="نسخ التفاصيل"
                              >
                                  <CopyIcon className="w-3.5 h-3.5" />
                                  <span>نسخ</span>
                              </button>
                              
                              <div className="space-y-2 text-gray-800 dark:text-gray-200 text-sm font-medium">
                                  {product.details ? (
                                      Object.entries(product.details).map(([key, value], index) => (
                                          <div key={index} className="block">
                                              <span className="inline font-bold text-gray-900 dark:text-gray-100">{key}:</span>
                                              <span className="inline text-gray-600 dark:text-gray-400"> {value}</span>
                                          </div>
                                      ))
                                  ) : null}
                                  <div className="pt-2 mt-2 border-t border-dashed border-gray-200 dark:border-gray-800 w-full clear-both">
                                       <p className="text-gray-600 dark:text-gray-400 text-base leading-loose">{product.description}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ) : (
                      /* Promo Content */
                      <div className="relative block">
                          <button 
                            onClick={() => handleCopyText(marketingText)}
                            className="float-left ml-0 mr-2 mb-2 flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-3 py-1.5 transition-all shadow-sm active:scale-95 text-xs font-bold"
                            aria-label="نسخ الوصف الترويجي"
                          >
                              <CopyIcon className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                          </button>
                          <div className="text-right text-gray-800 dark:text-gray-200 text-base font-medium leading-loose whitespace-pre-wrap">
                              {marketingText}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* 6. Fixed Bottom Button - Small & Compact - Soft Rectangle */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-900 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={handleAddToCartClick}
            disabled={!selectedSize || (selectedInventoryItem?.stock === 0)}
            className="w-full bg-[#D1F5EF] text-[#00B49D] hover:bg-[#00B49D] hover:text-white active:scale-98 transition-all duration-300 font-bold text-sm py-2.5 rounded-2xl shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
              <CartIcon className="w-4 h-4" />
              <span>
                  {!selectedSize 
                    ? 'اختر القياس أولاً' 
                    : (selectedInventoryItem?.stock === 0 ? 'نفذت الكمية' : 'أضف الى السلة')
                  }
              </span>
          </button>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
