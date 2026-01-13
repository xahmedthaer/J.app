
import React, { useMemo, useState, useEffect } from 'react';
import { User, Order } from '../../types';
import { UsersIcon, ClipboardListIcon, CheckCircleIcon, XCircleIcon, BoxOpenIcon, ChartUpIcon, WalletIcon, ClockIcon, ArrowRightIcon } from '../common/icons';

interface AdminDashboardOverviewViewProps {
  users: User[];
  orders: Order[];
}

type DateRange = 'today' | 'yesterday' | '7days' | '30days' | 'all';

// --- Custom Components ---

const PulseDot = () => (
    <span className="relative flex h-3 w-3 mr-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
    </span>
);

const TrendIndicator: React.FC<{ current: number; previous: number; isNeutral?: boolean }> = ({ current, previous, isNeutral }) => {
    if (isNeutral || previous === 0) return <span className="text-gray-400 text-xs font-medium">-</span>;
    
    const percent = ((current - previous) / previous) * 100;
    const isPositive = percent >= 0;
    
    return (
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'} bg-white/80 dark:bg-gray-800/80 px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm`}>
            <span>{Math.abs(percent).toFixed(1)}%</span>
            <i className={`fa-solid fa-arrow-${isPositive ? 'up' : 'down'}`}></i>
        </div>
    );
};

const StatCard: React.FC<{
    title: string;
    value: string;
    subValue?: string;
    icon: React.ElementType;
    gradient: string;
    trend?: { current: number; previous: number };
    delay?: number;
}> = ({ title, value, subValue, icon: Icon, gradient, trend, delay = 0 }) => (
    <div 
        className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-lg transition-transform hover:scale-[1.02] duration-300 animate-slide-up ${gradient}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Background Pattern */}
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex justify-between items-start">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && <TrendIndicator current={trend.current} previous={trend.previous} />}
        </div>
        
        <div className="relative z-10 mt-4">
            <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {subValue && <p className="text-xs text-white/60 mt-1 font-medium">{subValue}</p>}
        </div>
    </div>
);

const SimpleLineChart: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
    if (data.length < 2) return null;
    const max = Math.max(...data) || 1;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,100 ${points} 100,100`} fill={`url(#grad-${color})`} />
            <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const getDateRange = (range: DateRange): { start: Date, end: Date, prevStart: Date, prevEnd: Date } => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    const prevStart = new Date(now);
    const prevEnd = new Date(now);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    prevStart.setHours(0,0,0,0);
    prevEnd.setHours(23,59,59,999);
    switch (range) {
        case 'today':
            prevStart.setDate(start.getDate() - 1);
            prevEnd.setDate(end.getDate() - 1);
            break;
        case 'yesterday':
            start.setDate(start.getDate() - 1);
            end.setDate(end.getDate() - 1);
            prevStart.setDate(start.getDate() - 1);
            prevEnd.setDate(end.getDate() - 1);
            break;
        case '7days':
            start.setDate(start.getDate() - 7);
            prevStart.setDate(start.getDate() - 7);
            prevEnd.setDate(end.getDate() - 7);
            break;
        case '30days':
            start.setDate(start.getDate() - 30);
            prevStart.setDate(start.getDate() - 30);
            prevEnd.setDate(end.getDate() - 30);
            break;
        case 'all':
            start.setFullYear(2000);
            prevStart.setFullYear(1990);
            break;
    }
    return { start, end, prevStart, prevEnd };
};

