'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiUser, HiCube, HiStar, HiHeart, HiCalendar, HiLocationMarker, HiGlobe, HiMail, HiUserAdd, HiUserRemove } from 'react-icons/hi';
import { FaGithub, FaTwitter, FaInstagram, FaWhatsapp } from 'react-icons/fa';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersAPI.getProfile(username);
        setProfile(res.data.user);
        setIsFollowing(res.data.user.isFollowing || false);
      } catch (err) {
        toast.error('Kullanıcı bulunamadı');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!currentUser) { toast.error('Giriş yapmalısınız'); return; }
    try {
      if (isFollowing) {
        await usersAPI.unfollow(profile.id);
        setIsFollowing(false);
        setProfile(prev => ({ ...prev, followers: (prev.followers || 1) - 1 }));
      } else {
        await usersAPI.follow(profile.id);
        setIsFollowing(true);
        setProfile(prev => ({ ...prev, followers: (prev.followers || 0) + 1 }));
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    }
  };

  if (loading) {
    return <div className="min-h-[90vh] flex items-center justify-center"><div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;
  }

  if (!profile) {
    return <div className="min-h-[90vh] flex items-center justify-center"><p className="text-gray-400">Kullanıcı bulunamadı</p></div>;
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-card p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              profile.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
              <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
              {profile.badges?.map((badge, i) => (
                <span key={i} className="badge badge-primary text-xs">{badge}</span>
              ))}
            </div>
            <p className="text-gray-400 mt-2">{profile.bio || 'Henüz bir biyografi eklenmemiş.'}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400 justify-center sm:justify-start flex-wrap">
              <span className="flex items-center gap-1"><HiHeart className="w-4 h-4" /> {profile.followers || 0} takipçi</span>
              <span className="flex items-center gap-1"><HiUser className="w-4 h-4" /> {profile.following || 0} takip</span>
              <span className="flex items-center gap-1"><HiCube className="w-4 h-4" /> {profile.projectCount || 0} proje</span>
              <span className="flex items-center gap-1"><HiCalendar className="w-4 h-4" /> {new Date(profile.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            {profile.socialLinks && (
              <div className="flex items-center gap-3 mt-4 justify-center sm:justify-start">
                {profile.socialLinks.github && <a href={profile.socialLinks.github} target="_blank" className="text-gray-400 hover:text-white transition-colors"><FaGithub className="w-5 h-5" /></a>}
                {profile.socialLinks.twitter && <a href={profile.socialLinks.twitter} target="_blank" className="text-gray-400 hover:text-white transition-colors"><FaTwitter className="w-5 h-5" /></a>}
                {profile.socialLinks.instagram && <a href={profile.socialLinks.instagram} target="_blank" className="text-gray-400 hover:text-pink-400 transition-colors"><FaInstagram className="w-5 h-5" /></a>}
              </div>
            )}
          </div>
          {!isOwnProfile && currentUser && (
            <button onClick={handleFollow} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isFollowing ? 'bg-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-400' : 'btn-primary'
            }`}>
              {isFollowing ? <><HiUserRemove className="w-4 h-4" /> Takipten Çık</> : <><HiUserAdd className="w-4 h-4" /> Takip Et</>}
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="section-title mb-6">Projeler</h2>
        {profile.projects?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.projects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 hover:bg-white/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
                  {project.title?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors truncate">{project.title}</h3>
                  <p className="text-xs text-gray-500">{project.downloads || 0} indirme · {project.rating ? `${project.rating}/5` : '0/5'}</p>
                </div>
                <span className={`badge ${project.type === 'apk' ? 'badge-primary' : 'badge-success'}`}>{project.type?.toUpperCase()}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Henüz proje yayınlanmamış</p>
        )}
      </div>
    </div>
  );
}
