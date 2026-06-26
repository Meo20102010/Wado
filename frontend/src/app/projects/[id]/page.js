'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { projectsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiStar, HiEye, HiTag, HiCalendar, HiArrowLeft } from 'react-icons/hi';
import { FaInstagram, FaWhatsapp, FaTiktok } from 'react-icons/fa';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const contactInfo = {
    whatsapp: '905010287780',
    instagram: 'Wado.0',
    tiktok: 'wado.o0',
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await projectsAPI.getOne(id);
        setProject(res.data.project);
      } catch (err) {
        toast.error('Proje bulunamadı');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Yorum yapmak için giriş yapın'); return; }
    try {
      const res = await projectsAPI.addComment(id, { content: comment });
      setProject(prev => ({ ...prev, comments: [...(prev.comments || []), res.data.comment] }));
      setComment('');
      toast.success('Yorum eklendi');
    } catch (err) {
      toast.error('Yorum eklenirken hata oluştu');
    }
  };

  const handleRate = async (value) => {
    if (!user) { toast.error('Puanlamak için giriş yapın'); return; }
    try {
      const res = await projectsAPI.rate(id, { rating: value });
      setProject(prev => ({ ...prev, rating: res.data.rating, userRating: value }));
      setRating(value);
      toast.success('Puanlandı');
    } catch (err) {
      toast.error('Puanlama yapılırken hata oluştu');
    }
  };

  if (loading) {
    return <div className="min-h-[90vh] flex items-center justify-center"><div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  if (!project) {
    return <div className="min-h-[90vh] flex items-center justify-center"><p className="text-gray-400">Proje bulunamadı</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/projects" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <HiArrowLeft className="w-4 h-4" /> Projelere Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                  {project.title?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{project.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span className={`badge ${project.type === 'apk' ? 'badge-primary' : 'badge-success'}`}>{project.type?.toUpperCase()}</span>
                    <span className="flex items-center gap-1"><HiCalendar className="w-4 h-4" /> {new Date(project.createdAt).toLocaleDateString('tr-TR')}</span>
                    <span className="flex items-center gap-1"><HiEye className="w-4 h-4" /> {project.views || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6">
              {project.price > 0 && (
                <button onClick={() => setShowContact(!showContact)} className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
                  <HiTag className="w-6 h-6" /> {project.price} TL - Satın Al
                </button>
              )}
              <div className="flex items-center gap-1 ml-auto">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => handleRate(star)} className={`transition-colors ${star <= (project.userRating || project.rating || 0) ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400/50'}`}>
                    <HiStar className="w-6 h-6" />
                  </button>
                ))}
                <span className="text-sm text-gray-400 ml-2">({project.rating ? project.rating.toFixed(1) : '0'})</span>
              </div>
            </div>

            {showContact && (
              <div className="glass p-8 rounded-xl mb-6 animate-slide-up">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Bana Ulaşın</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all group">
                    <FaWhatsapp className="w-10 h-10 text-green-500" />
                    <span className="text-green-400 font-semibold text-lg">WhatsApp</span>
                    <span className="text-green-300/70 text-sm">0501 028 77 80</span>
                  </a>
                  <a href={`https://instagram.com/${contactInfo.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 hover:border-pink-500/40 transition-all group">
                    <FaInstagram className="w-10 h-10 text-pink-500" />
                    <span className="text-pink-400 font-semibold text-lg">Instagram</span>
                    <span className="text-pink-300/70 text-sm">@Wado.0</span>
                  </a>
                  <a href={`https://tiktok.com/@${contactInfo.tiktok}`} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 hover:border-gray-500/40 transition-all group">
                    <FaTiktok className="w-10 h-10 text-white" />
                    <span className="text-white font-semibold text-lg">TikTok</span>
                    <span className="text-gray-400 text-sm">@wado.o0</span>
                  </a>
                </div>
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-white mb-3">Açıklama</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>

            {project.screenshots?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Ekran Görüntüleri</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.screenshots.map((ss, i) => (
                    <img key={i} src={ss} alt={`Screenshot ${i + 1}`} className="rounded-xl w-full h-40 object-cover border border-white/5" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-8 mt-6">
            <h3 className="text-lg font-semibold text-white mb-6">Yorumlar ({project.comments?.length || 0})</h3>
            {user ? (
              <form onSubmit={handleComment} className="flex gap-3 mb-6">
                <input type="text" placeholder="Yorumunuz..." value={comment} onChange={(e) => setComment(e.target.value)} className="input-field flex-1" required />
                <button type="submit" className="btn-primary">Gönder</button>
              </form>
            ) : (
              <p className="text-gray-400 mb-6 text-sm">Yorum yapmak için <Link href="/auth/login" className="text-indigo-400">giriş yapın</Link></p>
            )}
            <div className="space-y-4">
              {project.comments?.map((c, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-white/3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {c.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{c.username}</span>
                      <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <p className="text-sm text-gray-300">{c.content}</p>
                  </div>
                </div>
              ))}
              {(!project.comments || project.comments.length === 0) && (
                <p className="text-gray-500 text-center py-4">Henüz yorum yapılmamış</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Proje Bilgileri</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span>Sürüm</span>
                <span className="text-white">{project.version || '1.0.0'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Dosya Boyutu</span>
                <span className="text-white">{project.fileSize ? `${(project.fileSize / 1024 / 1024).toFixed(1)} MB` : '-'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Kategori</span>
                <span className="text-white">{project.category}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Fiyat</span>
                <span className="text-white">{project.price > 0 ? `${project.price} TL` : 'Ücretsiz'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Görüntülenme</span>
                <span className="text-white">{project.views || 0}</span>
              </div>
            </div>
          </div>

          {project.author && (
            <Link href={`/profile/${project.author.username}`} className="glass-card p-6 flex items-center gap-4 group block">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                {project.author.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium group-hover:text-indigo-400 transition-colors">{project.author.username}</p>
                <p className="text-xs text-gray-400">Proje Sahibi</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
