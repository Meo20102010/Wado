'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { HiMenu, HiX, HiBell, HiChat, HiSearch, HiHome, HiCube, HiUser, HiCog, HiLogout } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/5 shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg neon-glow">
              W
            </div>
            <span className="text-xl font-bold neon-text hidden sm:block">Wado</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Proje, kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <HiHome className="w-5 h-5" />
            </Link>
            <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
              <HiCube className="w-5 h-5" />
            </Link>
            <Link href="/chat" className="text-gray-400 hover:text-white transition-colors relative">
              <HiChat className="w-5 h-5" />
              {onlineUsers.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-900" />
              )}
            </Link>

            {user ? (
              <>
                <Link href="/notifications" className="text-gray-400 hover:text-white transition-colors relative">
                  <HiBell className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                  </button>
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 glass rounded-xl border border-white/10 shadow-xl z-20 py-2">
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <HiUser className="w-4 h-4" /> Profil
                        </Link>
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <HiCog className="w-4 h-4" /> Ayarlar
                        </Link>
                        {user.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-colors">
                            <HiCog className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-white/5 mt-2 pt-2">
                          <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors w-full">
                            <HiLogout className="w-4 h-4" /> Çıkış Yap
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">Giriş Yap</Link>
                <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Kayıt Ol</Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-gray-400" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenu && (
        <div className="md:hidden glass border-t border-white/5 animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 py-2 text-sm"
                />
              </div>
            </form>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/5" onClick={() => setMobileMenu(false)}>
              <HiHome className="w-5 h-5" /> Ana Sayfa
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/5" onClick={() => setMobileMenu(false)}>
              <HiCube className="w-5 h-5" /> Projeler
            </Link>
            <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/5" onClick={() => setMobileMenu(false)}>
              <HiChat className="w-5 h-5" /> Sohbet
            </Link>
            {user ? (
              <>
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/5" onClick={() => setMobileMenu(false)}>
                  <HiUser className="w-5 h-5" /> Profil
                </Link>
                <button onClick={() => { logout(); setMobileMenu(false); }} className="flex items-center gap-3 px-3 py-2.5 text-red-400 rounded-lg hover:bg-white/5 w-full">
                  <HiLogout className="w-5 h-5" /> Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/5" onClick={() => setMobileMenu(false)}>
                  Giriş Yap
                </Link>
                <Link href="/auth/register" className="flex items-center gap-3 px-3 py-2.5 text-indigo-400 rounded-lg hover:bg-white/5" onClick={() => setMobileMenu(false)}>
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
