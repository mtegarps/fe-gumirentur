'use client';
import { useEffect, useState } from 'react';
import { Check, X, Star, Trash, RefreshCw } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === 'pending') params.is_approved = false;
      else if (filter === 'approved') params.is_approved = true;
      const res = await adminAPI.reviews.getAll(params);
      setReviews(res.data.data.data || []);
    } catch { toast.error('Gagal memuat review'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const handleApprove = async (id: number) => {
    try { await adminAPI.reviews.approve(id); toast.success('Review disetujui!'); fetchReviews(); }
    catch (e: any) { toast.error(e?.response?.data?.message || 'Gagal'); }
  };

  const handleReject = async (id: number) => {
    try { await adminAPI.reviews.reject(id); toast.success('Review ditolak'); fetchReviews(); }
    catch { toast.error('Gagal'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus review ini?')) return;
    try { await adminAPI.reviews.delete(id); toast.success('Dihapus!'); fetchReviews(); }
    catch { toast.error('Gagal menghapus'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-display font-bold">Manajemen Reviews</h1><p className="text-neutral-600">Moderasi ulasan pelanggan</p></div>
        <button onClick={fetchReviews} className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors">
          <RefreshCw size={16} /><span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-2">
        {[['all','Semua'],['pending','Pending'],['approved','Disetujui']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === v ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 && <div className="bg-white rounded-xl border p-10 text-center text-neutral-400">Tidak ada review</div>}
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="font-semibold">{r.user?.name || r.guest_name || 'Anonim'}</p>
                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200 fill-neutral-200'} />
                      ))}
                      <span className="text-xs text-neutral-500 ml-1">{r.rating}/5</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.is_approved ? 'Disetujui' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-1">{r.comment}</p>
                  <p className="text-xs text-neutral-400">Mobil: {r.car?.name || '-'} • {new Date(r.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="flex space-x-1 ml-4">
                  {!r.is_approved && (
                    <button onClick={() => handleApprove(r.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Setujui"><Check size={16} /></button>
                  )}
                  {r.is_approved && (
                    <button onClick={() => handleReject(r.id)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Tolak"><X size={16} /></button>
                  )}
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
