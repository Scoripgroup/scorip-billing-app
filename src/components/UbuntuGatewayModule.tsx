import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Shield,
  Radio,
  Activity,
  Terminal,
  Copy,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Lock,
  Globe,
  Settings,
  RefreshCw,
  Search,
  Check,
  X,
  Code,
  ArrowRight,
  Cpu,
  Layers,
  KeyRound,
  Download
} from 'lucide-react';
import { CloudflareTunnelConfig, IngressRule, UbuntuGatewaySettings } from '../types';

interface UbuntuGatewayModuleProps {
  tunnel: CloudflareTunnelConfig;
  ingressRules: IngressRule[];
  gatewaySettings: UbuntuGatewaySettings;
  onUpdateTunnel: (tunnel: CloudflareTunnelConfig) => void;
  onUpdateGatewaySettings: (settings: UbuntuGatewaySettings) => void;
  onAddIngressRule: (rule: IngressRule) => void;
  onEditIngressRule: (rule: IngressRule) => void;
  onDeleteIngressRule: (id: string) => void;
  onToggleIngressRule: (id: string) => void;
}

export const UbuntuGatewayModule: React.FC<UbuntuGatewayModuleProps> = ({
  tunnel,
  ingressRules,
  gatewaySettings,
  onUpdateTunnel,
  onUpdateGatewaySettings,
  onAddIngressRule,
  onEditIngressRule,
  onDeleteIngressRule,
  onToggleIngressRule
}) => {
  const [activeTab, setActiveTab] = useState<'ingress' | 'ubuntu_settings' | 'configs' | 'client_guide'>('ingress');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Ingress Rule
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IngressRule | null>(null);
  const [formHostname, setFormHostname] = useState('');
  const [formProtocol, setFormProtocol] = useState<'TCP' | 'HTTP' | 'HTTPS' | 'SSH'>('TCP');
  const [formTargetAddress, setFormTargetAddress] = useState('10.255.0.10:8291');
  const [formRouterName, setFormRouterName] = useState('CCR2004-16G-2S+ Core POP');
  const [formDescription, setFormDescription] = useState('Remote Winbox via Cloudflare Tunnel');
  const [formPolicy, setFormPolicy] = useState<'PUBLIC' | 'ZERO_TRUST_PIN' | 'RESTRICTED_IP'>('ZERO_TRUST_PIN');

  // Form State for Ubuntu Settings
  const [settingsIpForward, setSettingsIpForward] = useState(gatewaySettings.ipForwardingEnabled);
  const [settingsInterface, setSettingsInterface] = useState(gatewaySettings.natInterface);
  const [settingsWgPort, setSettingsWgPort] = useState(gatewaySettings.wireguardPort);
  const [settingsWgSubnet, setSettingsWgSubnet] = useState(gatewaySettings.wireguardSubnet);
  const [settingsDns, setSettingsDns] = useState(gatewaySettings.dnsServers);

  // Active Config Generator Tab
  const [configType, setConfigType] = useState<'CF_YAML' | 'WG_CONF' | 'BASH_SCRIPT'>('CF_YAML');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} disalin ke clipboard!`);
  };

  // Open Add Rule Modal
  const handleOpenAddRule = () => {
    setEditingRule(null);
    setFormHostname('winbox-cabang.scorip.net');
    setFormProtocol('TCP');
    setFormTargetAddress('10.255.0.25:8291');
    setFormRouterName('RB4011-Cabang');
    setFormDescription('Remote Winbox Cabang');
    setFormPolicy('ZERO_TRUST_PIN');
    setIsAddRuleModalOpen(true);
  };

  // Open Edit Rule Modal
  const handleOpenEditRule = (rule: IngressRule) => {
    setEditingRule(rule);
    setFormHostname(rule.hostname);
    setFormProtocol(rule.serviceProtocol);
    setFormTargetAddress(rule.targetAddress);
    setFormRouterName(rule.routerName);
    setFormDescription(rule.description);
    setFormPolicy(rule.accessPolicy);
    setIsAddRuleModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHostname.trim() || !formTargetAddress.trim()) return;

    if (editingRule) {
      const updated: IngressRule = {
        ...editingRule,
        hostname: formHostname.trim(),
        serviceProtocol: formProtocol,
        targetAddress: formTargetAddress.trim(),
        description: formDescription.trim(),
        routerName: formRouterName.trim(),
        accessPolicy: formPolicy
      };
      onEditIngressRule(updated);
      showToast(`Ingress Rule untuk ${updated.hostname} berhasil diperbarui.`);
    } else {
      const newRule: IngressRule = {
        id: `ING-${Date.now()}`,
        hostname: formHostname.trim(),
        serviceProtocol: formProtocol,
        targetAddress: formTargetAddress.trim(),
        description: formDescription.trim(),
        routerName: formRouterName.trim(),
        accessPolicy: formPolicy,
        status: 'ACTIVE'
      };
      onAddIngressRule(newRule);
      showToast(`Ingress Rule baru ${newRule.hostname} berhasil ditambahkan!`);
    }

    setIsAddRuleModalOpen(false);
  };

  const handleSaveUbuntuSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGatewaySettings({
      ...gatewaySettings,
      ipForwardingEnabled: settingsIpForward,
      natInterface: settingsInterface.trim(),
      wireguardPort: Number(settingsWgPort),
      wireguardSubnet: settingsWgSubnet.trim(),
      dnsServers: settingsDns.trim()
    });
    showToast('Pengaturan Server Gateway Ubuntu berhasil disimpan!');
  };

  // Filtered Rules
  const filteredRules = ingressRules.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.hostname.toLowerCase().includes(q) ||
        r.targetAddress.toLowerCase().includes(q) ||
        r.routerName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Generated Cloudflare config.yml
  const generateCloudflareYaml = () => {
    return `# ====================================================================
