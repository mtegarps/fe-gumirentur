'use client';
import { useEffect, useState } from 'react';
import { Car, Calendar, DollarSign, Users, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const statusBadge = (status: string) => {
  const m: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700', waiting_verification: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700', ongoing: 'bg-purple-100 text-purple-700',
    completed: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700',
  };
  return m[status] || 'bg-gray-100 text-gray-700';
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([adminAPI.dashboard.getStats(), adminAPI.dashboard.getRecentActivities()]);
      setStats(s.data.data);
      setActivities(a.data.data);
    } catch { toast.error('Gagal memuat data dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { title: 'Total Mobil', value: stats?.total_cars ?? 0, sub: `${stats?.available_cars ?? 0} tersedia`, icon: Car, g: 'from-blue-500 to-blue-600' },
    { title: 'Total Booking', value: stats?.total_bookings ?? 0, sub: `${stats?.pending_bookings ?? 0} pending`, icon: Calendar, g: 'from-purple-500 to-purple-600' },
    { title: 'Total Users', value: stats?.total_users ?? 0, sub: `${stats?.active_users ?? 0} aktif`, icon: Users, g: 'from-green-500 to-green-600' },
    { title: 'Revenue Bulan Ini', value: formatRp(stats?.monthly_revenue ?? 0), sub: `Total: ${formatRp(stats?.total_revenue ?? 0)}`, icon: DollarSign, g: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-neutral-600">Selamat datang di Admin Panel Gumilar Rent</p>
        </div>
        <button onClick={fetchData} className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors">
          <RefreshCw size={16} /><span>Refresh</span>
        </button>
      </div>

      {/* Alert banners */}
      {(stats?.pending_payments > 0 || stats?.waiting_verification > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {stats?.pending_payments > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <div><p className="font-semibold text-yellow-800">{stats.pending_payments} Pembayaran Perlu Diverifikasi</p>
                <a href="/admin/payments" className="text-sm text-yellow-600 underline">Lihat sekarang →</a></div>
            </div>
          )}
          {stats?.waiting_verification > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3">
              <Clock className="text-blue-600" size={20} />
              <div><p className="font-semibold text-blue-800">{stats.waiting_verification} Booking Menunggu Konfirmasi</p>
                <a href="/admin/bookings" className="text-sm text-blue-600 underline">Lihat sekarang →</a></div>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${c.g}`} />
            <div className="p-6">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${c.g} flex items-center justify-center mb-4`}><c.icon className="text-white" size={22} /></div>
              <p className="text-sm text-neutral-500">{c.title}</p>
              <p className="text-2xl font-bold text-neutral-900">{c.value}</p>
              <p className="text-xs text-neutral-400 mt-1">{c.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Car status */}
      <div className="grid md:grid-cols-3 gap-4">
        {[['Tersedia', stats?.available_cars ?? 0, 'bg-green-50 border-green-200 text-green-700'],
          ['Disewa', stats?.booked_cars ?? 0, 'bg-purple-50 border-purple-200 text-purple-700'],
          ['Maintenance', stats?.maintenance_cars ?? 0, 'bg-orange-50 border-orange-200 text-orange-700'],
        ].map(([label, val, cls], i) => (
          <div key={i} className={`rounded-xl border p-4 ${cls}`}>
            <p className="text-sm font-medium opacity-70">Mobil {label}</p>
            <p className="text-3xl font-bold">{val}</p>
          </div>
        ))}
      </div>

      {/* Recent activities */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="font-display font-bold text-lg">Booking Terbaru</h2>
            <a href="/admin/bookings" className="text-sm text-primary-600 hover:underline">Lihat semua</a>
          </div>
          <div className="divide-y">
            {!(activities?.recent_bookings?.length) && <p className="p-5 text-center text-neutral-400 text-sm">Belum ada booking</p>}
            {(activities?.recent_bookings ?? []).map((b: any) => (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                <div>
                  <p className="font-medium text-sm">{b.booking_number}</p>
                  <p className="text-xs text-neutral-500">{b.guest_name || b.user?.name || '-'} • {b.car?.name || '-'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(b.status)}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="font-display font-bold text-lg">Pembayaran Terbaru</h2>
            <a href="/admin/payments" className="text-sm text-primary-600 hover:underline">Lihat semua</a>
          </div>
          <div className="divide-y">
            {!(activities?.recent_payments?.length) && <p className="p-5 text-center text-neutral-400 text-sm">Belum ada pembayaran</p>}
            {(activities?.recent_payments ?? []).map((p: any) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                <div>
                  <p className="font-medium text-sm">{p.booking?.booking_number || '-'}</p>
                  <p className="text-xs text-neutral-500">{formatRp(p.amount ?? 0)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'verified' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
