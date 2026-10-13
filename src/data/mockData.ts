import {
  MikrotikRouter,
  PPPoEClient,
  OLTDevice,
  UnregisteredONU,
  RegisteredONU,
  GenieACSCPE,
  ODCPoint,
  ODPPoint,
  CableRoute,
  Invoice,
  HotspotVoucher,
  HotspotUser,
  HotspotProfile,
  HotspotSession,
  HotspotReseller,
  HotspotTemplate,
  WhatsAppLog,
  TroubleTicket,
  BandwidthProfile,
  WATemplate,
  VpnAccount,
  VpnServerGateway,
  CloudflareTunnelConfig,
  IngressRule,
  UbuntuGatewaySettings,
  RadiusNasClient,
  RadiusGroupProfile,
  RadiusSessionRecord,
  FreeRadiusServerConfig
} from '../types';

export const INITIAL_PROFILES: BandwidthProfile[] = [
  { id: 'PROF-1', name: 'HOME-20MBPS', rateLimit: '20M/20M', pool: 'pool-pppoe-dhcp', price: 150000, description: 'Paket Pelajar / Rumah Tangga Hemat' },
  { id: 'PROF-2', name: 'HOME-30MBPS', rateLimit: '30M/30M', pool: 'pool-pppoe-dhcp', price: 175000, description: 'Paket Standar Streaming HD' },
  { id: 'PROF-3', name: 'HOME-50MBPS', rateLimit: '50M/50M', pool: 'pool-pppoe-dhcp', price: 250000, description: 'Paket Ultra Fast Gaming & 4K' },
  { id: 'PROF-4', name: 'BIZ-DEDICATED-100MBPS', rateLimit: '100M/100M', pool: 'pool-public-static', price: 1200000, description: 'Dedicated CIR 1:1 Corporate' },
  { id: 'PROF-5', name: 'ISOLIR-PROFILE', rateLimit: '128k/128k', pool: 'pool-isolir-redirect', price: 0, description: 'Profil Isolir Tunggakan Tagihan' }
];

export const INITIAL_WA_TEMPLATES: WATemplate[] = [
  {
    id: 'TMP-1',
    name: 'Reminder Tagihan H-3',
    category: 'TAGIHAN',
    content: 'Halo Kak {nama}, tagihan internet SCORIP periode ini sebesar Rp {total} akan jatuh tempo pada {jatuh_tempo}. Bayar instan via QRIS: {link_bayar}'
  },
  {
    id: 'TMP-2',
    name: 'Kwitansi Lunas Instan',
    category: 'KWITANSI',
    content: 'Terima kasih Kak {nama}! Pembayaran tagihan internet sebesar Rp {total} telah KAMI TERIMA. Unduh bukti lunas resmi di: {link_kwitansi}'
  },
  {
    id: 'TMP-3',
    name: 'Peringatan Isolir Otomatis',
    category: 'ISOLIR',
    content: 'PEMBERITAHUAN ISOLIR: Layanan internet Anda terisolir otomatis karena telah melewati jatuh tempo. Klik untuk aktivasi instan: {link_bayar}'
  },
  {
    id: 'TMP-4',
    name: 'Broadcast Maintenance Jaringan',
    category: 'BROADCAST',
    content: 'Pemberitahuan Pemeliharaan: Akan ada optimalisasi fiber optik pada {tanggal_jam}. Mohon maaf atas ketidaknyamanan sementara.'
  }
];

export const INITIAL_ROUTERS: MikrotikRouter[] = [
  {
    id: 'MK-POP-PUSAT',
    name: 'CCR2004-POP-PUSAT-BNG',
    ip: '103.147.220.1',
    rosVersion: 'RouterOS v7.16 (FreeRADIUS Enabled)',
    type: 'CCR2004',
    cpuLoad: 24,
    ramUsage: 38,
    uptime: '48 days 14:22:09',
    activePppoe: 842,
    status: 'ONLINE',
    apiPort: 8728
  },
  {
    id: 'MK-POP-TIMUR',
    name: 'RB4011-POP-TIMUR-DIST',
    ip: '103.147.221.1',
    rosVersion: 'RouterOS v7.15.2 (Userman v7)',
    type: 'RB4011',
    cpuLoad: 41,
    ramUsage: 56,
    uptime: '19 days 08:05:43',
    activePppoe: 318,
    status: 'ONLINE',
    apiPort: 8728
  },
  {
    id: 'MK-POP-SELATAN',
    name: 'CHR-CLOUD-GATEWAY-BACKUP',
    ip: '103.147.222.254',
    rosVersion: 'RouterOS v7.16 (BGP Multi-Homing)',
    type: 'CHR-Cloud',
    cpuLoad: 12,
    ramUsage: 22,
    uptime: '112 days 01:10:12',
    activePppoe: 195,
    status: 'ONLINE',
    apiPort: 8728
  }
];

export const INITIAL_OLTS: OLTDevice[] = [
  {
    id: 'OLT-ZTE-C320-KOTA',
    name: 'OLT ZTE C320 (Chassis POP-1)',
    brand: 'ZTE',
    model: 'ZTE C320 GTGH (16-PON GPON)',
    ip: '10.20.1.2',
    totalPonPorts: 16,
    activePonPorts: 12,
    totalOnu: 684,
    unregisteredCount: 2,
    status: 'ONLINE',
    uptime: '84 days 19:40:11',
    temperature: 42
  },
  {
    id: 'OLT-HUAWEI-MA5608T',
    name: 'OLT Huawei MA5608T (POP-Timur)',
    brand: 'HUAWEI',
    model: 'SmartAX MA5608T GPBD (8-PON)',
    ip: '10.20.2.2',
    totalPonPorts: 8,
    activePonPorts: 6,
    totalOnu: 392,
    unregisteredCount: 1,
    status: 'ONLINE',
    uptime: '35 days 04:12:00',
    temperature: 39
  },
  {
    id: 'OLT-VSOL-V1600G',
    name: 'OLT VSOL V1600G1 (POP-Selatan)',
    brand: 'VSOL',
    model: 'VSOL V1600G1-B GPON Pizza Box (8-PON)',
    ip: '10.20.3.2',
    totalPonPorts: 8,
    activePonPorts: 5,
    totalOnu: 279,
    unregisteredCount: 0,
    status: 'ONLINE',
    uptime: '62 days 11:25:31',
    temperature: 46
  }
];

export const INITIAL_UNREGISTERED_ONUS: UnregisteredONU[] = [
  {
    sn: 'ZTEGC7A91280',
    brand: 'ZTE (F670L DualBand)',
    ponPort: 'gpon-olt_1/1/4',
    oltId: 'OLT-ZTE-C320-KOTA',
    detectedAt: '2026-09-28 21:40:12'
  },
  {
    sn: 'HWTC4A12B890',
    brand: 'Huawei (HG8245H5)',
    ponPort: '0/1/3',
    oltId: 'OLT-HUAWEI-MA5608T',
    detectedAt: '2026-09-28 21:44:30'
  }
];

