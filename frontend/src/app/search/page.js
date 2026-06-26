'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { projectsAPI, usersAPI } from '@/lib/api';
import { HiSearch, HiDownload, HiStar, HiCube, HiUser } from 'react-icons/hi';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!query) return;
    const search = async () => {
      setLoading(true);
      try {
        const [projRes, userRes] = await Promise.all([
          projectsAPI.search({ q: query, limit: 20 }),
          usersAPI.search(query),
        ]);
        setProjects(projRes.data.projects || []);
        setUsers(userRes.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [query]);

  const tabs = [
    { id: 'all', label: 'Tümü' },
    { id: 'projects', label: 'Projeler' },
    { id: 'users', label: 'Kullanıcılar' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Arama Sonuçları</h1>
        {query && <p className="text-gray-400 mt-2">"{query}" için sonuçlar</p>}
      </div>

      {!query ? (
        <div className="glass-card p-12 text-center">
          <HiSearch className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Ne aramıştınız?</h3>
          <p className="text-gray-400">Proje veya kullanıcı adı girin</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'glass-light text-gray-400 hover:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {(activeTab === 'all' || activeTab === 'projects') && projects.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <HiCube className="w-5 h-5 text-indigo-400" /> Projeler ({projects.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(p => (
                      <Link href={`/projects/${p.id}`} key={p.id} className="glass-card p-5 group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">{p.title?.charAt(0)}</div>
                          <div>
                            <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">{p.title}</h3>
                            <span className={`badge ${p.type === 'apk' ? 'badge-primary' : 'badge-success'} text-xs`}>{p.type?.toUpperCase()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{p.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                          <span><HiDownload className="w-3 h-3 inline" /> {p.downloads || 0}</span>
                          <span><HiStar className="w-3 h-3 inline text-amber-400" /> {p.rating || 0}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <HiUser className="w-5 h-5 text-indigo-400" /> Kullanıcılar ({users.length})
                  </h2>
                  <div className="space-y-3">
                    {users.map(u => (
                      <Link href={`/profile/${u.username}`} key={u.id} className="glass-card p-4 flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">{u.username}</h3>
                          <p className="text-sm text-gray-400">{u.bio || 'Henüz biyografi eklenmemiş'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {projects.length === 0 && users.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <HiSearch className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Sonuç Bulunamadı</h3>
                  <p className="text-gray-400">Farklı bir arama terimi deneyin</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[90vh] flex items-center justify-center"><div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
