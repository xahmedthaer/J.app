
import React, { useMemo, useEffect, useState } from 'react';
import { Supplier, Product, Order, SupplierWithdrawal } from '../types';
import { HeaderConfig } from '../App';
import { BoxOpenIcon, ChartUpIcon, MoneyBillTransferIcon, WarehouseIcon, CheckCircleIcon, WalletIcon, PlusIcon, XMarkIcon } from './icons';

interface AdminSupplierDetailsPageProps {
    supplier: Supplier;
    products: Product[];
    orders: Order[];
    withdrawals: SupplierWithdrawal[]; // List of withdrawals for this supplier
    onAddWithdrawal: (withdrawal: Omit<SupplierWithdrawal, 'id'>) => void;
    setHeaderConfig: (config: HeaderConfig | null) => void;
    onBack: () => void;
}

const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    subtext?: string;
}> = ({ icon: Icon, label, value, color, subtext }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 text-center flex flex-col items-center justify-center h-full">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${color} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
    </div>
);

// Withdrawal Modal Component
const WithdrawalModal: React.FC<{
    maxAmount: number;
    onClose: () => void;
    onSubmit: (amount: number, note: string) => void;
}> = ({ maxAmount, onClose, onSubmit }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [note, setNote] = useState('');

    const handleSubmit = () => {
        const val = Number(amount);
        if (!val || val <= 0) {
            alert('يرجى إدخال مبلغ صحيح.');
            return;
        }
        if (val > maxAmount) {
            alert('المبلغ المطلوب أكبر من الرصيد المتاح.');
            return;
        }
        onSubmit(val, note);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-slide-up">
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">سحب أرباح المورد</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-center border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300 font-bold">الرصيد المتاح للسحب</p>
                    <p className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">{maxAmount.toLocaleString()} د.ع</p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">المبلغ المراد سحبه</label>
                        <input 
                            type="number" 
                            placeholder="0" 
                            value={amount} 
                            onChange={e => setAmount(Number(e.target.value))} 
                            className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-bold text-lg" 
                            min="0"
                            max={maxAmount}
                        />
                    </div>
                    <div>
                        <label className="block text-right text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">ملاحظات (اختياري)</label>
                        <textarea 
                            placeholder="مثال: دفعة شهر 5 / تحويل زين كاش" 
                            value={note} 
                            onChange={e => setNote(e.target.value)} 
                            className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        ></textarea>
                    </div>
                </div>

                <button 
                    onClick={handleSubmit} 
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!amount || Number(amount) > maxAmount}
                >
                    تأكيد العملية
                </button>
            </div>
        </div>
    );
};

