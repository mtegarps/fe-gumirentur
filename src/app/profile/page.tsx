'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Camera, Save, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { getInitials, getAvatarColor } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateProfile(formData);
      
      // Update local storage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...formData }));
      }

      toast.success('Profil berhasil diperbarui');
      window.location.reload(); // Refresh to update navbar
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal memperbarui profil';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }

    setLoading(true);

    try {
      await authAPI.updateProfile({ password: passwordData.new_password });
      toast.success('Password berhasil diubah');
      setShowChangePassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengubah password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-2">
            Profil Saya
          </h1>
          <p className="text-neutral-600">
            Kelola informasi pribadi Anda
          </p>
        </motion.div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-6"
        >
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white text-3xl font-bold`}>
                {getInitials(user.name)}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-neutral-900 mb-1">
                {user.name}
              </h2>
              <p className="text-neutral-600">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  Admin
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-8 mb-6"
        >
          <h3 className="text-xl font-display font-semibold text-neutral-900 mb-6">
            Informasi Pribadi
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Alamat
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-neutral-400" size={20} />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input pl-10 min-h-24"
                  rows={3}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full inline-flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </form>
        </motion.div>

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-semibold text-neutral-900">
              Keamanan
            </h3>
            {!showChangePassword && (
              <button
                onClick={() => setShowChangePassword(true)}
                className="btn-secondary btn-sm inline-flex items-center space-x-2"
              >
                <Lock size={16} />
                <span>Ubah Password</span>
              </button>
            )}
          </div>

          {showChangePassword ? (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="input pl-10"
                    placeholder="Minimal 8 karakter"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="password"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                    className="input pl-10"
                    placeholder="Ketik ulang password"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 inline-flex items-center justify-center space-x-2"
                >
                  <Save size={20} />
                  <span>{loading ? 'Menyimpan...' : 'Simpan Password'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      new_password_confirmation: '',
                    });
                  }}
                  className="btn-outline inline-flex items-center space-x-2"
                >
                  <X size={20} />
                  <span>Batal</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-neutral-600">
              Password Anda saat ini aman. Klik tombol di atas untuk mengubahnya.
            </p>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
