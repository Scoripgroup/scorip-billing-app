export type UserRole = 'SUPER_ADMIN' | 'NOC' | 'TEKNISI' | 'KASIR' | 'PELANGGAN';

export type NetworkStatus = 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export interface MikrotikRouter {
  id: string;
  name: string;
  ip: string;
  rosVersion: string;
  type: 'CCR2004' | 'RB4011' | 'CHR-Cloud' | 'CCR1036';
  cpuLoad: number;
  ramUsage: number;
  uptime: string;
  activePppoe: number;
  status: 'ONLINE' | 'OFFLINE';
  apiPort: number;
}

export interface PPPoEClient {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  phone: string;
  address: string;
  profile: string;
  ipAddress: string;
  macAddress: string;
  routerId: string;
  odpId: string;
  odpPort: number;
  status: 'ACTIVE' | 'ISOLATED' | 'OFFLINE';
  uptime: string;
  downloadBytes: string;
  uploadBytes: string;
  monthlyFee: number;
  fupQuotaGb?: number;
  usedQuotaGb?: number;
  ontSerial: string;
}

export interface OLTDevice {
  id: string;
  name: string;
  brand: 'ZTE' | 'HUAWEI' | 'VSOL' | 'FIBERHOME';
  model: string;
  ip: string;
  totalPonPorts: number;
  activePonPorts: number;
  totalOnu: number;
  unregisteredCount: number;
  status: 'ONLINE' | 'OFFLINE';
  uptime: string;
  temperature: number;
}

export interface UnregisteredONU {
  sn: string;
  brand: string;
  ponPort: string;
  oltId: string;
  detectedAt: string;
}

export interface RegisteredONU {
  id: string;
  sn: string;
  customerName: string;
  pppoeUser: string;
  oltId: string;
  ponPort: string;
  rxPowerDbm: number;
  txPowerDbm: number;
  distanceKm: number;
  status: 'ONLINE' | 'LOS' | 'DYING_GASP';
  cpeModel: string;
  odpCode: string;
}

export interface GenieACSCPE {
  deviceId: string;
  serialNumber: string;
  customerName: string;
  pppoeUser: string;
  modelName: string;
  hardwareVersion: string;
  softwareVersion: string;
  ssid24: string;
  ssid5?: string;
  wifiPassword?: string;
  channel24: number;
  isRadioOn: boolean;
  connectedClients: number;
  rxOpticalDbm: number;
  lastInform: string;
  wanIp: string;
}

export interface ODCPoint {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  capacityPorts: number;
  usedPorts: number;
  splitterRatio: string;
  coverageArea: string;
}

export interface ODPPoint {
  id: string;
  odcId: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  capacityPorts: number;
  usedPorts: number;
  avgDbm: number;
  status: 'NORMAL' | 'HIGH_ATTENUATION' | 'FULL';
  tubeColor: string; // TIA-598 color
  coreNumber: number;
}

export interface CableRoute {
  id: string;
  name: string;
  type: 'FEEDER' | 'DISTRIBUTION' | 'DROP';
  color: string;
  coreCount: number;
  coordinates: [number, number][];
  totalLengthMeters: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  phone: string;
  pppoeUser: string;
  planName: string;
  subtotal: number;
  taxPpn: number;
  totalAmount: number;
  dueDate: string;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  paymentMethod?: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'CASH_KASIR' | 'INDOMARET';
  paidAt?: string;
}

export interface HotspotVoucher {
  code: string;
  profile: string;
  duration: string;
  price: number;
  createdAt: string;
  status: 'UNUSED' | 'USED';
}

export interface HotspotUser {
  id: string;
  username: string;
  password?: string;
  profile: string;
  duration?: string;
  uptime?: string;
  bytesIn?: string;
  bytesOut?: string;
  timeLeft?: string;
  dataLimit?: string;
  timeLimit?: string;
  macAddress?: string;
  ipAddress?: string;
  status: 'ACTIVE' | 'UNUSED' | 'USED' | 'EXPIRED' | 'LOCKED';
  comment?: string;
  reseller?: string;
  price: number;
  createdAt: string;
  expiredAt?: string;
}

export interface HotspotProfile {
  id: string;
  name: string;
  rateLimit: string;
  sharedUsers: number;
  validity: string;
  gracePeriod?: string;
  price: number;
  resellerPrice: number;
  userLock: 'MAC' | 'OFF';
  addressPool: string;
  parentQueue?: string;
  description?: string;
}

export interface HotspotSession {
  id: string;
  username: string;
  ipAddress: string;
  macAddress: string;
  hostname?: string;
  uptime: string;
  bytesIn: string;
  bytesOut: string;
  timeLeft: string;
  profile: string;
  routerName: string;
  loginBy: 'HTTP-CHAP' | 'HTTP-PAP' | 'MAC' | 'COOKIE' | 'QR-CODE';
  startedAt: string;
}

export interface HotspotReseller {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  balance: number;
  commissionPercent: number;
  totalVouchersSold: number;
  totalSalesRp: number;
  status: 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
}

export interface HotspotTemplate {
  id: string;
  name: string;
  type: 'THERMAL_58MM' | 'THERMAL_80MM' | 'A4_SHEET' | 'LOGIN_PAGE';
  isDefault: boolean;
  headerTitle: string;
  subHeader: string;
  footerNote: string;
  showQrCode: boolean;
  showPrice: boolean;
  showValidity: boolean;
  showReseller: boolean;
  accentColor: string;
  customCss?: string;
}

