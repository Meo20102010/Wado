'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { chatAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { HiChat, HiEmojiHappy, HiTrash, HiPaperAirplane, HiUser } from 'react-icons/hi';

const EMOJIS = ['😀', '😂', '❤️', '🔥', '👍', '🎉', '😎', '🚀', '💯', '⭐', '👋', '😊', '🤔', '🙌', '💪', '✨', '🎯', '🌟', '💻', '📱'];

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await chatAPI.getMessages(100);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    const handleDelete = (msgId) => {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    };
    socket.on('chat-message', handleMessage);
    socket.on('chat-message-deleted', handleDelete);
    return () => {
      socket.off('chat-message', handleMessage);
      socket.off('chat-message-deleted', handleDelete);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const tempId = Date.now();
    const msgData = { content: newMessage.trim(), tempId };
    try {
      const res = await chatAPI.sendMessage(msgData);
      if (socket) {
        socket.emit('send-message', res.data.message);
      }
      setMessages(prev => [...prev, res.data.message]);
      setNewMessage('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error('Mesaj gönderilemedi');
    }
  };

  const deleteMessage = async (msgId) => {
    if (!confirm('Mesajı silmek istediğinize emin misiniz?')) return;
    try {
      await chatAPI.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (socket) socket.emit('delete-message', msgId);
    } catch (err) {
      toast.error('Mesaj silinemedi');
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  if (!user) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-md">
          <HiChat className="w-16 h-16 mx-auto text-indigo-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-4">Sohbete Katıl</h2>
          <p className="text-gray-400 mb-6">Sohbet etmek için giriş yapın.</p>
          <a href="/auth/login" className="btn-primary">Giriş Yap</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HiChat className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-white">Genel Sohbet</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {onlineUsers.length} çevrim içi
          </div>
        </div>

        <div ref={chatContainerRef} className="overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100% - 130px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Henüz mesaj yok. İlk mesajı sen yaz!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 group ${msg.userId === user.id ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 ${msg.userId === user.id ? 'from-purple-500 to-pink-600' : ''}`}>
                  {msg.username?.charAt(0).toUpperCase()}
                </div>
                <div className={`max-w-[75%] ${msg.userId === user.id ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-400">{msg.userId === user.id ? 'sen' : msg.username}</span>
                    <span className="text-xs text-gray-600">{new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                    msg.userId === user.id
                      ? 'bg-indigo-500/20 text-white rounded-tr-md'
                      : 'bg-white/5 text-gray-200 rounded-tl-md'
                  }`}>
                    {msg.content}
                  </div>
                  {(user.role === 'admin' || msg.userId === user.id) && (
                    <button onClick={() => deleteMessage(msg.id)} className="text-gray-600 hover:text-red-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Sil
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/5">
          {showEmojis && (
            <div className="glass p-3 rounded-xl mb-3 flex flex-wrap gap-2">
              {EMOJIS.map((emoji, i) => (
                <button key={i} onClick={() => addEmoji(emoji)} className="text-xl hover:scale-125 transition-transform">{emoji}</button>
              ))}
            </div>
          )}
          <form onSubmit={sendMessage} className="flex gap-3">
            <button type="button" onClick={() => setShowEmojis(!showEmojis)} className="text-gray-400 hover:text-white transition-colors p-2">
              <HiEmojiHappy className="w-6 h-6" />
            </button>
            <input type="text" placeholder="Mesajınız..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="input-field flex-1" maxLength={500} />
            <button type="submit" disabled={!newMessage.trim()} className="btn-primary p-3">
              <HiPaperAirplane className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
