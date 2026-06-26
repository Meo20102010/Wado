'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi';

export default function AdminAdsPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'banner', code: '', position: 'top', active: true });

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchAds();
  }, [user]);

  const fetchAds = async () => {
    try {
      const res = await adminAPI.getAds();
      setAds(res.data.ads || []);
    } catch (err) {
      toast.error('Reklamlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await adminAPI.updateAd(editId, form);
        toast.success('Reklam güncellendi');
      } else {
        await adminAPI.createAd(form);
        toast.success('Reklam eklendi');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', type: 'banner', code: '', position: 'top', active: true });
      fetchAds();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleEdit = (ad) => {
    setForm({ name: ad.name, type: ad.type, code: ad.code, position: ad.position, active: ad.active });
    setEditId(ad.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.deleteAd(id);
      toast.success('Reklam silindi');
      fetchAds();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Reklam Yönetimi</h1>
          <p className="text-gray-400 mt-1 text-sm">Monetag ve diğer reklam kodlarını yönetin</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', type: 'banner', code: '', position: 'top', active: true }); }} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" /> Reklam Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-6 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reklam Adı</label>
              <input type="text" placeholder="Örn: Üst Banner" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tür</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="banner">Banner</option>
                <option value="popup">Popup</option>
                <option value="native">Native</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pozisyon</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field">
                <option value="top">Üst</option>
                <option value="bottom">Alt</option>
                <option value="sidebar">Sidebar</option>
                <option value="between">Arası</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Durum</label>
              <select value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })} className="input-field">
                <option value={true}>Aktif</option>
                <option value={false}>Pasif</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reklam Kodu</label>
            <textarea placeholder="Monetag veya diğer reklam kodunu yapıştırın" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field font-mono text-xs min-h-[100px]" rows={4} required />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editId ? 'Güncelle' : 'Ekle'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
          </div>
        </form>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-4 text-sm text-gray-400 font-medium">Reklam</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">Tür</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">Pozisyon</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">Durum</th>
              <th className="text-right p-4 text-sm text-gray-400 font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Reklam bulunamadı</td></tr>
            ) : ads.map((ad) => (
              <tr key={ad.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="p-4 text-sm text-white font-medium">{ad.name}</td>
                <td className="p-4"><span className="badge badge-primary">{ad.type}</span></td>
                <td className="p-4 text-sm text-gray-400">{ad.position}</td>
                <td className="p-4"><span className={`badge ${ad.active ? 'badge-success' : 'badge-warning'}`}>{ad.active ? 'Aktif' : 'Pasif'}</span></td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(ad)} className="text-indigo-400 hover:text-indigo-300 transition-colors p-1"><HiPencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(ad.id)} className="text-red-400 hover:text-red-300 transition-colors p-1"><HiTrash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
