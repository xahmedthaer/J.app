import React, { useState } from 'react';
import { Send, Bell, Info } from 'lucide-react';

interface AdminBroadcastViewProps {
  onSend: (title: string, message: string) => Promise<void>;
}

const AdminBroadcastView: React.FC<AdminBroadcastViewProps> = ({ onSend }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
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
            <p className="text-sm text-gray-500">سيتم إرسال هذا الإشعار لجميع المستخدمين الذين ثبتوا التطبيق ووافقوا على الإشعارات.</p>
          </div>
        </div>

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
              disabled={isSending || !title || !message}
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
