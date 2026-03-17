import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export const useAuth = (requireAuth: boolean = false, requireAdmin: boolean = false) => {
  const router = useRouter();
  const { user, token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        if (requireAuth) {
          toast.error('Silakan login terlebih dahulu');
          router.push('/login');
        }
        return;
      }

      if (!user) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setAuth(parsedUser, storedToken);
          // Only validate token if auth is required
          if (requireAuth) {
            await authAPI.getProfile();
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth-storage');

          if (requireAuth) {
            toast.error('Sesi Anda telah berakhir');
            router.push('/login');
          }
        }
      }

      if (user) {
        if (requireAdmin && user.role !== 'admin') {
          toast.error('Akses ditolak');
          router.push('/');
        }
      }
    };

    checkAuth();
  }, [requireAuth, requireAdmin, user, router, setAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;

      setAuth(user, token);

      toast.success('Login berhasil!');

      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login gagal';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authAPI.register(data);
      const { token, user } = response.data.data;

      setAuth(user, token);

      toast.success('Registrasi berhasil!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registrasi gagal';
      toast.error(message);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      // Also clear persisted zustand store
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }
      toast.success('Logout berhasil');
      router.push('/');
    }
  };

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout: handleLogout,
  };
};
