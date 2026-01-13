
import React, { useState, useEffect } from 'react';
import { FaqItem, SiteSettings, Category } from '../../types';
import { PlusIcon, TrashIcon, XMarkIcon, EditIcon, CameraIcon, QuestionIcon, BoxOpenIcon, FileContractIcon, LayoutGridIcon } from '../common/icons';

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

// PROMO CARD SETTINGS
const PromoCardSettings: React.FC<{
    siteSettings: SiteSettings;
    onUpdateSiteSettings: (settings: Partial<SiteSettings>) => void;
}> = ({ siteSettings, onUpdateSiteSettings }) => {
    const promo = siteSettings.promoCard || { title: '', subtitle: '', buttonText: '' };
    const [title, setTitle] = useState(promo.title);
    const [subtitle, setSubtitle] = useState(promo.subtitle);
    const [buttonText, setButtonText] = useState(promo.buttonText);

    const handleSave = () => {
        onUpdateSiteSettings({ 
            promoCard: { title, subtitle, buttonText }
        });
        alert('تم حفظ إعدادات بطاقة العرض بنجاح');
    };

    return (
        <SettingsCard title="بطاقة الترحيب (الرئيسية)" icon={LayoutGridIcon}>
             <div className="space-y-4">
                <div className="space-y-3">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white" placeholder="العنوان الرئيسي" />
                    <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white h-20" placeholder="الوصف الفرعي" />
                    <input type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white" placeholder="نص الزر" />
                </div>
                <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-3 rounded-xl">حفظ</button>
             </div>
        </SettingsCard>
    )
}

// FAQ SETTINGS
const FaqFormModal: React.FC<{
    itemToEdit?: FaqItem | null;
    onClose: () => void;
    onSave: (item: FaqItem) => void;
}> = ({ itemToEdit, onClose, onSave }) => {
    const [question, setQuestion] = useState(itemToEdit?.question || '');
    const [answer, setAnswer] = useState(itemToEdit?.answer || '');

    const handleSave = () => {
        if (!question || !answer) return;
        onSave({ question, answer });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4">
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50" placeholder="السؤال" />
                <textarea value={answer} onChange={e => setAnswer(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right h-32 bg-gray-50" placeholder="الإجابة"></textarea>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-gray-200 py-3 rounded-xl">إلغاء</button>
                    <button onClick={handleSave} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl">حفظ</button>
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

    const handleSave = (newItem: FaqItem) => {
        const newItems = [...faqItems];
        if (itemToEdit !== null) newItems[itemToEdit.index] = newItem;
        else newItems.push(newItem);
        onSetFaqItems(newItems);
    };
    
    return (
        <SettingsCard title="الأسئلة الشائعة" icon={QuestionIcon} action={<button onClick={() => {setItemToEdit(null); setIsModalOpen(true);}} className="bg-primary text-white p-2 rounded-lg"><PlusIcon/></button>}>
             {isModalOpen && <FaqFormModal onClose={() => setIsModalOpen(false)} onSave={handleSave} itemToEdit={itemToEdit?.item} />}
             <div className="space-y-3">
                {faqItems.map((item, index) => (
                    <div key={index} className="p-3 border rounded-xl flex justify-between">
                        <div className="flex gap-2"><button onClick={() => {setItemToEdit({item, index}); setIsModalOpen(true);}}><EditIcon/></button><button onClick={() => onSetFaqItems(faqItems.filter((_, i) => i !== index))}><TrashIcon/></button></div>
                        <p className="font-bold text-sm">{item.question}</p>
                    </div>
                ))}
            </div>
        </SettingsCard>
    )
}

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
                <PromoCardSettings siteSettings={siteSettings} onUpdateSiteSettings={onUpdateSiteSettings} />
            </div>
            <div className="space-y-6">
                <FaqSettings faqItems={faqItems} onSetFaqItems={onSetFaqItems} />
            </div>
        </div>
    );
};

export default AdminSiteSettingsView;
