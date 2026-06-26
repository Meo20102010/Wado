'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiDownload, HiUsers, HiCube, HiTrendingUp, HiArrowRight, HiStar, HiEye } from 'react-icons/hi';
import { projectsAPI } from '@/lib/api';
import AdSense from '@/components/AdSense';

export default function HomePage() {
  const [stats, setStats] = useState({ projects: 0, users: 0, downloads: 0, sales: 0 });
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [latestProjects, setLatestProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes] = await Promise.all([
          projectsAPI.getAll({ featured: true, limit: 3 }),
          projectsAPI.getAll({ limit: 6 }),
        ]);
        setFeaturedProjects(featuredRes.data.projects || []);
        setLatestProjects(latestRes.data.projects || []);
        if (featuredRes.data.stats) setStats(featuredRes.data.stats);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { icon: HiCube, value: stats.projects || '0', label: 'Toplam Proje', color: 'from-indigo-500 to-purple-600' },
    { icon: HiUsers, value: stats.users || '0', label: 'Toplam Kullanıcı', color: 'from-emerald-500 to-teal-600' },
    { icon: HiDownload, value: stats.downloads || '0', label: 'İndirme Sayısı', color: 'from-cyan-500 to-blue-600' },
    { icon: HiTrendingUp, value: stats.sales || '0', label: 'Satış Sayısı', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div>
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-sm text-gray-300 animate-fade-in">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Platform çevrim içi
          </div>
          <div className="animate-float mb-6">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-5xl mb-6 neon-glow">
              W
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight">
            <span className="neon-text">Wado</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-4 font-light">
            APK, EXE ve Yazılım Dünyası
          </p>
          <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
            Yazılımlarını Dünyaya Aç. Projelerini paylaş, keşfet ve indir.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/projects" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Projeleri Keşfet <HiArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/register" className="btn-secondary text-lg px-8 py-3">
              Hemen Katıl
            </Link>
          </div>
        </div>
      </section>

      <AdSense position="home_top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <h2 className="section-title">Öne Çıkan Projeler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project, i) => (
              <Link href={`/projects/${project.id}`} key={project.id}
                className="glass-card p-6 animate-slide-up group"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                    {project.title.charAt(0)}
                  </div>
                  <span className={`badge ${project.type === 'apk' ? 'badge-primary' : 'badge-success'}`}>
                    {project.type?.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1"><HiDownload className="w-4 h-4" /> {project.downloads || 0}</span>
                  <span className="flex items-center gap-1"><HiStar className="w-4 h-4 text-amber-400" /> {project.rating || 0}</span>
                  {project.price > 0 && <span className="text-indigo-400 font-semibold">{project.price} TL</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Son Eklenen Projeler</h2>
          <Link href="/projects" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors">
            Tümünü Gör <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestProjects.map((project, i) => (
            <Link href={`/projects/${project.id}`} key={project.id}
              className="glass-card p-6 animate-slide-up group"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                  {project.title?.charAt(0)}
                </div>
                <span className={`badge ${project.type === 'apk' ? 'badge-primary' : 'badge-success'}`}>
                  {project.type?.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1"><HiDownload className="w-4 h-4" /> {project.downloads || 0}</span>
                <span className="flex items-center gap-1"><HiStar className="w-4 h-4 text-amber-400" /> {project.rating || 0}</span>
                {project.price > 0 && <span className="text-indigo-400 font-semibold">{project.price} TL</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <AdSense position="home_mid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-20">
        <div className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Hemen Başla</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Wado'ya katılın, projelerinizi paylaşın ve yazılım dünyasında yerinizi alın.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-3">Hesap Oluştur</Link>
            <Link href="/projects/upload" className="btn-secondary text-lg px-8 py-3">Proje Yükle</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