export const INITIAL_REGISTERED_ONUS: RegisteredONU[] = [
  {
    id: 'ONU-001',
    sn: 'ZTEGC5B81109',
    customerName: 'Bambang Supriyadi',
    pppoeUser: 'bambang-ftth',
    oltId: 'OLT-ZTE-C320-KOTA',
    ponPort: 'gpon-olt_1/1/1:2',
    rxPowerDbm: -18.72,
    txPowerDbm: 2.35,
    distanceKm: 1.42,
    status: 'ONLINE',
    cpeModel: 'ZTE F609 v9',
    odpCode: 'ODP-KUTA-01'
  },
  {
    id: 'ONU-002',
    sn: 'HWTC881239AB',
    customerName: 'Siti Rahmawati',
    pppoeUser: 'siti-kuta',
    oltId: 'OLT-ZTE-C320-KOTA',
    ponPort: 'gpon-olt_1/1/1:3',
    rxPowerDbm: -21.40,
    txPowerDbm: 2.11,
    distanceKm: 2.15,
    status: 'ONLINE',
    cpeModel: 'Huawei HG8245H',
    odpCode: 'ODP-KUTA-01'
  },
  {
    id: 'ONU-003',
    sn: 'ZTEGC9921477',
    customerName: 'PT Mandiri Mitra Abadi',
    pppoeUser: 'office-mandiri',
    oltId: 'OLT-ZTE-C320-KOTA',
    ponPort: 'gpon-olt_1/1/2:1',
    rxPowerDbm: -16.85,
    txPowerDbm: 2.80,
    distanceKm: 0.85,
    status: 'ONLINE',
    cpeModel: 'ZTE F670L Wi-Fi 6',
    odpCode: 'ODP-KUTA-02'
  },
  {
    id: 'ONU-004',
    sn: 'VSOL418902CA',
    customerName: 'I Made Wirawan',
    pppoeUser: 'wirawan-net',
    oltId: 'OLT-VSOL-V1600G',
    ponPort: 'EPON0/2:4',
    rxPowerDbm: -28.90, // Kritis
    txPowerDbm: 1.45,
    distanceKm: 3.82,
    status: 'ONLINE',
    cpeModel: 'VSOL V2804AX',
    odpCode: 'ODP-LEGIAN-01'
  },
  {
    id: 'ONU-005',
    sn: 'ZTEGC3399120',
    customerName: 'Ahmad Fauzi (Warung Kopi)',
    pppoeUser: 'fauzi-warkop',
    oltId: 'OLT-ZTE-C320-KOTA',
    ponPort: 'gpon-olt_1/1/3:7',
    rxPowerDbm: -40.00, // LOS
    txPowerDbm: 0.00,
    distanceKm: 2.94,
    status: 'LOS',
    cpeModel: 'ZTE F609',
    odpCode: 'ODP-LEGIAN-02'
  }
];

export const INITIAL_GENIEACS_CPES: GenieACSCPE[] = [
  {
    deviceId: '202bc8-F670L-ZTEGC7A91280',
    serialNumber: 'ZTEGC7A91280',
    customerName: 'Bambang Supriyadi',
    pppoeUser: 'bambang-ftth',
    modelName: 'ZXHN F670L',
    hardwareVersion: 'V2.0.0',
    softwareVersion: 'V2.0.10P1T1',
    ssid24: 'Bambang_Home_2.4G',
    ssid5: 'Bambang_Home_5G',
    wifiPassword: 'indonesiahebat2026',
    channel24: 6,
    isRadioOn: true,
    connectedClients: 8,
    rxOpticalDbm: -18.72,
    lastInform: '1 menit yang lalu',
    wanIp: '100.64.12.84'
  },
  {
    deviceId: '00259e-HG8245H5-HWTC881239AB',
    serialNumber: 'HWTC881239AB',
    customerName: 'Siti Rahmawati',
    pppoeUser: 'siti-kuta',
    modelName: 'EchoLife HG8245H5',
    hardwareVersion: '1130.A',
    softwareVersion: 'V5R019C00S100',
    ssid24: 'Siti_FiberFast',
    ssid5: 'Siti_FiberFast_5G',
    wifiPassword: 'rahasiarumah123',
    channel24: 1,
    isRadioOn: true,
    connectedClients: 4,
    rxOpticalDbm: -21.40,
    lastInform: '3 menit yang lalu',
    wanIp: '100.64.12.91'
  },
  {
    deviceId: '202bc8-F609-ZTEGC9921477',
    serialNumber: 'ZTEGC9921477',
    customerName: 'PT Mandiri Mitra Abadi',
    pppoeUser: 'office-mandiri',
    modelName: 'ZXHN F609',
    hardwareVersion: 'V9.0',
    softwareVersion: 'V9.0.2P1N1',
    ssid24: 'MANDIRI_OFFICE_GUEST',
    wifiPassword: 'mandirijaya2026',
    channel24: 11,
    isRadioOn: true,
    connectedClients: 19,
    rxOpticalDbm: -16.85,
    lastInform: 'Just now',
    wanIp: '103.147.220.45'
  }
];

// Peta GIS: ODC Points
export const INITIAL_ODCS: ODCPoint[] = [
  {
    id: 'ODC-KUTA-PUSAT',
    name: 'ODC-01 Kuta Sentral',
    code: 'ODC-KTA-01',
    lat: -8.72125,
    lng: 115.17450,
    capacityPorts: 24,
    usedPorts: 18,
    splitterRatio: '1:4 Primer Modular',
    coverageArea: 'Jalan Pantai Kuta, Raya Kuta Utara'
  },
  {
    id: 'ODC-LEGIAN-TIMUR',
    name: 'ODC-02 Legian Raya',
    code: 'ODC-LGN-02',
    lat: -8.71180,
    lng: 115.17890,
    capacityPorts: 24,
    usedPorts: 14,
    splitterRatio: '1:4 Primer Modular',
    coverageArea: 'Jalan Padma, Legian Tengah, Dewi Sri'
  }
];

