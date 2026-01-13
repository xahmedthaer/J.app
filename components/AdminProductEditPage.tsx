
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, Supplier } from '../types';
import { PlusIcon, TrashIcon, XMarkIcon, CameraIcon, MinusIcon } from './icons'; // Import MinusIcon
import { HeaderConfig } from '../App';

interface AdminProductEditPageProps {
  productToEdit?: Product | null;
  onSave: (product: Product | Omit<Product, 'id'>) => void;
  onCancel: () => void;
  onDeleteProduct: (productId: string) => void; // New prop for deleting
  categories: Category[];
  suppliers: Supplier[]; // NEW PROP
  setHeaderConfig: (config: HeaderConfig | null) => void;
}

const AdminProductEditPage: React.FC<AdminProductEditPageProps> = ({ productToEdit, onSave, onCancel, onDeleteProduct, categories: dynamicCategories, suppliers, setHeaderConfig }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [minSellPrice, setMinSellPrice] = useState(0);
  const [maxSellPrice, setMaxSellPrice] = useState(0);
  const [supplierPrice, setSupplierPrice] = useState(0); // NEW STATE
  const [supplierId, setSupplierId] = useState(''); // NEW STATE
  const [promo, setPromo] = useState('');
  const [description, setDescription] = useState('');
  const [marketingDescription, setMarketingDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [inventory, setInventory] = useState<{ size: string, stock: number }[]>([]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [detailsList, setDetailsList] = useState<{key: string, value: string}[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(productToEdit.price);
      setMinSellPrice(productToEdit.min_sell_price);
      setMaxSellPrice(productToEdit.max_sell_price);
      setSupplierPrice(productToEdit.supplierPrice || 0); // Load Supplier Price
      setSupplierId(productToEdit.supplierId || ''); // Load Supplier ID
      setPromo(productToEdit.promo);
      setDescription(productToEdit.description || '');
      setMarketingDescription(productToEdit.marketing_description || '');
      setImageUrls(productToEdit.image_urls || []);
      setInventory(productToEdit.inventory.length > 0 ? productToEdit.inventory : [{ size: '', stock: 0 }]); // Ensure at least one empty item for UI
      setCategory(productToEdit.category || '');
      setSubcategory(productToEdit.subcategory || '');
      setTelegramUrl(productToEdit.telegramUrl || '');
      setTags(productToEdit.tags || []);
      
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
      setSupplierPrice(0);
      setSupplierId('');
      setPromo('');
      setDescription('');
      setMarketingDescription('');
      setImageUrls([]);
      setInventory([{ size: '', stock: 0 }]); // Default with one empty inventory item
      setCategory('');
      setSubcategory('');
      setTelegramUrl('');
      setDetailsList([{key: '', value: ''}]);
      setTags([]);
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

  const handleInventoryChange = (index: number, field: 'size' | 'stock', value: string | number) => {
    const newInventory = [...inventory];
    newInventory[index] = { ...newInventory[index], [field]: value };
    setInventory(newInventory);
  };

  const handleQuantityChange = (index: number, delta: number) => {
    const newInventory = [...inventory];
    const currentStock = newInventory[index].stock || 0;
    const newStock = Math.max(0, currentStock + delta); // Ensure stock doesn't go below 0
    newInventory[index] = { ...newInventory[index], stock: newStock };
    setInventory(newInventory);
  };


  const addInventoryItem = () => {
    setInventory([...inventory, { size: '', stock: 0 }]);
  };

  const removeInventoryItem = (index: number) => {
    if (inventory.length > 1) {
      setInventory(inventory.filter((_, i) => i !== index));
    } else {
      // If only one item, clear it instead of removing
      setInventory([{ size: '', stock: 0 }]);
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

  const handleTagChange = (tag: string, checked: boolean) => {
      if (checked) {
          setTags(prev => [...prev, tag]);
      } else {
          setTags(prev => prev.filter(t => t !== tag));
      }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name || 
      price <= 0 || 
      imageUrls.length === 0 || 
      !category || 
      inventory.some(item => !item.size || item.stock < 0) || 
      minSellPrice <= price || 
      maxSellPrice < minSellPrice
    ) {
        alert('يرجى ملء جميع الحقول المطلوبة بشكل صحيح والتأكد من أن أسعار البيع منطقية (سعر البيع الأدنى > سعر الجملة، وسعر البيع الأعلى >= سعر البيع الأدنى).');
        return;
    }

    // Convert detailsList to object
    const detailsObject: Record<string, string> = {};
    detailsList.forEach(item => {
        if (item.key.trim() && item.value.trim()) {
            detailsObject[item.key.trim()] = item.value.trim();
        }
    });

    const productData = { 
        name, 
        brand: '', 
        price, 
        min_sell_price: minSellPrice, 
        max_sell_price: maxSellPrice,
        supplierPrice, // Add Supplier Price
        supplierId, // Add Supplier ID 
        promo, 
        description, 
        marketing_description: marketingDescription,
        image_urls: imageUrls, 
        inventory, 
        category, 
        subcategory,
        telegramUrl,
        details: Object.keys(detailsObject).length > 0 ? detailsObject : undefined,
        tags
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
        onCancel(); // Go back to product list after deleting
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
    <div className="p-4 dark:bg-slate-900 pb-24"> {/* Added pb-24 for fixed footer */}
      <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased space-y */}
        
        {/* Image Upload Section */}
        <div className="p-4">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-2">صور المنتج (1 كحد أدنى، 5 كحد أقصى)</label>
          <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                      <img src={url} className="w-full h-full object-cover rounded-lg bg-gray-100 dark:bg-gray-700" loading="lazy" />
                      <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <XMarkIcon className="w-4 h-4" />
                      </button>
                  </div>
              ))}
              {imageUrls.length < 5 && (
                  <label htmlFor="image-upload" className="flex justify-center items-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 aspect-square">
                      <div className="flex flex-col items-center justify-center text-center">
                          <CameraIcon className="w-8 h-8 text-gray-500" />
                          <p className="text-xs text-gray-500">رفع صورة</p>
                      </div>
                      <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                  </label>
              )}
          </div>
        </div>

        {/* Product Name */}
        <div className="p-4">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">اسم المنتج</label>
          <input type="text" placeholder="عنوان المنتج" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" />
        </div>
        
        {/* Telegram Link */}
        <div className="p-4">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">رابط تليكرام (للصور والفيديو)</label>
          <div className="relative">
             <input type="url" placeholder="https://t.me/..." value={telegramUrl} onChange={e => setTelegramUrl(e.target.value)} className="w-full p-3 pl-10 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" />
             <i className="fa-brands fa-telegram absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-xl"></i>
          </div>
        </div>

        {/* Inventory and Sizes */}
        <div className="p-4">
           <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-2">المخزون والقياسات</label>
           <div className="space-y-3">
              {inventory.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                      <button type="button" onClick={() => removeInventoryItem(index)} className="text-red-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={inventory.length <= 1} aria-label="حذف القياس">
                        <TrashIcon />
                      </button>
                      
                      {/* Quantity +/- Buttons and Input */}
                      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex-grow justify-between">
                        <button type="button" onClick={() => handleQuantityChange(index, 1)} className="p-2 text-primary dark:text-primary-light hover:bg-primary-light dark:hover:bg-primary/20" aria-label="زيادة الكمية">
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                        <input 
                            type="number" 
                            value={item.stock || ''} 
                            onChange={e => handleInventoryChange(index, 'stock', Number(e.target.value))} 
                            required 
                            className="text-center w-full p-2 bg-white dark:bg-gray-800 dark:text-white border-x dark:border-gray-700 focus:outline-none" 
                            min="0" 
                            aria-label={`الكمية المتوفرة للقياس ${item.size}`}
                        />
                        <button type="button" onClick={() => handleQuantityChange(index, -1)} className="p-2 text-primary dark:text-primary-light hover:bg-primary-light dark:hover:bg-primary/20" aria-label="تقليل الكمية">
                            <MinusIcon className="w-5 h-5"/>
                        </button>
                      </div>

                       <input type="text" placeholder="القياس" value={item.size} onChange={e => handleInventoryChange(index, 'size', e.target.value)} required className="w-1/2 p-2 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" />
                  </div>
              ))}
           </div>
           <button type="button" onClick={addInventoryItem} className="mt-3 text-sm text-primary font-semibold flex items-center gap-1 justify-end w-full">
                <PlusIcon className="w-4 h-4"/> إضافة قياس آخر
           </button>
        </div>

        {/* Supplier & Cost Pricing (Admin Only) */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-700/30">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-right">بيانات المورد (خاص بالإدارة)</h3>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">المورد</label>
                    <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white">
                        <option value="">اختر مورد</option>
                        {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">ربح المورد (للقطعة)</label>
                    <input type="number" placeholder="المبلغ الذي يربحه المورد" value={supplierPrice || ''} onChange={e => setSupplierPrice(Number(e.target.value))} className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" min="0" />
                </div>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2 text-right leading-relaxed">
                <i className="fa-solid fa-circle-info ml-1"></i>
                هذا المبلغ سيتم إضافته <strong>تلقائياً</strong> لرصيد المورد عند تسليم الطلب بنجاح (حالة الطلب: مكتمل).
            </p>
        </div>

        {/* Pricing fields (horizontal) */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
             <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">سعر الجملة للمسوق</label>
                <input type="number" placeholder="سعر جملة" value={price || ''} onChange={e => handlePriceChange('price', Number(e.target.value))} required className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" min="0" />
            </div>
             <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">أقل سعر بيع</label>
                <input type="number" placeholder="أقل سعر بيع" value={minSellPrice || ''} onChange={e => handlePriceChange('min', Number(e.target.value))} required className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" min="0" />
            </div>
             <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">أعلى سعر بيع</label>
                <input type="number" placeholder="أعلى سعر بيع" value={maxSellPrice || ''} onChange={e => handlePriceChange('max', Number(e.target.value))} required className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" min="0" />
            </div>
          </div>
        </div>

        {/* Promotional Tag */}
        <div className="p-4">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">شريط ترويجي (يتم حسابه تلقائياً عند ادخال الاسعار)</label>
          <input type="text" placeholder="مثال: اربح 5,000 د.ع" value={promo} onChange={e => setPromo(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white" />
        </div>

        {/* Marketing Description (NEW) */}
        <div className="p-4">
          <label className="text-sm font-semibold text-primary dark:text-primary-light block text-right mb-1">وصف ترويجي (جاهز لنسخ المسوق)</label>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right mb-2">اكتب هنا الوصف الذي سينسخه المسوق لنشره على صفحاته (مع الإيموجي والتفاصيل الجذابة).</p>
          <textarea placeholder="مثال: 🔥 عرض خاص لفترة محدودة! احصل على..." value={marketingDescription} onChange={e => setMarketingDescription(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg text-right h-32 bg-white dark:bg-gray-800 dark:text-white"></textarea>
        </div>

        {/* Category */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">فئة المنتج</label>
                <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory(''); }} required className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white">
                    <option value="">اختر فئة</option>
                    {categoriesToDisplay.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
            </div>
            {subcategoriesToDisplay.length > 0 && (
                <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">الفئة الفرعية</label>
                    <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white">
                        <option value="">بدون فئة فرعية</option>
                        {subcategoriesToDisplay.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                    </select>
                </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="p-4">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-2">وسوم مميزة</label>
            <div className="flex gap-2">
                <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${tags.includes('bestseller') ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={tags.includes('bestseller')}
                        onChange={(e) => handleTagChange('bestseller', e.target.checked)}
                    />
                    <span className="font-bold">الأكثر مبيعاً 🔥</span>
                </label>
            </div>
        </div>

        {/* Product Details (Key/Value) */}
        <div className="p-4">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-2">تفاصيل المنتج (المادة، الأبعاد، إلخ)</label>
            <div className="space-y-2">
                {detailsList.map((detail, index) => (
                    <div key={index} className="flex gap-2">
                        <button type="button" onClick={() => removeDetailRow(index)} className="text-red-500 p-2"><TrashIcon/></button>
                        <input 
                            type="text" 
                            placeholder="القيمة (مثال: قطن 100%)" 
                            value={detail.value} 
                            onChange={e => handleDetailChange(index, 'value', e.target.value)} 
                            className="flex-1 p-2 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white"
                        />
                        <input 
                            type="text" 
                            placeholder="الخاصية (مثال: القماش)" 
                            value={detail.key} 
                            onChange={e => handleDetailChange(index, 'key', e.target.value)} 
                            className="w-1/3 p-2 border dark:border-gray-700 rounded-lg text-right bg-white dark:bg-gray-800 dark:text-white font-bold"
                        />
                    </div>
                ))}
            </div>
            <button type="button" onClick={addDetailRow} className="mt-3 text-sm text-primary font-semibold flex items-center gap-1 justify-end w-full">
                <PlusIcon className="w-4 h-4"/> إضافة تفصيل آخر
           </button>
        </div>

        {/* Basic Description */}
        <div className="p-4">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block text-right mb-1">وصف عام (ملاحظات إدارية أو عامة)</label>
          <textarea placeholder="الوصف" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border dark:border-gray-700 rounded-lg text-right h-24 bg-white dark:bg-gray-800 dark:text-white"></textarea>
        </div>
        
        {/* Submit button is now part of the fixed footer */}
      </form>

      {/* Fixed Footer with Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-white dark:bg-gray-800 p-4 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-700" style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`}}>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg">إلغاء</button>
            {productToEdit && (
                <button type="button" onClick={handleDeleteClick} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg">حذف</button>
            )}
            <button type="submit" onClick={handleSubmit} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg">{productToEdit ? 'حفظ' : 'إضافة'}</button>
          </div>
      </div>
    </div>
  );
};

export default AdminProductEditPage;
