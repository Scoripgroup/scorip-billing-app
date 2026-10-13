import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Unlock,
  Radio,
  Server,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Copy,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Search,
  Eye,
  EyeOff,
  Code,
  Terminal,
  Globe,
  Zap,
  Check,
  X,
  Sliders,
  Laptop,
  Network,
  Share2
} from 'lucide-react';
import { VpnAccount, VpnServerGateway, VpnProtocol, VpnStatus } from '../types';

interface VpnModuleProps {
  accounts: VpnAccount[];
  servers: VpnServerGateway[];
  onAddAccount: (account: VpnAccount) => void;
  onEditAccount: (account: VpnAccount) => void;
  onDeleteAccount: (id: string) => void;
  onToggleAccountStatus: (id: string) => void;
}

export const VpnModule: React.FC<VpnModuleProps> = ({
  accounts,
  servers,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onToggleAccountStatus
}) => {
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'tunnels' | 'remote_winbox' | 'servers' | 'script_gen'>('tunnels');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // UI States
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<VpnAccount | null>(null);
  const [scriptModalAccount, setScriptModalAccount] = useState<VpnAccount | null>(null);
  const [rosVersion, setRosVersion] = useState<'ROS_V7' | 'ROS_V6'>('ROS_V7');

  // Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formProtocol, setFormProtocol] = useState<VpnProtocol>('L2TP_IPSEC');
  const [formServerHost, setFormServerHost] = useState('vpn.scorip.net');
  const [formServerPort, setFormServerPort] = useState(1701);
  const [formAssignedIp, setFormAssignedIp] = useState('10.255.0.');
  const [formRemoteSubnet, setFormRemoteSubnet] = useState('');
  const [formPublicPortWinbox, setFormPublicPortWinbox] = useState<number>(18291);
  const [formPublicPortApi, setFormPublicPortApi] = useState<number>(18728);
  const [formPublicPortWeb, setFormPublicPortWeb] = useState<number>(18080);
  const [formRouterName, setFormRouterName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
    showToast(`${label} disalin ke clipboard!`);
  };

  const handleTogglePassword = (id: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingAccount(null);
    const rand = Math.floor(10 + Math.random() * 89);
    setFormName(`Remote Winbox POP-${rand}`);
    setFormUsername(`rw-pop-${rand}`);
    setFormPassword(`vpnPass_${rand}#SC`);
    setFormProtocol('L2TP_IPSEC');
    setFormServerHost('vpn.scorip.net');
    setFormServerPort(1701);
    setFormAssignedIp(`10.255.0.${rand}`);
    setFormRemoteSubnet(`192.168.${rand}.0/24`);
    setFormPublicPortWinbox(18290 + rand);
    setFormPublicPortApi(18720 + rand);
    setFormPublicPortWeb(18080 + rand);
    setFormRouterName(`RB4011-POP-${rand}`);
    setFormDescription('Remote maintenance teknisi tanpa IP Publik statis');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (acc: VpnAccount) => {
    setEditingAccount(acc);
    setFormName(acc.name);
    setFormUsername(acc.username);
    setFormPassword(acc.password || '');
    setFormProtocol(acc.protocol);
    setFormServerHost(acc.serverHost);
    setFormServerPort(acc.serverPort);
    setFormAssignedIp(acc.assignedIp);
    setFormRemoteSubnet(acc.remoteSubnet || '');
    setFormPublicPortWinbox(acc.publicPortWinbox || 18291);
    setFormPublicPortApi(acc.publicPortApi || 18728);
    setFormPublicPortWeb(acc.publicPortWeb || 18080);
    setFormRouterName(acc.routerName);
    setFormDescription(acc.description);
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) return;

    if (editingAccount) {
      const updated: VpnAccount = {
        ...editingAccount,
        name: formName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        protocol: formProtocol,
        serverHost: formServerHost.trim(),
        serverPort: Number(formServerPort),
        assignedIp: formAssignedIp.trim(),
        remoteSubnet: formRemoteSubnet.trim() || undefined,
        publicPortWinbox: Number(formPublicPortWinbox) || undefined,
        publicPortApi: Number(formPublicPortApi) || undefined,
        publicPortWeb: Number(formPublicPortWeb) || undefined,
        routerName: formRouterName.trim(),
        description: formDescription.trim()
      };
      onEditAccount(updated);
      showToast(`Akun VPN ${updated.username} berhasil diperbarui.`);
    } else {
      const created: VpnAccount = {
        id: `VPN-${Date.now()}`,
        name: formName.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        protocol: formProtocol,
        serverHost: formServerHost.trim(),
        serverPort: Number(formServerPort),
        assignedIp: formAssignedIp.trim(),
        remoteSubnet: formRemoteSubnet.trim() || undefined,
        publicPortWinbox: Number(formPublicPortWinbox) || undefined,
        publicPortApi: Number(formPublicPortApi) || undefined,
        publicPortWeb: Number(formPublicPortWeb) || undefined,
        status: 'CONNECTED',
        uptime: '00:00:10',
        bytesIn: '0 B',
        bytesOut: '0 B',
        routerName: formRouterName.trim() || 'MikroTik Router',
        description: formDescription.trim() || 'Akses VPN Remote',
        createdAt: new Date().toISOString().substring(0, 10)
      };
      onAddAccount(created);
      showToast(`Akun VPN ${created.username} berhasil ditambahkan!`);
    }

    setIsAddModalOpen(false);
  };

  // Filtered Accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (protocolFilter !== 'ALL' && acc.protocol !== protocolFilter) return false;
    if (statusFilter !== 'ALL' && acc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        acc.name.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        acc.assignedIp.toLowerCase().includes(q) ||
        acc.routerName.toLowerCase().includes(q) ||
        (acc.publicPortWinbox && acc.publicPortWinbox.toString().includes(q)) ||
        acc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const connectedCount = accounts.filter((a) => a.status === 'CONNECTED').length;
  const remoteWinboxCount = accounts.filter((a) => a.publicPortWinbox !== undefined).length;

  // Generate MikroTik script for an account
  const generateMikrotikScript = (acc: VpnAccount, ver: 'ROS_V7' | 'ROS_V6') => {
    const isV7 = ver === 'ROS_V7';

    if (acc.protocol === 'WIREGUARD') {
      return `# ===================================================
# SCRIPT SETUP WIREGUARD VPN - SCORIP (RouterOS ${isV7 ? 'v7' : 'v7 required'})
# ===================================================
/interface wireguard
add listen-port=51820 mtu=1420 name="wg-scorip"

/interface wireguard peers
add allowed-address=10.255.0.0/16 endpoint-address="${acc.serverHost}" endpoint-port=${acc.serverPort} \\
    interface="wg-scorip" persistent-keepalive=25s public-key="${acc.publicKey || 'SERVER_PUBLIC_KEY_HERE'}"

/ip address
add address=${acc.assignedIp}/24 interface="wg-scorip" network=${acc.assignedIp.substring(0, acc.assignedIp.lastIndexOf('.'))}.0

/ip firewall filter
add action=accept chain=input comment="SCORIP: Allow WireGuard In" dst-port=51820 protocol=udp`;
    }

    if (acc.protocol === 'L2TP_IPSEC') {
      return `# ===================================================
# SCRIPT SETUP L2TP / IPSEC CLIENT - SCORIP (RouterOS ${isV7 ? 'v7' : 'v6'})
# ===================================================
/interface l2tp-client
add allow-fast-path=yes connect-to="${acc.serverHost}" disabled=no name="l2tp-scorip" \\
    password="${acc.password}" profile=default-encryption user="${acc.username}" \\
    use-ipsec=yes ipsec-secret="scorip2026ipsec"

/ip firewall nat
add action=masquerade chain=srcnat comment="NAT L2TP VPN" out-interface="l2tp-scorip"`;
    }

    if (acc.protocol === 'SSTP') {
      return `# ===================================================
# SCRIPT SETUP SSTP CLIENT - SCORIP (RouterOS ${isV7 ? 'v7' : 'v6'})
# ===================================================
/interface sstp-client
add connect-to="${acc.serverHost}" disabled=no name="sstp-scorip" \\
    password="${acc.password}" profile=default-encryption user="${acc.username}" \\
    verify-server-certificate=no

/ip firewall nat
add action=masquerade chain=srcnat comment="NAT SSTP VPN" out-interface="sstp-scorip"`;
    }

    if (acc.protocol === 'OPENVPN') {
      return `# ===================================================
# SCRIPT SETUP OPENVPN CLIENT - SCORIP (RouterOS ${isV7 ? 'v7' : 'v6'})
# ===================================================
/interface ovpn-client
add cipher=aes256-cbc connect-to="${acc.serverHost}" port=${acc.serverPort} disabled=no \\
    name="ovpn-scorip" password="${acc.password}" user="${acc.username}" mode=ip \\
    protocol=tcp verify-server-certificate=no`;
    }

    // PPTP
    return `# ===================================================
# SCRIPT SETUP PPTP CLIENT - SCORIP (RouterOS ${isV7 ? 'v7' : 'v6'})
# ===================================================
/interface pptp-client
add connect-to="${acc.serverHost}" disabled=no name="pptp-scorip" \\
    password="${acc.password}" user="${acc.username}"`;
  };

  return (
    <div className="vpn-module">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent-cyan)',
            color: 'var(--text-primary)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.85rem'
          }}
        >
          <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
                border: '1px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                VPN &amp; Remote Winbox Management
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Tunneling Terenkripsi, NAT Port Forwarding Remote Winbox, WireGuard &amp; Inter-Branch OLT Gateway
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleOpenAdd}>
              <Plus size={15} />
              <span>+ Akun VPN Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL AKUN TUNNEL</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
            {accounts.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
            {connectedCount} tunnel terhubung (Active)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS TUNNEL REALTIME</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>
            {connectedCount} UP
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {accounts.length - connectedCount} offline / standby
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>REMOTE WINBOX PORT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-blue)' }}>
            {remoteWinboxCount} Router
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Port Forwarding NAT Siap Pakai
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SERVER GATEWAY VPS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-purple)' }}>
            {servers.length} Node
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            SG Equinix &amp; Cyber 1 JKT
          </div>
        </div>
      </div>

      {/* Subpage Nav Tabs */}
      <div className="tab-nav" style={{ marginBottom: '1rem' }}>
        <button
          className={`tab-btn ${activeSubTab === 'tunnels' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('tunnels')}
        >
          <Shield size={16} />
          <span>Daftar Tunnel ({accounts.length})</span>
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'remote_winbox' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('remote_winbox')}
        >
          <ExternalLink size={16} />
          <span>Remote Winbox &amp; NAT ({remoteWinboxCount})</span>
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'servers' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('servers')}
        >
          <Server size={16} />
          <span>Server Gateway VPS ({servers.length})</span>
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'script_gen' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('script_gen')}
        >
          <Terminal size={16} />
          <span>MikroTik Script Generator</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBPAGE: TUNNELS LIST */}
      {/* ========================================================================= */}
      {activeSubTab === 'tunnels' && (
        <div>
          {/* Controls Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '0.85rem 1rem',
              marginBottom: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', flex: 1 }}>
              <div className="search-box" style={{ maxWidth: '280px' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Cari akun, IP, router, port..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Protocol Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                value={protocolFilter}
                onChange={(e) => setProtocolFilter(e.target.value)}
              >
                <option value="ALL">Semua Protokol</option>
                <option value="WIREGUARD">WireGuard</option>
                <option value="L2TP_IPSEC">L2TP / IPSec</option>
                <option value="SSTP">SSTP</option>
                <option value="OPENVPN">OpenVPN</option>
                <option value="PPTP">PPTP</option>
              </select>

              {/* Status Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Semua Status</option>
                <option value="CONNECTED">Online / Connected</option>
                <option value="DISCONNECTED">Disconnected</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => showToast('Status tunnel VPN berhasil disegarkan.')}>
                <RefreshCw size={14} />
                <span>Segarkan</span>
              </button>
            </div>
          </div>

          {/* Tunnels Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '42px', textAlign: 'center' }}>No</th>
                  <th>Nama Akun / Keterangan</th>
                  <th>Protokol</th>
                  <th>Username &amp; Password</th>
                  <th>IP Tunnel / Subnet</th>
                  <th>Router Sasaran</th>
                  <th>Remote Winbox Access</th>
                  <th>Uptime / Traffic</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Tidak ada akun VPN yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc, idx) => {
                    const isPassVisible = showPasswordMap[acc.id];
                    const winboxHost = `${acc.serverHost}:${acc.publicPortWinbox}`;

                    return (
                      <tr key={acc.id}>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {idx + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {acc.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {acc.description}
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge badge-neutral"
                            style={{
                              fontWeight: 700,
                              borderColor:
                                acc.protocol === 'WIREGUARD'
                                  ? 'rgba(16, 185, 129, 0.4)'
                                  : acc.protocol === 'L2TP_IPSEC'
                                  ? 'rgba(6, 182, 212, 0.4)'
                                  : acc.protocol === 'SSTP'
                                  ? 'rgba(59, 130, 246, 0.4)'
                                  : 'rgba(255, 255, 255, 0.2)',
                              color:
                                acc.protocol === 'WIREGUARD'
                                  ? 'var(--accent-emerald)'
                                  : acc.protocol === 'L2TP_IPSEC'
                                  ? 'var(--accent-cyan)'
                                  : acc.protocol === 'SSTP'
                                  ? 'var(--accent-blue)'
                                  : 'inherit'
                            }}
                          >
                            {acc.protocol.replace('_', ' / ')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                              {acc.username}
                            </code>
                            <button
                              className="btn-icon"
                              style={{ width: '20px', height: '20px', padding: 0 }}
                              title="Salin Username"
                              onClick={() => handleCopy(acc.username, 'Username')}
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                          {acc.password && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {isPassVisible ? acc.password : '••••••'}
                              </span>
                              <button
                                className="btn-icon"
                                style={{ width: '18px', height: '18px', padding: 0 }}
                                title={isPassVisible ? 'Sembunyikan' : 'Lihat Password'}
                                onClick={() => handleTogglePassword(acc.id)}
                              >
                                {isPassVisible ? <EyeOff size={10} /> : <Eye size={10} />}
                              </button>
                              {isPassVisible && (
                                <button
                                  className="btn-icon"
                                  style={{ width: '18px', height: '18px', padding: 0 }}
                                  title="Salin Password"
                                  onClick={() => handleCopy(acc.password!, 'Password')}
                                >
                                  <Copy size={10} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem' }}>
                            {acc.assignedIp}
                          </div>
                          {acc.remoteSubnet && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              Subnet: {acc.remoteSubnet}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{acc.routerName}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Gateway: {acc.serverHost}
                          </div>
                        </td>
                        <td>
                          {acc.publicPortWinbox ? (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent-amber)' }}>
                                  Port {acc.publicPortWinbox}
                                </span>
                                <button
                                  className="btn-icon"
                                  style={{ width: '20px', height: '20px', padding: 0 }}
                                  title={`Salin ${winboxHost}`}
                                  onClick={() => handleCopy(winboxHost, 'Host Winbox')}
                                >
                                  <Copy size={11} />
                                </button>
                              </div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                &rarr; 8291 (MikroTik)
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{acc.uptime || '-'}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            ↓ {acc.bytesIn} / ↑ {acc.bytesOut}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {acc.status === 'CONNECTED' ? (
                            <span className="badge badge-good">
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }}></span>
                              CONNECTED
                            </span>
                          ) : (
                            <span className="badge badge-critical">
                              OFFLINE
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <button
                              className="btn-icon"
                              title="Lihat Script MikroTik"
                              onClick={() => setScriptModalAccount(acc)}
                            >
                              <Terminal size={13} />
                            </button>
                            <button
                              className="btn-icon"
                              title="Edit Akun"
                              onClick={() => handleOpenEdit(acc)}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn-icon text-danger"
                              title="Hapus Akun VPN"
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus akun VPN "${acc.name}"?`)) {
                                  onDeleteAccount(acc.id);
                                  showToast(`Akun VPN ${acc.name} berhasil dihapus.`);
                                }
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBPAGE: REMOTE WINBOX QUICK ACCESS */}
      {/* ========================================================================= */}
      {activeSubTab === 'remote_winbox' && (
        <div>
          <div
            className="glass-panel"
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Daftar Port NAT Remote Winbox &amp; API Router
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Salin alamat `Host:Port` dan masukkan ke kolom "Connect To" pada aplikasi Winbox di PC/Laptop Anda.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem'
            }}
          >
            {accounts
              .filter((a) => a.publicPortWinbox !== undefined)
              .map((acc) => {
                const winboxAddress = `${acc.serverHost}:${acc.publicPortWinbox}`;
                const apiAddress = acc.publicPortApi ? `${acc.serverHost}:${acc.publicPortApi}` : null;
                const webAddress = acc.publicPortWeb ? `http://${acc.serverHost}:${acc.publicPortWeb}` : null;

                return (
                  <div
                    key={acc.id}
                    className="glass-panel"
                    style={{
                      padding: '1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: `4px solid ${acc.status === 'CONNECTED' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                          {acc.protocol.replace('_', ' / ')}
                        </span>
                        {acc.status === 'CONNECTED' ? (
                          <span className="badge badge-good" style={{ fontSize: '0.65rem' }}>ONLINE</span>
                        ) : (
                          <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>OFFLINE</span>
                        )}
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {acc.routerName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                        {acc.name}
                      </div>

                      {/* Winbox Box */}
                      <div
                        style={{
                          background: 'var(--bg-tertiary)',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          marginBottom: '0.65rem'
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          WINBOX CONNECT TO:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                          <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--accent-cyan)' }}>
                            {winboxAddress}
                          </code>
                          <button
                            className="btn-primary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                            onClick={() => handleCopy(winboxAddress, 'Host Winbox')}
                          >
                            <Copy size={12} />
                            <span>Salin</span>
                          </button>
                        </div>
                      </div>

                      {/* Other Ports */}
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {apiAddress && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                            API: <code style={{ color: 'var(--accent-amber)' }}>{apiAddress}</code>
                          </div>
                        )}
                        {webAddress && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                            WebFig: <code style={{ color: 'var(--accent-blue)' }}>Port {acc.publicPortWeb}</code>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>IP Tunnel: <strong>{acc.assignedIp}</strong></span>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}
                        onClick={() => setScriptModalAccount(acc)}
                      >
                        <Code size={12} />
                        <span>Script</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBPAGE: SERVER GATEWAYS */}
      {/* ========================================================================= */}
      {activeSubTab === 'servers' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {servers.map((srv) => (
              <div key={srv.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Server size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>{srv.name}</h3>
                  </div>
                  <span className="badge badge-good">ONLINE</span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Lokasi Datacenter: <strong>{srv.location}</strong>
                </div>

                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1rem',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>IP Publik / FQDN:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{srv.domain} ({srv.ip})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Klien Aktif:</span>
                    <span><strong>{srv.activeClients}</strong> / {srv.maxClients} Tunnels</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Bandwidth Gateway:</span>
                    <span>{srv.bandwidthUsage}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>CPU / RAM Usage:</span>
                    <span>CPU: {srv.cpuLoad}% | RAM: {srv.ramUsage}%</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Protokol Didukung:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {srv.protocolsSupported.map((p) => (
                      <span key={p} className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                        {p.replace('_', ' / ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBPAGE: SCRIPT GENERATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'script_gen' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            MikroTik CLI Script Generator
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Pilih akun VPN di bawah untuk menghasilkan baris perintah Terminal MikroTik secara otomatis.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Pilih Akun VPN:
              </label>
              <select
                className="form-select"
                style={{ width: '280px' }}
                value={scriptModalAccount?.id || accounts[0]?.id}
                onChange={(e) => {
                  const found = accounts.find((a) => a.id === e.target.value);
                  if (found) setScriptModalAccount(found);
                }}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Versi RouterOS:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn-secondary ${rosVersion === 'ROS_V7' ? 'active' : ''}`}
                  style={{
                    borderColor: rosVersion === 'ROS_V7' ? 'var(--accent-cyan)' : undefined,
                    color: rosVersion === 'ROS_V7' ? 'var(--accent-cyan)' : undefined
                  }}
                  onClick={() => setRosVersion('ROS_V7')}
                >
                  RouterOS v7 (Modern)
                </button>
                <button
                  className={`btn-secondary ${rosVersion === 'ROS_V6' ? 'active' : ''}`}
                  style={{
                    borderColor: rosVersion === 'ROS_V6' ? 'var(--accent-cyan)' : undefined,
                    color: rosVersion === 'ROS_V6' ? 'var(--accent-cyan)' : undefined
                  }}
                  onClick={() => setRosVersion('ROS_V6')}
                >
                  RouterOS v6 (Legacy)
                </button>
              </div>
            </div>
          </div>

          {/* Script Output Box */}
          {(() => {
            const acc = scriptModalAccount || accounts[0];
            if (!acc) return null;
            const scriptContent = generateMikrotikScript(acc, rosVersion);

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Terminal Command untuk: <strong style={{ color: 'var(--accent-cyan)' }}>{acc.routerName}</strong>
                  </span>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={() => handleCopy(scriptContent, 'Script MikroTik')}
                  >
                    <Copy size={13} />
                    <span>Salin Script CLI</span>
                  </button>
                </div>

                <pre
                  style={{
                    background: '#070b12',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    lineHeight: 1.6,
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {scriptContent}
                </pre>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT VPN ACCOUNT */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  {editingAccount ? 'Edit Akun VPN Tunnel' : 'Tambah Akun VPN Tunnel Baru'}
                </h3>
              </div>
              <button className="icon-action-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveForm}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Akun / Label Identitas</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Remote Winbox POP Ubud"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username VPN (Login)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="rw-ubud"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password / Secret</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Pass123!#"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Protokol VPN</label>
                    <select
                      className="form-select"
                      value={formProtocol}
                      onChange={(e) => setFormProtocol(e.target.value as VpnProtocol)}
                    >
                      <option value="L2TP_IPSEC">L2TP / IPSec (Populer)</option>
                      <option value="WIREGUARD">WireGuard (Ultra Fast)</option>
                      <option value="SSTP">SSTP (Bypass Firewall)</option>
                      <option value="OPENVPN">OpenVPN (Cross Platform)</option>
                      <option value="PPTP">PPTP (Legacy)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Server Gateway Host</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formServerHost}
                      onChange={(e) => setFormServerHost(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">IP Tunnel Tetap (Static)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="10.255.0.15"
                      value={formAssignedIp}
                      onChange={(e) => setFormAssignedIp(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Router / Perangkat Sasaran</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="RB4011-POP-Ubud"
                      value={formRouterName}
                      onChange={(e) => setFormRouterName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.75rem 0', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>
                    Alokasi Port Forwarding (Remote Winbox &amp; API):
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Port Winbox</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="18291"
                        value={formPublicPortWinbox}
                        onChange={(e) => setFormPublicPortWinbox(Number(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Port API (8728)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="18728"
                        value={formPublicPortApi}
                        onChange={(e) => setFormPublicPortApi(Number(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Port WebFig (80)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="18080"
                        value={formPublicPortWeb}
                        onChange={(e) => setFormPublicPortWeb(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan &amp; Keterangan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Keterangan alokasi router atau teknisi"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingAccount ? 'Simpan Perubahan' : 'Buat Akun VPN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SCRIPT VIEW DIALOG */}
      {/* ========================================================================= */}
      {scriptModalAccount && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Script Setup: {scriptModalAccount.name}
                </h3>
              </div>
              <button className="icon-action-btn" onClick={() => setScriptModalAccount(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Buka Terminal MikroTik di router <strong>{scriptModalAccount.routerName}</strong>, lalu copy-paste perintah berikut:
              </p>

              <pre
                style={{
                  background: '#070b12',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  color: '#38bdf8',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  lineHeight: 1.6,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {generateMikrotikScript(scriptModalAccount, 'ROS_V7')}
              </pre>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setScriptModalAccount(null)}>
                Tutup
              </button>
              <button
                className="btn-primary"
                onClick={() => handleCopy(generateMikrotikScript(scriptModalAccount, 'ROS_V7'), 'Script CLI')}
              >
                <Copy size={14} />
                <span>Salin Script</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