// Peta GIS: ODP Points
export const INITIAL_ODPS: ODPPoint[] = [
  {
    id: 'ODP-01',
    odcId: 'ODC-KUTA-PUSAT',
    name: 'ODP-KUTA-01 (Tiang Telkom 14)',
    code: 'ODP-KTA-01',
    lat: -8.72310,
    lng: 115.17320,
    capacityPorts: 8,
    usedPorts: 7,
    avgDbm: -19.2,
    status: 'NORMAL',
    tubeColor: 'Biru (Blue)',
    coreNumber: 1
  },
  {
    id: 'ODP-02',
    odcId: 'ODC-KUTA-PUSAT',
    name: 'ODP-KUTA-02 (Ruko Bakso Merdeka)',
    code: 'ODP-KTA-02',
    lat: -8.72010,
    lng: 115.17610,
    capacityPorts: 8,
    usedPorts: 8,
    avgDbm: -18.5,
    status: 'FULL',
    tubeColor: 'Oranye (Orange)',
    coreNumber: 2
  },
  {
    id: 'ODP-03',
    odcId: 'ODC-KUTA-PUSAT',
    name: 'ODP-KUTA-03 (Depan Villa Senja)',
    code: 'ODP-KTA-03',
    lat: -8.72480,
    lng: 115.17700,
    capacityPorts: 16,
    usedPorts: 11,
    avgDbm: -20.8,
    status: 'NORMAL',
    tubeColor: 'Hijau (Green)',
    coreNumber: 3
  },
  {
    id: 'ODP-04',
    odcId: 'ODC-LEGIAN-TIMUR',
    name: 'ODP-LEGIAN-01 (Gang Sandat 3)',
    code: 'ODP-LGN-01',
    lat: -8.71350,
    lng: 115.17650,
    capacityPorts: 8,
    usedPorts: 6,
    avgDbm: -28.4,
    status: 'HIGH_ATTENUATION', // Redaman tinggi
    tubeColor: 'Cokelat (Brown)',
    coreNumber: 4
  },
  {
    id: 'ODP-05',
    odcId: 'ODC-LEGIAN-TIMUR',
    name: 'ODP-LEGIAN-02 (Depan Circle K Padma)',
    code: 'ODP-LGN-02',
    lat: -8.70990,
    lng: 115.18120,
    capacityPorts: 16,
    usedPorts: 9,
    avgDbm: -22.1,
    status: 'NORMAL',
    tubeColor: 'Abu-abu (Slate)',
    coreNumber: 5
  }
];

// Rute Kabel Fiber Optik (GIS Polylines)
export const INITIAL_CABLE_ROUTES: CableRoute[] = [
  {
    id: 'CABLE-FEEDER-01',
    name: 'Kabel Feeder Utama 24 Core (POP Pusat -> ODC Kuta)',
    type: 'FEEDER',
    color: '#06b6d4', // Cyan
    coreCount: 24,
    totalLengthMeters: 1450,
    coordinates: [
      [-8.71800, 115.17100],
      [-8.71950, 115.17250],
      [-8.72125, 115.17450]
    ]
  },
  {
    id: 'CABLE-FEEDER-02',
    name: 'Kabel Feeder 24 Core (POP Pusat -> ODC Legian)',
    type: 'FEEDER',
    color: '#3b82f6', // Electric Blue
    coreCount: 24,
    totalLengthMeters: 1820,
    coordinates: [
      [-8.71800, 115.17100],
      [-8.71500, 115.17380],
      [-8.71180, 115.17890]
    ]
  },
  {
    id: 'CABLE-DIST-01',
    name: 'Distribusi 12 Core (ODC Kuta -> ODP-01 & ODP-02)',
    type: 'DISTRIBUTION',
    color: '#10b981', // Emerald
    coreCount: 12,
    totalLengthMeters: 620,
    coordinates: [
      [-8.72125, 115.17450],
      [-8.72240, 115.17380],
      [-8.72310, 115.17320],
      [-8.72010, 115.17610]
    ]
  },
  {
    id: 'CABLE-DIST-02',
    name: 'Distribusi 12 Core (ODC Legian -> ODP Legian 01)',
    type: 'DISTRIBUTION',
    color: '#a855f7', // Purple
    coreCount: 12,
    totalLengthMeters: 740,
    coordinates: [
      [-8.71180, 115.17890],
      [-8.71260, 115.17740],
      [-8.71350, 115.17650]
    ]
  }
];

export const INITIAL_CLIENTS: PPPoEClient[] = [
  {
    id: 'CLI-001',
    username: 'bambang-ftth',
    fullName: 'Bambang Supriyadi',
    phone: '081234567890',
    address: 'Jl. Pantai Kuta No. 42B',
    profile: 'HOME-50MBPS',
    ipAddress: '100.64.12.84',
    macAddress: 'CC:B4:98:12:4A:10',
    routerId: 'MK-POP-PUSAT',
    odpId: 'ODP-01',
    odpPort: 1,
    status: 'ACTIVE',
    uptime: '14d 07:11:32',
    downloadBytes: '142.8 GB',
    uploadBytes: '28.4 GB',
    monthlyFee: 250000,
    fupQuotaGb: 500,
    usedQuotaGb: 171.2,
    ontSerial: 'ZTEGC5B81109'
  },
  {
    id: 'CLI-002',
    username: 'siti-kuta',
    fullName: 'Siti Rahmawati',
    phone: '081398765432',
    address: 'Jl. Kartika Plaza Gg. Pudak 8',
    profile: 'HOME-30MBPS',
    ipAddress: '100.64.12.91',
    macAddress: '48:D2:24:99:C1:DF',
    routerId: 'MK-POP-PUSAT',
    odpId: 'ODP-01',
    odpPort: 2,
    status: 'ACTIVE',
    uptime: '22d 18:02:19',
    downloadBytes: '94.2 GB',
    uploadBytes: '14.1 GB',
    monthlyFee: 175000,
    fupQuotaGb: 350,
    usedQuotaGb: 108.3,
    ontSerial: 'HWTC881239AB'
  },
  {
    id: 'CLI-003',
    username: 'office-mandiri',
    fullName: 'PT Mandiri Mitra Abadi',
    phone: '082155443322',
    address: 'Komp. Ruko Kuta Square Blok C-2',
    profile: 'BIZ-DEDICATED-100MBPS',
    ipAddress: '103.147.220.45',
    macAddress: 'D4:6E:0E:55:1A:BC',
    routerId: 'MK-POP-PUSAT',
    odpId: 'ODP-02',
    odpPort: 1,
    status: 'ACTIVE',
    uptime: '48d 14:19:00',
    downloadBytes: '1.48 TB',
    uploadBytes: '920 GB',
    monthlyFee: 1200000,
    ontSerial: 'ZTEGC9921477'
  },
  {
    id: 'CLI-004',
    username: 'wirawan-net',
    fullName: 'I Made Wirawan',
    phone: '085711223344',
    address: 'Jl. Padma No. 88, Legian',
    profile: 'HOME-20MBPS',
    ipAddress: '100.64.15.11',
    macAddress: '00:1A:2B:3C:4D:5E',
    routerId: 'MK-POP-TIMUR',
    odpId: 'ODP-04',
    odpPort: 4,
    status: 'ISOLATED', // Terisolir belum bayar
    uptime: '0d 00:00:00',
    downloadBytes: '12.1 GB',
    uploadBytes: '2.4 GB',
    monthlyFee: 150000,
    fupQuotaGb: 200,
    usedQuotaGb: 14.5,
    ontSerial: 'VSOL418902CA'
  },
  {
    id: 'CLI-005',
    username: 'fauzi-warkop',
    fullName: 'Ahmad Fauzi (Warkop Senja)',
    phone: '087812908871',
    address: 'Jl. Dewi Sri No. 19',
    profile: 'HOME-30MBPS',
    ipAddress: '100.64.12.102',
    macAddress: 'E8:65:D4:77:21:0B',
    routerId: 'MK-POP-PUSAT',
    odpId: 'ODP-05',
    odpPort: 3,
    status: 'OFFLINE', // LOS
    uptime: '0d 00:00:00',
    downloadBytes: '44.0 GB',
    uploadBytes: '6.5 GB',
    monthlyFee: 175000,
    ontSerial: 'ZTEGC3399120'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0901',
    invoiceNumber: 'INV/202609/001',
    customerName: 'Bambang Supriyadi',
    phone: '081234567890',
    pppoeUser: 'bambang-ftth',
    planName: 'Paket Ultra Fast Fiber 50 Mbps',
    subtotal: 250000,
    taxPpn: 27500,
    totalAmount: 277500,
    dueDate: '2026-10-05',
    status: 'UNPAID'
  },
  {
    id: 'INV-2026-0902',
    invoiceNumber: 'INV/202609/002',
    customerName: 'Siti Rahmawati',
    phone: '081398765432',
    pppoeUser: 'siti-kuta',
    planName: 'Paket Super Home 30 Mbps',
    subtotal: 175000,
    taxPpn: 19250,
    totalAmount: 194250,
    dueDate: '2026-10-05',
    status: 'PAID',
    paymentMethod: 'QRIS',
    paidAt: '2026-09-28 14:12:00'
  },
  {
    id: 'INV-2026-0903',
    invoiceNumber: 'INV/202609/003',
    customerName: 'PT Mandiri Mitra Abadi',
    phone: '082155443322',
    pppoeUser: 'office-mandiri',
    planName: 'Dedicated Corporate 100 Mbps 1:1',
    subtotal: 1200000,
    taxPpn: 132000,
    totalAmount: 1332000,
    dueDate: '2026-10-01',
    status: 'PAID',
    paymentMethod: 'VA_BCA',
    paidAt: '2026-09-27 10:20:00'
  },
  {
    id: 'INV-2026-0904',
    invoiceNumber: 'INV/202609/004',
    customerName: 'I Made Wirawan',
    phone: '085711223344',
    pppoeUser: 'wirawan-net',
    planName: 'Paket Hemat Home 20 Mbps',
    subtotal: 150000,
    taxPpn: 16500,
    totalAmount: 166500,
    dueDate: '2026-09-20',
    status: 'OVERDUE' // Terisolir
  }
];

