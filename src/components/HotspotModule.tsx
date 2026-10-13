import React, { useState } from 'react';
import {
  Ticket,
  Users,
  Sliders,
  Activity,
  Store,
  LayoutTemplate,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  RefreshCw,
  Printer,
  Copy,
  Eye,
  EyeOff,
  Zap,
  QrCode,
  DollarSign,
  Phone,
  Layers,
  Smartphone,
  CheckCircle2,
  Lock,
  Unlock,
  Coins,
  ShieldCheck,
  Download,
  AlertTriangle
} from 'lucide-react';
import {
  HotspotUser,
  HotspotProfile,
  HotspotSession,
  HotspotReseller,
  HotspotTemplate
} from '../types';

interface HotspotModuleProps {
  activeSubPage: 'users' | 'profiles' | 'sessions' | 'resellers' | 'templates';
  onSelectSubPage: (page: 'users' | 'profiles' | 'sessions' | 'resellers' | 'templates') => void;
  users: HotspotUser[];
  profiles: HotspotProfile[];
  sessions: HotspotSession[];
  resellers: HotspotReseller[];
  templates: HotspotTemplate[];
  onAddUser: (user: HotspotUser) => void;
  onEditUser: (user: HotspotUser) => void;
  onDeleteUser: (id: string) => void;
  onBatchGenerateUsers: (params: {
    profile: string;
    count: number;
    prefix: string;
    charLength: number;
    userMode: 'USER_EQUALS_PASSWORD' | 'USER_AND_PASSWORD';
    charSet: 'NUMERIC' | 'ALPHANUMERIC' | 'UPPERCASE';
    resellerId?: string;
    deductBalance?: boolean;
  }) => void;
  onAddProfile: (profile: HotspotProfile) => void;
  onEditProfile: (profile: HotspotProfile) => void;
  onDeleteProfile: (id: string) => void;
  onKickSession: (sessionId: string) => void;
  onKickAllSessions: () => void;
  onAddReseller: (reseller: HotspotReseller) => void;
  onTopupReseller: (resellerId: string, amount: number, note: string) => void;
  onUpdateTemplate: (template: HotspotTemplate) => void;
}

