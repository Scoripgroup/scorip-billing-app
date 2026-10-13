import React, { useState } from 'react';
import {
  Users,
  Sliders,
  Activity,
  Settings,
  Radio,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ShieldAlert,
  Clock,
  RefreshCw,
  Zap,
  Lock,
  Unlock,
  ArrowRight,
  Save,
  AlertTriangle,
  ShieldCheck,
  Key,
  Network,
  DollarSign
} from 'lucide-react';
import { PPPoEClient, BandwidthProfile, MikrotikRouter } from '../types';

interface PppoeModuleProps {
  activeSubPage: 'users' | 'profiles' | 'sessions' | 'settings';
  onSelectSubPage: (page: 'users' | 'profiles' | 'sessions' | 'settings') => void;
  clients: PPPoEClient[];
  profiles: BandwidthProfile[];
  routers: MikrotikRouter[];
  onAddClient: (client: Omit<PPPoEClient, 'id'>) => void;
  onEditClient: (client: PPPoEClient) => void;
  onDeleteClient: (id: string) => void;
  onToggleClientIsolir: (id: string) => void;
  onKickSession: (username: string) => void;
  onAddProfile: (profile: BandwidthProfile) => void;
  onEditProfile?: (profile: BandwidthProfile) => void;
  onDeleteProfile: (id: string) => void;
  onSimulateAutoIsolir: () => void;
}

