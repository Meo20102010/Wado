'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiShieldCheck, HiTrash, HiBan, HiSearch, HiShieldExclamation } from 'react-icons/hi';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ search });
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId) => {
    try {
      await adminAPI.banUser(userId);
      toast.success('Kullanıcı yasaklandı');
      fetchUsers();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await adminAPI.unbanUser(userId);
      toast.success('Kullanıcı yasağı kaldırıldı');
      fetchUsers();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('Kullanıcı silindi');
      fetchUsers();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Kullanıcı Yönetimi</h1>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Kullanıcı ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} />
        </div>
        <button onClick={fetchUsers} className="btn-primary">Ara</button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Kullanıcı</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">E-posta</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Rol</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Durum</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Kayıt</th>
                <th className="text-right p-4 text-sm text-gray-400 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Kullanıcı bulunamadı</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${u.banned ? 'badge-danger' : 'badge-success'}`}>
                      {u.banned ? 'Yasaklı' : 'Aktif'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.banned ? (
                        <button onClick={() => handleUnban(u.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors p-1" title="Yasağı kaldır">
                          <HiShieldCheck className="w-5 h-5" />
                        </button>
                      ) : (
                        <button onClick={() => handleBan(u.id)} className="text-amber-400 hover:text-amber-300 transition-colors p-1" title="Yasakla">
                          <HiBan className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300 transition-colors p-1" title="Sil">
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
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