export const HotspotModule: React.FC<HotspotModuleProps> = ({
  activeSubPage,
  onSelectSubPage,
  users,
  profiles,
  sessions,
  resellers,
  templates,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onBatchGenerateUsers,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  onKickSession,
  onKickAllSessions,
  onAddReseller,
  onTopupReseller,
  onUpdateTemplate
}) => {
  // USER TAB STATES
  const [userSearch, setUserSearch] = useState('');
  const [userProfileFilter, setUserProfileFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'UNUSED' | 'ACTIVE' | 'USED' | 'EXPIRED'>('ALL');
  const [userResellerFilter, setUserResellerFilter] = useState('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [userPageSize, setUserPageSize] = useState<number>(10);
  const [userCurrentPage, setUserCurrentPage] = useState<number>(1);
  const [batchPrintUsers, setBatchPrintUsers] = useState<HotspotUser[] | null>(null);

  // Modals for User
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<HotspotUser | null>(null);
  const [thermalPrintUser, setThermalPrintUser] = useState<HotspotUser | null>(null);

  // Batch Generator Form State
  const [batchProfile, setBatchProfile] = useState(profiles[0]?.name || 'HS-2JAM-10MBPS');
  const [batchCount, setBatchCount] = useState(10);
  const [batchPrefix, setBatchPrefix] = useState('SC-');
  const [batchCharLength, setBatchCharLength] = useState(5);
  const [batchUserMode, setBatchUserMode] = useState<'USER_EQUALS_PASSWORD' | 'USER_AND_PASSWORD'>('USER_EQUALS_PASSWORD');
  const [batchCharSet, setBatchCharSet] = useState<'NUMERIC' | 'ALPHANUMERIC' | 'UPPERCASE'>('NUMERIC');
  const [batchReseller, setBatchReseller] = useState('');
  const [batchDeductBalance, setBatchDeductBalance] = useState(true);

  // Single User Form State
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formProfile, setFormProfile] = useState(profiles[0]?.name || 'HS-2JAM-10MBPS');
  const [formDuration, setFormDuration] = useState('2 Jam');
  const [formPrice, setFormPrice] = useState(3000);
  const [formReseller, setFormReseller] = useState('');
  const [formComment, setFormComment] = useState('');

  // PROFILE TAB STATES
  const [profileSearch, setProfileSearch] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<HotspotProfile | null>(null);
  const [profName, setProfName] = useState('');
  const [profRateLimit, setProfRateLimit] = useState('10M/15M');
  const [profSharedUsers, setProfSharedUsers] = useState(1);
  const [profValidity, setProfValidity] = useState('24 Jam');
  const [profGracePeriod, setProfGracePeriod] = useState('10m');
  const [profPrice, setProfPrice] = useState(10000);
  const [profResellerPrice, setProfResellerPrice] = useState(8500);
  const [profUserLock, setProfUserLock] = useState<'MAC' | 'OFF'>('MAC');
  const [profPool, setProfPool] = useState('hs-pool-1');
  const [profDesc, setProfDesc] = useState('');

  // SESSION TAB STATES
  const [sessionSearch, setSessionSearch] = useState('');
  const [isRefreshingSessions, setIsRefreshingSessions] = useState(false);

  // RESELLER TAB STATES
  const [resellerSearch, setResellerSearch] = useState('');
  const [isAddResellerModalOpen, setIsAddResellerModalOpen] = useState(false);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [selectedResellerForTopup, setSelectedResellerForTopup] = useState<HotspotReseller | null>(null);
  const [topupAmount, setTopupAmount] = useState<number>(200000);
  const [topupMethod, setTopupMethod] = useState<'TRANSFER' | 'QRIS' | 'CASH'>('QRIS');
  const [topupNote, setTopupNote] = useState('Deposit Saldo Saldo Baru');

  // Form Reseller
  const [resellerName, setResellerName] = useState('');
  const [resellerOwner, setResellerOwner] = useState('');
  const [resellerPhone, setResellerPhone] = useState('0812');
  const [resellerAddress, setResellerAddress] = useState('');
  const [resellerInitialBalance, setResellerInitialBalance] = useState(250000);
  const [resellerCommission, setResellerCommission] = useState(15);

  // TEMPLATE TAB STATES
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || 'TPL-01');
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const [tplHeaderTitle, setTplHeaderTitle] = useState(currentTemplate?.headerTitle || 'SCORIP HOTSPOT NET');
  const [tplSubHeader, setTplSubHeader] = useState(currentTemplate?.subHeader || 'Internet Cepat & Hemat');
  const [tplFooterNote, setTplFooterNote] = useState(currentTemplate?.footerNote || 'Buka http://hotspot.scorip.net');
  const [tplShowQr, setTplShowQr] = useState(currentTemplate?.showQrCode ?? true);
  const [tplShowPrice, setTplShowPrice] = useState(currentTemplate?.showPrice ?? true);
  const [tplShowValidity, setTplShowValidity] = useState(currentTemplate?.showValidity ?? true);
  const [tplShowReseller, setTplShowReseller] = useState(currentTemplate?.showReseller ?? true);
  const [tplAccentColor, setTplAccentColor] = useState(currentTemplate?.accentColor || '#06b6d4');
  const [templateSavedToast, setTemplateSavedToast] = useState(false);

  // Update form fields when active template changes
  React.useEffect(() => {
    if (currentTemplate) {
      setTplHeaderTitle(currentTemplate.headerTitle);
      setTplSubHeader(currentTemplate.subHeader);
      setTplFooterNote(currentTemplate.footerNote);
      setTplShowQr(currentTemplate.showQrCode);
      setTplShowPrice(currentTemplate.showPrice);
      setTplShowValidity(currentTemplate.showValidity);
      setTplShowReseller(currentTemplate.showReseller);
      setTplAccentColor(currentTemplate.accentColor);
    }
  }, [selectedTemplateId]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ----------------------------------------------------
  // FILTERING
  // ----------------------------------------------------
  const filteredUsers = users.filter((u) => {
    if (userProfileFilter !== 'ALL' && u.profile !== userProfileFilter) return false;
    if (userStatusFilter !== 'ALL' && u.status !== userStatusFilter) return false;
    if (userResellerFilter !== 'ALL' && u.reseller !== userResellerFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        u.username.toLowerCase().includes(q) ||
        (u.reseller && u.reseller.toLowerCase().includes(q)) ||
        (u.comment && u.comment.toLowerCase().includes(q)) ||
        (u.ipAddress && u.ipAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unusedCount = users.filter((u) => u.status === 'UNUSED').length;
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const usedCount = users.filter((u) => u.status === 'USED').length;
  const expiredCount = users.filter((u) => u.status === 'EXPIRED').length;

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
  const displayedUsers = filteredUsers.slice(
    (userCurrentPage - 1) * userPageSize,
    userCurrentPage * userPageSize
  );

  const filteredSessions = sessions.filter((s) => {
    if (sessionSearch.trim()) {
      const q = sessionSearch.toLowerCase();
      return (
        s.username.toLowerCase().includes(q) ||
        s.ipAddress.toLowerCase().includes(q) ||
        s.macAddress.toLowerCase().includes(q) ||
        (s.hostname && s.hostname.toLowerCase().includes(q)) ||
        s.profile.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProfiles = profiles.filter((p) => {
    if (profileSearch.trim()) {
      const q = profileSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.rateLimit.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredResellers = resellers.filter((r) => {
    if (resellerSearch.trim()) {
      const q = resellerSearch.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ----------------------------------------------------
  // USER HANDLERS
  // ----------------------------------------------------
  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePrintSelectedVouchers = () => {
    const selected = users.filter((u) => selectedUserIds.includes(u.id));
    if (selected.length === 0) return;
    setBatchPrintUsers(selected);
  };

  const handleDeleteSelectedVouchers = () => {
    if (selectedUserIds.length === 0) return;
    if (confirm(`Yakin ingin menghapus ${selectedUserIds.length} voucher yang dipilih?`)) {
      selectedUserIds.forEach((id) => onDeleteUser(id));
      setSelectedUserIds([]);
      showToast(`${selectedUserIds.length} voucher terpilih berhasil dihapus.`);
    }
  };

  const handleTogglePassword = (id: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    showToast(`Kode "${code}" berhasil disalin ke clipboard!`);
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormUsername(`HS-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPassword(`${Math.floor(100 + Math.random() * 900)}`);
    setFormProfile(profiles[0]?.name || 'HS-2JAM-10MBPS');
    setFormDuration('2 Jam');
    setFormPrice(3000);
    setFormReseller('');
    setFormComment('User Hotspot dibuat manual');
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditUser = (user: HotspotUser) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormPassword(user.password || '');
    setFormProfile(user.profile);
    setFormDuration(user.duration || '24 Jam');
    setFormPrice(user.price);
    setFormReseller(user.reseller || '');
    setFormComment(user.comment || '');
    setIsAddUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) return;

    if (editingUser) {
      onEditUser({
        ...editingUser,
        username: formUsername.trim(),
        password: formPassword.trim() || undefined,
        profile: formProfile,
        duration: formDuration,
        price: formPrice,
        reseller: formReseller || undefined,
        comment: formComment || undefined
      });
      showToast(`User Hotspot ${formUsername} berhasil diperbarui.`);
    } else {
      const newUser: HotspotUser = {
        id: `HSU-${Date.now()}`,
        username: formUsername.trim(),
        password: formPassword.trim() || undefined,
        profile: formProfile,
        duration: formDuration,
        price: formPrice,
        status: 'UNUSED',
        reseller: formReseller || undefined,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        comment: formComment || undefined
      };
      onAddUser(newUser);
      showToast(`User Hotspot ${formUsername} berhasil ditambahkan!`);
    }
    setIsAddUserModalOpen(false);
  };

  const handleOpenBatchGenerator = () => {
    setBatchProfile(profiles[0]?.name || 'HS-2JAM-10MBPS');
    setBatchCount(10);
    setBatchPrefix('SC-');
    setBatchCharLength(5);
    setBatchUserMode('USER_EQUALS_PASSWORD');
    setBatchCharSet('NUMERIC');
    setBatchReseller(resellers[0]?.name || '');
    setBatchDeductBalance(true);
    setIsBatchModalOpen(true);
  };

  const handleExecuteBatchGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const selRes = resellers.find((r) => r.name === batchReseller);
    onBatchGenerateUsers({
      profile: batchProfile,
      count: batchCount,
      prefix: batchPrefix,
      charLength: batchCharLength,
      userMode: batchUserMode,
      charSet: batchCharSet,
      resellerId: selRes?.id,
      deductBalance: batchDeductBalance
    });
    setIsBatchModalOpen(false);
    showToast(`Berhasil men-generate ${batchCount} voucher hotspot untuk ${batchProfile}!`);
  };

  // ----------------------------------------------------
  // PROFILE HANDLERS
  // ----------------------------------------------------
  const handleOpenAddProfile = () => {
    setEditingProfile(null);
    setProfName('');
    setProfRateLimit('10M/15M');
    setProfSharedUsers(1);
    setProfValidity('24 Jam');
    setProfGracePeriod('10m');
    setProfPrice(10000);
    setProfResellerPrice(8500);
    setProfUserLock('MAC');
    setProfPool('hs-pool-1');
    setProfDesc('');
    setIsProfileModalOpen(true);
  };

  const handleOpenEditProfile = (p: HotspotProfile) => {
    setEditingProfile(p);
    setProfName(p.name);
    setProfRateLimit(p.rateLimit);
    setProfSharedUsers(p.sharedUsers);
    setProfValidity(p.validity);
    setProfGracePeriod(p.gracePeriod || '10m');
    setProfPrice(p.price);
    setProfResellerPrice(p.resellerPrice);
    setProfUserLock(p.userLock);
    setProfPool(p.addressPool);
    setProfDesc(p.description || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) return;

    if (editingProfile) {
      onEditProfile({
        ...editingProfile,
        name: profName.trim().toUpperCase(),
        rateLimit: profRateLimit.trim(),
        sharedUsers: profSharedUsers,
        validity: profValidity.trim(),
        gracePeriod: profGracePeriod.trim(),
        price: profPrice,
        resellerPrice: profResellerPrice,
        userLock: profUserLock,
        addressPool: profPool.trim(),
        description: profDesc.trim()
      });
      showToast(`Profil Hotspot ${profName} berhasil diperbarui.`);
    } else {
      const newProf: HotspotProfile = {
        id: `HPROF-${Date.now()}`,
        name: profName.trim().toUpperCase(),
        rateLimit: profRateLimit.trim(),
        sharedUsers: profSharedUsers,
        validity: profValidity.trim(),
        gracePeriod: profGracePeriod.trim(),
        price: profPrice,
        resellerPrice: profResellerPrice,
        userLock: profUserLock,
        addressPool: profPool.trim(),
        description: profDesc.trim()
      };
      onAddProfile(newProf);
      showToast(`Profil Hotspot ${profName} berhasil dibuat.`);
    }
    setIsProfileModalOpen(false);
  };

  // ----------------------------------------------------
  // SESSIONS HANDLERS
  // ----------------------------------------------------
  const handleRefreshSessions = () => {
    setIsRefreshingSessions(true);
    setTimeout(() => {
      setIsRefreshingSessions(false);
      showToast('Sesi hotspot real-time berhasil disegarkan.');
    }, 600);
  };

  // ----------------------------------------------------
  // RESELLER HANDLERS
  // ----------------------------------------------------
  const handleOpenAddReseller = () => {
    setResellerName('');
    setResellerOwner('');
    setResellerPhone('0812');
    setResellerAddress('');
    setResellerInitialBalance(250000);
    setResellerCommission(15);
    setIsAddResellerModalOpen(true);
  };

  const handleSaveAddReseller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellerName.trim()) return;

    const newRes: HotspotReseller = {
      id: `RSL-${Date.now()}`,
      name: resellerName.trim(),
      ownerName: resellerOwner.trim() || resellerName.trim(),
      phone: resellerPhone.trim(),
      address: resellerAddress.trim(),
      balance: resellerInitialBalance,
      commissionPercent: resellerCommission,
      totalVouchersSold: 0,
      totalSalesRp: 0,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString().substring(0, 10)
    };
    onAddReseller(newRes);
    setIsAddResellerModalOpen(false);
    showToast(`Mitra Reseller "${resellerName}" berhasil ditambahkan dengan saldo awal Rp${resellerInitialBalance.toLocaleString('id-ID')}!`);
  };

  const handleOpenTopup = (r: HotspotReseller) => {
    setSelectedResellerForTopup(r);
    setTopupAmount(200000);
    setTopupMethod('QRIS');
    setTopupNote('Top-up deposit voucher');
    setIsTopupModalOpen(true);
  };

  const handleSaveTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResellerForTopup) return;

    onTopupReseller(selectedResellerForTopup.id, topupAmount, `${topupMethod}: ${topupNote}`);
    setIsTopupModalOpen(false);
    showToast(`Saldo Reseller "${selectedResellerForTopup.name}" berhasil ditambah Rp${topupAmount.toLocaleString('id-ID')}!`);
  };

  // ----------------------------------------------------
  // TEMPLATE HANDLERS
  // ----------------------------------------------------
  const handleSaveTemplateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;

    onUpdateTemplate({
      ...currentTemplate,
      headerTitle: tplHeaderTitle,
      subHeader: tplSubHeader,
      footerNote: tplFooterNote,
      showQrCode: tplShowQr,
      showPrice: tplShowPrice,
      showValidity: tplShowValidity,
      showReseller: tplShowReseller,
      accentColor: tplAccentColor
    });

    setTemplateSavedToast(true);
    setTimeout(() => setTemplateSavedToast(false), 3000);
  };

  // Sample voucher for thermal preview
  const sampleVoucher = thermalPrintUser || users[0] || {
    id: 'DEMO',
    username: 'SCORIP-7821',
    password: '782',
    profile: 'HS-2JAM-10MBPS',
    duration: '2 Jam',
    price: 3000,
    reseller: 'Warkop Senja 24 Jam',
    createdAt: '2026-10-12 10:00',
    status: 'UNUSED'
  };

  return (
    <div className="hotspot-module">
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
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(234, 179, 8, 0.15)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ticket size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>SCORIP MikroTik Hotspot &amp; Voucher Engine</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Manajemen Terpadu: User Vouchers, Profil Paket, Live Active Sessions, Kemitraan Reseller, &amp; Cetak Struk Thermal
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="status-pill online">
              <span className="dot"></span>
              <span>{sessions.length} SESI AKTIF ONLINE</span>
            </div>
            <button className="btn-primary" onClick={handleOpenBatchGenerator}>
              <Zap size={15} />
              <span>Generate Voucher Massal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          className={`tab-btn ${activeSubPage === 'users' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('users')}
        >
          <Users size={16} />
          <span>User ({users.length})</span>
        </button>

        <button
          className={`tab-btn ${activeSubPage === 'profiles' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('profiles')}
        >
          <Sliders size={16} />
          <span>Profile ({profiles.length})</span>
        </button>

        <button
          className={`tab-btn ${activeSubPage === 'sessions' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('sessions')}
        >
          <Activity size={16} />
          <span>Session ({sessions.length} Aktif)</span>
        </button>

        <button
          className={`tab-btn ${activeSubPage === 'resellers' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('resellers')}
        >
          <Store size={16} />
          <span>Reseller ({resellers.length} Mitra)</span>
        </button>

        <button
          className={`tab-btn ${activeSubPage === 'templates' ? 'active' : ''}`}
          onClick={() => onSelectSubPage('templates')}
        >
          <LayoutTemplate size={16} />
          <span>Template ({templates.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBPAGE: USER */}
      {/* ========================================================================= */}
      {activeSubPage === 'users' && (
        <div>
          {/* Summary Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL VOUCHER / USER</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                {users.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                {users.filter((u) => u.status === 'UNUSED').length} siap pakai (Unused)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SEDANG AKTIF / DIGUNAKAN</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>
                {users.filter((u) => u.status === 'ACTIVE').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Terkoneksi ke AP Hotspot
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TERPAKAI / HABIS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-purple)' }}>
                {users.filter((u) => u.status === 'USED' || u.status === 'EXPIRED').length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Selesai kuota / masa aktif
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL NILAI NOMINAL</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-amber)' }}>
                Rp {users.reduce((acc, u) => acc + (u.price || 0), 0).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Dari seluruh batch voucher
              </div>
            </div>
          </div>

          {/* Status Quick Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            <button
              className={`tab-btn ${userStatusFilter === 'ALL' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              onClick={() => {
                setUserStatusFilter('ALL');
                setUserCurrentPage(1);
              }}
            >
              Semua ({users.length})
            </button>
            <button
              className={`tab-btn ${userStatusFilter === 'UNUSED' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              onClick={() => {
                setUserStatusFilter('UNUSED');
                setUserCurrentPage(1);
              }}
            >
              Siap Pakai ({unusedCount})
            </button>
            <button
              className={`tab-btn ${userStatusFilter === 'ACTIVE' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              onClick={() => {
                setUserStatusFilter('ACTIVE');
                setUserCurrentPage(1);
              }}
            >
              Online Aktif ({activeCount})
            </button>
            <button
              className={`tab-btn ${userStatusFilter === 'USED' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              onClick={() => {
                setUserStatusFilter('USED');
                setUserCurrentPage(1);
              }}
            >
              Sudah Terpakai ({usedCount})
            </button>
            <button
              className={`tab-btn ${userStatusFilter === 'EXPIRED' ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              onClick={() => {
                setUserStatusFilter('EXPIRED');
                setUserCurrentPage(1);
              }}
            >
              Expired ({expiredCount})
            </button>
          </div>

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
              <div className="search-box" style={{ maxWidth: '260px' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Cari user, kode, reseller..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserCurrentPage(1);
                  }}
                />
              </div>

              {/* Profile Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                value={userProfileFilter}
                onChange={(e) => {
                  setUserProfileFilter(e.target.value);
                  setUserCurrentPage(1);
                }}
              >
                <option value="ALL">Semua Profil Paket</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Reseller Filter */}
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                value={userResellerFilter}
                onChange={(e) => {
                  setUserResellerFilter(e.target.value);
                  setUserCurrentPage(1);
                }}
              >
                <option value="ALL">Semua Mitra Reseller</option>
                {resellers.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={handleOpenAddUser}>
                <Plus size={15} />
                <span>+ User Tunggal</span>
              </button>
              <button className="btn-primary" onClick={handleOpenBatchGenerator}>
                <Zap size={15} />
                <span>Batch Generator</span>
              </button>
            </div>
          </div>

          {/* Floating Bulk Action Bar */}
          {selectedUserIds.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.65rem',
                padding: '0.65rem 1rem',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid var(--accent-cyan)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{selectedUserIds.length}</strong> Voucher Terpilih
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={handlePrintSelectedVouchers}
                >
                  <Printer size={14} />
                  <span>Cetak Terpilih ({selectedUserIds.length})</span>
                </button>
                <button
                  className="btn-danger"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={handleDeleteSelectedVouchers}
                >
                  <Trash2 size={14} />
                  <span>Hapus Terpilih</span>
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={() => setSelectedUserIds([])}
                >
                  <span>Batal Pilih</span>
                </button>
              </div>
            </div>
          )}

          {/* User Data Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '38px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th style={{ width: '42px', textAlign: 'center' }}>No</th>
                  <th>Username / Kode Voucher</th>
                  <th>Password / PIN</th>
                  <th>Profil Paket</th>
                  <th>Masa Aktif / Sisa</th>
                  <th>Mitra Reseller</th>
                  <th>IP &amp; MAC Address</th>
                  <th>Harga (Rp)</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center', width: '110px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Tidak ada user atau voucher hotspot yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((u, idx) => {
                    const isSelected = selectedUserIds.includes(u.id);
                    const isPassVisible = showPasswordMap[u.id];
                    const rowNumber = (userCurrentPage - 1) * userPageSize + idx + 1;

                    return (
                      <tr key={u.id} className={isSelected ? 'row-selected' : ''}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectUser(u.id)}
                          />
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {rowNumber}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Ticket size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                            <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--accent-cyan)' }}>
                              {u.username}
                            </code>
                            <button
                              className="btn-icon"
                              style={{ width: '22px', height: '22px', padding: 0 }}
                              title="Salin Username"
                              onClick={() => handleCopyCode(u.username)}
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          {u.comment && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {u.comment}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600 }}>
                              {isPassVisible ? (u.password || u.username) : '••••••'}
                            </span>
                            <button
                              className="btn-icon"
                              style={{ width: '22px', height: '22px', padding: 0 }}
                              title={isPassVisible ? 'Sembunyikan' : 'Lihat Password'}
                              onClick={() => handleTogglePassword(u.id)}
                            >
                              {isPassVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            {isPassVisible && (
                              <button
                                className="btn-icon"
                                style={{ width: '22px', height: '22px', padding: 0 }}
                                title="Salin Password"
                                onClick={() => handleCopyCode(u.password || u.username)}
                              >
                                <Copy size={12} />
                              </button>
                            )}
                          </div>
                          {(!u.password || u.password === u.username) && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              (Sama dg User)
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                            {u.profile}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{u.duration || '24 Jam'}</div>
                          {u.timeLeft && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', marginTop: '0.15rem' }}>
                              Sisa: {u.timeLeft}
                            </div>
                          )}
                        </td>
                        <td>
                          {u.reseller ? (
                            <span className="badge badge-neutral" style={{ color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                              {u.reseller}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Langsung ISP</span>
                          )}
                        </td>
                        <td>
                          {u.ipAddress || u.macAddress ? (
                            <div>
                              {u.ipAddress && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>{u.ipAddress}</div>}
                              {u.macAddress && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{u.macAddress}</div>}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.82rem', color: 'var(--accent-amber)' }}>
                            Rp {u.price.toLocaleString('id-ID')}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {u.status === 'ACTIVE' ? (
                            <span className="badge badge-good">
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }}></span>
                              ONLINE
                            </span>
                          ) : u.status === 'UNUSED' ? (
                            <span className="badge badge-neutral" style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                              SIAP PAKAI
                            </span>
                          ) : u.status === 'USED' ? (
                            <span className="badge badge-neutral">
                              TERPAKAI
                            </span>
                          ) : (
                            <span className="badge badge-critical">
                              EXPIRED
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <button
                              className="btn-icon"
                              title="Cetak Struk Thermal Voucher"
                              onClick={() => setThermalPrintUser(u)}
                            >
                              <Printer size={13} />
                            </button>
                            <button
                              className="btn-icon"
                              title="Edit User"
                              onClick={() => handleOpenEditUser(u)}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn-icon text-danger"
                              title="Hapus User"
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus voucher/user ${u.username}?`)) {
                                  onDeleteUser(u.id);
                                  showToast(`User ${u.username} berhasil dihapus.`);
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

          {/* Table Footer: Stats & Pagination Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-tertiary)',
              borderRadius: '0 0 var(--radius-md) var(--radius-md)',
              fontSize: '0.78rem'
            }}
          >
            <div style={{ color: 'var(--text-muted)' }}>
              Menampilkan {displayedUsers.length > 0 ? (userCurrentPage - 1) * userPageSize + 1 : 0} -{' '}
              {Math.min(userCurrentPage * userPageSize, filteredUsers.length)} dari{' '}
              <strong>{filteredUsers.length}</strong> voucher
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Per halaman:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                value={userPageSize}
                onChange={(e) => {
                  setUserPageSize(Number(e.target.value));
                  setUserCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                  disabled={userCurrentPage <= 1}
                  onClick={() => setUserCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </button>
                <span style={{ padding: '0.25rem 0.55rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {userCurrentPage} / {totalPages || 1}
                </span>
                <button
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                  disabled={userCurrentPage >= totalPages}
                  onClick={() => setUserCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBPAGE: PROFILE */}
      {/* ========================================================================= */}
      {activeSubPage === 'profiles' && (
        <div>
          {/* Controls Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="search-box" style={{ maxWidth: '280px' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Cari profil hotspot..."
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                />
              </div>
            </div>

            <button className="btn-primary" onClick={handleOpenAddProfile}>
              <Plus size={15} />
              <span>+ Tambah Profil Hotspot</span>
            </button>
          </div>

          {/* Profile Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem'
            }}
          >
            {filteredProfiles.map((p) => {
              const marginRp = p.price - p.resellerPrice;
              const marginPercent = Math.round((marginRp / p.price) * 100);

              return (
                <div key={p.id} className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {p.name}
                        </h3>
                        {p.userLock === 'MAC' && (
                          <span className="badge badge-subtle" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', fontSize: '0.65rem' }}>
                            Lock MAC
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {p.description || 'Paket Hotspot MikroTik'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        className="btn-action-sm"
                        title="Edit Profil"
                        onClick={() => handleOpenEditProfile(p)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn-action-sm danger"
                        title="Hapus Profil"
                        onClick={() => {
                          if (confirm(`Hapus profil ${p.name}?`)) {
                            onDeleteProfile(p.id);
                            showToast(`Profil ${p.name} dihapus.`);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Profile Specs */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.65rem',
                      marginBottom: '0.85rem',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>RATE LIMIT (RX/TX)</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{p.rateLimit}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>MASA AKTIF (VALIDITY)</div>
                      <div style={{ fontWeight: 700 }}>{p.validity}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>SHARED USERS</div>
                      <div style={{ fontWeight: 700 }}>{p.sharedUsers} Device</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>ADDRESS POOL</div>
                      <div style={{ fontFamily: 'monospace' }}>{p.addressPool}</div>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>HARGA KONSUMEN</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                        Rp {p.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>HARGA RESELLER</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                        Rp {p.resellerPrice.toLocaleString('id-ID')}
                        <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', marginLeft: '0.35rem' }}>
                          (+{marginPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBPAGE: SESSION */}
      {/* ========================================================================= */}
      {activeSubPage === 'sessions' && (
        <div>
          {/* Summary Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>ONLINE ACTIVE SESSIONS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>
                {sessions.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Pengguna sedang berselancar
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TRAFFIC DOWNLOAD</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>
                21.4 GB
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Dari seluruh sesi aktif
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TRAFFIC UPLOAD</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-blue)' }}>
                4.1 GB
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Upload rate realtime
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>GATEWAY ROUTER NAS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                CCR2004 Core
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                API CoA Port 3799 Siap
              </div>
            </div>
          </div>

          {/* Controls Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="search-box" style={{ maxWidth: '280px' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Cari user, IP, MAC address..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn-secondary"
                onClick={handleRefreshSessions}
                disabled={isRefreshingSessions}
              >
                <RefreshCw size={15} className={isRefreshingSessions ? 'spin-animation' : ''} />
                <span>Segarkan Sesi</span>
              </button>

              <button
                className="btn-danger"
                onClick={() => {
                  if (confirm('PERINGATAN: Yakin ingin memutuskan (Kick CoA) SEMUA sesi hotspot aktif saat ini?')) {
                    onKickAllSessions();
                    showToast('Semua sesi hotspot telah diputus (Kick All CoA)!');
                  }
                }}
              >
                <Zap size={15} />
                <span>Kick All (CoA)</span>
              </button>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User / Voucher</th>
                  <th>Perangkat / Hostname</th>
                  <th>IP Address</th>
                  <th>MAC Address</th>
                  <th>Uptime</th>
                  <th>Sisa Waktu</th>
                  <th>Download / Upload</th>
                  <th>Profil</th>
                  <th>Login By</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Tidak ada sesi hotspot yang aktif saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                          {s.username}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                          <Smartphone size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{s.hostname || 'Gadget Pelanggan'}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{s.ipAddress}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {s.macAddress}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-subtle" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontSize: '0.72rem' }}>
                          {s.uptime}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{s.timeLeft}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--accent-cyan)' }}>↓ {s.bytesOut}</span> /{' '}
                          <span style={{ color: 'var(--accent-blue)' }}>↑ {s.bytesIn}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-outline" style={{ fontSize: '0.68rem', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}>
                          {s.profile}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-subtle" style={{ fontSize: '0.68rem' }}>
                          {s.loginBy}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-danger"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          title="Putuskan Koneksi User (MikroTik CoA Kick)"
                          onClick={() => {
                            if (confirm(`Putuskan sesi user ${s.username} (Kick CoA)?`)) {
                              onKickSession(s.id);
                              showToast(`Sesi ${s.username} berhasil diputus.`);
                            }
                          }}
                        >
                          <Zap size={12} />
                          <span>Kick</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBPAGE: RESELLER */}
      {/* ========================================================================= */}
      {activeSubPage === 'resellers' && (
        <div>
          {/* Summary Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL MITRA RESELLER</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-purple)' }}>
                {resellers.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                Semua mitra status aktif
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SALDO DEPOSIT MITRA</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>
                Rp {resellers.reduce((acc, r) => acc + r.balance, 0).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Tersimpan di sistem deposit
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL VOUCHER TERJUAL</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>
                {resellers.reduce((acc, r) => acc + r.totalVouchersSold, 0).toLocaleString('id-ID')} Lembar
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Akumulasi penjualan voucher
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL OMSET TRANSAKSI</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-amber)' }}>
                Rp {resellers.reduce((acc, r) => acc + r.totalSalesRp, 0).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Penjualan reseller ke konsumen
              </div>
            </div>
          </div>

          {/* Controls Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="search-box" style={{ maxWidth: '280px' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Cari toko, pemilik, HP..."
                  value={resellerSearch}
                  onChange={(e) => setResellerSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={handleOpenAddReseller}>
                <Plus size={15} />
                <span>+ Tambah Mitra Reseller</span>
              </button>
            </div>
          </div>

          {/* Resellers Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem'
            }}
          >
            {filteredResellers.map((r) => {
              const isLowBalance = r.balance < 100000;

              return (
                <div key={r.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                        {r.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        PIC: <strong style={{ color: 'var(--text-primary)' }}>{r.ownerName}</strong>
                      </div>
                    </div>

                    <span className="badge badge-subtle" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontSize: '0.7rem' }}>
                      Aktif
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                      <Phone size={13} />
                      <a href={`https://wa.me/${r.phone}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                        {r.phone}
                      </a>
                    </div>
                    <div>{r.address}</div>
                  </div>

                  {/* Reseller Stats Bar */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      marginBottom: '0.85rem',
                      textAlign: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SALDO DEPOSIT</div>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          color: isLowBalance ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                          marginTop: '0.15rem'
                        }}
                      >
                        Rp {r.balance.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>KOMISI</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.15rem' }}>
                        {r.commissionPercent}%
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TERJUAL</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>
                        {r.totalVouchersSold} Pcs
                      </div>
                    </div>
                  </div>

                  {/* Reseller Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                      onClick={() => handleOpenTopup(r)}
                    >
                      <Coins size={14} />
                      <span>Top-up Saldo</span>
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.45rem', fontSize: '0.78rem' }}
                      onClick={() => {
                        setBatchReseller(r.name);
                        handleOpenBatchGenerator();
                      }}
                    >
                      <Ticket size={14} />
                      <span>Cetak Batch</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUBPAGE: TEMPLATE */}
      {/* ========================================================================= */}
      {activeSubPage === 'templates' && (
        <div>
          {/* Template Selector Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                PILIH DESAIN TEMPLATE:
              </span>
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  className={`tab-btn ${selectedTemplateId === tpl.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  style={{ padding: '0.4rem 0.85rem' }}
                >
                  <span>{tpl.name}</span>
                </button>
              ))}
            </div>

            <button
              className="btn-secondary"
              onClick={() => {
                window.print();
              }}
            >
              <Printer size={15} />
              <span>Test Print Sekarang</span>
            </button>
          </div>

          {/* Template Customizer Layout: Left Editor, Right Live Preview */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {/* Left: Customizer Form */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span>Pengaturan Kustomisasi Desain Struk</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Sesuaikan kop judul, pesan slogan, kontak layanan, serta elemen QR code voucher.
              </p>

              <form onSubmit={handleSaveTemplateSettings}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Nama ISP / Header Struk</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tplHeaderTitle}
                    onChange={(e) => setTplHeaderTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Slogan / Alamat Sub-Header</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={tplSubHeader}
                    onChange={(e) => setTplSubHeader(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Catatan Kaki (Footer Note &amp; CS)</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={tplFooterNote}
                    onChange={(e) => setTplFooterNote(e.target.value)}
                  />
                </div>

                {/* Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={tplShowQr}
                      onChange={(e) => setTplShowQr(e.target.checked)}
                    />
                    <span>Tampilkan QR Code</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={tplShowPrice}
                      onChange={(e) => setTplShowPrice(e.target.checked)}
                    />
                    <span>Tampilkan Harga</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={tplShowValidity}
                      onChange={(e) => setTplShowValidity(e.target.checked)}
                    />
                    <span>Tampilkan Masa Aktif</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={tplShowReseller}
                      onChange={(e) => setTplShowReseller(e.target.checked)}
                    />
                    <span>Tampilkan Reseller</span>
                  </label>
                </div>

                {/* Accent Color */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Warna Aksen Border / Banner</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="color"
                      value={tplAccentColor}
                      onChange={(e) => setTplAccentColor(e.target.value)}
                      style={{ width: '40px', height: '36px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{tplAccentColor}</span>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                  <span>Simpan Perubahan Template</span>
                </button>

                {templateSavedToast && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--accent-emerald)', textAlign: 'center' }}>
                    ✓ Pengaturan template berhasil disimpan!
                  </div>
                )}
              </form>
            </div>

            {/* Right: Live Interactive Thermal / Captive Preview */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>Live Interactive Preview</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Tampilan persis yang akan dicetak oleh printer kasir thermal POS (58mm / 80mm).
              </p>

              {/* Realistic Paper Thermal Receipt */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <div
                  className="thermal-receipt"
                  id="printable-voucher-receipt"
                  style={{
                    borderTop: `4px solid ${tplAccentColor}`,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                    {tplHeaderTitle}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.72rem', marginTop: '0.2rem', color: '#334155', whiteSpace: 'pre-line' }}>
                    {tplSubHeader}
                  </div>

                  <hr />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span>Tgl: {sampleVoucher.createdAt.substring(0, 10)}</span>
                    <span>Jam: {sampleVoucher.createdAt.substring(11, 16) || '12:00'}</span>
                  </div>

                  {tplShowReseller && sampleVoucher.reseller && (
                    <div style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
                      Mitra: <strong>{sampleVoucher.reseller}</strong>
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem' }}>
                    Paket: <strong>{sampleVoucher.profile}</strong>
                  </div>

                  {tplShowValidity && (
                    <div style={{ fontSize: '0.72rem' }}>
                      Durasi: <strong>{sampleVoucher.duration || '24 Jam'}</strong>
                    </div>
                  )}

                  <hr />

                  {/* Voucher Box */}
                  <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>KODE LOGIN VOUCHER</div>
                    <div
                      style={{
                        fontSize: '1.45rem',
                        fontWeight: '900',
                        letterSpacing: '2px',
                        padding: '0.35rem 0.5rem',
                        border: '2px solid #000',
                        margin: '0.4rem auto',
                        maxWidth: '220px',
                        background: '#ffffff'
                      }}
                    >
                      {sampleVoucher.username}
                    </div>

                    {sampleVoucher.password && sampleVoucher.password !== sampleVoucher.username && (
                      <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        Password: <strong>{sampleVoucher.password}</strong>
                      </div>
                    )}

                    <div style={{ fontSize: '0.7rem', marginTop: '0.35rem' }}>
                      Akses Portal:<br />
                      <strong>http://hotspot.scorip.net</strong>
                    </div>
                  </div>

                  {/* QR Code Simulation */}
                  {tplShowQr && (
                    <div style={{ textAlign: 'center', margin: '0.65rem 0' }}>
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          border: '2px solid #000',
                          margin: '0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fff'
                        }}
                      >
                        <QrCode size={64} style={{ color: '#000' }} />
                      </div>
                      <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', color: '#475569' }}>
                        Scan QR untuk Login Otomatis
                      </div>
                    </div>
                  )}

                  {tplShowPrice && (
                    <>
                      <hr />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.88rem' }}>
                        <span>TOTAL HARGA:</span>
                        <span>Rp {sampleVoucher.price.toLocaleString('id-ID')}</span>
                      </div>
                    </>
                  )}

                  <hr />
                  <div style={{ textAlign: 'center', fontSize: '0.68rem', marginTop: '0.5rem', whiteSpace: 'pre-line' }}>
                    {tplFooterNote}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BATCH VOUCHER GENERATOR */}
      {/* ========================================================================= */}
      {isBatchModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} style={{ color: 'var(--accent-amber)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Generator Voucher Hotspot Massal</h3>
              </div>
              <button className="icon-action-btn" onClick={() => setIsBatchModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleExecuteBatchGenerate}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Pilih Profil Bandwidth</label>
                  <select
                    className="form-input"
                    value={batchProfile}
                    onChange={(e) => setBatchProfile(e.target.value)}
                    required
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} - Rp{p.price.toLocaleString('id-ID')} ({p.validity})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Jumlah Lembar Voucher</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={200}
                      value={batchCount}
                      onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prefix Kode Voucher</label>
                    <input
                      type="text"
                      className="form-input"
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                      placeholder="SC-"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Format Voucher</label>
                    <select
                      className="form-input"
                      value={batchUserMode}
                      onChange={(e) => setBatchUserMode(e.target.value as any)}
                    >
                      <option value="USER_EQUALS_PASSWORD">Username = Password</option>
                      <option value="USER_AND_PASSWORD">Username &amp; Password Beda</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Panjang Karakter Acak</label>
                    <select
                      className="form-input"
                      value={batchCharLength}
                      onChange={(e) => setBatchCharLength(parseInt(e.target.value))}
                    >
                      <option value={4}>4 Karakter (Mudah)</option>
                      <option value={5}>5 Karakter (Standar)</option>
                      <option value={6}>6 Karakter (Aman)</option>
                      <option value={8}>8 Karakter (Panjang)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Jenis Karakter Acak</label>
                  <select
                    className="form-input"
                    value={batchCharSet}
                    onChange={(e) => setBatchCharSet(e.target.value as any)}
                  >
                    <option value="NUMERIC">Angka Saja (Contoh: 78219)</option>
                    <option value="UPPERCASE">Huruf Kapital Saja (Contoh: KFAXP)</option>
                    <option value="ALPHANUMERIC">Kombinasi Huruf &amp; Angka (Contoh: 9X4B2)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Mitra Reseller Penjual</label>
                  <select
                    className="form-input"
                    value={batchReseller}
                    onChange={(e) => setBatchReseller(e.target.value)}
                  >
                    <option value="">Penjualan Langsung Kantor ISP</option>
                    {resellers.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} (Saldo: Rp{r.balance.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>

                {batchReseller && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={batchDeductBalance}
                      onChange={(e) => setBatchDeductBalance(e.target.checked)}
                    />
                    <span>Potong saldo deposit reseller otomatis sesuai harga grosir</span>
                  </label>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsBatchModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Zap size={15} />
                  <span>Generate {batchCount} Voucher Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SINGLE USER ADD / EDIT */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                {editingUser ? 'Edit User Hotspot' : 'Tambah User Hotspot Baru'}
              </h3>
              <button className="icon-action-btn" onClick={() => setIsAddUserModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Username / Kode Login</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Password / PIN (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Kosongkan jika sama dengan username"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Pilih Profil Hotspot</label>
                  <select
                    className="form-input"
                    value={formProfile}
                    onChange={(e) => {
                      setFormProfile(e.target.value);
                      const p = profiles.find((prof) => prof.name === e.target.value);
                      if (p) {
                        setFormPrice(p.price);
                        setFormDuration(p.validity);
                      }
                    }}
                    required
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} - Rp{p.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Masa Aktif / Durasi</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Harga (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formPrice}
                      onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Reseller Mitra</label>
                  <select
                    className="form-input"
                    value={formReseller}
                    onChange={(e) => setFormReseller(e.target.value)}
                  >
                    <option value="">Tanpa Reseller (Langsung ISP)</option>
                    {resellers.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan / Komentar</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Contoh: Tamu Kafe / Kupon Promo"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddUserModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <span>Simpan User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROFILE ADD / EDIT */}
      {/* ========================================================================= */}
      {isProfileModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                {editingProfile ? 'Edit Profil Hotspot' : 'Tambah Profil Hotspot'}
              </h3>
              <button className="icon-action-btn" onClick={() => setIsProfileModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Nama Profil</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profName}
                    onChange={(e) => setProfName(e.target.value.toUpperCase())}
                    placeholder="CONTOH: HS-3JAM-15MBPS"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Rate Limit (Up/Down)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profRateLimit}
                      onChange={(e) => setProfRateLimit(e.target.value)}
                      placeholder="5M/10M"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Masa Aktif (Validity)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profValidity}
                      onChange={(e) => setProfValidity(e.target.value)}
                      placeholder="2 Jam / 24 Jam"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Harga Konsumen (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={profPrice}
                      onChange={(e) => setProfPrice(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Harga Reseller (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={profResellerPrice}
                      onChange={(e) => setProfResellerPrice(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Shared Users (Gadget)</label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={10}
                      value={profSharedUsers}
                      onChange={(e) => setProfSharedUsers(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kunci User ke MAC</label>
                    <select
                      className="form-input"
                      value={profUserLock}
                      onChange={(e) => setProfUserLock(e.target.value as any)}
                    >
                      <option value="MAC">Kunci ke MAC (Anti-Shared)</option>
                      <option value="OFF">Nonaktif (Bebas Device)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Address Pool</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profPool}
                    onChange={(e) => setProfPool(e.target.value)}
                    placeholder="hs-pool-1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi Profil</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profDesc}
                    onChange={(e) => setProfDesc(e.target.value)}
                    placeholder="Paket hemat browsing"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsProfileModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <span>Simpan Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD RESELLER */}
      {/* ========================================================================= */}
      {isAddResellerModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Tambah Mitra Reseller Hotspot</h3>
              <button className="icon-action-btn" onClick={() => setIsAddResellerModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAddReseller}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Nama Toko / Mitra Usaha</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resellerName}
                    onChange={(e) => setResellerName(e.target.value)}
                    placeholder="Contoh: Warkop Berkah 24 Jam"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nama Pemilik / PIC</label>
                    <input
                      type="text"
                      className="form-input"
                      value={resellerOwner}
                      onChange={(e) => setResellerOwner(e.target.value)}
                      placeholder="Bpk. Hendra"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={resellerPhone}
                      onChange={(e) => setResellerPhone(e.target.value)}
                      placeholder="08123456789"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Alamat / Lokasi Toko</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={resellerAddress}
                    onChange={(e) => setResellerAddress(e.target.value)}
                    placeholder="Jl. Pantai Kuta Gang 3"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Saldo Awal Deposit (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={resellerInitialBalance}
                      onChange={(e) => setResellerInitialBalance(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bagi Hasil / Komisi (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={resellerCommission}
                      onChange={(e) => setResellerCommission(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddResellerModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <span>Simpan Mitra Reseller</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TOPUP SALDO RESELLER */}
      {/* ========================================================================= */}
      {isTopupModalOpen && selectedResellerForTopup && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={18} style={{ color: 'var(--accent-emerald)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Top-up Deposit: {selectedResellerForTopup.name}
                </h3>
              </div>
              <button className="icon-action-btn" onClick={() => setIsTopupModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTopup}>
              <div className="modal-body">
                <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Saldo Saat Ini:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    Rp {selectedResellerForTopup.balance.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Nominal Top-up (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    step={10000}
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(parseInt(e.target.value) || 0)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                    {[100000, 200000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        onClick={() => setTopupAmount(amt)}
                      >
                        +{amt / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Metode Pembayaran Deposit</label>
                  <select
                    className="form-input"
                    value={topupMethod}
                    onChange={(e) => setTopupMethod(e.target.value as any)}
                  >
                    <option value="QRIS">QRIS / Instant Payment</option>
                    <option value="TRANSFER">Transfer Bank (BCA / Mandiri)</option>
                    <option value="CASH">Setoran Tunai di Kasir</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan / Nomor Bukti</label>
                  <input
                    type="text"
                    className="form-input"
                    value={topupNote}
                    onChange={(e) => setTopupNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsTopupModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <span>Proses Deposit Rp{topupAmount.toLocaleString('id-ID')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THERMAL PRINT SINGLE VOUCHER */}
      {/* ========================================================================= */}
      {thermalPrintUser && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Cetak Struk Thermal Voucher</h3>
              </div>
              <button className="icon-action-btn" onClick={() => setThermalPrintUser(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ background: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
              <div className="thermal-receipt" id="printable-voucher-receipt">
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                  {tplHeaderTitle}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.72rem', whiteSpace: 'pre-line' }}>
                  {tplSubHeader}
                </div>
                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span>Tgl: {thermalPrintUser.createdAt.substring(0, 10)}</span>
                  <span>Jam: {thermalPrintUser.createdAt.substring(11, 16) || '12:00'}</span>
                </div>
                {thermalPrintUser.reseller && (
                  <div style={{ fontSize: '0.72rem' }}>Mitra: <strong>{thermalPrintUser.reseller}</strong></div>
                )}
                <div style={{ fontSize: '0.72rem' }}>Paket: {thermalPrintUser.profile}</div>
                <div style={{ fontSize: '0.72rem' }}>Durasi: {thermalPrintUser.duration || '24 Jam'}</div>
                <hr />
                <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>KODE LOGIN VOUCHER</div>
                  <div
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: '900',
                      letterSpacing: '2px',
                      padding: '0.2rem',
                      border: '2px solid #000',
                      margin: '0.4rem 0',
                      background: '#fff'
                    }}
                  >
                    {thermalPrintUser.username}
                  </div>
                  {thermalPrintUser.password && thermalPrintUser.password !== thermalPrintUser.username && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                      Password: <strong>{thermalPrintUser.password}</strong>
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem' }}>
                    Buka browser &amp; akses:<br />
                    <strong>http://hotspot.scorip.net</strong>
                  </div>
                </div>

                {tplShowQr && (
                  <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                    <div style={{ width: '70px', height: '70px', border: '1px solid #000', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                      <QrCode size={56} style={{ color: '#000' }} />
                    </div>
                    <div style={{ fontSize: '0.62rem', marginTop: '0.2rem' }}>Scan QR untuk Login Langsung</div>
                  </div>
                )}

                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  <span>TOTAL:</span>
                  <span>Rp {thermalPrintUser.price.toLocaleString('id-ID')}</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.68rem', marginTop: '0.75rem', whiteSpace: 'pre-line' }}>
                  {tplFooterNote}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setThermalPrintUser(null)}>
                Tutup
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={15} />
                <span>Cetak Nota Thermal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BATCH PRINT SELECTED VOUCHERS */}
      {/* ========================================================================= */}
      {batchPrintUsers && batchPrintUsers.length > 0 && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
                  Cetak Batch Voucher ({batchPrintUsers.length} Tiket)
                </h3>
              </div>
              <button className="icon-action-btn" onClick={() => setBatchPrintUsers(null)}>
                <X size={16} />
              </button>
            </div>

            <div
              className="modal-body"
              style={{
                background: '#f8fafc',
                maxHeight: '65vh',
                overflowY: 'auto',
                padding: '1.25rem'
              }}
            >
              <div
                id="printable-voucher-receipt"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '1rem'
                }}
              >
                {batchPrintUsers.map((u) => (
                  <div
                    key={u.id}
                    className="thermal-receipt"
                    style={{
                      border: '1.5px dashed #0f172a',
                      borderRadius: '6px',
                      padding: '0.85rem',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.72rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div>
                      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.88rem', letterSpacing: '0.5px' }}>
                        {tplHeaderTitle}
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#475569', marginBottom: '0.4rem' }}>
                        {tplSubHeader}
                      </div>
                      <hr style={{ borderColor: '#cbd5e1', margin: '0.4rem 0' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#334155' }}>
                        <span>Paket: <strong>{u.profile}</strong></span>
                        <span>{u.duration || '24 Jam'}</span>
                      </div>
                      {u.reseller && (
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Mitra: {u.reseller}
                        </div>
                      )}

                      <div style={{ textAlign: 'center', margin: '0.6rem 0' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                          Kode Voucher
                        </div>
                        <div
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            letterSpacing: '1.5px',
                            padding: '0.25rem 0.4rem',
                            border: '1.5px solid #0f172a',
                            borderRadius: '4px',
                            margin: '0.3rem 0',
                            background: '#f1f5f9'
                          }}
                        >
                          {u.username}
                        </div>
                        {u.password && u.password !== u.username && (
                          <div style={{ fontSize: '0.68rem', color: '#334155' }}>
                            PIN/Pass: <strong>{u.password}</strong>
                          </div>
                        )}
                      </div>

                      {tplShowQr && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.35rem 0' }}>
                          <QrCode size={46} style={{ color: '#0f172a' }} />
                        </div>
                      )}
                    </div>

                    <div>
                      <hr style={{ borderColor: '#cbd5e1', margin: '0.4rem 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.78rem' }}>
                        <span>TARIF:</span>
                        <span style={{ color: '#047857' }}>Rp {u.price.toLocaleString('id-ID')}</span>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '0.6rem', color: '#64748b', marginTop: '0.35rem' }}>
                        {tplFooterNote}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setBatchPrintUsers(null)}>
                Batal / Tutup
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={15} />
                <span>Cetak Semua ({batchPrintUsers.length} Voucher)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
