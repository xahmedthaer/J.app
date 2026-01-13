
import React, { useState } from 'react';
import { WithdrawalRequest } from '../types';
import { ChevronLeftIcon, PlusIcon, WalletIcon, ClockIcon } from './icons';

const TabButton: React.FC<{
    label: string, 
    view: 'earnings' | 'history', 
    activeView: 'earnings' | 'history', 
    setView: (view: 'earnings' | 'history') => void
}> = ({ label, view, activeView, setView }) => (
    <button
        onClick={() => setView(view)}
        className={`flex-1 py-2 font-bold text-base text-center border-b-4 transition-all duration-300 ${
            activeView === view
                ? 'text-primary border-primary'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
        {label}
    </button>
);

const HistoryItem: React.FC<{ request: WithdrawalRequest }> = ({ request }) => {
    const statusConfig = {
        completed: { text: 'تم التحويل', icon: 'fa-check-circle', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/40' },
        pending: { text: 'قيد المعالجة', icon: 'fa-clock', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/40' }
    };
    const config = statusConfig[request.status];

    const formattedWalletNumber = request.wallet_number?.length > 4 
        ? `****${request.wallet_number.slice(-4)}`
        : request.wallet_number;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
            <div className="flex justify-between items-start">
                <div className="text-left">
                    <p className={`font-bold text-lg ${config.color}`}>{request.amount.toLocaleString()} د.ع.</p>
                     <div className={`mt-1 inline-flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                        <i className={`fa-solid ${config.icon}`}></i>
                        <span>{config.text}</span>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{request.wallet_type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formattedWalletNumber}</p>
                </div>
            </div>
            <div className="border-t dark:border-gray-700 my-3"></div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(request.request_date || request.created_at!).toLocaleDateString('ar-IQ')}</span>
                <span>تاريخ الطلب</span>
            </div>
            {request.status === 'completed' && request.processed_date && (
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{new Date(request.processed_date).toLocaleDateString('ar-IQ')}</span>
                    <span>تاريخ التحويل</span>
                </div>
            )}
        </div>
    );
};

const InfoListItem: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-start gap-3 text-right">
        <i className={`fa-solid ${icon} text-primary mt-1 text-base w-5 text-center`}></i>
        <p className="text-gray-600 dark:text-gray-300 flex-1 text-sm">{children}</p>
    </div>
);

const EarningsInfoCard: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border dark:border-gray-700 space-y-2">
        <details className="group">
            <summary className="flex justify-between items-center cursor-pointer list-none p-2">
                <span className="font-bold text-gray-800 dark:text-gray-200">شروط سحب الأرباح</span>
                <div className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-primary text-primary group-open:bg-primary group-open:text-white transition-all">
                    <PlusIcon className="w-4 h-4 transform group-open:rotate-45 transition-transform" />
                </div>
            </summary>
            <div className="mt-2 p-2 space-y-3 border-t dark:border-gray-700">
                <InfoListItem icon="fa-circle-check">لا يمكنك سحب أرباحك اذا كان رصيدك سالب.</InfoListItem>
                <InfoListItem icon="fa-circle-check">بعد إتمام السحب، سيتم تحويل أرباحك إلى محفظتك خلال 1-2 يوم عمل.</InfoListItem>
                <InfoListItem icon="fa-circle-check">لا يمكنك سحب أرباحك إذا كان لديك طلب سحب سابق قيد المعالجة.</InfoListItem>
            </div>
        </details>
        <div className="border-t dark:border-gray-700"></div>
        <details className="group">
            <summary className="flex justify-between items-center cursor-pointer list-none p-2">
                <span className="font-bold text-gray-800 dark:text-gray-200">ملاحظة مهمة</span>
                 <div className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-primary text-primary group-open:bg-primary group-open:text-white transition-all">
                    <PlusIcon className="w-4 h-4 transform group-open:rotate-45 transition-transform" />
                </div>
            </summary>
            <div className="mt-2 p-2 space-y-3 border-t dark:border-gray-700">
                 <InfoListItem icon="fa-circle-info">يلتزم التاجر وحده بتزويدنا برقم المحفظة أو الحساب الصحيح العائد له.</InfoListItem>
                 <InfoListItem icon="fa-circle-info">لا يتحمل إلك أي مسؤولية عن المعاملات التي يتم تحويلها إلى أرقام محافظ غير صحيحة نتيجة خطأ في الإدخال من جانب التاجر.</InfoListItem>
                 <InfoListItem icon="fa-circle-info">المبالغ المحولة إلى أرقام محافظ خاطئة لا تسترجع ولا ترد بأي حال.</InfoListItem>
            </div>
        </details>
    </div>
);


interface WithdrawalsPageProps {
    realizedBalance: number;
    hasPendingWithdrawal: boolean;
    onAddWithdrawalRequest: (walletType: string, walletNumber: string) => void;
    withdrawalRequests: WithdrawalRequest[];
    onBack: () => void;
};


