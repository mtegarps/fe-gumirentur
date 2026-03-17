'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash, Search, Save, X, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const ICON_OPTIONS = [
  { value: 'baby-seat', label: 'Baby Seat', emoji: '👶' },
  { value: 'gps', label: 'GPS Navigator', emoji: '📍' },
  { value: 'wifi', label: 'WiFi Hotspot', emoji: '📶' },
  { value: 'cooler', label: 'Cooler Box', emoji: '🧊' },
  { value: 'phone-holder', label: 'Phone Holder', emoji: '📱' },
  { value: 'umbrella', label: 'Payung', emoji: '☂️' },
  { value: 'tissue', label: 'Tissue Box', emoji: '🧻' },
  { value: 'charger', label: 'Car Charger', emoji: '🔌' },
  { value: 'dashcam', label: 'Dashcam', emoji: '📷' },
  { value: 'roof-rack', label: 'Roof Rack', emoji: '🏗️' },
  { value: 'driver', label: 'Driver/Supir', emoji: '🧑‍✈️' },
  { value: 'insurance', label: 'Asuransi Tambahan', emoji: '🛡️' },
  { value: 'other', label: 'Lainnya', emoji: '📦' },
];

export default function FacilitiesAdmin() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', icon: 'other', is_active: true });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.facilities.getAll({ search: search || undefined });
      setFacilities(res.data.data.data || []);
    } catch { toast.error('Gagal memuat fasilitas'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ name: '', description: '', price: '', icon: 'other', is_active: true });
    setEditMode(false); setCurrentId(null); setShowModal(true);
  };

  const openEdit = (f: any) => {
    setForm({ name: f.name || '', description: f.description || '', price: f.price || '', icon: f.icon || 'other', is_active: f.is_active });
    setEditMode(true); setCurrentId(f.id); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price as string) || 0 };
      if (editMode && currentId) {
        await adminAPI.facilities.update(currentId, payload);
        toast.success('Fasilitas berhasil diupdate!');
      } else {
        await adminAPI.facilities.create(payload);
        toast.success('Fasilitas berhasil ditambahkan!');
      }
      setShowModal(false); fetchData();
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach((m: any) => toast.error(m));
      else toast.error('Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus fasilitas ini?')) return;
    try { await adminAPI.facilities.delete(id); toast.success('Dihapus!'); fetchData(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Gagal menghapus'); }
  };

  const handleToggle = async (id: number) => {
    try { await adminAPI.facilities.toggleStatus(id); toast.success('Status diubah!'); fetchData(); }
    catch { toast.error('Gagal mengubah status'); }
  };

  const getIcon = (iconKey: string) => ICON_OPTIONS.find(o => o.value === iconKey)?.emoji || '📦';
  const filtered = facilities.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            Add-on Fasilitas
          </h1>
          <p className="text-neutral-600 mt-1">Kelola fasilitas tambahan untuk booking mobil</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus size={18} /><span>Tambah Fasilitas</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/80 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input className="pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="Cari fasilitas..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
              <Package size={40} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">Belum ada fasilitas</p>
            </div>
          ) : filtered.map(f => (
            <div key={f.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${f.is_active ? 'border-neutral-200/80' : 'border-neutral-200/50 opacity-60'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl flex items-center justify-center text-xl">
                    {getIcon(f.icon)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(f.id)} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors" title={f.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                      {f.is_active ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-neutral-400" />}
                    </button>
                    <button onClick={() => openEdit(f)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={15} /></button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={15} /></button>
                  </div>
                </div>
                <h3 className="font-display font-bold text-neutral-800">{f.name}</h3>
                {f.description && <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{f.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">{formatRp(f.price)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${f.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    {f.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-display font-bold">{editMode ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Ikon</label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm({ ...form, icon: opt.value })}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${form.icon === opt.value ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                      <span className="text-xl block">{opt.emoji}</span>
                      <span className="text-[10px] text-neutral-500 mt-1 block truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nama Fasilitas *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="Baby Seat" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Deskripsi</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-y"
                  placeholder="Deskripsi opsional..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Harga (Rp) *</label>
                <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="50000" />
              </div>
              <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-neutral-700">Aktif (ditampilkan ke user)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">Batal</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                  <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
