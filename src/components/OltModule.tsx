import React, { useState } from 'react';
import {
  Radio,
  Layers,
  RotateCw,
  Plus,
  Zap,
  Sparkles,
  Check,
  Trash2,
  Edit2,
  Server
} from 'lucide-react';
import { OLTDevice, UnregisteredONU, RegisteredONU, ODPPoint, ODCPoint, PPPoEClient } from '../types';
import { ZteC300VisualizerModal } from './ZteC300VisualizerModal';

interface OltModuleProps {
  olts: OLTDevice[];
  unregisteredOnus: UnregisteredONU[];
  registeredOnus: RegisteredONU[];
  odps: ODPPoint[];
  odcs?: ODCPoint[];
  clients: PPPoEClient[];
  onProvisionOnu: (sn: string, customerName: string, pppoeUser: string, odpId: string, odpPort: number) => void;
  onRebootOnu: (id: string) => void;
  onAddOlt: (olt: OLTDevice) => void;
  onDeleteOlt: (oltId: string) => void;
  onDeleteOnu: (onuId: string) => void;
  onEditOnu: (onu: RegisteredONU) => void;
  onAddOnuManual: (onu: RegisteredONU) => void;
}

export const OltModule: React.FC<OltModuleProps> = ({
  olts,
  unregisteredOnus,
  registeredOnus,
  odps,
  odcs = [],
  clients,
  onProvisionOnu,
  onRebootOnu,
  onAddOlt,
  onDeleteOlt,
  onDeleteOnu,
  onEditOnu,
  onAddOnuManual
}) => {
  const [selectedOltId, setSelectedOltId] = useState<string>(olts[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'registered' | 'unregistered' | 'pon_ports'>('registered');
  const [provisioningOnu, setProvisioningOnu] = useState<UnregisteredONU | null>(null);

  // Modals state
  const [isAddOltOpen, setIsAddOltOpen] = useState(false);
  const [isAddOnuManualOpen, setIsAddOnuManualOpen] = useState(false);
  const [editingOnu, setEditingOnu] = useState<RegisteredONU | null>(null);
  const [isZteVisualizerOpen, setIsZteVisualizerOpen] = useState(false);

  // Form: Add OLT
  const [oltName, setOltName] = useState('');
  const [oltBrand, setOltBrand] = useState<'ZTE' | 'HUAWEI' | 'VSOL' | 'FIBERHOME'>('ZTE');
  const [oltModel, setOltModel] = useState('');
  const [oltIp, setOltIp] = useState('');
  const [oltTotalPon, setOltTotalPon] = useState(16);

  // Form: Add ONU Manual
  const [manualSn, setManualSn] = useState('');
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualUser, setManualUser] = useState('');
  const [manualPonPort, setManualPonPort] = useState('gpon-olt_1/1/1:1');
  const [manualOdp, setManualOdp] = useState(odps[0]?.code || 'ODP-KTA-01');

  // Provisioning Wizard Form State
  const [selectedClientUser, setSelectedClientUser] = useState<string>(clients[0]?.username || '');
  const [selectedOdpId, setSelectedOdpId] = useState<string>(odps[0]?.id || '');
  const [selectedOdpPort, setSelectedOdpPort] = useState<number>(3);
  const [vlanId, setVlanId] = useState<number>(100);
  const [tcontProfile, setTcontProfile] = useState<string>('TCONT-UPTO-100M');
  const [isProvisioningLoading, setIsProvisioningLoading] = useState<boolean>(false);
  const [isProvisionSuccess, setIsProvisionSuccess] = useState<boolean>(false);

  const selectedOlt = olts.find((o) => o.id === selectedOltId) || olts[0];
  const filteredRegistered = registeredOnus.filter((o) => o.oltId === selectedOltId);
  const filteredUnregistered = unregisteredOnus.filter((o) => o.oltId === selectedOltId);

  const handleStartProvision = (onu: UnregisteredONU) => {
    setProvisioningOnu(onu);
    setIsProvisionSuccess(false);
  };

  const handleExecuteProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisioningOnu) return;

    setIsProvisioningLoading(true);
    setTimeout(() => {
      const client = clients.find((c) => c.username === selectedClientUser);
      onProvisionOnu(
        provisioningOnu.sn,
        client ? client.fullName : 'Pelanggan Baru',
        selectedClientUser,
        selectedOdpId,
        selectedOdpPort
      );
      setIsProvisioningLoading(false);
      setIsProvisionSuccess(true);
      setTimeout(() => {
        setProvisioningOnu(null);
      }, 1500);
    }, 1200);
  };

  const handleSaveAddOlt = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOlt({
      id: `OLT-${oltBrand}-${Date.now()}`,
      name: oltName,
      brand: oltBrand,
      model: oltModel,
      ip: oltIp,
      totalPonPorts: oltTotalPon,
      activePonPorts: Math.floor(oltTotalPon / 2),
      totalOnu: 0,
      unregisteredCount: 0,
      status: 'ONLINE',
      uptime: '1 day 00:00:00',
      temperature: 38
    });
    setOltName('');
    setOltModel('');
    setOltIp('');
    setIsAddOltOpen(false);
  };

  const handleSaveAddOnuManual = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOnuManual({
      id: `ONU-${Date.now()}`,
      sn: manualSn,
      customerName: manualCustomer,
      pppoeUser: manualUser,
      oltId: selectedOltId,
      ponPort: manualPonPort,
      rxPowerDbm: -19.5,
      txPowerDbm: 2.2,
      distanceKm: 1.2,
      status: 'ONLINE',
      cpeModel: 'ONT GPON Universal',
      odpCode: manualOdp
    });
    setManualSn('');
    setManualCustomer('');
    setManualUser('');
    setIsAddOnuManualOpen(false);
  };

  const handleSaveEditOnu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOnu) return;
    onEditOnu(editingOnu);
    setEditingOnu(null);
  };

  return (
    <div className="olt-module">
      {/* OLT Selector & Hardware Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Multi-OLT Hardware &amp; Optical GPON Manager</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ZTE C300/C320, Huawei SmartAX MA5608T, &amp; VSOL GPON/EPON Automation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pilih OLT:</span>
            <select
              value={selectedOltId}
              onChange={(e) => setSelectedOltId(e.target.value)}
              className="form-select"
              style={{ width: '280px', fontWeight: 700 }}
            >
              {olts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.brand})
                </option>
              ))}
            </select>
            <button
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0891b2)',
                border: '1px solid #38bdf8',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
              onClick={() => setIsZteVisualizerOpen(true)}
              title="Buka Visualizer Chassis ZTE C300 10U Rack &amp; Slot Tray"
            >
              <Server size={15} />
              <span>Visualizer ZTE C300</span>
            </button>
            <button className="btn-primary" onClick={() => setIsAddOltOpen(true)} title="Tambah Perangkat OLT Baru">
              <Plus size={14} />
              <span>Tambah OLT</span>
            </button>
            {olts.length > 1 && (
              <button
                className="btn-danger"
                onClick={() => onDeleteOlt(selectedOltId)}
                title="Hapus OLT Terpilih"
                style={{ padding: '0.45rem' }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Selected OLT Specs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Model OLT: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{selectedOlt?.model}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>IP Management: </span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedOlt?.ip}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>PON Ports Aktif: </span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              {selectedOlt?.activePonPorts} / {selectedOlt?.totalPonPorts} Ports
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total ONT Terdaftar: </span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedOlt?.totalOnu} ONT</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Suhu Chassis: </span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: selectedOlt?.temperature > 50 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {selectedOlt?.temperature}°C
            </strong>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-active">SNMP v2c &amp; TELNET OK</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
          onClick={() => setActiveTab('registered')}
        >
          <Radio size={16} />
          <span>Registered ONUs ({filteredRegistered.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'unregistered' ? 'active' : ''}`}
          onClick={() => setActiveTab('unregistered')}
          style={{ position: 'relative' }}
        >
          <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span>Auto-Find Unregistered ONUs</span>
          {filteredUnregistered.length > 0 && (
            <span className="badge-counter">{filteredUnregistered.length} Baru</span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'pon_ports' ? 'active' : ''}`}
          onClick={() => setActiveTab('pon_ports')}
        >
          <Layers size={16} />
          <span>PON SFP Matrix ({selectedOlt?.totalPonPorts} Slots)</span>
        </button>
      </div>

      {/* TAB 1: Registered ONUs & Optical Power (CRUD) */}
      {activeTab === 'registered' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Daftar ONT Terdaftar &amp; Telemetri Optik Real-Time</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Nilai Rx/Tx Optical Power di-polling langsung via OLT SNMP OID
              </p>
            </div>
            <button className="btn-primary" onClick={() => setIsAddOnuManualOpen(true)}>
              <Plus size={14} />
              <span>+ Registrasi Manual ONT</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serial Number (SN)</th>
                  <th>Pelanggan &amp; PPPoE</th>
                  <th>PON Port</th>
                  <th>ODP Terhubung</th>
                  <th>Rx Optical Power</th>
                  <th>Tx Power</th>
                  <th>Jarak Kabel</th>
                  <th>Status</th>
                  <th>Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistered.map((onu) => {
                  let dbmClass = 'dbm-good';
                  if (onu.rxPowerDbm < -22 && onu.rxPowerDbm >= -26) dbmClass = 'dbm-warning';
                  if (onu.rxPowerDbm < -26 || onu.status === 'LOS') dbmClass = 'dbm-critical';

                  return (
                    <tr key={onu.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                          {onu.sn}
                        </strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{onu.cpeModel}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{onu.customerName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          User: {onu.pppoeUser}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{onu.ponPort}</td>
                      <td>
                        <span className="badge badge-neutral">{onu.odpCode}</span>
                      </td>
                      <td>
                        <span className={dbmClass} style={{ fontSize: '0.9rem' }}>
                          {onu.status === 'LOS' ? 'LOS (Putus)' : `${onu.rxPowerDbm.toFixed(2)} dBm`}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {onu.status === 'LOS' ? '-' : `+${onu.txPowerDbm.toFixed(2)} dBm`}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{onu.distanceKm} km</td>
                      <td>
                        {onu.status === 'ONLINE' && <span className="badge badge-good">ONLINE</span>}
                        {onu.status === 'LOS' && <span className="badge badge-critical">LOS</span>}
                        {onu.status === 'DYING_GASP' && <span className="badge badge-warning">DYING GASP</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                            onClick={() => onRebootOnu(onu.id)}
                            title="Reboot ONT"
                          >
                            <RotateCw size={12} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                            onClick={() => setEditingOnu(onu)}
                            title="Edit Data ONT"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: 'var(--accent-rose)' }}
                            onClick={() => onDeleteOnu(onu.id)}
                            title="Unbind / Hapus ONT dari OLT"
                          >
                            <Trash2 size={12} />
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

      {/* TAB 2: Unregistered ONUs (Auto-Find) */}
      {activeTab === 'unregistered' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span>ONT Baru Terdeteksi Otomatis (Unregistered ONUs)</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Modem ONT baru yang ditancapkan ke splitter ODP dan memancarkan sinyal ke port OLT
              </p>
            </div>
            <span className="badge badge-active">{filteredUnregistered.length} Device Siap Diaktivasi</span>
          </div>

          {filteredUnregistered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Tidak ada ONT belum terdaftar pada OLT ini saat ini. Semua ONT telah terkonfigurasi.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Serial Number (SN)</th>
                    <th>Vendor / Merk</th>
                    <th>Port PON OLT</th>
                    <th>Waktu Deteksi</th>
                    <th>Aksi 1-Click Provisioning</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnregistered.map((onu) => (
                    <tr key={onu.sn}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
                          {onu.sn}
                        </strong>
                      </td>
                      <td>{onu.brand}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{onu.ponPort}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{onu.detectedAt}</td>
                      <td>
                        <button
                          className="btn-primary"
                          onClick={() => handleStartProvision(onu)}
                        >
                          <Zap size={14} />
                          <span>1-Click Provisioning Wizard</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PON Ports Matrix */}
      {activeTab === 'pon_ports' && (
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Status Slot PON SFP Transceiver</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Kapasitas maksimum 1:64 atau 1:128 ONT per PON port
              </p>
            </div>
            <button
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                fontWeight: 700
              }}
              onClick={() => setIsZteVisualizerOpen(true)}
            >
              <Server size={15} />
              <span>Buka Visualizer Chassis ZTE C300</span>
            </button>
          </div>

          {/* ZTE C300 Chassis Visualizer Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12), rgba(6, 182, 212, 0.16))',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '1.15rem 1.35rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(2, 132, 199, 0.4)'
                }}
              >
                <Server size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                  Interactive Chassis Rack &amp; Slot SFP Visualizer &mdash; ZTE ZXA10 C300 (10U)
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Visualisasi grafis panel depan rack 10U: Animasi Fan Tray cooling 4800 RPM berputar, Dual SCXN Control, GTGH 16-port GPON Class C++, pancaran laser Tx 1490nm / VFL 650nm, &amp; diagnostik CLI ZTE langsung.
                </p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => setIsZteVisualizerOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)',
                fontWeight: 800,
                padding: '0.65rem 1.25rem'
              }}
            >
              <Radio size={16} />
              <span>Jalankan Visualizer ZTE C300</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: selectedOlt?.totalPonPorts || 8 }).map((_, i) => {
              const portNum = i + 1;
              const isPortActive = portNum <= (selectedOlt?.activePonPorts || 0);
              const connectedOnuCount = isPortActive ? Math.floor(35 + (portNum * 7) % 25) : 0;

              return (
                <div
                  key={portNum}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    opacity: isPortActive ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>PON #{portNum}</strong>
                    <span className={`badge ${isPortActive ? 'badge-good' : 'badge-neutral'}`}>
                      {isPortActive ? 'UP' : 'EMPTY'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Terhubung: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{connectedOnuCount} ONT</strong> / 64
                  </div>

                  <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', marginTop: '0.4rem', overflow: 'hidden' }}>
                    <div style={{ width: `${(connectedOnuCount / 64) * 100}%`, height: '100%', background: 'var(--accent-cyan)' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    <span>TX: +4.2 dBm</span>
                    <span>38°C</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH OLT BARU */}
      {isAddOltOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOltOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>+ Tambah OLT Hardware Baru</h3>
              <button className="btn-icon" onClick={() => setIsAddOltOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAddOlt}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama OLT / Deskripsi</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: OLT-ZTE-C300-PUSAT"
                    value={oltName}
                    onChange={(e) => setOltName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Brand / Vendor</label>
                    <select
                      className="form-select"
                      value={oltBrand}
                      onChange={(e) => setOltBrand(e.target.value as any)}
                    >
                      <option value="ZTE">ZTE (C320/C300/C600)</option>
                      <option value="HUAWEI">Huawei (MA5608T/MA5800)</option>
                      <option value="VSOL">VSOL GPON/EPON</option>
                      <option value="FIBERHOME">Fiberhome</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total PON Slots</label>
                    <input
                      type="number"
                      className="form-input"
                      value={oltTotalPon}
                      onChange={(e) => setOltTotalPon(+e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Model Chassis / Board</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: ZTE C320 GTGH (16-PON GPON)"
                    value={oltModel}
                    onChange={(e) => setOltModel(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IP Management OLT</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="10.20.4.2"
                    value={oltIp}
                    onChange={(e) => setOltIp(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddOltOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Simpan &amp; Hubungkan OLT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRASI MANUAL ONT */}
      {isAddOnuManualOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOnuManualOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>+ Registrasi Manual ONT</h3>
              <button className="btn-icon" onClick={() => setIsAddOnuManualOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAddOnuManual}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Serial Number (SN) ONT</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ZTEGC1234567 atau HWTC1234567"
                    value={manualSn}
                    onChange={(e) => setManualSn(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nama Pelanggan</label>
                    <input
                      type="text"
                      className="form-input"
                      value={manualCustomer}
                      onChange={(e) => setManualCustomer(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username PPPoE</label>
                    <input
                      type="text"
                      className="form-input"
                      value={manualUser}
                      onChange={(e) => setManualUser(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Port PON OLT</label>
                    <input
                      type="text"
                      className="form-input"
                      value={manualPonPort}
                      onChange={(e) => setManualPonPort(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kotak ODP</label>
                    <select
                      className="form-select"
                      value={manualOdp}
                      onChange={(e) => setManualOdp(e.target.value)}
                    >
                      {odps.map((o) => (
                        <option key={o.id} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddOnuManualOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Daftarkan ONT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA ONT */}
      {editingOnu && (
        <div className="modal-overlay" onClick={() => setEditingOnu(null)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Edit ONT: {editingOnu.sn}</h3>
              <button className="btn-icon" onClick={() => setEditingOnu(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEditOnu}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Pelanggan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingOnu.customerName}
                    onChange={(e) => setEditingOnu({ ...editingOnu, customerName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Username PPPoE Terikat</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingOnu.pppoeUser}
                    onChange={(e) => setEditingOnu({ ...editingOnu, pppoeUser: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Port PON OLT</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingOnu.ponPort}
                      onChange={(e) => setEditingOnu({ ...editingOnu, ponPort: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kotak ODP</label>
                    <select
                      className="form-select"
                      value={editingOnu.odpCode}
                      onChange={(e) => setEditingOnu({ ...editingOnu, odpCode: e.target.value })}
                    >
                      {odps.map((o) => (
                        <option key={o.id} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingOnu(null)}>
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

      {/* MODAL 1-CLICK PROVISIONING WIZARD */}
      {provisioningOnu && (
        <div className="modal-overlay" onClick={() => !isProvisioningLoading && setProvisioningOnu(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={20} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1-Click ONU Provisioning Wizard</h3>
              </div>
              {!isProvisioningLoading && (
                <button className="btn-icon" onClick={() => setProvisioningOnu(null)}>✕</button>
              )}
            </div>

            {isProvisionSuccess ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '2.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Check size={36} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Provisioning Berhasil Di-Push ke OLT!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  ONT SN <code>{provisioningOnu.sn}</code> telah terikat ke port ODP dan konfigurasi Service-Port VLAN telah aktif. GenieACS akan segera menerapkan konfigurasi Wi-Fi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteProvision}>
                <div className="modal-body">
                  <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ONT SERIAL NUMBER:</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {provisioningOnu.sn}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Merk: {provisioningOnu.brand} • Port: {provisioningOnu.ponPort}
                      </div>
                    </div>
                    <span className="badge badge-active">TERHUBUNG KE OLT</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kaitkan ke Pelanggan / PPPoE Secret</label>
                    <select
                      className="form-select"
                      value={selectedClientUser}
                      onChange={(e) => setSelectedClientUser(e.target.value)}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.username}>
                          {c.fullName} ({c.username} - {c.profile})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Pilih Kotak ODP</label>
                      <select
                        className="form-select"
                        value={selectedOdpId}
                        onChange={(e) => setSelectedOdpId(e.target.value)}
                      >
                        {odps.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} ({o.usedPorts}/{o.capacityPorts} Port)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nomor Port Dropcore ODP</label>
                      <select
                        className="form-select"
                        value={selectedOdpPort}
                        onChange={(e) => setSelectedOdpPort(+e.target.value)}
                      >
                        {Array.from({ length: 16 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Port #{i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">VLAN Service-Port</label>
                      <input
                        type="number"
                        className="form-input"
                        value={vlanId}
                        onChange={(e) => setVlanId(+e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">TCONT / Traffic Profile</label>
                      <select
                        className="form-select"
                        value={tcontProfile}
                        onChange={(e) => setTcontProfile(e.target.value)}
                      >
                        <option value="TCONT-UPTO-50M">TCONT-UPTO-50M (Best Effort)</option>
                        <option value="TCONT-UPTO-100M">TCONT-UPTO-100M (Standard FTTH)</option>
                        <option value="TCONT-GIGABIT">TCONT-GIGABIT (Dedicated CIR)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setProvisioningOnu(null)}
                    disabled={isProvisioningLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isProvisioningLoading}
                  >
                    {isProvisioningLoading ? (
                      <>
                        <RotateCw size={15} className="pulse-indicator" />
                        <span>Mengeksekusi CLI OLT...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={15} />
                        <span>Push Konfigurasi OLT &amp; Aktivasi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ZTE ZXA10 C300 10U Hardware & Slot Tray Visualizer Modal */}
      <ZteC300VisualizerModal
        isOpen={isZteVisualizerOpen}
        onClose={() => setIsZteVisualizerOpen(false)}
        olt={selectedOlt}
        odcs={odcs}
        odps={odps}
        clients={clients}
      />
    </div>
  );
};
