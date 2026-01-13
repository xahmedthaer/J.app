import React from 'react';
import { Order } from '../../types';

interface StatisticsPageProps {
    orders: Order[];
    totalEarnings: number;
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({ orders, totalEarnings }) => {
    // --- Overall Stats Calculation ---
    const completedOrders = orders.filter(o => o.status === 'completed');
    const rejectedOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'rejected');
    const totalCustomers = new Set(orders.map(o => o.customer.id)).size;

    // --- Last 30 Days Stats Calculation ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);

    const recentCompletedOrders = recentOrders.filter(o => o.status === 'completed');
    const recentRejectedOrders = recentOrders.filter(o => o.status === 'cancelled' || o.status === 'rejected');
    const recentEarnings = recentCompletedOrders.reduce((sum, o) => sum + (o.profit - (o.service_fee || 0)), 0);

    return (
        <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
            
            {/* Overall Stats Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700 p-4 space-y-4">
                <div className="text-center">
                    <p className="text-base text-gray-500 dark:text-gray-400 font-semibold">اجمالي الارباح المحققة</p>
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{totalEarnings.toLocaleString()}<span className="text-2xl align-baseline"> د.ع.</span></p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-300 p-4 rounded-xl flex justify-between items-center">
                        <p className="font-bold text-right text-sm">اجمالي الطلبات<br/> المرفوضة</p>
                        <p className="text-4xl font-bold">{rejectedOrders.length}</p>
                    </div>
                     <div className="bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-300 p-4 rounded-xl flex justify-between items-center">
                        <p className="font-bold text-right text-sm">اجمالي الطلبات<br/> الواصلة</p>
                        <p className="text-4xl font-bold">{completedOrders.length}</p>
                    </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex justify-between items-center">
                    <p className="font-bold text-gray-600 dark:text-gray-300">مجموع الزبائن</p>
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">{totalCustomers}</p>
                </div>
            </div>

            {/* Last 30 Days Stats Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700 p-4 space-y-4">
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-600 dark:text-gray-300">آخر 30 يوم</p>
                </div>
                 <div className="text-center border-b dark:border-gray-700 pb-4">
                    <p className="text-base text-gray-500 dark:text-gray-400 font-semibold">الارباح المحققة</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{recentEarnings.toLocaleString()}<span className="text-xl align-baseline"> د.ع.</span></p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="text-center py-2">
                        <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">الطلبات المرفوضة</p>
                        <div className="w-16 h-0.5 bg-red-200 dark:bg-red-900/50 my-2 mx-auto"></div>
                        <p className="text-4xl font-bold text-red-600 dark:text-red-400">{recentRejectedOrders.length}</p>
                    </div>
                     <div className="text-center py-2">
                        <p className="font-semibold text-gray-500 dark:text-gray-400 text-sm">الطلبات الواصلة</p>
                        <div className="w-16 h-0.5 bg-green-200 dark:bg-green-900/50 my-2 mx-auto"></div>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">{recentCompletedOrders.length}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default StatisticsPage;