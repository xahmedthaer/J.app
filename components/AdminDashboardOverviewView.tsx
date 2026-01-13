
import React, { useMemo } from 'react';
import { User, Order } from '../types';
import { UsersIcon, ClipboardListIcon, CheckCircleIcon, XCircleIcon, BoxOpenIcon, ChartUpIcon } from './icons';

interface AdminDashboardOverviewViewProps {
  users: User[];
  orders: Order[];
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ElementType; // Optional icon for smaller cards
  bgColorClass: string;
  textColorClass: string;
  borderColorClass: string;
  valueClassName?: string;
}> = ({ label, value, icon: Icon, bgColorClass, textColorClass, borderColorClass, valueClassName = '' }) => (
  <div className={`p-4 rounded-2xl shadow-sm border ${borderColorClass} ${bgColorClass} flex flex-col items-end text-right justify-center h-full`}>
    {Icon && (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${textColorClass} bg-opacity-20`} style={{backgroundColor: `${textColorClass.replace('text-', '')}20`}}>
            <Icon className={`w-5 h-5 ${textColorClass}`} />
        </div>
    )}
    <p className={`text-3xl font-bold ${textColorClass} ${valueClassName}`}>{value}</p>
    <p className={`text-base font-semibold ${textColorClass}`}>{label}</p>
  </div>
);

const AdminDashboardOverviewView: React.FC<AdminDashboardOverviewViewProps> = ({ users, orders }) => {
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'completed').length;
  const cancelledRejectedOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'rejected').length;
  const underImplementationOrders = orders.filter(o => o.status === 'under_implementation' || o.status === 'shipped').length; // Combine 'under_implementation' and 'shipped' for 'in progress'

  // Calculate Top Marketers
  const topMarketers = useMemo(() => {
      const userStats: Record<string, { name: string, profit: number, orders: number }> = {};
      
      orders.forEach(order => {
          if (order.status === 'completed') {
              if (!userStats[order.user_id]) {
                  const user = users.find(u => u.id === order.user_id);
                  userStats[order.user_id] = { name: user?.name || 'مستخدم غير معروف', profit: 0, orders: 0 };
              }
              userStats[order.user_id].profit += (order.profit - (order.service_fee || 0));
              userStats[order.user_id].orders += 1;
          }
      });

      return Object.values(userStats)
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 5); // Top 5
  }, [orders, users]);

  return (
    <div className="p-4 space-y-4 dark:bg-slate-900">
      {/* Top Card: Total Users */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-blue-200 dark:border-blue-700 p-6 flex justify-between items-center text-right">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/40">
            <UsersIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">عدد المستخدمين أصبح</p>
            <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{totalUsers}</p>
        </div>
      </div>

      {/* Grid Cards for Orders */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Orders */}
        <StatCard
          label="اجمالي الطلبات الكلية"
          value={totalOrders}
          icon={ClipboardListIcon}
          bgColorClass="bg-green-50 dark:bg-green-900/20"
          textColorClass="text-green-700 dark:text-green-300"
          borderColorClass="border-green-200 dark:border-green-700"
        />

        {/* Delivered Orders */}
        <StatCard
          label="اجمالي الطلبات تم تسليمها"
          value={deliveredOrders}
          icon={CheckCircleIcon}
          bgColorClass="bg-pink-50 dark:bg-pink-900/20"
          textColorClass="text-pink-700 dark:text-pink-300"
          borderColorClass="border-pink-200 dark:border-pink-700"
        />

        {/* Under Implementation / Shipped Orders */}
        <StatCard
          label="اجمالي الطلبات قيد التنفيذ"
          value={underImplementationOrders}
          icon={BoxOpenIcon} // Using BoxOpenIcon for "in progress"
          bgColorClass="bg-orange-50 dark:bg-orange-900/20"
          textColorClass="text-orange-700 dark:text-orange-300"
          borderColorClass="border-orange-200 dark:border-orange-700"
        />

        {/* Cancelled/Rejected Orders */}
        <StatCard
          label="اجمالي الطلبات الملغية/الراجعة"
          value={cancelledRejectedOrders}
          icon={XCircleIcon}
          bgColorClass="bg-red-50 dark:bg-red-900/20"
          textColorClass="text-red-700 dark:text-red-300"
          borderColorClass="border-red-200 dark:border-red-700"
        />
      </div>

      {/* Top Marketers Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mt-4">
          <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-4 flex items-center justify-end gap-2">
              <span>أفضل المسوقين (الأكثر ربحاً)</span>
              <ChartUpIcon className="text-yellow-500 w-6 h-6"/>
          </h3>
          <div className="space-y-3">
              {topMarketers.length > 0 ? topMarketers.map((marketer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="text-left font-bold text-green-600 dark:text-green-400">
                          {marketer.profit.toLocaleString()} د.ع
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                              {index + 1}. {marketer.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                              {marketer.orders} طلبات مكتملة
                          </p>
                      </div>
                  </div>
              )) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">لا توجد بيانات كافية لعرض المتصدرين.</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverviewView;
