import Link from 'next/link';
import { HiHeart } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                W
              </div>
              <span className="text-xl font-bold neon-text">Wado</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              Wado – Yazılımlarını Dünyaya Aç. Modern yazılım ve uygulama platformu ile projelerinizi paylaşın, keşfedin ve indirin.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li><Link href="/projects" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Projeler</Link></li>
              <li><Link href="/chat" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Sohbet</Link></li>
              <li><Link href="/search" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Arama</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Kategoriler</h3>
            <ul className="space-y-2">
              <li><Link href="/projects?category=android" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Android Uygulamaları</Link></li>
              <li><Link href="/projects?category=windows" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Windows Programları</Link></li>
              <li><Link href="/projects?category=games" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Oyunlar</Link></li>
              <li><Link href="/projects?category=tools" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">Araçlar</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 Wado. Tüm hakları saklıdır.</p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <HiHeart className="w-4 h-4 text-red-500" /> ile yapıldı
          </p>
        </div>
      </div>
    </footer>
  );
}