export const INITIAL_VOUCHERS: HotspotVoucher[] = [
  { code: 'SCORIP-7821', profile: 'HS-2JAM-10MBPS', duration: '2 Jam', price: 3000, createdAt: '2026-09-28 10:00', status: 'UNUSED' },
  { code: 'SCORIP-9942', profile: 'HS-2JAM-10MBPS', duration: '2 Jam', price: 3000, createdAt: '2026-09-28 10:00', status: 'UNUSED' },
  { code: 'SCORIP-3318', profile: 'HS-1HARI-15MBPS', duration: '24 Jam', price: 10000, createdAt: '2026-09-28 10:00', status: 'USED' },
  { code: 'SCORIP-5520', profile: 'HS-1HARI-15MBPS', duration: '24 Jam', price: 10000, createdAt: '2026-09-28 10:00', status: 'UNUSED' },
  { code: 'SCORIP-1188', profile: 'HS-7HARI-20MBPS', duration: '7 Hari', price: 35000, createdAt: '2026-09-28 10:00', status: 'UNUSED' }
];

export const INITIAL_WA_LOGS: WhatsAppLog[] = [
  {
    id: 'WA-001',
    recipientPhone: '081234567890',
    recipientName: 'Bambang Supriyadi',
    category: 'TAGIHAN',
    message: 'Halo Bpk Bambang, tagihan internet SCORIP periode Oktober Rp277.500 telah terbit. Bayar instan via QRIS: https://pay.scorip.net/inv/001',
    status: 'DELIVERED',
    timestamp: '2026-09-28 09:00:15'
  },
  {
    id: 'WA-002',
    recipientPhone: '081398765432',
    recipientName: 'Siti Rahmawati',
    category: 'KWITANSI',
    message: 'Terima kasih Ibu Siti! Pembayaran tagihan internet Rp194.250 via QRIS telah DITERIMA. Unduh kwitansi: https://pay.scorip.net/receipt/002',
    status: 'READ',
    timestamp: '2026-09-28 14:12:05'
  },
  {
    id: 'WA-003',
    recipientPhone: '085711223344',
    recipientName: 'I Made Wirawan',
    category: 'ISOLIR',
    message: 'PEMBERITAHUAN ISOLIR: Layanan internet Anda terisolir otomatis karena telah melewati jatuh tempo. Klik untuk aktivasi instan: https://pay.scorip.net/inv/004',
    status: 'READ',
    timestamp: '2026-09-21 00:05:00'
  }
];

export const INITIAL_TICKETS: TroubleTicket[] = [
  {
    id: 'TCK-2026-01',
    ticketNumber: 'TCK-9901',
    customerName: 'Ahmad Fauzi (Warkop Senja)',
    pppoeUser: 'fauzi-warkop',
    phone: '087812908871',
    odpCode: 'ODP-LGN-02',
    title: 'Indikator LOS Merah Berkedip pada Modem',
    description: 'Koneksi putus total sejak sore tadi, lampu PON mati dan LOS merah kedip cepat. Diduga kabel dropcore tertabrak truk sampah.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    technicianName: 'Wayan Putra (Teknisi 02)',
    initialDbm: -40.0,
    createdAt: '2026-09-28 18:30:00'
  },
  {
    id: 'TCK-2026-02',
    ticketNumber: 'TCK-9902',
    customerName: 'I Made Wirawan',
    pppoeUser: 'wirawan-net',
    phone: '085711223344',
    odpCode: 'ODP-LGN-01',
    title: 'Redaman Optik Kritis (-28.4 dBm) & Sering RTO',
    description: 'Sinyal optical rx terdeteksi tinggi di ODP-LEGIAN-01. Perlu pengecekan bending kabel di tiang tikungan.',
    priority: 'MEDIUM',
    status: 'OPEN',
    initialDbm: -28.4,
    createdAt: '2026-09-28 20:15:00'
  }
];

export const INITIAL_HOTSPOT_PROFILES: HotspotProfile[] = [
  {
    id: 'HPROF-1',
    name: 'HS-2JAM-10MBPS',
    rateLimit: '5M/10M',
    sharedUsers: 1,
    validity: '2 Jam',
    gracePeriod: '5m',
    price: 3000,
    resellerPrice: 2500,
    userLock: 'MAC',
    addressPool: 'hs-pool-1',
    parentQueue: 'hotspot-all',
    description: 'Voucher browsing & medsos kilat 2 jam'
  },
  {
    id: 'HPROF-2',
    name: 'HS-1HARI-15MBPS',
    rateLimit: '8M/15M',
    sharedUsers: 1,
    validity: '24 Jam',
    gracePeriod: '15m',
    price: 10000,
    resellerPrice: 8500,
    userLock: 'MAC',
    addressPool: 'hs-pool-1',
    parentQueue: 'hotspot-all',
    description: 'Akses harian unlimited tanpa kuota'
  },
  {
    id: 'HPROF-3',
    name: 'HS-7HARI-20MBPS',
    rateLimit: '10M/20M',
    sharedUsers: 1,
    validity: '7 Hari',
    gracePeriod: '30m',
    price: 35000,
    resellerPrice: 30000,
    userLock: 'MAC',
    addressPool: 'hs-pool-1',
    parentQueue: 'hotspot-all',
    description: 'Paket mingguan hemat kost & warkop'
  },
  {
    id: 'HPROF-4',
    name: 'HS-30HARI-25MBPS',
    rateLimit: '15M/25M',
    sharedUsers: 1,
    validity: '30 Hari',
    gracePeriod: '1h',
    price: 100000,
    resellerPrice: 85000,
    userLock: 'MAC',
    addressPool: 'hs-pool-1',
    parentQueue: 'hotspot-all',
    description: 'Paket bulanan personal hotspot'
  },
  {
    id: 'HPROF-5',
    name: 'VIP-UNLIMITED-50MBPS',
    rateLimit: '25M/50M',
    sharedUsers: 2,
    validity: '30 Hari',
    gracePeriod: '2h',
    price: 150000,
    resellerPrice: 130000,
    userLock: 'OFF',
    addressPool: 'hs-pool-vip',
    parentQueue: 'hotspot-vip',
    description: 'Multi-device 2 gadget simultan super kencang'
  }
];