# CLOUDFLARE TUNNEL CONFIGURATION (/etc/cloudflared/config.yml)
# Server Gateway: ${gatewaySettings.hostname} (${gatewaySettings.osVersion})
# ====================================================================
tunnel: ${tunnel.tunnelId}
credentials-file: /etc/cloudflared/${tunnel.tunnelId}.json

ingress:
${ingressRules
  .filter((r) => r.status === 'ACTIVE')
  .map(
    (r) =>
      `  - hostname: ${r.hostname}\n    service: ${
        r.serviceProtocol === 'TCP'
          ? `tcp://${r.targetAddress}`
          : r.serviceProtocol === 'HTTP'
          ? `http://${r.targetAddress}`
          : r.serviceProtocol === 'HTTPS'
          ? `https://${r.targetAddress}`
          : `ssh://${r.targetAddress}`
      }`
  )
  .join('\n')}
  # Catch-all rule (Wajib ditaruh di baris paling bawah)
  - service: http_status:404
`;
  };

  // Generated WireGuard wg0.conf for Ubuntu
  const generateWireGuardConf = () => {
    return `# ====================================================================
# WIREGUARD SERVER CONFIGURATION (/etc/wireguard/wg0.conf)
# Gateway Subnet: ${settingsWgSubnet} | NAT Out: ${settingsInterface}
# ====================================================================
[Interface]
Address = 10.255.0.1/24
ListenPort = ${settingsWgPort}
PrivateKey = <SERVER_PRIVATE_KEY_HERE>

# IPTables Forwarding & NAT Masquerade
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -A FORWARD -o wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o ${settingsInterface} -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -D FORWARD -o wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o ${settingsInterface} -j MASQUERADE

# Peer 1: Router CCR2004 Core POP
[Peer]
PublicKey = wG71CCR2004Core94+71pLs+AbcDefGh123456789XyZ=
AllowedIPs = 10.255.0.10/32

# Peer 2: Router RB4011 POP Ubud
[Peer]
PublicKey = wG71NOC94+71pLs+AbcDefGh123456789XyZ=
AllowedIPs = 10.255.10.2/32

# Peer 3: Router RB4011 POP Timur
[Peer]
PublicKey = wG71POPEast94+71pLs+AbcDefGh123456789XyZ=
AllowedIPs = 10.255.0.12/32
`;
  };

  // Generated Bash installer script
  const generateBashSetupScript = () => {
    return `#!/bin/bash
# ====================================================================
# SETUP SCRIPT UBUNTU GATEWAY + CLOUDFLARE TUNNEL + WIREGUARD
# Jalankan dengan: sudo bash setup-gateway.sh
# ====================================================================

set -e
echo "==> 1. Updating APT & Menginstall Dependensi..."
sudo apt update && sudo apt install -y wireguard iptables-persistent curl net-tools

echo "==> 2. Mengaktifkan IP Forwarding di Ubuntu..."
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.d/99-sysctl.conf

echo "==> 3. Memasang cloudflared daemon..."
if ! command -v cloudflared &> /dev/null; then
  curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  sudo dpkg -i cloudflared.deb
  rm cloudflared.deb
fi

echo "==> 4. Mengaktifkan Service WireGuard & cloudflared..."
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0 || true

sudo systemctl enable cloudflared
sudo systemctl restart cloudflared || true

echo "==> SELSAI! Gateway Ubuntu & Cloudflare Tunnel Siap Digunakan."
`;
  };

  return (
    <div className="ubuntu-gateway-module">
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
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid #f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316'
              }}
            >
              <Cloud size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Server Gateway Ubuntu &amp; Cloudflare Tunnel
                </h2>
                <span className="badge badge-good" style={{ fontSize: '0.68rem' }}>
                  CONNECTED
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Arsitektur Zero Trust: Akses Remote Winbox, WebFig, &amp; API Router MikroTik Aman Tanpa Port Publik Terbuka
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleOpenAddRule}>
              <Plus size={15} />
              <span>+ Ingress Rule Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Visual Topology Box */}
      <div
        className="glass-panel"
        style={{
          padding: '1.1rem 1.25rem',
          marginBottom: '1.25rem',
          background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.9), rgba(15, 23, 42, 0.8))',
          border: '1px solid rgba(6, 182, 212, 0.25)'
        }}
      >
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          ALUR KONEKSI REALTIME ZERO TRUST GATEWAY
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'center'
          }}
        >
          {/* Step 1: Client */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>1. CLIENT / TEKNISI</div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Winbox / Web Browser
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
              winbox-core.scorip.net
            </div>
          </div>

          {/* Arrow */}
          <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={20} />
          </div>

          {/* Step 2: Cloudflare Edge */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
            <div style={{ fontSize: '0.65rem', color: '#f97316', fontWeight: 600 }}>2. CLOUDFLARE EDGE</div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Anycast Network (CGK/SIN)
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Enkripsi TLS 1.3 &amp; Zero Trust Auth
            </div>
          </div>

          {/* Arrow */}
          <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={20} />
          </div>

          {/* Step 3: Ubuntu Server */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>3. SERVER UBUNTU ANDA</div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {gatewaySettings.hostname}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
              cloudflared + WireGuard ({gatewaySettings.serverIp})
            </div>
          </div>

          {/* Arrow */}
          <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'center' }}>
            <ArrowRight size={20} />
          </div>

          {/* Step 4: MikroTik Router */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>4. MIKROTIK DI LAPANGAN</div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Router POP / OLT
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
              10.255.0.10:8291
            </div>
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLOUDFLARE TUNNEL ID</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {tunnel.tunnelId.substring(0, 13)}...
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            Tunnel: {tunnel.tunnelName}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONNECTOR STATUS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>
            HEALTHY
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Edge: {tunnel.edgeLocation}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL INGRESS RULES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>
            {ingressRules.length} Hostname
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {ingressRules.filter((r) => r.status === 'ACTIVE').length} routing aktif
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>UBUNTU IP FORWARDING</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.25rem', color: gatewaySettings.ipForwardingEnabled ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {gatewaySettings.ipForwardingEnabled ? 'ENABLED (1)' : 'DISABLED (0)'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            sysctl net.ipv4.ip_forward
          </div>
        </div>
      </div>

      {/* Subpage Nav Tabs */}
      <div className="tab-nav" style={{ marginBottom: '1rem' }}>
        <button
          className={`tab-btn ${activeTab === 'ingress' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingress')}
        >
          <Globe size={16} />
          <span>Ingress Rules ({ingressRules.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'ubuntu_settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ubuntu_settings')}
        >
          <Settings size={16} />
          <span>Konfigurasi Server Ubuntu</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'configs' ? 'active' : ''}`}
          onClick={() => setActiveTab('configs')}
        >
          <Code size={16} />
          <span>Config Generator (YAML &amp; WireGuard)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'client_guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('client_guide')}
        >
          <Terminal size={16} />
          <span>Panduan Connect Teknisi</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBPAGE: INGRESS RULES */}
      {/* ========================================================================= */}
      {activeTab === 'ingress' && (
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
            <div className="search-box" style={{ maxWidth: '320px' }}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Cari domain hostname, target IP, router..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => showToast('Status connector Cloudflare Tunnel berhasil dicek ulang.')}>
                <RefreshCw size={14} />
                <span>Cek Status Tunnel</span>
              </button>
              <button className="btn-primary" onClick={handleOpenAddRule}>
                <Plus size={14} />
                <span>Tambah Ingress Rule</span>
              </button>
            </div>
          </div>

          {/* Ingress Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '42px', textAlign: 'center' }}>No</th>
                  <th>Public Hostname Cloudflare</th>
                  <th>Protokol</th>
                  <th>Target IP &amp; Port (Tunnel)</th>
                  <th>Perangkat MikroTik</th>
                  <th>Akses Policy Zero Trust</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '140px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Belum ada Ingress Rule Cloudflare yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule, idx) => {
                    const connectCmd = `cloudflared access tcp --hostname ${rule.hostname} --url 127.0.0.1:8291`;

                    return (
                      <tr key={rule.id}>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {idx + 1}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Globe size={14} style={{ color: 'var(--accent-cyan)' }} />
                            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              {rule.hostname}
                            </strong>
                            <button
                              className="btn-icon"
                              style={{ width: '22px', height: '22px', padding: 0 }}
                              title="Salin Hostname"
                              onClick={() => handleCopy(rule.hostname, 'Hostname')}
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            {rule.description}
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge badge-neutral"
                            style={{
                              fontWeight: 700,
                              color:
                                rule.serviceProtocol === 'TCP'
                                  ? 'var(--accent-cyan)'
                                  : rule.serviceProtocol === 'HTTP'
                                  ? 'var(--accent-emerald)'
                                  : 'inherit'
                            }}
                          >
                            {rule.serviceProtocol}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-amber)' }}>
                            {rule.targetAddress}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            via WireGuard wg0
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{rule.routerName}</div>
                        </td>
                        <td>
                          <span
                            className="badge badge-neutral"
                            style={{
                              fontSize: '0.68rem',
                              borderColor:
                                rule.accessPolicy === 'ZERO_TRUST_PIN'
                                  ? 'rgba(249, 115, 22, 0.4)'
                                  : 'rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            <Lock size={10} />
                            {rule.accessPolicy === 'ZERO_TRUST_PIN'
                              ? 'Zero Trust OTP PIN'
                              : rule.accessPolicy === 'PUBLIC'
                              ? 'Public Access'
                              : 'Restricted IP'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            onClick={() => onToggleIngressRule(rule.id)}
                            title="Klik untuk ubah status aktif/nonaktif"
                          >
                            {rule.status === 'ACTIVE' ? (
                              <span className="badge badge-good">ACTIVE</span>
                            ) : (
                              <span className="badge badge-critical">DISABLED</span>
                            )}
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <button
                              className="btn-icon"
                              title="Salin Perintah Koneksi Client (Winbox via Cloudflare)"
                              onClick={() => handleCopy(connectCmd, 'Command Akses Winbox')}
                            >
                              <Terminal size={13} />
                            </button>
                            <button
                              className="btn-icon"
                              title="Edit Rule"
                              onClick={() => handleOpenEditRule(rule)}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn-icon text-danger"
                              title="Hapus Ingress Rule"
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus Ingress Rule ${rule.hostname}?`)) {
                                  onDeleteIngressRule(rule.id);
                                  showToast(`Ingress Rule ${rule.hostname} dihapus.`);
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
      {/* 2. SUBPAGE: UBUNTU SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'ubuntu_settings' && (
        <div className="glass-panel" style={{ padding: '1.25rem', maxWidth: '780px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Konfigurasi Jaringan &amp; Kernel Server Ubuntu
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Pengaturan sysctl IP Forwarding, subnet WireGuard, dan interface routing NAT pada OS Ubuntu Anda.
          </p>

          <form onSubmit={handleSaveUbuntuSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Hostname Server Ubuntu</label>
                <input
                  type="text"
                  className="form-input"
                  value={gatewaySettings.hostname}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Versi Sistem Operasi</label>
                <input
                  type="text"
                  className="form-input"
                  value={gatewaySettings.osVersion}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Network Outbound Interface (WAN)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="eth0 atau ens3"
                  value={settingsInterface}
                  onChange={(e) => setSettingsInterface(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Interface kartu jaringan keluar server (contoh: eth0, ens3, enp1s0)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Port Listen WireGuard Server</label>
                <input
                  type="number"
                  className="form-input"
                  value={settingsWgPort}
                  onChange={(e) => setSettingsWgPort(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Default port UDP WireGuard: 51820
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Subnet Alamat IP WireGuard (wg0)</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsWgSubnet}
                  onChange={(e) => setSettingsWgSubnet(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Range IP private internal tunnel (contoh: 10.255.0.0/24)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">DNS Resolver Upstream</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsDns}
                  onChange={(e) => setSettingsDns(e.target.value)}
                />
              </div>
            </div>

            {/* IP Forwarding Switch Panel */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Aktifkan Kernel IP Forwarding (net.ipv4.ip_forward = 1)
                </strong>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Wajib aktif agar paket data dari Cloudflare Tunnel dapat diteruskan ke router MikroTik di interface WireGuard.
                </p>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={settingsIpForward}
                  onChange={(e) => setSettingsIpForward(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: settingsIpForward ? 'var(--accent-emerald)' : '#334155',
                    borderRadius: '24px',
                    transition: '0.2s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: settingsIpForward ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.2s'
                    }}
                  />
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBPAGE: CONFIG GENERATOR */}
      {/* ========================================================================= */}
      {activeTab === 'configs' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                Generator File Konfigurasi Otomatis
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tinggal copy-paste file ini langsung ke folder server Ubuntu Anda tanpa perlu mengetik manual.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                className={`btn-secondary ${configType === 'CF_YAML' ? 'active' : ''}`}
                style={{
                  borderColor: configType === 'CF_YAML' ? 'var(--accent-cyan)' : undefined,
                  color: configType === 'CF_YAML' ? 'var(--accent-cyan)' : undefined
                }}
                onClick={() => setConfigType('CF_YAML')}
              >
                config.yml (Cloudflare)
              </button>
              <button
                className={`btn-secondary ${configType === 'WG_CONF' ? 'active' : ''}`}
                style={{
                  borderColor: configType === 'WG_CONF' ? 'var(--accent-cyan)' : undefined,
                  color: configType === 'WG_CONF' ? 'var(--accent-cyan)' : undefined
                }}
                onClick={() => setConfigType('WG_CONF')}
              >
                wg0.conf (WireGuard)
              </button>
              <button
                className={`btn-secondary ${configType === 'BASH_SCRIPT' ? 'active' : ''}`}
                style={{
                  borderColor: configType === 'BASH_SCRIPT' ? 'var(--accent-cyan)' : undefined,
                  color: configType === 'BASH_SCRIPT' ? 'var(--accent-cyan)' : undefined
                }}
                onClick={() => setConfigType('BASH_SCRIPT')}
              >
                setup-gateway.sh (Bash Script)
              </button>
            </div>
          </div>

          {/* Config Editor View */}
          {(() => {
            const content =
              configType === 'CF_YAML'
                ? generateCloudflareYaml()
                : configType === 'WG_CONF'
                ? generateWireGuardConf()
                : generateBashSetupScript();

            const fileName =
              configType === 'CF_YAML'
                ? '/etc/cloudflared/config.yml'
                : configType === 'WG_CONF'
                ? '/etc/wireguard/wg0.conf'
                : 'setup-gateway.sh';

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    File: <strong style={{ color: 'var(--accent-cyan)' }}>{fileName}</strong>
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => handleCopy(content, fileName)}
                    >
                      <Copy size={13} />
                      <span>Salin Isi File</span>
                    </button>
                  </div>
                </div>

                <pre
                  style={{
                    background: '#070b12',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    lineHeight: 1.6,
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {content}
                </pre>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBPAGE: CLIENT GUIDE */}
      {/* ========================================================================= */}
      {activeTab === 'client_guide' && (
        <div className="glass-panel" style={{ padding: '1.25rem', maxWidth: '820px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Cara Teknisi Membuka Winbox Melalui Cloudflare Tunnel
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Karena koneksi Winbox menggunakan protokol TCP murni (Port 8291), teknisi di laptop cukup menjalankan satu baris perintah di PowerShell atau Command Prompt.
          </p>

          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem'
            }}
          >
            <strong style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>
              Langkah 1: Unduh &amp; Jalankan cloudflared di Laptop Teknisi
            </strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Unduh executable kecil <code>cloudflared.exe</code> untuk Windows. Lalu buka Command Prompt / Terminal laptop:
            </p>
            <pre
              style={{
                background: '#070b12',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                marginTop: '0.4rem',
                fontSize: '0.75rem',
                color: '#f8fafc',
                fontFamily: 'var(--font-mono)'
              }}
            >
              cloudflared access tcp --hostname winbox-core.scorip.net --url 127.0.0.1:8291
            </pre>
          </div>

          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem'
            }}
          >
            <strong style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)' }}>
              Langkah 2: Buka Winbox di Laptop
            </strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Di aplikasi Winbox, pada kolom <strong>Connect To</strong> cukup ketik:
            </p>
            <pre
              style={{
                background: '#070b12',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                marginTop: '0.4rem',
                fontSize: '0.75rem',
                color: '#10b981',
                fontFamily: 'var(--font-mono)'
              }}
            >
              127.0.0.1:8291
            </pre>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Lalu klik <strong>Connect</strong> dengan username &amp; password MikroTik Anda. Koneksi akan langsung terowong secara aman melalui Cloudflare Zero Trust ke router CCR2004 Core Anda!
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT INGRESS RULE */}
      {/* ========================================================================= */}
      {isAddRuleModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cloud size={18} style={{ color: '#f97316' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  {editingRule ? 'Edit Ingress Rule Cloudflare' : 'Tambah Ingress Rule Baru'}
                </h3>
              </div>
              <button className="icon-action-btn" onClick={() => setIsAddRuleModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRule}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Public Hostname (Domain)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="winbox-cabang.scorip.net"
                    value={formHostname}
                    onChange={(e) => setFormHostname(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Subdomain publik yang diarahkan via DNS Cloudflare Tunnel (CNAME)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Protokol</label>
                    <select
                      className="form-select"
                      value={formProtocol}
                      onChange={(e) => setFormProtocol(e.target.value as any)}
                    >
                      <option value="TCP">TCP (Winbox 8291 / API)</option>
                      <option value="HTTP">HTTP (WebFig Port 80)</option>
                      <option value="HTTPS">HTTPS (WebFig Port 443)</option>
                      <option value="SSH">SSH (Port 22)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Address (IP Tunnel : Port)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="10.255.0.25:8291"
                      value={formTargetAddress}
                      onChange={(e) => setFormTargetAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Router MikroTik Sasaran</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="RB4011-POP-Cabang"
                    value={formRouterName}
                    onChange={(e) => setFormRouterName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kebijakan Akses (Zero Trust Policy)</label>
                  <select
                    className="form-select"
                    value={formPolicy}
                    onChange={(e) => setFormPolicy(e.target.value as any)}
                  >
                    <option value="ZERO_TRUST_PIN">Zero Trust OTP PIN (Hanya Email Terdaftar)</option>
                    <option value="PUBLIC">Public Access (Bypass Policy)</option>
                    <option value="RESTRICTED_IP">Restricted IP Whitelist</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan / Catatan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Remote Winbox teknisi POP Cabang"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddRuleModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingRule ? 'Simpan Perubahan' : 'Tambahkan Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
