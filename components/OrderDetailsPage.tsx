
import React, { useState, useMemo } from 'react';
import { Order, User, Ticket } from '../types';
import { CopyIcon, XMarkIcon, PlusIcon, PhoneIcon, MapPinIcon, UserIcon, StoreIcon, BoxOpenIcon, CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon, CheckIcon, ChevronDownIcon, WalletIcon, TicketIcon, WhatsAppIcon } from './icons';

interface OrderDetailsPageProps {
    order: Order;
    orderingUser: User | null; // New prop for the user who placed the order
    onUpdateStatus: (orderId: string, status: Order['status']) => void;
    onBack: () => void;
    addNotification: (message: string) => void;
    userTicketsForOrder: Ticket[]; // New prop: relevant tickets for this order by current user
    onInitiateTicketThread: (order: Order, initialMessageText: string) => void; // UPDATED: Now accepts full Order object
    onOpenTicketChat: (ticketThread: Ticket) => void; // New prop
    currentUser?: User | null; // Needed to check permissions
    onAdminUpdateOrder?: (orderId: string, updates: Partial<Order>) => void; // Optional for admin editing
}

// Modified InfoRow to include optional onCopy functionality
const InfoRow: React.FC<{label: string, value: string, valueClass?: string, onCopy?: () => void}> = ({label, value, valueClass="", onCopy}) => (
    <div className="flex justify-between items-center py-3">
        <div className="flex items-center gap-2">
            {onCopy && (
                <button onClick={onCopy} className="text-gray-400 hover:text-primary p-1" aria-label={`نسخ ${label}`}>
                    <CopyIcon className="w-4 h-4" />
                </button>
            )}
            <span className={`font-bold ${valueClass}`}>{value}</span>
        </div>
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
    </div>
);

// --- NEW: Admin Specific Components ---

