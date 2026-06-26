'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';
import { HiCube, HiUsers, HiDownload, HiTrendingUp, HiChat, HiTag, HiCog, HiShieldCheck, HiCurrencyDollar } from 'react-icons/hi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[90vh] flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <HiShieldCheck className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erişim Engellendi</h2>
          <p className="text-gray-400">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: HiCube, label: 'Toplam Proje', value: stats?.projects || 0, color: 'from-indigo-500 to-purple-600', href: '/admin/projects' },
    { icon: HiUsers, label: 'Toplam Kullanıcı', value: stats?.users || 0, color: 'from-emerald-500 to-teal-600', href: '/admin/users' },
    { icon: HiDownload, label: 'Toplam İndirme', value: stats?.downloads || 0, color: 'from-cyan-500 to-blue-600', href: '/admin/reports' },
    { icon: HiCurrencyDollar, label: 'Toplam Satış', value: stats?.sales || 0, color: 'from-amber-500 to-orange-600', href: '/admin/reports' },
  ];

  const menuItems = [
    { icon: HiUsers, label: 'Kullanıcı Yönetimi', desc: 'Kullanıcıları görüntüle, düzenle, yasakla', href: '/admin/users', color: 'from-emerald-500 to-teal-600' },
    { icon: HiCube, label: 'Proje Yönetimi', desc: 'Projeleri görüntüle, ekle, düzenle, sil', href: '/admin/projects', color: 'from-indigo-500 to-purple-600' },
    { icon: HiTag, label: 'Kategori Yönetimi', desc: 'Kategorileri görüntüle, ekle, düzenle', href: '/admin/categories', color: 'from-cyan-500 to-blue-600' },
    { icon: HiTrendingUp, label: 'Reklam Yönetimi', desc: 'Monetag reklamlarını yönet', href: '/admin/ads', color: 'from-amber-500 to-orange-600' },
    { icon: HiChat, label: 'Sohbet Yönetimi', desc: 'Mesajları görüntüle ve yönet', href: '/admin/chat', color: 'from-pink-500 to-rose-600' },
    { icon: HiCog, label: 'Site Ayarları', desc: 'Logo, tema, site bilgileri', href: '/admin/settings', color: 'from-gray-500 to-slate-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Siteyi yönetin ve istatistikleri görüntüleyin</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Link href={stat.href} key={i} className="glass-card p-5 text-center hover:border-indigo-500/30 transition-all">
            <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-white">{stat.value?.toLocaleString()}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <Link href={item.href} key={i} className="glass-card p-6 group hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{item.label}</h3>
                <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