const WithdrawalsPage: React.FC<WithdrawalsPageProps> = ({ realizedBalance, hasPendingWithdrawal, onAddWithdrawalRequest, withdrawalRequests, onBack }) => {
    const [view, setView] = useState<'overview' | 'request_form'>('overview');
    const [activeTab, setActiveTab] = useState<'earnings' | 'history'>('earnings');
    
    // Form States
    const [walletType, setWalletType] = useState('زين كاش');
    const [walletNumber, setWalletNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStartWithdrawal = () => {
        if (realizedBalance > 0 && !hasPendingWithdrawal) {
            setView('request_form');
        }
    };

    const handleSubmitWithdrawal = () => {
        if (!walletNumber.trim()) return;
        setIsSubmitting(true);
        try {
            onAddWithdrawalRequest(walletType, walletNumber);
            setView('overview');
            setWalletNumber(''); // Reset
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ----------------------------------------------------------------------
    // VIEW: REQUEST FORM (Full Page)
    // ----------------------------------------------------------------------
    if (view === 'request_form') {
        return (
            <div className="bg-white dark:bg-slate-900 h-full flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="w-10"></div>
                    <h1 className="text-xl font-bold dark:text-gray-100">طلب سحب جديد</h1>
                    <button onClick={() => setView('overview')} className="p-2" aria-label="إلغاء والعودة">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </header>

                <main className="flex-grow p-4 space-y-6 overflow-y-auto">
                    {/* Amount Card */}
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
                        <p className="text-gray-600 dark:text-gray-300 font-semibold mb-2">المبلغ الذي سيتم سحبه</p>
                        <p className="text-4xl font-extrabold text-primary dark:text-primary-light">
                            {realizedBalance.toLocaleString()} <span className="text-xl font-medium">د.ع</span>
                        </p>
                    </div>

                    {/* Step 1: Wallet Type */}
                    <div>
                        <label className="block text-right text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            1. اختر طريقة السحب
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {['زين كاش', 'كي كارد'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setWalletType(type)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                        walletType === type 
                                        ? 'border-primary bg-primary/5 text-primary' 
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-primary/50'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${walletType === type ? 'border-primary' : 'border-gray-300'}`}>
                                        {walletType === type && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                    </div>
                                    <span className="font-bold">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Number Input */}
                    <div>
                        <label className="block text-right text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                            2. ادخل رقم المحفظة
                        </label>
                        <div className="relative">
                            <input 
                                type="tel" 
                                value={walletNumber}
                                onChange={(e) => setWalletNumber(e.target.value)}
                                placeholder="07xxxxxxxxx"
                                className="w-full p-4 pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-right text-lg font-bold bg-white dark:bg-gray-800 dark:text-white focus:border-primary focus:outline-none transition-colors dir-ltr"
                            />
                            <WalletIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                        </div>
                        <p className="text-xs text-red-500 mt-2 text-right font-medium">
                            * يرجى التأكد من صحة الرقم، التحويل الخاطئ لا يمكن استرجاعه.
                        </p>
                    </div>

                    {/* Time Estimation Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-start gap-3 border border-gray-100 dark:border-gray-700">
                        <ClockIcon className="w-5 h-5 text-primary mt-0.5" />
                        <div className="text-right">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">مدة التحويل</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                يستغرق وصول المبلغ من <span className="font-bold text-gray-800 dark:text-gray-200">يوم واحد إلى يومين</span> عمل.
                            </p>
                        </div>
                    </div>
                </main>

                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={handleSubmitWithdrawal}
                        disabled={!walletNumber || isSubmitting}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-98 transition-all disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'جاري المعالجة...' : 'اسحب المبلغ الآن'}
                    </button>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // VIEW: DASHBOARD OVERVIEW (Default)
    // ----------------------------------------------------------------------
    return (
        <div className="bg-white dark:bg-slate-900 h-full flex flex-col">
            <header 
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 flex-shrink-0 z-10 border-b border-gray-200 dark:border-gray-700"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
                    <div className="w-10"></div> {/* Spacer */}
                    <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">
                        {activeTab === 'earnings' ? 'أرباحي' : 'سجل العمليات'}
                    </h1>
                    <button onClick={onBack} className="p-2" aria-label="العودة للخلف">
                        <ChevronLeftIcon className="text-gray-800 dark:text-gray-100 text-[22px]" />
                    </button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pb-24">
                <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-[5]">
                     <div className="container mx-auto px-4 flex">
                        <TabButton label="سجل العمليات" view="history" activeView={activeTab} setView={setActiveTab} />
                        <TabButton label="الأرباح" view="earnings" activeView={activeTab} setView={setActiveTab} />
                    </div>
                </div>

                {activeTab === 'earnings' ? (
                    <div className="p-4 space-y-4">
                        <div className="bg-gradient-to-br from-primary to-teal-600 text-white p-6 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center">
                            <p className="text-sm opacity-80 font-medium">الرصيد القابل للسحب</p>
                            <p className="text-4xl font-bold mt-2 tracking-wider">
                                {realizedBalance.toLocaleString()} <span className="text-2xl font-normal">د.ع.</span>
                            </p>
                        </div>

                        {hasPendingWithdrawal && (
                            <div className="bg-yellow-100 border-r-4 border-yellow-500 text-yellow-800 p-4 rounded-lg flex items-center gap-3">
                                <i className="fa-solid fa-hourglass-half text-xl"></i>
                                <div>
                                    <p className="font-bold">طلب سحب قيد المعالجة</p>
                                    <p className="text-sm">لا يمكنك إنشاء طلب جديد حتى تتم معالجة طلبك الحالي.</p>
                                </div>
                            </div>
                        )}
                        
                        <EarningsInfoCard />
                    </div>
                ) : ( // history tab
                    <div className="p-4 space-y-3">
                         {withdrawalRequests.length > 0 ? withdrawalRequests.sort((a,b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()).map(req => (
                            <HistoryItem key={req.id} request={req} />
                         )) : <p className="text-center text-gray-500 dark:text-gray-400 pt-10">لا يوجد عمليات سابقة.</p>}
                    </div>
                )}
            </main>

            {activeTab === 'earnings' && (
                <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-white dark:bg-gray-800 p-4 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-700" style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`}}>
                    <button
                        onClick={handleStartWithdrawal}
                        disabled={realizedBalance <= 0 || hasPendingWithdrawal}
                        className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {hasPendingWithdrawal ? 'طلب سحب قيد المعالجة' : 'سحب الأرباح'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WithdrawalsPage;
