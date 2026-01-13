
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../../types';
import { PlusIcon, TrashIcon, XMarkIcon, CameraIcon, CubesStackIcon, CalculatorIcon } from '../common/icons';
import { HeaderConfig } from '../../App';

interface AdminProductEditPageProps {
  productToEdit?: Product | null;
  onSave: (product: Product | Omit<Product, 'id'>) => void;
  onCancel: () => void;
  onDeleteProduct: (productId: string) => void; 
  categories: Category[];
  setHeaderConfig: (config: HeaderConfig | null) => void;
}

const AdminProductEditPage: React.FC<AdminProductEditPageProps> = ({ productToEdit, onSave, onCancel, onDeleteProduct, categories: dynamicCategories, setHeaderConfig }) => {
  // Basic Info
  const [name, setName] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Series Configuration
  const [seriesCount, setSeriesCount] = useState<number>(0);
  const [seriesSizes, setSeriesSizes] = useState('');
  const [stock, setStock] = useState<number>(0); // Total Series Stock

  // Pricing
  const [price, setPrice] = useState<number>(0); // Wholesale Price
  const [minSellPrice, setMinSellPrice] = useState<number>(0);
  const [maxSellPrice, setMaxSellPrice] = useState<number>(0);
  
  // Marketing & Categorization
  const [promo, setPromo] = useState('');
  const [description, setDescription] = useState('');
  const [marketingDescription, setMarketingDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [detailsList, setDetailsList] = useState<{key: string, value: string}[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  // Derived Calculations
  const costPerPiece = useMemo(() => {
      if (seriesCount > 0 && price > 0) {
          return Math.round(price / seriesCount);
      }
      return 0;
  }, [price, seriesCount]);

  const minProfit = useMemo(() => {
      if (minSellPrice > 0 && price > 0) {
          return minSellPrice - price;
      }
      return 0;
  }, [minSellPrice, price]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(productToEdit.price);
      setMinSellPrice(productToEdit.min_sell_price);
      setMaxSellPrice(productToEdit.max_sell_price);
      setPromo(productToEdit.promo);
      setDescription(productToEdit.description || '');
      setMarketingDescription(productToEdit.marketing_description || '');
      setImageUrls(productToEdit.image_urls || []);
      setCategory(productToEdit.category || '');
      setSubcategory(productToEdit.subcategory || '');
      setTelegramUrl(productToEdit.telegramUrl || '');
      setTags(productToEdit.tags || []);
      
      // Load Series Data
      setSeriesCount(productToEdit.series_count || 0);
      setSeriesSizes(productToEdit.series_sizes || '');
      setStock(productToEdit.stock || 0);

      // Convert details object to array
      if (productToEdit.details) {
          const dList = Object.entries(productToEdit.details).map(([key, value]) => ({ key, value }));
          setDetailsList(dList.length > 0 ? dList : [{key: '', value: ''}]);
      } else {
          setDetailsList([{key: '', value: ''}]);
      }

    } else {
      // Reset form for new product
      setName('');
      setPrice(0);
      setMinSellPrice(0);
      setMaxSellPrice(0);
      setPromo('');
      setDescription('');
      setMarketingDescription('');
      setImageUrls([]);
      setCategory('');
      setSubcategory('');
      setTelegramUrl('');
      setTags([]);
      
      setSeriesCount(0);
      setSeriesSizes('');
      setStock(0);
      setDetailsList([{key: '', value: ''}]);
    }
  }, [productToEdit]);

  useEffect(() => {
    setHeaderConfig({
        title: productToEdit ? 'تعديل المنتج' : 'إضافة منتج جديد',
        showBack: true,
        onBack: onCancel,
    });
    return () => setHeaderConfig(null);
  }, [productToEdit, onCancel, setHeaderConfig]);

  const handlePriceChange = (field: 'price' | 'min' | 'max', val: number) => {
    let newPrice = price;
    let newMin = minSellPrice;
    let newMax = maxSellPrice;

    if (field === 'price') { setPrice(val); newPrice = val; }
    if (field === 'min') { setMinSellPrice(val); newMin = val; }
    if (field === 'max') { setMaxSellPrice(val); newMax = val; }

    // Smart Promo Logic
    if (newPrice > 0 && newMin > 0) {
        const profit = newMin - newPrice;
        if (profit > 0) {
            let autoPromo = `اربح ${profit.toLocaleString()} د.ع`;
            if (newMax > newMin) {
                autoPromo += ' أو أكثر';
            }
            setPromo(autoPromo);
        }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  }

  const handleTagChange = (tag: string, checked: boolean) => {
      if (checked) {
          setTags(prev => [...prev, tag]);
      } else {
          setTags(prev => prev.filter(t => t !== tag));
      }
  };

  // Details Handler
  const handleDetailChange = (index: number, field: 'key' | 'value', value: string) => {
      const newList = [...detailsList];
      newList[index] = { ...newList[index], [field]: value };
      setDetailsList(newList);
  };

  const addDetailRow = () => {
      setDetailsList([...detailsList, { key: '', value: '' }]);
  };

  const removeDetailRow = (index: number) => {
      if (detailsList.length > 1) {
          setDetailsList(detailsList.filter((_, i) => i !== index));
      } else {
          setDetailsList([{ key: '', value: '' }]);
      }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name || price <= 0 || imageUrls.length === 0 || !category) {
        alert('يرجى ملء الاسم، السعر، الفئة، وإضافة صورة واحدة على الأقل.');
        return;
    }

    if (minSellPrice <= price) {
        alert('سعر البيع يجب أن يكون أكبر من سعر الجملة.');
        return;
    }

    if (maxSellPrice < minSellPrice) {
        alert('أعلى سعر بيع يجب أن يكون أكبر من أو يساوي أقل سعر بيع.');
        return;
    }

    // Series Validation
    if (seriesCount <= 0 || !seriesSizes || stock < 0) {
        alert('يرجى تعبئة تفاصيل السيرية (العدد، القياسات، والمخزون) بشكل صحيح.');
        return;
    }

    // Convert detailsList to object
    const detailsObject: Record<string, string> = {};
    detailsList.forEach(item => {
        if (item.key.trim() && item.value.trim()) {
            detailsObject[item.key.trim()] = item.value.trim();
        }
    });

    const productData: any = { 
        name, 
        brand: '', 
        price, 
        min_sell_price: minSellPrice, 
        max_sell_price: maxSellPrice,
        promo, 
        description,
        marketing_description: marketingDescription,
        image_urls: imageUrls, 
        category, 
        subcategory,
        telegramUrl,
        tags,
        details: Object.keys(detailsObject).length > 0 ? detailsObject : undefined,
        // Series Data
        series_count: seriesCount,
        series_sizes: seriesSizes,
        stock: stock
    };

    if (productToEdit) {
      onSave({ ...productData, id: productToEdit.id });
    } else {
      onSave(productData);
    }
  };

  const handleDeleteClick = () => {
    if (productToEdit && window.confirm(`هل أنت متأكد من حذف المنتج "${productToEdit.name}"؟`)) {
        onDeleteProduct(productToEdit.id);
        onCancel(); 
    }
  };

  const categoriesToDisplay = useMemo(() => {
      return dynamicCategories.filter(c => c.name !== 'الكل' && c.name !== 'جديد' && !c.parentId);
  }, [dynamicCategories]);

  const subcategoriesToDisplay = useMemo(() => {
      const selectedCat = dynamicCategories.find(c => c.name === category);
      if(!selectedCat) return [];
      return dynamicCategories.filter(c => c.parentId === selectedCat.id);
  }, [category, dynamicCategories]);

  return (
    <div className="p-4 dark:bg-slate-900 pb-32"> 
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto"> 
        
        {/* SECTION 1: IMAGES & BASIC INFO */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">الصور والاسم</h3>
            
            <div className="space-y-4">
                {/* Images */}
                <div className="grid grid-cols-4 gap-2">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img src={url} className="w-full h-full object-cover rounded-lg bg-gray-100 dark:bg-gray-700 shadow-sm" loading="lazy" />
                            <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-transform hover:scale-110">
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {imageUrls.length < 5 && (
                        <label htmlFor="image-upload" className="flex flex-col justify-center items-center w-full h-full border-2 border-primary/30 border-dashed rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors aspect-square">
                            <CameraIcon className="w-6 h-6 text-primary mb-1" />
                            <span className="text-[10px] text-primary font-bold">أضف صورة</span>
                            <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>

                {/* Name */}
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-1">اسم المنتج</label>
                    <input type="text" placeholder="مثال: قميص رجالي قطن" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none font-bold" />
                </div>
            </div>
        </div>

        {/* SECTION 2: SERIES CONFIGURATION (THE CORE) */}
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex justify-between items-center mb-4 border-b border-blue-200 dark:border-blue-800 pb-2">
                <label className="text-base font-extrabold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <CubesStackIcon className="w-5 h-5" />
                    تكوين السيرية (الباكيت)
                </label>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-blue-700 dark:text-blue-300 block text-right mb-1">عدد القطع في السيرية</label>
                        <input 
                            type="number" 
                            value={seriesCount || ''} 
                            onChange={e => setSeriesCount(Number(e.target.value))} 
                            className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-xl text-center bg-white dark:bg-gray-800 dark:text-white font-extrabold text-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                            min="1"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-blue-700 dark:text-blue-300 block text-right mb-1">المخزون (عدد السيريات)</label>
                        <input 
                            type="number" 
                            value={stock || ''} 
                            onChange={e => setStock(Number(e.target.value))} 
                            className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-xl text-center bg-white dark:bg-gray-800 dark:text-white font-extrabold text-lg focus:ring-2 focus:ring-blue-400 outline-none" 
                            min="0"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-blue-700 dark:text-blue-300 block text-right mb-1">وصف القياسات داخل السيرية</label>
                    <input 
                        type="text" 
                        placeholder="مثال: S:2, M:4, L:4, XL:2" 
                        value={seriesSizes} 
                        onChange={e => setSeriesSizes(e.target.value)} 
                        className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-xl text-right bg-white dark:bg-gray-800 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 outline-none" 
                    />
                </div>
            </div>
        </div>

        {/* SECTION 3: PRICING & PROFIT */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                <CalculatorIcon className="w-5 h-5 text-green-500" />
                التسعير والأرباح
            </h3>

            <div className="space-y-4">
                {/* Wholesale & Cost Per Piece */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                    <div>
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block text-right mb-1">سعر الجملة (للسيرية)</label>
                        <input 
                            type="number" 
                            placeholder="0" 
                            value={price || ''} 
                            onChange={e => handlePriceChange('price', Number(e.target.value))} 
                            required 
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl text-center bg-white dark:bg-gray-800 dark:text-white font-extrabold text-lg focus:ring-2 focus:ring-primary outline-none" 
                            min="0" 
                        />
                    </div>
                    <div className="flex flex-col justify-center items-center opacity-70">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">تكلفة القطعة الواحدة (تقريبي)</span>
                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300 dir-ltr">
                            {costPerPiece.toLocaleString()} <span className="text-xs">د.ع</span>
                        </div>
                    </div>
                </div>

                {/* Selling Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-1">أقل سعر بيع (للمسوق)</label>
                        <input type="number" placeholder="0" value={minSellPrice || ''} onChange={e => handlePriceChange('min', Number(e.target.value))} required className="w-full p-3 border dark:border-gray-600 rounded-xl text-center bg-white dark:bg-gray-700 dark:text-white font-bold" min="0" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-1">أعلى سعر بيع (للمسوق)</label>
                        <input type="number" placeholder="0" value={maxSellPrice || ''} onChange={e => handlePriceChange('max', Number(e.target.value))} required className="w-full p-3 border dark:border-gray-600 rounded-xl text-center bg-white dark:bg-gray-700 dark:text-white font-bold" min="0" />
                    </div>
                </div>

                {/* Auto Calc Feedback */}
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800/30">
                    <span className="text-xs font-bold text-green-700 dark:text-green-400">أقل ربح للمسوق:</span>
                    <span className="font-extrabold text-green-700 dark:text-green-400 text-lg dir-ltr">
                        {minProfit.toLocaleString()} <span className="text-xs">د.ع</span>
                    </span>
                </div>

                {/* Promo Text (Auto) */}
                <div>
                    <label className="text-xs font-bold text-gray-400 block text-right mb-1">شريط ترويجي (تلقائي)</label>
                    <input type="text" value={promo} onChange={e => setPromo(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-lg text-right bg-gray-50 dark:bg-gray-800 dark:text-gray-400 text-sm" />
                </div>
            </div>
        </div>

        {/* SECTION 4: CATEGORY & MARKETING & DETAILS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2">التصنيف، الوصف والتفاصيل</h3>
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-1">القسم الرئيسي</label>
                    <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory(''); }} required className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white outline-none">
                        <option value="">اختر القسم</option>
                        {categoriesToDisplay.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                </div>
                {subcategoriesToDisplay.length > 0 && (
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-1">القسم الفرعي</label>
                        <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white outline-none">
                            <option value="">بدون قسم فرعي</option>
                            {subcategoriesToDisplay.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-1">رابط تليكرام (لتحميل الميديا)</label>
                <div className="relative">
                    <input type="url" placeholder="https://t.me/..." value={telegramUrl} onChange={e => setTelegramUrl(e.target.value)} className="w-full p-3 pl-10 border dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white outline-none text-sm dir-ltr" />
                    <i className="fa-brands fa-telegram absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-lg"></i>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-primary dark:text-primary-light block text-right mb-1">الوصف التسويقي (جاهز للنسخ)</label>
                <textarea placeholder="اكتب هنا وصفاً جذاباً مع الإيموجي..." value={marketingDescription} onChange={e => setMarketingDescription(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right h-24 bg-white dark:bg-gray-700 dark:text-white outline-none resize-none"></textarea>
            </div>

            {/* Product Details (Key/Value) */}
            <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-2">تفاصيل المنتج (المادة، الأبعاد، إلخ)</label>
                <div className="space-y-2">
                    {detailsList.map((detail, index) => (
                        <div key={index} className="flex gap-2">
                            <button type="button" onClick={() => removeDetailRow(index)} className="text-red-500 p-2"><TrashIcon className="w-4 h-4" /></button>
                            <input 
                                type="text" 
                                placeholder="القيمة (مثال: قطن 100%)" 
                                value={detail.value} 
                                onChange={e => handleDetailChange(index, 'value', e.target.value)} 
                                className="flex-1 p-2 border dark:border-gray-700 rounded-lg text-right bg-gray-50 dark:bg-gray-700 dark:text-white"
                            />
                            <input 
                                type="text" 
                                placeholder="الخاصية (مثال: القماش)" 
                                value={detail.key} 
                                onChange={e => handleDetailChange(index, 'key', e.target.value)} 
                                className="w-1/3 p-2 border dark:border-gray-700 rounded-lg text-right bg-gray-50 dark:bg-gray-700 dark:text-white font-bold"
                            />
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addDetailRow} className="mt-3 text-sm text-primary font-semibold flex items-center gap-1 justify-end w-full">
                    <PlusIcon className="w-4 h-4"/> إضافة تفصيل آخر
               </button>
            </div>

            {/* Basic Description */}
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-1">وصف عام (ملاحظات إدارية)</label>
              <textarea placeholder="الوصف" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg text-right h-20 bg-gray-50 dark:bg-gray-700 dark:text-white resize-none"></textarea>
            </div>

            {/* Tags */}
            <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block text-right mb-2">وسوم مميزة</label>
                <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all w-fit ${tags.includes('bestseller') ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-500'}`}>
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={tags.includes('bestseller')}
                        onChange={(e) => handleTagChange('bestseller', e.target.checked)}
                    />
                    <span className="font-bold text-sm">الأكثر مبيعاً 🔥</span>
                </label>
            </div>
        </div>
        
      </form>

      {/* Fixed Footer with Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-700 z-50" style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`}}>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors">إلغاء</button>
            {productToEdit && (
                <button type="button" onClick={handleDeleteClick} className="w-14 bg-red-50 text-red-500 font-bold py-3.5 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center border border-red-100">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            )}
            <button type="submit" onClick={handleSubmit} className="flex-[2] bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95">
                {productToEdit ? 'حفظ التعديلات' : 'نشر المنتج'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default AdminProductEditPage;