export const INITIAL_HOTSPOT_USERS: HotspotUser[] = [
  {
    id: 'HSU-001',
    username: 'SCORIP-7821',
    password: '782',
    profile: 'HS-2JAM-10MBPS',
    duration: '2 Jam',
    status: 'UNUSED',
    price: 3000,
    reseller: 'Warkop Senja 24 Jam',
    createdAt: '2026-10-12 10:00',
    comment: 'Batch #HS-2610-01'
  },
  {
    id: 'HSU-002',
    username: 'SCORIP-9942',
    password: '994',
    profile: 'HS-2JAM-10MBPS',
    duration: '2 Jam',
    status: 'UNUSED',
    price: 3000,
    reseller: 'Berkah Cell & PPOB',
    createdAt: '2026-10-12 10:00',
    comment: 'Batch #HS-2610-01'
  },
  {
    id: 'HSU-003',
    username: 'SCORIP-3318',
    password: '331',
    profile: 'HS-1HARI-15MBPS',
    duration: '24 Jam',
    uptime: '03:42:15',
    timeLeft: '20j 17m',
    bytesIn: '340 MB',
    bytesOut: '1.8 GB',
    ipAddress: '10.5.50.42',
    macAddress: '74:D0:2B:6A:11:09',
    status: 'ACTIVE',
    price: 10000,
    reseller: 'Warkop Senja 24 Jam',
    createdAt: '2026-10-12 08:30',
    comment: 'Aktif di AP-WARKOP-01'
  },
  {
    id: 'HSU-004',
    username: 'SCORIP-5520',
    password: '552',
    profile: 'HS-1HARI-15MBPS',
    duration: '24 Jam',
    status: 'UNUSED',
    price: 10000,
    reseller: 'Toko Kelontong Bu Siti',
    createdAt: '2026-10-12 11:15',
    comment: 'Batch #HS-2610-02'
  },
  {
    id: 'HSU-005',
    username: 'SCORIP-1188',
    password: '118',
    profile: 'HS-7HARI-20MBPS',
    duration: '7 Hari',
    uptime: '2d 04:12:00',
    timeLeft: '4d 19h',
    bytesIn: '2.4 GB',
    bytesOut: '18.2 GB',
    ipAddress: '10.5.50.88',
    macAddress: 'F8:E0:79:33:41:9A',
    status: 'ACTIVE',
    price: 35000,
    reseller: 'Warnet & Game Center StarNet',
    createdAt: '2026-10-10 14:00',
    comment: 'Paket Mingguan Pelanggan Kost'
  },
  {
    id: 'HSU-006',
    username: 'tamu-vip-office',
    password: 'vipaccess2026',
    profile: 'VIP-UNLIMITED-50MBPS',
    duration: '30 Hari',
    uptime: '14:20:05',
    timeLeft: '29 Hari',
    bytesIn: '1.2 GB',
    bytesOut: '8.4 GB',
    ipAddress: '10.5.50.15',
    macAddress: 'E4:5F:01:BC:90:55',
    status: 'ACTIVE',
    price: 150000,
    reseller: 'Kantor Pusat NOC',
    createdAt: '2026-10-01 09:00',
    comment: 'Tamu VIP Direksi & Audit'
  },
  {
    id: 'HSU-007',
    username: 'SCORIP-8820',
    password: '882',
    profile: 'HS-2JAM-10MBPS',
    duration: '2 Jam',
    status: 'USED',
    price: 3000,
    reseller: 'Berkah Cell & PPOB',
    createdAt: '2026-10-11 15:00',
    expiredAt: '2026-10-11 17:00',
    comment: 'Selesai digunakan'
  },
  {
    id: 'HSU-008',
    username: 'SCORIP-4412',
    password: '441',
    profile: 'HS-2JAM-10MBPS',
    duration: '2 Jam',
    status: 'EXPIRED',
    price: 3000,
    reseller: 'Warkop Senja 24 Jam',
    createdAt: '2026-10-09 10:00',
    expiredAt: '2026-10-09 12:00',
    comment: 'Expired masa aktif'
  }
];

export const INITIAL_HOTSPOT_SESSIONS: HotspotSession[] = [
  {
    id: 'SESS-01',
    username: 'SCORIP-3318',
    ipAddress: '10.5.50.42',
    macAddress: '74:D0:2B:6A:11:09',
    hostname: 'Samsung-Galaxy-A54',
    uptime: '03:42:15',
    bytesIn: '340 MB',
    bytesOut: '1.8 GB',
    timeLeft: '20j 17m',
    profile: 'HS-1HARI-15MBPS',
    routerName: 'CCR2004-CORE-GATEWAY',
    loginBy: 'HTTP-CHAP',
    startedAt: '2026-10-12 18:30:00'
  },
  {
    id: 'SESS-02',
    username: 'SCORIP-1188',
    ipAddress: '10.5.50.88',
    macAddress: 'F8:E0:79:33:41:9A',
    hostname: 'iPhone-14-Pro',
    uptime: '2d 04:12:00',
    bytesIn: '2.4 GB',
    bytesOut: '18.2 GB',
    timeLeft: '4d 19h',
    profile: 'HS-7HARI-20MBPS',
    routerName: 'CCR2004-CORE-GATEWAY',
    loginBy: 'QR-CODE',
    startedAt: '2026-10-10 14:00:00'
  },
  {
    id: 'SESS-03',
    username: 'tamu-vip-office',
    ipAddress: '10.5.50.15',
    macAddress: 'E4:5F:01:BC:90:55',
    hostname: 'MacBook-Pro-M2',
    uptime: '14:20:05',
    bytesIn: '1.2 GB',
    bytesOut: '8.4 GB',
    timeLeft: '29 Hari',
    profile: 'VIP-UNLIMITED-50MBPS',
    routerName: 'CCR2004-CORE-GATEWAY',
    loginBy: 'COOKIE',
    startedAt: '2026-10-12 08:23:04'
  },
  {
    id: 'SESS-04',
    username: 'HS-WARKOP-FAUZI',
    ipAddress: '10.5.50.63',
    macAddress: '2C:54:CF:89:12:B4',
    hostname: 'Redmi-Note-12',
    uptime: '01:15:32',
    bytesIn: '185 MB',
    bytesOut: '940 MB',
    timeLeft: '44m 28s',
    profile: 'HS-2JAM-10MBPS',
    routerName: 'RB4011-DIST-LEGIAN',
    loginBy: 'HTTP-CHAP',
    startedAt: '2026-10-12 21:00:00'
  }
];

