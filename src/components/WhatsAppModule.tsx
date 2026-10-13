import React, { useState } from 'react';
import {
  MessageSquare,
  Smartphone,
  Send,
  CheckCheck,
  Check,
  Radio,
  Sliders,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { WhatsAppLog, PPPoEClient, ODPPoint, WATemplate } from '../types';

interface WhatsAppModuleProps {
  logs: WhatsAppLog[];
  templates: WATemplate[];
  clients: PPPoEClient[];
  odps: ODPPoint[];
  onSendBroadcast: (target: string, message: string) => void;
  onAddTemplate: (tpl: Omit<WATemplate, 'id'>) => void;
  onEditTemplate: (tpl: WATemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onDeleteLog: (id: string) => void;
}

export const WhatsAppModule: React.FC<WhatsAppModuleProps> = ({
  logs = [],
  templates = [],
  clients = [],
  odps = [],
  onSendBroadcast,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDeleteLog
}) => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'templates' | 'bot_simulator' | 'logs'>('broadcast');

  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'UNPAID' | 'ODP_01' | 'ODP_04'>('ALL');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'PEMBERITAHUAN PEMELIHARAAN JARINGAN:\nHalo Pelanggan Setia SCORIP, akan dilakukan optimasi kabel fiber optik di area Anda pada pukul 01:00 - 04:00 WITA. Layanan internet akan terganggu sementara. Terima kasih atas pengertiannya.'
  );
  const [isSending, setIsSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WATemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<{
    name: string;
    category: 'TAGIHAN' | 'KWITANSI' | 'ISOLIR' | 'BROADCAST';
    content: string;
  }>({
    name: '',
    category: 'TAGIHAN',
    content: ''
  });

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    { sender: 'bot', text: 'Halo! Selamat datang di WhatsApp Center SCORIP Fiber Net. 🌐\n\nSilakan pilih menu bantuan:\n1️⃣ Cek Tagihan Internet Anda\n2️⃣ Dapatkan Kode QRIS Pembayaran\n3️⃣ Cek Status Redaman Sinyal Wi-Fi\n4️⃣ Hubungkan ke Petugas NOC / CS', time: '22:00' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      onSendBroadcast(broadcastTarget, broadcastMessage);
      setIsSending(false);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 3000);
    }, 1500);
  };

  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      category: 'TAGIHAN',
      content: 'Halo Kak {nama}, tagihan internet Anda periode ini sebesar Rp {total}. Bayar di {link_bayar}'
    });
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (tpl: WATemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      category: tpl.category,
      content: tpl.content
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name.trim() || !templateForm.content.trim()) return;

    if (editingTemplate) {
      onEditTemplate({
        ...editingTemplate,
        name: templateForm.name.trim(),
        category: templateForm.category,
        content: templateForm.content.trim()
      });
    } else {
      onAddTemplate({
        name: templateForm.name.trim(),
        category: templateForm.category,
        content: templateForm.content.trim()
      });
    }
    setShowTemplateModal(false);
  };

  const handleApplyTemplateToBroadcast = (content: string) => {
    setBroadcastMessage(content);
    setActiveTab('broadcast');
  };

  const handleUserChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newChat = [...chatMessages, { sender: 'user' as const, text: userText, time: '22:15' }];
    setChatMessages(newChat);
    setChatInput('');

    // Automated bot responses
    setTimeout(() => {
      let botReply = 'Maaf, perintah tidak dikenali. Ketik 1 untuk Cek Tagihan, 2 untuk Bayar QRIS, 3 untuk Cek Sinyal, atau 4 untuk Bantuan CS.';
      if (userText === '1') {
        botReply = '📄 TAGIHAN INTERNET ANDA:\nBpk Bambang Supriyadi (bambang-ftth)\nPaket: Ultra Fast Fiber 50 Mbps\nTotal Tagihan: Rp 277.500 (Termasuk PPN 11%)\nJatuh Tempo: 05 Oktober 2026\nStatus: BELUM LUNAS\n\nKetik 2 untuk mendapatkan kode QRIS pelunasan otomatis.';
      } else if (userText === '2') {
        botReply = '💳 KODE PEMBAYARAN QRIS DINAMIS:\nSilakan klik tautan resmi berikut untuk membayar via GoPay, BCA, Dana, atau Mandiri:\nhttps://pay.scorip.net/inv/001\n\nBegitu bayar, sistem akan membuka isolir internet Anda dalam 5 detik!';
      } else if (userText === '3') {
        botReply = '📡 STATUS MODEM & SINYAL FTTH ANDA:\nONT Model: ZTE F670L\nRedaman Optik: -18.72 dBm (SANGAT BAGUS)\nPerangkat Terhubung: 8 Gadget\nStatus Kabel: NORMAL (Tidak ada gangguan)';
      } else if (userText === '4') {
        botReply = '👨‍💻 Petugas Helpdesk NOC kami telah menerima permintaan bantuan Anda. Tim kami akan segera merespon pesan ini dalam 2 menit. Mohon menunggu.';
      }

      setChatMessages((prev) => [...prev, { sender: 'bot', text: botReply, time: '22:15' }]);
    }, 800);
  };

  return (
    <div className="whatsapp-module">
      {/* Device Status Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>WhatsApp Gateway Multi-Device &amp; Notification Center</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Baileys v6 Socket Engine &amp; WA Cloud API: Billing Reminder, Kwitansi Otomatis, &amp; Targeted Broadcast
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="status-pill online">
              <span className="dot"></span>
              <span>NOMOR AKTIF: 0812-3456-7890 (TERHUBUNG)</span>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.75rem' }}>
              <RefreshCw size={13} />
              <span>Cek Sesi Sinyal WA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcast')}
        >
          <Send size={16} />
          <span>Broadcast Target Jaringan</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'bot_simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('bot_simulator')}
        >
          <Bot size={16} />
          <span>Interactive Chatbot Simulator</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <Sliders size={16} />
          <span>Template Notifikasi Tagihan ({templates.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <CheckCheck size={16} />
          <span>Log Pesan Terkirim ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: TARGETED BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Kirim Pesan Massal Terarah (Targeted Broadcast)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Kirim pesan pemberitahuan gangguan/maintenance secara spesifik hanya ke pelanggan pada ODP / ODC tertentu
              </p>
            </div>
            <span className="badge badge-active">Anti-Ban Jitter 2-5 Detik Active</span>
          </div>

          <form onSubmit={handleSendBroadcast} style={{ maxWidth: '720px' }}>
            <div className="form-group">
              <label className="form-label">Pilih Target Penerima Broadcast</label>
              <select
                className="form-select"
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value as any)}
              >
                <option value="ALL">Semua Pelanggan Aktif ({clients.length} Kontak)</option>
                <option value="UNPAID">Hanya Pelanggan yang Belum Bayar Tagihan</option>
                <option value="ODP_01">Pelanggan di ODP-KUTA-01 (Area Pantai Kuta)</option>
                <option value="ODP_04">Pelanggan di ODP-LEGIAN-01 (Area Gang Sandat)</option>
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Isi Pesan WhatsApp</label>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setActiveTab('templates')}
                >
                  <Sliders size={12} />
                  <span>Pilih dari Template</span>
                </button>
              </div>
              <textarea
                className="form-textarea"
                rows={6}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                required
              />
              <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Mendukung format standar WhatsApp (*tebal*, _miring_, kode tautan).
              </small>
            </div>

            {broadcastSuccess && (
              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} />
                <span>Pesan broadcast berhasil diantrekan ke BullMQ Redis dan sedang dikirim secara bertahap!</span>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isSending}>
              <Send size={15} />
              <span>{isSending ? 'Mengirim ke Antrean WhatsApp...' : 'Mulai Kirim Broadcast Sekarang'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: CHATBOT SIMULATOR */}
      {activeTab === 'bot_simulator' && (
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center' }}>
          {/* Smartphone Mockup Frame */}
          <div
            style={{
              width: '380px',
              height: '620px',
              background: '#0b141a',
              borderRadius: '32px',
              border: '6px solid #2a3942',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* WhatsApp Phone Header */}
            <div style={{ background: '#202c33', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #222d34' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold' }}>
                SC
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#e9edef', fontWeight: 600, fontSize: '0.9rem' }}>SCORIP Billing Center</div>
                <div style={{ color: '#8696a0', fontSize: '0.7rem' }}>Akun Bisnis Resmi • Online</div>
              </div>
            </div>

            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                background: '#0b141a'
              }}
            >
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? '#005c4b' : '#202c33',
                    color: '#e9edef',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap',
                    position: 'relative',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {msg.text}
                  <div style={{ textAlign: 'right', fontSize: '0.62rem', color: '#8696a0', marginTop: '0.2rem' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleUserChat} style={{ background: '#202c33', padding: '0.6rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ketik 1, 2, 3, atau 4..."
                style={{
                  flex: 1,
                  background: '#2a3942',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '0.5rem 1rem',
                  color: '#e9edef',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#00a884',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES (CRUD) */}
      {activeTab === 'templates' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Template Notifikasi Tagihan &amp; Pesan Otomatis</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Kelola template pesan penagihan, kwitansi, isolir, dan broadcast pemeliharaan
              </p>
            </div>
            <button className="btn-primary" onClick={handleOpenAddTemplate}>
              <Plus size={15} />
              <span>Tambah Template Baru</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {templates.map((tpl) => (
              <div key={tpl.id} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{
                      color: tpl.category === 'TAGIHAN' ? 'var(--accent-cyan)' :
                             tpl.category === 'KWITANSI' ? 'var(--accent-emerald)' :
                             tpl.category === 'ISOLIR' ? 'var(--accent-rose)' : 'var(--accent-amber)',
                      fontSize: '0.88rem'
                    }}>
                      {tpl.name}
                    </strong>
                    <span className="badge badge-active">{tpl.category}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', whiteSpace: 'pre-wrap', lineHeight: 1.45, minHeight: '80px' }}>
                    {tpl.content}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', gap: '0.3rem' }}
                    onClick={() => handleApplyTemplateToBroadcast(tpl.content)}
                  >
                    <span>Pakai ke Broadcast</span>
                    <ArrowRight size={12} />
                  </button>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      className="btn-icon"
                      title="Edit Template"
                      onClick={() => handleOpenEditTemplate(tpl)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon text-danger"
                      title="Hapus Template"
                      onClick={() => {
                        if (confirm(`Hapus template "${tpl.name}"?`)) {
                          onDeleteTemplate(tpl.id);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LOGS (CRUD) */}
      {activeTab === 'logs' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Log Riwayat Pesan WhatsApp Terkirim</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Daftar pesan notifikasi otomatis dan broadcast yang telah terkirim ke pelanggan
              </p>
            </div>
            <span className="badge badge-active">{logs.length} Logged Messages</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. WhatsApp</th>
                  <th>Penerima</th>
                  <th>Kategori Pesan</th>
                  <th>Pratinjau Pesan</th>
                  <th>Waktu Kirim</th>
                  <th>Status Pengiriman</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Tidak ada log pesan WhatsApp yang tersimpan.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{log.recipientPhone}</td>
                      <td style={{ fontWeight: 600 }}>{log.recipientName}</td>
                      <td>
                        <span className="badge badge-neutral">{log.category}</span>
                      </td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.78rem' }}>
                        {log.message}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{log.timestamp}</td>
                      <td>
                        <span className="badge badge-good" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCheck size={13} />
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-icon text-danger"
                          title="Hapus Log Pesan"
                          onClick={() => onDeleteLog(log.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT TEMPLATE WA */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  {editingTemplate ? 'Edit Template WhatsApp' : 'Tambah Template WhatsApp Baru'}
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowTemplateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveTemplate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Template</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Reminder Tagihan H-1"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategori Notifikasi</label>
                  <select
                    className="form-select"
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value as any })}
                  >
                    <option value="TAGIHAN">Tagihan / Billing Reminder</option>
                    <option value="KWITANSI">Kwitansi Lunas Instan</option>
                    <option value="ISOLIR">Pemberitahuan Isolir</option>
                    <option value="BROADCAST">Broadcast Pemeliharaan Jaringan</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Isi Pesan WhatsApp</label>
                  <textarea
                    className="form-textarea"
                    rows={5}
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    placeholder="Ketik isi template..."
                    required
                  />
                  <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Tag variabel dinamis: <code style={{ color: 'var(--accent-cyan)' }}>{'{nama}'}</code>, <code style={{ color: 'var(--accent-cyan)' }}>{'{total}'}</code>, <code style={{ color: 'var(--accent-cyan)' }}>{'{jatuh_tempo}'}</code>, <code style={{ color: 'var(--accent-cyan)' }}>{'{link_bayar}'}</code>, <code style={{ color: 'var(--accent-cyan)' }}>{'{link_kwitansi}'}</code>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingTemplate ? 'Simpan Perubahan' : 'Tambah Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
