'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash, HiDocumentText } from 'react-icons/hi';

export default function AdminFilesPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', content: '', content_type: 'text/plain' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    try {
      const res = await adminAPI.getRootFiles();
      setFiles(res.data.files);
    } catch (err) {
      toast.error('Dosyalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createRootFile(form);
      toast.success('Dosya kaydedildi');
      setShowForm(false);
      setForm({ name: '', content: '', content_type: 'text/plain' });
      fetchFiles();
    } catch (err) {
      toast.error('Dosya kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.deleteRootFile(id);
      toast.success('Dosya silindi');
      fetchFiles();
    } catch (err) {
      toast.error('Dosya silinemedi');
    }
  };

  if (!user || user.role !== 'admin') return null;

  const presetFiles = [
    { name: 'sw.js', label: 'Service Worker', contentType: 'application/javascript', hint: 'PWA için service worker dosyası' },
    { name: 'ads.txt', label: 'ads.txt', contentType: 'text/plain', hint: 'Reklam doğrulama dosyası' },
    { name: 'monetag-verification.txt', label: 'Monetag Doğrulama', contentType: 'text/plain', hint: 'Monetag site doğrulama dosyası' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Site Dosyaları</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" /> Yeni Dosya
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-white">Yeni Dosya Ekle</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dosya Adı</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="sw.js" className="input-field" required />
              <p className="text-xs text-gray-500 mt-1">Sadece dosya adı (örn: sw.js, ads.txt)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">İçerik Türü</label>
              <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })} className="input-field">
                <option value="text/plain">text/plain</option>
                <option value="application/javascript">application/javascript</option>
                <option value="text/html">text/html</option>
                <option value="text/css">text/css</option>
                <option value="application/json">application/json</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">İçerik</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field font-mono text-sm" rows={10} required />
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiPlus className="w-5 h-5" />}
            Kaydet
          </button>
        </form>
      )}

      {!showForm && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Hızlı Ekle</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presetFiles.map((preset) => (
              <button key={preset.name} onClick={() => { setForm({ name: preset.name, content: '', content_type: preset.contentType }); setShowForm(true); }} className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-indigo-500/50 text-left transition-all">
                <HiDocumentText className="w-8 h-8 text-indigo-400 mb-2" />
                <p className="text-white font-medium">{preset.label}</p>
                <p className="text-xs text-gray-400 mt-1">{preset.hint}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Mevcut Dosyalar</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Henüz dosya eklenmemiş</p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
                <div>
                  <p className="text-white font-medium">/{file.name}</p>
                  <p className="text-xs text-gray-400">{file.content_type} &middot; {(file.content.length / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setForm({ name: file.name, content: file.content, content_type: file.content_type }); setShowForm(true); }} className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-all">Düzenle</button>
                  <button onClick={() => handleDelete(file.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"><HiTrash className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
