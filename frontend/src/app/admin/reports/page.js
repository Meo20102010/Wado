'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { HiDownload, HiCube, HiUsers, HiTrendingUp, HiCurrencyDollar } from 'react-icons/hi';

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    adminAPI.getStats().then(res => setStats(res.data.stats)).catch(console.error);
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Raporlar & İstatistikler</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <HiCube className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.projects || 0}</div>
          <div className="text-sm text-gray-400">Toplam Proje</div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <HiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.users || 0}</div>
          <div className="text-sm text-gray-400">Toplam Kullanıcı</div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <HiDownload className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.downloads || 0}</div>
          <div className="text-sm text-gray-400">Toplam İndirme</div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <HiCurrencyDollar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.sales || 0}</div>
          <div className="text-sm text-gray-400">Toplam Satış</div>
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-semibold text-white mb-4">Platform Özeti</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/3">
            <span className="text-gray-300">Aylık Aktif Kullanıcılar</span>
            <span className="text-white font-semibold">{stats?.monthlyActiveUsers || 0}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/3">
            <span className="text-gray-300">Bu Ay Eklenen Projeler</span>
            <span className="text-white font-semibold">{stats?.monthlyProjects || 0}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/3">
            <span className="text-gray-300">Bu Ayki İndirmeler</span>
            <span className="text-white font-semibold">{stats?.monthlyDownloads || 0}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/3">
            <span className="text-gray-300">Bu Ayki Satışlar</span>
            <span className="text-white font-semibold">{stats?.monthlySales || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