export interface WhatsAppLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  category: 'TAGIHAN' | 'KWITANSI' | 'ISOLIR' | 'BROADCAST_GANGGUAN' | 'OTP';
  message: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  timestamp: string;
}

export interface TroubleTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  pppoeUser: string;
  phone: string;
  odpCode: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  technicianName?: string;
  initialDbm?: number;
  finalDbm?: number;
  createdAt: string;
}

export interface BandwidthProfile {
  id: string;
  name: string;
  rateLimit: string;
  pool: string;
  price: number;
  description?: string;
}

export interface WATemplate {
  id: string;
  name: string;
  category: 'TAGIHAN' | 'KWITANSI' | 'ISOLIR' | 'BROADCAST';
  content: string;
}

export type VpnProtocol = 'WIREGUARD' | 'L2TP_IPSEC' | 'SSTP' | 'OPENVPN' | 'PPTP';
export type VpnStatus = 'CONNECTED' | 'DISCONNECTED' | 'DISABLED';

export interface VpnAccount {
  id: string;
  name: string;
  username: string;
  password?: string;
  protocol: VpnProtocol;
  serverHost: string;
  serverPort: number;
  assignedIp: string;
  remoteSubnet?: string;
  publicPortWinbox?: number;
  internalPortWinbox?: number;
  publicPortApi?: number;
  internalPortApi?: number;
  publicPortWeb?: number;
  internalPortWeb?: number;
  status: VpnStatus;
  uptime?: string;
  lastHandshake?: string;
  bytesIn: string;
  bytesOut: string;
  routerName: string;
  description: string;
  publicKey?: string;
  privateKey?: string;
  endpoint?: string;
  createdAt: string;
}

export interface VpnServerGateway {
  id: string;
  name: string;
  ip: string;
  domain: string;
  location: string;
  protocolsSupported: VpnProtocol[];
  activeClients: number;
  maxClients: number;
  bandwidthUsage: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  cpuLoad: number;
  ramUsage: number;
}

export interface CloudflareTunnelConfig {
  tunnelId: string;
  tunnelName: string;
  accountTag: string;
  connectorStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  edgeLocation: string;
  cloudflaredVersion: string;
  createdAt: string;
  hostnameCount: number;
}

export interface IngressRule {
  id: string;
  hostname: string;
  serviceProtocol: 'TCP' | 'HTTP' | 'HTTPS' | 'SSH';
  targetAddress: string;
  description: string;
  routerName: string;
  accessPolicy: 'PUBLIC' | 'ZERO_TRUST_PIN' | 'RESTRICTED_IP';
  status: 'ACTIVE' | 'DISABLED';
}

export interface UbuntuGatewaySettings {
  serverIp: string;
  hostname: string;
  osVersion: string;
  ipForwardingEnabled: boolean;
  wireguardInstalled: boolean;
  cloudflaredInstalled: boolean;
  wireguardPort: number;
  wireguardSubnet: string;
  natInterface: string;
  dnsServers: string;
}

export interface RadiusNasClient {
  id: string;
  nasname: string; // IP Address atau subnet, misal '10.10.0.2'
  shortname: string; // Identifier singkat, misal 'mikrotik-core'
  type: string; // 'other' | 'mikrotik'
  secret: string; // Shared secret key
  server?: string;
  description: string;
  coaPort: number; // default 3799 (RFC 3576 / RFC 5176)
  status: 'ONLINE' | 'OFFLINE';
  lastSeen?: string;
}

export interface RadiusGroupProfile {
  id: string;
  groupname: string; // misal 'PAKET-20MBPS'
  description: string;
  rateLimit: string; // misal '20M/20M'
  addressPool?: string; // misal 'pool-pppoe-dhcp'
  dnsServer?: string;
  sessionTimeout?: number; // detik
  interimInterval: number; // detik, default 300 (5m)
  routes?: string;
  activeUsersCount?: number;
}

export interface RadiusSessionRecord {
  id: string;
  radacctid: number;
  username: string;
  serviceType: 'PPPoE' | 'Hotspot';
  nasIpAddress: string;
  framedIpAddress: string;
  callingStationId: string; // MAC Address
  acctStartTime: string;
  acctStopTime?: string | null;
  acctSessionTime: string; // Misal "2d 08h 14m"
  acctInputOctets: string; // Upload formatted
  acctOutputOctets: string; // Download formatted
  terminateCause?: string;
  status: 'ACTIVE' | 'STOPPED';
}

export interface FreeRadiusServerConfig {
  serverHost: string;
  authPort: number; // 1812
  acctPort: number; // 1813
  coaPort: number; // 3799
  status: 'ACTIVE' | 'STOPPED';
  version: string;
  dbType: 'MariaDB / MySQL' | 'PostgreSQL';
  dbHost: string;
  dbName: string;
  dbUser: string;
  interimInterval: string;
  uptime: string;
  totalAuthRequests: number;
  totalAcctRequests: number;
  authAcceptRatio: number; // e.g. 99.8%
}

export interface RadiusTestResult {
  timestamp: string;
  command: string;
  status: 'SUCCESS' | 'FAILED';
  responseType: 'Access-Accept' | 'Access-Reject' | 'CoA-ACK' | 'CoA-NAK' | 'Disconnect-ACK';
  roundTripTimeMs: number;
  attributes: Record<string, string>;
  rawOutput: string;
}



