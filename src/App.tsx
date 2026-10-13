import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  X
} from 'lucide-react';
import {
  UserRole,
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
} from './types';
import {
  INITIAL_ROUTERS,
  INITIAL_OLTS,
  INITIAL_UNREGISTERED_ONUS,
  INITIAL_REGISTERED_ONUS,
  INITIAL_GENIEACS_CPES,
  INITIAL_ODCS,
  INITIAL_ODPS,
  INITIAL_CABLE_ROUTES,
  INITIAL_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_VOUCHERS,
  INITIAL_HOTSPOT_USERS,
  INITIAL_HOTSPOT_PROFILES,
  INITIAL_HOTSPOT_SESSIONS,
  INITIAL_HOTSPOT_RESELLERS,
  INITIAL_HOTSPOT_TEMPLATES,
  INITIAL_WA_LOGS,
  INITIAL_TICKETS,
  INITIAL_PROFILES,
  INITIAL_WA_TEMPLATES,
  INITIAL_VPN_ACCOUNTS,
  INITIAL_VPN_SERVERS,
  INITIAL_UBUNTU_GATEWAY,
  INITIAL_CF_TUNNEL,
  INITIAL_INGRESS_RULES,
  INITIAL_RADIUS_CONFIG,
  INITIAL_RADIUS_NAS_CLIENTS,
  INITIAL_RADIUS_GROUPS,
  INITIAL_RADIUS_SESSIONS
} from './data/mockData';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { MikrotikModule } from './components/MikrotikModule';
import { OltModule } from './components/OltModule';
import { GenieAcsModule } from './components/GenieAcsModule';
import { GisMapModule } from './components/GisMapModule';
import { VpnModule } from './components/VpnModule';
import { UbuntuGatewayModule } from './components/UbuntuGatewayModule';
import { FreeRadiusModule } from './components/FreeRadiusModule';
import { BillingModule } from './components/BillingModule';
import { WhatsAppModule } from './components/WhatsAppModule';
import { TicketingModule } from './components/TicketingModule';
import { CustomerPortalModule } from './components/CustomerPortalModule';
import { PppoeModule } from './components/PppoeModule';
import { HotspotModule } from './components/HotspotModule';