export const PppoeModule: React.FC<PppoeModuleProps> = ({
  activeSubPage,
  onSelectSubPage,
  clients,
  profiles,
  routers,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onToggleClientIsolir,
  onKickSession,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  onSimulateAutoIsolir
}) => {
  // USER CRUD STATE
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ISOLATED'>('ALL');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PPPoEClient | null>(null);

  // Form User State
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('123456');
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('081');
  const [formAddress, setFormAddress] = useState('');
  const [formProfile, setFormProfile] = useState(profiles[0]?.name || 'HOME-20MBPS');
  const [formIpAddress, setFormIpAddress] = useState('100.64.12.');
  const [formOdpId, setFormOdpId] = useState('ODP-01');
  const [formOdpPort, setFormOdpPort] = useState(1);
  const [formOntSerial, setFormOntSerial] = useState('ZTEGC');

  // PROFIL CRUD STATE
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BandwidthProfile | null>(null);
  const [profName, setProfName] = useState('');
  const [profRateLimit, setProfRateLimit] = useState('');
  const [profPool, setProfPool] = useState('pool-pppoe-dhcp');
  const [profPrice, setProfPrice] = useState(175000);
  const [profDesc, setProfDesc] = useState('');

  // SESSION STATE
  const [sessionSearch, setSessionSearch] = useState('');
  const [isRefreshingSessions, setIsRefreshingSessions] = useState(false);

  // SETTINGS STATE (Isolir Configuration)
  const [isolirEnabled, setIsolirEnabled] = useState(true);
  const [isolirCronTime, setIsolirCronTime] = useState('00:00:00');
  const [isolirGraceDays, setIsolirGraceDays] = useState(0);
  const [selectedIsolirProfile, setSelectedIsolirProfile] = useState('ISOLIR-PROFILE');
  const [isolirRateLimit, setIsolirRateLimit] = useState('128k/128k');
  const [isolirPool, setIsolirPool] = useState('pool-isolir-redirect');
  const [redirectPort, setRedirectPort] = useState(8080);
  const [redirectUrl, setRedirectUrl] = useState('http://billing.scorip.net/isolir');
  const [autoCoaDisconnect, setAutoCoaDisconnect] = useState(true);
  const [sendWaOnIsolir, setSendWaOnIsolir] = useState(true);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Active Sessions: clients who have status 'ACTIVE'
  const activeSessions = clients.filter((c) => c.status === 'ACTIVE');

  // Filtered Users
  const filteredUsers = clients.filter((c) => {
    if (userStatusFilter === 'ACTIVE' && c.status !== 'ACTIVE') return false;
    if (userStatusFilter === 'ISOLATED' && c.status !== 'ISOLATED') return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        c.username.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.ipAddress.toLowerCase().includes(q) ||
        c.ontSerial.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Sessions
  const filteredSessions = activeSessions.filter((s) => {
    if (sessionSearch.trim()) {
      const q = sessionSearch.toLowerCase();
      return (
        s.username.toLowerCase().includes(q) ||
        s.fullName.toLowerCase().includes(q) ||
        s.ipAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handlers: User
  const handleOpenAddUser = () => {
    setFormUsername(`user${Math.floor(100 + Math.random() * 900)}`);
    setFormPassword('123456');
    setFormFullName('');
    setFormPhone('0812');
    setFormAddress('');
    setFormProfile(profiles[0]?.name || 'HOME-20MBPS');
    setFormIpAddress(`100.64.12.${Math.floor(20 + Math.random() * 150)}`);
    setFormOdpId('ODP-01');
    setFormOdpPort(Math.floor(1 + Math.random() * 8));
    setFormOntSerial(`ZTEGC${Math.floor(100000 + Math.random() * 900000)}`);
    setIsAddUserOpen(true);
  };

  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProfObj = profiles.find((p) => p.name === formProfile);
    onAddClient({
      username: formUsername.trim(),
      password: formPassword.trim(),
      fullName: formFullName.trim(),
      phone: formPhone.trim(),
      address: formAddress.trim(),
      profile: formProfile,
      ipAddress: formIpAddress.trim(),
      macAddress: 'E4:8D:8C:' + Math.random().toString(16).substring(2, 8).toUpperCase(),
      routerId: routers[0]?.id || 'MK-POP-PUSAT',
      odpId: formOdpId,
      odpPort: formOdpPort,
      status: 'ACTIVE',
      uptime: '0d 00:01:00',
      downloadBytes: '0 MB',
      uploadBytes: '0 MB',
      monthlyFee: selectedProfObj ? selectedProfObj.price : 175000,
      ontSerial: formOntSerial.trim()
    });
    setIsAddUserOpen(false);
  };

  const handleOpenEditUser = (client: PPPoEClient) => {
    setEditingUser(client);
    setFormFullName(client.fullName);
    setFormPhone(client.phone);
    setFormAddress(client.address);
    setFormProfile(client.profile);
    setFormIpAddress(client.ipAddress);
    setFormOdpId(client.odpId);
    setFormOdpPort(client.odpPort);
    setFormOntSerial(client.ontSerial);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const selectedProfObj = profiles.find((p) => p.name === formProfile);
    onEditClient({
      ...editingUser,
      fullName: formFullName.trim(),
      phone: formPhone.trim(),
      address: formAddress.trim(),
      profile: formProfile,
      ipAddress: formIpAddress.trim(),
      odpId: formOdpId,
      odpPort: formOdpPort,
      ontSerial: formOntSerial.trim(),
      monthlyFee: selectedProfObj ? selectedProfObj.price : editingUser.monthlyFee
    });
    setEditingUser(null);
  };

  // Handlers: Profil
  const handleOpenAddProfile = () => {
    setProfName('');
    setProfRateLimit('20M/20M');
    setProfPool('pool-pppoe-dhcp');
    setProfPrice(175000);
    setProfDesc('');
    setEditingProfile(null);
    setIsAddProfileOpen(true);
  };

  const handleOpenEditProfile = (p: BandwidthProfile) => {
    setProfName(p.name);
    setProfRateLimit(p.rateLimit);
    setProfPool(p.pool);
    setProfPrice(p.price);
    setProfDesc(p.description || '');
    setEditingProfile(p);
    setIsAddProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profRateLimit.trim()) return;

    if (editingProfile) {
      if (onEditProfile) {
        onEditProfile({
          ...editingProfile,
          name: profName.trim().toUpperCase(),
          rateLimit: profRateLimit.trim(),
          pool: profPool.trim(),
          price: profPrice,
          description: profDesc.trim()
        });
      } else {
        // Fallback: delete old and add updated
        onDeleteProfile(editingProfile.id);
        onAddProfile({
          id: editingProfile.id,
          name: profName.trim().toUpperCase(),
          rateLimit: profRateLimit.trim(),
          pool: profPool.trim(),
          price: profPrice,
          description: profDesc.trim()
        });
      }
    } else {
      onAddProfile({
        id: `PROF-${Date.now()}`,
        name: profName.trim().toUpperCase(),
        rateLimit: profRateLimit.trim(),
        pool: profPool.trim(),
        price: profPrice,
        description: profDesc.trim()
      });
    }
    setIsAddProfileOpen(false);
  };

  // Handlers: Sessions Refresh
  const handleRefreshSessions = () => {
    setIsRefreshingSessions(true);
    setTimeout(() => {
      setIsRefreshingSessions(false);
    }, 600);
  };

  // Handlers: Save Settings
  const handleSaveIsolirSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3500);
  };

  return (
    <div className="pppoe-module">
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Network size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Layanan PPPoE (Point-to-Point Protocol over Ethernet)</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Manajemen Komprehensif: User Secrets, Bandwidth Profiles, Active Sessions &amp; Kebijakan Isolir Otomatis
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="status-pill online">
              <span className="dot"></span>
              <span>{activeSessions.length} SESI PPPOE ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Menu Navigation Tabs (Under PPPOE Group) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          className={`tab-btn ${activeSubPage === 'users' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('users')}
        >
          <Users size={16} />
          <span>User ({clients.length})</span>
        </button>

        <button
          className={`tab-btn ${activeSubPage === 'profiles' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('profiles')}
        >
          <Sliders size={16} />
          <span>Profil ({profiles.length})</span>
        </button>

        <button
          className={`tab-btn ${activeSubPage === 'sessions' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('sessions')}
        >
          <Activity size={16} />
          <span>Session ({activeSessions.length} Aktif)</span>
        </button>

        <button
          className={`tab-btn ${activeSubPage === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('settings')}
        >
          <Settings size={16} />
          <span>Settings (Isolir Pelanggan)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* SUB-MENU 1: USER (CRUD USER PPPOE)                             */}
      {/* ============================================================== */}
      {activeSubPage === 'users' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Manajemen User PPPoE (Secrets Pelanggan)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Kelola akun autentikasi PPPoE, penetapan profil paket, IP address statik/pool, dan status isolir
              </p>
            </div>
            <button className="btn-primary" onClick={handleOpenAddUser}>
              <Plus size={15} />
              <span>Tambah User PPPoE Baru</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
                placeholder="Cari user, nama, IP, serial ONT..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`tab-btn ${userStatusFilter === 'ALL' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={() => setUserStatusFilter('ALL')}
              >
                Semua ({clients.length})
              </button>
              <button
                className={`tab-btn ${userStatusFilter === 'ACTIVE' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={() => setUserStatusFilter('ACTIVE')}
              >
                Aktif ({clients.filter((c) => c.status === 'ACTIVE').length})
              </button>
              <button
                className={`tab-btn ${userStatusFilter === 'ISOLATED' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={() => setUserStatusFilter('ISOLATED')}
              >
                Terisolir ({clients.filter((c) => c.status === 'ISOLATED').length})
              </button>
            </div>
          </div>

          {/* User Data Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username PPPoE</th>
                  <th>Nama Pelanggan &amp; Kontak</th>
                  <th>Paket / Profil</th>
                  <th>IP Address</th>
                  <th>ODP / Port</th>
                  <th>Serial ONT</th>
                  <th>Status Layanan</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Tidak ada data user PPPoE yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Key size={13} style={{ color: 'var(--accent-cyan)' }} />
                          <code style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{client.username}</code>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{client.fullName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{client.phone}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{client.profile}</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Rp {client.monthlyFee.toLocaleString('id-ID')}/bln
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{client.ipAddress}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                          {client.odpId} #{client.odpPort}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{client.ontSerial}</td>
                      <td>
                        <span className={`badge ${client.status === 'ACTIVE' ? 'badge-good' : 'badge-critical'}`}>
                          {client.status === 'ACTIVE' ? 'AKTIF' : 'TERISOLIR'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn-icon"
                            style={{ color: client.status === 'ACTIVE' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}
                            title={client.status === 'ACTIVE' ? 'Isolir Akun PPPoE' : 'Buka Isolir Akun PPPoE'}
                            onClick={() => onToggleClientIsolir(client.id)}
                          >
                            {client.status === 'ACTIVE' ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                          <button
                            className="btn-icon"
                            title="Edit User PPPoE"
                            onClick={() => handleOpenEditUser(client)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn-icon text-danger"
                            title="Hapus User PPPoE"
                            onClick={() => {
                              if (confirm(`Hapus user "${client.username}" (${client.fullName})?`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-MENU 2: PROFIL (CRUD PROFIL PPPOE)                         */}
      {/* ============================================================== */}
      {activeSubPage === 'profiles' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Manajemen Profil Paket PPPoE</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Daftar profil kecepatan bandwidth, pembagian IP remote pool, dan penentuan tarif bulanan
              </p>
            </div>
            <button className="btn-primary" onClick={handleOpenAddProfile}>
              <Plus size={15} />
              <span>Tambah Profil Paket Baru</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {profiles.map((prof) => {
              const userCount = clients.filter((c) => c.profile === prof.name).length;
              return (
                <div
                  key={prof.id}
                  style={{
                    padding: '1.25rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sliders size={18} style={{ color: 'var(--accent-cyan)' }} />
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{prof.name}</strong>
                    </div>
                    <span className="badge badge-active">{userCount} Pelanggan</span>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      {prof.description || 'Profil layanan bandwidth PPPoE'}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Rate Limit: </span>
                        <strong style={{ color: 'var(--accent-cyan)' }}>{prof.rateLimit}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Pool: </span>
                        <span>{prof.pool}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tarif Bulanan:</span>
                      <div style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '1rem' }}>
                        Rp {prof.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        className="btn-icon"
                        title="Edit Profil"
                        onClick={() => handleOpenEditProfile(prof)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn-icon text-danger"
                        title="Hapus Profil"
                        disabled={profiles.length <= 1}
                        onClick={() => {
                          if (confirm(`Hapus profil "${prof.name}"?`)) {
                            onDeleteProfile(prof.id);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-MENU 3: SESSION (MELIHAT SESSION AKTIF)                    */}
      {/* ============================================================== */}
      {activeSubPage === 'sessions' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Monitoring Sesi Aktif PPPoE (Active Sessions)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Sesi koneksi yang sedang online secara realtime pada Router MikroTik / FreeRADIUS
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={handleRefreshSessions}
              disabled={isRefreshingSessions}
            >
              <RefreshCw size={14} className={isRefreshingSessions ? 'spin' : ''} />
              <span>{isRefreshingSessions ? 'Memperbarui...' : 'Refresh Sesi'}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Sesi Aktif</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {activeSessions.length} Koneksi
              </div>
            </div>
            <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Protokol Autentikasi</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                FreeRADIUS MS-CHAPv2
              </div>
            </div>
            <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CoA RFC 3576 Port</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                UDP 3799 (READY)
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div style={{ marginBottom: '1rem', maxWidth: '320px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              placeholder="Cari user sesi, IP..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
            />
          </div>

          {/* Sessions Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Nama Pelanggan</th>
                  <th>IP Address Assigned</th>
                  <th>MAC Address (Caller ID)</th>
                  <th>Uptime Koneksi</th>
                  <th>Traffic RX / TX</th>
                  <th>Profil Bandwidth</th>
                  <th style={{ textAlign: 'center' }}>Aksi Kick Sesi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Tidak ada sesi PPPoE aktif saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{session.username}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{session.fullName}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{session.ipAddress}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{session.macAddress}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{session.uptime}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        ↓ {session.downloadBytes} / ↑ {session.uploadBytes}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{session.profile}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-danger"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                          title="Kirim RADIUS CoA Disconnect Packet (RFC 3576)"
                          onClick={() => onKickSession(session.username)}
                        >
                          <Zap size={12} />
                          <span>Kick CoA</span>
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

      {/* ============================================================== */}
      {/* SUB-MENU 4: SETTINGS (PENGATURAN ISOLIR PELANGGAN PPPOE)        */}
      {/* ============================================================== */}
      {activeSubPage === 'settings' && (
        <div className="glass-panel" style={{ maxWidth: '800px' }}>
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Pengaturan Isolir Pelanggan PPPoE (Auto-Isolir &amp; CoA Engine)</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Konfigurasi jadwal pemutusan otomatis, profil isolir, pengalihan landing page, dan pemutusan sesi via CoA
              </p>
            </div>
            <span className="badge badge-active">Active Engine</span>
          </div>

          {settingsSavedToast && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={16} />
              <span>Konfigurasi kebijakan isolir PPPoE berhasil disimpan dan diterapkan ke RouterOS API!</span>
            </div>
          )}

          <form onSubmit={handleSaveIsolirSettings}>
            {/* Bagian 1: Cron Jadwal Auto Isolir */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>1. Jadwal Eksekusi Auto-Isolir Harian (Cron Job)</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Status Auto-Isolir</label>
                  <select
                    className="form-select"
                    value={isolirEnabled ? 'ENABLE' : 'DISABLE'}
                    onChange={(e) => setIsolirEnabled(e.target.value === 'ENABLE')}
                  >
                    <option value="ENABLE">AKTIF (Eksekusi Otomatis Tiap Hari)</option>
                    <option value="DISABLE">NON-AKTIF (Hanya Isolir Manual)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Jam Eksekusi Pemutusan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={isolirCronTime}
                    onChange={(e) => setIsolirCronTime(e.target.value)}
                    placeholder="00:00:00"
                  />
                  <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Standar eksekusi: Pukul 00:00:00 (Tengah Malam)</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Toleransi Jatuh Tempo (Grace Period)</label>
                  <select
                    className="form-select"
                    value={isolirGraceDays}
                    onChange={(e) => setIsolirGraceDays(+e.target.value)}
                  >
                    <option value={0}>H+0 (Langsung isolir saat tanggal jatuh tempo)</option>
                    <option value={1}>H+1 (Toleransi 1 hari setelah jatuh tempo)</option>
                    <option value={2}>H+2 (Toleransi 2 hari)</option>
                    <option value={3}>H+3 (Toleransi 3 hari)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian 2: Profil & Pool Isolir */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ShieldAlert size={18} style={{ color: 'var(--accent-rose)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>2. Profil &amp; IP Pool Isolir MikroTik</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Profil Isolir yang Diterapkan</label>
                  <select
                    className="form-select"
                    value={selectedIsolirProfile}
                    onChange={(e) => setSelectedIsolirProfile(e.target.value)}
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.rateLimit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Limit Kecepatan Isolir (Rate Limit)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={isolirRateLimit}
                    onChange={(e) => setIsolirRateLimit(e.target.value)}
                    placeholder="128k/128k"
                  />
                  <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cukup untuk membuka web pembayaran tagihan</small>
                </div>

                <div className="form-group">
                  <label className="form-label">IP Pool Isolir (NAT Redirect)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={isolirPool}
                    onChange={(e) => setIsolirPool(e.target.value)}
                    placeholder="pool-isolir-redirect"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Web Proxy & Landing Page Redirect */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ArrowRight size={18} style={{ color: 'var(--accent-amber)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>3. Pengalihan Landing Page Isolir (Web Proxy)</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Port Web Proxy MikroTik</label>
                  <input
                    type="number"
                    className="form-input"
                    value={redirectPort}
                    onChange={(e) => setRedirectPort(+e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">URL Halaman Informasi Isolir &amp; Pembayaran</label>
                  <input
                    type="text"
                    className="form-input"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                  />
                  <small style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Pelanggan yang terisolir akan otomatis diarahkan ke URL ini saat membuka browser
                  </small>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoCoaDisconnect}
                    onChange={(e) => setAutoCoaDisconnect(e.target.checked)}
                  />
                  <span>Kirim Paket RADIUS CoA Disconnect (RFC 3576) otomatis agar router memutuskan sesi seketika</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sendWaOnIsolir}
                    onChange={(e) => setSendWaOnIsolir(e.target.checked)}
                  />
                  <span>Kirim pesan WhatsApp otomatis ke pelanggan saat layanan diisolir</span>
                </label>
              </div>
            </div>

            {/* Tombol Simpan & Uji Tindakan */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={onSimulateAutoIsolir}
                  title="Langsung jalankan pemeriksaan faktur jatuh tempo & isolir sekarang"
                >
                  <Zap size={14} />
                  <span>Jalankan Cron Isolir Sekarang</span>
                </button>
              </div>

              <button type="submit" className="btn-primary">
                <Save size={15} />
                <span>Simpan Pengaturan Isolir</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH USER PPPOE BARU                                  */}
      {/* ============================================================== */}
      {isAddUserOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Tambah User PPPoE Baru (Secret Pelanggan)</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsAddUserOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveAddUser}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username PPPoE</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="bambang-net"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password PPPoE</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="123456"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Pelanggan</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="Bpk. Bambang Supriyadi"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp / HP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="081234567890"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Pemasangan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Jl. Sunset Road No. 88, Kuta"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Pilihan Paket Profil</label>
                    <select
                      className="form-select"
                      value={formProfile}
                      onChange={(e) => setFormProfile(e.target.value)}
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.rateLimit} - Rp {p.price.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">IP Address Statik</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formIpAddress}
                      onChange={(e) => setFormIpAddress(e.target.value)}
                      placeholder="100.64.12.50"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">ODP Box</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formOdpId}
                      onChange={(e) => setFormOdpId(e.target.value)}
                      placeholder="ODP-KUTA-01"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Port ODP (1-16)</label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      className="form-input"
                      value={formOdpPort}
                      onChange={(e) => setFormOdpPort(+e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serial Number ONT</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formOntSerial}
                      onChange={(e) => setFormOntSerial(e.target.value)}
                      placeholder="ZTEGC123456"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddUserOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Daftarkan User PPPoE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT USER PPPOE                                         */}
      {/* ============================================================== */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Edit User PPPoE: {editingUser.username}
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setEditingUser(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveEditUser}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
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
                    <label className="form-label">No. Telepon / WA</label>
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
                  <label className="form-label">Alamat</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Paket Profil</label>
                    <select
                      className="form-select"
                      value={formProfile}
                      onChange={(e) => setFormProfile(e.target.value)}
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.rateLimit} - Rp {p.price.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">ODP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formOdpId}
                      onChange={(e) => setFormOdpId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Port ODP</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formOdpPort}
                      onChange={(e) => setFormOdpPort(+e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serial ONT</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formOntSerial}
                      onChange={(e) => setFormOntSerial(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan Perubahan User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH / EDIT PROFIL PAKET                             */}
      {/* ============================================================== */}
      {isAddProfileOpen && (
        <div className="modal-overlay" onClick={() => setIsAddProfileOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  {editingProfile ? 'Edit Profil Bandwidth PPPoE' : 'Tambah Profil Bandwidth Baru'}
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setIsAddProfileOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Rate Limit (Upload/Download)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: 75M/75M"
                      value={profRateLimit}
                      onChange={(e) => setProfRateLimit(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remote Address Pool</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="pool-pppoe-dhcp"
                      value={profPool}
                      onChange={(e) => setProfPool(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Harga Langganan / Bulan (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profPrice}
                    onChange={(e) => setProfPrice(+e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi / Sasaran Paket</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Paket Gamer & Streaming 4K Ultra"
                    value={profDesc}
                    onChange={(e) => setProfDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddProfileOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingProfile ? 'Simpan Perubahan' : 'Tambahkan Profil'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
