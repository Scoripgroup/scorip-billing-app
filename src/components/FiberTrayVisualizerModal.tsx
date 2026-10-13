import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Layers,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Radio,
  Building,
  Box,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { ODCPoint, ODPPoint, PPPoEClient, CableRoute } from '../types';

// TIA-598 Standard 12 Colors
export const TIA_598_STANDARDS = [
  { no: 1, name: 'Biru (Blue)', hex: '#2563eb', lightHex: '#60a5fa' },
  { no: 2, name: 'Oranye (Orange)', hex: '#ea580c', lightHex: '#fb923c' },
  { no: 3, name: 'Hijau (Green)', hex: '#16a34a', lightHex: '#4ade80' },
  { no: 4, name: 'Coklat (Brown)', hex: '#92400e', lightHex: '#d97706' },
  { no: 5, name: 'Abu-abu (Slate)', hex: '#64748b', lightHex: '#94a3b8' },
  { no: 6, name: 'Putih (White)', hex: '#f8fafc', lightHex: '#ffffff' },
  { no: 7, name: 'Merah (Red)', hex: '#dc2626', lightHex: '#f87171' },
  { no: 8, name: 'Hitam (Black)', hex: '#334155', lightHex: '#64748b' },
  { no: 9, name: 'Kuning (Yellow)', hex: '#ca8a04', lightHex: '#facc15' },
  { no: 10, name: 'Ungu (Violet)', hex: '#9333ea', lightHex: '#c084fc' },
  { no: 11, name: 'Pink (Rose)', hex: '#db2777', lightHex: '#f472b6' },
  { no: 12, name: 'Toska (Aqua)', hex: '#0891b2', lightHex: '#22d3ee' }
];

export interface FiberSlotData {
  slotNumber: number;
  coreNumber: number;
  coreName: string;
  coreHex: string;
  tubeNumber: number;
  tubeName: string;
  tubeHex: string;
  inboundCable: string;
  status: 'ACTIVE' | 'STANDBY' | 'LOSS_ALERT' | 'EMPTY';
  spliceLossDb: number;
  rxOpticalDbm: number;
  destination: string;
  targetOdpCode?: string;
  clientName?: string;
  clientPlan?: string;
  clientAddress?: string;
  connectorType: 'SC/UPC' | 'SC/APC';
  splicedAt: string;
  technician: string;
  splicerTool: string;
  notes: string;
}

export interface FiberTrayData {
  id: string;
  trayNumber: number;
  name: string;
  description: string;
  slots: FiberSlotData[];
}

interface FiberTrayVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDevice?: {
    id: string;
    name: string;
    code: string;
    type: 'ODC' | 'ODP';
    capacityPorts?: number;
    usedPorts?: number;
  } | null;
  cables?: CableRoute[];
  odcs?: ODCPoint[];
  odps?: ODPPoint[];
  clients?: PPPoEClient[];
}

