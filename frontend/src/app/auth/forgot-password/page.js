'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiMail, HiArrowLeft } from 'react-icons/hi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-3xl mb-4 neon-glow">W</div>
          <h1 className="text-2xl font-bold text-white">Şifremi Unuttum</h1>
          <p className="text-gray-400 mt-2">{sent ? 'E-postanızı kontrol edin' : 'E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim'}</p>
        </div>

        {sent ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
              <HiMail className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-300 mb-6">{email} adresine şifre sıfırlama bağlantısı gönderildi.</p>
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm flex items-center justify-center gap-2">
              <HiArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" placeholder="ornek@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sıfırlama Bağlantısı Gönder'}
            </button>
            <p className="text-center">
              <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm flex items-center justify-center gap-2">
                <HiArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