export const INITIAL_HOTSPOT_RESELLERS: HotspotReseller[] = [
  {
    id: 'RSL-01',
    name: 'Warkop Senja 24 Jam',
    ownerName: 'Ahmad Fauzi',
    phone: '081234567890',
    address: 'Jl. Raya Legian No. 18, Depan Lapangan RT 02',
    balance: 450000,
    commissionPercent: 15,
    totalVouchersSold: 245,
    totalSalesRp: 1250000,
    status: 'ACTIVE',
    joinedAt: '2026-06-15'
  },
  {
    id: 'RSL-02',
    name: 'Berkah Cell & PPOB',
    ownerName: 'Doni Pratama',
    phone: '081398765432',
    address: 'Ruko Simpang Lima Blok B-3, Kuta',
    balance: 820000,
    commissionPercent: 12,
    totalVouchersSold: 512,
    totalSalesRp: 2680000,
    status: 'ACTIVE',
    joinedAt: '2026-05-10'
  },
  {
    id: 'RSL-03',
    name: 'Toko Kelontong Bu Siti',
    ownerName: 'Siti Rahmawati',
    phone: '085711223344',
    address: 'Perum Kuta Permai Blok C No. 4',
    balance: 150000,
    commissionPercent: 10,
    totalVouchersSold: 120,
    totalSalesRp: 620000,
    status: 'ACTIVE',
    joinedAt: '2026-08-01'
  },
  {
    id: 'RSL-04',
    name: 'Warnet & Game Center StarNet',
    ownerName: 'Hendra Wijaya',
    phone: '082199887766',
    address: 'Jl. Sunset Road Gang Mawar No. 12',
    balance: 1250000,
    commissionPercent: 15,
    totalVouchersSold: 890,
    totalSalesRp: 5400000,
    status: 'ACTIVE',
    joinedAt: '2026-03-20'
  }
];

export const INITIAL_HOTSPOT_TEMPLATES: HotspotTemplate[] = [
  {
    id: 'TPL-01',
    name: 'Struk Kasir Mini Thermal 58mm',
    type: 'THERMAL_58MM',
    isDefault: true,
    headerTitle: 'SCORIP HOTSPOT NET',
    subHeader: 'Koneksi Internet Cepat & Stabil - Jl. Pantai Kuta No. 42B, Bali',
    footerNote: 'Buka browser http://hotspot.scorip.net - CS WA: 0812-3456-7890',
    showQrCode: true,
    showPrice: true,
    showValidity: true,
    showReseller: true,
    accentColor: '#06b6d4'
  },
  {
    id: 'TPL-02',
    name: 'Struk Kasir POS Lebar 80mm',
    type: 'THERMAL_80MM',
    isDefault: false,
    headerTitle: 'SCORIP FIBER & HOTSPOT NETWORK',
    subHeader: 'Internet Super Cepat Tanpa Batas Kuota - 24 Jam Non-Stop',
    footerNote: 'Scan QR Code langsung terhubung otomatis tanpa ketik!',
    showQrCode: true,
    showPrice: true,
    showValidity: true,
    showReseller: true,
    accentColor: '#10b981'
  },
  {
    id: 'TPL-03',
    name: 'Lembar Kupon Kartu A4 (24-in-1)',
    type: 'A4_SHEET',
    isDefault: false,
    headerTitle: 'SCORIP HOTSPOT VOUCHER',
    subHeader: 'Kartu Internet Gesek / Potong Praktis',
    footerNote: 'Gunakan sesuai masa aktif yang tertera.',
    showQrCode: true,
    showPrice: true,
    showValidity: true,
    showReseller: false,
    accentColor: '#8b5cf6'
  },
  {
    id: 'TPL-04',
    name: 'Responsive MikroTik Captive Portal',
    type: 'LOGIN_PAGE',
    isDefault: false,
    headerTitle: 'Selamat Datang di SCORIP Free Wi-Fi',
    subHeader: 'Masukkan Kode Voucher atau Scan Barcode untuk Berselancar',
    footerNote: 'Butuh bantuan? Hubungi kasir atau CS di 0812-3456-7890',
    showQrCode: true,
    showPrice: false,
    showValidity: false,
    showReseller: true,
    accentColor: '#06b6d4'
  }
];

