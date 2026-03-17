'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash, ToggleLeft, ToggleRight, X, Save, MapPin } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', address: '', city: '', province: '', phone: '', opening_time: '08:00', closing_time: '20:00', latitude: '', longitude: '' };

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number|null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    try { const res = await adminAPI.locations.getAll(); setLocations(res.data.data || []); }
    catch { toast.error('Gagal memuat lokasi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditMode(false); setCurrentId(null); setShowModal(true); };
  const openEdit = (l: any) => {
    setForm({ name: l.name, address: l.address, city: l.city, province: l.province, phone: l.phone || '', opening_time: l.opening_time || '08:00', closing_time: l.closing_time || '20:00', latitude: l.latitude || '', longitude: l.longitude || '' });
    setEditMode(true); setCurrentId(l.id); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.latitude) delete payload.latitude;
      if (!payload.longitude) delete payload.longitude;
      if (editMode && currentId) { await adminAPI.locations.update(currentId, payload); toast.success('Lokasi diupdate!'); }
      else { await adminAPI.locations.create(payload); toast.success('Lokasi ditambahkan!'); }
      setShowModal(false); fetchLocations();
    } catch (e: any) {
      const errs = e?.response?.data?.errors;
      if (errs) Object.values(errs).flat().forEach((m: any) => toast.error(m));
      else toast.error('Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus lokasi ini?')) return;
    try { await adminAPI.locations.delete(id); toast.success('Dihapus!'); fetchLocations(); }
    catch { toast.error('Gagal'); }
  };

  const handleToggle = async (id: number) => {
    try { await adminAPI.locations.toggleStatus(id); toast.success('Status diubah!'); fetchLocations(); }
    catch { toast.error('Gagal'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-display font-bold">Manajemen Lokasi</h1><p className="text-neutral-600">Kelola lokasi cabang & pickup</p></div>
        <button onClick={openAdd} className="bg-primary-500 text-white px-5 py-2.5 rounded-lg hover:bg-primary-600 flex items-center space-x-2 transition-colors">
          <Plus size={18} /><span>Tambah Lokasi</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {locations.length === 0 && <div className="col-span-2 bg-white rounded-xl border p-10 text-center text-neutral-400">Belum ada lokasi</div>}
          {locations.map(loc => (
            <div key={loc.id} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="text-primary-600" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{loc.name}</h3>
                    <p className="text-sm text-neutral-500">{loc.city}, {loc.province}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${loc.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {loc.is_active !== false ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mb-2">{loc.address}</p>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                {loc.phone && <span>📞 {loc.phone}</span>}
                {loc.opening_time && <span>🕐 {loc.opening_time} - {loc.closing_time}</span>}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openEdit(loc)} className="flex-1 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center justify-center space-x-1 transition-colors">
                  <Edit size={14} /><span>Edit</span>
                </button>
                <button onClick={() => handleToggle(loc.id)} className="py-2 px-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  {loc.is_active !== false ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-neutral-400" />}
                </button>
                <button onClick={() => handleDelete(loc.id)} className="py-2 px-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-display font-bold">{editMode ? 'Edit Lokasi' : 'Lokasi Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[{label:'Nama Lokasi *',key:'name',required:true},{label:'Kota *',key:'city',required:true},{label:'Provinsi *',key:'province',required:true},{label:'Telepon',key:'phone'}].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">{f.label}</label>
                    <input required={f.required} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Jam Buka</label>
                  <input type="time" value={form.opening_time} onChange={e => setForm({...form, opening_time: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Jam Tutup</label>
                  <input type="time" value={form.closing_time} onChange={e => setForm({...form, closing_time: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Alamat Lengkap *</label>
                <textarea required rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
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
