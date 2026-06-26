'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiTrash, HiSearch } from 'react-icons/hi';

export default function AdminChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await adminAPI.getChatMessages({ limit: 200 });
      setMessages(res.data.messages || []);
    } catch (err) {
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.deleteChatMessage(id);
      toast.success('Mesaj silindi');
      fetchMessages();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Sohbet Yönetimi</h1>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Kullanıcı</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Mesaj</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Tarih</th>
                <th className="text-right p-4 text-sm text-gray-400 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">Mesaj bulunamadı</td></tr>
              ) : messages.map((msg) => (
                <tr key={msg.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {msg.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-white">{msg.username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300 max-w-xs truncate">{msg.content}</td>
                  <td className="p-4 text-sm text-gray-400">{new Date(msg.createdAt).toLocaleString('tr-TR')}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(msg.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
