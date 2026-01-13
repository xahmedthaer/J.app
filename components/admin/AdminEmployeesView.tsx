import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../types';
import { HeaderConfig } from '../../App';
import { PlusIcon, SearchIcon, XMarkIcon, EditIcon, TrashIcon, CheckIcon, CheckCircleIcon } from '../common/icons';
import SearchBar from '../common/SearchBar';

interface AdminEmployeesViewProps {
  employees: User[];
  onAddEmployee: (employee: Omit<User, 'id' | 'is_admin' | 'registration_date'>) => void;
  onUpdateEmployee: (employee: User) => void;
  onDeleteEmployee: (employeeId: string) => void;
  setHeaderConfig: (config: HeaderConfig | null) => void;
}

const AVAILABLE_PERMISSIONS = [
    { key: 'overview', label: 'الملخص والإحصائيات' },
    { key: 'products', label: 'المنتجات' },
    { key: 'orders', label: 'الطلبات' },
    { key: 'users', label: 'المستخدمين' },
    { key: 'suppliers', label: 'الموردين' },
    { key: 'withdrawals', label: 'السحوبات' },
    { key: 'tickets', label: 'التذاكر' },
    { key: 'notifications', label: 'إرسال إشعار' },
    { key: 'coupons', label: 'الكوبونات' },
    { key: 'settings', label: 'إعدادات المتجر' },
];

const EmployeeFormModal: React.FC<{
    employeeToEdit?: User | null;
    onClose: () => void;
    onSave: (data: Omit<User, 'id' | 'is_admin' | 'registration_date'> & { id?: string }) => void;
}> = ({ employeeToEdit, onClose, onSave }) => {
    const [name, setName] = useState(employeeToEdit?.name || '');
    const [email, setEmail] = useState(employeeToEdit?.email || '');
    const [phone, setPhone] = useState(employeeToEdit?.phone || '');
    // In a real app, password handling would be more secure
    const [password, setPassword] = useState(''); 
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(employeeToEdit?.permissions || []);

    const togglePermission = (key: string) => {
        setSelectedPermissions(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleSelectAll = () => {
        if (selectedPermissions.length === AVAILABLE_PERMISSIONS.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.key));
        }
    };

    const handleSubmit = () => {
        if (!name || !email) {
            alert('الاسم والبريد الإلكتروني مطلوبان');
            return;
        }
        
        const employeeData: any = {
            name,
            email,
            phone,
            permissions: selectedPermissions,
        };

        if (employeeToEdit) {
            employeeData.id = employeeToEdit.id;
            employeeData.is_admin = true;
            employeeData.registration_date = employeeToEdit.registration_date;
        }

        onSave(employeeData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
                    <h2 className="text-xl font-bold dark:text-gray-100">{employeeToEdit ? 'تعديل موظف' : 'إضافة موظف جديد'}</h2>
                </div>
                
                <div className="p-5 overflow-y-auto space-y-4 flex-grow">
                    <div className="space-y-3">
                        <label className="block text-right text-sm font-bold text-gray-700 dark:text-gray-300">البيانات الأساسية</label>
                        <input type="text" placeholder="الاسم الكامل" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white" />
                        <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white" />
                        <input type="tel" placeholder="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white" />
                        {!employeeToEdit && (
                            <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border dark:border-gray-600 rounded-xl text-right bg-gray-50 dark:bg-gray-700 dark:text-white" />
                        )}
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <button onClick={handleSelectAll} className="text-xs text-primary font-bold">
                                {selectedPermissions.length === AVAILABLE_PERMISSIONS.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                            </button>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">الصلاحيات (الأقسام المسموحة)</label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {AVAILABLE_PERMISSIONS.map((perm) => (
                                <div 
                                    key={perm.key} 
                                    onClick={() => togglePermission(perm.key)}
                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedPermissions.includes(perm.key) ? 'border-primary bg-primary/5 dark:bg-primary/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPermissions.includes(perm.key) ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-500'}`}>
                                        {selectedPermissions.includes(perm.key) && <CheckIcon className="w-3 h-3" />}
                                    </div>
                                    <span className={`text-sm font-bold ${selectedPermissions.includes(perm.key) ? 'text-primary dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{perm.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t dark:border-gray-700">
                    <button onClick={handleSubmit} className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary/90 transition-colors">
                        حفظ البيانات
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminEmployeesView: React.FC<AdminEmployeesViewProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee, setHeaderConfig }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<User | null>(null);

    useEffect(() => {
        setHeaderConfig({
            title: 'إدارة الموظفين',
            showBack: true,
            onBack: () => setHeaderConfig(null),
        });
        return () => setHeaderConfig(null);
    }, [setHeaderConfig]);

    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return employees;
        const lcQuery = searchQuery.toLowerCase().trim();
        return employees.filter(e => 
            e.name.toLowerCase().includes(lcQuery) || 
            e.email.toLowerCase().includes(lcQuery)
        );
    }, [employees, searchQuery]);

    const handleSave = (data: any) => {
        if (data.id) {
            onUpdateEmployee(data);
        } else {
            onAddEmployee(data);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (emp: User) => {
        setEmployeeToEdit(emp);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            onDeleteEmployee(id);
        }
    };

    return (
        <div className="dark:bg-slate-900 pb-20 relative h-full">
            {isModalOpen && (
                <EmployeeFormModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                    employeeToEdit={employeeToEdit} 
                />
            )}

            <div className="p-4 space-y-4">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="بحث عن موظف..." />

                {filteredEmployees.length > 0 ? (
                    <div className="space-y-3">
                        {filteredEmployees.map(emp => (
                            <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(emp)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(emp.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{emp.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{emp.email}</p>
                                        <div className="mt-2 flex flex-wrap justify-end gap-1">
                                            {emp.permissions && emp.permissions.length > 0 ? (
                                                emp.permissions.slice(0, 3).map(p => {
                                                    const label = AVAILABLE_PERMISSIONS.find(ap => ap.key === p)?.label || p;
                                                    return (
                                                        <span key={p} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md border dark:border-gray-600">
                                                            {label}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-xs text-red-500">لا توجد صلاحيات</span>
                                            )}
                                            {emp.permissions && emp.permissions.length > 3 && (
                                                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md border dark:border-gray-600">
                                                    +{emp.permissions.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>لا يوجد موظفين حالياً.</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => { setEmployeeToEdit(null); setIsModalOpen(true); }}
                className="fixed bottom-6 left-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform active:scale-95 z-20"
                title="إضافة موظف"
            >
                <PlusIcon className="w-7 h-7" />
            </button>
        </div>
    );
};

export default AdminEmployeesView;