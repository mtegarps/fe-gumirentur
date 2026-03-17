'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };

export default function ReportsPage() {
  const [bookingData, setBookingData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [carsPerf, setCarsPerf] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(today());
  const [activeTab, setActiveTab] = useState('booking');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { date_from: dateFrom, date_to: dateTo };
      const [bRes, rRes, cRes] = await Promise.all([
        adminAPI.reports.bookings(params),
        adminAPI.reports.revenue(params),
        adminAPI.reports.carsPerformance(params),
      ]);
      setBookingData(bRes.data.data);
      setRevenueData(rRes.data.data);
      setCarsPerf(cRes.data.data?.cars || []);
    } catch { toast.error('Gagal memuat laporan'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-400', waiting_verification: 'bg-blue-400',
    confirmed: 'bg-green-400', ongoing: 'bg-purple-400',
    completed: 'bg-gray-400', cancelled: 'bg-red-400',
  };

  const totalBookings = bookingData?.summary?.total_bookings || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-display font-bold">Laporan & Analitik</h1><p className="text-neutral-600">Ringkasan performa bisnis</p></div>
      </div>

      {/* Date filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Dari Tanggal</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Sampai Tanggal</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </div>
        <button onClick={fetchReports} disabled={loading}
          className="px-5 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60 flex items-center space-x-2 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /><span>Generate</span>
        </button>
      </div>

      {/* Summary cards */}
      {bookingData && (
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Total Booking', value: bookingData.summary.total_bookings, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'Total Revenue', value: formatRp(bookingData.summary.total_revenue), color: 'text-green-600 bg-green-50 border-green-200' },
            { label: 'Selesai', value: bookingData.summary.completed, color: 'text-purple-600 bg-purple-50 border-purple-200' },
            { label: 'Dibatalkan', value: bookingData.summary.cancelled, color: 'text-red-600 bg-red-50 border-red-200' },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 ${s.color}`}>
              <p className="text-sm font-medium opacity-70">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b">
          {[['booking','Status Booking'],['revenue','Revenue'],['cars','Performa Mobil']].map(([v,l]) => (
            <button key={v} onClick={() => setActiveTab(v)}
              className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === v ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'booking' && bookingData && (
            <div>
              <h3 className="font-semibold mb-4">Distribusi Status Booking</h3>
              <div className="space-y-3">
                {Object.entries(bookingData.status_breakdown || {}).map(([status, count]: any) => (
                  <div key={status} className="flex items-center space-x-3">
                    <div className="w-32 text-sm text-neutral-600">{status}</div>
                    <div className="flex-1 bg-neutral-100 rounded-full h-5 overflow-hidden">
                      <div className={`h-full rounded-full ${statusColors[status] || 'bg-gray-400'} transition-all`}
                        style={{ width: totalBookings ? `${(count / totalBookings) * 100}%` : '0%' }} />
                    </div>
                    <span className="w-8 text-sm font-semibold text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'revenue' && revenueData && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Revenue Breakdown</h3>
                <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                  <TrendingUp size={16} />
                  <span>Total: {formatRp(revenueData.summary?.total_revenue || 0)}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-neutral-50">
                    <th className="px-4 py-2 text-left font-semibold text-neutral-600">Periode</th>
                    <th className="px-4 py-2 text-right font-semibold text-neutral-600">Total</th>
                    <th className="px-4 py-2 text-right font-semibold text-neutral-600">Transaksi</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {(revenueData.breakdown || []).map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="px-4 py-2">{row.period}</td>
                        <td className="px-4 py-2 text-right font-medium text-green-600">{formatRp(row.total)}</td>
                        <td className="px-4 py-2 text-right text-neutral-500">{row.count}</td>
                      </tr>
                    ))}
                    {!(revenueData.breakdown?.length) && <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-400">Tidak ada data</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'cars' && (
            <div>
              <h3 className="font-semibold mb-4">Performa Mobil Terpopuler</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-neutral-50">
                    <th className="px-4 py-2 text-left font-semibold text-neutral-600">Mobil</th>
                    <th className="px-4 py-2 text-right font-semibold text-neutral-600">Total Booking</th>
                    <th className="px-4 py-2 text-right font-semibold text-neutral-600">Revenue</th>
                    <th className="px-4 py-2 text-right font-semibold text-neutral-600">Rating</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {carsPerf.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">Tidak ada data</td></tr>}
                    {carsPerf.map((c: any) => (
                      <tr key={c.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-neutral-500">{c.brand} • {c.type}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{c.total_bookings || 0}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">{formatRp(c.total_revenue || 0)}</td>
                        <td className="px-4 py-3 text-right">⭐ {c.rating || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
