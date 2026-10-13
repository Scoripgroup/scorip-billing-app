import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  DollarSign,
  Server,
  Radio,
  Send,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Ticket
} from 'lucide-react';
import {
  MikrotikRouter,
  PPPoEClient,
  OLTDevice,
  RegisteredONU,
  Invoice,
  TroubleTicket
} from '../types';

interface DashboardOverviewProps {
  routers: MikrotikRouter[];
  clients: PPPoEClient[];
  olts: OLTDevice[];
  onus: RegisteredONU[];
  invoices: Invoice[];
  tickets: TroubleTicket[];
  onNavigateTab: (tab: string) => void;
  onOpenQuickProvision: () => void;
  onSimulateAutoIsolir: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  routers,
  clients,
  olts,
  onus,
  invoices,
  tickets,
  onNavigateTab,
  onOpenQuickProvision,
  onSimulateAutoIsolir
}) => {
  // Live fluctuating traffic generator for real-time MRTG experience
  const [downloadMbps, setDownloadMbps] = useState(842.5);
  const [uploadMbps, setUploadMbps] = useState(214.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setDownloadMbps((prev) => +(prev + (Math.random() * 20 - 10)).toFixed(1));
      setUploadMbps((prev) => +(prev + (Math.random() * 8 - 4)).toFixed(1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length;
  const isolatedClients = clients.filter((c) => c.status === 'ISOLATED').length;
  const offlineClients = clients.filter((c) => c.status === 'OFFLINE').length;

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const unpaidRevenue = invoices
    .filter((inv) => inv.status !== 'PAID')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Optical power categorization
  const goodSignal = onus.filter((o) => o.rxPowerDbm >= -22 && o.status !== 'LOS').length;
  const warningSignal = onus.filter(
    (o) => o.rxPowerDbm < -22 && o.rxPowerDbm >= -26 && o.status !== 'LOS'
  ).length;
  const criticalSignal = onus.filter((o) => o.rxPowerDbm < -26 || o.status === 'LOS').length;

  return (
    <div className="dashboard-overview">
      {/* Top Metric Cards */}
      <div className="grid-stats">
        {/* Total Pelanggan */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('mikrotik')}>
          <div className="stat-card-header">
            <span className="stat-title">Total Pelanggan</span>
            <span className="stat-value">{totalClients}</span>
            <div className="stat-subtext">
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                {activeClients} Aktif
              </span>
              <span>•</span>
              <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                {isolatedClients} Terisolir
              </span>
              <span>•</span>
              <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                {offlineClients} LOS
              </span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <Users size={22} />
          </div>
        </div>

        {/* Realtime Bandwidth Aggregated */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Trafik Total Jaringan (BNG)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
                {downloadMbps}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mbps DL</span>
            </div>
            <div className="stat-subtext">
              <ArrowDownLeft size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span>DL: {downloadMbps} Mbps</span>
              <span>•</span>
              <ArrowUpRight size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span>UL: {uploadMbps} Mbps</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
            <Activity size={22} />
          </div>
        </div>

        {/* Pendapatan Terkumpul */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('billing')}>
          <div className="stat-card-header">
            <span className="stat-title">Pendapatan Bulan Ini (Lunas)</span>
            <span className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
              Rp {(totalRevenue / 1000).toLocaleString('id-ID')}k
            </span>
            <div className="stat-subtext">
              <span style={{ color: 'var(--accent-rose)' }}>
                Rp {(unpaidRevenue / 1000).toLocaleString('id-ID')}k Belum Terbayar
              </span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <DollarSign size={22} />
          </div>
        </div>

        {/* Kesehatan Optik OLT & ODP */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('olt')}>
          <div className="stat-card-header">
            <span className="stat-title">Kualitas Sinyal Optik FTTH</span>
            <span className="stat-value">
              {Math.round((goodSignal / (onus.length || 1)) * 100)}%
            </span>
            <div className="stat-subtext">
              <span style={{ color: 'var(--accent-emerald)' }}>{goodSignal} Bagus</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-amber)' }}>{warningSignal} Waspada</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-rose)' }}>{criticalSignal} Kritis</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Radio size={22} />
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Aksi Cepat Jaringan (Fast NOC Actions):</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onOpenQuickProvision}>
              <Radio size={15} />
              <span>1-Click Provisioning ONT Baru</span>
            </button>
            <button className="btn-secondary" onClick={() => onNavigateTab('mikrotik')}>
              <Ticket size={15} />
              <span>Cetak Voucher Hotspot</span>
            </button>
            <button className="btn-secondary" onClick={() => onNavigateTab('whatsapp')}>
              <Send size={15} />
              <span>Broadcast WA Tagihan</span>
            </button>
            <button className="btn-danger" onClick={onSimulateAutoIsolir}>
              <ShieldAlert size={15} />
              <span>Eksekusi Auto-Isolir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Live Bandwidth Wave & Optical Telemetry */}
      <div className="grid-2col">
        {/* Real-time Traffic Graph Box */}
        <div className="glass-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Live BNG Traffic Poller (MRTG Realtime)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
                Download: {downloadMbps} Mbps
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
                Upload: {uploadMbps} Mbps
              </span>
            </div>
          </div>

          {/* SVG Animated Bandwidth Wave */}
          <div className="traffic-canvas-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
            <svg viewBox="0 0 500 120" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-emerald)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--accent-emerald)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Download wave path */}
              <path
                d={`M 0,90 Q 75,${40 + (downloadMbps % 15)} 150,${70 - (downloadMbps % 10)} T 300,${50 + (downloadMbps % 20)} T 450,${65 - (downloadMbps % 8)} L 500,75 L 500,120 L 0,120 Z`}
                fill="url(#cyanGrad)"
              />
              <path
                d={`M 0,90 Q 75,${40 + (downloadMbps % 15)} 150,${70 - (downloadMbps % 10)} T 300,${50 + (downloadMbps % 20)} T 450,${65 - (downloadMbps % 8)} L 500,75`}
                fill="none"
                stroke="var(--accent-cyan)"
                strokeWidth="2.5"
              />
              {/* Upload wave path */}
              <path
                d={`M 0,105 Q 85,${80 + (uploadMbps % 10)} 170,${95 - (uploadMbps % 5)} T 340,${85 + (uploadMbps % 12)} T 460,${90 - (uploadMbps % 6)} L 500,100 L 500,120 L 0,120 Z`}
                fill="url(#emeraldGrad)"
              />
              <path
                d={`M 0,105 Q 85,${80 + (uploadMbps % 10)} 170,${95 - (uploadMbps % 5)} T 340,${85 + (uploadMbps % 12)} T 460,${90 - (uploadMbps % 6)} L 500,100`}
                fill="none"
                stroke="var(--accent-emerald)"
                strokeWidth="2"
              />
            </svg>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
            Data di-refresh setiap 2 detik dari MikroTik CCR2004 via RouterOS API
          </p>
        </div>

        {/* Optical Health & Infrastructure Gauge */}
        <div className="glass-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <Radio size={18} style={{ color: 'var(--accent-amber)' }} />
              <span>Distribusi Redaman Optik (Optical Rx dBm)</span>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => onNavigateTab('gis')}>
              Buka Peta ODC/ODP
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {/* Good */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  Optimal (-15 dBm s/d -22 dBm)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{goodSignal} Pelanggan ({Math.round((goodSignal / onus.length) * 100)}%)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(goodSignal / onus.length) * 100}%`, height: '100%', background: 'var(--accent-emerald)' }}></div>
              </div>
            </div>

            {/* Warning */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                  Waspada (-23 dBm s/d -26 dBm)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{warningSignal} Pelanggan ({Math.round((warningSignal / onus.length) * 100)}%)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(warningSignal / onus.length) * 100}%`, height: '100%', background: 'var(--accent-amber)' }}></div>
              </div>
            </div>

            {/* Critical */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                  Kritis / LOS (&gt; -27 dBm / Putus)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{criticalSignal} Pelanggan ({Math.round((criticalSignal / onus.length) * 100)}%)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(criticalSignal / onus.length) * 100}%`, height: '100%', background: 'var(--accent-rose)' }}></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            <span>
              Perhatian: <strong>ODP-LEGIAN-01</strong> terdeteksi redaman rata-rata <strong>-28.4 dBm</strong>. Teknisi telah ditugaskan (Tiket TCK-9902).
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Hardware Routers & Active Trouble Tickets */}
      <div className="grid-2col">
        {/* Router Hardware List */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Server size={18} style={{ color: 'var(--accent-blue)' }} />
              <span>Multi-MikroTik Cluster Status</span>
            </div>
            <span className="badge badge-active">{routers.length} Active Nodes</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Router Name</th>
                  <th>IP Address</th>
                  <th>CPU Load</th>
                  <th>PPPoE Aktif</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {routers.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{r.name}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.type} • {r.rosVersion}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{r.ip}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '40px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px' }}>
                          <div style={{ width: `${r.cpuLoad}%`, height: '100%', background: r.cpuLoad > 60 ? 'var(--accent-rose)' : 'var(--accent-emerald)', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{r.cpuLoad}%</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.activePppoe}</td>
                    <td>
                      <span className="badge badge-good">ONLINE</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Trouble Tickets */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Ticket size={18} style={{ color: 'var(--accent-rose)' }} />
              <span>Trouble Tickets & Field Force</span>
            </div>
            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => onNavigateTab('tickets')}>
              Lihat Semua Tiket
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '0.85rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                      {t.ticketNumber}
                    </span>
                    <span className={`badge ${t.priority === 'HIGH' ? 'badge-critical' : 'badge-warning'}`}>
                      {t.priority}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.odpCode}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Pelanggan: {t.customerName} ({t.pppoeUser}) • Teknisi: {t.technicianName || 'Belum Ditugaskan'}
                  </div>
                </div>

                <span className={`badge ${t.status === 'ASSIGNED' ? 'badge-warning' : 'badge-neutral'}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
