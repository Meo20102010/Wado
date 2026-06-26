'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiDownload, HiStar, HiFilter, HiPlus, HiSearch } from 'react-icons/hi';
import { projectsAPI } from '@/lib/api';

const categories = [
  { id: 'all', label: 'Tümü' },
  { id: 'android', label: 'Android' },
  { id: 'windows', label: 'Windows' },
  { id: 'games', label: 'Oyunlar' },
  { id: 'tools', label: 'Araçlar' },
  { id: 'education', label: 'Eğitim' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = { sort, limit: 20 };
        if (category !== 'all') params.category = category;
        if (search) params.search = search;
        const res = await projectsAPI.getAll(params);
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = { sort, limit: 20 };
    if (category !== 'all') params.category = category;
    if (search) params.search = search;
    projectsAPI.getAll(params).then(res => setProjects(res.data.projects || [])).catch(console.error);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projeler</h1>
          <p className="text-gray-400 mt-1">Keşfedilecek yazılımlar</p>
        </div>
        <Link href="/projects/upload" className="btn-primary flex items-center gap-2">
          <HiPlus className="w-5 h-5" /> Proje Yükle
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Proje ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
        </form>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-auto">
          <option value="newest">En Yeni</option>
          <option value="popular">En Popüler</option>
          <option value="rating">En Yüksek Puan</option>
          <option value="downloads">En Çok İndirilen</option>
        </select>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              category === cat.id
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'glass-light text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 text-3xl">?</div>
          <h3 className="text-xl font-semibold text-white mb-2">Henüz Proje Bulunmuyor</h3>
          <p className="text-gray-400 mb-6">İlk projeyi siz ekleyin!</p>
          <Link href="/projects/upload" className="btn-primary">Proje Yükle</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="glass-card p-6 group">
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
      )}
    </div>
  );
}
