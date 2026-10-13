import React, { useState } from 'react';
import {
  Server,
  Users,
  Ticket,
  Shield,
  Sliders,
  RefreshCw,
  Plus,
  Printer,
  Trash2,
  Lock,
  Unlock,
  Radio,
  Edit2,
  Check,
  X,
  Search
} from 'lucide-react';
import { MikrotikRouter, PPPoEClient, HotspotVoucher, BandwidthProfile } from '../types';

interface MikrotikModuleProps {
  routers: MikrotikRouter[];
  clients: PPPoEClient[];
  vouchers: HotspotVoucher[];
  profiles: BandwidthProfile[];
  initialSubTab?: 'sessions' | 'secrets' | 'vouchers' | 'profiles' | 'radius';
  onToggleClientIsolir: (clientId: string) => void;
  onKickSession: (username: string) => void;
  onGenerateVouchers: (profile: string, duration: string, price: number, count: number) => void;
  onAddClient: (client: Omit<PPPoEClient, 'id'>) => void;
  onEditClient: (client: PPPoEClient) => void;
  onDeleteClient: (clientId: string) => void;
  onAddRouter: (router: MikrotikRouter) => void;
  onDeleteRouter: (routerId: string) => void;
  onAddProfile: (profile: BandwidthProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  onDeleteVoucher: (code: string) => void;
}

export const MikrotikModule: React.FC<MikrotikModuleProps> = ({
  routers,
  clients,
  vouchers,
  profiles,
  initialSubTab,
  onToggleClientIsolir,
  onKickSession,
  onGenerateVouchers,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onAddRouter,
  onDeleteRouter,
  onAddProfile,
  onDeleteProfile,
  onDeleteVoucher
}) => {
  const [selectedRouterId, setSelectedRouterId] = useState<string>(routers[0]?.id || '');
  const [subTab, setSubTab] = useState<'sessions' | 'secrets' | 'vouchers' | 'profiles' | 'radius'>(initialSubTab || 'secrets');

  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [clientFilter, setClientFilter] = useState<'ALL' | 'ACTIVE' | 'ISOLATED'>('ALL');
  const [clientSearch, setClientSearch] = useState<string>('');
  
  // Modals state
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<PPPoEClient | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [isAddRouterOpen, setIsAddRouterOpen] = useState(false);
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);