export function App() {
  // Theme & Layout state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [role, setRole] = useState<UserRole>('SUPER_ADMIN');
  const [mikrotikSubTab, setMikrotikSubTab] = useState<'sessions' | 'secrets' | 'vouchers' | 'profiles' | 'radius'>('secrets');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper to map current pathname to activeNav
  const getActiveNav = (pathname: string): string => {
    if (pathname.startsWith('/pppoe/profiles')) return 'pppoe_profiles';
    if (pathname.startsWith('/pppoe/sessions')) return 'pppoe_sessions';
    if (pathname.startsWith('/pppoe/settings')) return 'pppoe_settings';
    if (pathname.startsWith('/pppoe')) return 'pppoe_users';
    if (pathname.startsWith('/hotspot/profiles')) return 'hotspot_profiles';
    if (pathname.startsWith('/hotspot/sessions')) return 'hotspot_sessions';
    if (pathname.startsWith('/hotspot/resellers')) return 'hotspot_resellers';
    if (pathname.startsWith('/hotspot/templates')) return 'hotspot_templates';
    if (pathname.startsWith('/hotspot')) return 'hotspot_users';
    if (pathname.startsWith('/mikrotik')) return 'routers';
    if (pathname.startsWith('/olt')) return 'olt';
    if (pathname.startsWith('/genieacs')) return 'genieacs';
    if (pathname.startsWith('/gis')) return 'gis';
    if (pathname.startsWith('/vpn')) return 'vpn';
    if (pathname.startsWith('/gateway')) return 'gateway';
    if (pathname.startsWith('/radius')) return 'radius';
    if (pathname.startsWith('/billing')) return 'billing';
    if (pathname.startsWith('/whatsapp')) return 'whatsapp';
    if (pathname.startsWith('/tickets')) return 'tickets';
    if (pathname.startsWith('/portal')) return 'customer_portal';
    return 'dashboard';
  };

  const activeNav = getActiveNav(location.pathname);

  // FreeRADIUS Server State
  const [radiusConfig, setRadiusConfig] = useState<FreeRadiusServerConfig>(INITIAL_RADIUS_CONFIG);
  const [radiusNasClients, setRadiusNasClients] = useState<RadiusNasClient[]>(INITIAL_RADIUS_NAS_CLIENTS);
  const [radiusGroups, setRadiusGroups] = useState<RadiusGroupProfile[]>(INITIAL_RADIUS_GROUPS);
  const [radiusSessions, setRadiusSessions] = useState<RadiusSessionRecord[]>(INITIAL_RADIUS_SESSIONS);

  // VPN & Gateway Data State
  const [vpnAccounts, setVpnAccounts] = useState<VpnAccount[]>(INITIAL_VPN_ACCOUNTS);
  const [vpnServers, setVpnServers] = useState<VpnServerGateway[]>(INITIAL_VPN_SERVERS);
  const [cfTunnel, setCfTunnel] = useState<CloudflareTunnelConfig>(INITIAL_CF_TUNNEL);
  const [ingressRules, setIngressRules] = useState<IngressRule[]>(INITIAL_INGRESS_RULES);
  const [ubuntuSettings, setUbuntuSettings] = useState<UbuntuGatewaySettings>(INITIAL_UBUNTU_GATEWAY);

  // Core Datasets State
  const [routers, setRouters] = useState<MikrotikRouter[]>(INITIAL_ROUTERS);
  const [clients, setClients] = useState<PPPoEClient[]>(INITIAL_CLIENTS);
  const [profiles, setProfiles] = useState<BandwidthProfile[]>(INITIAL_PROFILES);
  const [olts, setOlts] = useState<OLTDevice[]>(INITIAL_OLTS);
  const [unregisteredOnus, setUnregisteredOnus] = useState<UnregisteredONU[]>(INITIAL_UNREGISTERED_ONUS);
  const [registeredOnus, setRegisteredOnus] = useState<RegisteredONU[]>(INITIAL_REGISTERED_ONUS);
  const [cpes, setCpes] = useState<GenieACSCPE[]>(INITIAL_GENIEACS_CPES);
  const [odcs, setOdcs] = useState<ODCPoint[]>(INITIAL_ODCS);
  const [odps, setOdps] = useState<ODPPoint[]>(INITIAL_ODPS);
  const [cables, setCables] = useState<CableRoute[]>(INITIAL_CABLE_ROUTES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [vouchers, setVouchers] = useState<HotspotVoucher[]>(INITIAL_VOUCHERS);
  const [hotspotUsers, setHotspotUsers] = useState<HotspotUser[]>(INITIAL_HOTSPOT_USERS);
  const [hotspotProfiles, setHotspotProfiles] = useState<HotspotProfile[]>(INITIAL_HOTSPOT_PROFILES);
  const [hotspotSessions, setHotspotSessions] = useState<HotspotSession[]>(INITIAL_HOTSPOT_SESSIONS);
  const [hotspotResellers, setHotspotResellers] = useState<HotspotReseller[]>(INITIAL_HOTSPOT_RESELLERS);
  const [hotspotTemplates, setHotspotTemplates] = useState<HotspotTemplate[]>(INITIAL_HOTSPOT_TEMPLATES);
  const [waTemplates, setWaTemplates] = useState<WATemplate[]>(INITIAL_WA_TEMPLATES);
  const [waLogs, setWaLogs] = useState<WhatsAppLog[]>(INITIAL_WA_LOGS);
  const [tickets, setTickets] = useState<TroubleTicket[]>(INITIAL_TICKETS);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // RadbooX-style Nav Item Click Handler
  const navToPathMap: Record<string, string> = {
    dashboard: '/dashboard',
    pppoe_users: '/pppoe/users',
    pppoe_profiles: '/pppoe/profiles',
    pppoe_sessions: '/pppoe/sessions',
    pppoe_settings: '/pppoe/settings',
    hotspot_users: '/hotspot/users',
    hotspot_profiles: '/hotspot/profiles',
    hotspot_sessions: '/hotspot/sessions',
    hotspot_resellers: '/hotspot/resellers',
    hotspot_templates: '/hotspot/templates',
    routers: '/mikrotik',
    olt: '/olt',
    genieacs: '/genieacs',
    gis: '/gis',
    vpn: '/vpn',
    gateway: '/gateway',
    radius: '/radius',
    billing: '/billing',
    whatsapp: '/whatsapp',
    tickets: '/tickets',
    customer_portal: '/portal'
  };

  const handleSelectNav = (navId: string) => {
    const target = navToPathMap[navId] || '/dashboard';
    navigate(target);
  };

  const handleNavigateTab = (tab: string) => {
    const tabToPathMap: Record<string, string> = {
      dashboard: '/dashboard',
      pppoe: '/pppoe/users',
      hotspot: '/hotspot/users',
      mikrotik: '/mikrotik',
      olt: '/olt',
      genieacs: '/genieacs',
      gis: '/gis',
      vpn: '/vpn',
      gateway: '/gateway',
      radius: '/radius',
      billing: '/billing',
      whatsapp: '/whatsapp',
      tickets: '/tickets',
      customer_portal: '/portal'
    };
    if (tab === 'mikrotik') {
      setMikrotikSubTab('secrets');
    }
    navigate(tabToPathMap[tab] || `/${tab}`);
  };

  // When role changes to 'PELANGGAN', auto-switch to customer portal tab
  useEffect(() => {
    if (role === 'PELANGGAN') {
      navigate('/portal');
    } else if (location.pathname === '/portal') {
      navigate('/dashboard');
    }
  }, [role]);

  // 1-Click Auto-Isolir Simulator (Cron Jam 00:00)
  const handleSimulateAutoIsolir = () => {
    let isolatedCount = 0;
    const updatedClients = clients.map((c) => {
      const inv = invoices.find((i) => i.pppoeUser === c.username);
      if (inv && (inv.status === 'OVERDUE' || inv.status === 'UNPAID')) {
        isolatedCount++;
        return { ...c, status: 'ISOLATED' as const };
      }
      return c;
    });

    setClients(updatedClients);

    // Add WhatsApp Log
    const newLog: WhatsAppLog = {
      id: `WA-ISO-${Date.now()}`,
      recipientPhone: '085711223344',
      recipientName: 'I Made Wirawan',
      category: 'ISOLIR',
      message: 'CRON ISOLIR OTOMATIS: Layanan internet Anda dipindahkan ke profil ISOLIR karena keterlambatan pembayaran.',
      status: 'SENT',
      timestamp: '2026-09-28 22:20:00'
    };
    setWaLogs((prev) => [newLog, ...prev]);

    showToast(`⚡ Cron Auto-Isolir Selesai: ${isolatedCount} pelanggan berhasil dipindahkan ke Profil Isolir via RADIUS CoA!`);
  };

  // Toggle Single Client Isolir
  const handleToggleClientIsolir = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const nextStatus = c.status === 'ACTIVE' ? 'ISOLATED' : 'ACTIVE';
          showToast(`Pelanggan ${c.fullName} berhasil di-${nextStatus === 'ISOLATED' ? 'ISOLIR' : 'BUKA ISOLIR'} via MikroTik API!`);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Kick Session
  const handleKickSession = (username: string) => {
    showToast(`Paket CoA Packet of Disconnect (RFC 3576) terkirim untuk sesi user "${username}". Sesi diputus & terhubung ulang.`);
  };

  // Generate Vouchers
  const handleGenerateVouchers = (profile: string, duration: string, price: number, count: number) => {
    const newVouchers: HotspotVoucher[] = [];
    for (let i = 0; i < count; i++) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      newVouchers.push({
        code: `SCORIP-${randNum}`,
        profile,
        duration,
        price,
        createdAt: '2026-09-28 22:20',
        status: 'UNUSED'
      });
    }
    setVouchers((prev) => [...newVouchers, ...prev]);
    showToast(`Berhasil men-generate ${count} voucher hotspot baru untuk ${profile}!`);
  };

  // Mikrotik CRUD Handlers
  const handleAddClient = (client: Omit<PPPoEClient, 'id'>) => {
    const newClient: PPPoEClient = {
      ...client,
      id: `CLI-${Date.now()}`
    };
    setClients((prev) => [newClient, ...prev]);
    showToast(`Pelanggan baru ${newClient.fullName} (${newClient.username}) berhasil didaftarkan di RADIUS!`);
  };

  const handleEditClient = (client: PPPoEClient) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    showToast(`Data pelanggan ${client.fullName} berhasil diperbarui.`);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    showToast(`Pelanggan berhasil dihapus dari sistem & MikroTik.`);
  };

  const handleAddRouter = (router: MikrotikRouter) => {
    setRouters((prev) => [...prev, router]);
    showToast(`Router MikroTik ${router.name} (${router.ip}) berhasil ditambahkan!`);
  };

  const handleDeleteRouter = (routerId: string) => {
    setRouters((prev) => prev.filter((r) => r.id !== routerId));
    showToast(`Router MikroTik berhasil dihapus.`);
  };

  const handleAddProfile = (profile: BandwidthProfile) => {
    setProfiles((prev) => [...prev, profile]);
    showToast(`Paket Bandwidth ${profile.name} (${profile.rateLimit}) berhasil dibuat!`);
  };

  const handleDeleteProfile = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    showToast(`Paket Bandwidth berhasil dihapus.`);
  };

  const handleDeleteVoucher = (code: string) => {
    setVouchers((prev) => prev.filter((v) => v.code !== code));
    showToast(`Voucher Hotspot ${code} berhasil dihapus.`);
  };

  // Hotspot Engine Handlers
  const handleAddHotspotUser = (user: HotspotUser) => {
    setHotspotUsers((prev) => [user, ...prev]);
    setVouchers((prev) => [
      {
        code: user.username,
        profile: user.profile,
        duration: user.duration || '24 Jam',
        price: user.price,
        createdAt: user.createdAt,
        status: user.status === 'UNUSED' ? 'UNUSED' : 'USED'
      },
      ...prev
    ]);
  };

  const handleEditHotspotUser = (user: HotspotUser) => {
    setHotspotUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  };

  const handleDeleteHotspotUser = (id: string) => {
    const target = hotspotUsers.find((u) => u.id === id);
    setHotspotUsers((prev) => prev.filter((u) => u.id !== id));
    if (target) {
      setVouchers((prev) => prev.filter((v) => v.code !== target.username));
    }
  };

  const handleBatchGenerateHotspotUsers = (params: {
    profile: string;
    count: number;
    prefix: string;
    charLength: number;
    userMode: 'USER_EQUALS_PASSWORD' | 'USER_AND_PASSWORD';
    charSet: 'NUMERIC' | 'ALPHANUMERIC' | 'UPPERCASE';
    resellerId?: string;
    deductBalance?: boolean;
  }) => {
    const selectedProf = hotspotProfiles.find((p) => p.name === params.profile);
    const price = selectedProf?.price || 3000;
    const duration = selectedProf?.validity || '24 Jam';
    const resellerObj = params.resellerId ? hotspotResellers.find((r) => r.id === params.resellerId) : undefined;
    const wholesalePrice = selectedProf?.resellerPrice || Math.round(price * 0.85);

    const newUsers: HotspotUser[] = [];
    const newVouchers: HotspotVoucher[] = [];

    const charsNum = '0123456789';
    const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charsAlphaNum = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    const charSource =
      params.charSet === 'NUMERIC' ? charsNum :
      params.charSet === 'UPPERCASE' ? charsUpper : charsAlphaNum;

    for (let i = 0; i < params.count; i++) {
      let code = '';
      for (let c = 0; c < params.charLength; c++) {
        code += charSource.charAt(Math.floor(Math.random() * charSource.length));
      }
      const username = `${params.prefix}${code}`;
      const password = params.userMode === 'USER_EQUALS_PASSWORD' ? username : code;

      newUsers.push({
        id: `HSU-${Date.now()}-${i}`,
        username,
        password,
        profile: params.profile,
        duration,
        price,
        status: 'UNUSED',
        reseller: resellerObj?.name,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        comment: `Batch #${params.prefix}${params.charSet}`
      });

      newVouchers.push({
        code: username,
        profile: params.profile,
        duration,
        price,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'UNUSED'
      });
    }

    setHotspotUsers((prev) => [...newUsers, ...prev]);
    setVouchers((prev) => [...newVouchers, ...prev]);

    if (resellerObj && params.deductBalance) {
      const totalCost = wholesalePrice * params.count;
      setHotspotResellers((prev) =>
        prev.map((r) =>
          r.id === resellerObj.id
            ? {
                ...r,
                balance: Math.max(0, r.balance - totalCost),
                totalVouchersSold: r.totalVouchersSold + params.count,
                totalSalesRp: r.totalSalesRp + (price * params.count)
              }
            : r
        )
      );
    }
  };

  const handleAddHotspotProfile = (profile: HotspotProfile) => {
    setHotspotProfiles((prev) => [...prev, profile]);
  };

  const handleEditHotspotProfile = (profile: HotspotProfile) => {
    setHotspotProfiles((prev) => prev.map((p) => (p.id === profile.id ? profile : p)));
  };

  const handleDeleteHotspotProfile = (id: string) => {
    setHotspotProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleKickHotspotSession = (sessionId: string) => {
    setHotspotSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleKickAllHotspotSessions = () => {
    setHotspotSessions([]);
  };

  const handleAddHotspotReseller = (reseller: HotspotReseller) => {
    setHotspotResellers((prev) => [...prev, reseller]);
  };

  const handleTopupHotspotReseller = (resellerId: string, amount: number) => {
    setHotspotResellers((prev) =>
      prev.map((r) => (r.id === resellerId ? { ...r, balance: r.balance + amount } : r))
    );
  };

  const handleUpdateHotspotTemplate = (template: HotspotTemplate) => {
    setHotspotTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
  };

  // OLT CRUD Handlers
  const handleProvisionOnu = (sn: string, customerName: string, pppoeUser: string, odpId: string, odpPort: number) => {
    // Remove from unregistered
    setUnregisteredOnus((prev) => prev.filter((o) => o.sn !== sn));

    // Add to registered
    const newRegistered: RegisteredONU = {
      id: `ONU-${Date.now()}`,
      sn,
      customerName,
      pppoeUser,
      oltId: 'OLT-ZTE-C320-KOTA',
      ponPort: 'gpon-olt_1/1/4:1',
      rxPowerDbm: -19.45,
      txPowerDbm: 2.30,
      distanceKm: 1.68,
      status: 'ONLINE',
      cpeModel: 'ZTE F670L DualBand',
      odpCode: odps.find((o) => o.id === odpId)?.code || 'ODP-KTA-01'
    };
    setRegisteredOnus((prev) => [newRegistered, ...prev]);

    // Update ODP Port count
    setOdps((prev) =>
      prev.map((o) => (o.id === odpId ? { ...o, usedPorts: o.usedPorts + 1 } : o))
    );

    showToast(`🎉 ONU ${sn} berhasil diprovisioning ke OLT & dihubungkan ke ${newRegistered.odpCode} Port #${odpPort}!`);
  };

  const handleRebootOnu = (id: string) => {
    showToast(`Perintah remote reboot dikirim ke ONT via OLT SNMP. Perangkat sedang reboot...`);
  };

  const handleAddOlt = (olt: OLTDevice) => {
    setOlts((prev) => [...prev, olt]);
    showToast(`Hardware OLT ${olt.name} (${olt.ip}) berhasil ditambahkan!`);
  };

  const handleDeleteOlt = (oltId: string) => {
    setOlts((prev) => prev.filter((o) => o.id !== oltId));
    showToast(`OLT berhasil dihapus dari sistem.`);
  };

  const handleAddOnuManual = (onu: RegisteredONU) => {
    setRegisteredOnus((prev) => [onu, ...prev]);
    showToast(`ONT ${onu.sn} (${onu.customerName}) berhasil didaftarkan manual.`);
  };

  const handleEditOnu = (onu: RegisteredONU) => {
    setRegisteredOnus((prev) => prev.map((o) => (o.id === onu.id ? onu : o)));
    showToast(`Konfigurasi ONT ${onu.sn} berhasil diperbarui.`);
  };

  const handleDeleteOnu = (onuId: string) => {
    setRegisteredOnus((prev) => prev.filter((o) => o.id !== onuId));
    showToast(`ONT berhasil di-unbind & dihapus dari OLT.`);
  };

  // GenieACS CRUD Handlers
  const handleUpdateWifi = (deviceId: string, ssid24: string, ssid5?: string, password?: string) => {
    setCpes((prev) =>
      prev.map((c) =>
        c.deviceId === deviceId
          ? { ...c, ssid24, ssid5, wifiPassword: password || c.wifiPassword }
          : c
      )
    );
    showToast(`RPC SetParameterValues berhasil dikirim ke ONT! Nama Wi-Fi "${ssid24}" telah aktif.`);
  };

  const handleRebootCpe = (deviceId: string) => {
    showToast(`RPC TR-069 Reboot CPE terkirim ke ONT via GenieACS.`);
  };

  const handleAddCpe = (cpe: GenieACSCPE) => {
    setCpes((prev) => [cpe, ...prev]);
    showToast(`Preset TR-069 CPE ${cpe.serialNumber} (${cpe.customerName}) berhasil dibuat!`);
  };

  const handleDeleteCpe = (deviceId: string) => {
    setCpes((prev) => prev.filter((c) => c.deviceId !== deviceId));
    showToast(`CPE perangkat berhasil dihapus dari GenieACS.`);
  };

  // GIS ODC / ODP CRUD Handlers
  const handleAddOdc = (odc: ODCPoint) => {
    setOdcs((prev) => [...prev, odc]);
    showToast(`ODC Kabinet ${odc.code} (${odc.name}) berhasil dipetakan!`);
  };

  const handleEditOdc = (odc: ODCPoint) => {
    setOdcs((prev) => prev.map((o) => (o.id === odc.id ? odc : o)));
    showToast(`Data ODC ${odc.code} berhasil diperbarui.`);
  };

  const handleDeleteOdc = (odcId: string) => {
    setOdcs((prev) => prev.filter((o) => o.id !== odcId));
    showToast(`ODC berhasil dihapus dari peta.`);
  };

  const handleAddOdp = (odp: ODPPoint) => {
    setOdps((prev) => [...prev, odp]);
    showToast(`ODP Kotak ${odp.code} (${odp.name}) berhasil dipasang di ODC!`);
  };

  const handleEditOdp = (odp: ODPPoint) => {
    setOdps((prev) => prev.map((o) => (o.id === odp.id ? odp : o)));
    showToast(`Data ODP ${odp.code} berhasil diperbarui.`);
  };

  const handleDeleteOdp = (odpId: string) => {
    setOdps((prev) => prev.filter((o) => o.id !== odpId));
    showToast(`ODP berhasil dihapus dari jaringan GIS.`);
  };

  const handleAddCable = (cable: CableRoute) => {
    setCables((prev) => [...prev, cable]);
    showToast(`Jalur Kabel Optik "${cable.name}" (${cable.coreCount} Core, ${cable.totalLengthMeters}m) berhasil ditambahkan!`);
  };

  const handleEditCable = (cable: CableRoute) => {
    setCables((prev) => prev.map((c) => (c.id === cable.id ? cable : c)));
    showToast(`Rute kabel optik ${cable.name} berhasil diperbarui.`);
  };

  const handleDeleteCable = (cableId: string) => {
    setCables((prev) => prev.filter((c) => c.id !== cableId));
    showToast(`Jalur kabel optik berhasil dihapus dari peta.`);
  };

  // Billing CRUD Handlers
  const handlePayInvoice = (invoiceId: string, method?: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'CASH_KASIR' | 'INDOMARET') => {
    const payMethod = method || 'QRIS';
    const paidInvoice = invoices.find((i) => i.id === invoiceId);

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'PAID' as const,
              paymentMethod: payMethod,
              paidAt: '2026-09-28 22:25:00'
            }
          : inv
      )
    );

    // Auto UN-ISOLATE client in MikroTik
    if (paidInvoice) {
      setClients((prev) =>
        prev.map((c) =>
          c.username === paidInvoice.pppoeUser ? { ...c, status: 'ACTIVE' as const } : c
        )
      );

      // Trigger automatic WhatsApp Kwitansi
      const receiptLog: WhatsAppLog = {
        id: `WA-RECEIPT-${Date.now()}`,
        recipientPhone: paidInvoice.phone,
        recipientName: paidInvoice.customerName,
        category: 'KWITANSI',
        message: `Terima kasih Bpk/Ibu ${paidInvoice.customerName}! Pembayaran tagihan internet Rp ${paidInvoice.totalAmount.toLocaleString('id-ID')} via ${payMethod} telah KAMI TERIMA. Layanan otomatis normal kembali.`,
        status: 'DELIVERED',
        timestamp: '2026-09-28 22:25:05'
      };
      setWaLogs((prev) => [receiptLog, ...prev]);
    }

    showToast(`✅ Pembayaran Faktur ${paidInvoice?.invoiceNumber} Berhasil! Pelanggan ${paidInvoice?.customerName} OTOMATIS BUKA ISOLIR realtime.`);
  };

  const handleGenerateMonthlyInvoices = () => {
    showToast(`Sukses membuat 4 tagihan periode bulan baru dengan kalkulasi PPN 11%!`);
  };

  const handleAddInvoice = (inv: Invoice) => {
    setInvoices((prev) => [inv, ...prev]);
    showToast(`Faktur tagihan ${inv.invoiceNumber} (${inv.customerName}) berhasil diterbitkan!`);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? inv : i)));
    showToast(`Data tagihan ${inv.invoiceNumber} berhasil diperbarui.`);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    showToast(`Faktur tagihan berhasil dibatalkan.`);
  };

  // WhatsApp Templates & Logs CRUD Handlers
  const handleSendBroadcast = (target: string, message: string) => {
    const newLog: WhatsAppLog = {
      id: `WA-BC-${Date.now()}`,
      recipientPhone: 'Multiple Recipients (Broadcast)',
      recipientName: `Target: ${target}`,
      category: 'BROADCAST_GANGGUAN',
      message,
      status: 'SENT',
      timestamp: '2026-09-28 22:30:00'
    };
    setWaLogs((prev) => [newLog, ...prev]);
    showToast(`Pesan broadcast berhasil diantrekan ke WhatsApp Gateway!`);
  };

  const handleAddTemplate = (tpl: Omit<WATemplate, 'id'>) => {
    const newTpl: WATemplate = {
      ...tpl,
      id: `TMP-${Date.now()}`
    };
    setWaTemplates((prev) => [...prev, newTpl]);
    showToast(`Template pesan "${newTpl.name}" berhasil ditambahkan!`);
  };

  const handleEditTemplate = (tpl: WATemplate) => {
    setWaTemplates((prev) => prev.map((t) => (t.id === tpl.id ? tpl : t)));
    showToast(`Template "${tpl.name}" berhasil diperbarui.`);
  };

  const handleDeleteTemplate = (id: string) => {
    setWaTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast(`Template pesan WhatsApp dihapus.`);
  };

  const handleDeleteWaLog = (id: string) => {
    setWaLogs((prev) => prev.filter((l) => l.id !== id));
    showToast(`Log pesan WhatsApp dihapus.`);
  };

  // Ticketing CRUD Handlers
  const handleResolveTicket = (ticketId: string, finalDbm: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'RESOLVED' as const, finalDbm } : t))
    );
    showToast(`Tiket berhasil diselesaikan! Redaman akhir optik tercatat: ${finalDbm} dBm.`);
  };

  const handleAssignTechnician = (ticketId: string, technicianName: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, technicianName, status: 'ASSIGNED' as const } : t))
    );
  };

  const handleAddTicket = (ticket: Omit<TroubleTicket, 'id' | 'ticketNumber' | 'createdAt'>) => {
    const newTicket: TroubleTicket = {
      ...ticket,
      id: `TCK-${Date.now()}`,
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setTickets((prev) => [newTicket, ...prev]);
    showToast(`Tiket gangguan ${newTicket.ticketNumber} (${newTicket.customerName}) berhasil dibuat!`);
  };

  const handleEditTicket = (ticket: TroubleTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticket : t)));
    showToast(`Tiket ${ticket.ticketNumber} berhasil diperbarui.`);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    showToast(`Tiket gangguan berhasil dihapus.`);
  };

  // Customer Report Trouble
  const handleCustomerReportTicket = (title: string, desc: string) => {
    const newTicket: TroubleTicket = {
      id: `TCK-${Date.now()}`,
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: clients[0].fullName,
      pppoeUser: clients[0].username,
      phone: clients[0].phone,
      odpCode: clients[0].odpId,
      title,
      description: desc,
      priority: 'MEDIUM',
      status: 'OPEN',
      createdAt: '2026-09-28 22:35'
    };
    setTickets((prev) => [newTicket, ...prev]);
    showToast(`Laporan keluhan "${title}" berhasil dikirim ke NOC. Nomor Tiket: ${newTicket.ticketNumber}.`);
  };

  // VPN Handlers
  const handleAddVpnAccount = (account: VpnAccount) => {
    setVpnAccounts((prev) => [account, ...prev]);
  };

  const handleEditVpnAccount = (account: VpnAccount) => {
    setVpnAccounts((prev) => prev.map((a) => (a.id === account.id ? account : a)));
  };

  const handleDeleteVpnAccount = (id: string) => {
    setVpnAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleVpnStatus = (id: string) => {
    setVpnAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED' } : a
      )
    );
  };

  // FreeRADIUS Handlers
  const handleAddNasClient = (nas: RadiusNasClient) => {
    setRadiusNasClients((prev) => [nas, ...prev]);
    showToast(`Router NAS "${nas.shortname}" (${nas.nasname}) berhasil didaftarkan ke FreeRADIUS!`);
  };

  const handleEditNasClient = (nas: RadiusNasClient) => {
    setRadiusNasClients((prev) => prev.map((item) => (item.id === nas.id ? nas : item)));
    showToast(`Router NAS "${nas.shortname}" berhasil diperbarui.`);
  };

  const handleDeleteNasClient = (nasId: string) => {
    setRadiusNasClients((prev) => prev.filter((item) => item.id !== nasId));
    showToast('Router NAS berhasil dihapus dari daftar FreeRADIUS.');
  };

  const handleAddRadiusGroup = (group: RadiusGroupProfile) => {
    setRadiusGroups((prev) => [group, ...prev]);
    showToast(`Profil RADIUS "${group.groupname}" berhasil ditambahkan ke radgroupreply!`);
  };

  const handleEditRadiusGroup = (group: RadiusGroupProfile) => {
    setRadiusGroups((prev) => prev.map((item) => (item.id === group.id ? group : item)));
    showToast(`Profil RADIUS "${group.groupname}" berhasil diperbarui.`);
  };

  const handleDeleteRadiusGroup = (groupId: string) => {
    setRadiusGroups((prev) => prev.filter((item) => item.id !== groupId));
    showToast('Profil RADIUS berhasil dihapus.');
  };

  const handleKickRadiusSession = (username: string, nasIp: string) => {
    showToast(`⚡ Paket CoA Disconnect (RFC 3576) terkirim ke ${nasIp}:3799 untuk user "${username}". Sesi berhasil diputus!`);
  };

  const handleRestartRadiusDaemon = () => {
    showToast('Mengirim perintah "sudo systemctl restart freeradius"... Layanan FreeRADIUS berhasil direstart!');
  };

  return (
    <div className="app-layout">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-cyan)',
            color: 'var(--text-primary)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: '460px',
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'pulseGlow 0.3s ease-out'
          }}
        >
          <CheckCircle size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Modern Collapsible Sidebar (RadbooX Style) */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentRole={role}
        unregisteredCount={unregisteredOnus.length}
        pendingTicketsCount={tickets.filter((t) => t.status !== 'RESOLVED').length}
        unpaidInvoicesCount={invoices.filter((i) => i.status !== 'PAID').length}
        routersCount={routers.length}
        clientsCount={clients.length}
        activePppoeCount={clients.filter((c) => c.status === 'ACTIVE').length}
        hotspotUsersCount={hotspotUsers.length}
        activeHotspotSessionsCount={hotspotSessions.length}
        resellersCount={hotspotResellers.length}
        vpnActiveCount={vpnAccounts.filter((a) => a.status === 'CONNECTED').length}
      />

      {/* Main Content & Top Header Wrapper */}
      <div className="app-main-wrapper">
        <Navbar
          currentRole={role}
          onRoleChange={setRole}
          theme={theme}
          onThemeToggle={handleToggleTheme}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSimulateAutoIsolir={handleSimulateAutoIsolir}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeTitle={
            activeNav === 'dashboard' ? 'Dashboard NOC & Ringkasan Eksekutif' :
            activeNav === 'pppoe_users' ? 'PPPoE - Manajemen User (CRUD Secrets Pelanggan)' :
            activeNav === 'pppoe_profiles' ? 'PPPoE - Profil Bandwidth (CRUD Profil Paket)' :
            activeNav === 'pppoe_sessions' ? 'PPPoE - Monitoring Active Sessions & Kick CoA' :
            activeNav === 'pppoe_settings' ? 'PPPoE - Pengaturan Kebijakan Isolir Pelanggan' :
            activeNav === 'hotspot_users' ? 'Hotspot - Manajemen User & Voucher' :
            activeNav === 'hotspot_profiles' ? 'Hotspot - Profil Bandwidth & Paket Kuota' :
            activeNav === 'hotspot_sessions' ? 'Hotspot - Monitoring Sesi Aktif & CoA Kick' :
            activeNav === 'hotspot_resellers' ? 'Hotspot - Manajemen Mitra & Reseller Agen' :
            activeNav === 'hotspot_templates' ? 'Hotspot - Desain Template Struk & Captive Portal' :
            activeNav === 'vouchers' ? 'Manajemen Voucher Hotspot' :
            activeNav === 'routers' ? 'Router MikroTik (NAS) & ROS v7' :
            activeNav === 'olt' ? 'Multi-OLT Hardware & GPON Management' :
            activeNav === 'genieacs' ? 'GenieACS (TR-069) Remote ONT Manager' :
            activeNav === 'gis' ? 'Peta GIS ODC / ODP & Topologi Fiber Optik' :
            activeNav === 'vpn' ? 'VPN Tunnel & Remote Winbox Gateway' :
            activeNav === 'gateway' ? 'Server Gateway Ubuntu & Cloudflare Tunnel Zero Trust' :
            activeNav === 'billing' ? 'Billing & Multi-Payment Gateway' :
            activeNav === 'whatsapp' ? 'WhatsApp Gateway Multi-Device & Notification' :
            activeNav === 'tickets' ? 'Trouble Ticketing & Field Force SPK' :
            'Portal Mandiri Pelanggan'
          }
        />

        {/* Main Content Area */}
        <main className="main-viewport">
          {role === 'PELANGGAN' ? (
            <Routes>
              <Route
                path="*"
                element={
                  <CustomerPortalModule
                    client={clients[0]}
                    invoice={invoices.find((i) => i.pppoeUser === clients[0].username)}
                    cpe={cpes.find((c) => c.pppoeUser === clients[0].username)}
                    onPayInvoice={handlePayInvoice}
                    onUpdateWifi={handleUpdateWifi}
                    onReportTicket={handleCustomerReportTicket}
                  />
                }
              />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <DashboardOverview
                    routers={routers}
                    clients={clients}
                    olts={olts}
                    onus={registeredOnus}
                    invoices={invoices}
                    tickets={tickets}
                    onNavigateTab={handleNavigateTab}
                    onOpenQuickProvision={() => navigate('/olt')}
                    onSimulateAutoIsolir={handleSimulateAutoIsolir}
                  />
                }
              />

              <Route path="/pppoe" element={<Navigate to="/pppoe/users" replace />} />
              <Route
                path="/pppoe/users"
                element={
                  <PppoeModule
                    activeSubPage="users"
                    onSelectSubPage={(page) => navigate(`/pppoe/${page}`)}
                    clients={clients}
                    profiles={profiles}
                    routers={routers}
                    onAddClient={handleAddClient}
                    onEditClient={handleEditClient}
                    onDeleteClient={handleDeleteClient}
                    onToggleClientIsolir={handleToggleClientIsolir}
                    onKickSession={handleKickSession}
                    onAddProfile={handleAddProfile}
                    onDeleteProfile={handleDeleteProfile}
                    onSimulateAutoIsolir={handleSimulateAutoIsolir}
                  />
                }
              />
              <Route
                path="/pppoe/profiles"
                element={
                  <PppoeModule
                    activeSubPage="profiles"
                    onSelectSubPage={(page) => navigate(`/pppoe/${page}`)}
                    clients={clients}
                    profiles={profiles}
                    routers={routers}
                    onAddClient={handleAddClient}
                    onEditClient={handleEditClient}
                    onDeleteClient={handleDeleteClient}
                    onToggleClientIsolir={handleToggleClientIsolir}
                    onKickSession={handleKickSession}
                    onAddProfile={handleAddProfile}
                    onDeleteProfile={handleDeleteProfile}
                    onSimulateAutoIsolir={handleSimulateAutoIsolir}
                  />
                }
              />
              <Route
                path="/pppoe/sessions"
                element={
                  <PppoeModule
                    activeSubPage="sessions"
                    onSelectSubPage={(page) => navigate(`/pppoe/${page}`)}
                    clients={clients}
                    profiles={profiles}
                    routers={routers}
                    onAddClient={handleAddClient}
                    onEditClient={handleEditClient}
                    onDeleteClient={handleDeleteClient}
                    onToggleClientIsolir={handleToggleClientIsolir}
                    onKickSession={handleKickSession}
                    onAddProfile={handleAddProfile}
                    onDeleteProfile={handleDeleteProfile}
                    onSimulateAutoIsolir={handleSimulateAutoIsolir}
                  />
                }
              />
              <Route
                path="/pppoe/settings"
                element={
                  <PppoeModule
                    activeSubPage="settings"
                    onSelectSubPage={(page) => navigate(`/pppoe/${page}`)}
                    clients={clients}
                    profiles={profiles}
                    routers={routers}
                    onAddClient={handleAddClient}
                    onEditClient={handleEditClient}
                    onDeleteClient={handleDeleteClient}
                    onToggleClientIsolir={handleToggleClientIsolir}
                    onKickSession={handleKickSession}
                    onAddProfile={handleAddProfile}
                    onDeleteProfile={handleDeleteProfile}
                    onSimulateAutoIsolir={handleSimulateAutoIsolir}
                  />
                }
              />

              <Route path="/hotspot" element={<Navigate to="/hotspot/users" replace />} />
              <Route
                path="/hotspot/users"
                element={
                  <HotspotModule
                    activeSubPage="users"
                    onSelectSubPage={(page) => navigate(`/hotspot/${page}`)}
                    users={hotspotUsers}
                    profiles={hotspotProfiles}
                    sessions={hotspotSessions}
                    resellers={hotspotResellers}
                    templates={hotspotTemplates}
                    onAddUser={handleAddHotspotUser}
                    onEditUser={handleEditHotspotUser}
                    onDeleteUser={handleDeleteHotspotUser}
                    onBatchGenerateUsers={handleBatchGenerateHotspotUsers}
                    onAddProfile={handleAddHotspotProfile}
                    onEditProfile={handleEditHotspotProfile}
                    onDeleteProfile={handleDeleteHotspotProfile}
                    onKickSession={handleKickHotspotSession}
                    onKickAllSessions={handleKickAllHotspotSessions}
                    onAddReseller={handleAddHotspotReseller}
                    onTopupReseller={handleTopupHotspotReseller}
                    onUpdateTemplate={handleUpdateHotspotTemplate}
                  />
                }
              />
              <Route
                path="/hotspot/profiles"
                element={
                  <HotspotModule
                    activeSubPage="profiles"
                    onSelectSubPage={(page) => navigate(`/hotspot/${page}`)}
                    users={hotspotUsers}
                    profiles={hotspotProfiles}
                    sessions={hotspotSessions}
                    resellers={hotspotResellers}
                    templates={hotspotTemplates}
                    onAddUser={handleAddHotspotUser}
                    onEditUser={handleEditHotspotUser}
                    onDeleteUser={handleDeleteHotspotUser}
                    onBatchGenerateUsers={handleBatchGenerateHotspotUsers}
                    onAddProfile={handleAddHotspotProfile}
                    onEditProfile={handleEditHotspotProfile}
                    onDeleteProfile={handleDeleteHotspotProfile}
                    onKickSession={handleKickHotspotSession}
                    onKickAllSessions={handleKickAllHotspotSessions}
                    onAddReseller={handleAddHotspotReseller}
                    onTopupReseller={handleTopupHotspotReseller}
                    onUpdateTemplate={handleUpdateHotspotTemplate}
                  />
                }
              />
              <Route
                path="/hotspot/sessions"
                element={
                  <HotspotModule
                    activeSubPage="sessions"
                    onSelectSubPage={(page) => navigate(`/hotspot/${page}`)}
                    users={hotspotUsers}
                    profiles={hotspotProfiles}
                    sessions={hotspotSessions}
                    resellers={hotspotResellers}
                    templates={hotspotTemplates}
                    onAddUser={handleAddHotspotUser}
                    onEditUser={handleEditHotspotUser}
                    onDeleteUser={handleDeleteHotspotUser}
                    onBatchGenerateUsers={handleBatchGenerateHotspotUsers}
                    onAddProfile={handleAddHotspotProfile}
                    onEditProfile={handleEditHotspotProfile}
                    onDeleteProfile={handleDeleteHotspotProfile}
                    onKickSession={handleKickHotspotSession}
                    onKickAllSessions={handleKickAllHotspotSessions}
                    onAddReseller={handleAddHotspotReseller}
                    onTopupReseller={handleTopupHotspotReseller}
                    onUpdateTemplate={handleUpdateHotspotTemplate}
                  />
                }
              />
              <Route
                path="/hotspot/resellers"
                element={
                  <HotspotModule
                    activeSubPage="resellers"
                    onSelectSubPage={(page) => navigate(`/hotspot/${page}`)}
                    users={hotspotUsers}
                    profiles={hotspotProfiles}
                    sessions={hotspotSessions}
                    resellers={hotspotResellers}
                    templates={hotspotTemplates}
                    onAddUser={handleAddHotspotUser}
                    onEditUser={handleEditHotspotUser}
                    onDeleteUser={handleDeleteHotspotUser}
                    onBatchGenerateUsers={handleBatchGenerateHotspotUsers}
                    onAddProfile={handleAddHotspotProfile}
                    onEditProfile={handleEditHotspotProfile}
                    onDeleteProfile={handleDeleteHotspotProfile}
                    onKickSession={handleKickHotspotSession}
                    onKickAllSessions={handleKickAllHotspotSessions}
                    onAddReseller={handleAddHotspotReseller}
                    onTopupReseller={handleTopupHotspotReseller}
                    onUpdateTemplate={handleUpdateHotspotTemplate}
                  />
                }
              />
              <Route
                path="/hotspot/templates"
                element={
                  <HotspotModule
                    activeSubPage="templates"
                    onSelectSubPage={(page) => navigate(`/hotspot/${page}`)}
                    users={hotspotUsers}
                    profiles={hotspotProfiles}
                    sessions={hotspotSessions}
                    resellers={hotspotResellers}
                    templates={hotspotTemplates}
                    onAddUser={handleAddHotspotUser}
                    onEditUser={handleEditHotspotUser}
                    onDeleteUser={handleDeleteHotspotUser}
                    onBatchGenerateUsers={handleBatchGenerateHotspotUsers}
                    onAddProfile={handleAddHotspotProfile}
                    onEditProfile={handleEditHotspotProfile}
                    onDeleteProfile={handleDeleteHotspotProfile}
                    onKickSession={handleKickHotspotSession}
                    onKickAllSessions={handleKickAllHotspotSessions}
                    onAddReseller={handleAddHotspotReseller}
                    onTopupReseller={handleTopupHotspotReseller}
                    onUpdateTemplate={handleUpdateHotspotTemplate}
                  />
                }
              />

              <Route
                path="/mikrotik"
                element={
                  <MikrotikModule
                    routers={routers}
                    clients={clients}
                    vouchers={vouchers}
                    profiles={profiles}
                    initialSubTab={mikrotikSubTab}
                    onToggleClientIsolir={handleToggleClientIsolir}
                    onKickSession={handleKickSession}
                    onGenerateVouchers={handleGenerateVouchers}
                    onAddClient={handleAddClient}
                    onEditClient={handleEditClient}
                    onDeleteClient={handleDeleteClient}
                    onAddRouter={handleAddRouter}
                    onDeleteRouter={handleDeleteRouter}
                    onAddProfile={handleAddProfile}
                    onDeleteProfile={handleDeleteProfile}
                    onDeleteVoucher={handleDeleteVoucher}
                  />
                }
              />

              <Route
                path="/olt"
                element={
                  <OltModule
                    olts={olts}
                    unregisteredOnus={unregisteredOnus}
                    registeredOnus={registeredOnus}
                    odps={odps}
                    odcs={odcs}
                    clients={clients}
                    onProvisionOnu={handleProvisionOnu}
                    onRebootOnu={handleRebootOnu}
                    onAddOlt={handleAddOlt}
                    onDeleteOlt={handleDeleteOlt}
                    onDeleteOnu={handleDeleteOnu}
                    onEditOnu={handleEditOnu}
                    onAddOnuManual={handleAddOnuManual}
                  />
                }
              />

              <Route
                path="/genieacs"
                element={
                  <GenieAcsModule
                    cpes={cpes}
                    onUpdateWifi={handleUpdateWifi}
                    onRebootCpe={handleRebootCpe}
                    onAddCpe={handleAddCpe}
                    onDeleteCpe={handleDeleteCpe}
                  />
                }
              />

              <Route
                path="/gis"
                element={
                  <GisMapModule
                    odcs={odcs}
                    odps={odps}
                    cables={cables}
                    clients={clients}
                    theme={theme}
                    onSelectOdpForProvisioning={() => navigate('/olt')}
                    onAddOdc={handleAddOdc}
                    onEditOdc={handleEditOdc}
                    onDeleteOdc={handleDeleteOdc}
                    onAddOdp={handleAddOdp}
                    onEditOdp={handleEditOdp}
                    onDeleteOdp={handleDeleteOdp}
                    onAddCable={handleAddCable}
                    onEditCable={handleEditCable}
                    onDeleteCable={handleDeleteCable}
                    onEditClient={handleEditClient}
                  />
                }
              />

              <Route
                path="/vpn"
                element={
                  <VpnModule
                    accounts={vpnAccounts}
                    servers={vpnServers}
                    onAddAccount={handleAddVpnAccount}
                    onEditAccount={handleEditVpnAccount}
                    onDeleteAccount={handleDeleteVpnAccount}
                    onToggleAccountStatus={handleToggleVpnStatus}
                  />
                }
              />

              <Route
                path="/gateway"
                element={
                  <UbuntuGatewayModule
                    tunnel={cfTunnel}
                    ingressRules={ingressRules}
                    gatewaySettings={ubuntuSettings}
                    onUpdateTunnel={setCfTunnel}
                    onUpdateGatewaySettings={setUbuntuSettings}
                    onAddIngressRule={(r) => setIngressRules((prev) => [r, ...prev])}
                    onEditIngressRule={(r) => setIngressRules((prev) => prev.map((item) => (item.id === r.id ? r : item)))}
                    onDeleteIngressRule={(id) => setIngressRules((prev) => prev.filter((item) => item.id !== id))}
                    onToggleIngressRule={(id) =>
                      setIngressRules((prev) =>
                        prev.map((item) =>
                          item.id === id ? { ...item, status: item.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : item
                        )
                      )
                    }
                  />
                }
              />

              <Route path="/vpn/gateway" element={<Navigate to="/gateway" replace />} />

              <Route
                path="/radius"
                element={
                  <FreeRadiusModule
                    serverConfig={radiusConfig}
                    nasClients={radiusNasClients}
                    groupProfiles={radiusGroups}
                    sessions={radiusSessions}
                    routers={routers}
                    onAddNasClient={handleAddNasClient}
                    onEditNasClient={handleEditNasClient}
                    onDeleteNasClient={handleDeleteNasClient}
                    onAddGroupProfile={handleAddRadiusGroup}
                    onEditGroupProfile={handleEditRadiusGroup}
                    onDeleteGroupProfile={handleDeleteRadiusGroup}
                    onKickRadiusSession={handleKickRadiusSession}
                    onRestartDaemon={handleRestartRadiusDaemon}
                  />
                }
              />

              <Route
                path="/billing"
                element={
                  <BillingModule
                    invoices={invoices}
                    clients={clients}
                    onPayInvoice={handlePayInvoice}
                    onGenerateMonthlyInvoices={handleGenerateMonthlyInvoices}
                    onAddInvoice={handleAddInvoice}
                    onEditInvoice={handleEditInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                  />
                }
              />

              <Route
                path="/whatsapp"
                element={
                  <WhatsAppModule
                    logs={waLogs}
                    templates={waTemplates}
                    clients={clients}
                    odps={odps}
                    onSendBroadcast={handleSendBroadcast}
                    onAddTemplate={handleAddTemplate}
                    onEditTemplate={handleEditTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                    onDeleteLog={handleDeleteWaLog}
                  />
                }
              />

              <Route
                path="/tickets"
                element={
                  <TicketingModule
                    tickets={tickets}
                    clients={clients}
                    odps={odps}
                    onAddTicket={handleAddTicket}
                    onEditTicket={handleEditTicket}
                    onDeleteTicket={handleDeleteTicket}
                    onResolveTicket={handleResolveTicket}
                    onAssignTechnician={handleAssignTechnician}
                  />
                }
              />

              <Route
                path="/portal"
                element={
                  <CustomerPortalModule
                    client={clients[0]}
                    invoice={invoices.find((i) => i.pppoeUser === clients[0].username)}
                    cpe={cpes.find((c) => c.pppoeUser === clients[0].username)}
                    onPayInvoice={handlePayInvoice}
                    onUpdateWifi={handleUpdateWifi}
                    onReportTicket={handleCustomerReportTicket}
                  />
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
