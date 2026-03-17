'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Car, Calendar, CreditCard, Users, 
  Star, MapPin, Tag, Settings, LogOut, Menu, X, BarChart3,
  Compass, Package, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(parsed);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage');
    router.push('/');
  };

  const menuGroups = [
    {
      label: 'Utama',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: Calendar, label: 'Booking', href: '/admin/bookings' },
        { icon: CreditCard, label: 'Pembayaran', href: '/admin/payments' },
      ]
    },
    {
      label: 'Armada & Layanan',
      items: [
        { icon: Car, label: 'Mobil', href: '/admin/cars' },
        { icon: Compass, label: 'City Tours', href: '/admin/city-tours' },
        { icon: Package, label: 'Add-on Fasilitas', href: '/admin/facilities' },
        { icon: MapPin, label: 'Lokasi', href: '/admin/locations' },
      ]
    },
    {
      label: 'Pengguna & Marketing',
      items: [
        { icon: Users, label: 'Users', href: '/admin/users' },
        { icon: Star, label: 'Reviews', href: '/admin/reviews' },
        { icon: Tag, label: 'Promosi', href: '/admin/promotions' },
        { icon: BarChart3, label: 'Laporan', href: '/admin/reports' },
      ]
    },
    {
      label: 'Konfigurasi',
      items: [
        { icon: Building2, label: 'Rekening Bank', href: '/admin/bank-accounts' },
        { icon: Settings, label: 'Pengaturan', href: '/admin/settings' },
      ]
    },
  ];

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Gumilar Admin</h1>
              <p className="text-xs text-neutral-500">Dashboard Panel</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
            <p className="text-xs text-neutral-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-neutral-200 z-40 overflow-y-auto"
          >
            <nav className="p-4 space-y-6">
              {menuGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20'
                              : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          <item.icon size={18} />
                          <span className="font-medium text-sm">{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'pl-64' : ''}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
