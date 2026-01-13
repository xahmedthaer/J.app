import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Ticket, TicketMessage, User, Order } from '../../types';
import { XMarkIcon, SendIcon, ImageIcon, CheckCircleIcon, ClockIcon, ChevronLeftIcon, CopyIcon } from '../common/icons';

interface TicketChatModalProps {
  ticketThread: Ticket;
  order: Order; // NEW: Pass the full order object for context
  currentUser: User;
  onClose: () => void;
  onSendMessage: (threadId: string, text?: string, imageUrl?: string) => void;
  isAdminView: boolean;
  onUpdateTicketStatus?: (threadId: string, status: Ticket['status']) => void;
  addNotification: (message: string) => void; // For copy feedback
}

// Utility function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const OrderContextBlock: React.FC<{ order: Order, addNotification: (msg: string) => void }> = ({ order, addNotification }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCopy = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            addNotification(`تم نسخ ${label}`);
        });
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border dark:border-gray-700 text-sm">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-gray-200">الطلب #{order.id}</p>
                    <p className="text-gray-600 dark:text-gray-400">الزبون: {order.customer.name}</p>
                </div>
                <ChevronLeftIcon className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'transform -rotate-90' : ''}`} />
            </div>
            {isExpanded && (
                <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2 text-right">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">المنتجات:</p>
                    <ul className="list-disc pr-4 text-gray-600 dark:text-gray-400">
                        {order.items.map((item, index) => (
                            <li key={index}>{item.product.name} (الكمية: {item.quantity})</li>
                        ))}
                    </ul>
                     <div className="flex justify-between items-center text-xs">
                        <button onClick={() => handleCopy(order.customer.phone, 'رقم هاتف الزبون')} className="p-1 text-gray-400"><CopyIcon/></button>
                        <span>هاتف الزبون: {order.customer.phone}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <button onClick={() => handleCopy(order.customer.address, 'عنوان الزبون')} className="p-1 text-gray-400"><CopyIcon/></button>
                        <span>عنوان الزبون: {order.customer.address}</span>
                    </div>
                </div>
            )}
        </div>
    );
};


const TicketChatModal: React.FC<TicketChatModalProps> = ({
  ticketThread,
  order,
  currentUser,
  onClose,
  onSendMessage,
  isAdminView,
  onUpdateTicketStatus,
  addNotification,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isSender = (message: TicketMessage) => message.senderId === currentUser.id;
  const isResolvedForUser = ticketThread.status === 'resolved' && !isAdminView;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketThread.messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;
    if (isResolvedForUser) return; // Prevent sending if resolved for user

    onSendMessage(ticketThread.id, inputText.trim() || undefined, selectedImage || undefined);
    setSelectedImage(null);
    setInputText('');
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('حجم الصورة كبير جداً (الحد الأقصى 2MB).');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setSelectedImage(base64);
        e.target.value = ''; // Clear file input
      } catch (error) {
        console.error('Error converting image to base64:', error);
        alert('حدث خطأ أثناء تحميل الصورة.');
      }
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Ticket['status'];
    if (onUpdateTicketStatus && window.confirm(`هل أنت متأكد من تغيير حالة التذكرة إلى "${newStatus === 'pending' ? 'قيد الانتظار' : 'تم الحل'}"؟`)) {
      onUpdateTicketStatus(ticketThread.id, newStatus);
    }
  };

  const getStatusConfig = (status: Ticket['status']) => {
    return status === 'pending'
      ? { text: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', icon: ClockIcon }
      : { text: 'تم الحل', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', icon: CheckCircleIcon };
  };
  const currentStatusConfig = getStatusConfig(ticketThread.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-lg mx-auto h-[90vh] flex flex-col animate-slide-up">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b dark:border-gray-700">
          <button onClick={onClose} className="p-2" aria-label="إغلاق المحادثة"><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
          <div className="flex-grow text-center">
            <h2 className="text-lg font-bold dark:text-gray-100">محادثة الدعم</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">التاجر: {ticketThread.user_name}</p>
          </div>
          {isAdminView && onUpdateTicketStatus ? (
            <select
              value={ticketThread.status}
              onChange={handleStatusChange}
              className="p-1 text-sm border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              aria-label="تغيير حالة التذكرة"
            >
              <option value="pending">قيد الانتظار</option>
              <option value="resolved">تم الحل</option>
            </select>
          ) : (
             <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full ${currentStatusConfig.className}`}>
                <currentStatusConfig.icon className="w-3 h-3" />
                {currentStatusConfig.text}
             </div>
          )}
        </header>

        <main className="flex-grow overflow-y-auto p-4 space-y-4">
          <OrderContextBlock order={order} addNotification={addNotification} />
          {ticketThread.messages.map((msg) => (
            <div key={msg.id} className={`flex ${isSender(msg) ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  isSender(msg)
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                {!isSender(msg) && <p className="font-bold text-xs mb-1 opacity-80">{msg.senderName}</p>}
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="مرفق" className="max-w-full h-auto rounded-lg mb-2" />
                )}
                {msg.text && <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{msg.text}</p>}
                <p className={`mt-1 text-right text-xs ${isSender(msg) ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isResolvedForUser && (
            <div className="flex justify-center py-4">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold">
                <CheckCircleIcon className="w-5 h-5" />
                <span>تم حل هذه التذكرة ولا يمكن إضافة رسائل جديدة.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {selectedImage && !isResolvedForUser && (
          <div className="flex-shrink-0 relative p-2 bg-gray-100 dark:bg-gray-700 border-t dark:border-gray-600 flex items-center gap-3">
            <button onClick={() => setSelectedImage(null)} className="p-1 text-red-500" aria-label="إزالة الصورة"><XMarkIcon className="w-6 h-6" /></button>
            <img src={selectedImage} alt="معاينة الصورة" className="h-16 w-16 object-cover rounded-md" />
            <span className="text-sm dark:text-gray-300">صورة جاهزة للإرسال</span>
          </div>
        )}

        <footer className="flex-shrink-0 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          {!isResolvedForUser ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب رسالتك هنا..."
                className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-300 dark:hover:bg-gray-600"
                aria-label="إرفاق صورة"
              >
                <ImageIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && !selectedImage)}
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-gray-400"
                aria-label="إرسال"
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
              (تم حل التذكرة)
            </div>
          )}
        </footer>
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

export default TicketChatModal;