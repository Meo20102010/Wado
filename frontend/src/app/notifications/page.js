'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiBell, HiCheck, HiBellAlert } from 'react-icons/hi';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await notificationsAPI.getAll();
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    const handleNewNotification = (e) => {
      setNotifications(prev => [e.detail, ...prev]);
    };
    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Tümü okundu olarak işaretlendi');
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-md">
          <HiBell className="w-16 h-16 mx-auto text-indigo-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-4">Bildirimler</h2>
          <p className="text-gray-400 mb-6">Bildirimlerinizi görmek için giriş yapın.</p>
          <a href="/auth/login" className="btn-primary">Giriş Yap</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Bildirimler</h1>
          <p className="text-gray-400 mt-1">Sistem bildirimleriniz</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="btn-secondary text-sm flex items-center gap-2">
            <HiCheck className="w-4 h-4" /> Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <HiBellAlert className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Bildirim Yok</h3>
            <p className="text-gray-400">Henüz bir bildiriminiz bulunmuyor</p>
          </div>
        ) : notifications.map((notif) => (
          <div key={notif.id} onClick={() => !notif.read && markAsRead(notif.id)}
            className={`glass-card p-4 flex items-start gap-4 cursor-pointer transition-all ${
              !notif.read ? 'border-indigo-500/20 bg-indigo-500/5' : 'opacity-70'
            }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              notif.type === 'message' ? 'bg-emerald-500/20 text-emerald-400' :
              notif.type === 'project' ? 'bg-indigo-500/20 text-indigo-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              <HiBell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString('tr-TR')}</p>
            </div>
            {!notif.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}
