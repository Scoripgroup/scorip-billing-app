import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  Activity,
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
  Play,
  Pause,
  Layers,
  Server,
  Terminal,
  Cpu,
  Wifi,
  Thermometer,
  ShieldAlert,
  Flame,
  Search,
  ChevronRight,
  Eye,
  Sliders
} from 'lucide-react';
import { OLTDevice, ODCPoint, ODPPoint, PPPoEClient, CableRoute } from '../types';

export interface ZtePonPortData {
  portNumber: number; // 1 to 16
  portName: string; // e.g. gpon-olt_1/2/1
  slotNumber: number; // e.g. 2, 3, 4
  sfpModel: string; // e.g. ZTE SFP-GPON-OLT Class C++
  status: 'UP' | 'STANDBY' | 'LOS_ALARM' | 'EMPTY';
  txPowerDbm: number; // e.g. +4.85 dBm
  rxPowerDbm: number; // e.g. -19.4 dBm
  wavelength: string; // Tx 1490nm / Rx 1310nm
  temperature: number; // e.g. 41.5 °C
  biasCurrentMa: number; // e.g. 14.8 mA
  voltage: number; // e.g. 3.31 V
  totalOnu: number; // e.g. 48
  maxOnuCapacity: number; // 64 or 128
  connectedFeeder: string; // e.g. Feeder 24C POP -> ODC Kuta
  targetOdcCode: string; // e.g. ODC-01
  downloadThroughputMbps: number; // e.g. 1850 Mbps
  uploadThroughputMbps: number; // e.g. 420 Mbps
  splicedNotes: string;
}

export type ZteCardType = 'GTGH' | 'GTGO' | 'SCXN' | 'HUVQ' | 'CICG' | 'PRWG' | 'BLANK';

export interface ZteSlotData {
  slotNumber: number; // 1 to 21
  cardType: ZteCardType;
  cardName: string;
  description: string;
  isMaster?: boolean;
  status: 'INSERVICE' | 'STANDBY' | 'EMPTY' | 'FAULT';
  ports: ZtePonPortData[];
}

interface ZteC300VisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  olt?: OLTDevice | null;
  odcs?: ODCPoint[];
  odps?: ODPPoint[];
  clients?: PPPoEClient[];
  cables?: CableRoute[];
  onOpenGisWithOdc?: (odcCode: string) => void;
}

// Generate the 21 vertical slots of the standard 19-inch ZTE ZXA10 C300 chassis
export const generateZteC300Slots = (
  odcs: ODCPoint[] = [],
  clients: PPPoEClient[] = []
): ZteSlotData[] => {
  const slots: ZteSlotData[] = [];

  for (let s = 1; s <= 21; s++) {
    if (s === 2 || s === 3 || s === 4) {
      // Service Line Cards: GTGH (16-Port GPON)
      const isSlot2 = s === 2;
      const isSlot3 = s === 3;
      const slotPorts: ZtePonPortData[] = Array.from({ length: 16 }).map((_, idx) => {
        const portNum = idx + 1;
        const targetOdc = odcs[(idx + (s - 2) * 4) % Math.max(odcs.length, 1)];
        let status: 'UP' | 'STANDBY' | 'LOS_ALARM' | 'EMPTY' = 'UP';
        let onuCount = Math.floor(36 + ((portNum * 7 + s * 3) % 24));

        if (isSlot2 && (portNum === 13 || portNum === 14)) {
          status = 'STANDBY';
          onuCount = 0;
        } else if (isSlot2 && portNum === 15) {
          status = 'LOS_ALARM';
          onuCount = 42;
        } else if (isSlot2 && portNum === 16) {
          status = 'EMPTY';
          onuCount = 0;
        } else if (isSlot3 && portNum > 10) {
          status = portNum === 11 ? 'STANDBY' : 'EMPTY';
          onuCount = 0;
        } else if (s === 4 && portNum > 6) {
          status = 'EMPTY';
          onuCount = 0;
        }

        return {
          portNumber: portNum,
          portName: `gpon-olt_1/${s}/${portNum}`,
          slotNumber: s,
          sfpModel: 'ZTE SFP-GPON-OLT Class C++',
          status,
          txPowerDbm: +(4.3 + (portNum % 4) * 0.2).toFixed(2),
          rxPowerDbm: -19.5,
          wavelength: 'Tx 1490nm / Rx 1310nm',
          temperature: +(40.2 + (portNum % 3) * 0.7).toFixed(1),
          biasCurrentMa: +(14.5 + (portNum % 4) * 0.3).toFixed(1),
          voltage: 3.31,
          totalOnu: onuCount,
          maxOnuCapacity: 64,
          connectedFeeder: `Kabel Feeder 24C (POP Pusat -> ${targetOdc?.code || 'ODC-01'})`,
          targetOdcCode: targetOdc?.code || 'ODC-01',
          downloadThroughputMbps: status === 'UP' ? 1150 + portNum * 40 : 0,
          uploadThroughputMbps: status === 'UP' ? 310 + portNum * 12 : 0,
          splicedNotes:
            status === 'UP'
              ? `Jalur distribusi aktif ke cluster ${targetOdc?.coverageArea || 'Utama'}. Redaman optik rata-rata -19.5 dBm.`
              : status === 'LOS_ALARM'
              ? 'Warning: Terdeteksi degradasi optical power pada drop core 4. Periksa patchcord ODF.'
              : 'Port cadangan untuk ekspansi cluster baru.'
        };
      });

      slots.push({
        slotNumber: s,
        cardType: 'GTGH',
        cardName: `Slot ${s}: GTGH (16-Port GPON)`,
        description: `Kartu Layanan GPON 16 Port Class C++ - Slot ${s}`,
        status: 'INSERVICE',
        ports: slotPorts
      });
    } else if (s === 9) {
      // Main Control & Switch Card Master (SCXN)
      slots.push({
        slotNumber: s,
        cardType: 'SCXN',
        cardName: 'Slot 9: SCXN (Master Control & Switch)',
        description: 'Papan Kendali & Switching Utama ZTE C300 dengan 4x 10GE Uplink SFP+',
        isMaster: true,
        status: 'INSERVICE',
        ports: []
      });
    } else if (s === 10) {
      // Main Control & Switch Card Standby (SCXN)
      slots.push({
        slotNumber: s,
        cardType: 'SCXN',
        cardName: 'Slot 10: SCXN (Standby Control & Switch)',
        description: 'Papan Kendali Redundan Siaga 1+1 Protection ZTE C300',
        isMaster: false,
        status: 'STANDBY',
        ports: []
      });
    } else if (s === 19) {
      // Uplink Card (HUVQ)
      slots.push({
        slotNumber: s,
        cardType: 'HUVQ',
        cardName: 'Slot 19: HUVQ (4x 10GE Uplink)',
        description: 'Papan Antarmuka Uplink 4 Port 10GE SFP+ menuju Switch Distribusi / Core Router',
        status: 'INSERVICE',
        ports: []
      });
    } else if (s === 21) {
      // Environment & Clock Card (CICG)
      slots.push({
        slotNumber: s,
        cardType: 'CICG',
        cardName: 'Slot 21: CICG (Environment & Clock)',
        description: 'Papan Antarmuka Sensor Lingkungan Rak, Jam BITS, & Alarm Eksternal',
        status: 'INSERVICE',
        ports: []
      });
    } else {
      // Filler Blank Plate / Empty Service Slot
      slots.push({
        slotNumber: s,
        cardType: 'BLANK',
        cardName: `Slot ${s}: Panel Penutup (Blank Plate)`,
        description: `Slot cadangan ekspansi kartu GTGH / GTGO / GFGH - Slot ${s}`,
        status: 'EMPTY',
        ports: []
      });
    }
  }

  return slots;
};