export const INITIAL_VPN_ACCOUNTS: VpnAccount[] = [
  {
    id: 'VPN-01',
    name: 'Remote Winbox CCR2004 Core',
    username: 'rw-ccr2004-core',
    password: 'vPass_9921#Core',
    protocol: 'L2TP_IPSEC',
    serverHost: 'vpn.scorip.net',
    serverPort: 1701,
    assignedIp: '10.255.0.10',
    remoteSubnet: '192.168.10.0/24',
    publicPortWinbox: 18291,
    internalPortWinbox: 8291,
    publicPortApi: 18728,
    internalPortApi: 8728,
    publicPortWeb: 18080,
    internalPortWeb: 80,
    status: 'CONNECTED',
    uptime: '14d 08:33:12',
    bytesIn: '4.2 GB',
    bytesOut: '18.5 GB',
    routerName: 'CCR2004-16G-2S+ Core POP',
    description: 'Akses Remote Winbox & API Router Pusat tanpa IP Publik',
    createdAt: '2026-06-01'
  },
  {
    id: 'VPN-02',
    name: 'WireGuard Inter-Branch OLT Site',
    username: 'wg-olt-ubud',
    protocol: 'WIREGUARD',
    serverHost: 'wg.scorip.net',
    serverPort: 51820,
    assignedIp: '10.255.10.2',
    remoteSubnet: '172.16.20.0/24',
    publicPortWinbox: 18292,
    internalPortWinbox: 8291,
    publicPortApi: 18729,
    internalPortApi: 8728,
    status: 'CONNECTED',
    uptime: '42d 19:40:05',
    lastHandshake: '18s lalu',
    bytesIn: '89.4 GB',
    bytesOut: '112.7 GB',
    routerName: 'RB4011-POP-Ubud',
    description: 'Site-to-site Tunnel WireGuard Uplink POP OLT Ubud',
    publicKey: 'wG71NOC94+71pLs+AbcDefGh123456789XyZ=',
    endpoint: '103.144.18.5:51820',
    createdAt: '2026-05-15'
  },
  {
    id: 'VPN-03',
    name: 'Remote Winbox CHR Cloud Radius',
    username: 'rw-chr-cloud',
    password: 'sPass_8812#Cloud',
    protocol: 'SSTP',
    serverHost: 'vpn.scorip.net',
    serverPort: 443,
    assignedIp: '10.255.0.25',
    publicPortWinbox: 18293,
    internalPortWinbox: 8291,
    publicPortWeb: 18443,
    internalPortWeb: 443,
    status: 'CONNECTED',
    uptime: '60d 02:11:00',
    bytesIn: '15.8 GB',
    bytesOut: '22.1 GB',
    routerName: 'CHR-Cloud-VPS-SG',
    description: 'Bypass NAT & SSL encrypted tunnel untuk CHR Cloud',
    createdAt: '2026-04-10'
  },
  {
    id: 'VPN-04',
    name: 'Remote Winbox POP Timur (RB4011)',
    username: 'rw-pop-timur',
    password: 'vPass_4412#East',
    protocol: 'L2TP_IPSEC',
    serverHost: 'vpn.scorip.net',
    serverPort: 1701,
    assignedIp: '10.255.0.12',
    publicPortWinbox: 18294,
    internalPortWinbox: 8291,
    publicPortApi: 18730,
    internalPortApi: 8728,
    status: 'CONNECTED',
    uptime: '21d 11:05:43',
    bytesIn: '3.1 GB',
    bytesOut: '8.4 GB',
    routerName: 'RB4011-POP-Timur',
    description: 'Remote maintenance teknisi untuk POP Timur',
    createdAt: '2026-07-22'
  },
  {
    id: 'VPN-05',
    name: 'OpenVPN Field Technician Mobile',
    username: 'ovpn-teknisi-bagus',
    password: 'techPass_99#Bagus',
    protocol: 'OPENVPN',
    serverHost: 'vpn.scorip.net',
    serverPort: 1194,
    assignedIp: '10.255.50.5',
    status: 'CONNECTED',
    uptime: '03:45:12',
    bytesIn: '412 MB',
    bytesOut: '890 MB',
    routerName: 'Laptop Teknisi Bagus',
    description: 'Dial-in VPN teknisi lapangan untuk akses internal OLT & NMS',
    createdAt: '2026-09-01'
  },
  {
    id: 'VPN-06',
    name: 'Backup Tunnel PPTP Legacy POP Selatan',
    username: 'pptp-pop-selatan',
    password: 'pPass_7721#South',
    protocol: 'PPTP',
    serverHost: 'vpn.scorip.net',
    serverPort: 1723,
    assignedIp: '10.255.0.30',
    publicPortWinbox: 18295,
    internalPortWinbox: 8291,
    status: 'DISCONNECTED',
    bytesIn: '0 B',
    bytesOut: '0 B',
    routerName: 'RB750Gr3-POP-Selatan',
    description: 'Tunnel cadangan (Standby) jika link utama down',
    createdAt: '2026-08-14'
  }
];

export const INITIAL_VPN_SERVERS: VpnServerGateway[] = [
  {
    id: 'SRV-01',
    name: 'SCORIP Cloud Gateway 01 (Singapore Equinix)',
    ip: '103.144.18.5',
    domain: 'vpn.scorip.net',
    location: 'Singapore Equinix SG1',
    protocolsSupported: ['WIREGUARD', 'L2TP_IPSEC', 'SSTP', 'OPENVPN'],
    activeClients: 14,
    maxClients: 100,
    bandwidthUsage: '42.5 Mbps / 1 Gbps',
    status: 'ONLINE',
    cpuLoad: 8,
    ramUsage: 24
  },
  {
    id: 'SRV-02',
    name: 'SCORIP Local NOC Gateway 02 (Jakarta Cyber 1)',
    ip: '103.178.99.12',
    domain: 'id-vpn.scorip.net',
    location: 'Gedung Cyber 1 Jakarta',
    protocolsSupported: ['WIREGUARD', 'L2TP_IPSEC', 'SSTP', 'OPENVPN', 'PPTP'],
    activeClients: 9,
    maxClients: 50,
    bandwidthUsage: '28.1 Mbps / 500 Mbps',
    status: 'ONLINE',
    cpuLoad: 12,
    ramUsage: 35
  }
];

export const INITIAL_UBUNTU_GATEWAY: UbuntuGatewaySettings = {
  serverIp: '103.144.18.5',
  hostname: 'noc-ubuntu-gateway-01',
  osVersion: 'Ubuntu 24.04.1 LTS (Noble Numbat)',
  ipForwardingEnabled: true,
  wireguardInstalled: true,
  cloudflaredInstalled: true,
  wireguardPort: 51820,
  wireguardSubnet: '10.255.0.0/24',
  natInterface: 'eth0',
  dnsServers: '1.1.1.1, 8.8.8.8'
};

export const INITIAL_CF_TUNNEL: CloudflareTunnelConfig = {
  tunnelId: '8f3b1942-d120-4e31-8910-cfa5182089aa',
  tunnelName: 'scorip-isp-core-tunnel',
  accountTag: 'cf_acc_992144882101',
  connectorStatus: 'HEALTHY',
  edgeLocation: 'CGK (Jakarta) & SIN (Singapore)',
  cloudflaredVersion: '2024.10.1',
  createdAt: '2026-04-12',
  hostnameCount: 5
};

export const INITIAL_INGRESS_RULES: IngressRule[] = [
  {
    id: 'ING-01',
    hostname: 'winbox-core.scorip.net',
    serviceProtocol: 'TCP',
    targetAddress: '10.255.0.10:8291',
    description: 'Remote Winbox Router CCR2004 Core POP Pusat',
    routerName: 'CCR2004-16G-2S+ Core POP',
    accessPolicy: 'ZERO_TRUST_PIN',
    status: 'ACTIVE'
  },
  {
    id: 'ING-02',
    hostname: 'webfig-core.scorip.net',
    serviceProtocol: 'HTTP',
    targetAddress: '10.255.0.10:80',
    description: 'WebFig HTTPS Access CCR2004 Core via Cloudflare Edge',
    routerName: 'CCR2004-16G-2S+ Core POP',
    accessPolicy: 'PUBLIC',
    status: 'ACTIVE'
  },
  {
    id: 'ING-03',
    hostname: 'winbox-ubud.scorip.net',
    serviceProtocol: 'TCP',
    targetAddress: '10.255.10.2:8291',
    description: 'Remote Winbox POP Ubud OLT Site via WireGuard Tunnel',
    routerName: 'RB4011-POP-Ubud',
    accessPolicy: 'ZERO_TRUST_PIN',
    status: 'ACTIVE'
  },
  {
    id: 'ING-04',
    hostname: 'winbox-timur.scorip.net',
    serviceProtocol: 'TCP',
    targetAddress: '10.255.0.12:8291',
    description: 'Remote Winbox POP Timur Maintenance',
    routerName: 'RB4011-POP-Timur',
    accessPolicy: 'ZERO_TRUST_PIN',
    status: 'ACTIVE'
  },
  {
    id: 'ING-05',
    hostname: 'api-core.scorip.net',
    serviceProtocol: 'TCP',
    targetAddress: '10.255.0.10:8728',
    description: 'MikroTik RouterOS API Port Forwarding',
    routerName: 'CCR2004-16G-2S+ Core POP',
    accessPolicy: 'RESTRICTED_IP',
    status: 'ACTIVE'
  }
];

