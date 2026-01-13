
import React, { useState, useMemo, useEffect } from 'react';
import { Ticket } from '../types';
import { HeaderConfig } from '../App';
import SearchBar from './SearchBar';
import { ClipboardListIcon, ClockIcon, CheckCircleIcon, TicketIcon, UserIcon, ChevronLeftIcon } from './icons';

interface AdminTicketsViewProps {
  tickets: Ticket[];
  onUpdateTicketThreadStatus: (ticketId: string, status: Ticket['status']) => void;
  onAddTicketMessage: (threadId: string, text?: string, imageUrl?: string) => void;
  onOpenTicketChat: (ticketThread: Ticket) => void;
  addNotification: (message: string) => void;
  setHeaderConfig: (config: HeaderConfig | null) => void;
}

type TicketFilterStatus = 'all' | 'pending' | 'resolved';

const TicketCard: React.FC<{
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
    (lastMessage.text.length > 100 ? `${lastMessage.text.substring(0, 100)}...` : lastMessage.text) : 
    (lastMessage?.imageUrl ? '📷 صورة مرفقة' : 'لا يوجد محتوى');

  const ticketDate = new Date(ticket.created_at).toLocaleDateString('ar-IQ');
  const ticketTime = new Date(ticket.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
        onClick={() => onOpenTicketChat(ticket)} 
        className="relative bg-white dark:bg-gray-800 rounded-[20px] p-4 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200/80 dark:border-gray-700/60 cursor-pointer active:scale-[0.99]"
    >
      {/* Header: Order ID & Date */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-white text-base tracking-wide flex items-center gap-2">
                <TicketIcon className="w-4 h-4 text-primary" />
                تذكرة طلب #{ticket.order_id}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                {ticketDate} • {ticketTime}
            </span>
        </div>

        <div className={`flex items-center gap-1.5 pl-3 pr-3 py-1.5 rounded-xl transition-all ${config.className}`}>
            <config.icon className="w-3.5 h-3.5" />
            <span className="text-xs font-extrabold tracking-wide">{config.text}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-50 dark:bg-gray-700/50 mb-3"></div>

      {/* User Info */}
      <div className="flex justify-between items-center mb-3 text-sm">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-gray-500" />
              </div>
              <span className="font-bold">{ticket.user_name}</span>
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">
              الزبون: {ticket.customer_name}
          </div>
      </div>

      {/* Message Preview */}
      <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2" style={{ whiteSpace: 'pre-wrap' }}>
            {lastMessageContent}
        </p>
      </div>
      
      {/* Chevron indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600">
          <ChevronLeftIcon className="w-5 h-5" />
      </div>
    </div>
  );
};

const AdminTicketsView: React.FC<AdminTicketsViewProps> = ({ tickets, onUpdateTicketThreadStatus, onAddTicketMessage, onOpenTicketChat, addNotification, setHeaderConfig }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TicketFilterStatus>('pending');

  useEffect(() => {
    setHeaderConfig({
      title: 'إدارة التذاكر',
      showBack: true,
      onBack: () => setHeaderConfig(null),
    });
    return () => setHeaderConfig(null);
  }, [setHeaderConfig]);

  const filteredTickets = useMemo(() => {
    let currentTickets = [...tickets];

    if (filter !== 'all') {
      currentTickets = currentTickets.filter(r => r.status === filter);
    }

    if (searchQuery.trim()) {
      const lcQuery = searchQuery.toLowerCase().trim();
      currentTickets = currentTickets.filter(r =>
        r.order_id.toLowerCase().includes(lcQuery) ||
        r.user_name.toLowerCase().includes(lcQuery) ||
        r.customer_name.toLowerCase().includes(lcQuery) ||
        r.messages.some(msg => msg.text?.toLowerCase().includes(lcQuery))
      );
    }
    return currentTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tickets, filter, searchQuery]);

  const getStatusCounts = useMemo(() => {
    return {
      all: tickets.length,
      pending: tickets.filter(r => r.status === 'pending').length,
      resolved: tickets.filter(r => r.status === 'resolved').length,
    };
  }, [tickets]);

  // Order logic for RTL: The first item in array appears on the Right.
  // Requested Order (Right to Left): [All] [Pending] [Resolved]
  const statusFilters: { key: TicketFilterStatus; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: 'الكل', icon: ClipboardListIcon },
    { key: 'pending', label: 'قيد الانتظار', icon: ClockIcon },
    { key: 'resolved', label: 'تم الحل', icon: CheckCircleIcon },
  ];

  return (
    <div className="dark:bg-slate-900 h-full flex flex-col relative pb-20">
      
      {/* STICKY HEADER SECTION */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
          {/* Top Bar: Search */}
          <div className="px-4 pt-3 pb-2">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="بحث برقم الطلب، التاجر، أو نص الرسالة..."
            />
          </div>

          {/* Status Filters (Tabs) */}
          <div className="mb-0 overflow-x-auto no-scrollbar px-4 pt-1 pb-3">
            <div className="flex gap-2 min-w-max">
              {statusFilters.map(s => {
                  const isActive = filter === s.key;
                  return (
                      <button
                          key={s.key}
                          onClick={() => setFilter(s.key)}
                          className={`
                              flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border
                              ${isActive 
                                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-lg shadow-gray-200 dark:shadow-none' 
                                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }
                          `}
                      >
                          <s.icon className={`w-3.5 h-3.5 ${isActive ? 'text-current' : 'text-gray-400'}`} />
                          <span>{s.label}</span>
                          <span className={`mr-1 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                              {getStatusCounts[s.key]}
                          </span>
                      </button>
                  );
              })}
            </div>
          </div>
      </div>

      {/* Tickets List */}
      <div className="pt-4 px-4 space-y-3 pb-4">
        {filteredTickets.length > 0 ? (
            filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onOpenTicketChat={onOpenTicketChat}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 py-12">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <TicketIcon className="w-10 h-10 opacity-50" />
            </div>
            <p className="font-bold text-lg mb-1">لا توجد تذاكر</p>
            <p className="text-xs">لا توجد تذاكر تطابق معايير البحث أو التصفية.</p>
          </div>
        )}
      </div>

      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
};

export default AdminTicketsView;
