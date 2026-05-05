import React, { useState } from 'react';
import { 
    loginEmailPassword, 
    registerEmailPassword, 
    loginWithGoogle, 
    resetPassword 
} from '../../firebaseConfig';
import * as firebaseService from '../../services/firebaseService';

interface AuthPageProps {
    addNotification: (message: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ addNotification }) => {
    const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let loginEmail = identifier;
            
            // Check if it's a phone number (simple check: contains only digits or starts with +)
            const isPhone = /^[0-9+]+$/.test(identifier);
            if (isPhone) {
                const userDoc = await firebaseService.getUserByPhone(identifier);
                if (!userDoc) {
                    throw new Error('رقم الهاتف غير مسجل.');
                }
                loginEmail = userDoc.email;
            }

            await loginEmailPassword(loginEmail, password);
            addNotification('تم تسجيل الدخول بنجاح!');
        } catch (error: any) {
            setError(error.message || 'فشل تسجيل الدخول. تأكد من البيانات.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!name || !phone || !email || !password) {
            setError('يرجى ملء جميع الحقول الضرورية.');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Auth User
            const { user } = await registerEmailPassword(email, password);
            
            // 2. Sync to Firestore with additional data
            await firebaseService.syncUserProfile(user, { name, phone });
            
            addNotification('تم إنشاء الحساب بنجاح!');
        } catch (error: any) {
            setError(error.message || 'فشل إنشاء الحساب.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await resetPassword(email);
            addNotification('تم إرسال رابط استعادة كلمة المرور إلى بريدك.');
            setView('login');
        } catch (error: any) {
            setError('فشل إرسال الرابط. تأكد من البريد الإلكتروني.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            addNotification('تم تسجيل الدخول بنجاح!');
        } catch (err) {
            setError('فشل الدخول عبر جوجل.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-white dark:bg-slate-900 flex flex-col justify-center items-center p-4 overflow-y-auto" dir="rtl">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-cairo">لوكات بزنس</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-cairo">
                        {view === 'login' ? 'سجل دخولك للمتابعة' : view === 'signup' ? 'إنشاء حساب جديد' : 'استعادة كلمة المرور'}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border dark:border-gray-700 p-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4 text-center font-cairo">
                            {error}
                        </div>
                    )}

                    {view === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <InputField 
                                label="البريد الإلكتروني أو رقم الهاتف" 
                                type="text" 
                                value={identifier} 
                                onChange={setIdentifier} 
                                placeholder="example@mail.com أو 07XXXXXXXX"
                            />
                            <InputField 
                                label="كلمة المرور" 
                                type="password" 
                                value={password} 
                                onChange={setPassword} 
                            />
                            <div className="text-left">
                                <button type="button" onClick={() => setView('forgot')} className="text-sm text-primary hover:underline font-cairo">نسيت كلمة المرور؟</button>
                            </div>
                            <SubmitButton loading={loading} text="تسجيل الدخول" />
                        </form>
                    )}

                    {view === 'signup' && (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <InputField label="الاسم الكامل" type="text" value={name} onChange={setName} required />
                            <InputField label="رقم الهاتف" type="tel" value={phone} onChange={setPhone} required placeholder="07XXXXXXXX" />
                            <InputField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} required />
                            <InputField label="كلمة المرور" type="password" value={password} onChange={setPassword} required />
                            <SubmitButton loading={loading} text="إنشاء حساب" />
                        </form>
                    )}

                    {view === 'forgot' && (
                        <form onSubmit={handleReset} className="space-y-4">
                            <InputField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} required />
                            <SubmitButton loading={loading} text="إرسال الرابط" />
                            <button type="button" onClick={() => setView('login')} className="w-full text-sm text-gray-500 font-cairo">العودة لتسجيل الدخول</button>
                        </form>
                    )}

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-800 px-2 text-gray-500 font-cairo">أو</span></div>
                    </div>

                    <button 
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-cairo"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        <span>المتابعة باستخدام جوجل</span>
                    </button>
                </div>

                <div className="text-center mt-6">
                    {view === 'login' ? (
                        <p className="text-gray-600 dark:text-gray-400 font-cairo">
                            ليس لديك حساب؟ <button onClick={() => setView('signup')} className="text-primary font-bold hover:underline">سجل الآن</button>
                        </p>
                    ) : (
                        view !== 'forgot' && (
                            <p className="text-gray-600 dark:text-gray-400 font-cairo">
                                لديك حساب بالفعل؟ <button onClick={() => setView('login')} className="text-primary font-bold hover:underline">سجل دخولك</button>
                            </p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, type: string, value: string, onChange: (v: string) => void, required?: boolean, placeholder?: string }> = ({ label, type, value, onChange, required, placeholder }) => (
    <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 font-cairo px-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            required={required}
            placeholder={placeholder}
            className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none dark:text-white font-cairo text-right"
        />
    </div>
);

const SubmitButton: React.FC<{ loading: boolean, text: string }> = ({ loading, text }) => (
    <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:bg-gray-400 font-cairo"
    >
        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div> : text}
    </button>
);

export default AuthPage;
