import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

interface AuthPageProps {
    addNotification: (message: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ addNotification }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (isLoginView) {
            // Handle Login
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) {
                setError(signInError.message === 'Invalid login credentials' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'حدث خطأ غير متوقع.');
            } else {
                addNotification('تم تسجيل الدخول بنجاح!');
            }
        } else {
            // Handle Sign Up
            if (password !== confirmPassword) {
                setError('كلمتا المرور غير متطابقتين.');
                setLoading(false);
                return;
            }
            if (name.length < 3) {
                 setError('يجب أن يتكون الاسم من 3 أحرف على الأقل.');
                 setLoading(false);
                 return;
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    }
                }
            });

            if (signUpError) {
                if (signUpError.message.includes("User already registered")) {
                    setError("هذا البريد الإلكتروني مسجل بالفعل.");
                } else {
                    setError(signUpError.message);
                }
            } else if (data.user?.identities?.length === 0) {
                 setError('هذا البريد الإلكتروني مستخدم بالفعل. حاول تسجيل الدخول.');
            } else {
                addNotification('تم إنشاء الحساب بنجاح. يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب.');
                setIsLoginView(true); // Switch to login view after successful signup
            }
        }
        setLoading(false);
    };

    return (
        <div className="h-full bg-white dark:bg-slate-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">مرحباً بك في إلك</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">{isLoginView ? 'سجل الدخول للمتابعة' : 'أنشئ حساباً جديداً'}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 p-6">
                    <form onSubmit={handleAuthAction} className="space-y-4">
                        {!isLoginView && (
                             <input
                                type="text"
                                placeholder="الاسم الكامل"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                            />
                        )}
                        <input
                            type="email"
                            placeholder="البريد الإلكتروني"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                        />
                        <input
                            type="password"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                        />
                        {!isLoginView && (
                            <input
                                type="password"
                                placeholder="تأكيد كلمة المرور"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white"
                            />
                        )}

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        
                        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 flex justify-center items-center">
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : (
                                isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب'
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="text-center mt-6">
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-primary font-semibold hover:underline">
                        {isLoginView ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;