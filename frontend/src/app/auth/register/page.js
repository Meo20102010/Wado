'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiLockClosed } from 'react-icons/hi';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password });
      toast.success('Kayıt başarılı!');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-3xl mb-4 neon-glow">
            W
          </div>
          <h1 className="text-2xl font-bold text-white">Hesap Oluştur</h1>
          <p className="text-gray-400 mt-2">Wado'ya katılmak için kayıt olun</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="kullaniciadi" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field pl-10" required minLength={3} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="email" placeholder="ornek@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" placeholder="En az 6 karakter" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10" required minLength={6} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Şifre Tekrar</label>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field pl-10" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Kayıt Ol'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Zaten hesabın var mı?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Giriş Yap
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
