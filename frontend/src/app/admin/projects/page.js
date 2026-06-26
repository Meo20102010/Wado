'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, projectsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { HiTrash, HiPencil, HiPlus, HiEye } from 'react-icons/hi';

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await projectsAPI.getAll({ limit: 100 });
      setProjects(res.data.projects || []);
    } catch (err) {
      toast.error('Projeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Proje silindi');
      fetchProjects();
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Proje Yönetimi</h1>
        <Link href="/projects/upload" className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" /> Proje Ekle
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Proje</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Sahip</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Tür</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Kategori</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">İndirme</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Fiyat</th>
                <th className="text-right p-4 text-sm text-gray-400 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Yükleniyor...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Proje bulunamadı</td></tr>
              ) : projects.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {p.title?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{p.author?.username || 'Bilinmiyor'}</td>
                  <td className="p-4"><span className={`badge ${p.type === 'apk' ? 'badge-primary' : 'badge-success'}`}>{p.type?.toUpperCase()}</span></td>
                  <td className="p-4 text-sm text-gray-400">{p.category}</td>
                  <td className="p-4 text-sm text-gray-400">{p.downloads || 0}</td>
                  <td className="p-4 text-sm text-indigo-400 font-medium">{p.price > 0 ? `${p.price} TL` : 'Ücretsiz'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/projects/${p.id}`} className="text-indigo-400 hover:text-indigo-300 transition-colors p-1">
                        <HiEye className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
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