// Helper to generate default realistic trays
export const generateDefaultTrays = (
  targetDevice?: { code: string; type: 'ODC' | 'ODP' } | null,
  clients: PPPoEClient[] = [],
  odps: ODPPoint[] = []
): FiberTrayData[] => {
  const deviceCode = targetDevice?.code || 'ODC-01';
  const isOdc = targetDevice?.type !== 'ODP';

  return [
    {
      id: 'TRAY-01',
      trayNumber: 1,
      name: isOdc ? 'Tray 1: Inbound Feeder 24C' : 'Tray 1: Drop & Distribution',
      description: isOdc
        ? 'Kabel Feeder 24 Core (POP Pusat -> ODC) disambung ke Splitter 1:4'
        : 'Kabel Distribusi 12 Core disambung ke Adaptor Splitter ODP',
      slots: Array.from({ length: 12 }).map((_, idx) => {
        const color = TIA_598_STANDARDS[idx % 12];
        const slotNum = idx + 1;
        const assignedClient = clients[idx % clients.length];
        const assignedOdp = odps[idx % odps.length];

        let status: 'ACTIVE' | 'STANDBY' | 'LOSS_ALERT' | 'EMPTY' = 'ACTIVE';
        let loss = 0.02;
        let rx = -19.2;

        if (slotNum === 5 || slotNum === 6) {
          status = 'STANDBY';
          loss = 0.03;
          rx = -20.5;
        } else if (slotNum === 7) {
          status = 'LOSS_ALERT';
          loss = 0.12;
          rx = -26.8;
        } else if (slotNum >= 8) {
          status = idx % 2 === 0 ? 'EMPTY' : 'STANDBY';
          loss = 0.0;
          rx = 0.0;
        }

        return {
          slotNumber: slotNum,
          coreNumber: color.no,
          coreName: color.name,
          coreHex: color.hex,
          tubeNumber: 1,
          tubeName: 'Biru (Tube 1 Feeder)',
          tubeHex: '#2563eb',
          inboundCable: isOdc
            ? `Kabel Feeder Utama 24 Core (POP Pusat -> ${deviceCode})`
            : `Kabel Distribusi 12 Core (ODC-01 -> ${deviceCode})`,
          status,
          spliceLossDb: loss,
          rxOpticalDbm: rx,
          destination:
            status === 'ACTIVE'
              ? `Splitter 1:4 Port #${slotNum} -> ${assignedOdp?.code || 'ODP-01'} (Port #${slotNum})`
              : status === 'STANDBY'
              ? 'Standby / Cadangan Jalur Ekstensi ODP Baru'
              : status === 'LOSS_ALERT'
              ? 'Jalur Redaman Tinggi - Perlu Resplicing Fiber'
              : 'Port Kosong / Unconnected',
          targetOdpCode: assignedOdp?.code || 'ODP-01',
          clientName: status === 'ACTIVE' ? assignedClient?.fullName : undefined,
          clientPlan: status === 'ACTIVE' ? assignedClient?.profile : undefined,
          clientAddress: status === 'ACTIVE' ? assignedClient?.address : undefined,
          connectorType: slotNum % 2 === 0 ? 'SC/APC' : 'SC/UPC',
          splicedAt: '14 Jan 2025, 10:45 WITA',
          technician: 'Tim Fiber NOC (Agus & Rian)',
          splicerTool: 'Fujikura 90S+ (Cleave: 0.3°, Arc: 1.1s)',
          notes:
            status === 'ACTIVE'
              ? `Koneksi stabil ke pelanggan ${assignedClient?.fullName || 'Wayan'}. Redaman optik sangat baik.`
              : status === 'LOSS_ALERT'
              ? 'Peringatan: Redaman tinggi di titik splice. Jadwal perbaikan teknisi besok pagi.'
              : 'Core cadangan untuk ekspansi cluster perumahan.'
        };
      })
    },
    {
      id: 'TRAY-02',
      trayNumber: 2,
      name: isOdc ? 'Tray 2: Cassette Splitter 1:4 / 1:8' : 'Tray 2: Pigtail Splitter',
      description: 'Pigtail PLC Splitter input & output menuju adaptor patch panel',
      slots: Array.from({ length: 12 }).map((_, idx) => {
        const color = TIA_598_STANDARDS[idx % 12];
        const slotNum = idx + 1;
        const status = slotNum <= 6 ? 'ACTIVE' : 'STANDBY';

        return {
          slotNumber: slotNum,
          coreNumber: color.no,
          coreName: color.name,
          coreHex: color.hex,
          tubeNumber: 2,
          tubeName: 'Oranye (Tube 2 Splitter)',
          tubeHex: '#ea580c',
          inboundCable: `Splitter PLC 1:8 Module A (ODC Cassette)`,
          status,
          spliceLossDb: 0.02,
          rxOpticalDbm: -18.8,
          destination: `Output Splitter Port #${slotNum} -> Feeder Distribusi Barat`,
          connectorType: 'SC/APC',
          splicedAt: '15 Jan 2025, 14:20 WITA',
          technician: 'Putu Wijaya (NOC Splicer)',
          splicerTool: 'Sumitomo T-72C+ (Cleave: 0.4°)',
          notes: 'Modul PLC Splitter Loss Standar ISO/IEC 11801.'
        };
      })
    },
    {
      id: 'TRAY-03',
      trayNumber: 3,
      name: 'Tray 3: Distribusi Outbound ODP',
      description: 'Jalur kabel distribusi 12 core menuju ODP-01 & ODP-02',
      slots: Array.from({ length: 12 }).map((_, idx) => {
        const color = TIA_598_STANDARDS[idx % 12];
        const slotNum = idx + 1;
        return {
          slotNumber: slotNum,
          coreNumber: color.no,
          coreName: color.name,
          coreHex: color.hex,
          tubeNumber: 3,
          tubeName: 'Hijau (Tube 3 Distribusi)',
          tubeHex: '#16a34a',
          inboundCable: 'Kabel Distribusi 12 Core Kuta Raya',
          status: slotNum <= 4 ? 'ACTIVE' : 'STANDBY',
          spliceLossDb: 0.03,
          rxOpticalDbm: -19.5,
          destination: `Jalur Distribusi Tiang Jaringan Ke ODP-${slotNum < 10 ? '0' : ''}${slotNum}`,
          connectorType: 'SC/UPC',
          splicedAt: '18 Jan 2025, 09:10 WITA',
          technician: 'Made Arta (Teknisi Lapangan)',
          splicerTool: 'Fujikura 90S+',
          notes: 'Jalur kabel udara span 45 meter antar tiang.'
        };
      })
    },
    {
      id: 'TRAY-04',
      trayNumber: 4,
      name: 'Tray 4: Spare / Cadangan ODC',
      description: 'Core cadangan untuk redundancy failover dan ekspansi masa depan',
      slots: Array.from({ length: 12 }).map((_, idx) => {
        const color = TIA_598_STANDARDS[idx % 12];
        const slotNum = idx + 1;
        return {
          slotNumber: slotNum,
          coreNumber: color.no,
          coreName: color.name,
          coreHex: color.hex,
          tubeNumber: 4,
          tubeName: 'Coklat (Tube 4 Spare)',
          tubeHex: '#92400e',
          inboundCable: 'Feeder Backup 24 Core',
          status: 'EMPTY',
          spliceLossDb: 0.0,
          rxOpticalDbm: 0.0,
          destination: 'Belum Diterminasi / Dark Fiber Reserve',
          connectorType: 'SC/UPC',
          splicedAt: '-',
          technician: '-',
          splicerTool: '-',
          notes: 'Dark fiber untuk sewa link korporat / failover metro-E.'
        };
      })
    }
  ];
};

