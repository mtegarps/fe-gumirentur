'use client';
import { useEffect, useState, useRef } from 'react';
import {
  Plus, Edit, Trash2, Search, Save, X, Upload, ImageIcon,
  Car, Link2, Globe, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const EMPTY_FORM = {
  name: '', brand: '', model: '', year: '', type: 'SUV', transmission: 'Automatic',
  fuel_type: 'Bensin', passenger_capacity: '', price_per_day: '', driver_price_per_day: '',
  description: '', license_plate: '', color: '', status: 'available',
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop';

// ─── Image URL Input ────────────────────────────────────────────────
function ImageUrlInput({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    const trimmed = url.trim();
    if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
      onAdd(trimmed);
      setUrl('');
      setIsOpen(false);
    } else {
      toast.error('Masukkan URL yang valid (http:// atau https://)');
    }
  };

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-colors">
        <Link2 size={12} /><span>Pakai URL</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
        <input value={url} onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder="https://example.com/image.jpg"
          className="w-full pl-9 pr-3 py-1.5 border border-blue-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50/50"
          autoFocus />
      </div>
      <button type="button" onClick={handleAdd}
        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
        Tambah
      </button>
      <button type="button" onClick={() => { setIsOpen(false); setUrl(''); }}
        className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function CarsManagement() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewCar, setPreviewCar] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCars(); }, [page]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.cars.getAll({
        search: search || undefined,
        page,
        per_page: 15,
      });
      const data = res.data.data;
      setCars(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch { toast.error('Gagal memuat mobil'); }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    setPage(1);
    fetchCars();
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImageUrls([]);
    setEditMode(false);
    setCurrentId(null);
    setShowModal(true);
  };

  const openEdit = (car: any) => {
    setForm({
      name: car.name || '', brand: car.brand || '', model: car.model || '',
      year: car.year || '', type: car.type || 'SUV', transmission: car.transmission || 'Automatic',
      fuel_type: car.fuel_type || 'Bensin', passenger_capacity: car.passenger_capacity || '',
      price_per_day: car.price_per_day || '', driver_price_per_day: car.driver_price_per_day || '',
      description: car.description || '', license_plate: car.license_plate || '',
      color: car.color || '', status: car.status || 'available',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setImageUrls([]);
    // existing images from DB — could be bare filenames, cars/filename, or http URLs
    setExistingImages(car.images || (car.primary_image ? [car.primary_image] : []));
    setEditMode(true);
    setCurrentId(car.id);
    setShowModal(true);
  };

  const addFiles = (files: FileList) => {
    const arr = Array.from(files);
    setImageFiles(p => [...p, ...arr]);
    setImagePreviews(p => [...p, ...arr.map(f => URL.createObjectURL(f))]);
  };

  const addImageUrl = (url: string) => {
    setImageUrls(p => [...p, url]);
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(p => p.filter((_, i) => i !== idx));
  };

  const removeNewFile = (idx: number) => {
    setImageFiles(p => p.filter((_, i) => i !== idx));
    setImagePreviews(p => p.filter((_, i) => i !== idx));
  };

  const removeUrlImage = (idx: number) => {
    setImageUrls(p => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build payload — send existing images + URL images directly
      const allImages = [...existingImages, ...imageUrls];
      const payload: any = {
        ...form,
        images: allImages,
        primary_image: allImages[0] || null,
      };

      let carId: number;

      if (editMode && currentId) {
        await adminAPI.cars.update(currentId, payload);
        carId = currentId;
      } else {
        const res = await adminAPI.cars.create(payload);
        carId = res.data.data.id;
      }

      // Upload new file images if any
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('images[]', f));
        await adminAPI.cars.uploadImages(carId, fd);
      }

      toast.success(editMode ? 'Mobil berhasil diupdate!' : 'Mobil berhasil ditambahkan!');
      setShowModal(false);
      fetchCars();
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((m: any) => toast.error(m));
      } else {
        toast.error('Gagal menyimpan data');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus mobil ini? Data akan dihapus permanen.')) return;
    try {
      await adminAPI.cars.delete(id);
      toast.success('Mobil berhasil dihapus!');
      fetchCars();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminAPI.cars.updateStatus(id, status);
      toast.success('Status diupdate!');
      fetchCars();
    } catch {
      toast.error('Gagal update status');
    }
  };

  // Client-side filter on already-loaded data
  const filtered = cars.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.brand?.toLowerCase().includes(search.toLowerCase()) ||
    c.license_plate?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s: string) => ({
    available: 'bg-green-100 text-green-700',
    booked: 'bg-purple-100 text-purple-700',
    maintenance: 'bg-orange-100 text-orange-700',
  }[s] || 'bg-gray-100 text-gray-700');

  const imgCount = (car: any) => (car.images?.length || (car.primary_image ? 1 : 0));

  // Total images in modal
  const totalModalImages = existingImages.length + imagePreviews.length + imageUrls.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Manajemen Mobil</h1>
          <p className="text-neutral-600">Kelola armada kendaraan</p>
        </div>
        <button onClick={openAdd}
          className="bg-primary-500 text-white px-5 py-2.5 rounded-xl hover:bg-primary-600 flex items-center space-x-2 transition-colors shadow-sm">
          <Plus size={18} /><span>Tambah Mobil</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            className="pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="Cari nama, brand, plat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  {['Mobil', 'Plat', 'Tipe', 'Harga/Hari', 'Harga+Supir', 'Foto', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-neutral-400">
                      Tidak ada mobil ditemukan
                    </td>
                  </tr>
                ) : filtered.map(car => (
                  <tr key={car.id} className={`hover:bg-neutral-50 transition-colors ${car.deleted_at ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {car.primary_image ? (
                          <img
                            src={getImageUrl(car.primary_image)}
                            alt={car.name}
                            className="w-12 h-10 rounded-lg object-cover ring-1 ring-neutral-200"
                            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <Car size={16} className="text-neutral-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{car.name}</p>
                          <p className="text-neutral-500 text-xs">{car.brand} {car.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{car.license_plate}</td>
                    <td className="px-4 py-3">{car.type}</td>
                    <td className="px-4 py-3 font-medium">{formatRp(car.price_per_day)}</td>
                    <td className="px-4 py-3 font-medium">
                      {car.driver_price_per_day > 0 ? formatRp(car.driver_price_per_day) : <span className="text-neutral-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-neutral-100 rounded-full font-medium flex items-center gap-1 w-fit">
                        <ImageIcon size={12} /> {imgCount(car)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={car.status} onChange={e => handleStatusChange(car.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:ring-1 focus:ring-primary-300 ${statusBadge(car.status)}`}>
                        <option value="available">available</option>
                        <option value="booked">booked</option>
                        <option value="maintenance">maintenance</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <button onClick={() => openEdit(car)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDelete(car.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-neutral-500">
                Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} mobil)
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-display font-bold">
                {editMode ? 'Edit Mobil' : 'Tambah Mobil Baru'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* ── Image Gallery Section ── */}
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <ImageIcon size={14} className="text-primary-500" />
                    Foto Mobil
                    <span className="text-xs font-normal text-neutral-400">
                      ({totalModalImages} foto)
                    </span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ImageUrlInput onAdd={addImageUrl} />
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="px-3 py-1.5 bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-colors">
                      <Upload size={12} /><span>Upload Foto</span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {/* Existing images (from DB) */}
                  {existingImages.map((img, i) => (
                    <div key={`ex-${i}`} className="relative group aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-neutral-200 bg-neutral-100">
                      <img
                        src={getImageUrl(img)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      />
                      {i === 0 && existingImages.length > 0 && imageUrls.length === 0 && imagePreviews.length === 0 && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-[9px] font-bold rounded">UTAMA</div>
                      )}
                      <button type="button" onClick={() => removeExistingImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* URL images (new, not yet saved) */}
                  {imageUrls.map((url, i) => (
                    <div key={`url-${i}`} className="relative group aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-blue-200 bg-blue-50">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded flex items-center gap-0.5">
                        <Link2 size={8} /> URL
                      </div>
                      <button type="button" onClick={() => removeUrlImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* File previews (new uploads, pending) */}
                  {imagePreviews.map((url, i) => (
                    <div key={`new-${i}`} className="relative group aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-amber-200 bg-amber-50">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded">BARU</div>
                      <button type="button" onClick={() => removeNewFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Add placeholder */}
                  <div onClick={() => fileRef.current?.click()}
                    className="aspect-[4/3] border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                    <Upload size={18} className="text-neutral-400 mb-1" />
                    <span className="text-[10px] text-neutral-400 font-medium">Tambah</span>
                  </div>
                </div>
              </div>

              {/* ── Form Fields ── */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Nama Mobil *', key: 'name', required: true },
                  { label: 'Brand *', key: 'brand', required: true },
                  { label: 'Model *', key: 'model', required: true },
                  { label: 'Tahun *', key: 'year', type: 'number', required: true },
                  { label: 'Plat Nomor *', key: 'license_plate', required: true },
                  { label: 'Warna', key: 'color' },
                  { label: 'Kapasitas Penumpang *', key: 'passenger_capacity', type: 'number', required: true },
                  { label: 'Harga / Hari (Rp) *', key: 'price_per_day', type: 'number', required: true },
                  { label: 'Harga + Supir / Hari (Rp)', key: 'driver_price_per_day', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{f.label}</label>
                    <input type={f.type || 'text'} required={f.required} value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Tipe *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                    {['SUV', 'Sedan', 'MPV', 'Hatchback', 'Van', 'Pickup'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Transmisi *</label>
                  <select value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <option>Automatic</option><option>Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Bahan Bakar</label>
                  <select value={form.fuel_type} onChange={e => setForm({ ...form, fuel_type: e.target.value })}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <option>Bensin</option><option>Solar</option><option>Listrik</option><option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>

              {/* ── Buttons ── */}
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Save size={16} />}
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
