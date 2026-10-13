import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  RotateCw,
  Eye,
  EyeOff,
  Save,
  Activity,
  Play,
  Plus,
  Trash2
} from 'lucide-react';
import { GenieACSCPE } from '../types';

interface GenieAcsModuleProps {
  cpes: GenieACSCPE[];
  onUpdateWifi: (deviceId: string, ssid24: string, ssid5?: string, password?: string) => void;
  onRebootCpe: (deviceId: string) => void;
  onAddCpe: (cpe: GenieACSCPE) => void;
  onDeleteCpe: (deviceId: string) => void;
}

export const GenieAcsModule: React.FC<GenieAcsModuleProps> = ({
  cpes,
  onUpdateWifi,
  onRebootCpe,
  onAddCpe,
  onDeleteCpe
}) => {
  const [selectedCpe, setSelectedCpe] = useState<GenieACSCPE | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editSsid24, setEditSsid24] = useState('');
  const [editSsid5, setEditSsid5] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pingRunning, setPingRunning] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Add CPE modal state
  const [isAddCpeOpen, setIsAddCpeOpen] = useState(false);
  const [newSn, setNewSn] = useState('');
  const [newModel, setNewModel] = useState('ZXHN F670L');
  const [newCustomer, setNewCustomer] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newSsid, setNewSsid] = useState('');
  const [newPass, setNewPass] = useState('fibercepat2026');

  const handleOpenEdit = (cpe: GenieACSCPE) => {
    setSelectedCpe(cpe);
    setEditSsid24(cpe.ssid24);
    setEditSsid5(cpe.ssid5 || '');
    setEditPassword(cpe.wifiPassword || 'indonesia2026');
    setShowPassword(false);
    setPingResult(null);
  };

  const handleSaveWifi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCpe) return;
    setIsSaving(true);
    setTimeout(() => {
      onUpdateWifi(selectedCpe.deviceId, editSsid24, editSsid5, editPassword);
      setIsSaving(false);
      setSelectedCpe({
        ...selectedCpe,
        ssid24: editSsid24,
        ssid5: editSsid5,
        wifiPassword: editPassword
      });
    }, 1000);
  };

  const handleRunPing = () => {
    setPingRunning(true);
    setPingResult(null);
    setTimeout(() => {
      setPingRunning(false);
      setPingResult('PING 8.8.8.8: 5 packets transmitted, 5 received, 0% packet loss, time 4004ms\nrtt min/avg/max = 12.4/14.8/18.2 ms');
    }, 1500);
  };

  const handleSaveAddCpe = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCpe({
      deviceId: `cpe-${newSn}`,
      serialNumber: newSn,
      customerName: newCustomer,
      pppoeUser: newUser,
      modelName: newModel,
      hardwareVersion: 'V2.0.0',
      softwareVersion: 'V2.0.10P1T1',
      ssid24: newSsid,
      ssid5: `${newSsid}_5G`,
      wifiPassword: newPass,
      channel24: 6,
      isRadioOn: true,
      connectedClients: 1,
      rxOpticalDbm: -19.2,
      lastInform: 'Just now',
      wanIp: '100.64.12.99'
    });
    setNewSn('');
    setNewCustomer('');
    setNewUser('');
    setNewSsid('');
    setIsAddCpeOpen(false);
  };

  return (
    <div className="genieacs-module">
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>GenieACS (TR-069 / CWMP) Remote ONT Manager</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Zero-Touch Provisioning (ZTP), Remote Wi-Fi SSID &amp; Password, Client Diagnostics
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn-primary" onClick={() => setIsAddCpeOpen(true)}>
              <Plus size={14} />
              <span>+ Daftarkan CPE Manual</span>
            </button>
            <span className="badge badge-active">ACS REST: 7557 UP</span>
          </div>
        </div>
      </div>

      {/* CPE Table */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Daftar Modem ONT Terkelola (TR-069 CPEs)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Klik "Kelola Wi-Fi" untuk mengubah parameter ONT dari jarak jauh tanpa berkunjung ke rumah pelanggan
            </p>
          </div>
          <span className="badge badge-active">{cpes.length} CPEs Terhubung</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial Number (SN)</th>
                <th>Model ONT &amp; Firmware</th>
                <th>Pelanggan</th>
                <th>Nama Wi-Fi (SSID)</th>
                <th>Perangkat Terkoneksi</th>
                <th>Rx Redaman Optik</th>
                <th>Last Inform</th>
                <th>Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody>
              {cpes.map((cpe) => (
                <tr key={cpe.deviceId}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {cpe.serialNumber}
                    </strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      IP: {cpe.wanIp}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cpe.modelName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cpe.softwareVersion}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cpe.customerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>User: {cpe.pppoeUser}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                      <Wifi size={13} />
                      <strong>{cpe.ssid24}</strong>
                    </div>
                    {cpe.ssid5 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                        5G: {cpe.ssid5}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                      {cpe.connectedClients} Gadget Aktif
                    </span>
                  </td>
                  <td>
                    <span className="dbm-good" style={{ fontSize: '0.88rem' }}>
                      {cpe.rxOpticalDbm} dBm
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cpe.lastInform}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        className="btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        onClick={() => handleOpenEdit(cpe)}
                      >
                        <Wifi size={13} />
                        <span>Kelola Wi-Fi</span>
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.5rem', color: 'var(--accent-rose)' }}
                        onClick={() => onDeleteCpe(cpe.deviceId)}
                        title="Hapus CPE dari GenieACS"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH CPE MANUAL */}
      {isAddCpeOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCpeOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>+ Daftarkan CPE TR-069 Baru</h3>
              <button className="btn-icon" onClick={() => setIsAddCpeOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAddCpe}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Serial Number (SN) Modem</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ZTEGC1122334"
                    value={newSn}
                    onChange={(e) => setNewSn(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Model Modem</label>
                    <select
                      className="form-select"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                    >
                      <option value="ZXHN F670L">ZTE ZXHN F670L</option>
                      <option value="ZXHN F609">ZTE ZXHN F609</option>
                      <option value="EchoLife HG8245H5">Huawei HG8245H5</option>
                      <option value="VSOL V2804AX">VSOL V2804AX</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Pelanggan</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newCustomer}
                      onChange={(e) => setNewCustomer(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Username PPPoE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Default SSID Wi-Fi</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MyHome_WiFi"
                      value={newSsid}
                      onChange={(e) => setNewSsid(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password Wi-Fi</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddCpeOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Daftarkan CPE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA CPE & WI-FI VIA TR-069 */}
      {selectedCpe && (
        <div className="modal-overlay" onClick={() => setSelectedCpe(null)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wifi size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Remote Setting Wi-Fi (TR-069 SetParameterValues)
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setSelectedCpe(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedCpe.customerName}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Model: {selectedCpe.modelName} • SN: {selectedCpe.serialNumber} • WAN IP: {selectedCpe.wanIp}
                  </div>
                </div>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                  onClick={() => onRebootCpe(selectedCpe.deviceId)}
                  title="Kirim RPC Reboot ke ONT"
                >
                  <RotateCw size={13} />
                  <span>Reboot ONT</span>
                </button>
              </div>

              <form onSubmit={handleSaveWifi}>
                <div className="form-group">
                  <label className="form-label">Nama Wi-Fi 2.4 GHz (SSID 1)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editSsid24}
                    onChange={(e) => setEditSsid24(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Wi-Fi 5 GHz (SSID 2 - Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editSsid5}
                    onChange={(e) => setEditSsid5(e.target.value)}
                    placeholder="Contoh: NamaWifi_5G"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kata Sandi Wi-Fi (WPA2-PSK / WPA3-SAE)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      required
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Activity size={14} style={{ color: 'var(--accent-cyan)' }} />
                      <span>Diagnostik Ping dari ONT ke Gateway (IPPingDiagnostics)</span>
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                      onClick={handleRunPing}
                      disabled={pingRunning}
                    >
                      <Play size={11} />
                      <span>{pingRunning ? 'Menguji...' : 'Uji Ping'}</span>
                    </button>
                  </div>
                  {pingResult && (
                    <pre style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', color: 'var(--accent-emerald)', whiteSpace: 'pre-wrap' }}>
                      {pingResult}
                    </pre>
                  )}
                </div>

                <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.25rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedCpe(null)}>
                    Batal
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSaving}>
                    <Save size={14} />
                    <span>{isSaving ? 'Menyimpan ke ONT via TR-069...' : 'Simpan & Push ke ONT'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