const AdminStatusSelector: React.FC<{ order: Order; onUpdate: (status: Order['status']) => void }> = ({ order, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusInfo = (status: Order['status']) => {
        const statuses = {
            under_implementation: { text: 'قيد المعالجة', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: ClockIcon },
            prepared: { text: 'تم التجهيز', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: BoxOpenIcon },
            shipped: { text: 'جاري التوصيل', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: TruckIcon },
            completed: { text: 'تم التسليم', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircleIcon },
            postponed: { text: 'مؤجل', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300', icon: ClockIcon },
            cancelled: { text: 'ملغي', className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300', icon: XCircleIcon },
            rejected: { text: 'مرفوض', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: XCircleIcon },
            partially_delivered: { text: 'واصل جزئي', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300', icon: CheckCircleIcon },
        };
        return statuses[status] || statuses.under_implementation;
    };

    const currentStatus = getStatusInfo(order.status);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isOpen ? 'ring-2 ring-primary border-primary' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStatus.className}`}>
                        <currentStatus.icon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-0.5">حالة الطلب الحالية</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{currentStatus.text}</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
                    <div className="p-2 grid grid-cols-1 gap-1">
                        {['under_implementation', 'prepared', 'shipped', 'completed', 'partially_delivered', 'postponed', 'cancelled', 'rejected'].map((statusKey) => {
                            const info = getStatusInfo(statusKey as Order['status']);
                            const isSelected = order.status === statusKey;
                            return (
                                <button
                                    key={statusKey}
                                    onClick={() => {
                                        onUpdate(statusKey as Order['status']);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-right ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <info.icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                                    <span className="font-bold flex-grow">{info.text}</span>
                                    {isSelected && <CheckIcon className="w-4 h-4 text-primary" />}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const ContactCard: React.FC<{
    title: string;
    icon: React.ElementType;
    colorClass: string;
    name: string;
    phone?: string;
    address?: string;
    subInfo?: string;
    onCopy: (text: string) => void;
    action?: React.ReactNode;
    whatsappMessage?: string;
}> = ({ title, icon: Icon, colorClass, name, phone, address, subInfo, onCopy, action, whatsappMessage }) => {
    
    // Construct WhatsApp URL with pre-filled message
    const getWhatsAppUrl = () => {
        if (!phone) return '#';
        const cleanPhone = phone.replace(/\D/g,'').replace(/^0/, '964');
        const encodedMessage = whatsappMessage ? encodeURIComponent(whatsappMessage) : '';
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-${colorClass.split('-')[1]}-200 transition-colors`}>
            <div className={`absolute top-0 right-0 w-1.5 h-full ${colorClass}`}></div>
            <div className="flex justify-between items-start mb-3 pl-2">
                <div className="flex items-center gap-2 pr-3">
                    <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                </div>
                {action && (
                    <div className="z-10">
                        {action}
                    </div>
                )}
            </div>
            
            <div className="space-y-3 pr-3">
                <div>
                    <p className="text-xs text-gray-400 font-bold mb-0.5">الاسم</p>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">{name}</p>
                    {subInfo && <p className="text-xs text-gray-500 mt-0.5">{subInfo}</p>}
                </div>

                {phone && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-700 dark:text-gray-300 dir-ltr">{phone}</span>
                        </div>
                        <div className="flex gap-2">
                            <a 
                                href={getWhatsAppUrl()} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-1.5 bg-white dark:bg-gray-600 rounded-md text-green-500 shadow-sm hover:scale-105 transition-transform"
                                aria-label="مراسلة واتساب"
                            >
                                <WhatsAppIcon className="text-[15px]" />
                            </a>
                            <a href={`tel:${phone}`} className="p-1.5 bg-white dark:bg-gray-600 rounded-md text-blue-600 shadow-sm hover:scale-105 transition-transform"><PhoneIcon className="w-3.5 h-3.5" /></a>
                            <button onClick={() => onCopy(phone)} className="p-1.5 bg-white dark:bg-gray-600 rounded-md text-gray-500 shadow-sm hover:text-primary flex-shrink-0"><CopyIcon className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                )}

                {address && (
                    <div>
                        <p className="text-xs text-gray-400 font-bold mb-1">العنوان</p>
                        <div className="flex items-start justify-between gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{address}</p>
                            <button onClick={() => onCopy(address)} className="p-1.5 bg-white dark:bg-gray-600 rounded-md text-gray-500 shadow-sm hover:text-primary flex-shrink-0"><CopyIcon className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminOrderDetailsLayout: React.FC<{
    order: Order;
    merchant: User | null;
    onUpdateStatus: (status: Order['status']) => void;
    addNotification: (msg: string) => void;
    onOpenTicket: () => void;
}> = ({ order, merchant, onUpdateStatus, addNotification, onOpenTicket }) => {
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        addNotification('تم النسخ');
    };

    // Construct detailed message for Merchant
    const merchantMessage = `السلام عليكم ${merchant?.name || ''} 🌹
بخصوص الطلب رقم: #${order.id}

👤 *معلومات الزبون:*
الاسم: ${order.customer.name}
الهاتف: ${order.customer.phone}
العنوان: ${order.customer.address}

📦 *المنتجات:*
${order.items.map(item => `- ${item.product.name} (القياس: ${item.size}) - العدد: ${item.quantity}`).join('\n')}

💰 *التفاصيل المالية:*
المبلغ الكلي (على الزبون): ${order.total_cost.toLocaleString()} د.ع
ربحك في هذا الطلب: ${order.profit.toLocaleString()} د.ع

يرجى المتابعة وشكراً.`;

    // Construct simple message for Customer
    // Updated: Uses merchant store name and removes order ID
    const storeName = merchant?.store_name || 'المتجر';
    const customerMessage = `مرحباً ${order.customer.name} 🌹
بخصوص طلبك من ${storeName}

📦 *المنتجات:*
${order.items.map(item => `- ${item.product.name}`).join('\n')}

💰 *المبلغ الكلي:* ${order.total_cost.toLocaleString()} د.ع

عنوان التوصيل المثبت:
${order.customer.address}

شكراً لتسوقك معنا!`;

    return (
        <div className="space-y-6 pb-24">
            {/* 1. Status Section */}
            <AdminStatusSelector order={order} onUpdate={onUpdateStatus} />

            {/* 2. Merchant Card (Originally in Grid) */}
            <ContactCard 
                title="بيانات التاجر (المرسل)"
                icon={StoreIcon}
                colorClass="bg-purple-500"
                name={merchant?.name || 'غير معروف'}
                phone={merchant?.phone}
                subInfo={merchant?.store_name ? `المتجر: ${merchant.store_name}` : undefined}
                onCopy={handleCopy}
                whatsappMessage={merchantMessage}
                action={
                    <button 
                        onClick={onOpenTicket}
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors shadow-sm"
                        title="إرسال تذكرة للتاجر"
                    >
                        <TicketIcon className="w-4 h-4" />
                    </button>
                }
            />

            {/* 3. Products Table/List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <BoxOpenIcon className="w-5 h-5 text-gray-500" />
                        المنتجات المطلوبة ({order.items.length})
                    </h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="p-4 flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex-shrink-0 border border-gray-200 dark:border-gray-600 overflow-hidden">
                                <img src={item.product.image_urls[0]} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1">{item.product.name}</p>
                                <div className="flex gap-2">
                                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">القياس: {item.size}</span>
                                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">العدد: {item.quantity}</span>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800 dark:text-gray-200">{(item.product.price * item.quantity).toLocaleString()}</p>
                                <p className="text-xs text-gray-400">جملة</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Customer Card (Originally in Grid) */}
            <ContactCard 
                title="بيانات الزبون (المستلم)"
                icon={MapPinIcon}
                colorClass="bg-blue-500"
                name={order.customer.name}
                phone={order.customer.phone}
                address={order.customer.address}
                onCopy={handleCopy}
                whatsappMessage={customerMessage}
            />

            {/* 5. Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <WalletIcon className="w-5 h-5 text-green-600" />
                    الملخص المالي
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">إجمالي سعر الجملة</span>
                        <span className="font-bold dark:text-gray-200">{(order.total_cost - order.profit - order.delivery_fee + order.discount).toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">كلفة التوصيل</span>
                        <span className="font-bold dark:text-gray-200">{order.delivery_fee.toLocaleString()} د.ع</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">ربح التاجر</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{order.profit.toLocaleString()} د.ع</span>
                    </div>
                    {order.service_fee > 0 && (
                        <div className="flex justify-between p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                            <span className="text-red-600 dark:text-red-400">رسوم الخدمة</span>
                            <span className="font-bold text-red-600 dark:text-red-400">-{order.service_fee.toLocaleString()} د.ع</span>
                        </div>
                    )}
                    <div className="border-t border-dashed border-gray-200 dark:border-gray-600 my-2"></div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-lg text-gray-800 dark:text-gray-100">المبلغ الكلي (على الزبون)</span>
                        <span className="font-extrabold text-xl text-primary">{order.total_cost.toLocaleString()} د.ع</span>
                    </div>
                </div>
            </div>

            {/* Quick Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                <div className="max-w-lg mx-auto flex gap-3">
                    {order.status === 'under_implementation' && (
                        <button onClick={() => onUpdateStatus('prepared')} className="flex-1 bg-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-200 dark:shadow-none hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                            <BoxOpenIcon className="w-5 h-5"/>
                            تجهيز الطلب
                        </button>
                    )}
                    {order.status === 'prepared' && (
                        <button onClick={() => onUpdateStatus('shipped')} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            <TruckIcon className="w-5 h-5"/>
                            إرسال للتوصيل
                        </button>
                    )}
                    {order.status === 'shipped' && (
                        <button onClick={() => onUpdateStatus('completed')} className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-5 h-5"/>
                            تم التسليم
                        </button>
                    )}
                    {/* Universal Reject if not completed/cancelled/partially_delivered */}
                    {['under_implementation', 'prepared'].includes(order.status) && (
                        <button onClick={() => onUpdateStatus('rejected')} className="px-4 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-colors flex flex-col items-center justify-center min-w-[80px]">
                            <XCircleIcon className="w-5 h-5 mb-1"/>
                            <span className="text-xs">رفض</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- End Admin Specific Components ---

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ order, orderingUser, onUpdateStatus, onBack, addNotification, userTicketsForOrder, onInitiateTicketThread, onOpenTicketChat, currentUser, onAdminUpdateOrder }) => {
    const [showInitiateTicketInput, setShowInitiateTicketInput] = useState(false);
    const [initialTicketText, setInitialTicketText] = useState('');

    const existingTicketThread = useMemo(() => {
      // Assuming one ticket thread per order for simplicity, initiated by the current user
      return userTicketsForOrder.length > 0 ? userTicketsForOrder[0] : null;
    }, [userTicketsForOrder]);

    const handleCopy = (text: string, label: string) => {
        if (!text) {
            addNotification(`لا يوجد ${label} لنسخه.`);
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            addNotification(`تم نسخ ${label}`);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            addNotification(`فشل نسخ ${label}`);
        });
    };
    
    const handleOpenTicketFlow = () => {
      if (existingTicketThread) {
        onOpenTicketChat(existingTicketThread);
      } else {
        setShowInitiateTicketInput(true);
      }
    };

    // Check if current user is admin to show the new layout
    if (currentUser?.is_admin) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-slate-900 min-h-screen">
                <AdminOrderDetailsLayout 
                    order={order} 
                    merchant={orderingUser} 
                    onUpdateStatus={(status) => onUpdateStatus(order.id, status)}
                    addNotification={addNotification}
                    onOpenTicket={handleOpenTicketFlow}
                />
                
                {/* Admin-side Ticket Initiation Modal */}
                 {showInitiateTicketInput && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end p-4" onClick={() => setShowInitiateTicketInput(false)} role="dialog" aria-modal="true">
                        <div 
                            className="bg-white dark:bg-gray-800 rounded-t-2xl p-4 w-full max-w-lg animate-slide-up"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                                <button onClick={() => setShowInitiateTicketInput(false)} className="p-1" aria-label="إغلاق"><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                                <h2 className="text-lg font-bold text-center flex-grow dark:text-gray-100">إرسال تذكرة للتاجر</h2>
                                <div className="w-7"></div>
                            </div>
                            <textarea
                                value={initialTicketText}
                                onChange={(e) => setInitialTicketText(e.target.value)}
                                placeholder="اكتب رسالتك للتاجر هنا..."
                                rows={5}
                                className="w-full p-3 border dark:border-gray-700 rounded-lg text-right mt-4 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            ></textarea>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setShowInitiateTicketInput(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg">إلغاء</button>
                                <button onClick={() => {
                                    if (!initialTicketText.trim()) return;
                                    onInitiateTicketThread(order, initialTicketText);
                                    setInitialTicketText('');
                                    setShowInitiateTicketInput(false);
                                }} disabled={!initialTicketText.trim()} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                                    إرسال
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- ORIGINAL USER LAYOUT BELOW ---

    const customerPrice = order.total_cost - order.delivery_fee + order.discount;
    const wholesalePrice = customerPrice - order.profit;
    const serviceFee = order.service_fee || 0;
    const netProfit = order.profit - serviceFee;


    const handleCancelOrder = () => {
        if (window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')) {
            onUpdateStatus(order.id, 'cancelled');
            onBack();
        }
    };
    
    const getStatusInfo = (status: Order['status']) => {
        const statuses = {
            under_implementation: { text: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
            shipped: { text: 'قيد التوصيل', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
            completed: { text: 'تم التسليم للزبون', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
            cancelled: { text: 'تم الغاء الطلب', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
            rejected: { text: 'مرفوض', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
            prepared: { text: 'تم التجهيز', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
            postponed: { text: 'مؤجل', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
            partially_delivered: { text: 'واصل جزئي', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300' },
        };
        return statuses[status] || statuses.under_implementation;
    }

    const statusInfo = getStatusInfo(order.status);

    const handleSubmitInitialTicket = () => {
      if (!initialTicketText.trim() && !existingTicketThread) { // Only require text if initiating a new one
        addNotification('الرجاء كتابة رسالتك.');
        return;
      }
      onInitiateTicketThread(order, initialTicketText); // Pass full order object
      setInitialTicketText('');
      setShowInitiateTicketInput(false);
    };

    return (
        <div className="p-4 space-y-4 dark:bg-slate-900 pb-24"> {/* Added pb-24 for fixed footer */}
            {/* Removed TicketModal as it's replaced by the chat modal */}
            {showInitiateTicketInput && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end p-4" onClick={() => setShowInitiateTicketInput(false)} role="dialog" aria-modal="true">
                  <div 
                      className="bg-white dark:bg-gray-800 rounded-t-2xl p-4 w-full max-w-lg animate-slide-up"
                      onClick={(e) => e.stopPropagation()}
                  >
                      <div className="flex justify-between items-center pb-3 border-b dark:border-gray-700">
                          <button onClick={() => setShowInitiateTicketInput(false)} className="p-1" aria-label="إغلاق"><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                          <h2 id="ticket-modal-title" className="text-lg font-bold text-center flex-grow dark:text-gray-100">إرسال تذكرة للطلب #{order.id}</h2>
                          <div className="w-7"></div> {/* Spacer to balance title */}
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 text-right mt-2">
                        سيتم تضمين جميع تفاصيل الطلب ومعلومات الزبون والمنتجات تلقائيًا في التذكرة.
                      </p>
                      <textarea
                          value={initialTicketText}
                          onChange={(e) => setInitialTicketText(e.target.value)}
                          placeholder="اكتب رسالتك الإضافية هنا (مثل تغيير رقم الهاتف، تأخر الطلب)..."
                          rows={5}
                          className="w-full p-3 border dark:border-gray-700 rounded-lg text-right mt-4 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      ></textarea>

                      <div className="flex gap-2 mt-4">
                          <button onClick={() => setShowInitiateTicketInput(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg">إلغاء</button>
                          <button onClick={handleSubmitInitialTicket} disabled={!initialTicketText.trim()} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                              إرسال التذكرة
                          </button>
                      </div>
                  </div>
              </div>
            )}

            {/* Admin Note Alert for User */}
            {order.admin_note && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 rounded-xl text-right shadow-sm">
                    <p className="font-bold text-sm flex items-center gap-2 justify-end mb-1">
                        <span>ملاحظة من الإدارة</span>
                        <i className="fa-solid fa-circle-info"></i>
                    </p>
                    <p className="text-sm leading-relaxed">{order.admin_note}</p>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
                <h3 className="font-bold text-right mb-2 dark:text-gray-200">معلومات الطلب</h3>
                <div className="flex items-start gap-4">
                    <div className="flex-grow text-right">
                         <div className="flex justify-end items-center gap-2">
                             <button onClick={() => handleCopy(order.id, 'رقم الطلب')} className="text-gray-500 hover:text-primary p-1">
                                <CopyIcon className="w-5 h-5" />
                            </button>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">{order.id}</p>
                        </div>
                         <p className="text-primary dark:text-primary-light font-bold text-lg text-right">{order.total_cost.toLocaleString()} د.ع</p>
                         <span className={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-full ${statusInfo.className}`}>
                            {statusInfo.text}
                        </span>
                        <p className="text-gray-500 dark:text-gray-400 text-sm text-right mt-1">{order.date} - {order.time}</p>
                    </div>
                     <div className="text-left">
                        <p className="text-sm text-right mb-1 dark:text-gray-300">{order.items.length} منتج</p>
                        {order.items.length > 0 && 
                            <img src={order.items[0].product.image_urls[0]} alt={order.items[0].product.name} className="w-20 h-20 object-contain bg-gray-100 dark:bg-gray-700 rounded-md" loading="lazy" />
                        }
                     </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 divide-y dark:divide-gray-700">
                 <InfoRow label="هاتف العميل" value={order.customer.phone} onCopy={() => handleCopy(order.customer.phone, 'هاتف العميل')} valueClass="dark:text-gray-200" />
                 <InfoRow label="عنوان التسليم" value={order.customer.address} onCopy={() => handleCopy(order.customer.address, 'عنوان التسليم')} valueClass="dark:text-gray-200" />
                 <InfoRow label="تاريخ الطلب" value={`${order.date} - ${order.time}`} valueClass="dark:text-gray-200" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 divide-y dark:divide-gray-700">
                <InfoRow label="إجمالي سعر الجملة" value={`${wholesalePrice.toLocaleString()} د.ع`} valueClass="text-gray-800 dark:text-gray-200" />
                <InfoRow label="تخفيض" value={`${order.discount.toLocaleString()} د.ع`} valueClass="text-gray-800 dark:text-gray-200" />
                <InfoRow label="إجمالي الربح" value={`${order.profit.toLocaleString()} د.ع`} valueClass="text-gray-800 dark:text-gray-200" />
                <InfoRow label="رسوم الخدمة" value={`- ${serviceFee.toLocaleString()} د.ع`} valueClass="text-red-500" />
                <InfoRow label="صافي الربح" value={`${netProfit.toLocaleString()} د.ع`} valueClass="text-green-600 dark:text-green-400 font-bold" />
                <div className="border-t dark:border-gray-700 my-2"></div>
                <InfoRow label="إجمالي سعر الزبون" value={`${customerPrice.toLocaleString()} د.ع`} valueClass="text-gray-800 dark:text-gray-200" />
                <InfoRow label="توصيل" value={`${order.delivery_fee.toLocaleString()} د.ع`} valueClass="text-gray-800 dark:text-gray-200" />
                <InfoRow label="إجمالي الطلب" value={`${order.total_cost.toLocaleString()} د.ع`} valueClass="text-primary dark:text-primary-light text-lg" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
                <h3 className="font-bold text-right mb-2 dark:text-gray-200">تفاصيل المنتجات ({order.items.length})</h3>
                <div className="space-y-3">
                    {order.items.map((item, index) => (
                         <div key={index} className="flex items-center gap-4 text-right">
                            <div className="flex-grow">
                                <p className="font-bold dark:text-gray-200">{item.product.name}</p>
                                <p className="text-gray-600 dark:text-gray-400">{item.quantity} x - القياس: {item.size}</p>
                            </div>
                             <p className="font-bold text-primary dark:text-primary-light">{(item.product.price * item.quantity).toLocaleString()} د.ع</p>
                            <img src={item.product.image_urls[0]} alt={item.product.name} className="w-16 h-16 object-contain bg-gray-100 dark:bg-gray-700 rounded-md" loading="lazy" />
                         </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto bg-white dark:bg-gray-800 p-4 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-700" style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))`}}>
                <div className="flex gap-2">
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button onClick={handleCancelOrder} className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-lg">
                            إلغاء الطلب
                        </button>
                    )}
                    <button onClick={handleOpenTicketFlow} className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                        <PlusIcon className="w-5 h-5"/>
                        <span>فتح تذكرة</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
