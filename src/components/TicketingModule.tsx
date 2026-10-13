import React, { useState } from 'react';
import {
  Ticket,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Plus,
  MapPin,
  Check,
  Edit2,
  Trash2,
  Signal
} from 'lucide-react';
import { TroubleTicket, PPPoEClient, ODPPoint } from '../types';

interface TicketingModuleProps {
  tickets: TroubleTicket[];
  clients: PPPoEClient[];
  odps: ODPPoint[];
  onAddTicket: (ticket: Omit<TroubleTicket, 'id' | 'ticketNumber' | 'createdAt'>) => void;
  onEditTicket: (ticket: TroubleTicket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onResolveTicket: (ticketId: string, finalDbm: number) => void;
  onAssignTechnician: (ticketId: string, technicianName: string) => void;
}

export const TicketingModule: React.FC<TicketingModuleProps> = ({
  tickets = [],
  clients = [],
  odps = [],
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
  onResolveTicket,
  onAssignTechnician
}) => {
  // Modal states
  const [resolveTicketModal, setResolveTicketModal] = useState<TroubleTicket | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TroubleTicket | null>(null);

  // Technician resolution form
  const [technicianName, setTechnicianName] = useState('Wayan Putra (Teknisi 02)');
  const [finalDbmInput, setFinalDbmInput] = useState<number>(-19.2);

  // Add Ticket form
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newTechnician, setNewTechnician] = useState('Wayan Putra (Teknisi 02)');
  const [newInitialDbm, setNewInitialDbm] = useState<number>(-29.5);

