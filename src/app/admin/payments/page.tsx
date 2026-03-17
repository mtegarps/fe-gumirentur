'use client';
import { useEffect, useState } from 'react';
import { Eye, Check, X, RefreshCw } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';
const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      const res = await adminAPI.payments.getAll(params);
      setPayments(res.data.data.data || []);
    } catch { toast.error('Gagal memuat pembayaran'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [filter]);

  const handleVerify = async (id: number) => {
    setActionLoading(true);
    try { await adminAPI.payments.verify(id); toast.success('Pembayaran diverifikasi!'); fetchPayments(); setSelected(null); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Gagal'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;
    setActionLoading(true);
    try { await adminAPI.payments.reject(id, reason); toast.success('Pembayaran ditolak'); fetchPayments(); setSelected(null); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Gagal'); }
    finally { setActionLoading(false); }
  };

  const statusBadge = (s: string) => ({
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-display font-bold">Manajemen Pembayaran</h1><p className="text-neutral-600">Verifikasi bukti transfer</p></div>
        <button onClick={fetchPayments} className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors">
          <RefreshCw size={16} /><span>Refresh</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex gap-2">
          {['all', 'pending', 'verified', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {f === 'all' ? 'Semua' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>{['No. Booking', 'Metode', 'Jumlah', 'Bukti', 'Tanggal', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
                {payments.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">Tidak ada pembayaran</td></tr>
                ) : payments.map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs">{p.booking?.booking_number || '-'}</td>
                    <td className="px-4 py-3">{p.payment_method || '-'}</td>
                    <td className="px-4 py-3 font-semibold">{formatRp(p.amount)}</td>
                    <td className="px-4 py-3">
                      {p.payment_proof ? (
                        <a href={`${BASE_URL}/storage/${p.payment_proof}`} target="_blank" rel="noreferrer"
                          className="text-primary-600 hover:underline text-xs">Lihat Bukti →</a>
                      ) : <span className="text-neutral-400 text-xs">Belum upload</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(p.status)}`}>{p.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <button onClick={() => setSelected(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={15} /></button>
                        {p.status === 'pending' && p.payment_proof && (
                          <>
                            <button onClick={() => handleVerify(p.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Verifikasi"><Check size={15} /></button>
                            <button onClick={() => handleReject(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Tolak"><X size={15} /></button>
                          </>
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-display font-bold">Detail Pembayaran</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-neutral-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {[
                ['No. Booking', selected.booking?.booking_number || '-'],
                ['Metode', selected.payment_method || '-'],
                ['Jumlah', formatRp(selected.amount)],
                ['Status', selected.status],
                ['Tanggal', fmtDate(selected.created_at)],
                ['Catatan', selected.notes || '-'],
                ['Alasan Ditolak', selected.rejection_reason || '-'],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-1.5 border-b border-neutral-100 last:border-0">
                  <span className="text-neutral-500">{l}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            {selected.payment_proof && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2 text-neutral-700">Bukti Pembayaran:</p>
                <img src={`${BASE_URL}/storage/${selected.payment_proof}`} alt="Bukti" className="w-full rounded-lg object-contain max-h-64 border" />
              </div>
            )}
            <div className="flex space-x-2">
              {selected.status === 'pending' && selected.payment_proof && (
                <>
                  <button onClick={() => handleVerify(selected.id)} disabled={actionLoading}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-60">Verifikasi</button>
                  <button onClick={() => handleReject(selected.id)} disabled={actionLoading}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60">Tolak</button>
                </>
              )}
              <button onClick={() => setSelected(null)} className="flex-1 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
