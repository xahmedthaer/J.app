import React, { useState } from 'react';
import { loginWithGoogle } from '../../firebaseConfig';

interface AuthPageProps {
    addNotification: (message: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ addNotification }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            await loginWithGoogle();
            addNotification('تم تسجيل الدخول بنجاح!');
        } catch (error: any) {
            setError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-white dark:bg-slate-900 flex flex-col justify-center items-center p-4" dir="rtl">
            <div className="w-full max-w-sm mx-auto text-center">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 font-cairo">مرحباً بك في لوكات بزنس</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-cairo">سجل الدخول باستخدام جوجل للبدء</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 p-8">
                    <button 
                        onClick={handleGoogleLogin} 
                        disabled={loading} 
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-bold py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        ) : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                <span className="font-cairo">المتابعة باستخدام جوجل</span>
                            </>
                        )}
                    </button>

                    {error && <p className="text-red-500 text-sm mt-4 font-cairo">{error}</p>}
                </div>
                
                <p className="text-gray-500 dark:text-gray-400 mt-8 text-xs font-cairo">
                    من خلال المتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
