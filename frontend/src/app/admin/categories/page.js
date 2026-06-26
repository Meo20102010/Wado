'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi';

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await adminAPI.updateCategory(editId, form);
        toast.success('Kategori güncellendi');
      } else {
        await adminAPI.createCategory(form);
        toast.success('Kategori eklendi');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', slug: '', description: '' });
      fetchCategories();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success('Kategori silindi');
      fetchCategories();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Kategori Yönetimi</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', slug: '', description: '' }); }} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" /> Kategori Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-6 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Kategori Adı</label>
              <input type="text" placeholder="Örn: Android Uygulamaları" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
              <input type="text" placeholder="android-uygulamalari" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Açıklama</label>
            <textarea placeholder="Kategori açıklaması" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
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
              <th className="text-left p-4 text-sm text-gray-400 font-medium">Kategori</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">Slug</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">Açıklama</th>
              <th className="text-right p-4 text-sm text-gray-400 font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Kategori bulunamadı</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="p-4 text-sm text-white font-medium">{cat.name}</td>
                <td className="p-4 text-sm text-gray-400">{cat.slug}</td>
                <td className="p-4 text-sm text-gray-400">{cat.description || '-'}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(cat)} className="text-indigo-400 hover:text-indigo-300 transition-colors p-1"><HiPencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-300 transition-colors p-1"><HiTrash className="w-4 h-4" /></button>
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
