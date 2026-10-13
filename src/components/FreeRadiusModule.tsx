import React, { useState } from 'react';
import {
  Radio,
  Server,
  Database,
  Shield,
  Activity,
  Layers,
  Terminal,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Zap,
  Sliders,
  ExternalLink,
  Code2,
  Cpu
} from 'lucide-react';
import {
  RadiusNasClient,
  RadiusGroupProfile,
  RadiusSessionRecord,
  FreeRadiusServerConfig,
  MikrotikRouter
} from '../types';

interface FreeRadiusModuleProps {
  serverConfig: FreeRadiusServerConfig;
  nasClients: RadiusNasClient[];
  groupProfiles: RadiusGroupProfile[];
  sessions: RadiusSessionRecord[];
  routers: MikrotikRouter[];
  onAddNasClient: (nas: RadiusNasClient) => void;
  onEditNasClient: (nas: RadiusNasClient) => void;
  onDeleteNasClient: (nasId: string) => void;
  onAddGroupProfile: (group: RadiusGroupProfile) => void;
  onEditGroupProfile: (group: RadiusGroupProfile) => void;
  onDeleteGroupProfile: (groupId: string) => void;
  onKickRadiusSession: (username: string, nasIp: string) => void;
  onRestartDaemon?: () => void;
}

