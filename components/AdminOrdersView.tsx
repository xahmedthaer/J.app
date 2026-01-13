
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Order, Customer } from '../types';
import SearchBar from './SearchBar';
import { ClipboardListIcon, CheckCircleIcon, XCircleIcon, TruckIcon, ClockIcon, CopyIcon, BoxOpenIcon, CheckIcon, TrashIcon, ChevronDownIcon, EditIcon, XMarkIcon, UserIcon, MapPinIcon, PhoneIcon } from './icons';
import { HeaderConfig } from '../App';

// --- EDIT ORDER MODAL ---
const EditOrderModal: React.FC<{
    order: Order;
    onClose: () => void;
    onSave: (orderId: string, updates: Partial<Order>) => void;
}> = ({ order, onClose, onSave }) => {
    const [customerName, setCustomerName] = useState(order.customer.name);
    const [customerPhone, setCustomerPhone] = useState(order.customer.phone);
    const [customerAddress, setCustomerAddress] = useState(order.customer.address);
    const [totalCost, setTotalCost] = useState(order.total_cost);
    const [adminNote, setAdminNote] = useState(order.admin_note || '');

    const handleSave = () => {
        // Calculate new profit based on new total cost
        // Formula: New Profit = New Total Cost - (Wholesale Cost + Delivery - Discount)
        
        // 1. Calculate Wholesale Cost from Items
        const wholesaleCost = order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        // 2. Derive Current "Base Cost" (Wholesale + Delivery - Discount)
        // Original Logic: Profit = TotalCost - Delivery + Discount - Wholesale
        // So: TotalCost - Profit = Wholesale + Delivery - Discount (The cost to cover)
        // Let's verify: 
        // CustomerPrice (User set) = TotalCost - Delivery + Discount
        // Profit = CustomerPrice - Wholesale
        // So Profit = (TotalCost - Delivery + Discount) - Wholesale
        
        // New Profit Calculation:
        const newProfit = (totalCost - order.delivery_fee + order.discount) - wholesaleCost;

        const updates: Partial<Order> = {
            customer: {
                ...order.customer,
                name: customerName,
                phone: customerPhone,
                address: customerAddress,
            },
            total_cost: totalCost,
            profit: newProfit,
            admin_note: adminNote,
        };

        onSave(order.id, updates);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
                    <h2 className="text-xl font-bold dark:text-gray-100">تعديل الطلب #{order.id}</h2>
                </div>
                
                <div className="p-5 space-y-4 overflow-y-auto">
                    {/* Customer Details */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm border-b dark:border-gray-700 pb-1">بيانات الزبون</h3>
                        <div className="relative">
                            <label className="text-xs text-gray-500 mb-1 block">اسم الزبون</label>
                            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-3 pl-10 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white" />
                            <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-8" />
                        </div>
                        <div className="relative">
                            <label className="text-xs text-gray-500 mb-1 block">رقم الهاتف</label>
                            <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-3 pl-10 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white" />
                            <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-8" />
                        </div>
                        <div className="relative">
                            <label className="text-xs text-gray-500 mb-1 block">العنوان</label>
                            <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full p-3 pl-10 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white" />
                            <MapPinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-8" />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-3 pt-2">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm border-b dark:border-gray-700 pb-1">التفاصيل المالية</h3>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">المبلغ الكلي (على الزبون)</label>
                            <input 
                                type="number" 
                                value={totalCost} 
                                onChange={e => setTotalCost(Number(e.target.value))} 
                                className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white font-bold text-lg text-primary" 
                            />
                            <p className="text-xs text-orange-500 mt-1">* تغيير هذا السعر سيؤدي لتحديث الربح تلقائياً.</p>
                        </div>
                    </div>

                    {/* Admin Note */}
                    <div className="space-y-3 pt-2">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm border-b dark:border-gray-700 pb-1">ملاحظة للمستخدم</h3>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">سبب التعديل أو ملاحظة (ستظهر للمستخدم)</label>
                            <textarea 
                                value={adminNote} 
                                onChange={e => setAdminNote(e.target.value)} 
                                className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white h-24 resize-none"
                                placeholder="مثال: تم تغيير رقم الهاتف بناءً على طلبك.."
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t dark:border-gray-700 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold">إلغاء</button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90">حفظ التغييرات</button>
                </div>
            </div>
        </div>
    );
};


interface AdminOrderCardProps {
    order: Order;
    onOrderClick: (order: Order) => void;
    addNotification: (message: string) => void;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    isSelectionMode: boolean;
    onUpdateStatus: (id: string, status: Order['status']) => void;
    onEditOrder: (order: Order) => void; // New prop for opening modal
}

const AdminOrderCard: React.FC<AdminOrderCardProps> = ({ order, onOrderClick, addNotification, isSelected, onToggleSelect, isSelectionMode, onUpdateStatus, onEditOrder }) => {
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsStatusMenuOpen(false);
            }
        };
        if (isStatusMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isStatusMenuOpen]);

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

    const statusInfo = getStatusInfo(order.status);
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    const handleCopy = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            addNotification('تم النسخ');
        });
    };

    return (
        <div 
            onClick={() => isSelectionMode ? onToggleSelect(order.id) : onOrderClick(order)}
            className={`
                relative bg-white dark:bg-gray-800 rounded-[20px] p-4 transition-all duration-200 group
                border border-gray-200/80 dark:border-gray-700/60
                ${isSelected 
                    ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10 border-transparent' 
                    : 'shadow-sm hover:shadow-md'
                }
            `}
        >
            {/* Selection Checkbox Overlay */}
            {isSelectionMode && (
                <div className={`absolute top-4 left-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                    {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </div>
            )}

            {/* Header: ID, Edit Button & Status */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-base tracking-wide font-mono">#{order.id}</span>
                        <button 
                            onClick={(e) => handleCopy(e, order.id)} 
                            className="text-gray-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <CopyIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                        {order.date} • {order.time}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditOrder(order);
                        }}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="تعديل الطلب"
                    >
                        <EditIcon className="w-4 h-4" />
                    </button>

                    {/* Status Dropdown Trigger */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsStatusMenuOpen(!isStatusMenuOpen);
                            }}
                            className={`flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm border border-transparent hover:border-black/5 hover:shadow-md ${statusInfo.className}`}
                        >
                            <statusInfo.icon className="w-4 h-4" />
                            <span className="text-xs font-extrabold tracking-wide">{statusInfo.text}</span>
                            <ChevronDownIcon className="w-3.5 h-3.5 opacity-70 mr-1" />
                        </button>

                        {/* Fast, Larger Dropdown Menu */}
                        {isStatusMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fast-fade origin-top-left flex flex-col max-h-[320px] overflow-y-auto ring-1 ring-black/5">
                                {['under_implementation', 'prepared', 'shipped', 'completed', 'partially_delivered', 'postponed', 'cancelled', 'rejected'].map((statusKey) => {
                                    const info = getStatusInfo(statusKey as Order['status']);
                                    const isCurrent = order.status === statusKey;
                                    return (
                                        <button
                                            key={statusKey}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateStatus(order.id, statusKey as Order['status']);
                                                setIsStatusMenuOpen(false);
                                            }}
                                            className={`w-full text-right px-5 py-3.5 text-sm font-bold flex items-center gap-3 transition-colors border-b last:border-0 border-gray-50 dark:border-gray-700/50
                                                ${isCurrent 
                                                    ? 'bg-primary/5 text-primary' 
                                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }
                                            `}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                <info.icon className={`w-4 h-4 ${isCurrent ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`} />
                                            </div>
                                            <span>{info.text}</span>
                                            {isCurrent && <CheckIcon className="w-4 h-4 mr-auto text-primary" />}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gray-50 dark:bg-gray-700/50 mb-3"></div>

            {/* Products Images Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center -space-x-3 space-x-reverse overflow-hidden py-1 pl-1">
                    {order.items.slice(0, 4).map((item, index) => (
                        <div key={index} className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-50 dark:bg-gray-700 shadow-sm flex-shrink-0">
                            <img 
                                src={item.product.image_urls[0]} 
                                alt="" 
                                className="w-full h-full object-cover rounded-full" 
                                loading="lazy" 
                            />
                        </div>
                    ))}
                    {order.items.length > 4 && (
                        <div className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300 z-10">
                            +{order.items.length - 4}
                        </div>
                    )}
                </div>
                
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                    {totalItems} منتج
                </span>
            </div>
        </div>
    );
};

interface AdminOrdersViewProps {
    orders: Order[];
    onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
    onAdminOrderClick: (order: Order) => void;
    addNotification: (message: string) => void;
    setHeaderConfig: (config: HeaderConfig | null) => void;
    onAdminUpdateOrder: (orderId: string, updates: Partial<Order>) => void; // New prop
}

type AdminOrderStatusFilter = Order['status'] | 'all' | 'cancelled_rejected' | 'prepared' | 'postponed' | 'partially_delivered';

const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ orders, onUpdateOrderStatus, onAdminOrderClick, addNotification, setHeaderConfig, onAdminUpdateOrder }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<AdminOrderStatusFilter>('all');
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [bulkStatus, setBulkStatus] = useState<Order['status'] | ''>('');
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null); // For Edit Modal

    useEffect(() => {
        setHeaderConfig({
            title: 'إدارة الطلبات',
            showBack: true,
            onBack: () => setHeaderConfig(null),
        });
        return () => setHeaderConfig(null);
    }, [setHeaderConfig]);

    const filteredOrders = useMemo(() => {
        let currentOrders = orders;
        if (filter !== 'all') {
            if (filter === 'cancelled_rejected') {
                currentOrders = currentOrders.filter(o => o.status === 'cancelled' || o.status === 'rejected');
            } else {
                currentOrders = currentOrders.filter(o => o.status === filter);
            }
        }

        if (searchQuery.trim()) {
            const lcQuery = searchQuery.toLowerCase().trim();
            currentOrders = currentOrders.filter(o =>
                o.id.toLowerCase().includes(lcQuery) ||
                o.customer.name.toLowerCase().includes(lcQuery) ||
                o.customer.phone.includes(lcQuery)
            );
        }
        return currentOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [orders, filter, searchQuery]);

    const getStatusCounts = useMemo(() => {
        const counts: Record<string, number> = {
            all: orders.length,
            under_implementation: 0,
            shipped: 0,
            completed: 0,
            cancelled: 0,
            rejected: 0,
            cancelled_rejected: 0,
            prepared: 0,
            postponed: 0,
            partially_delivered: 0,
        };
        orders.forEach(order => {
            if (counts[order.status] !== undefined) {
                counts[order.status]++;
            }
        });
        counts.cancelled_rejected = counts.cancelled + counts.rejected;
        return counts;
    }, [orders]);

    const statusFilters: { key: AdminOrderStatusFilter; label: string; icon: React.ElementType }[] = [
        { key: 'all', label: 'الكل', icon: ClipboardListIcon },
        { key: 'under_implementation', label: 'قيد معالجة', icon: ClockIcon },
        { key: 'prepared', label: 'تم التجهيز', icon: BoxOpenIcon },
        { key: 'shipped', label: 'جاري التوصيل', icon: TruckIcon },
        { key: 'completed', label: 'تم التسليم', icon: CheckCircleIcon },
        { key: 'partially_delivered', label: 'واصل جزئي', icon: CheckCircleIcon }, // New
        { key: 'postponed', label: 'مؤجل', icon: ClockIcon },
        { key: 'cancelled_rejected', label: 'ملغي / راجع', icon: XCircleIcon },
    ];

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedOrderIds([]);
    };

    const handleToggleSelect = (id: string) => {
        setSelectedOrderIds(prev => 
            prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o.id));
        }
    };

    const handleBulkUpdate = () => {
        if (!bulkStatus || selectedOrderIds.length === 0) return;
        
        if (window.confirm(`هل أنت متأكد من تغيير حالة ${selectedOrderIds.length} طلب إلى ${bulkStatus}؟`)) {
            selectedOrderIds.forEach(id => {
                onUpdateOrderStatus(id, bulkStatus);
            });
            addNotification(`تم تحديث ${selectedOrderIds.length} طلب بنجاح`);
            setSelectedOrderIds([]);
            setBulkStatus('');
            setIsSelectionMode(false);
        }
    };

    return (
        <div className="dark:bg-slate-900 pb-32 h-full flex flex-col relative">
            {orderToEdit && (
                <EditOrderModal 
                    order={orderToEdit}
                    onClose={() => setOrderToEdit(null)}
                    onSave={onAdminUpdateOrder}
                />
            )}

            {/* STICKY HEADER SECTION */}
            <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
                {/* Top Bar: Search & Selection Toggle */}
                <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                    <div className="flex-grow">
                        <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            placeholder="بحث برقم الطلب أو الهاتف..."
                        />
                    </div>
                    <button 
                        onClick={toggleSelectionMode}
                        className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                            isSelectionMode 
                            ? 'bg-primary text-white shadow-primary/30 ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-900' 
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                        }`}
                        title={isSelectionMode ? 'إلغاء التحديد' : 'تحديد متعدد'}
                    >
                        {isSelectionMode ? <XCircleIcon className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
                    </button>
                </div>

                {/* Selection Info Bar (Conditional) */}
                {isSelectionMode && (
                    <div className="px-4 mb-2 flex items-center justify-between bg-primary/5 py-2 mx-4 rounded-lg border border-primary/10 animate-fade-in">
                        <span className="text-xs font-bold text-primary">تم تحديد {selectedOrderIds.length} طلب</span>
                        <button onClick={handleSelectAll} className="text-xs font-bold text-primary underline">
                            {selectedOrderIds.length === filteredOrders.length ? 'إلغاء الكل' : 'تحديد الكل'}
                        </button>
                    </div>
                )}

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

            {/* Orders List */}
            <div className="pt-4 px-4 space-y-3 pb-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <AdminOrderCard
                            key={order.id}
                            order={order}
                            onOrderClick={onAdminOrderClick}
                            addNotification={addNotification}
                            isSelected={selectedOrderIds.includes(order.id)}
                            onToggleSelect={handleToggleSelect}
                            isSelectionMode={isSelectionMode}
                            onUpdateStatus={onUpdateOrderStatus}
                            onEditOrder={setOrderToEdit}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 py-12">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <BoxOpenIcon className="w-10 h-10 opacity-50" />
                        </div>
                        <p className="font-bold text-lg mb-1">لا توجد طلبات</p>
                        <p className="text-xs">لم يتم العثور على طلبات في هذا القسم.</p>
                    </div>
                )}
            </div>

            {/* Bulk Action Bar (Fixed Bottom) */}
            {isSelectionMode && selectedOrderIds.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-[0_-4px_30px_rgba(0,0,0,0.1)] border-t border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up pb-8">
                    <div className="flex items-center gap-3 max-w-lg mx-auto">
                        <div className="relative flex-grow">
                            <select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value as Order['status'])}
                                className="w-full p-3.5 pl-4 pr-10 border border-gray-200 dark:border-gray-600 rounded-xl text-right bg-white dark:bg-gray-700 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
                            >
                                <option value="">تغيير الحالة إلى...</option>
                                <option value="under_implementation">قيد المعالجة</option>
                                <option value="prepared">تم التجهيز</option>
                                <option value="shipped">جاري التوصيل</option>
                                <option value="completed">تم التسليم</option>
                                <option value="partially_delivered">واصل جزئي</option>
                                <option value="postponed">مؤجل</option>
                                <option value="cancelled">إلغاء</option>
                                <option value="rejected">رفض</option>
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                        <button
                            onClick={handleBulkUpdate}
                            disabled={!bulkStatus}
                            className="bg-primary text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/20 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:shadow-none transition-all flex items-center gap-2"
                        >
                            <CheckIcon className="w-4 h-4" />
                            <span>تحديث</span>
                        </button>
                    </div>
                </div>
            )}

            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    @keyframes slide-up {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                    .animate-slide-up {
                        animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.3s ease-out forwards;
                    }
                    @keyframes fast-fade {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fast-fade {
                        animation: fast-fade 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}
            </style>
        </div>
    );
};

export default AdminOrdersView;
