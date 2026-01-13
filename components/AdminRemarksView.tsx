import React, { useState, useMemo, useEffect } from 'react';
import { Ticket } from '../types';
// FIX: Changed AdminHeaderConfig to HeaderConfig to match the exported type from App.tsx.
import { HeaderConfig } from '../App';
import SearchBar from './SearchBar';
import { ClipboardListIcon, ClockIcon, CheckCircleIcon, TicketIcon } from './icons';

interface AdminTicketsViewProps {
  tickets: Ticket[];
  onUpdateTicketThreadStatus: (ticketId: string, status: Ticket['status']) => void;
  onAddTicketMessage: (threadId: string, text?: string, imageUrl?: string) => void;
  onOpenTicketChat: (ticketThread: Ticket) => void;
  addNotification: (message: string) => void;
  // FIX: Renamed prop to setHeaderConfig and updated type to HeaderConfig to fix type error and prop name mismatch.
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
          <p className="text-gray-600 dark:text-gray-300 font-semibold mt-1">من: {ticket.user_name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">للزبون: {ticket.customer_name}</p>
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

  const statusFilters: { key: TicketFilterStatus; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'pending', label: 'قيد الانتظار', icon: ClockIcon, color: 'text-yellow-600' },
    { key: 'resolved', label: 'تم الحل', icon: CheckCircleIcon, color: 'text-green-600' },
    { key: 'all', label: 'الكل', icon: ClipboardListIcon, color: 'text-gray-500' },
  ];

  return (
    <div className="dark:bg-slate-900 pb-4">
      <div className="px-4 pt-2 pb-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="...بحث برقم الطلب، اسم التاجر، الزبون، أو نص التذكرة"
        />
      </div>

      <div className="flex space-x-2 space-x-reverse overflow-x-auto px-4 pb-4 no-scrollbar">
        {statusFilters.map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              filter === s.key ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-pressed={filter === s.key}
            aria-label={`عرض التذاكر الحالة: ${s.label}`}
          >
            <s.icon className={`w-4 h-4 ${filter === s.key ? 'text-white' : s.color}`} />
            <span>{s.label} ({getStatusCounts[s.key]})</span>
          </button>
        ))}
      </div>

      {filteredTickets.length > 0 ? (
        <div className="px-4 space-y-4">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onOpenTicketChat={onOpenTicketChat}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8">
          <TicketIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="font-bold text-xl mb-2">لا توجد تذاكر</p>
          <p className="text-sm">لا توجد تذاكر تطابق معايير البحث أو التصفية.</p>
        </div>
      )}
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
