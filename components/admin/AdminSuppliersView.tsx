import React, { useState, useMemo, useEffect } from 'react';
import { Supplier } from '../../types';
import { HeaderConfig } from '../../App';
import { PlusIcon, SearchIcon, HandshakeIcon, ChevronLeftIcon, XMarkIcon } from '../common/icons';
import SearchBar from '../common/SearchBar';

interface AdminSuppliersViewProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'joined_at'>) => void;
  onSupplierClick: (supplier: Supplier) => void;
  setHeaderConfig: (config: HeaderConfig | null) => void;
}

const AddSupplierModal: React.FC<{
    onClose: () => void;
    onSave: (data: Omit<Supplier, 'id' | 'joined_at'>) => void;
}> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (!name || !email || !password) {
            alert('الاسم، الايميل، وكلمة المرور حقول مطلوبة');
            return;
        }
        onSave({ name, email, phone, password, notes });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-slide-up">
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">إضافة مورد جديد</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
                </div>
                
                <div className="space-y-3">
                    <input type="text" placeholder="اسم المورد / الشركة" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="tel" placeholder="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                    <textarea placeholder="ملاحظات إضافية" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>

                <button onClick={handleSubmit} className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary/90 transition-colors">
                    تسجيل المورد
                </button>
            </div>
        </div>
    );
};

const AdminSuppliersView: React.FC<AdminSuppliersViewProps> = ({ suppliers, onAddSupplier, onSupplierClick, setHeaderConfig }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setHeaderConfig({
            title: 'إدارة الموردين',
            showBack: true,
            onBack: () => setHeaderConfig(null),
        });
        return () => setHeaderConfig(null);
    }, [setHeaderConfig]);

    const filteredSuppliers = useMemo(() => {
        if (!searchQuery.trim()) return suppliers;
        const lcQuery = searchQuery.toLowerCase().trim();
        return suppliers.filter(s => 
            s.name.toLowerCase().includes(lcQuery) || 
            s.email.toLowerCase().includes(lcQuery) ||
            s.phone.includes(lcQuery)
        );
    }, [suppliers, searchQuery]);

    const handleSaveSupplier = (data: Omit<Supplier, 'id' | 'joined_at'>) => {
        onAddSupplier(data);
        setIsModalOpen(false);
    };

    return (
        <div className="dark:bg-slate-900 min-h-full pb-20 relative">
            {isModalOpen && <AddSupplierModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSupplier} />}
            
            <div className="p-4 space-y-4">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="بحث عن مورد..." />
                
                {filteredSuppliers.length > 0 ? (
                    <div className="space-y-3">
                        {filteredSuppliers.map(supplier => (
                            <div 
                                key={supplier.id} 
                                onClick={() => onSupplierClick(supplier)}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:border-primary transition-colors active:scale-98"
                            >
                                <div className="flex items-center gap-1 text-gray-400">
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{supplier.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.phone}</p>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md mt-1 inline-block">
                                        تاريخ الانضمام: {supplier.joined_at}
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 ml-4">
                                    <HandshakeIcon className="w-6 h-6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <HandshakeIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                        <p>لا يوجد موردين حالياً.</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 left-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform active:scale-95 z-20"
                title="إضافة مورد جديد"
            >
                <PlusIcon className="w-7 h-7" />
            </button>
        </div>
    );
};

export default AdminSuppliersView;