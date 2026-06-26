'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiUpload, HiPhotograph, HiTag, HiX } from 'react-icons/hi';

export default function UploadProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'apk', category: 'android',
    version: '1.0.0', price: 0, contact: { phone: '', email: '', whatsapp: '', instagram: '' }
  });
  const [file, setFile] = useState(null);
  const [screenshots, setScreenshots] = useState([]);

  if (!user) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Giriş Yapmalısınız</h2>
          <p className="text-gray-400 mb-6">Proje yüklemek için giriş yapın.</p>
          <button onClick={() => router.push('/auth/login')} className="btn-primary">Giriş Yap</button>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Yetkisiz Erişim</h2>
          <p className="text-gray-400 mb-6">Proje ekleme yetkisi yalnızca adminlere aittir.</p>
          <button onClick={() => router.push('/')} className="btn-primary">Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Lütfen bir dosya seçin'); return; }
    setLoading(true);
    try {
      const projectData = { ...form, price: form.price || 0 };
      const res = await projectsAPI.create(projectData);
      const projectId = res.data.project.id;
      await projectsAPI.uploadFile(projectId, file);
      for (const ss of screenshots) {
        await projectsAPI.uploadScreenshot(projectId, ss);
      }
      toast.success('Proje başarıyla yüklendi!');
      router.push(`/projects/${projectId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Proje yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Proje Yükle</h1>
        <p className="text-gray-400 mt-2">Projenizi toplulukla paylaşın</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Proje Adı</label>
            <input type="text" placeholder="Projenizin adı" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tür</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              <option value="apk">APK</option>
              <option value="exe">EXE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              <option value="android">Android Uygulamaları</option>
              <option value="windows">Windows Programları</option>
              <option value="games">Oyunlar</option>
              <option value="tools">Araçlar</option>
              <option value="education">Eğitim Yazılımları</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sürüm</label>
            <input type="text" placeholder="1.0.0" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fiyat (TL, ücretsizse 0)</label>
            <input type="number" min="0" step="0.01" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Açıklama</label>
          <textarea placeholder="Projenizi detaylıca açıklayın..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[120px] resize-y" rows={5} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Proje Dosyası (APK/EXE)</label>
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => document.getElementById('file-input').click()}>
            <HiUpload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-400 text-sm">{file ? file.name : 'Dosya seçmek için tıklayın'}</p>
            <input id="file-input" type="file" accept=".apk,.exe,.zip" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ekran Görüntüleri</label>
          <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => document.getElementById('ss-input').click()}>
            <HiPhotograph className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-400 text-sm">Ekran görüntüsü ekleyin</p>
            <input id="ss-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => setScreenshots([...e.target.files])} />
          </div>
          {screenshots.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {Array.from(screenshots).map((ss, i) => (
                <div key={i} className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  {ss.name}
                  <button type="button" onClick={() => { const newSs = [...screenshots]; newSs.splice(i, 1); setScreenshots(newSs); }}>
                    <HiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">İletişim Bilgileri (Opsiyonel)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="tel" placeholder="Telefon" value={form.contact.phone} onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} className="input-field" />
            <input type="email" placeholder="E-posta" value={form.contact.email} onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} className="input-field" />
            <input type="text" placeholder="WhatsApp (905xxxxxxxxx)" value={form.contact.whatsapp} onChange={(e) => setForm({ ...form, contact: { ...form.contact, whatsapp: e.target.value } })} className="input-field" />
            <input type="text" placeholder="Instagram kullanıcı adı" value={form.contact.instagram} onChange={(e) => setForm({ ...form, contact: { ...form.contact, instagram: e.target.value } })} className="input-field" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><HiUpload className="w-5 h-5" /> Projeyi Yayınla</>}
        </button>
      </form>
    </div>
  );
}
