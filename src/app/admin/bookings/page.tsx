'use client';
import { useEffect, useState } from 'react';
import { Eye, Check, X, RefreshCw, Search } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const statusBadge = (s: string) => ({
  pending_payment: 'bg-yellow-100 text-yellow-700',
  waiting_verification: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  ongoing: 'bg-purple-100 text-purple-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-700');

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const res = await adminAPI.bookings.getAll(params);
      setBookings(res.data.data.data || []);
    } catch { toast.error('Gagal memuat booking'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleConfirm = async (id: number) => {
    setActionLoading(true);
    try { await adminAPI.bookings.confirm(id); toast.success('Booking dikonfirmasi!'); fetchBookings(); setSelected(null); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Gagal konfirmasi'); }
    finally { setActionLoading(false); }
  };

  const handleComplete = async (id: number) => {
    setActionLoading(true);
    try { await adminAPI.bookings.complete(id); toast.success('Booking selesai!'); fetchBookings(); setSelected(null); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Gagal'); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async (id: number) => {
    const reason = prompt('Alasan pembatalan:');
    if (reason === null) return;
    setActionLoading(true);
    try { await adminAPI.bookings.cancel(id, reason); toast.success('Booking dibatalkan'); fetchBookings(); setSelected(null); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Gagal'); }
    finally { setActionLoading(false); }
  };

  const FILTERS = ['all','pending_payment','waiting_verification','confirmed','ongoing','completed','cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-display font-bold">Manajemen Booking</h1><p className="text-neutral-600">Kelola semua booking kendaraan</p></div>
        <button onClick={fetchBookings} className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors">
          <RefreshCw size={16} /><span>Refresh</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {f === 'all' ? 'Semua' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
            <input className="pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-300"
              placeholder="Cari no. booking, nama, email..." value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchBookings()} />
          </div>
          <button onClick={fetchBookings} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm transition-colors">Cari</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  {['No. Booking', 'Pemesan', 'Mobil', 'Tanggal', 'Total', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">Tidak ada booking</td></tr>
                ) : bookings.map(b => (
                  <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs">{b.booking_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.guest_name || b.user?.name || '-'}</p>
                      <p className="text-xs text-neutral-500">{b.guest_email || b.user?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{b.car?.name || '-'}</td>
                    <td className="px-4 py-3 text-xs text-neutral-600">
                      <p>{fmtDate(b.pickup_date)}</p>
                      <p>s/d {fmtDate(b.return_date)}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatRp(b.total_amount)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(b.status)}`}>{b.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <button onClick={() => setSelected(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail"><Eye size={15} /></button>
                        {b.status === 'waiting_verification' && (
                          <button onClick={() => handleConfirm(b.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Konfirmasi"><Check size={15} /></button>
                        )}
                        {b.status === 'ongoing' && (
                          <button onClick={() => handleComplete(b.id)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Selesai"><Check size={15} /></button>
                        )}
                        {!['completed', 'cancelled'].includes(b.status) && (
                          <button onClick={() => handleCancel(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Batalkan"><X size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-display font-bold">Detail Booking</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-neutral-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['No. Booking', selected.booking_number],
                ['Status', selected.status],
                ['Pemesan', selected.guest_name || selected.user?.name || '-'],
                ['Email', selected.guest_email || selected.user?.email || '-'],
                ['Telepon', selected.guest_phone || selected.user?.phone || '-'],
                ['Mobil', selected.car?.name || '-'],
                ['Pickup', fmtDate(selected.pickup_date)],
                ['Return', fmtDate(selected.return_date)],
                ['Durasi', `${selected.rental_days} hari`],
                ['Total', formatRp(selected.total_amount)],
                ['Metode Bayar', selected.payment?.payment_method || '-'],
                ['Status Bayar', selected.payment?.status || '-'],
                ['Catatan', selected.notes || '-'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-neutral-100 last:border-0">
                  <span className="text-neutral-500">{label}</span>
                  <span className="font-medium text-right max-w-[60%]">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-5">
              {selected.status === 'waiting_verification' && (
                <button onClick={() => handleConfirm(selected.id)} disabled={actionLoading}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-60">Konfirmasi</button>
              )}
              {selected.status === 'ongoing' && (
                <button onClick={() => handleComplete(selected.id)} disabled={actionLoading}
                  className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-60">Tandai Selesai</button>
              )}
              {!['completed', 'cancelled'].includes(selected.status) && (
                <button onClick={() => handleCancel(selected.id)} disabled={actionLoading}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60">Batalkan</button>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