  // Edit Ticket form
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
    technicianName: string;
    initialDbm: number;
  }>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    technicianName: '',
    initialDbm: -20
  });

  const handleOpenAddTicket = () => {
    setSelectedClientId(clients[0]?.id || '');
    setNewTitle('');
    setNewDesc('');
    setNewPriority('HIGH');
    setNewTechnician('Wayan Putra (Teknisi 02)');
    setNewInitialDbm(-29.5);
    setShowAddModal(true);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    if (!client || !newTitle.trim()) return;

    onAddTicket({
      customerName: client.fullName,
      pppoeUser: client.username,
      phone: client.phone,
      odpCode: client.odpId,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Laporan gangguan dari pelanggan/monitoring sistem.',
      priority: newPriority,
      status: 'ASSIGNED',
      technicianName: newTechnician,
      initialDbm: newInitialDbm
    });

    setShowAddModal(false);
  };

  const handleOpenEditTicket = (t: TroubleTicket) => {
    setEditingTicket(t);
    setEditFormData({
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      technicianName: t.technicianName || 'Wayan Putra (Teknisi 02)',
      initialDbm: t.initialDbm || -20.0
    });
  };

  const handleSaveEditTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    onEditTicket({
      ...editingTicket,
      title: editFormData.title.trim(),
      description: editFormData.description.trim(),
      priority: editFormData.priority,
      status: editFormData.status,
      technicianName: editFormData.technicianName,
      initialDbm: editFormData.initialDbm
    });

    setEditingTicket(null);
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTicketModal) return;
    onResolveTicket(resolveTicketModal.id, finalDbmInput);
    setResolveTicketModal(null);
  };

  return (
    <div className="ticketing-module">
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Trouble Ticketing &amp; Field Force Management</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Siklus Penanganan Insiden Jaringan: Lapor CS → Verifikasi NOC → Dispatch Teknisi → Pengukuran OPM → Selesai
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-warning">
              {tickets.filter((t) => t.status !== 'RESOLVED').length} Tiket Menunggu Selesai
            </span>
            <button className="btn-primary" onClick={handleOpenAddTicket}>
              <Plus size={15} />
              <span>Buat Tiket Gangguan Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Daftar Tiket Gangguan &amp; Perintah Kerja Teknisi (SPK)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total {tickets.length} riwayat tiket gangguan tersimpan dalam sistem
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tickets.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              Tidak ada tiket gangguan saat ini. Klik tombol di atas untuk membuat tiket baru.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                      {t.ticketNumber}
                    </span>
                    <span className={`badge ${t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'badge-critical' : 'badge-warning'}`}>
                      Prioritas {t.priority}
                    </span>
                    <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} />
                      <span>{t.odpCode}</span>
                    </span>
                    {t.initialDbm !== undefined && (
                      <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Signal size={12} />
                        <span>Awal: {t.initialDbm} dBm</span>
                      </span>
                    )}
                    {t.finalDbm !== undefined && (
                      <span className="badge badge-good" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Signal size={12} />
                        <span>Hasil: {t.finalDbm} dBm</span>
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${t.status === 'RESOLVED' ? 'badge-good' : t.status === 'ASSIGNED' ? 'badge-warning' : t.status === 'IN_PROGRESS' ? 'badge-active' : 'badge-critical'}`}>
                      STATUS: {t.status}
                    </span>
                    <button
                      className="btn-icon"
                      title="Edit Tiket"
                      onClick={() => handleOpenEditTicket(t)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon text-danger"
                      title="Hapus Tiket"
                      onClick={() => {
                        if (confirm(`Hapus tiket ${t.ticketNumber} (${t.title})?`)) {
                          onDeleteTicket(t.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {t.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {t.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)' }}>
                    <span>Pelanggan: <strong style={{ color: 'var(--text-primary)' }}>{t.customerName}</strong> ({t.phone})</span>
                    <span>Username: <code style={{ color: 'var(--accent-cyan)' }}>{t.pppoeUser}</code></span>
                    <span>Teknisi Bertugas: <strong style={{ color: 'var(--accent-cyan)' }}>{t.technicianName || 'Belum Ditugaskan'}</strong></span>
                    <span>Dibuat: {t.createdAt}</span>
                  </div>

                  {t.status !== 'RESOLVED' && (
                    <button
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      onClick={() => {
                        setResolveTicketModal(t);
                        setFinalDbmInput(t.initialDbm ? t.initialDbm + 8.5 : -19.2);
                        setTechnicianName(t.technicianName || 'Wayan Putra (Teknisi 02)');
                      }}
                    >
                      <Wrench size={13} />
                      <span>Input Sinyal &amp; Selesaikan Tiket</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL BUAT TIKET GANGGUAN BARU */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={18} style={{ color: 'var(--accent-rose)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Buat Tiket Gangguan / SPK Teknisi Baru</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Pilih Pelanggan Terdampak</label>
                  <select
                    className="form-select"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.username} - {c.odpId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Judul Masalah / Indikasi Gangguan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Lampu LOS Modem Merah Berkedip / Putus Total"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi Kejadian &amp; Catatan Khusus</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Jelaskan detail kendala lapangan..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tingkat Prioritas</label>
                    <select
                      className="form-select"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                    >
                      <option value="CRITICAL">CRITICAL (VIP / Kabel Utama Putus)</option>
                      <option value="HIGH">HIGH (LOS Putus Total)</option>
                      <option value="MEDIUM">MEDIUM (Sinyal Lemah / RTO)</option>
                      <option value="LOW">LOW (Pindah Titik / Konsultasi Wi-Fi)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tugaskan Teknisi</label>
                    <select
                      className="form-select"
                      value={newTechnician}
                      onChange={(e) => setNewTechnician(e.target.value)}
                    >
                      <option value="Wayan Putra (Teknisi 02)">Wayan Putra (Teknisi 02)</option>
                      <option value="Budi Santoso (Teknisi 01)">Budi Santoso (Teknisi 01)</option>
                      <option value="Made Agus (Teknisi Splicer)">Made Agus (Teknisi Splicer)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nilai Redaman Saat Gangguan (dBm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={newInitialDbm}
                    onChange={(e) => setNewInitialDbm(+e.target.value)}
                  />
                  <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Bila indikator LOS merah / mati total, masukkan -40.0 dBm
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Terbitkan Tiket SPK</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT TIKET */}
      {editingTicket && (
        <div className="modal-overlay" onClick={() => setEditingTicket(null)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Edit Tiket {editingTicket.ticketNumber} ({editingTicket.customerName})
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setEditingTicket(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveEditTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Judul Masalah</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi Kendala</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Status Tiket</label>
                    <select
                      className="form-select"
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    >
                      <option value="OPEN">OPEN (Menunggu Penugasan)</option>
                      <option value="ASSIGNED">ASSIGNED (Teknisi Ditugaskan)</option>
                      <option value="IN_PROGRESS">IN_PROGRESS (Sedang Dikerjakan di Lapangan)</option>
                      <option value="RESOLVED">RESOLVED (Telah Selesai)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prioritas</label>
                    <select
                      className="form-select"
                      value={editFormData.priority}
                      onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as any })}
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Teknisi Bertugas</label>
                    <select
                      className="form-select"
                      value={editFormData.technicianName}
                      onChange={(e) => setEditFormData({ ...editFormData, technicianName: e.target.value })}
                    >
                      <option value="Wayan Putra (Teknisi 02)">Wayan Putra (Teknisi 02)</option>
                      <option value="Budi Santoso (Teknisi 01)">Budi Santoso (Teknisi 01)</option>
                      <option value="Made Agus (Teknisi Splicer)">Made Agus (Teknisi Splicer)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sinyal Awal (dBm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={editFormData.initialDbm}
                      onChange={(e) => setEditFormData({ ...editFormData, initialDbm: +e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingTicket(null)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UPDATE PEKERJAAN TEKNISI (RESOLVE) */}
      {resolveTicketModal && (
        <div className="modal-overlay" onClick={() => setResolveTicketModal(null)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Laporan Hasil Perbaikan Teknisi ({resolveTicketModal.ticketNumber})
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setResolveTicketModal(null)}>✕</button>
            </div>

            <form onSubmit={handleResolve}>
              <div className="modal-body">
                <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pelanggan / Lokasi:</div>
                  <strong style={{ fontSize: '0.95rem' }}>{resolveTicketModal.customerName}</strong> ({resolveTicketModal.odpCode})
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {resolveTicketModal.title}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Teknisi Lapangan</label>
                  <select
                    className="form-select"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                  >
                    <option value="Wayan Putra (Teknisi 02)">Wayan Putra (Teknisi 02)</option>
                    <option value="Budi Santoso (Teknisi 01)">Budi Santoso (Teknisi 01)</option>
                    <option value="Made Agus (Teknisi Splicer)">Made Agus (Teknisi Splicer)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hasil Ukur Sinyal OPM Setelah Perbaikan (Rx dBm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={finalDbmInput}
                    onChange={(e) => setFinalDbmInput(+e.target.value)}
                    required
                  />
                  <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Standar redaman optimal SCORIP adalah antara -15 dBm s/d -22 dBm.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setResolveTicketModal(null)}>
                  Batal
                </button>
                <button type="submit" className="btn-success">
                  <Check size={14} />
                  <span>Selesaikan &amp; Tutup Tiket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
