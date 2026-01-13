
import React, { useState } from 'react';
import { WithdrawalRequest } from '../../types';
import { ChevronLeftIcon, WalletIcon, ClockIcon, RotateCcwIcon, LandmarkIcon, ChartUpIcon, MoneyBillTransferIcon } from '../common/icons';

// --- Components for Financial Stats ---

const FinancialStatCard: React.FC<{
    title: string;
    amount: number;
    icon: React.ElementType;
}> = ({ title, amount, icon: Icon }) => (
    <div className="bg-[#FF9F65]/20 dark:bg-[#FF9F65]/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center h-28 border border-[#FF9F65]/30">
        <div className="flex items-center gap-2 mb-2 text-[#FF7844] dark:text-[#FF9F65]">
             <Icon className="w-5 h-5" />
             <span className="text-xs font-bold whitespace-nowrap">{title}</span>
        </div>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{amount.toLocaleString()}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">د.ع</p>
    </div>
);

const WithdrawalRequestItem: React.FC<{ request: WithdrawalRequest }> = ({ request }) => {
    const isCompleted = request.status === 'completed';
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="text-right">
                <p className={`font-bold text-lg ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                    {request.amount.toLocaleString()} د.ع
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(request.request_date || request.created_at || '').toLocaleDateString('ar-IQ')}
                </p>
            </div>
            
            <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    isCompleted 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                    {isCompleted ? 'تم التحويل' : 'قيد المعالجة'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{request.wallet_type}</span>
            </div>
        </div>
    );
};


// --- Main Component ---

interface WithdrawalsPageProps {
    realizedBalance: number; // الرصيد المتاح
    pendingProfit: number; // الارباح المتوقعة
    totalReturns: number; // اجمالي المرتجعات
    totalWithdrawn: number; // اجمالي المسحوبات
    hasPendingWithdrawal: boolean;
    onAddWithdrawalRequest: (walletType: string, walletNumber: string) => void;
    withdrawalRequests: WithdrawalRequest[];
    onBack: () => void;
};


const WithdrawalsPage: React.FC<WithdrawalsPageProps> = ({ 
    realizedBalance, 
    pendingProfit, 
    totalReturns, 
    totalWithdrawn,
    hasPendingWithdrawal, 
    onAddWithdrawalRequest, 
    withdrawalRequests,
    onBack
}) => {
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [walletType, setWalletType] = useState('زين كاش');
    const [walletNumber, setWalletNumber] = useState('');

    const handleWithdrawalSubmit = () => {
        if (!walletNumber) return;
        onAddWithdrawalRequest(walletType, walletNumber);
        setIsWithdrawModalOpen(false);
        setWalletNumber('');
    };

    const isWithdrawEnabled = realizedBalance >= 10000 && !hasPendingWithdrawal;

    return (
        <div className="flex flex-col bg-gray-50 dark:bg-slate-900 pb-20">
            {/* Header / Top Section */}
            <div className="bg-white dark:bg-slate-900 p-4 pb-6 rounded-b-[2rem] shadow-sm z-10 space-y-4">
                
                {/* Main Balance Card */}
                <div className="bg-gradient-to-br from-[#FF9F65] to-[#FF7844] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-orange-500/20">
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="text-right">
                             <p className="text-sm font-medium opacity-90 mb-1">الرصيد المتاح</p>
                             <h2 className="text-4xl font-bold">{realizedBalance.toLocaleString()} <span className="text-xl font-medium">د.ع</span></h2>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                            <WalletIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <FinancialStatCard 
                        title="الأرباح المتوقعة" 
                        amount={pendingProfit} 
                        icon={ClockIcon} 
                    />
                    <FinancialStatCard 
                        title="إجمالي الأرباح" 
                        amount={realizedBalance + totalWithdrawn} 
                        icon={ChartUpIcon} 
                    />
                    <FinancialStatCard 
                        title="إجمالي المسحوبات" 
                        amount={totalWithdrawn} 
                        icon={MoneyBillTransferIcon} 
                    />
                    <FinancialStatCard 
                        title="إجمالي المرتجعات" 
                        amount={totalReturns} 
                        icon={RotateCcwIcon} 
                    />
                </div>
            </div>

            {/* Actions Section */}
            <div className="px-4 mt-2 space-y-4">
                
                {/* Info Warning */}
                <div className="bg-[#FFF8E1] dark:bg-yellow-900/20 border border-[#FFE082] dark:border-yellow-700/30 rounded-xl p-4 flex items-center gap-3 text-[#FFB300] dark:text-yellow-400">
                    <i className="fa-solid fa-circle-info text-xl"></i>
                    <p className="text-sm font-bold text-right flex-1">يجب أن يصل رصيدك المتاح إلى 10,000 د.ع على الأقل للسحب</p>
                </div>

                {/* Withdraw Button */}
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    disabled={!isWithdrawEnabled}
                    className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                        isWithdrawEnabled 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    <LandmarkIcon className="w-5 h-5" />
                    <span>{hasPendingWithdrawal ? 'طلب سحب قيد المعالجة' : 'طلب سحب أرباح (غير متاح)'}</span>
                </button>

                {/* Withdrawal History Title */}
                <h3 className="font-bold text-gray-800 dark:text-white text-right px-1 pt-2">طلبات السحب</h3>

                {/* Empty State / List */}
                <div className="pb-4">
                    {withdrawalRequests.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 dark:border-gray-700 min-h-[200px]">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 text-gray-400">
                                <i className="fa-solid fa-receipt text-3xl"></i>
                            </div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">لا توجد طلبات سحب</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">يمكنك إرسال طلب سحب جديد عندما يتوفر رصيد كافٍ.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {withdrawalRequests.sort((a,b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()).map(req => (
                                <WithdrawalRequestItem key={req.id} request={req} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Simple Withdrawal Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={() => setIsWithdrawModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-center dark:text-white">طلب سحب جديد</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-right text-sm font-bold mb-1 dark:text-gray-300">طريقة السحب</label>
                                <select 
                                    value={walletType} 
                                    onChange={e => setWalletType(e.target.value)}
                                    className="w-full p-3 border rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="زين كاش">زين كاش</option>
                                    <option value="كي كارد">كي كارد</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-right text-sm font-bold mb-1 dark:text-gray-300">رقم المحفظة / البطاقة</label>
                                <input 
                                    type="text" 
                                    value={walletNumber} 
                                    onChange={e => setWalletNumber(e.target.value)}
                                    placeholder="07xxxxxxxxx" 
                                    className="w-full p-3 border rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white dir-ltr"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold dark:text-white">إلغاء</button>
                            <button onClick={handleWithdrawalSubmit} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">تأكيد</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawalsPage;
