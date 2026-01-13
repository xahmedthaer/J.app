
import React, { useState, useMemo } from 'react';
import { Order, User } from '../types';
import SearchBar from './SearchBar';
import { TicketIcon, BoxOpenIcon, ClipboardListIcon, XCircleIcon, ClockIcon, CheckCircleIcon, TruckIcon, XMarkIcon } from './icons';
import { SelectedStatus } from '../App';

const NewTicketModal: React.FC<{
    order: Order;
    onClose: () => void;
    onSubmit: (message: string) => void;
}> = ({ order, onClose, onSubmit }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!message.trim()) {
            alert('يرجى كتابة رسالة.');
            return;
        }
        onSubmit(message);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div 
                className="bg-white dark:bg-gray-800 rounded-t-2xl p-4 w-full max-w-lg animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                    <button onClick={onClose} className="p-1" aria-label="إغلاق"><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                    <h2 className="text-lg font-bold text-center flex-grow dark:text-gray-100">إرسال تذكرة للطلب #{order.id}</h2>
                    <div className="w-7"></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-right mt-2">
                    سيتم تضمين جميع تفاصيل الطلب تلقائيًا.
                </p>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا (مثل تغيير رقم الهاتف، تأخر الطلب)..."
                    rows={5}
                    className="w-full p-3 border dark:border-gray-700 rounded-lg text-right mt-4 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
                <div className="flex gap-2 mt-4">
                    <button onClick={onClose} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg">إلغاء</button>
                    <button onClick={handleSubmit} disabled={!message.trim()} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                        إرسال التذكرة
                    </button>
                </div>
            </div>
        </div>
    );
};

interface OrdersPageProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  currentUser: User | null;
  selectedStatus: SelectedStatus;
  onStatusSelect: (status: SelectedStatus) => void;
  addNotification: (message: string) => void;
  onInitiateTicketThread: (order: Order, initialMessageText: string) => void;
}