const AdminSupplierDetailsPage: React.FC<AdminSupplierDetailsPageProps> = ({ supplier, products, orders, withdrawals, onAddWithdrawal, setHeaderConfig, onBack }) => {
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    useEffect(() => {
        setHeaderConfig({
            title: supplier.name,
            showBack: true,
            onBack: onBack
        });
        return () => setHeaderConfig(null);
    }, [supplier, setHeaderConfig, onBack]);

    const stats = useMemo(() => {
        // Filter products for this supplier
        const supplierProducts = products.filter(p => p.supplierId === supplier.id);
        const productIds = supplierProducts.map(p => p.id);

        // Inventory Stats
        const totalProducts = supplierProducts.length;
        const totalStock = supplierProducts.reduce((sum, p) => sum + p.inventory.reduce((invSum, item) => invSum + item.stock, 0), 0);
        
        // Earnings Stats (Calculated ONLY from Completed Orders)
        let totalEarnings = 0;
        let soldItemsCount = 0;

        orders.forEach(order => {
            // STRICTLY CHECK FOR 'completed' STATUS
            if (order.status === 'completed') {
                order.items.forEach(item => {
                    if (productIds.includes(item.product.id)) {
                        const supplierCost = item.product.supplierPrice || 0;
                        totalEarnings += supplierCost * item.quantity;
                        soldItemsCount += item.quantity;
                    }
                });
            }
        });

        const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
        const remainingBalance = totalEarnings - totalWithdrawn;

        return {
            totalProducts,
            totalStock,
            totalEarnings,
            totalWithdrawn,
            remainingBalance,
            soldItemsCount
        };
    }, [products, orders, supplier, withdrawals]);

    const handleWithdrawalSubmit = (amount: number, note: string) => {
        onAddWithdrawal({
            supplierId: supplier.id,
            amount,
            date: new Date().toISOString(),
            note
        });
        setIsWithdrawModalOpen(false);
    };

    return (
        <div className="dark:bg-slate-900 p-4 space-y-6 pb-20">
            {isWithdrawModalOpen && (
                <WithdrawalModal 
                    maxAmount={stats.remainingBalance} 
                    onClose={() => setIsWithdrawModalOpen(false)} 
                    onSubmit={handleWithdrawalSubmit} 
                />
            )}

            {/* Supplier Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 text-right relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{supplier.name}</h2>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-semibold">البريد:</span> {supplier.email}</p>
                    <p><span className="font-semibold">الهاتف:</span> {supplier.phone}</p>
                    <p><span className="font-semibold">تاريخ الانضمام:</span> {supplier.joined_at}</p>
                    {supplier.notes && <p className="mt-2 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded text-gray-500 dark:text-gray-400">{supplier.notes}</p>}
                </div>
            </div>

            {/* Financial Stats Grid */}
            <div>
                <div className="flex justify-between items-center mb-3 px-1">
                    <h3 className="font-bold text-lg text-right dark:text-gray-100">الملف المالي</h3>
                    <button 
                        onClick={() => setIsWithdrawModalOpen(true)}
                        disabled={stats.remainingBalance <= 0}
                        className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MoneyBillTransferIcon className="w-4 h-4" />
                        سحب أرباح
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard 
                        label="إجمالي الأرباح" 
                        value={`${stats.totalEarnings.toLocaleString()} د.ع`} 
                        icon={ChartUpIcon} 
                        color="bg-green-500 text-green-500" 
                        subtext="(للطلبات المكتملة)"
                    />
                    <StatCard 
                        label="المبلغ المسحوب" 
                        value={`${stats.totalWithdrawn.toLocaleString()} د.ع`} 
                        icon={MoneyBillTransferIcon} 
                        color="bg-blue-500 text-blue-500" 
                    />
                    <StatCard 
                        label="المتبقي (الذمة)" 
                        value={`${stats.remainingBalance.toLocaleString()} د.ع`} 
                        icon={WalletIcon} 
                        color="bg-purple-500 text-purple-500" 
                    />
                    <StatCard 
                        label="القطع المباعة" 
                        value={stats.soldItemsCount} 
                        icon={CheckCircleIcon} 
                        color="bg-orange-500 text-orange-500" 
                        subtext="(تم تسليمها)"
                    />
                </div>
            </div>

            {/* Withdrawal History Log */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-right mb-3 dark:text-gray-100 flex items-center justify-end gap-2">
                    <span>سجل السحوبات</span>
                    <i className="fa-solid fa-clock-rotate-left text-gray-400"></i>
                </h3>
                <div className="space-y-0 divide-y dark:divide-gray-700">
                    {withdrawals.length > 0 ? (
                        [...withdrawals].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(w => (
                            <div key={w.id} className="py-3 flex justify-between items-start text-right">
                                <div className="text-left pl-2">
                                    <span className="block font-bold text-red-500 dir-ltr">-{w.amount.toLocaleString()} د.ع</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">سحب يدوي</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(w.date).toLocaleDateString('ar-IQ')} - {new Date(w.date).toLocaleTimeString('ar-IQ')}</p>
                                    {w.note && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded inline-block">{w.note}</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 text-sm py-4">لا توجد عمليات سحب سابقة.</p>
                    )}
                </div>
            </div>

            {/* Inventory Stats & Products */}
            <div>
                <h3 className="font-bold text-lg text-right dark:text-gray-100 px-1 mb-3">المخزون والمنتجات</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <StatCard 
                        label="عدد المنتجات" 
                        value={stats.totalProducts} 
                        icon={BoxOpenIcon} 
                        color="bg-indigo-500 text-indigo-500" 
                    />
                    <StatCard 
                        label="المخزون المتبقي" 
                        value={stats.totalStock} 
                        icon={WarehouseIcon} 
                        color="bg-teal-500 text-teal-500" 
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-right mb-3 dark:text-gray-100">قائمة المنتجات</h3>
                    <div className="space-y-3">
                        {products.filter(p => p.supplierId === supplier.id).map(product => (
                            <div key={product.id} className="flex items-center gap-3 p-2 border-b dark:border-gray-700 last:border-0">
                                <img src={product.image_urls[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                <div className="text-right flex-grow">
                                    <p className="font-bold text-sm dark:text-gray-200">{product.name}</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold">ربح المورد: {product.supplierPrice?.toLocaleString()} د.ع</p>
                                </div>
                                <div className="text-left">
                                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">مخزون: {product.inventory.reduce((a,b)=>a+b.stock,0)}</span>
                                </div>
                            </div>
                        ))}
                        {products.filter(p => p.supplierId === supplier.id).length === 0 && (
                            <p className="text-center text-gray-400 text-sm">لا توجد منتجات مسجلة لهذا المورد.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSupplierDetailsPage;
