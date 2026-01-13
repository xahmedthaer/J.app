
import React, { useMemo, useState, useEffect } from 'react';
import { Ticket, User, Order } from '../types';
import { TicketIcon, ClockIcon, CheckCircleIcon, PlusIcon, XMarkIcon, ChevronLeftIcon } from './icons';
import SearchBar from './SearchBar';

interface MyTicketsPageProps {
  tickets: Ticket[];
  currentUser: User | null;
  onOpenTicketChat: (ticketThread: Ticket) => void;
  userOrders: Order[];
  onInitiateTicketThread: (order: Order, initialMessageText: string) => void;
  addNotification: (message: string) => void;
}

const UserTicketCard: React.FC<{
  ticket: Ticket;
  onOpenTicketChat: (ticketThread: Ticket) => void;
  currentUser: User;
}> = ({ ticket, onOpenTicketChat, currentUser }) => {
    const statusInfo = {
        pending: { text: 'مفتوحة', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        resolved: { text: 'مغلقة', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    };
    const config = statusInfo[ticket.status];
    const lastMessage = ticket.messages[ticket.messages.length - 1];
    
    const isLastMessageFromOther = lastMessage?.senderId !== currentUser.id;
    const ticketDate = new Date(ticket.created_at).toLocaleDateString('ar-IQ');

    return (
        <div onClick={() => onOpenTicketChat(ticket)} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-primary active:scale-95 transition-all duration-200 space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-xs text-gray-400 dark:text-gray-500">{ticketDate}</span>
                {isLastMessageFromOther && ticket.status === 'pending' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" title="رد جديد"></div>}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">استفسار بخصوص الطلب #{ticket.order_id}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 text-sm">
                   {lastMessage?.text || 'صورة مرفقة'}
                </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
                 <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold rounded-md ${config.className}`}>
                    <div className={`w-2 h-2 rounded-full ${ticket.status === 'pending' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span>{config.text}</span>
                </div>
                 <div className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    <span>{`الزبون: ${ticket.customer_name}`}</span>
                </div>
            </div>
        </div>
    );
};


const OrderSelectionModal: React.FC<{
  userOrders: Order[];
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
  existingTicketForOrder: (orderId: string) => Ticket | undefined;
}> = ({ userOrders, onClose, onSelectOrder, existingTicketForOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sortedOrders = useMemo(() => 
    [...userOrders].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  [userOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return sortedOrders;
    const lcQuery = searchQuery.toLowerCase().trim();
    return sortedOrders.filter(o =>
      o.id.toLowerCase().includes(lcQuery) ||
      o.customer.name.toLowerCase().includes(lcQuery) ||
      o.customer.phone.includes(lcQuery)
    );
  }, [sortedOrders, searchQuery]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="bg-white dark:bg-gray-800 rounded-t-2xl p-4 w-full max-w-lg h-[70vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700 flex-shrink-0">
          <button onClick={onClose} className="p-1" aria-label="إغلاق"><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
          <h2 id="order-selection-title" className="text-lg font-bold text-center flex-grow dark:text-gray-100">اختر الطلب للتذكرة</h2>
          <div className="w-7"></div>
        </div>

        <div className="py-3 flex-shrink-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="...بحث برقم الطلب أو اسم الزبون أو الهاتف"
          />
        </div>

        <div className="flex-grow overflow-y-auto space-y-3 pb-2">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <button
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="w-full text-right p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-98 transition-transform"
              >
                <p className="font-bold text-gray-800 dark:text-gray-200">طلب رقم #{order.id}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">الزبون: {order.customer.name}</p>
                {existingTicketForOrder(order.id) && (
                    <p className="text-xs text-primary dark:text-primary-light mt-1">
                        <TicketIcon className="inline-block w-3 h-3 ml-1" />
                        توجد تذكرة سابقة لهذا الطلب
                    </p>
                )}
              </button>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
              <p>لا توجد طلبات لعرضها.</p>
            </div>
          )}
        </div>
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
};

const MyTicketsPage: React.FC<MyTicketsPageProps> = ({ tickets, currentUser, onOpenTicketChat, userOrders, onInitiateTicketThread, addNotification }) => {
  const [showNewTicketFlow, setShowNewTicketFlow] = useState(false);
  const [selectedOrderForNewTicket, setSelectedOrderForNewTicket] = useState<Order | null>(null);
  const [initialMessageForNewTicket, setInitialMessageForNewTicket] = useState('');
  
  type FilterStatus = 'all' | 'pending' | 'resolved';
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredTickets = useMemo(() => {
    if (!currentUser) return [];
    const userTickets = tickets.filter(r => r.user_id === currentUser.id);
    const filtered = filter === 'all' ? userTickets : userTickets.filter(r => r.status === filter);
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tickets, currentUser, filter]);

  const existingTicketForOrder = (orderId: string) => {
    return tickets.find(r => r.order_id === orderId && r.user_id === currentUser?.id);
  };

  const handleOrderSelect = (order: Order) => {
    const existingThread = existingTicketForOrder(order.id);
    if (existingThread) {
      onOpenTicketChat(existingThread);
      addNotification('توجد تذكرة سابقة لهذا الطلب، تم فتحها.');
      setShowNewTicketFlow(false);
      setSelectedOrderForNewTicket(null);
    } else {
      setSelectedOrderForNewTicket(order);
    }
  };

  const handleSendInitialTicket = () => {
    if (!selectedOrderForNewTicket || !initialMessageForNewTicket.trim()) {
      addNotification('الرجاء اختيار طلب وكتابة رسالتك.');
      return;
    }
    
    onInitiateTicketThread(selectedOrderForNewTicket, initialMessageForNewTicket);
    
    setShowNewTicketFlow(false);
    setSelectedOrderForNewTicket(null);
    setInitialMessageForNewTicket('');
  };

  const filterButtons: { label: string, value: FilterStatus }[] = [
    { label: 'الكل', value: 'all' },
    { label: 'مفتوحة', value: 'pending' },
    { label: 'مغلقة', value: 'resolved' },
  ];
  
  const counts = useMemo(() => {
    if (!currentUser) return { all: 0, pending: 0, resolved: 0 };
    const userTickets = tickets.filter(r => r.user_id === currentUser.id);
    return {
      all: userTickets.length,
      pending: userTickets.filter(r => r.status === 'pending').length,
      resolved: userTickets.filter(r => r.status === 'resolved').length
    };
  }, [tickets, currentUser]);


  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-gray-500 dark:text-gray-400 dark:bg-slate-900 p-4">
        <TicketIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="font-bold text-xl mb-2">لا يمكن عرض التذاكر</p>
        <p className="text-sm">الرجاء تسجيل الدخول لعرض تذاكرك.</p>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-900 h-full">
      <div className="p-4">
        <div className="flex justify-between items-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1 flex items-center gap-1">
                {filterButtons.map(btn => (
                    <button
                    key={btn.value}
                    onClick={() => setFilter(btn.value)}
                    className={`flex-1 text-center font-bold px-3 py-2 rounded-lg transition-colors text-sm ${filter === btn.value ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-light shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                    {btn.label}
                    </button>
                ))}
            </div>
             <button
                onClick={() => setShowNewTicketFlow(true)}
                className="font-bold text-primary flex items-center gap-1.5 text-sm bg-primary-light px-3 py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
                aria-label="إنشاء تذكرة جديدة"
            >
                <PlusIcon className="w-4 h-4" />
                <span>إنشاء تذكرة</span>
            </button>
        </div>
      </div>
      
      <div className="px-4 pb-4 h-[calc(100%-100px)] overflow-y-auto">
        {filteredTickets.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <div className="absolute w-28 h-28 bg-primary/20 rounded-full animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-primary-light dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-lightbulb text-4xl text-primary"></i>
                  </div>
              </div>
              <p className="font-bold text-xl mt-2 dark:text-gray-300">لا توجد تذاكر</p>
              <p>عندما تقوم بإنشاء تذاكر، ستظهر هنا.</p>
          </div>
        ) : (
          <div className="space-y-3">
             <h2 className="font-bold text-gray-800 dark:text-gray-100 text-right">
                {filter === 'all' ? 'كل التذاكر' : filter === 'pending' ? 'التذاكر المفتوحة' : 'التذاكر المغلقة'} ({counts[filter]})
            </h2>
            {filteredTickets.map(ticket => (
              <UserTicketCard key={ticket.id} ticket={ticket} onOpenTicketChat={onOpenTicketChat} currentUser={currentUser} />
            ))}
          </div>
        )}
      </div>

      {showNewTicketFlow && !selectedOrderForNewTicket && (
        <OrderSelectionModal
          userOrders={userOrders}
          onClose={() => setShowNewTicketFlow(false)}
          onSelectOrder={handleOrderSelect}
          existingTicketForOrder={existingTicketForOrder}
        />
      )}

      {showNewTicketFlow && selectedOrderForNewTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end p-4" onClick={() => setShowNewTicketFlow(false)} role="dialog" aria-modal="true">
          <div
            className="bg-white dark:bg-gray-800 rounded-t-2xl p-4 w-full max-w-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
              <button onClick={() => { setSelectedOrderForNewTicket(null); setInitialMessageForNewTicket(''); }} className="p-1" aria-label="العودة لاختيار الطلب"><ChevronLeftIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
              <h2 className="text-lg font-bold text-center flex-grow dark:text-gray-100">تذكرة للطلب #{selectedOrderForNewTicket.id}</h2>
              <button onClick={() => setShowNewTicketFlow(false)} className="p-1" aria-label="إغلاق"><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-right mt-2">
              سيتم تضمين جميع تفاصيل الطلب تلقائيًا.
            </p>
            <textarea
              value={initialMessageForNewTicket}
              onChange={(e) => setInitialMessageForNewTicket(e.target.value)}
              placeholder="اكتب رسالتك الأولية هنا..."
              rows={5}
              className="w-full p-3 border dark:border-gray-700 rounded-lg text-right mt-4 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNewTicketFlow(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg">إلغاء</button>
              <button onClick={handleSendInitialTicket} disabled={!initialMessageForNewTicket.trim()} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                إرسال التذكرة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