export const FiberTrayVisualizerModal: React.FC<FiberTrayVisualizerModalProps> = ({
  isOpen,
  onClose,
  targetDevice,
  odps = [],
  clients = []
}) => {
  // Modal State
  const [activeTrayIndex, setActiveTrayIndex] = useState<number>(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const [laserMode, setLaserMode] = useState<'NORMAL_GPON' | 'VFL_RED' | 'OFF'>('NORMAL_GPON');
  const [isLaserAnimated, setIsLaserAnimated] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Editable Trays State
  const [trays, setTrays] = useState<FiberTrayData[]>(() =>
    generateDefaultTrays(targetDevice, clients, odps)
  );

  // Re-generate if targetDevice changes
  useEffect(() => {
    setTrays(generateDefaultTrays(targetDevice, clients, odps));
    setActiveTrayIndex(0);
    setSelectedSlotIndex(0);
  }, [targetDevice]);

  // Edit Slot State
  const [isEditingSlot, setIsEditingSlot] = useState<boolean>(false);
  const [editSlotInbound, setEditSlotInbound] = useState<string>('');
  const [editSlotCoreNo, setEditSlotCoreNo] = useState<number>(1);
  const [editSlotTubeName, setEditSlotTubeName] = useState<string>('');
  const [editSlotStatus, setEditSlotStatus] = useState<'ACTIVE' | 'STANDBY' | 'LOSS_ALERT' | 'EMPTY'>('ACTIVE');
  const [editSlotLoss, setEditSlotLoss] = useState<number>(0.02);
  const [editSlotRx, setEditSlotRx] = useState<number>(-19.2);
  const [editSlotConnector, setEditSlotConnector] = useState<'SC/UPC' | 'SC/APC'>('SC/UPC');
  const [editSlotDestination, setEditSlotDestination] = useState<string>('');
  const [editSlotClientName, setEditSlotClientName] = useState<string>('');
  const [editSlotClientPlan, setEditSlotClientPlan] = useState<string>('');
  const [editSlotClientAddress, setEditSlotClientAddress] = useState<string>('');
  const [editSlotTech, setEditSlotTech] = useState<string>('');
  const [editSlotTime, setEditSlotTime] = useState<string>('');
  const [editSlotTool, setEditSlotTool] = useState<string>('');
  const [editSlotNotes, setEditSlotNotes] = useState<string>('');

  // Edit Tray State
  const [isEditingTray, setIsEditingTray] = useState<boolean>(false);
  const [editTrayName, setEditTrayName] = useState<string>('');
  const [editTrayDesc, setEditTrayDesc] = useState<string>('');

  const activeTray = trays[activeTrayIndex] || trays[0];
  const selectedSlot = activeTray?.slots[selectedSlotIndex] || activeTray?.slots[0];

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Start Editing Slot
  const handleStartEditSlot = () => {
    if (!selectedSlot) return;
    setEditSlotInbound(selectedSlot.inboundCable);
    setEditSlotCoreNo(selectedSlot.coreNumber);
    setEditSlotTubeName(selectedSlot.tubeName);
    setEditSlotStatus(selectedSlot.status);
    setEditSlotLoss(selectedSlot.spliceLossDb);
    setEditSlotRx(selectedSlot.rxOpticalDbm);
    setEditSlotConnector(selectedSlot.connectorType);
    setEditSlotDestination(selectedSlot.destination);
    setEditSlotClientName(selectedSlot.clientName || '');
    setEditSlotClientPlan(selectedSlot.clientPlan || '');
    setEditSlotClientAddress(selectedSlot.clientAddress || '');
    setEditSlotTech(selectedSlot.technician);
    setEditSlotTime(selectedSlot.splicedAt);
    setEditSlotTool(selectedSlot.splicerTool);
    setEditSlotNotes(selectedSlot.notes);
    setIsEditingSlot(true);
  };

  // Save Slot Edits
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCoreColor = TIA_598_STANDARDS[(editSlotCoreNo - 1) % 12];

    setTrays((prevTrays) =>
      prevTrays.map((tray, tIdx) => {
        if (tIdx !== activeTrayIndex) return tray;
        return {
          ...tray,
          slots: tray.slots.map((slot, sIdx) => {
            if (sIdx !== selectedSlotIndex) return slot;
            return {
              ...slot,
              coreNumber: editSlotCoreNo,
              coreName: selectedCoreColor.name,
              coreHex: selectedCoreColor.hex,
              tubeName: editSlotTubeName,
              inboundCable: editSlotInbound,
              status: editSlotStatus,
              spliceLossDb: Number(editSlotLoss),
              rxOpticalDbm: Number(editSlotRx),
              connectorType: editSlotConnector,
              destination: editSlotDestination,
              clientName: editSlotClientName.trim() ? editSlotClientName : undefined,
              clientPlan: editSlotClientPlan.trim() ? editSlotClientPlan : undefined,
              clientAddress: editSlotClientAddress.trim() ? editSlotClientAddress : undefined,
              technician: editSlotTech,
              splicedAt: editSlotTime,
              splicerTool: editSlotTool,
              notes: editSlotNotes
            };
          })
        };
      })
    );
    setIsEditingSlot(false);
    triggerToast(`Data Slot #${selectedSlot.slotNumber} berhasil diperbarui.`);
  };

  // Start Editing Tray
  const handleStartEditTray = () => {
    setEditTrayName(activeTray.name);
    setEditTrayDesc(activeTray.description);
    setIsEditingTray(true);
  };

  // Save Tray Edits
  const handleSaveTray = (e: React.FormEvent) => {
    e.preventDefault();
    setTrays((prevTrays) =>
      prevTrays.map((tray, tIdx) => {
        if (tIdx !== activeTrayIndex) return tray;
        return {
          ...tray,
          name: editTrayName,
          description: editTrayDesc
        };
      })
    );
    setIsEditingTray(false);
    triggerToast(`Nama Tray #${activeTray.trayNumber} berhasil diperbarui.`);
  };

  // Reset Trays to default
  const handleResetToDefault = () => {
    if (confirm('Kembalikan seluruh data tray dan slot ke pengaturan default?')) {
      setTrays(generateDefaultTrays(targetDevice, clients, odps));
      setSelectedSlotIndex(0);
      setIsEditingSlot(false);
      triggerToast('Data tray berhasil di-reset ke nilai default.');
    }
  };

  // Active laser color
  const laserColor =
    laserMode === 'VFL_RED'
      ? '#ef4444'
      : laserMode === 'NORMAL_GPON'
      ? selectedSlot.coreHex
      : 'transparent';

  // Handle Copy Route Info
  const handleCopyRouteInfo = () => {
    const text = `[FTTH TRAY INSPECTION]
Perangkat: ${targetDevice?.code || 'ODC-01'} - ${targetDevice?.name || 'ODC Sentral'}
Tray: ${activeTray.name} (Slot #${selectedSlot.slotNumber})
Kabel Inbound: ${selectedSlot.inboundCable}
Standar Core: Core #${selectedSlot.coreNumber} ${selectedSlot.coreName} | ${selectedSlot.tubeName}
Splice Loss: ${selectedSlot.spliceLossDb} dB | Optical Power: ${selectedSlot.rxOpticalDbm} dBm
Tujuan: ${selectedSlot.destination}
Teknisi: ${selectedSlot.technician} (${selectedSlot.splicedAt})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="glass-panel fiber-tray-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isFullscreen ? '98vw' : '1190px',
          maxWidth: '98vw',
          height: isFullscreen ? '96vh' : '870px',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          margin: 0,
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(11, 17, 32, 0.99))',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(6, 182, 212, 0.15)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Toast Notification */}
        {notification && (
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10010,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--accent-cyan)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>{notification}</span>
          </div>
        )}

        {/* =========================================================================
            1. HEADER SECTION
            ========================================================================= */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '0.85rem',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(2, 132, 199, 0.3))',
                border: '1px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.25)'
              }}
            >
              <Layers size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Visualizer &amp; Editor Tray Fiber Optik
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}
                >
                  ODC/ODF SPLICE CASSETTE
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Perangkat: <b style={{ color: '#ffffff' }}>{targetDevice?.code || 'ODC-01'}</b> (
                {targetDevice?.name || 'ODC Sentral Kuta'}) &bull; Kapasitas: 4 Tray &bull; 48 Splice Sleeves (Dapat Di-edit)
              </div>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Reset to Default */}
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={handleResetToDefault}
              title="Reset seluruh tray dan slot ke pengaturan default"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>

            {/* Laser Mode Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <button
                type="button"
                className={`tray-laser-pill ${laserMode === 'NORMAL_GPON' ? 'active-cyan' : ''}`}
                onClick={() => setLaserMode('NORMAL_GPON')}
                title="Mode Transmisi Normal (Cahaya Sinyal GPON 1310/1490nm)"
              >
                <Radio size={12} />
                <span>GPON Laser</span>
              </button>
              <button
                type="button"
                className={`tray-laser-pill ${laserMode === 'VFL_RED' ? 'active-red' : ''}`}
                onClick={() => setLaserMode('VFL_RED')}
                title="Mode Visual Fault Locator (Laser Merah 650nm Penelusuran)"
              >
                <Zap size={12} />
                <span>VFL 650nm</span>
              </button>
              <button
                type="button"
                className={`tray-laser-pill ${laserMode === 'OFF' ? 'active-off' : ''}`}
                onClick={() => setLaserMode('OFF')}
                title="Matikan Laser"
              >
                <span>Mati</span>
              </button>
            </div>

            {/* Animation Play / Pause Toggle */}
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
              onClick={() => setIsLaserAnimated((prev) => !prev)}
              title={isLaserAnimated ? 'Jeda Animasi Aliran Cahaya' : 'Putar Animasi Aliran Cahaya'}
            >
              {isLaserAnimated ? <Pause size={14} /> : <Play size={14} />}
              <span>{isLaserAnimated ? 'Jeda' : 'Animasi'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              className="btn-icon"
              onClick={() => setIsFullscreen((prev) => !prev)}
              title={isFullscreen ? 'Perkecil Modal' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button type="button" className="btn-icon" onClick={onClose} title="Tutup Visualizer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. TRAY SELECTOR TABS & EDIT TRAY BUTTON
            ========================================================================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.85rem',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
            {trays.map((tray, idx) => {
              const isActive = activeTrayIndex === idx;
              return (
                <button
                  key={tray.id}
                  type="button"
                  className="tray-tab-pill"
                  style={{
                    background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(2, 132, 199, 0.25))' : 'var(--bg-tertiary)',
                    borderColor: isActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)'
                  }}
                  onClick={() => {
                    setActiveTrayIndex(idx);
                    setSelectedSlotIndex(0);
                    setIsEditingSlot(false);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Box size={14} style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                    <span style={{ fontWeight: isActive ? 800 : 600 }}>{tray.name}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: isActive ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'
                    }}
                  >
                    12 Core
                  </span>
                </button>
              );
            })}
          </div>

          {/* Edit Tray Info Button */}
          <button
            type="button"
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: 'var(--accent-cyan)'
            }}
            onClick={handleStartEditTray}
            title="Edit Nama & Deskripsi Tray yang sedang aktif"
          >
            <Edit3 size={13} />
            <span>Edit Nama Tray</span>
          </button>
        </div>

        {/* =========================================================================
            3. SPLIT 2-CONTAINER WORKSPACE
            ========================================================================= */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '1rem',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {/* -----------------------------------------------------------------------
              LEFT CONTAINER: GAMBAR TRAY, MANDREL & ANIMASI LASER PULSE (SVG)
              ----------------------------------------------------------------------- */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0.85rem',
              margin: 0,
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Tray Header Badge */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)' }}>
                  🗄️ Splice Tray Diagram (Kaset Optik)
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  &bull; Standar TIA-598 Color Mapping &bull; Klik salah satu slot/sleeve untuk inspeksi
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: laserMode === 'OFF' ? '#64748b' : laserColor, boxShadow: laserMode === 'OFF' ? 'none' : `0 0 8px ${laserColor}` }} />
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Laser: {laserMode === 'VFL_RED' ? 'VFL 650nm (Aktif)' : laserMode === 'NORMAL_GPON' ? 'GPON Data Stream' : 'OFF'}
                </span>
              </div>
            </div>

            {/* SVG Visualizer Container */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.7) 0%, rgba(9, 13, 22, 0.98) 100%)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <svg
                viewBox="0 0 620 440"
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '520px',
                  userSelect: 'none'
                }}
              >
                {/* SVG Definitions for Gradients, Glow Filters, and Animations */}
                <defs>
                  {/* Laser Glow Filter */}
                  <filter id="laser-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Tray Texture Gradient */}
                  <linearGradient id="trayChassis" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#141c2e" />
                    <stop offset="50%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#0b1120" />
                  </linearGradient>

                  <linearGradient id="sleeveMetallic" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="50%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* 1. Outer Polycarbonate Splice Tray Frame */}
                <rect
                  x="15"
                  y="15"
                  width="590"
                  height="410"
                  rx="16"
                  fill="url(#trayChassis)"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                />

                {/* Corner Snaps / Mounting Clips */}
                <rect x="22" y="22" width="16" height="16" rx="4" fill="#334155" />
                <rect x="582" y="22" width="16" height="16" rx="4" fill="#334155" />
                <rect x="22" y="402" width="16" height="16" rx="4" fill="#334155" />
                <rect x="582" y="402" width="16" height="16" rx="4" fill="#334155" />

                {/* 2. Cable Ingress & Egress Clamps */}
                {/* Left Feeder Cable Clamp */}
                <g transform="translate(6, 185)">
                  <rect x="0" y="0" width="28" height="70" rx="6" fill="#1e293b" stroke="#334155" />
                  <rect x="4" y="8" width="20" height="54" rx="4" fill="#0f172a" />
                  <line x1="0" y1="25" x2="28" y2="25" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
                  <line x1="0" y1="45" x2="28" y2="45" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
                  <text x="14" y="66" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="800">
                    IN
                  </text>
                </g>

                {/* Right Distribution / Adapter Out Clamp */}
                <g transform="translate(586, 185)">
                  <rect x="0" y="0" width="28" height="70" rx="6" fill="#1e293b" stroke="#334155" />
                  <rect x="4" y="8" width="20" height="54" rx="4" fill="#0f172a" />
                  <line x1="0" y1="35" x2="28" y2="35" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                  <text x="14" y="66" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="800">
                    OUT
                  </text>
                </g>

                {/* 3. Circular Fiber Routing Mandrels (Bending Radius Protection) */}
                {/* Upper Left Mandrel */}
                <g transform="translate(130, 115)">
                  <circle cx="0" cy="0" r="48" fill="none" stroke="#182234" strokeWidth="16" />
                  <circle cx="0" cy="0" r="48" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="6 4" />
                  <circle cx="0" cy="0" r="38" fill="#0f172a" stroke="#1e293b" />
                  <text x="0" y="3" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="700">
                    R ≥ 30mm
                  </text>
                </g>

                {/* Lower Left Mandrel */}
                <g transform="translate(130, 325)">
                  <circle cx="0" cy="0" r="48" fill="none" stroke="#182234" strokeWidth="16" />
                  <circle cx="0" cy="0" r="48" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="6 4" />
                  <circle cx="0" cy="0" r="38" fill="#0f172a" stroke="#1e293b" />
                  <text x="0" y="3" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="700">
                    R ≥ 30mm
                  </text>
                </g>

                {/* Right Slack Routing Mandrel */}
                <g transform="translate(485, 220)">
                  <circle cx="0" cy="0" r="58" fill="none" stroke="#182234" strokeWidth="18" />
                  <circle cx="0" cy="0" r="58" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="8 4" />
                  <circle cx="0" cy="0" r="46" fill="#0f172a" stroke="#1e293b" />
                  <text x="0" y="-4" textAnchor="middle" fill="#475569" fontSize="8" fontWeight="700">
                    SLACK
                  </text>
                  <text x="0" y="8" textAnchor="middle" fill="#334155" fontSize="7">
                    BUFFER
                  </text>
                </g>

                {/* 4. Central Fusion Splice Organizer Comb (12 Slots) */}
                <rect
                  x="215"
                  y="45"
                  width="180"
                  height="350"
                  rx="12"
                  fill="#0b1120"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                {/* Comb Header */}
                <rect x="215" y="45" width="180" height="26" rx="10" fill="#141d30" />
                <text x="305" y="62" textAnchor="middle" fill="var(--accent-cyan)" fontSize="9" fontWeight="800" letterSpacing="0.05em">
                  SPLICE ORGANIZER (12 CORE)
                </text>

                {/* 5. Render 12 Fiber Paths & Protection Sleeves */}
                {activeTray.slots.map((slot, idx) => {
                  const y = 82 + idx * 25.5;
                  const isSelected = selectedSlotIndex === idx;
                  const isHovered = hoveredSlotIndex === idx;
                  const isTarget = isSelected || isHovered;

                  const upperCurve = idx < 6;
                  const mandrelY = upperCurve ? 90 + idx * 6 : 350 - (idx - 6) * 6;
                  const inPath = `M 34,${200 + (idx % 4) * 8} C 70,${200 + (idx % 4) * 8} 80,${mandrelY} 130,${mandrelY} C 175,${mandrelY} 200,${y + 7} 240,${y + 7}`;
                  const outPath = `M 370,${y + 7} C 415,${y + 7} 440,${220 + (idx - 6) * 14} 485,${220 + (idx - 6) * 14} C 530,${220 + (idx - 6) * 14} 545,${y + 7} 565,${y + 7}`;

                  return (
                    <g
                      key={slot.slotNumber}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedSlotIndex(idx);
                        setIsEditingSlot(false);
                      }}
                      onMouseEnter={() => setHoveredSlotIndex(idx)}
                      onMouseLeave={() => setHoveredSlotIndex(null)}
                    >
                      {/* INBOUND FIBER STRAND */}
                      <path
                        d={inPath}
                        fill="none"
                        stroke={slot.coreHex}
                        strokeWidth={isTarget ? 3.5 : 1.6}
                        opacity={isTarget ? 1 : 0.65}
                      />

                      {/* OUTBOUND FIBER STRAND */}
                      <path
                        d={outPath}
                        fill="none"
                        stroke={slot.coreHex}
                        strokeWidth={isTarget ? 3.5 : 1.6}
                        opacity={isTarget ? 1 : 0.65}
                      />

                      {/* LASER FLOW ANIMATION */}
                      {laserMode !== 'OFF' && (isTarget || (slot.status === 'ACTIVE' && isLaserAnimated)) && (
                        <>
                          <path
                            d={inPath}
                            fill="none"
                            stroke={laserColor}
                            strokeWidth={isTarget ? 4 : 2.5}
                            strokeDasharray="8 6"
                            className={isLaserAnimated ? 'fiber-laser-flow' : ''}
                            filter="url(#laser-glow)"
                          />
                          <path
                            d={outPath}
                            fill="none"
                            stroke={laserColor}
                            strokeWidth={isTarget ? 4 : 2.5}
                            strokeDasharray="8 6"
                            className={isLaserAnimated ? 'fiber-laser-flow' : ''}
                            filter="url(#laser-glow)"
                          />
                        </>
                      )}

                      {/* SLEEVE ORGANIZER ROW BACKGROUND */}
                      {isTarget && (
                        <rect
                          x="220"
                          y={y - 2}
                          width="170"
                          height="20"
                          rx="6"
                          fill="rgba(6, 182, 212, 0.15)"
                          stroke="var(--accent-cyan)"
                          strokeWidth="1"
                        />
                      )}

                      {/* CORE NUMBER BADGE */}
                      <rect x="223" y={y} width="16" height="15" rx="3" fill="#1e293b" />
                      <text x="231" y={y + 11} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="800">
                        {slot.slotNumber}
                      </text>

                      {/* HEAT SHRINK SPLICE SLEEVE BODY */}
                      <rect
                        x="244"
                        y={y}
                        width="122"
                        height="15"
                        rx="7.5"
                        fill="url(#sleeveMetallic)"
                        stroke={isTarget ? slot.coreHex : '#334155'}
                        strokeWidth={isTarget ? 2 : 1}
                      />

                      {/* Left & Right Sleeve Color Rings */}
                      <rect x="246" y={y + 1} width="6" height="13" rx="2" fill={slot.coreHex} />
                      <rect x="358" y={y + 1} width="6" height="13" rx="2" fill={slot.coreHex} />

                      {/* Center Spliced Core Pin Wire */}
                      <line
                        x1="256"
                        y1={y + 7.5}
                        x2="354"
                        y2={y + 7.5}
                        stroke={isTarget ? laserColor : '#94a3b8'}
                        strokeWidth={isTarget ? 2.5 : 1.5}
                        strokeLinecap="round"
                      />

                      {/* Fusion Joint Spark Center Dot */}
                      <circle
                        cx="305"
                        cy={y + 7.5}
                        r={isTarget ? 3.5 : 2}
                        fill={isTarget ? '#ffffff' : slot.coreHex}
                        filter={isTarget ? 'url(#laser-glow)' : 'none'}
                      />

                      {/* STATUS LED INDICATOR */}
                      <circle
                        cx="378"
                        cy={y + 7.5}
                        r="3.5"
                        fill={
                          slot.status === 'ACTIVE'
                            ? '#10b981'
                            : slot.status === 'LOSS_ALERT'
                            ? '#ef4444'
                            : slot.status === 'STANDBY'
                            ? '#f59e0b'
                            : '#64748b'
                        }
                        filter={slot.status === 'ACTIVE' ? 'url(#laser-glow)' : 'none'}
                      />

                      {/* RIGHT SC/UPC OR SC/APC TERMINATION ADAPTER SOCKET */}
                      <g transform={`translate(565, ${y})`}>
                        <rect
                          x="0"
                          y="0"
                          width="16"
                          height="15"
                          rx="3"
                          fill={slot.connectorType === 'SC/APC' ? '#15803d' : '#1d4ed8'}
                          stroke="#ffffff"
                          strokeWidth="0.8"
                        />
                        <rect x="4" y="4" width="8" height="7" rx="1" fill="#0f172a" />
                        <circle
                          cx="8"
                          cy="7.5"
                          r="2"
                          fill={isTarget && laserMode !== 'OFF' ? laserColor : '#ffffff'}
                          filter={isTarget && laserMode !== 'OFF' ? 'url(#laser-glow)' : 'none'}
                        />
                      </g>
                    </g>
                  );
                })}

                {/* Visual Legend / Summary Footer on SVG */}
                <g transform="translate(30, 415)">
                  <text x="0" y="0" fill="#64748b" fontSize="8" fontWeight="600">
                    🟢 Active Spliced &bull; 🟡 Standby &bull; 🔴 Loss Alert &bull; 🔵 SC/UPC &bull; 🟢 SC/APC
                  </text>
                </g>
              </svg>
            </div>

            {/* Bottom Controls Bar for Left Container */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.6rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>
                  Slot Terpilih:{' '}
                  <b style={{ color: 'var(--accent-cyan)' }}>
                    #{selectedSlot?.slotNumber} ({selectedSlot?.coreName})
                  </b>
                </span>
                <span>&bull;</span>
                <span>
                  Splice Loss:{' '}
                  <b style={{ color: (selectedSlot?.spliceLossDb || 0) > 0.08 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    {selectedSlot?.spliceLossDb} dB
                  </b>
                </span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                onClick={() => setLaserMode((prev) => (prev === 'VFL_RED' ? 'NORMAL_GPON' : 'VFL_RED'))}
              >
                <Zap size={12} style={{ color: laserMode === 'VFL_RED' ? '#ef4444' : 'var(--accent-cyan)' }} />
                <span>{laserMode === 'VFL_RED' ? 'Matikan VFL Merah' : 'Tes Laser VFL Merah (650nm)'}</span>
              </button>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT CONTAINER: KETERANGAN DETAIL / MODE EDIT SLOT LENGKAP
              ----------------------------------------------------------------------- */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem',
              margin: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              overflowY: 'auto'
            }}
          >
            {isEditingSlot ? (
              /* ===================================================================
                 FORM EDIT SLOT / CORE INTERAKTIF
                 =================================================================== */
              <form onSubmit={handleSaveSlot} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      FORM EDIT DATA SLOT &amp; CORE
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0', color: '#ffffff' }}>
                      Edit Slot #{selectedSlot.slotNumber} (Tray {activeTray.trayNumber})
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setIsEditingSlot(false)}
                    title="Batal Edit"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  {/* 1. Kabel & Warna Core */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      1. SPESIFIKASI KABEL &amp; CORE TIA-598:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Warna Core Fiber (1-12):</label>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotCoreNo}
                          onChange={(e) => setEditSlotCoreNo(Number(e.target.value))}
                        >
                          {TIA_598_STANDARDS.map((c) => (
                            <option key={c.no} value={c.no}>
                              #{c.no} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Warna &amp; No. Tube:</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotTubeName}
                          onChange={(e) => setEditSlotTubeName(e.target.value)}
                          placeholder="Contoh: Biru (Tube 1 Feeder)"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Nama Kabel Asal (Inbound Cable):</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                        value={editSlotInbound}
                        onChange={(e) => setEditSlotInbound(e.target.value)}
                        placeholder="Contoh: Kabel Feeder Utama 24 Core (POP Pusat -> ODC Kuta)"
                        required
                      />
                    </div>
                  </div>

                  {/* 2. Status & Parameter Optik */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      2. PARAMETER OPTIK &amp; STATUS KONEKSI:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Status Core:</label>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotStatus}
                          onChange={(e) => setEditSlotStatus(e.target.value as any)}
                        >
                          <option value="ACTIVE">🟢 ACTIVE (Terhubung)</option>
                          <option value="STANDBY">🟡 STANDBY (Siap Pakai)</option>
                          <option value="LOSS_ALERT">🔴 LOSS ALERT (Redaman Tinggi)</option>
                          <option value="EMPTY">⚪ EMPTY (Belum Disambung)</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Konektor Adaptor:</label>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotConnector}
                          onChange={(e) => setEditSlotConnector(e.target.value as any)}
                        >
                          <option value="SC/UPC">SC/UPC (Biru)</option>
                          <option value="SC/APC">SC/APC (Hijau)</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Splice Loss (dB):</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotLoss}
                          onChange={(e) => setEditSlotLoss(Number(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Daya Optik / Rx (dBm):</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotRx}
                          onChange={(e) => setEditSlotRx(Number(e.target.value))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Tujuan Terminasi & Pelanggan */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      3. TUJUAN TERMINASI &amp; PELANGGAN:
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Tujuan Rute (Destination):</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                        value={editSlotDestination}
                        onChange={(e) => setEditSlotDestination(e.target.value)}
                        placeholder="Contoh: Splitter 1:4 Port 1 -> ODP-01 -> Made Wijaya"
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Nama Pelanggan (Opsional):</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotClientName}
                          onChange={(e) => setEditSlotClientName(e.target.value)}
                          placeholder="Contoh: Made Wijaya"
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Paket Langganan:</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotClientPlan}
                          onChange={(e) => setEditSlotClientPlan(e.target.value)}
                          placeholder="Contoh: 50 Mbps Home Ultra"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Alamat Pelanggan:</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                        value={editSlotClientAddress}
                        onChange={(e) => setEditSlotClientAddress(e.target.value)}
                        placeholder="Contoh: Jl. Bakung Sari No. 12, Kuta"
                      />
                    </div>
                  </div>

                  {/* 4. Splicing Log & Catatan */}
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      4. LOG SPLICING &amp; CATATAN TEKNISI:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Nama Teknisi Splicer:</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotTech}
                          onChange={(e) => setEditSlotTech(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Mesin Splicer:</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                          value={editSlotTool}
                          onChange={(e) => setEditSlotTool(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.7rem' }}>Catatan Khusus Teknisi:</label>
                      <textarea
                        className="form-input"
                        style={{ fontSize: '0.75rem', minHeight: '50px', resize: 'vertical' }}
                        value={editSlotNotes}
                        onChange={(e) => setEditSlotNotes(e.target.value)}
                        placeholder="Tuliskan catatan teknis slot ini..."
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    paddingTop: '0.75rem',
                    marginTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setIsEditingSlot(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                    <Check size={14} />
                    <span>Simpan Perubahan Slot #{selectedSlot.slotNumber}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* ===================================================================
                 TAMPILAN INSPEKSI READ-ONLY + TOMBOL EDIT SLOT
                 =================================================================== */
              <>
                {/* Header: Selected Slot Title, Status & Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: `${selectedSlot.coreHex}25`,
                          color: selectedSlot.coreHex,
                          border: `1px solid ${selectedSlot.coreHex}60`
                        }}
                      >
                        TRAY {activeTray.trayNumber} &bull; SLOT #{selectedSlot.slotNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background:
                            selectedSlot.status === 'ACTIVE'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : selectedSlot.status === 'LOSS_ALERT'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : selectedSlot.status === 'STANDBY'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(255, 255, 255, 0.08)',
                          color:
                            selectedSlot.status === 'ACTIVE'
                              ? 'var(--accent-emerald)'
                              : selectedSlot.status === 'LOSS_ALERT'
                              ? 'var(--accent-rose)'
                              : selectedSlot.status === 'STANDBY'
                              ? 'var(--accent-amber)'
                              : 'var(--text-muted)'
                        }}
                      >
                        {selectedSlot.status === 'ACTIVE'
                          ? '🟢 Sinyal Terhubung'
                          : selectedSlot.status === 'LOSS_ALERT'
                          ? '🔴 Redaman Tinggi'
                          : selectedSlot.status === 'STANDBY'
                          ? '🟡 Standby / Siap Pakai'
                          : '⚪ Belum Disambung'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      Core #{selectedSlot.coreNumber} {selectedSlot.coreName}
                    </h3>
                  </div>

                  {/* Actions: Edit Slot Button & Copy Button */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '5px 9px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={handleStartEditSlot}
                      title="Edit Data Slot & Core Ini"
                    >
                      <Edit3 size={13} />
                      <span>Edit Slot</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '5px 9px', fontSize: '0.72rem' }}
                      onClick={handleCopyRouteInfo}
                      title="Salin Data Sambungan Slot Ini"
                    >
                      {copied ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                      <span>{copied ? 'Tersalin' : 'Salin Data'}</span>
                    </button>
                  </div>
                </div>

                {/* Core & Tube Color Identity Visual Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.85rem',
                    border: `1px solid ${selectedSlot.coreHex}40`
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: selectedSlot.coreHex,
                      boxShadow: `0 0 12px ${selectedSlot.coreHex}60`,
                      border: '2px solid #ffffff'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Identifikasi Standar TIA-598-C:</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                      Tube: <span style={{ color: selectedSlot.tubeHex }}>{selectedSlot.tubeName}</span> &bull; Core:{' '}
                      <span style={{ color: selectedSlot.coreHex }}>#{selectedSlot.coreNumber} {selectedSlot.coreName}</span>
                    </div>
                  </div>
                </div>

                {/* 4 Technical Metric Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.6rem',
                    marginBottom: '0.85rem'
                  }}
                >
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Redaman Sambung (Loss)</span>
                    <span
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: selectedSlot.spliceLossDb > 0.08 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                      }}
                    >
                      {selectedSlot.spliceLossDb.toFixed(2)} dB
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {selectedSlot.spliceLossDb <= 0.05 ? 'Optimal (Sangat Bagus)' : 'Perlu Re-splicing'}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Daya Optik (Rx Power)</span>
                    <span
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: selectedSlot.rxOpticalDbm < -24 ? 'var(--accent-rose)' : 'var(--accent-cyan)'
                      }}
                    >
                      {selectedSlot.rxOpticalDbm !== 0 ? `${selectedSlot.rxOpticalDbm.toFixed(1)} dBm` : '-'}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {selectedSlot.rxOpticalDbm !== 0 ? 'Rentang Normal: -15 s/d -24 dBm' : 'Dark Fiber'}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Konektor Adaptor</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: selectedSlot.connectorType === 'SC/APC' ? 'var(--accent-emerald)' : 'var(--accent-blue)' }}>
                      {selectedSlot.connectorType}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {selectedSlot.connectorType === 'SC/APC' ? 'Hijau (Angled 8°)' : 'Biru (Ultra Physical Contact)'}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Kabel Asal (Ingress)</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedSlot.inboundCable}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      G.652.D Single-Mode
                    </span>
                  </div>
                </div>

                {/* End-to-End Patching Breadcrumb Diagram */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    SKEMA ALUR KABEL (END-TO-END PATCHING):
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      overflowX: 'auto',
                      fontSize: '0.72rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(6,182,212,0.15)', padding: '3px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      <Building size={12} style={{ color: 'var(--accent-cyan)' }} />
                      <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>POP Sentral</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>➔</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(255,255,255,0.06)', padding: '3px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      <span>Feeder (Core #{selectedSlot.coreNumber})</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>➔</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(59,130,246,0.15)', padding: '3px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>Tray {activeTray.trayNumber} (Slot #{selectedSlot.slotNumber})</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>➔</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(16,185,129,0.15)', padding: '3px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{selectedSlot.targetOdpCode || 'ODP'}</span>
                    </div>
                  </div>
                </div>

                {/* Target Destination & Connected Customer (If Any) */}
                {selectedSlot.clientName ? (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      marginBottom: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                        👤 Pelanggan Terhubung Aktif:
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                        ONLINE
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                      {selectedSlot.clientName}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Paket: <b style={{ color: 'var(--accent-cyan)' }}>{selectedSlot.clientPlan}</b> &bull; Alamat: {selectedSlot.clientAddress}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.85rem',
                      marginBottom: '0.85rem'
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Tujuan Terminasi / Target Rute:</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'block', marginTop: '2px' }}>
                      {selectedSlot.destination}
                    </span>
                  </div>
                )}

                {/* Splicing Logs & Technician Info */}
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.7rem 0.85rem',
                    marginBottom: '0.85rem',
                    fontSize: '0.74rem'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    RIWAYAT PENYAMBUNGAN (SPLICING LOGS):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                    <div>&bull; Waktu: <b style={{ color: '#ffffff' }}>{selectedSlot.splicedAt}</b></div>
                    <div>&bull; Teknisi: <b style={{ color: '#ffffff' }}>{selectedSlot.technician}</b></div>
                    <div style={{ gridColumn: 'span 2' }}>&bull; Mesin Splicer: <b style={{ color: '#ffffff' }}>{selectedSlot.splicerTool}</b></div>
                  </div>
                </div>

                {/* Notes Section */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      CATATAN TEKNISI NOC:
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      onClick={handleStartEditSlot}
                    >
                      <Edit3 size={12} />
                      <span>Ubah</span>
                    </button>
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      fontStyle: 'italic'
                    }}
                  >
                    "{selectedSlot.notes}"
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* =========================================================================
            MODAL POPUP: EDIT TRAY INFO (NAMA & DESKRIPSI TRAY)
            ========================================================================= */}
        {isEditingTray && (
          <div className="modal-overlay" onClick={() => setIsEditingTray(false)} style={{ zIndex: 10020 }}>
            <div
              className="glass-panel"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '460px',
                maxWidth: '92vw',
                padding: '1.25rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--accent-cyan)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  ✏️ Edit Nama &amp; Identitas Tray #{activeTray.trayNumber}
                </h3>
                <button type="button" className="btn-icon" onClick={() => setIsEditingTray(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveTray}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Nama Kaset Tray:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTrayName}
                    onChange={(e) => setEditTrayName(e.target.value)}
                    required
                    placeholder="Contoh: Tray 1: Inbound Feeder 24C"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Deskripsi / Peruntukan Tray:</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '65px', resize: 'vertical' }}
                    value={editTrayDesc}
                    onChange={(e) => setEditTrayDesc(e.target.value)}
                    placeholder="Contoh: Kabel Feeder 24 Core dari POP Pusat disambung ke Splitter 1:4"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditingTray(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn-primary">
                    <Check size={14} />
                    <span>Simpan Perubahan Tray</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