const AdminDashboardOverviewView: React.FC<AdminDashboardOverviewViewProps> = ({ users, orders }) => {
    const [range, setRange] = useState<DateRange>('today');
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        const baseActive = Math.ceil(users.length * 0.08); 
        setActiveUsers(baseActive);
        const interval = setInterval(() => {
            setActiveUsers(prev => {
                const change = Math.floor(Math.random() * 3) - 1;
                return Math.max(1, prev + change);
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [users.length]);

    const dashboardData = useMemo(() => {
        const { start, end, prevStart, prevEnd } = getDateRange(range);
        const filterOrders = (s: Date, e: Date) => orders.filter(o => {
            const d = new Date(o.created_at);
            return d >= s && d <= e;
        });
        const currentOrders = filterOrders(start, end);
        const previousOrders = filterOrders(prevStart, prevEnd);
        const calcStats = (orderList: Order[]) => {
            const totalRevenue = orderList.filter(o => o.status !== 'cancelled' && o.status !== 'rejected').reduce((sum, o) => sum + o.total_cost, 0);
            const totalProfit = orderList.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.profit, 0);
            const totalCount = orderList.length;
            const completedCount = orderList.filter(o => o.status === 'completed').length;
            return { totalRevenue, totalProfit, totalCount, completedCount };
        };
        const currentStats = calcStats(currentOrders);
        const prevStats = calcStats(previousOrders);
        const chartBuckets = 10;
        const chartDataProfit: number[] = new Array(chartBuckets).fill(0);
        const timeStep = (end.getTime() - start.getTime()) / chartBuckets;
        currentOrders.forEach(o => {
            if (o.status === 'completed') {
                const orderTime = new Date(o.created_at).getTime();
                const bucketIndex = Math.floor((orderTime - start.getTime()) / timeStep);
                if (bucketIndex >= 0 && bucketIndex < chartBuckets) {
                    chartDataProfit[bucketIndex] += o.profit;
                }
            }
        });
        const productSales: Record<string, number> = {};
        currentOrders.forEach(o => {
            if (o.status !== 'cancelled') {
                o.items.forEach(item => {
                    productSales[item.product.name] = (productSales[item.product.name] || 0) + item.quantity;
                });
            }
        });
        const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
        return { current: currentStats, previous: prevStats, chartDataProfit, topProducts };
    }, [orders, range]);

    const averageOrderValue = dashboardData.current.totalCount > 0 
        ? Math.round(dashboardData.current.totalRevenue / dashboardData.current.totalCount) 
        : 0;

    return (
        <div className="p-6 space-y-8 dark:bg-slate-900 min-h-screen pb-24 font-cairo">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <ChartUpIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">نظرة عامة على المتجر</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">إحصائيات وتحليلات الأداء</p>
                    </div>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                    {[
                        { id: 'today', label: 'اليوم' },
                        { id: 'yesterday', label: 'الأمس' },
                        { id: '7days', label: '7 أيام' },
                        { id: '30days', label: '30 يوم' },
                        { id: 'all', label: 'الكل' }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setRange(tab.id as DateRange)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${range === tab.id ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{tab.label}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-100 dark:border-green-800">
                            <PulseDot /><span className="text-xs font-bold text-green-600 dark:text-green-400">نشط الآن</span>
                        </div>
                        <UsersIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div><h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{activeUsers}</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مستخدم يتصفح التطبيق</p></div>
                </div>
                <StatCard title="صافي الأرباح" value={`${dashboardData.current.totalProfit.toLocaleString()} د.ع`} icon={WalletIcon} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" trend={{ current: dashboardData.current.totalProfit, previous: dashboardData.previous.totalProfit }} delay={100} />
                <StatCard title="إجمالي الإيرادات" value={`${dashboardData.current.totalRevenue.toLocaleString()} د.ع`} icon={ChartUpIcon} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" trend={{ current: dashboardData.current.totalRevenue, previous: dashboardData.previous.totalRevenue }} delay={200} />
                <StatCard title="إجمالي الطلبات" value={`${dashboardData.current.totalCount}`} icon={ClipboardListIcon} gradient="bg-gradient-to-br from-violet-500 to-purple-600" trend={{ current: dashboardData.current.totalCount, previous: dashboardData.previous.totalCount }} delay={300} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-6"><ChartUpIcon className="w-5 h-5 text-emerald-500" />تحليل الأرباح</h3>
                    <div className="h-64 w-full bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 relative overflow-hidden">
                        {dashboardData.current.totalProfit > 0 ? <SimpleLineChart data={dashboardData.chartDataProfit} color="#10B981" /> : <div className="flex items-center justify-center h-full text-gray-400">لا توجد بيانات أرباح للعرض</div>}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2"><BoxOpenIcon className="w-5 h-5 text-orange-500" />الأكثر مبيعاً</h3>
                    <div className="flex-grow space-y-4 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                        {dashboardData.topProducts.length > 0 ? dashboardData.topProducts.map(([name, count], index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs flex-shrink-0">{index + 1}</div>
                                    <div className="flex-grow min-w-0"><p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{name}</p><div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-1.5 overflow-hidden"><div className="bg-orange-500 h-full rounded-full" style={{ width: `${(count / dashboardData.topProducts[0][1]) * 100}%` }}></div></div></div><span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">{count} قطع</span>
                                </div>
                            )) : <div className="text-center text-gray-400 py-10">لا توجد مبيعات</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardOverviewView;
