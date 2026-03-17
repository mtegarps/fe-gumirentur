'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash, Save, X, Building2, ToggleLeft, ToggleRight, CreditCard, GripVertical } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const BANK_OPTIONS = [
  { name: 'BCA', color: 'from-blue-500 to-blue-700', letter: 'BCA' },
  { name: 'BNI', color: 'from-orange-500 to-orange-700', letter: 'BNI' },
  { name: 'BRI', color: 'from-blue-600 to-indigo-700', letter: 'BRI' },
  { name: 'Mandiri', color: 'from-blue-800 to-blue-900', letter: 'MDR' },
  { name: 'BSI', color: 'from-emerald-600 to-green-700', letter: 'BSI' },
  { name: 'CIMB Niaga', color: 'from-red-600 to-red-800', letter: 'CNB' },
  { name: 'Permata', color: 'from-green-600 to-teal-700', letter: 'PMT' },
  { name: 'Danamon', color: 'from-yellow-500 to-amber-600', letter: 'DAN' },
  { name: 'BTPN', color: 'from-blue-500 to-blue-800', letter: 'BTP' },
  { name: 'OCBC NISP', color: 'from-red-500 to-red-700', letter: 'OBC' },
  { name: 'Bank Jago', color: 'from-yellow-400 to-orange-500', letter: 'JAG' },
  { name: 'SeaBank', color: 'from-teal-500 to-cyan-600', letter: 'SEA' },
  { name: 'Lainnya', color: 'from-neutral-500 to-neutral-700', letter: '...' },
];

export default function BankAccountsAdmin() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bank_name: 'BCA', account_number: '', account_holder: '', is_active: true });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.bankAccounts.getAll();
      setAccounts(res.data.data || []);
    } catch { toast.error('Gagal memuat rekening'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ bank_name: 'BCA', account_number: '', account_holder: '', is_active: true });
    setEditMode(false); setCurrentId(null); setShowModal(true);
  };

  const openEdit = (a: any) => {
    setForm({ bank_name: a.bank_name, account_number: a.account_number, account_holder: a.account_holder, is_active: a.is_active });
    setEditMode(true); setCurrentId(a.id); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editMode && currentId) {
        await adminAPI.bankAccounts.update(currentId, form);
        toast.success('Rekening berhasil diupdate!');
      } else {
        await adminAPI.bankAccounts.create(form);
        toast.success('Rekening berhasil ditambahkan!');
      }
      setShowModal(false); fetchData();
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach((m: any) => toast.error(m));
      else toast.error('Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus rekening ini?')) return;
    try { await adminAPI.bankAccounts.delete(id); toast.success('Dihapus!'); fetchData(); }
    catch { toast.error('Gagal menghapus'); }
  };

  const handleToggle = async (id: number) => {
    try { await adminAPI.bankAccounts.toggleStatus(id); toast.success('Status diubah!'); fetchData(); }
    catch { toast.error('Gagal mengubah status'); }
  };

  const getBankStyle = (name: string) => BANK_OPTIONS.find(b => b.name === name) || BANK_OPTIONS[BANK_OPTIONS.length - 1];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            Rekening Bank
          </h1>
          <p className="text-neutral-600 mt-1">Kelola rekening bank untuk pembayaran pelanggan</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus size={18} /><span>Tambah Rekening</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : accounts.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
          <CreditCard size={40} className="text-neutral-300 mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-neutral-700 mb-2">Belum Ada Rekening Bank</h3>
          <p className="text-neutral-500 text-sm mb-6">Tambahkan rekening bank agar pelanggan dapat melakukan pembayaran</p>
          <button onClick={openAdd}
            className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-medium transition-colors inline-flex items-center gap-2">
            <Plus size={18} /><span>Tambah Rekening Pertama</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((a) => {
            const style = getBankStyle(a.bank_name);
            return (
              <div key={a.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${a.is_active ? 'border-neutral-200/80' : 'border-neutral-200/50 opacity-60'}`}>
                <div className="flex items-center gap-5 p-5">
                  {/* Bank Logo */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${style.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-white font-black text-sm tracking-tight">{style.letter}</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-neutral-800">{a.bank_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {a.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="text-lg font-mono font-bold text-neutral-700 tracking-wider">{a.account_number}</p>
                    <p className="text-sm text-neutral-500">a.n. {a.account_holder}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleToggle(a.id)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title={a.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                      {a.is_active ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-neutral-400" />}
                    </button>
                    <button onClick={() => openEdit(a)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={17} /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={17} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-display font-bold">{editMode ? 'Edit Rekening' : 'Tambah Rekening Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Pilih Bank</label>
                <div className="grid grid-cols-4 gap-2">
                  {BANK_OPTIONS.map(b => (
                    <button key={b.name} type="button" onClick={() => setForm({ ...form, bank_name: b.name })}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${form.bank_name === b.name ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'}`}>
                      <div className={`w-8 h-8 bg-gradient-to-br ${b.color} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                        <span className="text-white font-black text-[9px]">{b.letter}</span>
                      </div>
                      <span className="text-[10px] text-neutral-600 font-medium block truncate">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nomor Rekening *</label>
                <input required value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="1234567890" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Atas Nama *</label>
                <input required value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="PT. Gumilar Transport" />
              </div>
              <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-neutral-700">Aktif (tampilkan ke pelanggan)</span>
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