  // Form States: Client
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formProfile, setFormProfile] = useState(profiles[0]?.name || 'HOME-20MBPS');
  const [formIpAddress, setFormIpAddress] = useState('100.64.12.');
  const [formOdpId, setFormOdpId] = useState('ODP-01');
  const [formOdpPort, setFormOdpPort] = useState(1);
  const [formOntSerial, setFormOntSerial] = useState('ZTEGC');

  // Form States: Router
  const [routerName, setRouterName] = useState('');
  const [routerIp, setRouterIp] = useState('');
  const [routerType, setRouterType] = useState<'CCR2004' | 'RB4011' | 'CHR-Cloud' | 'CCR1036'>('CCR2004');
  const [routerApiPort, setRouterApiPort] = useState(8728);

  // Form States: Profile
  const [profName, setProfName] = useState('');
  const [profRateLimit, setProfRateLimit] = useState('');
  const [profPool, setProfPool] = useState('pool-pppoe-dhcp');
  const [profPrice, setProfPrice] = useState(200000);

  // Voucher Generator State
  const [voucherProfile, setVoucherProfile] = useState('HS-2JAM-10MBPS');
  const [voucherDuration, setVoucherDuration] = useState('2 Jam');
  const [voucherPrice, setVoucherPrice] = useState(3000);
  const [voucherCount, setVoucherCount] = useState(5);
  const [activeThermalVoucher, setActiveThermalVoucher] = useState<HotspotVoucher | null>(null);

  const selectedRouter = routers.find((r) => r.id === selectedRouterId) || routers[0];

  const filteredClients = clients.filter((c) => {
    if (clientFilter === 'ACTIVE' && c.status !== 'ACTIVE') return false;
    if (clientFilter === 'ISOLATED' && c.status !== 'ISOLATED') return false;
    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      return (
        c.username.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.ipAddress.toLowerCase().includes(q) ||
        c.ontSerial.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAddClient = () => {
    setFormUsername(`user${Math.floor(100 + Math.random() * 900)}`);
    setFormFullName('');
    setFormPhone('081');
    setFormAddress('');
    setFormProfile(profiles[0]?.name || 'HOME-20MBPS');
    setFormIpAddress(`100.64.12.${Math.floor(20 + Math.random() * 150)}`);
    setFormOdpId('ODP-01');
    setFormOdpPort(Math.floor(1 + Math.random() * 8));
    setFormOntSerial(`ZTEGC${Math.floor(100000 + Math.random() * 900000)}`);
    setIsAddClientOpen(true);
  };

  const handleSaveAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProfObj = profiles.find((p) => p.name === formProfile);
    onAddClient({
      username: formUsername,
      fullName: formFullName,
      phone: formPhone,
      address: formAddress,
      profile: formProfile,
      ipAddress: formIpAddress,
      macAddress: 'E4:8D:8C:' + Math.random().toString(16).substring(2, 8).toUpperCase(),
      routerId: selectedRouterId,
      odpId: formOdpId,
      odpPort: formOdpPort,
      status: 'ACTIVE',
      uptime: '0d 00:01:00',
      downloadBytes: '0 MB',
      uploadBytes: '0 MB',
      monthlyFee: selectedProfObj ? selectedProfObj.price : 200000,
      ontSerial: formOntSerial
    });
    setIsAddClientOpen(false);
  };

  const handleOpenEditClient = (client: PPPoEClient) => {
    setEditingClient(client);
    setFormFullName(client.fullName);
    setFormPhone(client.phone);
    setFormAddress(client.address);
    setFormProfile(client.profile);
    setFormIpAddress(client.ipAddress);
    setFormOdpId(client.odpId);
    setFormOdpPort(client.odpPort);
    setFormOntSerial(client.ontSerial);
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    const selectedProfObj = profiles.find((p) => p.name === formProfile);
    onEditClient({
      ...editingClient,
      fullName: formFullName,
      phone: formPhone,
      address: formAddress,
      profile: formProfile,
      ipAddress: formIpAddress,
      odpId: formOdpId,
      odpPort: formOdpPort,
      ontSerial: formOntSerial,
      monthlyFee: selectedProfObj ? selectedProfObj.price : editingClient.monthlyFee
    });
    setEditingClient(null);
  };

  const handleSaveAddRouter = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRouter({
      id: `MK-${Date.now()}`,
      name: routerName,
      ip: routerIp,
      rosVersion: 'RouterOS v7.16',
      type: routerType,
      cpuLoad: 15,
      ramUsage: 25,
      uptime: '1 day 02:00:00',
      activePppoe: 0,
      status: 'ONLINE',
      apiPort: routerApiPort
    });
    setRouterName('');
    setRouterIp('');
    setIsAddRouterOpen(false);
  };

  const handleSaveAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProfile({
      id: `PROF-${Date.now()}`,
      name: profName,
      rateLimit: profRateLimit,
      pool: profPool,
      price: profPrice
    });
    setProfName('');
    setProfRateLimit('');
    setIsAddProfileOpen(false);
  };

  return (
    <div className="mikrotik-module">
      {/* Header Panel with Router Selector */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Multi-MikroTik Router &amp; FreeRADIUS Orchestrator</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                RouterOS v7 REST API / v6 API &amp; FreeRADIUS v3 Dual-Engine (CoA RFC 3576 Active)
              </p>
            </div>
          </div>

          {/* Router Selection Dropdown & Add Router Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pilih Router:</span>
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="form-select"
              style={{ width: '260px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            >
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.ip})
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={() => setIsAddRouterOpen(true)} title="Tambah Node Router MikroTik Baru">
              <Plus size={14} />
              <span>Tambah Router</span>
            </button>
            {routers.length > 1 && (
              <button
                className="btn-danger"
                onClick={() => onDeleteRouter(selectedRouterId)}
                title="Hapus Router Terpilih dari Cluster"
                style={{ padding: '0.45rem' }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Selected Router Quick Telemetry Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Versi RouterOS: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{selectedRouter?.rosVersion}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>CPU Load: </span>
            <strong style={{ color: selectedRouter?.cpuLoad > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              {selectedRouter?.cpuLoad}%
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>RAM Usage: </span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedRouter?.ramUsage}%</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Uptime: </span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedRouter?.uptime}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Sesi PPPoE Aktif: </span>
            <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{selectedRouter?.activePppoe} User</strong>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-active">API PORT: {selectedRouter?.apiPort} OK</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          className={`tab-btn ${subTab === 'secrets' ? 'active' : ''}`}
          onClick={() => setSubTab('secrets')}
        >
          <Users size={16} />
          <span>PPPoE Secrets &amp; Pelanggan ({clients.length})</span>
        </button>
        <button
          className={`tab-btn ${subTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setSubTab('sessions')}
        >
          <Radio size={16} />
          <span>Active Sessions &amp; Kick CoA</span>
        </button>
        <button
          className={`tab-btn ${subTab === 'vouchers' ? 'active' : ''}`}
          onClick={() => setSubTab('vouchers')}
        >
          <Ticket size={16} />
          <span>Hotspot &amp; Cetak Voucher ({vouchers.length})</span>
        </button>
        <button
          className={`tab-btn ${subTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setSubTab('profiles')}
        >
          <Sliders size={16} />
          <span>Bandwidth Profiles ({profiles.length})</span>
        </button>
        <button
          className={`tab-btn ${subTab === 'radius' ? 'active' : ''}`}
          onClick={() => setSubTab('radius')}
        >
          <Shield size={16} />
          <span>FreeRADIUS &amp; Userman Status</span>
        </button>
      </div>

      {/* SUBTAB 1: PPPoE Secrets & Pelanggan (CRUD) */}
      {subTab === 'secrets' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Daftar Pelanggan PPPoE</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  className={`btn-secondary ${clientFilter === 'ALL' ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => setClientFilter('ALL')}
                >
                  Semua ({clients.length})
                </button>
                <button
                  className={`btn-secondary ${clientFilter === 'ACTIVE' ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => setClientFilter('ACTIVE')}
                >
                  Aktif ({clients.filter((c) => c.status === 'ACTIVE').length})
                </button>
                <button
                  className={`btn-secondary ${clientFilter === 'ISOLATED' ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  onClick={() => setClientFilter('ISOLATED')}
                >
                  Terisolir ({clients.filter((c) => c.status === 'ISOLATED').length})
                </button>
              </div>

              {/* Quick Search */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Cari user, IP, SN..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2rem', height: '32px', fontSize: '0.78rem' }}
                />
              </div>
            </div>

            <button className="btn-primary" onClick={handleOpenAddClient}>
              <Plus size={14} />
              <span>+ Tambah Pelanggan PPPoE</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username PPPoE</th>
                  <th>Nama &amp; Kontak</th>
                  <th>Paket Internet</th>
                  <th>IP Address</th>
                  <th>ODP &amp; Port</th>
                  <th>Status Layanan</th>
                  <th>Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {client.username}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        SN: {client.ontSerial}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.fullName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{client.phone}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{client.profile}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Rp {client.monthlyFee.toLocaleString('id-ID')}/bln
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{client.ipAddress}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{client.odpId}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Port #{client.odpPort}</div>
                    </td>
                    <td>
                      {client.status === 'ACTIVE' && <span className="badge badge-active">AKTIF</span>}
                      {client.status === 'ISOLATED' && <span className="badge badge-isolated">TERISOLIR</span>}
                      {client.status === 'OFFLINE' && <span className="badge badge-warning">OFFLINE</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* Isolir / Buka */}
                        {client.status === 'ACTIVE' ? (
                          <button
                            className="btn-danger"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                            onClick={() => onToggleClientIsolir(client.id)}
                            title="Isolir Layanan"
                          >
                            <Lock size={12} />
                          </button>
                        ) : (
                          <button
                            className="btn-success"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                            onClick={() => onToggleClientIsolir(client.id)}
                            title="Buka Isolir"
                          >
                            <Unlock size={12} />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                          onClick={() => handleOpenEditClient(client)}
                          title="Edit Data Pelanggan"
                        >
                          <Edit2 size={12} />
                        </button>

                        {/* Delete Button */}
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem', color: 'var(--accent-rose)' }}
                          onClick={() => setDeletingClientId(client.id)}
                          title="Hapus Pelanggan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Active Sessions & Kick */}
      {subTab === 'sessions' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Sesi PPPoE &amp; Hotspot Aktif Real-Time</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Tersinkronisasi otomatis via MikroTik `/ppp active print` dan RADIUS Accounting
              </p>
            </div>
            <span className="badge badge-active">{clients.filter((c) => c.status === 'ACTIVE').length} Online Sesi</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Caller ID (MAC)</th>
                  <th>Uptime Sesi</th>
                  <th>Total TX (Download)</th>
                  <th>Total RX (Upload)</th>
                  <th>Aksi Putus (CoA PoD)</th>
                </tr>
              </thead>
              <tbody>
                {clients.filter((c) => c.status === 'ACTIVE').map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {c.username}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{c.ipAddress}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.macAddress}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{c.uptime}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{c.downloadBytes}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{c.uploadBytes}</td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--accent-rose)' }}
                        onClick={() => onKickSession(c.username)}
                        title="Kirim RADIUS Packet of Disconnect (RFC 3576)"
                      >
                        <RefreshCw size={12} />
                        <span>Kick Session</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Hotspot & Cetak Voucher */}
      {subTab === 'vouchers' && (
        <div>
          {/* Generator Form */}
          <div className="glass-panel" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Generator Voucher Hotspot Massal (MikroTik / Userman)</span>
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); onGenerateVouchers(voucherProfile, voucherDuration, voucherPrice, voucherCount); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Profil Kecepatan</label>
                <select
                  value={voucherProfile}
                  onChange={(e) => {
                    setVoucherProfile(e.target.value);
                    if (e.target.value === 'HS-2JAM-10MBPS') {
                      setVoucherDuration('2 Jam');
                      setVoucherPrice(3000);
                    } else if (e.target.value === 'HS-1HARI-15MBPS') {
                      setVoucherDuration('24 Jam');
                      setVoucherPrice(10000);
                    } else {
                      setVoucherDuration('7 Hari');
                      setVoucherPrice(35000);
                    }
                  }}
                  className="form-select"
                >
                  <option value="HS-2JAM-10MBPS">Hotspot 2 Jam - 10 Mbps (Rp3.000)</option>
                  <option value="HS-1HARI-15MBPS">Hotspot 1 Hari - 15 Mbps (Rp10.000)</option>
                  <option value="HS-7HARI-20MBPS">Hotspot 7 Hari - 20 Mbps (Rp35.000)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Durasi Masa Aktif</label>
                <input
                  type="text"
                  value={voucherDuration}
                  readOnly
                  className="form-input"
                  style={{ background: 'var(--bg-primary)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  value={voucherPrice}
                  onChange={(e) => setVoucherPrice(+e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Jumlah Voucher Dibuat</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={voucherCount}
                  onChange={(e) => setVoucherCount(+e.target.value)}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ height: '40px' }}>
                <Ticket size={16} />
                <span>Generate Voucher</span>
              </button>
            </form>
          </div>

          {/* Vouchers List */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Ticket size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span>Daftar Voucher Hotspot Aktif</span>
              </div>
              <span className="badge badge-active">{vouchers.length} Total Voucher</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {vouchers.map((v) => (
                <div
                  key={v.code}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-neutral">{v.profile}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                        Rp {v.price.toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => onDeleteVoucher(v.code)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer' }}
                        title="Hapus Voucher"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KODE VOUCHER LOGIN:</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {v.code}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Durasi: {v.duration} • Status: {v.status}
                    </div>
                  </div>

                  <button
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
                    onClick={() => setActiveThermalVoucher(v)}
                  >
                    <Printer size={14} />
                    <span>Cetak Struk Thermal (58mm/80mm)</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Bandwidth Profiles (CRUD) */}
      {subTab === 'profiles' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Profil Paket Kecepatan (PPP Profiles &amp; Queues)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Terkonfigurasi otomatis di FreeRADIUS Group &amp; MikroTik `/ppp profile`
              </p>
            </div>
            <button className="btn-primary" style={{ fontSize: '0.78rem' }} onClick={() => setIsAddProfileOpen(true)}>
              <Plus size={14} />
              <span>Tambah Profil Paket</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Profil</th>
                  <th>Rate Limit (Rx / Tx)</th>
                  <th>IP Pool</th>
                  <th>Harga Bulanan</th>
                  <th>Keterangan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id}>
                    <td><strong style={{ color: p.name.includes('ISOLIR') ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>{p.name}</strong></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{p.rateLimit}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{p.pool}</td>
                    <td><strong>Rp {p.price.toLocaleString('id-ID')}</strong></td>
                    <td><span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.description || '-'}</span></td>
                    <td>
                      {!p.name.includes('ISOLIR') && (
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--accent-rose)' }}
                          onClick={() => onDeleteProfile(p.id)}
                          title="Hapus Profil"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 5: FreeRADIUS & Userman Status */}
      {subTab === 'radius' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Shield size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>FreeRADIUS v3 &amp; MikroTik User Manager v7 Telemetry</span>
            </div>
            <span className="badge badge-active">AAA SERVICE READY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                FreeRADIUS v3 Server Details
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Host: <code>10.200.0.1 (Dedicated VM Linux Debian 12)</code></li>
                <li>Authentication Port: <code>UDP 1812 (Active)</code></li>
                <li>Accounting Port: <code>UDP 1813 (Active)</code></li>
                <li>CoA / PoD Port: <code>UDP 3799 (RFC 3576 / RFC 5176 Active)</code></li>
                <li>Database Backend: <code>PostgreSQL 16 (radcheck, radacct)</code></li>
              </ul>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
                MikroTik User Manager (v7.16 Embedded)
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Integrasi: <code>Radius Client NAS ID: {selectedRouter?.name}</code></li>
                <li>Incoming CoA Requests: <code>Enabled (Port 3799)</code></li>
                <li>Interim Update Interval: <code>00:05:00 (Setiap 5 Menit)</code></li>
                <li>Dynamic Queue Type: <code>PCQ (Per-Connection Queuing)</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH PELANGGAN PPPoE BARU */}
      {isAddClientOpen && (
        <div className="modal-overlay" onClick={() => setIsAddClientOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>+ Tambah Pelanggan PPPoE Baru</h3>
              <button className="btn-icon" onClick={() => setIsAddClientOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAddClient}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username PPPoE</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Paket Internet</label>
                    <select
                      className="form-select"
                      value={formProfile}
                      onChange={(e) => setFormProfile(e.target.value)}
                    >
                      {profiles.filter((p) => !p.name.includes('ISOLIR')).map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} (Rp {p.price.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Pemasangan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">IP Address Statik/Pool</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formIpAddress}
                      onChange={(e) => setFormIpAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ODP &amp; Port</label>
                    <select
                      className="form-select"
                      value={formOdpId}
                      onChange={(e) => setFormOdpId(e.target.value)}
                    >
                      <option value="ODP-01">ODP-KUTA-01</option>
                      <option value="ODP-02">ODP-KUTA-02</option>
                      <option value="ODP-03">ODP-KUTA-03</option>
                      <option value="ODP-04">ODP-LEGIAN-01</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Port Dropcore</label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      className="form-input"
                      value={formOdpPort}
                      onChange={(e) => setFormOdpPort(+e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Serial Number Modem ONT</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formOntSerial}
                    onChange={(e) => setFormOntSerial(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddClientOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Simpan Pelanggan ke MikroTik &amp; RADIUS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PELANGGAN PPPoE */}
      {editingClient && (
        <div className="modal-overlay" onClick={() => setEditingClient(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Edit Pelanggan: {editingClient.username}</h3>
              <button className="btn-icon" onClick={() => setEditingClient(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEditClient}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Paket Internet</label>
                  <select
                    className="form-select"
                    value={formProfile}
                    onChange={(e) => setFormProfile(e.target.value)}
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} (Rp {p.price.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Pemasangan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">IP Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formIpAddress}
                      onChange={(e) => setFormIpAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serial Number ONT</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formOntSerial}
                      onChange={(e) => setFormOntSerial(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingClient(null)}>
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

      {/* MODAL 3: KONFIRMASI HAPUS PELANGGAN */}
      {deletingClientId && (
        <div className="modal-overlay" onClick={() => setDeletingClientId(null)}>
          <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-rose)' }}>Konfirmasi Hapus</h3>
              <button className="btn-icon" onClick={() => setDeletingClientId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem' }}>
                Apakah Anda yakin ingin menghapus pelanggan ini dari sistem? Akun PPPoE Secret di router MikroTik dan database RADIUS akan dihapus permanen.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeletingClientId(null)}>
                Batal
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  onDeleteClient(deletingClientId);
                  setDeletingClientId(null);
                }}
              >
                <Trash2 size={14} />
                <span>Ya, Hapus Pelanggan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: TAMBAH ROUTER BARU */}
      {isAddRouterOpen && (
        <div className="modal-overlay" onClick={() => setIsAddRouterOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>+ Tambah Router MikroTik Baru</h3>
              <button className="btn-icon" onClick={() => setIsAddRouterOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAddRouter}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Router / Identitas NAS</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: CCR2004-POP-BARAT"
                    value={routerName}
                    onChange={(e) => setRouterName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IP Address API / Gateway</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="103.147.223.1"
                    value={routerIp}
                    onChange={(e) => setRouterIp(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tipe Router</label>
                    <select
                      className="form-select"
                      value={routerType}
                      onChange={(e) => setRouterType(e.target.value as any)}
                    >
                      <option value="CCR2004">MikroTik CCR2004</option>
                      <option value="RB4011">MikroTik RB4011</option>
                      <option value="CHR-Cloud">CHR Cloud VM</option>
                      <option value="CCR1036">MikroTik CCR1036</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Port API (default: 8728)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={routerApiPort}
                      onChange={(e) => setRouterApiPort(+e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddRouterOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Hubungkan Router</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: TAMBAH BANDWIDTH PROFILE */}
      {isAddProfileOpen && (
        <div className="modal-overlay" onClick={() => setIsAddProfileOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>+ Tambah Profil Kecepatan Baru</h3>
              <button className="btn-icon" onClick={() => setIsAddProfileOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAddProfile}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Profil Paket</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: HOME-75MBPS"
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rate Limit (Rx / Tx)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 75M/75M"
                    value={profRateLimit}
                    onChange={(e) => setProfRateLimit(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">IP Pool</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profPool}
                      onChange={(e) => setProfPool(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Harga Bulanan (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={profPrice}
                      onChange={(e) => setProfPrice(+e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddProfileOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Simpan Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Struk Thermal Bluetooth (58mm/80mm) */}
      {activeThermalVoucher && (
        <div className="modal-overlay" onClick={() => setActiveThermalVoucher(null)}>
          <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontWeight: 700 }}>Pratinjau Struk Thermal POS</span>
              </div>
              <button className="btn-icon" onClick={() => setActiveThermalVoucher(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ background: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
              <div className="thermal-receipt" id="printable-voucher-receipt">
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                  SCORIP HOTSPOT NET
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.72rem' }}>
                  Jl. Pantai Kuta No. 42B, Bali<br />
                  Telp: 0812-3456-7890
                </div>
                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span>Tgl: 28/09/2026</span>
                  <span>Jam: 22:00</span>
                </div>
                <div style={{ fontSize: '0.72rem' }}>Paket: {activeThermalVoucher.profile}</div>
                <div style={{ fontSize: '0.72rem' }}>Durasi: {activeThermalVoucher.duration}</div>
                <hr />
                <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>KODE LOGIN VOUCHER</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '2px', padding: '0.2rem', border: '2px solid #000', margin: '0.4rem 0' }}>
                    {activeThermalVoucher.code}
                  </div>
                  <div style={{ fontSize: '0.7rem' }}>Buka browser &amp; akses:<br /><strong>http://hotspot.scorip.net</strong></div>
                </div>
                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  <span>TOTAL:</span>
                  <span>Rp {activeThermalVoucher.price.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.68rem', marginTop: '0.75rem' }}>
                  Terima kasih telah menggunakan<br />layanan internet cepat SCORIP!
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setActiveThermalVoucher(null)}>
                Tutup
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={15} />
                <span>Cetak Nota Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
