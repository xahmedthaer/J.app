
import React, { useState, useMemo, useEffect } from 'react';
import { CartItem, Customer, Coupon } from '../../types';
import { TrashIcon, QuestionIcon, SearchIcon, UserIcon, MapPinIcon, PhoneIcon, NoteIcon, TagIcon, XMarkIcon, Headset, RocketIcon, ShieldIcon, CheckCircleIcon } from '../common/icons';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onOrderConfirmed: (orderData: {
    items: CartItem[];
    customer: Customer;
    total_cost: number;
    profit: number;
    delivery_fee: number;
    discount: number;
    service_fee: number;
  }) => void;
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'user_id'>) => Customer;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  step: number;
  setStep: (step: number) => void;
  coupons: Coupon[];
}

const iraqiGovernorates = [
    'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك', 'كركوك',
    'الأنبار', 'صلاح الدين', 'ديالى', 'واسط', 'ميسان', 'ذي قار',
    'المثنى', 'الديوانية', 'بابل', 'كربلاء', 'النجف'
];

// Step 1: Customer Details Form
const CustomerStep: React.FC<{
    onSaveAndContinue: (customerData: Omit<Customer, 'id' | 'user_id'>) => void;
}> = ({ onSaveAndContinue }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [governorate, setGovernorate] = useState('');
    const [region, setRegion] = useState('');
    const [notes, setNotes] = useState('');

    const handleContinue = () => {
        const errors: string[] = [];
        if (!name) errors.push('حقل الاسم مطلوب.');
        if (!phone) errors.push('حقل رقم الهاتف مطلوب.');
        if (!governorate) errors.push('حقل المحافظة مطلوب.');
        if (!region) errors.push('حقل المنطقة مطلوب.');
        if (phone && !/^\d{11}$/.test(phone)) errors.push('رقم الهاتف يجب أن يتكون من 11 رقمًا.');

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        const address = `${governorate}، ${region}`;
        const customerData = { name, phone, governorate, region, address, notes };
        
        onSaveAndContinue(customerData);
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                 <h3 className="text-right font-bold text-lg text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-2">
                    بيانات الزبون
                 </h3>
                 
                 <div>
                    <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">الاسم الكامل</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full pl-3 pr-10 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            placeholder="اسم الزبون"
                        />
                        <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">رقم الهاتف</label>
                    <div className="relative">
                        <input 
                            type="tel" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            className="w-full pl-3 pr-10 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            placeholder="07xxxxxxxxx"
                            maxLength={11}
                        />
                        <PhoneIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">المحافظة</label>
                        <select 
                            value={governorate} 
                            onChange={e => setGovernorate(e.target.value)} 
                            className="w-full py-3 px-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-primary dark:text-white appearance-none"
                        >
                            <option value="">اختر المحافظة</option>
                            {iraqiGovernorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">المنطقة / القضاء</label>
                        <input 
                            type="text" 
                            value={region} 
                            onChange={e => setRegion(e.target.value)} 
                            className="w-full py-3 px-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                            placeholder="المنصور، شارع 14..."
                        />
                     </div>
                 </div>

                 <div>
                    <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">ملاحظات (اختياري)</label>
                    <div className="relative">
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            className="w-full pl-3 pr-10 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-primary h-24 dark:text-white resize-none"
                            placeholder="أقرب نقطة دالة، وقت التوصيل المفضل..."
                        ></textarea>
                        <NoteIcon className="absolute right-3 top-4 text-gray-400 w-5 h-5" />
                    </div>
                 </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={handleContinue} 
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-primary/90 active:scale-98 transition-all"
                >
                    استمرار للتأكيد
                </button>
            </div>
        </div>
    );
};

// Step 2: Confirmation
const ConfirmationStep: React.FC<{
    cartItems: CartItem[];
    profit: number;
    customerPrice: number;
    customer: Customer;
    coupons: Coupon[];
    onConfirm: (orderData: {
      items: CartItem[],
      customer: Customer,
      total_cost: number,
      profit: number,
      delivery_fee: number,
      discount: number,
      service_fee: number,
    }) => void;
}> = ({ cartItems, profit, customerPrice, customer, coupons, onConfirm }) => {
    const [discountCode, setDiscountCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const delivery = 5000;
    
    const applyDiscount = () => {
        if (!discountCode.trim()) return;
        const coupon = coupons.find(c => c.code.toLowerCase() === discountCode.toLowerCase().trim());
        if (!coupon || !coupon.is_active) {
            alert('كوبون غير صالح');
            return;
        }
        let calculatedDiscount = coupon.type === 'percentage' ? Math.round(customerPrice * (coupon.value / 100)) : coupon.value;
        setDiscount(calculatedDiscount);
        setAppliedCoupon(coupon);
        alert(`تم تطبيق خصم ${calculatedDiscount.toLocaleString()} د.ع بنجاح`);
    }

    const finalPrice = customerPrice + delivery - discount;
    const totalWholesale = useMemo(() => 
        cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

    const handleConfirmClick = () => {
      onConfirm({
        items: cartItems,
        customer,
        total_cost: finalPrice,
        profit: profit, 
        delivery_fee: delivery,
        discount,
        service_fee: 0 // Set to zero permanently
      });
    }

    return (
        <div className="p-4 pb-24">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 text-right">
                <h3 className="font-bold text-lg mb-2 dark:text-gray-200 border-b pb-2 dark:border-gray-700">معلومات الزبون</h3>
                <div className="space-y-1 mt-2">
                    <p className="dark:text-gray-300 flex items-center justify-end gap-2"><span className="text-gray-800 dark:text-gray-100">{customer.name}</span> <UserIcon className="w-4 h-4 text-gray-400"/></p>
                    <p className="dark:text-gray-300 flex items-center justify-end gap-2"><span className="text-gray-800 dark:text-gray-100" dir="ltr">{customer.phone}</span> <PhoneIcon className="w-4 h-4 text-gray-400"/></p>
                    <p className="dark:text-gray-300 flex items-center justify-end gap-2"><span className="text-gray-800 dark:text-gray-100">{customer.address}</span> <MapPinIcon className="w-4 h-4 text-gray-400"/></p>
                </div>
             </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 mt-4 text-right">
                <h3 className="font-bold text-lg mb-4 dark:text-gray-200">تفاصيل الدفع</h3>
                 <div className="relative mb-4 flex gap-2">
                    <button onClick={applyDiscount} className="bg-primary-light text-primary font-bold px-4 rounded-lg">تطبيق</button>
                    <div className="relative flex-grow">
                         <input type="text" placeholder="أضف رمز الخصم" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} className="w-full pl-3 pr-10 py-3 border dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"/>
                         <TagIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                 </div>
                 {appliedCoupon && (
                     <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-2 rounded-lg text-sm text-center">
                         تم تفعيل الكوبون: <strong>{appliedCoupon.code}</strong>
                     </div>
                 )}
                <div className="space-y-3">
                    <div className="flex justify-between"><span className="font-bold dark:text-gray-200">{totalWholesale.toLocaleString()} د.ع</span><span className="text-gray-600 dark:text-gray-400">إجمالي سعر الجملة</span></div>
                    <div className="flex justify-between text-red-500"><span className="font-bold">- {discount.toLocaleString()} د.ع</span><span className="text-gray-600 dark:text-gray-400">تخفيض</span></div>
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-bold"><span className="font-bold">{profit.toLocaleString()} د.ع</span><span>صافي الربح</span></div>
                    <div className="border-t dark:border-gray-700 my-2"></div>
                    <div className="flex justify-between"><span className="font-bold dark:text-gray-200">{customerPrice.toLocaleString()} د.ع</span><span className="text-gray-600 dark:text-gray-400">إجمالي سعر الزبون</span></div>
                    <div className="flex justify-between"><span className="font-bold dark:text-gray-200">{delivery.toLocaleString()} د.ع</span><span className="text-gray-600 dark:text-gray-400">توصيل</span></div>
                    <div className="border-t dark:border-gray-700 my-2"></div>
                    <div className="flex justify-between text-primary dark:text-primary-light text-lg"><span className="font-bold">{finalPrice.toLocaleString()} د.ع</span><span >إجمالي الطلب</span></div>
                </div>
            </div>
             
             <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleConfirmClick} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg">
                    تثبيت الطلب
                </button>
            </div>
        </div>
    );
};


const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, onOrderConfirmed, onAddCustomer, step, setStep, coupons }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const totalWholesale = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );
  
  const totalCustomerPrice = useMemo(() => 
    cartItems.reduce((sum, item) => {
      const price = item.customer_price || item.product.min_sell_price;
      return sum + price * item.quantity;
    }, 0),
    [cartItems]
  );
  
  const totalProfit = useMemo(() => totalCustomerPrice - totalWholesale, [totalCustomerPrice, totalWholesale]);

  const handleCustomerSaveAndContinue = (customerData: Omit<Customer, 'id' | 'user_id'>) => {
      const finalCustomer = onAddCustomer(customerData);
      setSelectedCustomer(finalCustomer);
      setStep(2);
  };
  
  return (
    <div className="dark:bg-slate-900">
        {step === 1 && (
            <CustomerStep 
                onSaveAndContinue={handleCustomerSaveAndContinue} 
            />
        )}
        {step === 2 && selectedCustomer && <ConfirmationStep 
            cartItems={cartItems}
            profit={totalProfit}
            customerPrice={totalCustomerPrice}
            customer={selectedCustomer}
            coupons={coupons}
            onConfirm={onOrderConfirmed}
        />}
    </div>
  );
};

export default CheckoutPage;
