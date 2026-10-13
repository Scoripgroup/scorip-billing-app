import React, { useState } from 'react';
import {
  User,
  Wifi,
  CreditCard,
  Activity,
  ShieldCheck,
  Zap,
  RotateCw,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertTriangle,
  Play,
  QrCode
} from 'lucide-react';
import { PPPoEClient, Invoice, GenieACSCPE } from '../types';

interface CustomerPortalProps {
  client: PPPoEClient;
  invoice?: Invoice;
  cpe?: GenieACSCPE;
  onPayInvoice: (invoiceId: string) => void;
  onUpdateWifi: (deviceId: string, ssid24: string, ssid5?: string, password?: string) => void;
  onReportTicket: (title: string, desc: string) => void;
}

export const CustomerPortalModule: React.FC<CustomerPortalProps> = ({
  client,
  invoice,
  cpe,
  onPayInvoice,
  onUpdateWifi,
  onReportTicket
}) => {
  // Wi-Fi form state
  const [wifiSsid, setWifiSsid] = useState(cpe?.ssid24 || 'Bambang_Home_2.4G');
  const [wifiPass, setWifiPass] = useState(cpe?.wifiPassword || 'indonesiahebat2026');
  const [showPass, setShowPass] = useState(false);
  const [isSavingWifi, setIsSavingWifi] = useState(false);
  const [wifiSavedSuccess, setWifiSavedSuccess] = useState(false);

  // Speedtest state
  const [speedtesting, setSpeedtesting] = useState(false);
  const [speedResult, setSpeedResult] = useState<{ dl: number; ul: number; ping: number } | null>(null);

  // Trouble report state
  const [reportTitle, setReportTitle] = useState('Internet Lambat / Tidak Stabil');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleSaveWifi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpe) return;
    setIsSavingWifi(true);
    setTimeout(() => {
      onUpdateWifi(cpe.deviceId, wifiSsid, cpe.ssid5, wifiPass);
      setIsSavingWifi(false);
      setWifiSavedSuccess(true);
      setTimeout(() => setWifiSavedSuccess(false), 3000);
    }, 1200);
  };

  const handleStartSpeedtest = () => {
    setSpeedtesting(true);
    setSpeedResult(null);
    setTimeout(() => {
      setSpeedtesting(false);
      setSpeedResult({
        dl: 48.7,
        ul: 46.2,
        ping: 8
      });
    }, 2500);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    onReportTicket(reportTitle, reportDesc);
    setReportSuccess(true);
    setReportDesc('');
    setTimeout(() => setReportSuccess(false), 3000);
  };

  return (
    <div className="customer-portal-module" style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Welcome & Package Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SELAMAT DATANG DI SELF-SERVICE PORTAL</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{client.fullName}</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ID Pelanggan: <strong>{client.username}</strong> • Lokasi: {client.address}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-good" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
              STATUS INTERNET: AKTIF
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.3rem', color: 'var(--accent-cyan)' }}>
              {client.profile}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Billing Card + Self-Service Wi-Fi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Card 1: Tagihan Aktif */}
        <div className="glass-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <CreditCard size={18} style={{ color: 'var(--accent-emerald)' }} />
              <span>Tagihan &amp; Pembayaran</span>
            </div>
            {invoice && invoice.status === 'PAID' ? (
              <span className="badge badge-paid">LUNAS</span>
            ) : (
              <span className="badge badge-warning">BELUM LUNAS</span>
            )}
          </div>

          {invoice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No. Faktur: {invoice.invoiceNumber}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: invoice.status === 'PAID' ? 'var(--accent-emerald)' : 'var(--text-primary)', margin: '0.3rem 0' }}>
                  Rp {invoice.totalAmount.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Jatuh Tempo: <strong>{invoice.dueDate}</strong>
                </div>
              </div>

              {invoice.status !== 'PAID' ? (
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: '42px' }}
                  onClick={() => onPayInvoice(invoice.id)}
                >
                  <QrCode size={16} />
                  <span>Bayar Tagihan Sekarang (QRIS Instan)</span>
                </button>
              ) : (
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)', fontSize: '0.82rem', textAlign: 'center', fontWeight: 600 }}>
                  Terima kasih! Tagihan Anda telah lunas.
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Tidak ada tagihan tertunggak saat ini.
            </div>
          )}
        </div>

        {/* Card 2: Pengaturan Wi-Fi Mandiri via GenieACS TR-069 */}
        <div className="glass-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <Wifi size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Ganti Nama Wi-Fi &amp; Password</span>
            </div>
            <span className="badge badge-active">TR-069 SYNCED</span>
          </div>

          <form onSubmit={handleSaveWifi}>
            <div className="form-group">
              <label className="form-label">Nama Wi-Fi Anda (SSID)</label>
              <input
                type="text"
                className="form-input"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kata Sandi Wi-Fi Baru</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {wifiSavedSuccess && (
              <div style={{ padding: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} />
                <span>Wi-Fi berhasil diubah dan diterapkan langsung ke modem Anda!</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={isSavingWifi}
            >
              <Save size={15} />
              <span>{isSavingWifi ? 'Menerapkan ke Modem...' : 'Simpan Nama & Kata Sandi Wi-Fi'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Grid: Speedtest & Report Trouble */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Speedtest Box */}
        <div className="glass-panel" style={{ margin: 0, textAlign: 'center' }}>
          <div className="panel-header">
            <div className="panel-title">
              <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Uji Kecepatan Koneksi (Speedtest)</span>
            </div>
          </div>

          <div style={{ padding: '1.5rem 0' }}>
            {speedResult ? (
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DOWNLOAD</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {speedResult.dl} <span style={{ fontSize: '0.9rem' }}>Mbps</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UPLOAD</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                    {speedResult.ul} <span style={{ fontSize: '0.9rem' }}>Mbps</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PING</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                    {speedResult.ping} <span style={{ fontSize: '0.9rem' }}>ms</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {speedtesting ? 'Menguji kecepatan server SCORIP POP Pusat...' : 'Klik tombol di bawah untuk mengukur kecepatan kabel fiber optik Anda'}
              </div>
            )}

            <button
              className="btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={handleStartSpeedtest}
              disabled={speedtesting}
            >
              <Play size={15} />
              <span>{speedtesting ? 'Sedang Menguji...' : 'Mulai Speedtest'}</span>
            </button>
          </div>
        </div>

        {/* Lapor Gangguan */}
        <div className="glass-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <AlertTriangle size={18} style={{ color: 'var(--accent-amber)' }} />
              <span>Pusat Bantuan &amp; Lapor Gangguan</span>
            </div>
          </div>

          <form onSubmit={handleSendReport}>
            <div className="form-group">
              <label className="form-label">Kategori Kendala</label>
              <select
                className="form-select"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              >
                <option value="Internet Lambat / Tidak Stabil">Internet Lambat / Tidak Stabil</option>
                <option value="Lampu Indikator LOS Merah Menyala">Lampu Indikator LOS Merah Menyala</option>
                <option value="Permintaan Pemindahan Titik Modem (Relokasi)">Permintaan Pemindahan Titik Modem (Relokasi)</option>
                <option value="Lainnya">Pertanyaan Lainnya</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Keterangan Tambahan</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Jelaskan detail kendala Anda..."
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                required
              />
            </div>

            {reportSuccess && (
              <div style={{ padding: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Tiket berhasil dikirim ke tim teknisi SCORIP! Nomor tiket akan dikirimkan ke WhatsApp Anda.
              </div>
            )}

            <button type="submit" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <span>Kirim Laporan ke Tim NOC</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
