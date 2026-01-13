import React, { useState, useMemo, useEffect } from 'react';
import { Coupon } from '../../types';
import { HeaderConfig } from '../../App';
import { PlusIcon, TrashIcon, EditIcon, XMarkIcon, SearchIcon, TagIcon, CheckCircleIcon, XCircleIcon } from '../common/icons';
import SearchBar from '../common/SearchBar';

interface AdminCouponsViewProps {
  coupons: Coupon[];
  onAddCoupon: (coupon: Omit<Coupon, 'id' | 'used_count'>) => void;
  onUpdateCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  addNotification: (message: string) => void;
  setHeaderConfig: (config: HeaderConfig | null) => void;
}

const CouponFormModal: React.FC<{
  couponToEdit?: Coupon | null;
  onClose: () => void;
  onSave: (coupon: Coupon | Omit<Coupon, 'id' | 'used_count'>) => void;
}> = ({ couponToEdit, onClose, onSave }) => {
  const [code, setCode] = useState(couponToEdit?.code || '');
  const [type, setType] = useState<'fixed' | 'percentage'>(couponToEdit?.type || 'fixed');
  const [value, setValue] = useState(couponToEdit?.value || 0);
  const [minOrderAmount, setMinOrderAmount] = useState(couponToEdit?.min_order_amount || 0);
  const [expirationDate, setExpirationDate] = useState(couponToEdit?.expiration_date || '');
  const [usageLimit, setUsageLimit] = useState(couponToEdit?.usage_limit || 0);
  const [isActive, setIsActive] = useState(couponToEdit?.is_active ?? true);

  const handleSave = () => {
    if (!code || value <= 0) {
      alert('يرجى إدخال رمز الكوبون وقيمة صحيحة.');
      return;
    }

    const couponData = {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      min_order_amount: Number(minOrderAmount),
      expiration_date: expirationDate,
      usage_limit: Number(usageLimit),
      is_active: isActive,
    };

    if (couponToEdit) {
      onSave({ ...couponData, id: couponToEdit.id, used_count: couponToEdit.used_count } as Coupon);
    } else {
      onSave(couponData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end sm:items-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-5 space-y-4 animate-slide-up sm:animate-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
           <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
           <h2 className="text-xl font-bold dark:text-gray-100">{couponToEdit ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h2>
           <div className="w-6"></div>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
                <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">رمز الكوبون</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white uppercase" placeholder="مثال: SUMMER2024" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">نوع الخصم</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white">
                        <option value="fixed">مبلغ ثابت</option>
                        <option value="percentage">نسبة مئوية (%)</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">قيمة الخصم</label>
                    <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white" min="0" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">تاريخ الانتهاء (اختياري)</label>
                    <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white" />
                </div>
                 <div>
                    <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">الحد الأدنى للطلب (د.ع)</label>
                    <input type="number" value={minOrderAmount} onChange={e => setMinOrderAmount(Number(e.target.value))} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white" min="0" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">حد الاستخدام (اختياري)</label>
                    <input type="number" value={usageLimit} onChange={e => setUsageLimit(Number(e.target.value))} className="w-full p-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white" min="0" placeholder="0 = غير محدود" />
                </div>
                <div className="flex items-end">
                     <label className="flex items-center gap-3 p-3 w-full border dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">تفعيل الكوبون</span>
                    </label>
                </div>
            </div>
        </div>

        <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors">
            {couponToEdit ? 'حفظ التغييرات' : 'إضافة الكوبون'}
        </button>
      </div>
    </div>
  );
};

const AdminCouponsView: React.FC<AdminCouponsViewProps> = ({ coupons, onAddCoupon, onUpdateCoupon, onDeleteCoupon, addNotification, setHeaderConfig }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);

  useEffect(() => {
    setHeaderConfig({
      title: 'إدارة الكوبونات',
      showBack: true,
      onBack: () => setHeaderConfig(null),
    });
    return () => setHeaderConfig(null);
  }, [setHeaderConfig]);

  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return coupons;
    return coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [coupons, searchQuery]);

  const handleOpenModal = (coupon?: Coupon) => {
    setCouponToEdit(coupon || null);
    setIsModalOpen(true);
  };

  const handleDelete = (couponId: string) => {
      if(window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
          onDeleteCoupon(couponId);
      }
  };

  const handleSave = (couponData: Coupon | Omit<Coupon, 'id' | 'used_count'>) => {
      if ('id' in couponData) {
          onUpdateCoupon(couponData as Coupon);
          addNotification('تم تحديث الكوبون بنجاح');
      } else {
          onAddCoupon(couponData);
          addNotification('تم إضافة الكوبون بنجاح');
      }
      setIsModalOpen(false);
  };

  return (
    <div className="dark:bg-slate-900 pb-20">
      {isModalOpen && <CouponFormModal onClose={() => setIsModalOpen(false)} onSave={handleSave} couponToEdit={couponToEdit} />}
      
      <div className="p-4 pt-2">
         <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="بحث عن رمز الكوبون..." />
      </div>

      <div className="px-4 space-y-3">
         {filteredCoupons.length > 0 ? (
             filteredCoupons.map(coupon => (
                 <div key={coupon.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 transition-all ${coupon.is_active ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 bg-red-50 dark:bg-red-900/10'}`}>
                     <div className="flex justify-between items-start">
                         <div className="flex gap-2">
                             <button onClick={() => handleOpenModal(coupon)} className="p-2 text-gray-500 hover:text-primary bg-gray-100 dark:bg-gray-700 rounded-lg"><EditIcon className="w-5 h-5"/></button>
                             <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-500 hover:text-red-700 bg-red-100 dark:bg-red-900/30 rounded-lg"><TrashIcon className="w-5 h-5"/></button>
                         </div>
                         <div className="text-right">
                             <div className="flex items-center justify-end gap-2">
                                 <h3 className="font-bold text-lg dark:text-gray-100 tracking-wider font-mono">{coupon.code}</h3>
                                 <TagIcon className="text-primary w-5 h-5" />
                             </div>
                             <p className="font-bold text-primary dark:text-primary-light text-lg">
                                 {coupon.type === 'percentage' ? `%${coupon.value} خصم` : `${coupon.value.toLocaleString()} د.ع خصم`}
                             </p>
                         </div>
                     </div>
                     
                     <div className="mt-3 pt-3 border-t dark:border-gray-700 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 text-right">
                         <div>
                             <span className="block font-semibold">تاريخ الانتهاء:</span>
                             <span>{coupon.expiration_date || 'غير محدد'}</span>
                         </div>
                         <div>
                             <span className="block font-semibold">مرات الاستخدام:</span>
                             <span>{coupon.used_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : ''}</span>
                         </div>
                         <div>
                             <span className="block font-semibold">الحد الأدنى للطلب:</span>
                             <span>{coupon.min_order_amount?.toLocaleString() || 0} د.ع</span>
                         </div>
                         <div className="flex items-end justify-end">
                             <span className={`px-2 py-1 rounded-full font-bold flex items-center gap-1 ${coupon.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>
                                 {coupon.is_active ? <CheckCircleIcon className="w-3 h-3"/> : <XCircleIcon className="w-3 h-3"/>}
                                 {coupon.is_active ? 'نشط' : 'غير نشط'}
                             </span>
                         </div>
                     </div>
                 </div>
             ))
         ) : (
             <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                 <TagIcon className="w-16 h-16 mx-auto mb-2 opacity-50"/>
                 <p>لا توجد كوبونات.</p>
             </div>
         )}
      </div>

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-6 left-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform active:scale-95 z-20"
      >
        <PlusIcon className="w-7 h-7" />
      </button>
    </div>
  );
};

export default AdminCouponsView;