export const FreeRadiusModule: React.FC<FreeRadiusModuleProps> = ({
  serverConfig,
  nasClients,
  groupProfiles,
  sessions,
  routers,
  onAddNasClient,
  onEditNasClient,
  onDeleteNasClient,
  onAddGroupProfile,
  onEditGroupProfile,
  onDeleteGroupProfile,
  onKickRadiusSession,
  onRestartDaemon
}) => {
  const [activeTab, setActiveTab] = useState<'nas' | 'profiles' | 'sessions' | 'generator' | 'diagnostic'>('nas');
  const [searchTerm, setSearchTerm] = useState('');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [isAddNasOpen, setIsAddNasOpen] = useState(false);
  const [editingNas, setEditingNas] = useState<RadiusNasClient | null>(null);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<RadiusGroupProfile | null>(null);

  // Form NAS state
  const [formNasIp, setFormNasIp] = useState('');
  const [formNasName, setFormNasName] = useState('');
  const [formNasSecret, setFormNasSecret] = useState('ScoripRadiusSecret2026');
  const [formNasDesc, setFormNasDesc] = useState('');
  const [formNasCoaPort, setFormNasCoaPort] = useState(3799);

  // Form Group state
  const [formGroupName, setFormGroupName] = useState('');
  const [formGroupDesc, setFormGroupDesc] = useState('');
  const [formGroupRate, setFormGroupRate] = useState('25M/25M');
  const [formGroupPool, setFormGroupPool] = useState('pool-pppoe-dhcp');
  const [formGroupDns, setFormGroupDns] = useState('1.1.1.1, 8.8.8.8');
  const [formGroupInterim, setFormGroupInterim] = useState(300);

  // Generator State
  const [selectedNasForGen, setSelectedNasForGen] = useState<string>(nasClients[0]?.id || '');
  const [configSubTab, setConfigSubTab] = useState<'clients' | 'sql' | 'schema' | 'mikrotik' | 'ufw'>('mikrotik');

  // Diagnostic State
  const [diagUsername, setDiagUsername] = useState('pppoe_budi');
  const [diagPassword, setDiagPassword] = useState('password123');
  const [diagNasIp, setDiagNasIp] = useState('10.10.0.2');
  const [diagSecret, setDiagSecret] = useState('ScoripRadiusSecret2026');
  const [diagLogs, setDiagLogs] = useState<string[]>([
    `[INFO] FreeRADIUS v3.2.3 diagnostic suite siap.`,
    `[INFO] MariaDB MySQL connection pool: 10 connections established.`,
    `[INFO] Listening on authentication address * port 1812 (UDP)`,
    `[INFO] Listening on accounting address * port 1813 (UDP)`
  ]);
  const [isTestingAuth, setIsTestingAuth] = useState(false);

  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveNas = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNas) {
      onEditNasClient({
        ...editingNas,
        nasname: formNasIp,
        shortname: formNasName,
        secret: formNasSecret,
        description: formNasDesc,
        coaPort: formNasCoaPort
      });
      setEditingNas(null);
    } else {
      const newNas: RadiusNasClient = {
        id: `NAS-${Date.now().toString().slice(-4)}`,
        nasname: formNasIp,
        shortname: formNasName,
        type: 'mikrotik',
        secret: formNasSecret,
        description: formNasDesc,
        coaPort: formNasCoaPort,
        status: 'ONLINE',
        lastSeen: 'Baru saja'
      };
      onAddNasClient(newNas);
      setIsAddNasOpen(false);
    }
    setFormNasIp('');
    setFormNasName('');
    setFormNasSecret('ScoripRadiusSecret2026');
    setFormNasDesc('');
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      onEditGroupProfile({
        ...editingGroup,
        groupname: formGroupName,
        description: formGroupDesc,
        rateLimit: formGroupRate,
        addressPool: formGroupPool,
        dnsServer: formGroupDns,
        interimInterval: formGroupInterim
      });
      setEditingGroup(null);
    } else {
      const newGrp: RadiusGroupProfile = {
        id: `RGRP-${Date.now().toString().slice(-4)}`,
        groupname: formGroupName.toUpperCase(),
        description: formGroupDesc,
        rateLimit: formGroupRate,
        addressPool: formGroupPool,
        dnsServer: formGroupDns,
        interimInterval: formGroupInterim,
        activeUsersCount: 0
      };
      onAddGroupProfile(newGrp);
      setIsAddGroupOpen(false);
    }
    setFormGroupName('');
    setFormGroupDesc('');
    setFormGroupRate('25M/25M');
  };

  // Run Simulated radtest
  const runRadtest = (overrideUser?: string, overridePass?: string) => {
    const user = overrideUser || diagUsername;
    const pass = overridePass || diagPassword;
    setIsTestingAuth(true);

    const timestamp = new Date().toLocaleTimeString('id-ID');
    setDiagLogs((prev) => [
      `[${timestamp}] $ radtest ${user} ${pass} ${diagNasIp} 0 ${diagSecret}`,
      `[${timestamp}] Sending Access-Request of id 198 to ${diagNasIp} port 1812...`,
      ...prev
    ]);

    setTimeout(() => {
      const isSuccess = pass === 'password123' || !pass.includes('salah');
      const resTimestamp = new Date().toLocaleTimeString('id-ID');
      if (isSuccess) {
        setDiagLogs((prev) => [
          `[${resTimestamp}] [SUCCESS] Received Access-Accept Id 198 from ${diagNasIp}:1812 (RTT 1.8ms)`,
          `[${resTimestamp}]   Attribute: Framed-Protocol = PPP`,
          `[${resTimestamp}]   Attribute: Service-Type = Framed-User`,
          `[${resTimestamp}]   Attribute: Mikrotik-Rate-Limit = "20M/20M"`,
          `[${resTimestamp}]   Attribute: Framed-Pool = "pool-pppoe-dhcp"`,
          `[${resTimestamp}]   Attribute: Acct-Interim-Interval = 300`,
          ...prev
        ]);
      } else {
        setDiagLogs((prev) => [
          `[${resTimestamp}] [REJECT] Received Access-Reject Id 198 from ${diagNasIp}:1812 (RTT 1.2ms)`,
          `[${resTimestamp}]   Reason: Auth-Type := MS-CHAP / Cleartext-Password match failed`,
          ...prev
        ]);
      }
      setIsTestingAuth(false);
    }, 700);
  };

  // Run Simulated CoA PoD Kick
  const runCoaKick = (user: string, nasIp: string) => {
    const timestamp = new Date().toLocaleTimeString('id-ID');
    setDiagLogs((prev) => [
      `[${timestamp}] $ echo "User-Name = ${user}" | radclient ${nasIp}:3799 disconnect ${diagSecret}`,
      `[${timestamp}] Sending Disconnect-Request (RFC 3576) of id 44 to ${nasIp}:3799...`,
      ...prev
    ]);

    setTimeout(() => {
      const resTimestamp = new Date().toLocaleTimeString('id-ID');
      setDiagLogs((prev) => [
        `[${resTimestamp}] [SUCCESS] Received Disconnect-ACK Id 44 from ${nasIp}:3799 (RTT 2.4ms)`,
        `[${resTimestamp}] Sesi user "${user}" di router ${nasIp} berhasil diputus.`,
        ...prev
      ]);
      onKickRadiusSession(user, nasIp);
    }, 500);
  };

  const selectedNasClient = nasClients.find((n) => n.id === selectedNasForGen) || nasClients[0];

  return (
    <div className="module-container" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header & Server Status Telemetry */}
      <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <Radio size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  FreeRADIUS v3 Server (AAA Engine)
                </h2>
                <span className="badge badge-active" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  DAEMON RUNNING
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Sistem Autentikasi, Otorisasi &amp; Accounting Terpusat untuk MikroTik PPPoE &amp; Hotspot (RFC 2865 / RFC 2866 / RFC 3576 CoA)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {onRestartDaemon && (
              <button
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={onRestartDaemon}
                title="Restart FreeRADIUS Systemd Service"
              >
                <RefreshCw size={14} />
                <span>Restart Service</span>
              </button>
            )}
            <button
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-cyan)' }}
              onClick={() => setIsAddNasOpen(true)}
            >
              <Plus size={15} />
              <span>+ Daftarkan Router (NAS)</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Host &amp; Port Auth
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              {serverConfig.serverHost} : {serverConfig.authPort}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={11} /> UDP 1812 Active
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Accounting &amp; CoA
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>
              UDP 1813 / CoA 3799
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={11} /> PoD RFC 3576 Ready
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Database Backend
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={14} style={{ color: '#f97316' }} />
              <span>{serverConfig.dbType}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              {serverConfig.dbName} @ {serverConfig.dbHost}
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Total Sesi Aktif
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {sessions.filter((s) => s.status === 'ACTIVE').length} Online
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {nasClients.length} NAS Clients terhubung
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              Auth Success Ratio
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {serverConfig.authAcceptRatio}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {serverConfig.totalAuthRequests.toLocaleString()} reqs processed
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.25rem', overflowX: 'auto' }}>
        <button
          className={`tab-btn ${activeTab === 'nas' ? 'active' : ''}`}
          onClick={() => setActiveTab('nas')}
          style={{
            padding: '0.55rem 1rem',
            background: activeTab === 'nas' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: activeTab === 'nas' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'nas' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Server size={15} />
          <span>Router Client (NAS)</span>
          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
            {nasClients.length}
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
          style={{
            padding: '0.55rem 1rem',
            background: activeTab === 'profiles' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: activeTab === 'profiles' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'profiles' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Layers size={15} />
          <span>Profil RADIUS (radgroupreply)</span>
          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
            {groupProfiles.length}
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
          style={{
            padding: '0.55rem 1rem',
            background: activeTab === 'sessions' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: activeTab === 'sessions' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'sessions' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Activity size={15} />
          <span>Live Sesi &amp; Accounting (radacct)</span>
          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
            {sessions.filter((s) => s.status === 'ACTIVE').length} Live
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
          style={{
            padding: '0.55rem 1rem',
            background: activeTab === 'generator' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: activeTab === 'generator' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'generator' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Code2 size={15} />
          <span>Generator Config &amp; Script RouterOS</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'diagnostic' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagnostic')}
          style={{
            padding: '0.55rem 1rem',
            background: activeTab === 'diagnostic' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: activeTab === 'diagnostic' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: 'none',
            borderBottom: activeTab === 'diagnostic' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderRadius: '4px 4px 0 0'
          }}
        >
          <Terminal size={15} />
          <span>Diagnostic Simulator (radtest &amp; CoA)</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: NAS Clients */}
      {activeTab === 'nas' && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Daftar Network Access Server (NAS)
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Router MikroTik yang diizinkan melakukan kueri autentikasi ke database RADIUS (Tabel <code>nas</code> &amp; file <code>clients.conf</code>)
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Cari router / IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2rem', fontSize: '0.8rem', width: '220px' }}
                />
              </div>
            </div>
          </div>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Nama Router (Shortname)</th>
                  <th>IP Address NAS</th>
                  <th>Shared Secret Key</th>
                  <th>Tipe Vendor</th>
                  <th>CoA PoD Port</th>
                  <th>Status</th>
                  <th>Terakhir Aktif</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {nasClients
                  .filter((n) => n.shortname.toLowerCase().includes(searchTerm.toLowerCase()) || n.nasname.includes(searchTerm))
                  .map((nas) => {
                    const isRevealed = !!revealedSecrets[nas.id];
                    const rosScript = `/radius add address=${serverConfig.serverHost} secret="${nas.secret}" service=ppp,hotspot authentication-port=1812 accounting-port=1813 timeout=3000ms\n/radius incoming set accept=yes port=${nas.coaPort}`;

                    return (
                      <tr key={nas.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{nas.shortname}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{nas.description}</div>
                        </td>
                        <td>
                          <code style={{ color: 'var(--accent-cyan)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                            {nas.nasname}
                          </code>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', letterSpacing: isRevealed ? 'normal' : '2px' }}>
                              {isRevealed ? nas.secret : '••••••••••••'}
                            </code>
                            <button
                              className="btn-icon"
                              style={{ padding: '2px', color: 'var(--text-secondary)' }}
                              onClick={() => toggleSecret(nas.id)}
                              title={isRevealed ? 'Sembunyikan Secret' : 'Tampilkan Secret'}
                            >
                              {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              className="btn-icon"
                              style={{ padding: '2px', color: copiedKey === `secret-${nas.id}` ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}
                              onClick={() => copyToClipboard(nas.secret, `secret-${nas.id}`)}
                              title="Salin Secret Key"
                            >
                              {copiedKey === `secret-${nas.id}` ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
                            {nas.type.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <code style={{ color: 'var(--accent-emerald)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                            UDP {nas.coaPort}
                          </code>
                        </td>
                        <td>
                          <span className={`badge ${nas.status === 'ONLINE' ? 'badge-active' : 'badge-danger'}`}>
                            {nas.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{nas.lastSeen || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '3px 7px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                              onClick={() => copyToClipboard(rosScript, `ros-${nas.id}`)}
                              title="Salin Perintah CLI MikroTik"
                            >
                              {copiedKey === `ros-${nas.id}` ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                              <span>Script ROS</span>
                            </button>
                            <button
                              className="btn-icon"
                              style={{ color: 'var(--accent-cyan)' }}
                              onClick={() => {
                                setEditingNas(nas);
                                setFormNasIp(nas.nasname);
                                setFormNasName(nas.shortname);
                                setFormNasSecret(nas.secret);
                                setFormNasDesc(nas.description);
                                setFormNasCoaPort(nas.coaPort);
                              }}
                              title="Edit NAS"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn-icon"
                              style={{ color: 'var(--accent-rose)' }}
                              onClick={() => onDeleteNasClient(nas.id)}
                              title="Hapus NAS"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Profil RADIUS (radgroupreply) */}
      {activeTab === 'profiles' && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Daftar Profil &amp; Atribut Kamus (Group Profiles)
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Paket kecepatan yang disuntikkan secara dinamis ke MikroTik saat pelanggan login (Tabel <code>radgroupreply</code> &amp; <code>radgroupcheck</code>)
              </p>
            </div>
            <button
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--accent-cyan)' }}
              onClick={() => setIsAddGroupOpen(true)}
            >
              <Plus size={14} />
              <span>+ Tambah Profil Paket</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
            {groupProfiles.map((grp) => {
              const isIsolir = grp.groupname.includes('ISOLIR');
              return (
                <div
                  key={grp.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: isIsolir ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isIsolir ? 'var(--accent-rose)' : 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {grp.groupname}
                      </span>
                      <span className="badge" style={{ background: isIsolir ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)', color: isIsolir ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>
                        {grp.activeUsersCount || 0} User
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      {grp.description}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.76rem', background: 'var(--bg-primary)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Mikrotik-Rate-Limit:</span>
                        <code style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{grp.rateLimit}</code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Framed-Pool:</span>
                        <code>{grp.addressPool || 'default'}</code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Acct-Interim-Interval:</span>
                        <code>{grp.interimInterval}s (5 Menit)</code>
                      </div>
                      {grp.dnsServer && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>DNS Server:</span>
                          <code>{grp.dnsServer}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      onClick={() => {
                        setEditingGroup(grp);
                        setFormGroupName(grp.groupname);
                        setFormGroupDesc(grp.description);
                        setFormGroupRate(grp.rateLimit);
                        setFormGroupPool(grp.addressPool || 'pool-pppoe-dhcp');
                        setFormGroupDns(grp.dnsServer || '1.1.1.1, 8.8.8.8');
                        setFormGroupInterim(grp.interimInterval);
                      }}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    {!isIsolir && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '3px 8px', color: 'var(--accent-rose)' }}
                        onClick={() => onDeleteGroupProfile(grp.id)}
                      >
                        <Trash2 size={12} />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Live Sesi & Accounting (radacct) */}
      {activeTab === 'sessions' && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Tabel Sesi Online Real-Time (radacct)
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Daftar koneksi PPPoE dan Hotspot yang aktif dan dicatat oleh daemon FreeRADIUS Accounting
              </p>
            </div>
            <span className="badge badge-active" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
              {sessions.filter((s) => s.status === 'ACTIVE').length} Pelanggan Online
            </span>
          </div>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Radacct ID</th>
                  <th>Username Pelanggan</th>
                  <th>Layanan</th>
                  <th>IP NAS Router</th>
                  <th>Framed IP Pelanggan</th>
                  <th>Caller-ID (MAC)</th>
                  <th>Durasi Sesi</th>
                  <th>Upload (In)</th>
                  <th>Download (Out)</th>
                  <th style={{ textAlign: 'center' }}>Aksi Putus (CoA PoD)</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => (
                  <tr key={sess.id}>
                    <td>
                      <code style={{ color: 'var(--text-secondary)' }}>#{sess.radacctid}</code>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {sess.username}
                    </td>
                    <td>
                      <span className={`badge ${sess.serviceType === 'PPPoE' ? 'badge-active' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {sess.serviceType}
                      </span>
                    </td>
                    <td>
                      <code style={{ background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '3px' }}>
                        {sess.nasIpAddress}
                      </code>
                    </td>
                    <td>
                      <code style={{ color: 'var(--accent-emerald)', background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '3px' }}>
                        {sess.framedIpAddress}
                      </code>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {sess.callingStationId}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{sess.acctSessionTime}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{sess.acctInputOctets}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{sess.acctOutputOctets}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem', color: 'var(--accent-rose)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => runCoaKick(sess.username, sess.nasIpAddress)}
                        title="Kirim Paket Disconnect RFC 3576 ke MikroTik Port 3799"
                      >
                        <Zap size={12} />
                        <span>Kick (PoD)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Config & Script Generator */}
      {activeTab === 'generator' && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Generator Konfigurasi Linux &amp; Script RouterOS MikroTik
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Pilih router untuk menghasilkan file konfigurasi FreeRADIUS dan script terminal MikroTik secara otomatis.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pilih Router (NAS):</label>
              <select
                className="form-select"
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem', minWidth: '220px' }}
                value={selectedNasForGen}
                onChange={(e) => setSelectedNasForGen(e.target.value)}
              >
                {nasClients.map((nas) => (
                  <option key={nas.id} value={nas.id}>
                    {nas.shortname} ({nas.nasname})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Config Sub Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              className={`btn-secondary ${configSubTab === 'mikrotik' ? 'active' : ''}`}
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                background: configSubTab === 'mikrotik' ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-tertiary)',
                color: configSubTab === 'mikrotik' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: configSubTab === 'mikrotik' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
              }}
              onClick={() => setConfigSubTab('mikrotik')}
            >
              1. Script Terminal MikroTik (RouterOS)
            </button>
            <button
              className={`btn-secondary ${configSubTab === 'clients' ? 'active' : ''}`}
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                background: configSubTab === 'clients' ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-tertiary)',
                color: configSubTab === 'clients' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: configSubTab === 'clients' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
              }}
              onClick={() => setConfigSubTab('clients')}
            >
              2. /etc/freeradius/3.0/clients.conf
            </button>
            <button
              className={`btn-secondary ${configSubTab === 'sql' ? 'active' : ''}`}
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                background: configSubTab === 'sql' ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-tertiary)',
                color: configSubTab === 'sql' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: configSubTab === 'sql' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
              }}
              onClick={() => setConfigSubTab('sql')}
            >
              3. mods-available/sql (MariaDB)
            </button>
            <button
              className={`btn-secondary ${configSubTab === 'schema' ? 'active' : ''}`}
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                background: configSubTab === 'schema' ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-tertiary)',
                color: configSubTab === 'schema' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: configSubTab === 'schema' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
              }}
              onClick={() => setConfigSubTab('schema')}
            >
              4. Skema Database SQL &amp; Profil
            </button>
            <button
              className={`btn-secondary ${configSubTab === 'ufw' ? 'active' : ''}`}
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                background: configSubTab === 'ufw' ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-tertiary)',
                color: configSubTab === 'ufw' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: configSubTab === 'ufw' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)'
              }}
              onClick={() => setConfigSubTab('ufw')}
            >
              5. Firewall UFW Ubuntu
            </button>
          </div>

          {/* Code Viewer Box */}
          <div style={{ position: 'relative', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {configSubTab === 'mikrotik' && 'MikroTik Terminal / Winbox CLI (RouterOS v7 / v6)'}
                {configSubTab === 'clients' && '/etc/freeradius/3.0/clients.conf'}
                {configSubTab === 'sql' && '/etc/freeradius/3.0/mods-available/sql'}
                {configSubTab === 'schema' && 'MariaDB MySQL SQL Query Setup (database: radius)'}
                {configSubTab === 'ufw' && 'Linux Ubuntu Firewall (UFW) Security Rules'}
              </span>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.74rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  let text = '';
                  if (configSubTab === 'mikrotik') {
                    text = `# 1. Daftarkan RADIUS Server ke MikroTik\n/radius add address=${serverConfig.serverHost} secret="${selectedNasClient.secret}" service=ppp,hotspot authentication-port=1812 accounting-port=1813 timeout=3000ms comment="SCORIP FreeRADIUS"\n\n# 2. Aktifkan Incoming CoA Port 3799 (Wajib untuk Kick & Isolir Real-Time)\n/radius incoming set accept=yes port=${selectedNasClient.coaPort}\n\n# 3. Aktifkan RADIUS pada PPPoE Server\n/ppp aaa set use-radius=yes accounting=yes interim-update=5m\n\n# 4. Aktifkan RADIUS pada Hotspot Profile\n/ip hotspot profile set [find default=yes] use-radius=yes radius-accounting=yes radius-interim-update=5m`;
                  } else if (configSubTab === 'clients') {
                    text = `client ${selectedNasClient.shortname} {\n    ipaddr = ${selectedNasClient.nasname}\n    secret = ${selectedNasClient.secret}\n    shortname = ${selectedNasClient.shortname}\n    nas_type = other\n    require_message_authenticator = no\n}`;
                  } else if (configSubTab === 'sql') {
                    text = `sql {\n    dialect = "mysql"\n    driver = "rlm_sql_mysql"\n    server = "${serverConfig.dbHost.split(':')[0]}"\n    port = 3306\n    login = "${serverConfig.dbUser}"\n    password = "RadiusPass2026!"\n    radius_db = "${serverConfig.dbName}"\n    read_clients = yes\n    client_table = "nas"\n}`;
                  } else if (configSubTab === 'schema') {
                    text = `-- Import Skema Default FreeRADIUS\n-- mysql -u root radius < /etc/freeradius/3.0/mods-config/sql/main/mysql/schema.sql\n\n-- Tambahkan Group Profil ke radgroupreply:\nINSERT INTO radgroupreply (groupname, attribute, op, value) VALUES\n('PAKET-20MBPS', 'Mikrotik-Rate-Limit', ':=', '20M/20M'),\n('PAKET-30MBPS', 'Mikrotik-Rate-Limit', ':=', '30M/30M'),\n('PAKET-50MBPS', 'Mikrotik-Rate-Limit', ':=', '50M/50M'),\n('ISOLIR-GROUP', 'Mikrotik-Rate-Limit', ':=', '128k/128k');`;
                  } else {
                    text = `# Izinkan Port RADIUS UDP 1812 & 1813 hanya dari IP MikroTik (${selectedNasClient.nasname})\nsudo ufw allow from ${selectedNasClient.nasname} to any port 1812 proto udp comment 'FreeRADIUS Auth'\nsudo ufw allow from ${selectedNasClient.nasname} to any port 1813 proto udp comment 'FreeRADIUS Acct'\nsudo ufw reload`;
                  }
                  copyToClipboard(text, 'gen-code');
                }}
              >
                {copiedKey === 'gen-code' ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                <span>Salin Script</span>
              </button>
            </div>

            <pre style={{ margin: 0, padding: '1rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', lineHeight: 1.5, color: '#e2e8f0', overflowX: 'auto', maxHeight: '350px' }}>
              {configSubTab === 'mikrotik' && (
                <code>
{`# ==============================================================================
# SCRIPT SETUP RADIUS CLIENT DI MIKROTIK (${selectedNasClient.shortname})
# Target Server: ${serverConfig.serverHost} (Port 1812 / 1813 / CoA 3799)
# ==============================================================================

# 1. Daftarkan Server RADIUS
/radius
add address=${serverConfig.serverHost} secret="${selectedNasClient.secret}" \\
    service=ppp,hotspot authentication-port=1812 accounting-port=1813 timeout=3000ms \\
    comment="FreeRADIUS SCORIP-BOS"

# 2. Aktifkan Incoming Request CoA / PoD (Port ${selectedNasClient.coaPort})
# Wajib agar Web App bisa memutus sesi pelanggan yang di-isolir secara seketika!
/radius incoming
set accept=yes port=${selectedNasClient.coaPort}

# 3. Aktifkan RADIUS pada PPPoE Server
/ppp aaa
set use-radius=yes accounting=yes interim-update=5m

# 4. Aktifkan RADIUS pada Hotspot Profile
/ip hotspot profile
set [find default=yes] use-radius=yes radius-accounting=yes radius-interim-update=5m`}
                </code>
              )}

              {configSubTab === 'clients' && (
                <code>
{`# Tambahkan blok ini ke bagian bawah /etc/freeradius/3.0/clients.conf:

client ${selectedNasClient.shortname} {
    ipaddr = ${selectedNasClient.nasname}
    secret = ${selectedNasClient.secret}
    shortname = ${selectedNasClient.shortname}
    nas_type = other
    require_message_authenticator = no
}`}
                </code>
              )}

              {configSubTab === 'sql' && (
                <code>
{`# Konfigurasi /etc/freeradius/3.0/mods-available/sql (MariaDB Engine)

sql {
    dialect = "mysql"
    driver = "rlm_sql_mysql"
    server = "${serverConfig.dbHost.split(':')[0]}"
    port = 3306
    login = "${serverConfig.dbUser}"
    password = "RadiusPass2026!"
    radius_db = "${serverConfig.dbName}"
    read_clients = yes
    client_table = "nas"
}`}
                </code>
              )}

              {configSubTab === 'schema' && (
                <code>
{`-- Skema Profil Paket di Database: ${serverConfig.dbName}

-- 1. Bersihkan data profil lama (jika perlu)
-- DELETE FROM radgroupreply;

-- 2. Daftarkan Atribut Kecepatan Vendor MikroTik ke radgroupreply
INSERT INTO radgroupreply (groupname, attribute, op, value) VALUES
('PAKET-20MBPS', 'Mikrotik-Rate-Limit', ':=', '20M/20M'),
('PAKET-30MBPS', 'Mikrotik-Rate-Limit', ':=', '30M/30M'),
('PAKET-50MBPS', 'Mikrotik-Rate-Limit', ':=', '50M/50M'),
('BIZ-DEDICATED-100MBPS', 'Mikrotik-Rate-Limit', ':=', '100M/100M'),
('ISOLIR-GROUP', 'Mikrotik-Rate-Limit', ':=', '128k/128k');

-- 3. Contoh Menambahkan Pelanggan Baru PPPoE ke radcheck & radusergroup
-- INSERT INTO radcheck (username, attribute, op, value) VALUES ('budi_santoso', 'Cleartext-Password', ':=', 'password123');
-- INSERT INTO radusergroup (username, groupname, priority) VALUES ('budi_santoso', 'PAKET-20MBPS', 1);`}
                </code>
              )}

              {configSubTab === 'ufw' && (
                <code>
{`# ==============================================================================
# FIREWALL UFW DI UBUNTU VPS (Hanya izinkan IP VPN Router MikroTik)
# ==============================================================================

# Izinkan port Auth (1812) dan Acct (1813) dari router ${selectedNasClient.shortname}
sudo ufw allow from ${selectedNasClient.nasname} to any port 1812 proto udp comment 'RADIUS Auth ${selectedNasClient.shortname}'
sudo ufw allow from ${selectedNasClient.nasname} to any port 1813 proto udp comment 'RADIUS Acct ${selectedNasClient.shortname}'

# Reload UFW
sudo ufw reload`}
                </code>
              )}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: Diagnostic Simulator (radtest & CoA) */}
      {activeTab === 'diagnostic' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Panel Kiri: Form Tes */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={17} style={{ color: 'var(--accent-cyan)' }} />
              <span>Simulasi Pengujian Autentikasi (radtest)</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Username Pelanggan</label>
                <input
                  type="text"
                  className="form-input"
                  value={diagUsername}
                  onChange={(e) => setDiagUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Password Pelanggan</label>
                <input
                  type="text"
                  className="form-input"
                  value={diagPassword}
                  onChange={(e) => setDiagPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>IP NAS Router</label>
                  <input
                    type="text"
                    className="form-input"
                    value={diagNasIp}
                    onChange={(e) => setDiagNasIp(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Shared Secret</label>
                  <input
                    type="password"
                    className="form-input"
                    value={diagSecret}
                    onChange={(e) => setDiagSecret(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={() => runRadtest()}
                  disabled={isTestingAuth}
                >
                  <Play size={14} />
                  <span>{isTestingAuth ? 'Menguji...' : 'Jalankan radtest'}</span>
                </button>
              </div>

              {/* Tombol Cepat */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Preset Skenario Pengujian:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                    onClick={() => {
                      setDiagUsername('pppoe_budi');
                      setDiagPassword('password123');
                      runRadtest('pppoe_budi', 'password123');
                    }}
                  >
                    User Valid (Accept)
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '3px 8px', color: 'var(--accent-rose)' }}
                    onClick={() => {
                      setDiagUsername('pppoe_budi');
                      setDiagPassword('password_salah');
                      runRadtest('pppoe_budi', 'password_salah');
                    }}
                  >
                    Salah Password (Reject)
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '3px 8px', color: 'var(--accent-blue)' }}
                    onClick={() => {
                      setDiagUsername('pppoe_siti');
                      setDiagPassword('password123');
                      runRadtest('pppoe_siti', 'password123');
                    }}
                  >
                    User Paket 30M
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan: Terminal Output Log */}
          <div className="glass-panel" style={{ padding: '1.25rem', background: '#090d16', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8', marginLeft: '0.5rem' }}>
                  console (freeradius-telemetry)
                </span>
              </div>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
                onClick={() => setDiagLogs([`[INFO] Console cleared.`])}
              >
                Clear
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px', display: 'flex', flexDirection: 'column-reverse', gap: '0.3rem', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
              {diagLogs.map((log, index) => {
                const isAccept = log.includes('Access-Accept') || log.includes('Disconnect-ACK') || log.includes('[SUCCESS]');
                const isReject = log.includes('Access-Reject') || log.includes('[REJECT]');
                const isCmd = log.includes('$');

                return (
                  <div
                    key={index}
                    style={{
                      color: isAccept ? '#34d399' : isReject ? '#f87171' : isCmd ? '#38bdf8' : '#94a3b8',
                      lineHeight: 1.4,
                      wordBreak: 'break-all'
                    }}
                  >
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah/Edit NAS Client */}
      {(isAddNasOpen || editingNas) && (
        <div className="modal-overlay" onClick={() => { setIsAddNasOpen(false); setEditingNas(null); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                {editingNas ? 'Edit Router Client (NAS)' : '+ Daftarkan Router MikroTik (NAS)'}
              </h3>
              <button className="btn-icon" onClick={() => { setIsAddNasOpen(false); setEditingNas(null); }}>✕</button>
            </div>
            <form onSubmit={handleSaveNas}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="form-label">Nama Identifier (Shortname)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="misal: CCR2004-Core-POP"
                    value={formNasName}
                    onChange={(e) => setFormNasName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">IP Address NAS (IP VPN / Router)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="misal: 10.10.0.2"
                      value={formNasIp}
                      onChange={(e) => setFormNasIp(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">CoA / PoD Port</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formNasCoaPort}
                      onChange={(e) => setFormNasCoaPort(+e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Shared Secret Key (Kunci Rahasia)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formNasSecret}
                    onChange={(e) => setFormNasSecret(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Secret ini harus persis sama dengan yang dimasukkan di <code>/radius add secret=...</code> di MikroTik.
                  </span>
                </div>

                <div>
                  <label className="form-label">Deskripsi / Lokasi Router</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="misal: BNG Utama POP Ubud OLT"
                    value={formNasDesc}
                    onChange={(e) => setFormNasDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setIsAddNasOpen(false); setEditingNas(null); }}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{ background: 'var(--accent-cyan)' }}>
                  {editingNas ? 'Simpan Perubahan' : 'Daftarkan Router (NAS)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah/Edit Profil Group RADIUS */}
      {(isAddGroupOpen || editingGroup) && (
        <div className="modal-overlay" onClick={() => { setIsAddGroupOpen(false); setEditingGroup(null); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                {editingGroup ? 'Edit Profil Paket RADIUS' : '+ Tambah Profil Paket Baru (radgroupreply)'}
              </h3>
              <button className="btn-icon" onClick={() => { setIsAddGroupOpen(false); setEditingGroup(null); }}>✕</button>
            </div>
            <form onSubmit={handleSaveGroup}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="form-label">Nama Group (groupname)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="misal: PAKET-40MBPS"
                    value={formGroupName}
                    onChange={(e) => setFormGroupName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Mikrotik-Rate-Limit</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="misal: 40M/40M"
                      value={formGroupRate}
                      onChange={(e) => setFormGroupRate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Framed-Pool</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="pool-pppoe-dhcp"
                      value={formGroupPool}
                      onChange={(e) => setFormGroupPool(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">DNS Server</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formGroupDns}
                      onChange={(e) => setFormGroupDns(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Interim Update (detik)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formGroupInterim}
                      onChange={(e) => setFormGroupInterim(+e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Deskripsi Paket</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="misal: Paket Rumahan Super Streaming"
                    value={formGroupDesc}
                    onChange={(e) => setFormGroupDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setIsAddGroupOpen(false); setEditingGroup(null); }}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary" style={{ background: 'var(--accent-cyan)' }}>
                  {editingGroup ? 'Simpan Profil' : 'Tambahkan Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
