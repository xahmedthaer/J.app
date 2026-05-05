import React, { useState } from 'react';
import { Send, Bell, Info } from 'lucide-react';
import { CheckCircleIcon, XMarkIcon } from '../common/icons';

interface AdminBroadcastViewProps {
  onSend: (title: string, message: string) => Promise<void>;
}

const AdminBroadcastView: React.FC<AdminBroadcastViewProps> = ({ onSend }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<{ 
    initialized: boolean, 
    projectId: string | null, 
    configProjectId: string | null, 
    envVariableExists: boolean,
    parseError: string | null,
    error: string | null 
  } | null>(null);

  React.useEffect(() => {
    fetch('/api/admin/firebase-status')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server error: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then(data => setFirebaseStatus(data))
      .catch(err => {
        console.error("Error fetching firebase status:", err);
        setFirebaseStatus({ 
          initialized: false, 
          projectId: null, 
          configProjectId: null, 
          envVariableExists: false, 
          parseError: err.message, 
          error: "Load failed" 
        });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    if (!firebaseStatus?.initialized) {
      alert("لا يمكن الإرسال: Firebase Admin غير مهيأ. يرجى إضافة Service Account.");
      return;
    }
    
    setIsSending(true);
    try {
      await onSend(title, message);
      setTitle('');
      setMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold dark:text-white">إرسال إشعار عام</h2>
            <div className="flex flex-col gap-1 mt-1">
              {firebaseStatus?.initialized ? (
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold w-fit">
                    <CheckCircleIcon className="w-3 h-3" />
                    متصل بـ Firebase Admin
                  </span>
                  <div className="text-[10px] text-gray-500 flex gap-2">
                    <span>Project (Service Account): <span className="font-mono text-blue-600">{firebaseStatus.projectId}</span></span>
                    <span>Project (Config): <span className="font-mono text-blue-600">{firebaseStatus.configProjectId}</span></span>
                  </div>
                  {firebaseStatus.projectId !== firebaseStatus.configProjectId && (
                    <span className="text-[10px] text-red-600 font-bold">⚠️ تنبيه: معرف المشروع غير متطابق! قد لا تعمل الإشعارات.</span>
                  )}
                </div>
              ) : (
                <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold w-fit">
                  <XMarkIcon className="w-3 h-3" />
                  غير متصل (يجب إضافة Service Account)
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">سيتم إرسال هذا الإشعار لجميع المستخدمين الذين ثبتوا التطبيق ووافقوا على الإشعارات.</p>
          </div>
        </div>

        {(!firebaseStatus?.initialized || firebaseStatus?.error) && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl p-4 mb-6">
            <h3 className="text-red-700 dark:text-red-400 font-bold text-sm mb-2">إعدادات الإشعارات غير مكتملة</h3>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
              محاولة التهيئة باستخدام ملف <code>firebase-service-account.json</code> فشلت أو الملف غير موجود.
            </p>
            
            {firebaseStatus?.parseError && (
              <div className="mt-3 p-2 bg-red-100 dark:bg-red-800/40 rounded border border-red-200 dark:border-red-700">
                <p className="text-[10px] font-mono text-red-800 dark:text-red-300">Error: {firebaseStatus.parseError}</p>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                تأكد من وجود ملف <code>firebase-service-account.json</code> في المجلد الرئيسي للتطبيق وبداخله بيانات Service Account صحيحة من Firebase.
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            ملاحظة: الإشعارات تعمل بشكل أفضل عند تثبيت التطبيق على الشاشة الرئيسية (PWA). في أجهزة iPhone، يتطلب ذلك إصدار iOS 16.4 أو أحدث.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان الإشعار</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: وصل حديثاً!"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">محتوى الرسالة</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب تفاصيل الإعلان هنا..."
              rows={4}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(title || "تجربة إشعار", { body: message || "هذا إشعار تجريبي من المتصفح" });
                } else {
                  alert("إذن الإشعارات غير مفعل في متصفحك أو غير مدعوم.");
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              تجربة محلية
            </button>
            <button
              type="submit"
              disabled={isSending || !title || !message || !firebaseStatus?.initialized}
              className="flex-[2] flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              إرسال عام للهواتف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBroadcastView;
