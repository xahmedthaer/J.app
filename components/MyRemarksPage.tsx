import React, { useMemo, useState } from 'react';
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
}> = ({ ticket, onOpenTicketChat }) => {
  const statusInfo = {
    pending: { text: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', icon: ClockIcon },
    resolved: { text: 'تم الحل', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', icon: CheckCircleIcon },
  };
  const config = statusInfo[ticket.status];

  const lastMessage = ticket.messages[ticket.messages.length - 1];
  const lastMessageContent = lastMessage?.text ? 
    (lastMessage.text.length > 80 ? `${lastMessage.text.substring(0, 80)}...` : lastMessage.text) : 
    (lastMessage?.imageUrl ? 'صورة مرفقة' : 'لا يوجد محتوى');


  return (
    <div 
        onClick={() => onOpenTicketChat(ticket)} 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-primary active:scale-95 transition-transform duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-grow text-right">
          <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">تذكرة للطلب #{ticket.order_id}</p>
          <p className="text-gray-600 dark:text-gray-300 font-semibold mt-1">للزبون: {ticket.customer_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleDateString('ar-IQ')} - {new Date(ticket.created_at).toLocaleTimeString('ar-IQ')}</p>
        </div>

        <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-bold rounded-full ${config.className}`} aria-label={`حالة التذكرة: ${config.text}`}>
          <config.icon className="w-4 h-4" />
          {config.text}
        </div>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-right text-gray-700 dark:text-gray-300">
        <p className="text-sm line-clamp-2" style={{ whiteSpace: 'pre-wrap' }}>{lastMessageContent}</p>
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

  const userTickets = useMemo(() => {
    if (!currentUser) return [];
    return tickets.filter(r => r.user_id === currentUser.id)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tickets, currentUser]);

  const existingTicketForOrder = (orderId: string) => {
    return userTickets.find(r => r.order_id === orderId);
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
    <div className="dark:bg-slate-900 pb-4 p-4 space-y-4">
      {userTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-gray-500 dark:text-gray-400 p-4">
          <TicketIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="font-bold text-xl mb-2">لا توجد تذاكر سابقة</p>
          <p className="text-sm">يمكنك إرسال تذاكر على طلباتك من صفحة تفاصيل الطلب أو الضغط على زر <PlusIcon className="inline-block w-4 h-4" /> بالأسفل.</p>
        </div>
      )}

      {userTickets.map(ticket => (
        <UserTicketCard key={ticket.id} ticket={ticket} onOpenTicketChat={onOpenTicketChat} />
      ))}

      <button
        onClick={() => setShowNewTicketFlow(true)}
        className="fixed bottom-20 left-4 z-10 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="إضافة تذكرة جديدة"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

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
