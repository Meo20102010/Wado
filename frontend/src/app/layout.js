import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import AdSenseScript from '@/components/AdSenseScript';

export const metadata = {
  title: 'Wado - APK, EXE ve Yazılım Dünyası',
  description: 'Wado – Yazılımlarını Dünyaya Aç. APK, EXE ve yazılım projelerini keşfedin, paylaşın ve indirin.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-dark-950 text-white antialiased">
        <AuthProvider>
          <SocketProvider>
            <div className="animated-bg">
              <div className="orb" />
              <div className="orb" />
              <div className="orb" />
            </div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#13131a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }, duration: 3000 }} />
            <Navbar />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Footer />
            <AdSenseScript />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
