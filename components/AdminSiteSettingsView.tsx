
import React, { useState, useEffect } from 'react';
import { FaqItem, SiteSettings, BannerItem, Category } from '../types';
import { PlusIcon, TrashIcon, XMarkIcon, EditIcon, CameraIcon, PaletteIcon, QuestionIcon, BoxOpenIcon, ChevronDownIcon, ImageIcon, FileContractIcon } from './icons';

// Reusable Modern Card Component
const SettingsCard: React.FC<{ 
    title: string; 
    icon: React.ElementType; 
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}> = ({ title, icon: Icon, children, className = "", action }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col ${className}`}>
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            </div>
            {action}
        </div>
        <div className="p-5 flex-grow">
            {children}
        </div>
    </div>
);

// =================================================================
// BANNER SETTINGS
// =================================================================
const BannerSettings: React.FC<{
    siteSettings: SiteSettings;
    onUpdateSiteSettings: (settings: Partial<SiteSettings>) => void;
    categories: Category[];
}> = ({ siteSettings, onUpdateSiteSettings, categories }) => {
    const banners = siteSettings.banners || [];
    const [newBannerImage, setNewBannerImage] = useState<string | null>(null);
    const [newBannerCategory, setNewBannerCategory] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewBannerImage(reader.result as string);
                setIsAdding(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddBanner = () => {
        if (newBannerImage && banners.length < 5) {
            const newBanner: BannerItem = {
                imageUrl: newBannerImage,
                categoryLink: newBannerCategory || undefined
            };
            onUpdateSiteSettings({ banners: [...banners, newBanner] });
            setNewBannerImage(null);
            setNewBannerCategory('');
            setIsAdding(false);
        }
    };

    const handleCancelAdd = () => {
        setNewBannerImage(null);
        setNewBannerCategory('');
        setIsAdding(false);
    }

    const handleDeleteBanner = (index: number) => {
        if(window.confirm('هل أنت متأكد من حذف هذا البنر؟')) {
            const newBanners = banners.filter((_, i) => i !== index);
            onUpdateSiteSettings({ banners: newBanners });
        }
    };

    return (
        <SettingsCard title="بنرات العروض" icon={ImageIcon}>
             <div className="space-y-4">
                {/* Banners Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {banners.map((banner, index) => (
                        <div key={index} className="relative group rounded-2xl overflow-hidden shadow-sm aspect-[2/1] border border-gray-200 dark:border-gray-700">
                            <img src={banner.imageUrl} className="w-full h-full object-cover" loading="lazy" alt="Banner" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-white text-xs font-medium mb-1">
                                    {banner.categoryLink ? `🔗 ${banner.categoryLink}` : 'بدون رابط'}
                                </p>
                                <button 
                                    onClick={() => handleDeleteBanner(index)} 
                                    className="bg-red-500 text-white rounded-lg py-2 text-xs font-bold hover:bg-red-600 transition-colors w-full flex items-center justify-center gap-2"
                                >
                                    <TrashIcon className="w-3 h-3" /> حذف البنر
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {/* Add New Slot */}
                    {banners.length < 5 && !isAdding && (
                        <label htmlFor="banner-upload" className="relative flex flex-col justify-center items-center aspect-[2/1] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <PlusIcon className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                            </div>
                            <span className="text-sm font-bold text-gray-500 group-hover:text-primary transition-colors">إضافة بنر جديد</span>
                            <input id="banner-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                        </label>
                    )}
                </div>

                {/* Add Mode Controls */}
                {isAdding && newBannerImage && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 animate-fade-in">
                        <div className="flex gap-4 items-start">
                            <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border dark:border-gray-600">
                                <img src={newBannerImage} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block text-right">ربط بقسم (اختياري)</label>
                                    <select 
                                        value={newBannerCategory} 
                                        onChange={e => setNewBannerCategory(e.target.value)} 
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-right focus:ring-2 focus:ring-primary/50 outline-none"
                                    >
                                        <option value="">بدون رابط</option>
                                        {categories.filter(c => !c.parentId).map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleCancelAdd} className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg hover:bg-gray-300">إلغاء</button>
                                    <button onClick={handleAddBanner} className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">حفظ البنر</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
             </div>
        </SettingsCard>
    )
}

// =================================================================
// FAQ SETTINGS
// =================================================================
const FaqFormModal: React.FC<{
    itemToEdit?: FaqItem | null;
    onClose: () => void;
    onSave: (item: FaqItem) => void;
}> = ({ itemToEdit, onClose, onSave }) => {
    const [question, setQuestion] = useState(itemToEdit?.question || '');
    const [answer, setAnswer] = useState(itemToEdit?.answer || '');

    const handleSave = () => {
        if (!question || !answer) {
            alert('يرجى ملء جميع الحقول.');
            return;
        }
        onSave({ question, answer });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl transform scale-100 transition-all">
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{itemToEdit ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block text-right">السؤال</label>
                        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="اكتب السؤال هنا..." />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block text-right">الإجابة</label>
                        <textarea value={answer} onChange={e => setAnswer(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right h-32 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="اكتب الإجابة التفصيلية هنا..."></textarea>
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">إلغاء</button>
                    <button onClick={handleSave} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors">حفظ</button>
                </div>
            </div>
        </div>
    );
}

const FaqSettings: React.FC<{
    faqItems: FaqItem[];
    onSetFaqItems: (items: FaqItem[]) => void;
}> = ({ faqItems, onSetFaqItems }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<{item: FaqItem, index: number} | null>(null);

    const handleOpenModal = (item?: FaqItem, index?: number) => {
        setItemToEdit(item && index !== undefined ? { item, index } : null);
        setIsModalOpen(true);
    };

    const handleSave = (newItem: FaqItem) => {
        const newItems = [...faqItems];
        if (itemToEdit !== null) {
            newItems[itemToEdit.index] = newItem;
        } else {
            newItems.push(newItem);
        }
        onSetFaqItems(newItems);
    };
    
    const handleDelete = (index: number) => {
        if(window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
            onSetFaqItems(faqItems.filter((_, i) => i !== index));
        }
    }
    
    return (
        <SettingsCard 
            title="الأسئلة الشائعة" 
            icon={QuestionIcon}
            action={
                <button onClick={() => handleOpenModal()} className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm" title="إضافة سؤال">
                    <PlusIcon className="w-5 h-5" />
                </button>
            }
        >
             {isModalOpen && <FaqFormModal onClose={() => setIsModalOpen(false)} onSave={handleSave} itemToEdit={itemToEdit?.item} />}
             <div className="space-y-3">
                {faqItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                        لا توجد أسئلة مضافة حالياً
                    </div>
                ) : (
                    faqItems.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group hover:border-primary/30 transition-colors">
                            <div className="p-3 flex justify-between items-start gap-4">
                                <div className="flex-grow text-right">
                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">{item.question}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{item.answer}</p>
                                </div>
                                <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(item, index)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(index)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </SettingsCard>
    )
}

// =================================================================
// CATEGORY SETTINGS
// =================================================================
const CategoryFormModal: React.FC<{
    categoryToEdit?: Category | null;
    allCategories: Category[];
    onClose: () => void;
    onSave: (category: Category | (Omit<Category, 'id'>)) => void;
}> = ({ categoryToEdit, allCategories, onClose, onSave }) => {
    const [name, setName] = useState(categoryToEdit?.name || '');
    const [imageUrl, setImageUrl] = useState(categoryToEdit?.imageUrl || '');
    const [parentId, setParentId] = useState(categoryToEdit?.parentId || '');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        if (!name || !imageUrl) {
            alert('يرجى ملء اسم الفئة ورفع صورة.');
            return;
        }
        const categoryData: any = { name, imageUrl };
        if(parentId) categoryData.parentId = parentId;

        if (categoryToEdit) {
            onSave({ ...categoryToEdit, ...categoryData });
        } else {
            onSave(categoryData);
        }
        onClose();
    };

    const availableParents = allCategories.filter(c => c.id !== categoryToEdit?.id && !c.parentId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{categoryToEdit ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500 hover:text-red-500" /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block text-right">صورة القسم</label>
                        <label htmlFor="category-image-upload" className="flex justify-center items-center w-32 h-32 mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 overflow-hidden relative group transition-colors">
                            {imageUrl ? (
                                <>
                                    <img src={imageUrl} alt="preview" className="w-full h-full object-contain p-2" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CameraIcon className="w-8 h-8 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <CameraIcon className="w-8 h-8 text-gray-400 mb-1" />
                                    <p className="text-[10px] text-gray-400">اضغط للرفع</p>
                                </div>
                            )}
                            <input id="category-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block text-right">اسم القسم</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="مثال: إلكترونيات" />
                    </div>
                    
                    {/* Allow nesting for any category */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block text-right">تابع لقسم رئيسي (اختياري)</label>
                        <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none">
                            <option value="">-- هذا قسم رئيسي --</option>
                            {availableParents.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl hover:bg-gray-200">إلغاء</button>
                    <button onClick={handleSave} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90">حفظ</button>
                </div>
            </div>
        </div>
    )
}

const CategorySettings: React.FC<{
    categories: Category[];
    onSetCategories: (categories: Category[]) => void;
}> = ({ categories, onSetCategories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    
    const handleOpenModal = (category?: Category) => {
        setCategoryToEdit(category || null);
        setIsModalOpen(true);
    };

    const handleSave = (categoryData: Category | Omit<Category, 'id'>) => {
        if ('id' in categoryData) {
            onSetCategories(categories.map(c => c.id === categoryData.id ? categoryData : c));
        } else {
            const newCategory = { ...categoryData, id: `cat-${Date.now()}` };
            onSetCategories([...categories, newCategory]);
        }
    };

    const handleDelete = (categoryId: string) => {
        if (window.confirm(`هل أنت متأكد من حذف هذه الفئة؟`)) {
            onSetCategories(categories.filter(c => c.id !== categoryId && c.parentId !== categoryId));
        }
    };

    // Sort categories, putting "الكل" (All) at the top
    const sortedCategories = [...categories].sort((a, b) => {
        if (a.name === 'الكل') return -1;
        if (b.name === 'الكل') return 1;
        if (!a.parentId && !b.parentId) return a.name.localeCompare(b.name);
        if (b.parentId === a.id) return -1;
        if (a.parentId === b.id) return 1;
        const parentA = a.parentId ? categories.find(c => c.id === a.parentId)?.name || '' : a.name;
        const parentB = b.parentId ? categories.find(c => c.id === b.parentId)?.name || '' : b.name;
        if (parentA !== parentB) return parentA.localeCompare(parentB);
        return a.name.localeCompare(b.name);
    });

    return (
        <SettingsCard 
            title="فئات المتجر" 
            icon={BoxOpenIcon}
            action={
                <button onClick={() => handleOpenModal()} className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm" title="إضافة فئة">
                    <PlusIcon className="w-5 h-5" />
                </button>
            }
        >
            {isModalOpen && <CategoryFormModal onClose={() => setIsModalOpen(false)} onSave={handleSave} categoryToEdit={categoryToEdit} allCategories={categories} />}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                 {sortedCategories.map((category) => {
                    const isSub = !!category.parentId;
                    return (
                        <div key={category.id} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${isSub ? 'bg-gray-50/50 dark:bg-gray-800/30 mr-6 border-r-2 border-gray-300 dark:border-gray-600' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            {/* Image */}
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-600 p-1 border dark:border-gray-500 flex-shrink-0">
                                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-contain" />
                            </div>
                            
                            {/* Details */}
                            <div className="flex-grow text-right">
                                <p className={`font-bold ${isSub ? 'text-gray-600 dark:text-gray-300 text-sm' : 'text-gray-800 dark:text-white text-base'}`}>
                                    {category.name}
                                </p>
                                {isSub && <span className="text-[10px] text-gray-400">فئة فرعية</span>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleOpenModal(category)} className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg transition-colors"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(category.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded-lg transition-colors"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    );
                 })}
            </div>
        </SettingsCard>
    );
};

// =================================================================
// POLICY SETTINGS
// =================================================================
const PolicySettings: React.FC<{
    siteSettings: SiteSettings;
    onUpdateSiteSettings: (settings: Partial<SiteSettings>) => void;
}> = ({ siteSettings, onUpdateSiteSettings }) => {
    const policyTypes = [
        { key: 'privacyPolicy', label: 'سياسة الخصوصية' },
        { key: 'termsAndConditions', label: 'الشروط والأحكام' },
        { key: 'serviceFeesDescription', label: 'وصف رسوم الخدمة' },
    ];

    const [selectedPolicyKey, setSelectedPolicyKey] = useState(policyTypes[0].key);
    const [content, setContent] = useState('');

    useEffect(() => {
        // Load content based on selection
        const key = selectedPolicyKey as keyof SiteSettings;
        setContent((siteSettings[key] as string) || '');
    }, [selectedPolicyKey, siteSettings]);

    const handleSave = () => {
        onUpdateSiteSettings({ [selectedPolicyKey]: content });
        alert('تم حفظ السياسة بنجاح');
    };

    return (
        <SettingsCard title="سياسات المتجر" icon={FileContractIcon}>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block text-right">اختر السياسة لتعديلها</label>
                    <select 
                        value={selectedPolicyKey} 
                        onChange={e => setSelectedPolicyKey(e.target.value)}
                        className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        {policyTypes.map(p => (
                            <option key={p.key} value={p.key}>{p.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 block text-right">محتوى السياسة</label>
                    <textarea 
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full p-4 border dark:border-gray-600 rounded-xl text-right h-64 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none leading-relaxed"
                        placeholder="اكتب تفاصيل السياسة هنا..."
                    ></textarea>
                </div>

                <button 
                    onClick={handleSave} 
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-98"
                >
                    حفظ التغييرات
                </button>
            </div>
        </SettingsCard>
    );
};

// =================================================================
// MAIN VIEW
// =================================================================

interface AdminSiteSettingsViewProps {
  faqItems: FaqItem[];
  onSetFaqItems: (items: FaqItem[]) => void;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: Partial<SiteSettings>) => void;
  categories: Category[];
  onSetCategories: (categories: Category[]) => void;
}

const AdminSiteSettingsView: React.FC<AdminSiteSettingsViewProps> = ({ faqItems, onSetFaqItems, siteSettings, onUpdateSiteSettings, categories, onSetCategories }) => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
            <div className="space-y-6">
                <BannerSettings siteSettings={siteSettings} onUpdateSiteSettings={onUpdateSiteSettings} categories={categories} />
                <FaqSettings faqItems={faqItems} onSetFaqItems={onSetFaqItems} />
            </div>
            <div className="space-y-6">
                <CategorySettings categories={categories} onSetCategories={onSetCategories} />
                <PolicySettings siteSettings={siteSettings} onUpdateSiteSettings={onUpdateSiteSettings} />
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AdminSiteSettingsView;