export const ZteC300VisualizerModal: React.FC<ZteC300VisualizerModalProps> = ({
  isOpen,
  onClose,
  olt,
  odcs = [],
  odps = [],
  clients = [],
  onOpenGisWithOdc
}) => {
  // View mode: 'CHASSIS_OVERVIEW' (Whole 21-slot 10U rack) or 'GTGH_BLADE_ZOOM' (Zoomed vertical GTGH blade)
  const [viewMode, setViewMode] = useState<'CHASSIS_OVERVIEW' | 'GTGH_BLADE_ZOOM'>('CHASSIS_OVERVIEW');

  // Slots State (21 vertical slots)
  const [slots, setSlots] = useState<ZteSlotData[]>(() => generateZteC300Slots(odcs, clients));

  // Selected Slot (Default to Slot 2 which is GTGH)
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number>(2);
  const [selectedPortIndex, setSelectedPortIndex] = useState<number>(0);
  const [hoveredPortIndex, setHoveredPortIndex] = useState<number | null>(null);
  const [hoveredSlotNumber, setHoveredSlotNumber] = useState<number | null>(null);

  // Laser Controls
  const [laserMode, setLaserMode] = useState<'GPON_DATA' | 'VFL_RED' | 'OFF'>('GPON_DATA');
  const [isLaserAnimated, setIsLaserAnimated] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeCliTab, setActiveCliTab] = useState<'SHOW_CARD' | 'SHOW_ONU_STATE' | 'SHOW_OPTICAL' | 'RUNNING_CFG'>('SHOW_ONU_STATE');
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    targetType: 'PORT' | 'SLOT';
    slotNumber: number;
    portIndex?: number;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    targetType: 'PORT',
    slotNumber: 2,
    portIndex: 0
  });

  // Edit Port Form State
  const [isEditingPort, setIsEditingPort] = useState<boolean>(false);
  const [editPortName, setEditPortName] = useState<string>('');
  const [editSfpModel, setEditSfpModel] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'UP' | 'STANDBY' | 'LOS_ALARM' | 'EMPTY'>('UP');
  const [editTxPower, setEditTxPower] = useState<number>(4.85);
  const [editTemp, setEditTemp] = useState<number>(41.5);
  const [editFeeder, setEditFeeder] = useState<string>('');
  const [editTargetOdc, setEditTargetOdc] = useState<string>('');
  const [editMaxOnu, setEditMaxOnu] = useState<number>(64);
  const [editNotes, setEditNotes] = useState<string>('');

  const currentSlot = slots.find((s) => s.slotNumber === selectedSlotNumber) || slots[1];
  const isGtghCard = currentSlot.cardType === 'GTGH';
  const currentPorts = currentSlot.ports || [];
  const selectedPort = currentPorts[selectedPortIndex] || currentPorts[0];

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Open Context Menu on Port Right-Click
  const handlePortContextMenu = (
    e: React.MouseEvent,
    slotNum: number,
    portIdx: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedSlotNumber(slotNum);
    setSelectedPortIndex(portIdx);

    const modalEl = document.querySelector('.zte-c300-modal') as HTMLElement;
    const rect = modalEl?.getBoundingClientRect();
    const rawX = e.clientX - (rect?.left || 0);
    const rawY = e.clientY - (rect?.top || 0);

    const menuWidth = 230;
    const menuHeight = 310;
    const maxX = (rect?.width || 1200) - menuWidth - 15;
    const maxY = (rect?.height || 850) - menuHeight - 15;

    setContextMenu({
      isOpen: true,
      x: Math.max(10, Math.min(rawX, maxX)),
      y: Math.max(10, Math.min(rawY, maxY)),
      targetType: 'PORT',
      slotNumber: slotNum,
      portIndex: portIdx
    });
  };

  // Open Context Menu on Slot Right-Click
  const handleSlotContextMenu = (
    e: React.MouseEvent,
    slotNum: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedSlotNumber(slotNum);
    setSelectedPortIndex(0);

    const modalEl = document.querySelector('.zte-c300-modal') as HTMLElement;
    const rect = modalEl?.getBoundingClientRect();
    const rawX = e.clientX - (rect?.left || 0);
    const rawY = e.clientY - (rect?.top || 0);

    const menuWidth = 230;
    const menuHeight = 280;
    const maxX = (rect?.width || 1200) - menuWidth - 15;
    const maxY = (rect?.height || 850) - menuHeight - 15;

    setContextMenu({
      isOpen: true,
      x: Math.max(10, Math.min(rawX, maxX)),
      y: Math.max(10, Math.min(rawY, maxY)),
      targetType: 'SLOT',
      slotNumber: slotNum
    });
  };

  // Direct Edit trigger for specified port
  const handleStartEditPortWithTarget = (slotNum: number, portIdx: number) => {
    const slot = slots.find((s) => s.slotNumber === slotNum);
    const port = slot?.ports[portIdx];
    if (!port) return;

    setSelectedSlotNumber(slotNum);
    setSelectedPortIndex(portIdx);
    setEditPortName(port.portName);
    setEditSfpModel(port.sfpModel);
    setEditStatus(port.status);
    setEditTxPower(port.txPowerDbm);
    setEditTemp(port.temperature);
    setEditFeeder(port.connectedFeeder);
    setEditTargetOdc(port.targetOdcCode);
    setEditMaxOnu(port.maxOnuCapacity);
    setEditNotes(port.splicedNotes);
    setIsEditingPort(true);
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
    triggerToast(`✏️ Mode Edit terbuka untuk port ${port.portName}`);
  };

  // Quick Change Port Status from Context Menu
  const handleQuickChangePortStatus = (newStatus: 'UP' | 'STANDBY' | 'LOS_ALARM' | 'EMPTY') => {
    const slotNum = contextMenu.slotNumber;
    const portIdx = contextMenu.portIndex ?? selectedPortIndex;

    setSlots((prev) =>
      prev.map((s) => {
        if (s.slotNumber !== slotNum) return s;
        return {
          ...s,
          ports: s.ports.map((p, idx) => {
            if (idx !== portIdx) return p;
            return {
              ...p,
              status: newStatus,
              downloadThroughputMbps: newStatus === 'UP' ? 1200 : 0,
              uploadThroughputMbps: newStatus === 'UP' ? 350 : 0
            };
          })
        };
      })
    );

    setContextMenu((prev) => ({ ...prev, isOpen: false }));
    triggerToast(`Status port diubah menjadi ${newStatus}`);
  };

  // Quick Change Card Type from Context Menu
  const handleQuickChangeCardType = (slotNum: number, newType: ZteCardType) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.slotNumber !== slotNum) return s;
        if (newType === 'GTGH') {
          const dummyPorts: ZtePonPortData[] = Array.from({ length: 16 }).map((_, idx) => ({
            portNumber: idx + 1,
            portName: `gpon-olt_1/${slotNum}/${idx + 1}`,
            slotNumber: slotNum,
            sfpModel: 'ZTE SFP-GPON-OLT Class C++',
            status: 'UP',
            txPowerDbm: 4.85,
            rxPowerDbm: -19.4,
            wavelength: 'Tx 1490nm / Rx 1310nm',
            temperature: 40.5,
            biasCurrentMa: 14.5,
            voltage: 3.31,
            totalOnu: 42,
            maxOnuCapacity: 64,
            connectedFeeder: 'Feeder Distribusi',
            targetOdcCode: 'ODC-01',
            downloadThroughputMbps: 1250,
            uploadThroughputMbps: 350,
            splicedNotes: 'Aktif normal'
          }));
          return {
            ...s,
            cardType: 'GTGH',
            cardName: `Slot ${slotNum}: GTGH (16-Port GPON)`,
            description: `Kartu Layanan GPON 16 Port Class C++ - Slot ${slotNum}`,
            status: 'INSERVICE',
            ports: dummyPorts
          };
        }
        if (newType === 'GTGO') {
          const dummyPorts: ZtePonPortData[] = Array.from({ length: 8 }).map((_, idx) => ({
            portNumber: idx + 1,
            portName: `gpon-olt_1/${slotNum}/${idx + 1}`,
            slotNumber: slotNum,
            sfpModel: 'ZTE SFP-GPON-OLT Class C+',
            status: 'UP',
            txPowerDbm: 4.2,
            rxPowerDbm: -20.1,
            wavelength: 'Tx 1490nm / Rx 1310nm',
            temperature: 39.5,
            biasCurrentMa: 14.0,
            voltage: 3.3,
            totalOnu: 30,
            maxOnuCapacity: 64,
            connectedFeeder: 'Feeder GTGO 8-Port',
            targetOdcCode: 'ODC-02',
            downloadThroughputMbps: 850,
            uploadThroughputMbps: 220,
            splicedNotes: 'Aktif normal 8-Port'
          }));
          return {
            ...s,
            cardType: 'GTGO',
            cardName: `Slot ${slotNum}: GTGO (8-Port GPON)`,
            description: `Kartu Layanan GPON 8 Port Class C+ - Slot ${slotNum}`,
            status: 'INSERVICE',
            ports: dummyPorts
          };
        }
        return {
          ...s,
          cardType: newType,
          cardName: `Slot ${slotNum}: ${newType}`,
          description: `Slot ${slotNum} dikonfigurasi sebagai ${newType}`,
          status: newType === 'BLANK' ? 'EMPTY' : 'INSERVICE',
          ports: []
        };
      })
    );

    setContextMenu((prev) => ({ ...prev, isOpen: false }));
    triggerToast(`Slot ${slotNum} diubah menjadi ${newType}`);
  };

  // Start Editing Port
  const handleStartEditPort = () => {
    if (!selectedPort) return;
    setEditPortName(selectedPort.portName);
    setEditSfpModel(selectedPort.sfpModel);
    setEditStatus(selectedPort.status);
    setEditTxPower(selectedPort.txPowerDbm);
    setEditTemp(selectedPort.temperature);
    setEditFeeder(selectedPort.connectedFeeder);
    setEditTargetOdc(selectedPort.targetOdcCode);
    setEditMaxOnu(selectedPort.maxOnuCapacity);
    setEditNotes(selectedPort.splicedNotes);
    setIsEditingPort(true);
  };

  // Save Port Edits
  const handleSavePort = (e: React.FormEvent) => {
    e.preventDefault();
    setSlots((prevSlots) =>
      prevSlots.map((slot) => {
        if (slot.slotNumber !== selectedSlotNumber) return slot;
        return {
          ...slot,
          ports: slot.ports.map((p, idx) => {
            if (idx !== selectedPortIndex) return p;
            return {
              ...p,
              portName: editPortName,
              sfpModel: editSfpModel,
              status: editStatus,
              txPowerDbm: Number(editTxPower),
              temperature: Number(editTemp),
              connectedFeeder: editFeeder,
              targetOdcCode: editTargetOdc,
              maxOnuCapacity: Number(editMaxOnu),
              splicedNotes: editNotes
            };
          })
        };
      })
    );
    setIsEditingPort(false);
    triggerToast(`Port ${selectedPort.portName} berhasil diperbarui.`);
  };

  // Reboot PON Port Simulation
  const handleRebootPort = () => {
    if (confirm(`Restart / Reboot port PON ${selectedPort.portName}?`)) {
      triggerToast(`Melakukan reset port ${selectedPort.portName}...`);
      setTimeout(() => {
        triggerToast(`Port ${selectedPort.portName} kembali ONLINE.`);
      }, 1500);
    }
  };

  // ZTE C300 CLI Diagnostic Text Generation
  const cliOutput = useMemo(() => {
    const port = selectedPort?.portName || 'gpon-olt_1/2/1';
    if (activeCliTab === 'SHOW_CARD') {
      return `ZXA10-C300# show card
Rack Shelf Slot CfgType  RealType  Port  HardVer  SoftVer       Status
-----------------------------------------------------------------------------
1    1     1              
1    1     2    GTGH     GTGH      16    V1.0.0   V1.2.5P3      INSERVICE
1    1     3    GTGH     GTGH      16    V1.0.0   V1.2.5P3      INSERVICE
1    1     4    GTGH     GTGH      16    V1.0.0   V1.2.5P3      INSERVICE
1    1     5              
1    1     6              
1    1     7              
1    1     8              
1    1     9    SCXN     SCXN      4     V1.0.0   V1.2.5P3      INSERVICE(Master)
1    1     10   SCXN     SCXN      4     V1.0.0   V1.2.5P3      STANDBY
1    1     19   HUVQ     HUVQ      4     V1.0.0   V1.2.5P3      INSERVICE
1    1     21   CICG     CICG      0     V1.0.0   V1.2.5P3      INSERVICE`;
    }
    if (activeCliTab === 'SHOW_ONU_STATE') {
      return `ZXA10-C300# show gpon onu state ${port}
OnuIndex               AdminState  OmciState    PhaseState    Channel
-----------------------------------------------------------------------------
${port}:1    enable      enable       working       normal
${port}:2    enable      enable       working       normal
${port}:3    enable      enable       working       normal
${port}:4    enable      enable       working       normal
${port}:5    enable      enable       working       normal
${port}:6    enable      enable       working       normal
${port}:7    enable      enable       working       normal
${port}:8    enable      enable       working       normal
[Total ONU Online: ${selectedPort?.totalOnu || 48} / ${selectedPort?.maxOnuCapacity || 64}]`;
    }
    if (activeCliTab === 'SHOW_OPTICAL') {
      return `ZXA10-C300# show optical-power-pon ${port}
Port: ${port}
-----------------------------------------------------------------------------
Transceiver Type     : ZTE SFP-GPON-OLT (Class C++)
Operating Wavelength : Tx 1490nm, Rx 1310nm
Tx Optical Power     : ${selectedPort?.txPowerDbm ?? 4.85} dBm
Rx Optical Power     : ${selectedPort?.rxPowerDbm ?? -19.4} dBm
Working Temperature  : ${selectedPort?.temperature ?? 41.5} C
Bias Current         : ${selectedPort?.biasCurrentMa ?? 14.8} mA
Supply Voltage       : ${selectedPort?.voltage ?? 3.31} V
Status               : ${selectedPort?.status === 'UP' ? 'Normal (Optical Link Healthy)' : 'Alarm Check'}`;
    }
    return `ZXA10-C300# show running-config-interface ${port}
!
interface ${port}
  no shutdown
  link-protect disable
  auto-learning enable
  onu 1 type F609 sn ZTEGC1029481
  onu 2 type F660 sn ZTEGC1029482
  onu 3 type F670L sn ZTEGC1029483
!`;
  }, [activeCliTab, selectedPort]);

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliOutput);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
    triggerToast('CLI command output berhasil disalin.');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="glass-panel zte-c300-modal"
        onClick={(e) => {
          e.stopPropagation();
          if (contextMenu.isOpen) {
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }
        }}
        onContextMenu={(e) => {
          // If right-clicked on empty area inside modal, close context menu
          if (contextMenu.isOpen) {
            setContextMenu((prev) => ({ ...prev, isOpen: false }));
          }
        }}
        style={{
          width: isFullscreen ? '99vw' : '1360px',
          maxWidth: '99vw',
          height: isFullscreen ? '98vh' : '920px',
          maxHeight: '98vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.15rem',
          margin: 0,
          background: 'linear-gradient(145deg, #090e1a 0%, #050811 100%)',
          border: '1px solid rgba(6, 182, 212, 0.45)',
          boxShadow: '0 25px 65px -10px rgba(0, 0, 0, 0.95), 0 0 40px rgba(6, 182, 212, 0.2)',
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
              zIndex: 10020,
              background: '#0f172a',
              border: '1px solid var(--accent-cyan)',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '8px',
              boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
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
            HEADER: REAL ZTE ZXA10 C300 10U ACCESS SHELF
            ========================================================================= */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '0.75rem',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #075985)',
                border: '2px solid #38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(2, 132, 199, 0.45)'
              }}
            >
              <Server size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
                  ZTE ZXA10 C300 &mdash; 10U Multi-Service Optical Access Chassis
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '5px',
                    background: 'rgba(2, 132, 199, 0.25)',
                    color: '#38bdf8',
                    border: '1px solid #0284c7'
                  }}
                >
                  21 VERTICAL SLOTS ARCHITECTURE
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '5px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  🖱️ Klik Kanan Port/Slot untuk Menu Edit
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Lokasi: <b style={{ color: '#ffffff' }}>Rack 01 &bull; POP Sentral NOC</b> &bull; Fan Tray: <b style={{ color: '#10b981' }}>FAN-C300 OK (4800 RPM)</b> &bull; Main Control: <b style={{ color: '#38bdf8' }}>SCXN (Slot 9 Master)</b> &bull; Power: <b style={{ color: '#10b981' }}>Dual PRWG -48V DC Normal</b>
              </div>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* View Mode Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <button
                type="button"
                className={`tray-laser-pill ${viewMode === 'CHASSIS_OVERVIEW' ? 'active-cyan' : ''}`}
                onClick={() => setViewMode('CHASSIS_OVERVIEW')}
                title="Tampilkan seluruh chassis 10U ZTE C300 dengan 21 slot vertikal"
              >
                <Layers size={13} />
                <span>Chassis 21-Slot</span>
              </button>
              <button
                type="button"
                className={`tray-laser-pill ${viewMode === 'GTGH_BLADE_ZOOM' ? 'active-cyan' : ''}`}
                onClick={() => setViewMode('GTGH_BLADE_ZOOM')}
                title="Perbesar tampilan papan GTGH 16-Port GPON"
              >
                <Eye size={13} />
                <span>Zoom Blade GTGH</span>
              </button>
            </div>

            {/* Laser Mode Selector */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <button
                type="button"
                className={`tray-laser-pill ${laserMode === 'GPON_DATA' ? 'active-cyan' : ''}`}
                onClick={() => setLaserMode('GPON_DATA')}
                title="Cahaya Laser Downstream 1490nm"
              >
                <Radio size={12} />
                <span>1490nm</span>
              </button>
              <button
                type="button"
                className={`tray-laser-pill ${laserMode === 'VFL_RED' ? 'active-red' : ''}`}
                onClick={() => setLaserMode('VFL_RED')}
                title="Laser Merah VFL 650nm"
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

            {/* Animation Toggle */}
            <button
              type="button"
              className="btn-icon"
              onClick={() => setIsLaserAnimated(!isLaserAnimated)}
              title={isLaserAnimated ? 'Jeda Animasi Fan & Laser' : 'Putar Animasi Fan & Laser'}
              style={{ padding: '0.45rem', background: 'rgba(255, 255, 255, 0.05)' }}
            >
              {isLaserAnimated ? <Pause size={15} style={{ color: 'var(--accent-cyan)' }} /> : <Play size={15} />}
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              className="btn-icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
              style={{ padding: '0.45rem', background: 'rgba(255, 255, 255, 0.05)' }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close */}
            <button
              type="button"
              className="btn-icon"
              onClick={onClose}
              title="Tutup Modal"
              style={{ padding: '0.45rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            SLOT SELECTOR BAR: QUICK NAVIGATION ACROSS 21 SLOTS
            ========================================================================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            paddingBottom: '0.65rem',
            overflowX: 'auto',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '0.75rem',
            flexShrink: 0
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginRight: '0.35rem', whiteSpace: 'nowrap' }}>
            PILIH SLOT:
          </span>
          {slots.map((s) => {
            const isSelected = selectedSlotNumber === s.slotNumber;
            const isGtgh = s.cardType === 'GTGH';
            const isScxn = s.cardType === 'SCXN';
            const isHuvq = s.cardType === 'HUVQ';
            const isBlank = s.cardType === 'BLANK';

            let tagColor = '#64748b';
            let borderColor = 'rgba(255, 255, 255, 0.08)';
            let bg = 'var(--bg-tertiary)';

            if (isSelected) {
              borderColor = '#0284c7';
              bg = 'rgba(2, 132, 199, 0.25)';
              tagColor = '#38bdf8';
            } else if (isGtgh) {
              tagColor = '#06b6d4';
            } else if (isScxn) {
              tagColor = '#10b981';
            } else if (isHuvq) {
              tagColor = '#f59e0b';
            }

            return (
              <button
                key={s.slotNumber}
                type="button"
                onClick={() => {
                  setSelectedSlotNumber(s.slotNumber);
                  setSelectedPortIndex(0);
                  setIsEditingPort(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border: `1px solid ${borderColor}`,
                  background: bg,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Slot {s.slotNumber}</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    background: isSelected ? '#0284c7' : 'rgba(0, 0, 0, 0.3)',
                    color: isSelected ? '#ffffff' : tagColor,
                    fontWeight: 800
                  }}
                >
                  {s.cardType}
                </span>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            SPLIT 2-CONTAINER WORKSPACE:
            LEFT: AUTHENTIC ZTE C300 CHASSIS (SVG)
            RIGHT: DDM METRICS, ZTE CLI & PORT EDITOR
            ========================================================================= */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1.35fr 1fr',
            gap: '1rem',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          {/* -----------------------------------------------------------------------
              LEFT CONTAINER: HARDWARE CHASSIS RACK ZTE C300 (SVG ANIMATION)
              ----------------------------------------------------------------------- */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0.75rem',
              margin: 0,
              background: '#040711',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Header Toolbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.45rem',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                  {viewMode === 'CHASSIS_OVERVIEW'
                    ? 'ZTE ZXA10 C300 FRONT ACCESS PANEL (10U)'
                    : `DETAIL BLADE: ${currentSlot.cardName}`}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  &bull; {viewMode === 'CHASSIS_OVERVIEW' ? 'Klik slot/blade untuk inspeksi' : 'Klik port SFP vertikal'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <span>SCXN 9: <b style={{ color: '#10b981' }}>MASTER</b></span>
                <span>&bull;</span>
                <span>Fan Tray: <b style={{ color: 'var(--accent-cyan)' }}>4800 RPM</b></span>
              </div>
            </div>

            {/* SVG Visualizer Canvas */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at center, #0b1329 0%, #03060f 100%)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              {viewMode === 'CHASSIS_OVERVIEW' ? (
                /* ===================================================================
                   VIEW 1: FULL 10U CHASSIS (21 VERTICAL SLOTS)
                   =================================================================== */
                <svg
                  viewBox="0 0 760 520"
                  style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '560px',
                    userSelect: 'none'
                  }}
                >
                  <defs>
                    {/* Laser glow */}
                    <filter id="c300-laser-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Chassis Outer Metal */}
                    <linearGradient id="chassisMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="40%" stopColor="#0f172a" />
                      <stop offset="70%" stopColor="#0b1120" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    {/* Card Faceplate Metal */}
                    <linearGradient id="cardBladeMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1f293d" />
                      <stop offset="50%" stopColor="#151e2e" />
                      <stop offset="100%" stopColor="#0f1726" />
                    </linearGradient>

                    {/* SCXN Control Card Gradient */}
                    <linearGradient id="scxnBladeMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#193149" />
                      <stop offset="50%" stopColor="#0c2033" />
                      <stop offset="100%" stopColor="#081726" />
                    </linearGradient>

                    {/* SFP Port Silver Case */}
                    <linearGradient id="sfpSilver" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                  </defs>

                  {/* 1. 19-INCH RACK CHASSIS BASE (10U HEIGHT) */}
                  <rect x="25" y="10" width="710" height="500" rx="6" fill="url(#chassisMetalGrad)" stroke="#334155" strokeWidth="2.5" />

                  {/* Rackmount Ears & Screws Left */}
                  <rect x="25" y="10" width="24" height="500" fill="#1e293b" stroke="#334155" />
                  {[35, 120, 220, 320, 420, 485].map((sy) => (
                    <g key={sy}>
                      <ellipse cx="37" cy={sy} rx="4" ry="6" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
                      <circle cx="37" cy={sy} r="2.5" fill="#94a3b8" />
                    </g>
                  ))}

                  {/* Rackmount Ears & Screws Right */}
                  <rect x="711" y="10" width="24" height="500" fill="#1e293b" stroke="#334155" />
                  {[35, 120, 220, 320, 420, 485].map((sy) => (
                    <g key={sy}>
                      <ellipse cx="723" cy={sy} rx="4" ry="6" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
                      <circle cx="723" cy={sy} r="2.5" fill="#94a3b8" />
                    </g>
                  ))}

                  {/* ===================================================================
                      TOP: FAN TRAY UNIT (FAN-C300, 1U HEIGHT)
                      =================================================================== */}
                  <g transform="translate(56, 18)">
                    {/* Fan Tray Outer Drawer */}
                    <rect x="0" y="0" width="648" height="52" rx="4" fill="#0b1120" stroke="#334155" strokeWidth="1.5" />
                    
                    {/* ZTE C300 Logo Silkscreen */}
                    <text x="12" y="24" fill="#0284c7" fontSize="15" fontWeight="900" letterSpacing="0.08em">
                      ZTE
                    </text>
                    <text x="50" y="23" fill="#ffffff" fontSize="11" fontWeight="800">
                      ZXA10 C300
                    </text>
                    <text x="50" y="38" fill="#64748b" fontSize="8" fontWeight="600">
                      FAN-C300 MODULE
                    </text>

                    {/* Fan Status LEDs */}
                    <g transform="translate(145, 14)">
                      <circle cx="0" cy="5" r="3" fill="#10b981" />
                      <text x="7" y="8" fill="#10b981" fontSize="7" fontWeight="700">RUN</text>
                      <circle cx="35" cy="5" r="3" fill="#334155" />
                      <text x="42" y="8" fill="#64748b" fontSize="7">ALM</text>
                      <text x="0" y="22" fill="#38bdf8" fontSize="7" fontWeight="700">4800 RPM</text>
                    </g>

                    {/* 4 Rotating Cooling Fans inside the Top Fan Tray */}
                    {[0, 1, 2, 3].map((fIdx) => {
                      const fanX = 245 + fIdx * 85;
                      return (
                        <g key={fIdx} transform={`translate(${fanX}, 26)`}>
                          {/* Circular Fan Grille */}
                          <circle cx="0" cy="0" r="21" fill="#060913" stroke="#334155" strokeWidth="1.2" />
                          <circle cx="0" cy="0" r="19" fill="none" stroke="#1e293b" strokeDasharray="3 3" />
                          {/* Animated Blades */}
                          <g className={isLaserAnimated ? 'fan-spin' : ''}>
                            <path d="M 0,0 C -7,-6 -14,-16 0,-18 C 5,-18 6,-8 0,0" fill="#475569" />
                            <path d="M 0,0 C 6,-7 16,-14 18,0 C 18,5 8,6 0,0" fill="#475569" />
                            <path d="M 0,0 C 7,6 14,16 0,18 C -5,18 -6,8 0,0" fill="#475569" />
                            <path d="M 0,0 C -6,7 -16,14 -18,0 C -18,-5 -8,-6 0,0" fill="#475569" />
                            <circle cx="0" cy="0" r="4.5" fill="#0284c7" />
                          </g>
                        </g>
                      );
                    })}

                    {/* Fan Tray Pull Handles */}
                    <rect x="590" y="14" width="46" height="24" rx="3" fill="#1e293b" stroke="#475569" />
                    <rect x="596" y="20" width="34" height="12" rx="2" fill="#090d16" />
                  </g>

                  {/* ===================================================================
                      MIDDLE: 21 VERTICAL CARD SLOTS (SLOT 1 TO 21)
                      =================================================================== */}
                  <g transform="translate(56, 76)">
                    {/* Card Cage Backing Frame */}
                    <rect x="0" y="0" width="648" height="375" fill="#060913" stroke="#334155" strokeWidth="1.5" />

                    {/* Slot Dividers & Vertical Blades */}
                    {slots.map((s, idx) => {
                      const slotX = idx * 30.85;
                      const isSelected = selectedSlotNumber === s.slotNumber;
                      const isHovered = hoveredSlotNumber === s.slotNumber;
                      const isGtgh = s.cardType === 'GTGH';
                      const isScxn = s.cardType === 'SCXN';
                      const isHuvq = s.cardType === 'HUVQ';
                      const isCicg = s.cardType === 'CICG';
                      const isBlank = s.cardType === 'BLANK';

                      return (
                        <g
                          key={s.slotNumber}
                          transform={`translate(${slotX}, 0)`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedSlotNumber(s.slotNumber);
                            setSelectedPortIndex(0);
                            setIsEditingPort(false);
                          }}
                          onContextMenu={(e) => handleSlotContextMenu(e, s.slotNumber)}
                          onMouseEnter={() => setHoveredSlotNumber(s.slotNumber)}
                          onMouseLeave={() => setHoveredSlotNumber(null)}
                        >
                          {/* Vertical Blade Faceplate */}
                          <rect
                            x="0.5"
                            y="0"
                            width="29.8"
                            height="375"
                            fill={
                              isScxn
                                ? 'url(#scxnBladeMetal)'
                                : isGtgh
                                ? 'url(#cardBladeMetal)'
                                : '#0a0e1a'
                            }
                            stroke={
                              isSelected
                                ? '#38bdf8'
                                : isHovered
                                ? 'var(--accent-cyan)'
                                : '#1e293b'
                            }
                            strokeWidth={isSelected ? 2 : 1}
                          />

                          {/* Top Ejector Latch Handle with Screw */}
                          <rect x="3" y="2" width="24" height="14" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.8" />
                          <circle cx="15" cy="9" r="2.5" fill="#94a3b8" />

                          {/* Card Silkscreen Slot Number at Top */}
                          <text
                            x="15"
                            y="25"
                            textAnchor="middle"
                            fill={isSelected ? '#38bdf8' : '#94a3b8'}
                            fontSize="7.5"
                            fontWeight="800"
                          >
                            {s.slotNumber}
                          </text>

                          {/* Top Status LED for Card */}
                          {!isBlank && (
                            <circle
                              cx="15"
                              cy="33"
                              r="2.2"
                              fill={
                                s.status === 'INSERVICE'
                                  ? '#10b981'
                                  : s.status === 'STANDBY'
                                  ? '#f59e0b'
                                  : '#ef4444'
                              }
                              filter={s.status === 'INSERVICE' ? 'url(#c300-laser-glow)' : 'none'}
                            />
                          )}

                          {/* ---------------- CARD CONTENT SPECIFIC ---------------- */}
                          {/* A. GTGH 16-PORT GPON CARD: 16 Mini SFP Ports vertically stacked */}
                          {isGtgh && (
                            <g transform="translate(4, 40)">
                              {Array.from({ length: 16 }).map((_, pIdx) => {
                                const py = pIdx * 17.5;
                                const portData = s.ports[pIdx];
                                const isPortUp = portData?.status === 'UP';
                                const isPortSelected = isSelected && selectedPortIndex === pIdx;

                                return (
                                  <g
                                    key={pIdx}
                                    transform={`translate(0, ${py})`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSlotNumber(s.slotNumber);
                                      setSelectedPortIndex(pIdx);
                                      setIsEditingPort(false);
                                    }}
                                    onDoubleClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEditPortWithTarget(s.slotNumber, pIdx);
                                    }}
                                    onContextMenu={(e) => handlePortContextMenu(e, s.slotNumber, pIdx)}
                                  >
                                    {/* SFP Port Cage */}
                                    <rect
                                      x="1"
                                      y="0"
                                      width="19.5"
                                      height="13"
                                      rx="1.5"
                                      fill={isPortSelected ? '#0284c7' : 'url(#sfpSilver)'}
                                      stroke={isPortSelected ? '#38bdf8' : '#475569'}
                                      strokeWidth="0.8"
                                    />
                                    {/* Gold latch */}
                                    <rect x="3" y="1" width="15.5" height="3" rx="0.5" fill="#eab308" />
                                    {/* Optical socket */}
                                    <rect x="5.5" y="5" width="10.5" height="6.5" rx="1" fill="#0284c7" />
                                    <circle cx="10.7" cy="8.2" r="1.5" fill="#090d16" />

                                    {/* Laser beam out of port */}
                                    {laserMode !== 'OFF' && isPortUp && (
                                      <line
                                        x1="10.7"
                                        y1="8.2"
                                        x2="10.7"
                                        y2="15"
                                        stroke={laserMode === 'VFL_RED' ? '#ef4444' : '#06b6d4'}
                                        strokeWidth={isPortSelected ? 2.5 : 1.5}
                                        strokeDasharray="4 2"
                                        className={isLaserAnimated ? 'fiber-laser-flow' : ''}
                                        filter="url(#c300-laser-glow)"
                                      />
                                    )}
                                  </g>
                                );
                              })}
                            </g>
                          )}

                          {/* B. SCXN CONTROL CARD (Slot 9 Master, Slot 10 Standby) */}
                          {isScxn && (
                            <g transform="translate(2, 45)">
                              {/* Master / Standby badge */}
                              <rect x="1" y="0" width="24" height="12" rx="2" fill={s.isMaster ? '#0284c7' : '#334155'} />
                              <text x="13" y="9" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900">
                                {s.isMaster ? 'MSTR' : 'STBY'}
                              </text>

                              {/* LEDs: RUN, ALM, ACT, M/S */}
                              <g transform="translate(3, 18)">
                                <circle cx="4" cy="4" r="2" fill="#10b981" />
                                <circle cx="16" cy="4" r="2" fill="#334155" />
                                <circle cx="4" cy="14" r="2" fill="#0284c7" />
                                <circle cx="16" cy="14" r="2" fill="#10b981" />
                              </g>

                              {/* RJ45 CONSOLE & MGMT Ports */}
                              <rect x="4" y="42" width="18" height="14" rx="2" fill="#090d16" stroke="#475569" />
                              <text x="13" y="52" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontWeight="700">CON</text>

                              <rect x="4" y="62" width="18" height="14" rx="2" fill="#090d16" stroke="#475569" />
                              <text x="13" y="72" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontWeight="700">ETH</text>

                              {/* 4x 10GE Uplink SFP+ Ports on SCXN */}
                              <g transform="translate(3, 85)">
                                {[0, 1, 2, 3].map((uIdx) => (
                                  <g key={uIdx} transform={`translate(0, ${uIdx * 30})`}>
                                    <rect x="1" y="0" width="18" height="22" rx="2" fill="url(#sfpSilver)" stroke="#475569" />
                                    <rect x="3" y="2" width="14" height="4" fill="#38bdf8" />
                                    <circle cx="10" cy="12" r="2" fill="#10b981" className={isLaserAnimated ? 'fiber-laser-flow' : ''} />
                                    <text x="10" y="20" textAnchor="middle" fill="#090d16" fontSize="5" fontWeight="800">
                                      XGE{uIdx + 1}
                                    </text>
                                  </g>
                                ))}
                              </g>
                            </g>
                          )}

                          {/* C. HUVQ 4x 10GE UPLINK CARD (Slot 19) */}
                          {isHuvq && (
                            <g transform="translate(3, 60)">
                              <text x="12" y="0" textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontWeight="800">10GE</text>
                              {[0, 1, 2, 3].map((uIdx) => (
                                <g key={uIdx} transform={`translate(0, ${15 + uIdx * 34})`}>
                                  <rect x="1" y="0" width="22" height="24" rx="2" fill="url(#sfpSilver)" stroke="#475569" />
                                  <rect x="3" y="2" width="18" height="5" fill="#f59e0b" />
                                  <circle cx="12" cy="13" r="2.5" fill="#10b981" />
                                  <text x="12" y="22" textAnchor="middle" fill="#090d16" fontSize="5.5" fontWeight="800">
                                    OPT{uIdx + 1}
                                  </text>
                                </g>
                              ))}
                            </g>
                          )}

                          {/* D. CICG ENVIRONMENT CARD (Slot 21) */}
                          {isCicg && (
                            <g transform="translate(3, 70)">
                              <text x="12" y="0" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="800">CLK</text>
                              <rect x="3" y="10" width="18" height="12" rx="1.5" fill="#1e293b" stroke="#475569" />
                              <rect x="3" y="28" width="18" height="12" rx="1.5" fill="#1e293b" stroke="#475569" />
                              <circle cx="12" cy="50" r="3" fill="#10b981" />
                              <text x="12" y="62" textAnchor="middle" fill="#64748b" fontSize="5.5">BITS</text>
                            </g>
                          )}

                          {/* E. BLANK FILLER PANEL */}
                          {isBlank && (
                            <g transform="translate(14, 50)">
                              {[0, 1, 2, 3, 4, 5, 6, 7].map((bIdx) => (
                                <line
                                  key={bIdx}
                                  x1="-8"
                                  y1={bIdx * 32}
                                  x2="8"
                                  y2={bIdx * 32}
                                  stroke="#1e293b"
                                  strokeWidth="1.5"
                                  strokeDasharray="2 3"
                                />
                              ))}
                              <text
                                x="0"
                                y="260"
                                transform="rotate(-90 0 260)"
                                textAnchor="middle"
                                fill="#334155"
                                fontSize="7"
                                fontWeight="700"
                                letterSpacing="0.1em"
                              >
                                BLANK
                              </text>
                            </g>
                          )}

                          {/* Card Model Label at Bottom */}
                          <text
                            x="15"
                            y="348"
                            textAnchor="middle"
                            fill={isSelected ? '#38bdf8' : isBlank ? '#475569' : '#cbd5e1'}
                            fontSize="6.5"
                            fontWeight="800"
                          >
                            {s.cardType}
                          </text>

                          {/* Bottom Ejector Latch Handle with Screw */}
                          <rect x="3" y="357" width="24" height="14" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.8" />
                          <circle cx="15" cy="364" r="2.5" fill="#94a3b8" />
                        </g>
                      );
                    })}
                  </g>

                  {/* ===================================================================
                      BOTTOM: DUAL PRWG POWER MODULES & DUST FILTER
                      =================================================================== */}
                  <g transform="translate(56, 458)">
                    {/* Lower Tray Frame */}
                    <rect x="0" y="0" width="648" height="42" rx="4" fill="#080c16" stroke="#334155" strokeWidth="1.5" />

                    {/* PRWG 1 Power Module (Left) */}
                    <g transform="translate(8, 6)">
                      <rect x="0" y="0" width="230" height="30" rx="3" fill="#0f172a" stroke="#1e293b" />
                      <circle cx="12" cy="15" r="3.5" fill="#10b981" />
                      <text x="22" y="14" fill="#ffffff" fontSize="8" fontWeight="800">PRWG 1 (DC -48V)</text>
                      <text x="22" y="23" fill="#10b981" fontSize="7" fontWeight="600">INPUT: -48.2V OK</text>
                      {/* Terminal studs */}
                      <circle cx="140" cy="15" r="4" fill="#d97706" stroke="#f59e0b" />
                      <text x="150" y="18" fill="#94a3b8" fontSize="7">-48V</text>
                      <circle cx="180" cy="15" r="4" fill="#475569" stroke="#94a3b8" />
                      <text x="190" y="18" fill="#94a3b8" fontSize="7">0V</text>
                    </g>

                    {/* Center Lower Air Grille / Dust Filter */}
                    <g transform="translate(248, 6)">
                      <rect x="0" y="0" width="152" height="30" rx="3" fill="#060913" stroke="#1e293b" />
                      <text x="76" y="19" textAnchor="middle" fill="#475569" fontSize="7.5" fontWeight="700">
                        AIR INTAKE / DUST FILTER
                      </text>
                    </g>

                    {/* PRWG 2 Power Module (Right - Redundant) */}
                    <g transform="translate(410, 6)">
                      <rect x="0" y="0" width="230" height="30" rx="3" fill="#0f172a" stroke="#1e293b" />
                      <circle cx="12" cy="15" r="3.5" fill="#10b981" />
                      <text x="22" y="14" fill="#ffffff" fontSize="8" fontWeight="800">PRWG 2 (DC -48V REDUNDANT)</text>
                      <text x="22" y="23" fill="#10b981" fontSize="7" fontWeight="600">INPUT: -48.1V OK</text>
                      {/* Terminal studs */}
                      <circle cx="140" cy="15" r="4" fill="#d97706" stroke="#f59e0b" />
                      <text x="150" y="18" fill="#94a3b8" fontSize="7">-48V</text>
                      <circle cx="180" cy="15" r="4" fill="#475569" stroke="#94a3b8" />
                      <text x="190" y="18" fill="#94a3b8" fontSize="7">0V</text>
                    </g>
                  </g>
                </svg>
              ) : (
                /* ===================================================================
                   VIEW 2: ZOOMED DETAIL OF SELECTED GTGH 16-PORT VERTICAL BLADE
                   =================================================================== */
                <svg
                  viewBox="0 0 620 520"
                  style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '560px',
                    userSelect: 'none'
                  }}
                >
                  <defs>
                    <filter id="gtgh-zoom-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* GTGH Blade Large Frame */}
                  <rect x="180" y="10" width="260" height="500" rx="6" fill="#0b1120" stroke="#334155" strokeWidth="2" />
                  
                  {/* Top Ejector Handle */}
                  <rect x="230" y="15" width="160" height="24" rx="4" fill="#1e293b" stroke="#475569" />
                  <circle cx="310" cy="27" r="4" fill="#94a3b8" />
                  <text x="310" y="48" textAnchor="middle" fill="#0284c7" fontSize="12" fontWeight="900" letterSpacing="0.05em">
                    {currentSlot.cardName.toUpperCase()}
                  </text>
                  <text x="310" y="62" textAnchor="middle" fill="#64748b" fontSize="8.5">
                    16x GPON Class C++ Optical SFP Ports &bull; Vertical Faceplate
                  </text>

                  {/* 16 Vertical SFP Ports (2 Columns of 8 Ports) */}
                  {currentPorts.map((port, idx) => {
                    const col = idx % 2;
                    const row = Math.floor(idx / 2);
                    const px = 205 + col * 115;
                    const py = 75 + row * 47;
                    const isSelected = selectedPortIndex === idx;
                    const isHovered = hoveredPortIndex === idx;
                    const isTarget = isSelected || isHovered;
                    const isUp = port.status === 'UP';

                    return (
                      <g
                        key={port.portName}
                        transform={`translate(${px}, ${py})`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedPortIndex(idx);
                          setIsEditingPort(false);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleStartEditPortWithTarget(currentSlot.slotNumber, idx);
                        }}
                        onContextMenu={(e) => handlePortContextMenu(e, currentSlot.slotNumber, idx)}
                        onMouseEnter={() => setHoveredPortIndex(idx)}
                        onMouseLeave={() => setHoveredPortIndex(null)}
                      >
                        {/* Port Slot Card */}
                        <rect
                          x="0"
                          y="0"
                          width="95"
                          height="42"
                          rx="4"
                          fill={isTarget ? 'rgba(6, 182, 212, 0.18)' : '#0f172a'}
                          stroke={isTarget ? 'var(--accent-cyan)' : '#1e293b'}
                          strokeWidth={isTarget ? 2 : 1}
                        />

                        {/* SFP Metal Cage */}
                        <rect x="6" y="6" width="34" height="28" rx="2" fill="url(#sfpSilver)" stroke="#475569" />
                        <rect x="9" y="8" width="28" height="5" rx="1" fill="#eab308" />
                        <rect x="13" y="15" width="20" height="16" rx="1" fill="#0284c7" />
                        <circle cx="23" cy="23" r="2.5" fill="#090d16" />

                        {/* Port Name & Number */}
                        <text x="46" y="17" fill={isTarget ? 'var(--accent-cyan)' : '#ffffff'} fontSize="9" fontWeight="800">
                          PON #{port.portNumber}
                        </text>
                        <text x="46" y="27" fill="#64748b" fontSize="7" fontWeight="600">
                          {port.portName}
                        </text>

                        {/* Status LED & ONT count */}
                        <circle
                          cx="49"
                          cy="34"
                          r="2.5"
                          fill={
                            port.status === 'UP'
                              ? '#10b981'
                              : port.status === 'LOS_ALARM'
                              ? '#ef4444'
                              : port.status === 'STANDBY'
                              ? '#f59e0b'
                              : '#475569'
                          }
                          filter={port.status === 'UP' ? 'url(#gtgh-zoom-glow)' : 'none'}
                        />
                        <text x="56" y="37" fill={isUp ? '#10b981' : '#94a3b8'} fontSize="7" fontWeight="700">
                          {port.totalOnu}/64 ONT
                        </text>

                        {/* Laser Beam flowing out */}
                        {laserMode !== 'OFF' && isUp && (
                          <line
                            x1="23"
                            y1="23"
                            x2="23"
                            y2="38"
                            stroke={laserMode === 'VFL_RED' ? '#ef4444' : '#06b6d4'}
                            strokeWidth={isTarget ? 3 : 2}
                            strokeDasharray="4 2"
                            className={isLaserAnimated ? 'fiber-laser-flow' : ''}
                            filter="url(#gtgh-zoom-glow)"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Bottom Ejector Handle & Model Tag */}
                  <rect x="230" y="465" width="160" height="24" rx="4" fill="#1e293b" stroke="#475569" />
                  <circle cx="310" cy="477" r="4" fill="#94a3b8" />
                  <text x="310" y="481" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
                    GTGH V1.2.5P3
                  </text>
                </svg>
              )}
            </div>

            {/* Bottom Status Ribbon */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.45rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)'
              }}
            >
              <div>
                Slot Terpilih: <b style={{ color: 'var(--accent-cyan)' }}>{currentSlot.cardName}</b>
                {isGtghCard && selectedPort && (
                  <>
                    {' '}&bull; Port: <b style={{ color: '#ffffff' }}>{selectedPort.portName}</b> (PON #{selectedPort.portNumber})
                  </>
                )}
              </div>
              <div>
                {isGtghCard && selectedPort ? (
                  <span>
                    ODC Tujuan: <b style={{ color: 'var(--accent-cyan)' }}>{selectedPort.targetOdcCode}</b> &bull; Tx:{' '}
                    <b style={{ color: '#10b981' }}>{selectedPort.txPowerDbm} dBm</b>
                  </span>
                ) : (
                  <span>Status: <b style={{ color: '#10b981' }}>{currentSlot.status}</b></span>
                )}
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT CONTAINER: ZTE C300 SFP TELEMETRY & CLI DIAGNOSTIC INSPECTOR
              ----------------------------------------------------------------------- */}
          <div
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0.85rem',
              margin: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflowY: 'auto'
            }}
          >
            {isGtghCard && selectedPort ? (
              /* ================= GTGH PORT SELECTED ================= */
              <>
                {/* Header Port Title & Edit Button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {selectedPort.portName}
                      </h3>
                      <span
                        className={`badge ${
                          selectedPort.status === 'UP'
                            ? 'badge-good'
                            : selectedPort.status === 'LOS_ALARM'
                            ? 'badge-critical'
                            : selectedPort.status === 'STANDBY'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}
                      >
                        {selectedPort.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {currentSlot.cardName} &bull; Transceiver: {selectedPort.sfpModel}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleStartEditPort}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      <Edit3 size={13} style={{ color: 'var(--accent-cyan)' }} />
                      <span>Edit Data Port</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleRebootPort}
                      title="Reset / Reboot PON Port"
                      style={{ padding: '0.4rem', color: '#ef4444' }}
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>
                </div>

                {/* EDIT FORM (Conditional) */}
                {isEditingPort ? (
                  <form onSubmit={handleSavePort} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: 'var(--accent-cyan)'
                      }}
                    >
                      ✏️ Mengedit Konfigurasi Port {selectedPort.portName}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Nama Port CLI</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editPortName}
                          onChange={(e) => setEditPortName(e.target.value)}
                          required
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Status Port</label>
                        <select
                          className="form-select"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                        >
                          <option value="UP">UP (Aktif Normal)</option>
                          <option value="STANDBY">STANDBY (Siaga)</option>
                          <option value="LOS_ALARM">LOS_ALARM (Redaman Tinggi)</option>
                          <option value="EMPTY">EMPTY (Kosong)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Tx Output Power (dBm)</label>
                        <input
                          type="number"
                          step="0.05"
                          className="form-input"
                          value={editTxPower}
                          onChange={(e) => setEditTxPower(+e.target.value)}
                          required
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Suhu SFP (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-input"
                          value={editTemp}
                          onChange={(e) => setEditTemp(+e.target.value)}
                          required
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Target ODC</label>
                        <select
                          className="form-select"
                          value={editTargetOdc}
                          onChange={(e) => setEditTargetOdc(e.target.value)}
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                        >
                          {odcs.map((o) => (
                            <option key={o.id} value={o.code}>
                              {o.code} - {o.name}
                            </option>
                          ))}
                          <option value="ODC-01">ODC-01 (Kuta)</option>
                          <option value="ODC-02">ODC-02 (Seminyak)</option>
                          <option value="ODC-03">ODC-03 (Legian)</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.72rem' }}>Maksimal Kapasitas ONU</label>
                        <select
                          className="form-select"
                          value={editMaxOnu}
                          onChange={(e) => setEditMaxOnu(+e.target.value)}
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                        >
                          <option value="64">1:64 (Maks 64 ONT)</option>
                          <option value="128">1:128 (Maks 128 ONT)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Kabel Feeder Terhubung</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFeeder}
                        onChange={(e) => setEditFeeder(e.target.value)}
                        placeholder="Contoh: Feeder 24C POP Pusat -> ODC-01"
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Catatan Teknisi / Lokasi Splicing</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setIsEditingPort(false)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        <Check size={14} />
                        <span>Simpan Perubahan</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ================= READONLY TELEMETRY & CLI ================= */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {/* DDM Optical Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      <div
                        style={{
                          padding: '0.6rem',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>TX OPTICAL POWER</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                          {selectedPort.txPowerDbm} dBm
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Normal: +3.0 ~ +7.0</div>
                      </div>

                      <div
                        style={{
                          padding: '0.6rem',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>RX SENSITIVITY</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {selectedPort.rxPowerDbm} dBm
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Min: -32.0 dBm</div>
                      </div>

                      <div
                        style={{
                          padding: '0.6rem',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>SFP TEMPERATURE</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                          {selectedPort.temperature} °C
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Maks: 70 °C</div>
                      </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.74rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Panjang Gelombang:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{selectedPort.wavelength}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Arus Bias / Tegangan:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {selectedPort.biasCurrentMa} mA &bull; {selectedPort.voltage} V
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Kapasitas Splitter:</span>
                        <strong style={{ color: 'var(--accent-cyan)' }}>
                          {selectedPort.totalOnu} / {selectedPort.maxOnuCapacity} ONT (Rasio 1:64)
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Live Throughput:</span>
                        <strong style={{ color: '#10b981' }}>
                          ↓ {selectedPort.downloadThroughputMbps} Mbps &bull; ↑ {selectedPort.uploadThroughputMbps} Mbps
                        </strong>
                      </div>
                    </div>

                    {/* Target ODC & Cable Route */}
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(2, 132, 199, 0.08)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        fontSize: '0.74rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 800, marginBottom: '0.25rem' }}>
                        <Building size={14} />
                        <span>Koneksi Distribusi FTTH:</span>
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>{selectedPort.connectedFeeder}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>
                        {selectedPort.splicedNotes}
                      </div>
                    </div>

                    {/* ZTE C300 CLI Diagnostic Terminal */}
                    <div style={{ marginTop: '0.25rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.35rem'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setActiveCliTab('SHOW_ONU_STATE')}
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: 'none',
                              background: activeCliTab === 'SHOW_ONU_STATE' ? '#0284c7' : 'var(--bg-tertiary)',
                              color: activeCliTab === 'SHOW_ONU_STATE' ? '#ffffff' : 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            onu state
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCliTab('SHOW_OPTICAL')}
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: 'none',
                              background: activeCliTab === 'SHOW_OPTICAL' ? '#0284c7' : 'var(--bg-tertiary)',
                              color: activeCliTab === 'SHOW_OPTICAL' ? '#ffffff' : 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            optical-power
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCliTab('SHOW_CARD')}
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: 'none',
                              background: activeCliTab === 'SHOW_CARD' ? '#0284c7' : 'var(--bg-tertiary)',
                              color: activeCliTab === 'SHOW_CARD' ? '#ffffff' : 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            show card
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCliTab('RUNNING_CFG')}
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '3px 7px',
                              borderRadius: '4px',
                              border: 'none',
                              background: activeCliTab === 'RUNNING_CFG' ? '#0284c7' : 'var(--bg-tertiary)',
                              color: activeCliTab === 'RUNNING_CFG' ? '#ffffff' : 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            interface cfg
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleCopyCli}
                          style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                        >
                          {copiedCli ? <Check size={11} style={{ color: 'var(--accent-cyan)' }} /> : <Copy size={11} />}
                          <span>{copiedCli ? 'Tersalin' : 'Salin CLI'}</span>
                        </button>
                      </div>

                      <pre
                        style={{
                          background: '#040711',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.65rem',
                          margin: 0,
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#38bdf8',
                          lineHeight: '1.45',
                          overflowX: 'auto',
                          maxHeight: '150px'
                        }}
                      >
                        {cliOutput}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ================= NON-GTGH SLOT SELECTED (SCXN / HUVQ / CICG / BLANK) ================= */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {currentSlot.cardName}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {currentSlot.description}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      currentSlot.status === 'INSERVICE'
                        ? 'badge-good'
                        : currentSlot.status === 'STANDBY'
                        ? 'badge-warning'
                        : 'badge-neutral'
                    }`}
                  >
                    {currentSlot.status}
                  </span>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem'
                  }}
                >
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                    Informasi Slot Hardware:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    <li><b>Tipe Papan:</b> {currentSlot.cardType}</li>
                    <li><b>Posisi Slot:</b> Slot {currentSlot.slotNumber} (19-Inch Access Shelf)</li>
                    <li>
                      <b>Peran Sistem:</b>{' '}
                      {currentSlot.cardType === 'SCXN'
                        ? currentSlot.isMaster
                          ? 'Kartu Switching & Kontrol Aktif (Master Bus Controller)'
                          : 'Kartu Switching & Kontrol Cadangan (Standby 1+1 Redundancy)'
                        : currentSlot.cardType === 'HUVQ'
                        ? 'Kartu Antarmuka Uplink 4x 10GE SFP+ menuju Switch Distribusi / Core Router'
                        : currentSlot.cardType === 'CICG'
                        ? 'Kartu Pemantauan Sensor Suhu, Pintu Kabinet, & Sinyal Jam BITS'
                        : 'Panel Penutup (Filler Plate) untuk sirkulasi udara optimal'}
                    </li>
                  </ul>
                </div>

                {/* CLI Diagnostic */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      CLI OUTPUT (SHOW CARD)
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCopyCli}
                      style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                    >
                      {copiedCli ? <Check size={11} style={{ color: 'var(--accent-cyan)' }} /> : <Copy size={11} />}
                      <span>{copiedCli ? 'Tersalin' : 'Salin CLI'}</span>
                    </button>
                  </div>
                  <pre
                    style={{
                      background: '#040711',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem',
                      margin: 0,
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#38bdf8',
                      lineHeight: '1.45',
                      overflowX: 'auto',
                      maxHeight: '160px'
                    }}
                  >
                    {cliOutput}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right-Click Context Menu */}
        {contextMenu.isOpen && (
          <div
            style={{
              position: 'absolute',
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
              zIndex: 10050,
              background: '#090e1a',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '8px',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(6, 182, 212, 0.35)',
              minWidth: '235px',
              padding: '6px',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              animation: 'fadeIn 0.12s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.targetType === 'PORT' ? (
              <>
                {/* Header */}
                <div
                  style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    AKSI KLIK KANAN PORT SFP
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {selectedPort?.portName} (PON #{selectedPort?.portNumber})
                  </div>
                </div>

                {/* 1. Edit Data Port */}
                <button
                  type="button"
                  className="compact-action-item"
                  style={{
                    background: 'rgba(6, 182, 212, 0.18)',
                    color: 'var(--accent-cyan)',
                    fontWeight: 800,
                    borderRadius: '6px'
                  }}
                  onClick={() => {
                    handleStartEditPortWithTarget(contextMenu.slotNumber, contextMenu.portIndex ?? selectedPortIndex);
                  }}
                >
                  <Edit3 size={14} />
                  <span>✏️ Edit Konfigurasi Port</span>
                </button>

                {/* 2. Quick Status Toggle */}
                <div style={{ padding: '2px 4px', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Ganti Status Cepat:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px',
                    padding: '4px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px'
                  }}
                >
                  <button
                    type="button"
                    className="compact-action-item"
                    style={{ fontSize: '0.68rem', padding: '4px 6px', color: '#10b981' }}
                    onClick={() => handleQuickChangePortStatus('UP')}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    <span>Set UP</span>
                  </button>
                  <button
                    type="button"
                    className="compact-action-item"
                    style={{ fontSize: '0.68rem', padding: '4px 6px', color: '#f59e0b' }}
                    onClick={() => handleQuickChangePortStatus('STANDBY')}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                    <span>STANDBY</span>
                  </button>
                  <button
                    type="button"
                    className="compact-action-item"
                    style={{ fontSize: '0.68rem', padding: '4px 6px', color: '#ef4444' }}
                    onClick={() => handleQuickChangePortStatus('LOS_ALARM')}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                    <span>LOS ALM</span>
                  </button>
                  <button
                    type="button"
                    className="compact-action-item"
                    style={{ fontSize: '0.68rem', padding: '4px 6px', color: '#94a3b8' }}
                    onClick={() => handleQuickChangePortStatus('EMPTY')}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }} />
                    <span>EMPTY</span>
                  </button>
                </div>

                {/* 3. Zoom In */}
                {viewMode === 'CHASSIS_OVERVIEW' && (
                  <button
                    type="button"
                    className="compact-action-item"
                    onClick={() => {
                      setViewMode('GTGH_BLADE_ZOOM');
                      setContextMenu((prev) => ({ ...prev, isOpen: false }));
                    }}
                  >
                    <Eye size={14} />
                    <span>🔍 Zoom In Blade GTGH</span>
                  </button>
                )}

                {/* 4. Reboot Port */}
                <button
                  type="button"
                  className="compact-action-item"
                  style={{ color: '#ef4444' }}
                  onClick={() => {
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                    handleRebootPort();
                  }}
                >
                  <RotateCcw size={14} />
                  <span>🔄 Reboot Port PON</span>
                </button>

                {/* 5. Copy CLI */}
                <button
                  type="button"
                  className="compact-action-item"
                  onClick={() => {
                    setContextMenu((prev) => ({ ...prev, isOpen: false }));
                    handleCopyCli();
                  }}
                >
                  <Copy size={14} />
                  <span>📋 Salin Perintah CLI</span>
                </button>
              </>
            ) : (
              <>
                {/* Slot Context Menu */}
                <div
                  style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '2px'
                  }}
                >
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    AKSI KLIK KANAN SLOT
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    Slot {contextMenu.slotNumber}: {currentSlot.cardType}
                  </div>
                </div>

                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '2px 6px' }}>
                  Ganti Tipe Papan / Kartu:
                </div>
                {(['GTGH', 'GTGO', 'SCXN', 'HUVQ', 'BLANK'] as ZteCardType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="compact-action-item"
                    style={{
                      fontWeight: currentSlot.cardType === type ? 800 : 500,
                      color: currentSlot.cardType === type ? 'var(--accent-cyan)' : 'var(--text-primary)'
                    }}
                    onClick={() => handleQuickChangeCardType(contextMenu.slotNumber, type)}
                  >
                    <Cpu size={14} />
                    <span>Set ke {type} {currentSlot.cardType === type ? '✓' : ''}</span>
                  </button>
                ))}

                {currentSlot.cardType === 'GTGH' && viewMode === 'CHASSIS_OVERVIEW' && (
                  <button
                    type="button"
                    className="compact-action-item"
                    onClick={() => {
                      setViewMode('GTGH_BLADE_ZOOM');
                      setContextMenu((prev) => ({ ...prev, isOpen: false }));
                    }}
                  >
                    <Eye size={14} />
                    <span>🔍 Zoom In Blade Ini</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