const OrderCard: React.FC<{ order: Order; onClick: () => void; onOpenTicketModal: () => void; }> = ({ order, onClick, onOpenTicketModal }) => {
    const getStatusInfo = (status: Order['status']) => {
        const statuses = {
            under_implementation: { text: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
            shipped: { text: 'قيد التوصيل', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
            completed: { text: 'تم التسليم للزبون', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
            cancelled: { text: 'تم الغاء الطلب', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
            rejected: { text: 'مرفوض/راجع', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
            prepared: { text: 'تم التجهيز', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
            postponed: { text: 'مؤجل', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
            partially_delivered: { text: 'واصل جزئي', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300' },
        };
        return statuses[status] || statuses.under_implementation;
    };

    const statusInfo = getStatusInfo(order.status);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const handleTicketClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenTicketModal();
    };


    return (
        <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-primary active:scale-95 transition-transform duration-200">
            <div className="flex justify-between items-start">
                <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-gray-100">طلب رقم #{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.date} - ${order.time}</p>
                    <div className={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-full ${statusInfo.className}`}>
                        {statusInfo.text}
                    </div>
                </div>
                <div className="text-left">
                    <p className="font-bold text-primary dark:text-primary-light text-lg">{order.total_cost.toLocaleString()} د.ع</p>
                    <p className="text-sm text-green-600 dark:text-green-400">الربح: {order.profit.toLocaleString()} د.ع</p>
                </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
                 <div className="flex -space-x-4">
                    {order.items.slice(0, 3).map((item, index) => (
                        <img key={index} src={item.product.image_urls[0]} alt={item.product.name} className="w-10 h-10 object-contain bg-gray-100 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-800" />
                    ))}
                 </div>
                 <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{totalItems} منتج</p>
                    <button onClick={handleTicketClick} className="flex items-center gap-1.5 text-sm text-primary bg-primary-light dark:bg-primary/20 dark:text-primary-light px-3 py-1.5 rounded-full font-semibold hover:bg-primary/20 transition-colors" aria-label="إنشاء تذكرة للطلب">
                        <TicketIcon className="w-4 h-4" />
                        <span>إنشاء تذكرة</span>
                    </button>
                 </div>
            </div>
        </div>
    );
};

const StatusGridCard: React.FC<{
  label: string;
  count: number;
  Icon: React.ComponentType<{ className?: string }>;
  colors: { iconColor: string; iconContainerBg: string; badgeBg: string; };
  onClick: () => void;
}> = ({ label, count, Icon, colors, onClick }) => (
  <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200/80 dark:border-gray-700 p-3 cursor-pointer hover:border-primary active:scale-95 transition-all duration-200 flex flex-col items-center justify-evenly text-center relative aspect-square">
    <div className={`absolute top-2.5 right-2.5 h-7 w-7 min-w-[28px] rounded-full flex items-center justify-center font-bold text-sm text-white ${colors.badgeBg} shadow`}>
      {count}
    </div>
    <div className={`w-[70px] h-[70px] rounded-full flex items-center justify-center ${colors.iconContainerBg}`}>
      <Icon className={`text-[25px] ${colors.iconColor}`} />
    </div>
    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm h-10 flex items-center justify-center text-center leading-tight">{label}</h3>
  </div>
);


const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onOrderClick, currentUser, selectedStatus, onStatusSelect, addNotification, onInitiateTicketThread }) => {
    const [listSearchQuery, setListSearchQuery] = useState('');
    const [orderForTicket, setOrderForTicket] = useState<Order | null>(null);

    const userOrders = useMemo(() => {
        if (!currentUser) return [];
        return orders.filter(o => o.user_id === currentUser.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [orders, currentUser]);
    
    const ordersByStatus = useMemo(() => {
        const counts: { [key in Order['status']]: number } & { cancelled_rejected: number } = {
            under_implementation: 0,
            shipped: 0,
            completed: 0,
            cancelled: 0,
            rejected: 0,
            prepared: 0,
            postponed: 0,
            partially_delivered: 0,
            cancelled_rejected: 0
        };
        userOrders.forEach(order => {
            if (order.status in counts) {
                counts[order.status]++;
            }
        });
        counts.cancelled_rejected = counts.cancelled + counts.rejected;
        return counts;
    }, [userOrders]);
    
    const filteredOrders = useMemo(() => {
        if (!selectedStatus) return [];
        
        let ordersToShow: Order[] = [];

        if (selectedStatus === 'all') {
            ordersToShow = userOrders;
        } else if (selectedStatus === 'cancelled_rejected') {
            ordersToShow = userOrders.filter(o => o.status === 'cancelled' || o.status === 'rejected');
        } else if (selectedStatus === 'prepared' || selectedStatus === 'postponed') {
            ordersToShow = [];
        } else {
             ordersToShow = userOrders.filter(order => order.status === selectedStatus);
        }

        if (listSearchQuery.trim()) {
            const lcQuery = listSearchQuery.toLowerCase().trim();
            ordersToShow = ordersToShow.filter(order =>
                order.id.toLowerCase().includes(lcQuery) ||
                order.customer.name.toLowerCase().includes(lcQuery) ||
                order.customer.phone.includes(lcQuery)
            );
        }
        return ordersToShow;
    }, [userOrders, selectedStatus, listSearchQuery]);

    const statusMap = [
        { key: 'under_implementation', label: 'قيد معالجة', Icon: ClipboardListIcon, count: ordersByStatus.under_implementation, colors: { iconColor: 'text-yellow-700', iconContainerBg: 'bg-yellow-100 dark:bg-yellow-900/40', badgeBg: 'bg-amber-600' }},
        { key: 'prepared', label: 'تم التجهيز', Icon: BoxOpenIcon, count: 0, colors: { iconColor: 'text-orange-600', iconContainerBg: 'bg-orange-100 dark:bg-orange-900/40', badgeBg: 'bg-orange-500' }},
        { key: 'shipped', label: 'جاري التوصيل', Icon: TruckIcon, count: ordersByStatus.shipped, colors: { iconColor: 'text-sky-700', iconContainerBg: 'bg-sky-100 dark:bg-sky-900/40', badgeBg: 'bg-sky-500' }},
        { key: 'completed', label: 'تم التسليم', Icon: CheckCircleIcon, count: ordersByStatus.completed, colors: { iconColor: 'text-green-600', iconContainerBg: 'bg-green-100 dark:bg-green-900/40', badgeBg: 'bg-green-500' }},
        { key: 'partially_delivered', label: 'واصل جزئي', Icon: CheckCircleIcon, count: ordersByStatus.partially_delivered, colors: { iconColor: 'text-teal-600', iconContainerBg: 'bg-teal-100 dark:bg-teal-900/40', badgeBg: 'bg-teal-500' }},
        { key: 'postponed', label: 'مؤجل', Icon: ClockIcon, count: 0, colors: { iconColor: 'text-gray-600', iconContainerBg: 'bg-gray-200 dark:bg-gray-700', badgeBg: 'bg-gray-500' }},
        { key: 'cancelled_rejected', label: 'ملغي / راجع', Icon: XCircleIcon, count: ordersByStatus.cancelled_rejected, colors: { iconColor: 'text-red-600', iconContainerBg: 'bg-red-100 dark:bg-red-900/40', badgeBg: 'bg-red-500' }},
    ];

    const handleTicketSubmit = (message: string) => {
        if (orderForTicket) {
            onInitiateTicketThread(orderForTicket, message);
            setOrderForTicket(null);
        }
    };
    
    if (!selectedStatus) {
        return (
            <div className="p-4 bg-white dark:bg-slate-900">
                <div 
                  onClick={() => onStatusSelect('all')}
                  className="bg-white dark:bg-gray-800 rounded-full border border-gray-200/80 dark:border-gray-700 p-3 flex justify-between items-center mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-transform"
                >
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">جميع الطلبات</h2>
                    <div className="bg-gray-800 dark:bg-gray-600 text-white font-bold text-base rounded-full h-10 w-10 min-w-[40px] flex items-center justify-center">
                        {userOrders.length}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {statusMap.map(s => (
                        <StatusGridCard 
                            key={s.key}
                            label={s.label} 
                            count={s.count} 
                            Icon={s.Icon}
                            colors={s.colors}
                            onClick={() => onStatusSelect(s.key as SelectedStatus)}
                        />
                    ))}
                </div>
                 <style>{`
                    @keyframes slide-up {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                    .animate-slide-up {
                        animation: slide-up 0.3s ease-out forwards;
                    }
                `}</style>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-slate-900">
             {orderForTicket && (
                <NewTicketModal 
                    order={orderForTicket} 
                    onClose={() => setOrderForTicket(null)} 
                    onSubmit={handleTicketSubmit} 
                />
             )}
             <div className="px-4 pt-2 pb-2">
                <SearchBar 
                    searchQuery={listSearchQuery}
                    setSearchQuery={setListSearchQuery}
                    placeholder="...بحث بالرقم أو اسم الزبون أو الهاتف"
                />
            </div>
            
            {filteredOrders.length > 0 ? (
                <div className="px-4 pb-4 space-y-4 flex-grow">
                    {filteredOrders.map(order => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            onClick={() => onOrderClick(order)} 
                            onOpenTicketModal={() => setOrderForTicket(order)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-4">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                       <ClipboardListIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="font-bold text-lg dark:text-gray-300">لا توجد طلبات</p>
                    <p>لا توجد طلبات تطابق بحثك في هذا القسم.</p>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
