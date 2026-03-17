'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { Calendar, Car, User, Clock, CheckCircle, XCircle, AlertCircle, Plus, Eye, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const bookingsRes = await axios.get(`${API_URL}/bookings/my-bookings`, { headers });
      const bookingsData = bookingsRes.data.data.data || [];
      setBookings(bookingsData);
      setStats({
        total: bookingsData.length,
        active: bookingsData.filter((b: any) => b.status === 'ongoing').length,
        completed: bookingsData.filter((b: any) => b.status === 'completed').length,
        cancelled: bookingsData.filter((b: any) => b.status === 'cancelled').length,
      });
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.clear();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending_payment: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Confirmed' },
      ongoing: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Car, label: 'Ongoing' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle, label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Cancelled' },
    };
    const badge = badges[status] || badges.pending_payment;
    const Icon = badge.icon;
    return <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}><Icon size={12} /><span>{badge.label}</span></span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <WhatsAppButton />
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold mb-2">Welcome, {user.name}!</h1>
                <p className="text-primary-100">Manage your bookings and profile</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <a href="/fleet" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 flex items-center space-x-2">
                  <Car size={20} /><span>Book Now</span>
                </a>
                <button onClick={handleLogout} className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20">Logout</button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'from-blue-500 to-blue-600' },
              { label: 'Active Trips', value: stats.active, icon: Car, color: 'from-purple-500 to-purple-600' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'from-green-500 to-green-600' },
              { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'from-red-500 to-red-600' },
            ].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-xl shadow-sm border p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}><stat.icon className="text-white" size={24} /></div>
                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Bookings & Profile */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-display font-bold">My Bookings</h2>
                  <a href="/my-bookings" className="text-primary-600 font-medium text-sm">View All →</a>
                </div>
                <div className="divide-y">
                  {bookings.length === 0 ? (
                    <div className="p-12 text-center">
                      <Car className="mx-auto mb-4 text-neutral-400" size={48} />
                      <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                      <p className="text-neutral-600 mb-6">Start your journey</p>
                      <a href="/fleet" className="btn-primary inline-flex items-center space-x-2"><Plus size={20} /><span>Book a Car</span></a>
                    </div>
                  ) : (
                    bookings.slice(0, 5).map((b) => (
                      <div key={b.id} className="p-6 hover:bg-neutral-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{b.car?.name}</h3>
                            <p className="text-sm text-neutral-600 font-mono">{b.booking_number}</p>
                          </div>
                          {getStatusBadge(b.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div><p className="text-xs text-neutral-500">Pickup</p><p className="text-sm font-medium">{new Date(b.pickup_date).toLocaleDateString()}</p></div>
                          <div><p className="text-xs text-neutral-500">Return</p><p className="text-sm font-medium">{new Date(b.return_date).toLocaleDateString()}</p></div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div><p className="text-sm text-neutral-600">Total</p><p className="text-xl font-bold text-primary-600">Rp {(b.total_amount / 1000).toFixed(0)}K</p></div>
                          <div className="flex space-x-2">
                            <a href="/my-bookings" className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center space-x-1"><Eye size={16} /><span>View</span></a>
                            {b.status === 'pending_payment' && (
                              <a href={`/payment/${b.id}`} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center space-x-1"><CreditCard size={16} /><span>Pay</span></a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2"><span className="text-sm text-neutral-600">Phone</span><span className="text-sm font-medium">{user.phone || '-'}</span></div>
                  <div className="flex justify-between py-2"><span className="text-sm text-neutral-600">Member Since</span><span className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span></div>
                </div>
                <a href="/profile" className="block w-full px-4 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-center font-medium"><User size={16} className="inline mr-2" />Edit Profile</a>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <a href="/fleet" className="block w-full px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-center font-medium"><Car size={16} className="inline mr-2" />Book a Car</a>
                  <a href="/my-bookings" className="block w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-center font-medium"><Calendar size={16} className="inline mr-2" />My Bookings</a>
                  <a href="/track" className="block w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-center font-medium"><Eye size={16} className="inline mr-2" />Track Order</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
