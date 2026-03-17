'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID') : '-';

const EMPTY = { name: '', code: '', type: 'percentage', value: '', min_transaction: '', max_discount: '', usage_limit: '', start_date: '', end_date: '', is_active: true };

export default function PromotionsPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number|null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try { const res = await adminAPI.promotions.getAll(); setPromos(res.data.data || []); }
    catch { toast.error('Gagal memuat promo'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPromos(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditMode(false); setCurrentId(null); setShowModal(true); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name, code: p.code, type: p.type, value: p.value,
      min_transaction: p.min_transaction || '', max_discount: p.max_discount || '',
      usage_limit: p.usage_limit || '', start_date: p.start_date?.slice(0, 10) || '',
      end_date: p.end_date?.slice(0, 10) || '', is_active: p.is_active,
    });
    setEditMode(true); setCurrentId(p.id); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      ['min_transaction', 'max_discount', 'usage_limit'].forEach(k => { if (!payload[k]) delete payload[k]; });
      if (editMode && currentId) { await adminAPI.promotions.update(currentId, payload); toast.success('Promo diupdate!'); }
      else { await adminAPI.promotions.create(payload); toast.success('Promo dibuat!'); }
      setShowModal(false); fetchPromos();
    } catch (e: any) {
      const errs = e?.response?.data?.errors;
      if (errs) Object.values(errs).flat().forEach((m: any) => toast.error(m));
      else toast.error('Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus promo ini?')) return;
    try { await adminAPI.promotions.delete(id); toast.success('Dihapus!'); fetchPromos(); }
    catch { toast.error('Gagal'); }
  };

  const handleToggle = async (id: number) => {
    try { await adminAPI.promotions.toggleStatus(id); toast.success('Status diubah!'); fetchPromos(); }
    catch { toast.error('Gagal'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-display font-bold">Manajemen Promosi</h1><p className="text-neutral-600">Kelola kode promo & diskon</p></div>
        <button onClick={openAdd} className="bg-primary-500 text-white px-5 py-2.5 rounded-lg hover:bg-primary-600 flex items-center space-x-2 transition-colors">
          <Plus size={18} /><span>Tambah Promo</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>{['Nama', 'Kode', 'Tipe', 'Nilai', 'Min. Transaksi', 'Periode', 'Terpakai', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {promos.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-neutral-400">Belum ada promo</td></tr>
              ) : promos.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3"><span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-xs">{p.code}</span></td>
                  <td className="px-4 py-3 capitalize">{p.type}</td>
                  <td className="px-4 py-3 font-semibold">
                    {p.type === 'percentage' ? `${p.value}%` : formatRp(p.value)}
                    {p.max_discount && <span className="text-xs text-neutral-500"> (max {formatRp(p.max_discount)})</span>}
                  </td>
                  <td className="px-4 py-3">{p.min_transaction ? formatRp(p.min_transaction) : '-'}</td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{fmtDate(p.start_date)} — {fmtDate(p.end_date)}</td>
                  <td className="px-4 py-3 text-center">{p.used_count ?? 0} / {p.usage_limit ?? '∞'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={15} /></button>
                      <button onClick={() => handleToggle(p.id)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        {p.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-display font-bold">{editMode ? 'Edit Promo' : 'Promo Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[{label:'Nama Promo *',key:'name',required:true},{label:'Kode Promo *',key:'code',required:true}].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{f.label}</label>
                    <input required={f.required} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tipe *</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <option value="percentage">Persentase (%)</option><option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nilai *</label>
                  <input type="number" required value={form.value} onChange={e => setForm({...form, value: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                {[{label:'Min. Transaksi (Rp)',key:'min_transaction'},{label:'Max Diskon (Rp)',key:'max_discount'},{label:'Batas Pemakaian',key:'usage_limit'}].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{f.label}</label>
                    <input type="number" value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal Mulai *</label>
                  <input type="date" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal Berakhir *</label>
                  <input type="date" required value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-neutral-700">Aktifkan promo</span>
              </label>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60 flex items-center justify-center space-x-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                  <span>{saving ? 'Menyimpan...' : editMode ? 'Update' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