export const INITIAL_RADIUS_CONFIG: FreeRadiusServerConfig = {
  serverHost: '10.10.0.1',
  authPort: 1812,
  acctPort: 1813,
  coaPort: 3799,
  status: 'ACTIVE',
  version: 'FreeRADIUS v3.2.3 (Debian/Ubuntu x86_64)',
  dbType: 'MariaDB / MySQL',
  dbHost: 'localhost:3306',
  dbName: 'radius',
  dbUser: 'radius_user',
  interimInterval: '00:05:00 (300 Detik)',
  uptime: '48 hari, 14 jam, 22 menit',
  totalAuthRequests: 184592,
  totalAcctRequests: 624109,
  authAcceptRatio: 99.84
};

export const INITIAL_RADIUS_NAS_CLIENTS: RadiusNasClient[] = [
  {
    id: 'NAS-01',
    nasname: '10.10.0.2',
    shortname: 'CCR2004-Core-POP',
    type: 'mikrotik',
    secret: 'ScoripRadiusSecret2026',
    description: 'Router BNG Utama PPPoE & Hotspot Core POP',
    coaPort: 3799,
    status: 'ONLINE',
    lastSeen: '1 menit yang lalu'
  },
  {
    id: 'NAS-02',
    nasname: '10.255.10.2',
    shortname: 'RB4011-POP-Ubud',
    type: 'mikrotik',
    secret: 'ScoripRadiusSecret2026',
    description: 'Router POP OLT Ubud PPPoE Server',
    coaPort: 3799,
    status: 'ONLINE',
    lastSeen: '3 menit yang lalu'
  },
  {
    id: 'NAS-03',
    nasname: '10.255.0.12',
    shortname: 'RB4011-POP-Timur',
    type: 'mikrotik',
    secret: 'ScoripRadiusEast2026',
    description: 'Router POP Timur Hotspot & PPPoE',
    coaPort: 3799,
    status: 'ONLINE',
    lastSeen: '5 menit yang lalu'
  },
  {
    id: 'NAS-04',
    nasname: '10.255.0.25',
    shortname: 'CHR-Cloud-VPS-SG',
    type: 'mikrotik',
    secret: 'ScoripRadiusChrCloud',
    description: 'Cloud Hosted Router Singapura Backup AAA',
    coaPort: 3799,
    status: 'ONLINE',
    lastSeen: '10 menit yang lalu'
  }
];

export const INITIAL_RADIUS_GROUPS: RadiusGroupProfile[] = [
  {
    id: 'RGRP-01',
    groupname: 'PAKET-20MBPS',
    description: 'Profil Rumahan Starter 20 Mbps Simetris',
    rateLimit: '20M/20M',
    addressPool: 'pool-pppoe-dhcp',
    dnsServer: '1.1.1.1, 8.8.8.8',
    interimInterval: 300,
    activeUsersCount: 142
  },
  {
    id: 'RGRP-02',
    groupname: 'PAKET-30MBPS',
    description: 'Profil Standar Keluarga 30 Mbps',
    rateLimit: '30M/30M',
    addressPool: 'pool-pppoe-dhcp',
    dnsServer: '1.1.1.1, 8.8.8.8',
    interimInterval: 300,
    activeUsersCount: 89
  },
  {
    id: 'RGRP-03',
    groupname: 'PAKET-50MBPS',
    description: 'Profil Ultra Fast Gamer 50 Mbps',
    rateLimit: '50M/50M',
    addressPool: 'pool-pppoe-dhcp',
    dnsServer: '1.1.1.1, 8.8.8.8',
    interimInterval: 300,
    activeUsersCount: 45
  },
  {
    id: 'RGRP-04',
    groupname: 'BIZ-DEDICATED-100MBPS',
    description: 'Profil Bisnis Dedicated 1:1 Publik Static',
    rateLimit: '100M/100M',
    addressPool: 'pool-public-static',
    dnsServer: '1.1.1.1, 8.8.8.8',
    interimInterval: 300,
    activeUsersCount: 12
  },
  {
    id: 'RGRP-05',
    groupname: 'ISOLIR-GROUP',
    description: 'Profil Isolir Tunggakan Tagihan (Throttle 128k & Redirect)',
    rateLimit: '128k/128k',
    addressPool: 'pool-isolir-redirect',
    dnsServer: '10.10.0.1',
    interimInterval: 60,
    activeUsersCount: 4
  }
];

export const INITIAL_RADIUS_SESSIONS: RadiusSessionRecord[] = [
  {
    id: 'SESS-01',
    radacctid: 84091,
    username: 'pppoe_budi',
    serviceType: 'PPPoE',
    nasIpAddress: '10.10.0.2',
    framedIpAddress: '100.64.12.15',
    callingStationId: '48:8F:5A:11:22:33',
    acctStartTime: '2026-10-10 08:14:02',
    acctStopTime: null,
    acctSessionTime: '2d 15h 42m',
    acctInputOctets: '14.2 GB',
    acctOutputOctets: '88.5 GB',
    status: 'ACTIVE'
  },
  {
    id: 'SESS-02',
    radacctid: 84092,
    username: 'pppoe_siti',
    serviceType: 'PPPoE',
    nasIpAddress: '10.10.0.2',
    framedIpAddress: '100.64.12.16',
    callingStationId: '70:4F:57:AB:CD:EF',
    acctStartTime: '2026-10-11 14:20:10',
    acctStopTime: null,
    acctSessionTime: '1d 09h 36m',
    acctInputOctets: '8.4 GB',
    acctOutputOctets: '42.1 GB',
    status: 'ACTIVE'
  },
  {
    id: 'SESS-03',
    radacctid: 84093,
    username: 'pppoe_kadek',
    serviceType: 'PPPoE',
    nasIpAddress: '10.255.10.2',
    framedIpAddress: '100.64.12.20',
    callingStationId: 'A0:B1:C2:33:44:55',
    acctStartTime: '2026-10-09 19:40:55',
    acctStopTime: null,
    acctSessionTime: '3d 04h 16m',
    acctInputOctets: '22.8 GB',
    acctOutputOctets: '124.6 GB',
    status: 'ACTIVE'
  },
  {
    id: 'SESS-04',
    radacctid: 84094,
    username: 'HS-89412',
    serviceType: 'Hotspot',
    nasIpAddress: '10.10.0.2',
    framedIpAddress: '192.168.88.54',
    callingStationId: 'BC:D0:74:AA:BB:CC',
    acctStartTime: '2026-10-12 21:10:11',
    acctStopTime: null,
    acctSessionTime: '02h 45m',
    acctInputOctets: '240 MB',
    acctOutputOctets: '1.45 GB',
    status: 'ACTIVE'
  },
  {
    id: 'SESS-05',
    radacctid: 84095,
    username: 'HS-77210',
    serviceType: 'Hotspot',
    nasIpAddress: '10.255.0.12',
    framedIpAddress: '192.168.90.112',
    callingStationId: '24:4B:FE:12:34:56',
    acctStartTime: '2026-10-12 22:05:00',
    acctStopTime: null,
    acctSessionTime: '01h 50m',
    acctInputOctets: '95 MB',
    acctOutputOctets: '680 MB',
    status: 'ACTIVE'
  }
];



