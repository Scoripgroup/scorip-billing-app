import React, { useState } from 'react';
import {
  LayoutDashboard,
  Server,
  Radio,
  Cpu,
  MapPin,
  CreditCard,
  MessageSquare,
  Ticket,
  User,
  Wifi,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity,
  Users,
  Sliders,
  Wrench,
  Network,
  Settings,
  Store,
  LayoutTemplate,
  Shield,
  Cloud
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeNav: string;
  onSelectNav: (navId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentRole: UserRole;
  unregisteredCount: number;
  pendingTicketsCount: number;
  unpaidInvoicesCount: number;
  routersCount: number;
  clientsCount: number;
  activePppoeCount?: number;
  hotspotUsersCount?: number;
  activeHotspotSessionsCount?: number;
  resellersCount?: number;
  vpnActiveCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  isCollapsed,
  onToggleCollapse,
  currentRole,
  unregisteredCount,
  pendingTicketsCount,
  unpaidInvoicesCount,
  routersCount,
  clientsCount,
  activePppoeCount,
  hotspotUsersCount,
  activeHotspotSessionsCount,
  resellersCount,
  vpnActiveCount
}) => {
  // Collapsible Accordion State: Default SEMBUNYIKAN (hidden / closed) untuk semua group
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // RadbooX-style Categorized Navigation Groups with Icons and Badges
  const navGroups = [
    {
      title: 'DASHBOARD',
      icon: <LayoutDashboard size={14} />,
      badge: null,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard NOC',
          icon: <LayoutDashboard size={18} />,
          badge: null,
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI', 'KASIR']
        }
      ]
    },
    {
      title: 'PPPOE',
      icon: <Network size={14} />,
      badge: activePppoeCount ? `${activePppoeCount} Online` : null,
      badgeColor: 'var(--accent-emerald)',
      items: [
        {
          id: 'pppoe_users',
          label: 'User',
          icon: <Users size={17} />,
          badge: clientsCount > 0 ? `${clientsCount}` : null,
          badgeColor: 'var(--accent-cyan)',
          roles: ['SUPER_ADMIN', 'NOC', 'KASIR', 'TEKNISI']
        },
        {
          id: 'pppoe_profiles',
          label: 'Profil',
          icon: <Sliders size={17} />,
          badge: null,
          roles: ['SUPER_ADMIN', 'NOC']
        },
        {
          id: 'pppoe_sessions',
          label: 'Session',
          icon: <Activity size={17} />,
          badge: activePppoeCount ? `${activePppoeCount} Aktif` : 'Online',
          badgeColor: 'var(--accent-emerald)',
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI']
        },
        {
          id: 'pppoe_settings',
          label: 'Settings',
          icon: <Settings size={17} />,
          badge: null,
          roles: ['SUPER_ADMIN', 'NOC']
        }
      ]
    },
    {
      title: 'HOTSPOT',
      icon: <Ticket size={14} />,
      badge: activeHotspotSessionsCount ? `${activeHotspotSessionsCount} Aktif` : null,
      badgeColor: 'var(--accent-emerald)',
      items: [
        {
          id: 'hotspot_users',
          label: 'User',
          icon: <Users size={17} />,
          badge: hotspotUsersCount !== undefined && hotspotUsersCount > 0 ? `${hotspotUsersCount}` : null,
          badgeColor: 'var(--accent-cyan)',
          roles: ['SUPER_ADMIN', 'NOC', 'KASIR']
        },
        {
          id: 'hotspot_profiles',
          label: 'Profile',
          icon: <Sliders size={17} />,
          badge: null,
          roles: ['SUPER_ADMIN', 'NOC']
        },
        {
          id: 'hotspot_sessions',
          label: 'Session',
          icon: <Activity size={17} />,
          badge: activeHotspotSessionsCount ? `${activeHotspotSessionsCount} Aktif` : null,
          badgeColor: 'var(--accent-emerald)',
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI']
        },
        {
          id: 'hotspot_resellers',
          label: 'Reseller',
          icon: <Store size={17} />,
          badge: resellersCount !== undefined && resellersCount > 0 ? `${resellersCount} Mitra` : null,
          badgeColor: 'var(--accent-purple)',
          roles: ['SUPER_ADMIN', 'NOC', 'KASIR']
        },
        {
          id: 'hotspot_templates',
          label: 'Template',
          icon: <LayoutTemplate size={17} />,
          badge: null,
          roles: ['SUPER_ADMIN', 'NOC']
        }
      ]
    },
    {
      title: 'ROUTER & JARINGAN',
      icon: <Server size={14} />,
      badge: unregisteredCount > 0 ? `${unregisteredCount} Baru` : (routersCount > 0 ? `${routersCount}` : null),
      badgeColor: unregisteredCount > 0 ? 'var(--accent-cyan)' : 'var(--accent-blue)',
      items: [
        {
          id: 'routers',
          label: 'Router MikroTik (NAS)',
          icon: <Server size={18} />,
          badge: routersCount > 0 ? `${routersCount}` : null,
          badgeColor: 'var(--accent-blue)',
          roles: ['SUPER_ADMIN', 'NOC']
        },
        {
          id: 'olt',
          label: 'OLT Management (GPON)',
          icon: <Radio size={18} />,
          badge: unregisteredCount > 0 ? `${unregisteredCount} Baru` : null,
          badgeColor: 'var(--accent-cyan)',
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI']
        },
        {
          id: 'genieacs',
          label: 'GenieACS TR-069 ONT',
          icon: <Cpu size={18} />,
          badge: null,
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI']
        },
        {
          id: 'gis',
          label: 'Peta GIS ODC / ODP',
          icon: <MapPin size={18} />,
          badge: null,
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI']
        },
        {
          id: 'vpn',
          label: 'VPN & Remote Winbox',
          icon: <Shield size={18} />,
          badge: vpnActiveCount ? `${vpnActiveCount} Up` : null,
          badgeColor: 'var(--accent-emerald)',
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI']
        },
        {
          id: 'gateway',
          label: 'Ubuntu & Cloudflare Tunnel',
          icon: <Cloud size={18} />,
          badge: 'Cloudflared',
          badgeColor: '#f97316',
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI']
        },
        {
          id: 'radius',
          label: 'FreeRADIUS Server (AAA)',
          icon: <Radio size={18} />,
          badge: 'v3 (MySQL)',
          badgeColor: 'var(--accent-cyan)',
          roles: ['SUPER_ADMIN', 'NOC']
        }
      ]
    },
    {
      title: 'BILLING & KEUANGAN',
      icon: <CreditCard size={14} />,
      badge: unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount} Unpaid` : null,
      badgeColor: 'var(--accent-rose)',
      items: [
        {
          id: 'billing',
          label: 'Tagihan & Kasir POS',
          icon: <CreditCard size={18} />,
          badge: unpaidInvoicesCount > 0 ? `${unpaidInvoicesCount}` : null,
          badgeColor: 'var(--accent-rose)',
          roles: ['SUPER_ADMIN', 'KASIR']
        }
      ]
    },
    {
      title: 'LAYANAN & CS',
      icon: <MessageSquare size={14} />,
      badge: pendingTicketsCount > 0 ? `${pendingTicketsCount}` : null,
      badgeColor: 'var(--accent-amber)',
      items: [
        {
          id: 'whatsapp',
          label: 'WhatsApp Gateway',
          icon: <MessageSquare size={18} />,
          badge: 'ON',
          badgeColor: 'var(--accent-emerald)',
          roles: ['SUPER_ADMIN', 'NOC', 'KASIR']
        },
        {
          id: 'tickets',
          label: 'Tiket Gangguan (SPK)',
          icon: <Wrench size={18} />,
          badge: pendingTicketsCount > 0 ? `${pendingTicketsCount}` : null,
          badgeColor: 'var(--accent-amber)',
          roles: ['SUPER_ADMIN', 'NOC', 'TEKNISI', 'KASIR']
        }
      ]
    }
  ];

  // Customer role special single group
  const customerNavGroups = [
    {
      title: 'PORTAL MANDIRI',
      icon: <User size={14} />,
      badge: 'Online',
      badgeColor: 'var(--accent-emerald)',
      items: [
        {
          id: 'customer_portal',
          label: 'Portal Pelanggan',
          icon: <User size={18} />,
          badge: 'Online',
          badgeColor: 'var(--accent-emerald)',
          roles: ['PELANGGAN']
        }
      ]
    }
  ];

  const activeGroups =
    currentRole === 'PELANGGAN'
      ? customerNavGroups
      : navGroups
          .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.roles.includes(currentRole))
          }))
          .filter((group) => group.items.length > 0);

  // Auto-expand group if an item inside is active
  React.useEffect(() => {
    activeGroups.forEach((group) => {
      if (group.items.some((item) => item.id === activeNav)) {
        setOpenGroups((prev) => ({ ...prev, [group.title]: true }));
      }
    });
  }, [activeNav, currentRole]);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-badge">
          <Wifi size={20} />
        </div>
        {!isCollapsed && (
          <div className="brand-info">
            <h1>SCORIP-BOS</h1>
            <p>RadbooX Style ISP Engine</p>
          </div>
        )}
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Menu (All Groups Collapsible Accordion - Default SEMBUNYIKAN) */}
      <div className="sidebar-nav-container">
        {!isCollapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.2rem 0.5rem 0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '0.65rem'
            }}
          >
            <span
              style={{
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Menu Navigasi
            </span>
            <button
              type="button"
              onClick={() => {
                const anyOpen = Object.values(openGroups).some(Boolean);
                if (anyOpen) {
                  setOpenGroups({});
                } else {
                  const allOpen: Record<string, boolean> = {};
                  activeGroups.forEach((g) => {
                    allOpen[g.title] = true;
                  });
                  setOpenGroups(allOpen);
                }
              }}
              style={{
                fontSize: '0.62rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                padding: '0.15rem 0.45rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Sembunyikan atau Buka Semua Group"
            >
              {Object.values(openGroups).some(Boolean) ? 'Sembunyikan Semua' : 'Buka Semua'}
            </button>
          </div>
        )}
        {activeGroups.map((group, groupIdx) => {
          const isGroupActive = group.items.some((item) => activeNav === item.id);
          const isGroupOpen = openGroups[group.title] !== undefined ? openGroups[group.title] : isGroupActive;
          const isTreeIndented = group.items.length > 1;

          return (
            <div key={groupIdx} className="sidebar-group" style={{ marginBottom: isCollapsed ? '0.5rem' : '0.75rem' }}>
              {/* Accordion Group Header (Clickable to Hide / Show) */}
              {!isCollapsed && (
                <button
                  type="button"
                  className={`sidebar-group-header-btn ${isGroupActive ? 'active-group' : ''}`}
                  onClick={() => toggleGroup(group.title)}
                  title={isGroupOpen ? `Sembunyikan Group ${group.title}` : `Buka / Tampilkan Group ${group.title}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ color: isGroupActive ? 'var(--accent-cyan)' : 'inherit', display: 'flex', alignItems: 'center' }}>
                      {group.icon}
                    </span>
                    <span style={{ fontWeight: 800 }}>{group.title}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {group.badge && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          background: group.badgeColor ? `${group.badgeColor}22` : 'rgba(34, 197, 94, 0.15)',
                          color: group.badgeColor || 'var(--accent-emerald)',
                          fontWeight: 700
                        }}
                      >
                        {group.badge}
                      </span>
                    )}
                    {isGroupOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </button>
              )}

              {/* Sub-menu Items (Hidden by default unless group is opened) */}
              {(isGroupOpen || isCollapsed) && (
                <nav
                  className="sidebar-nav-list"
                  style={
                    !isCollapsed && isTreeIndented
                      ? {
                          paddingLeft: '0.35rem',
                          borderLeft: '2px solid rgba(6, 182, 212, 0.25)',
                          marginLeft: '0.65rem'
                        }
                      : undefined
                  }
                >
                  {group.items.map((item) => {
                    const isActive = activeNav === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => onSelectNav(item.id)}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className="sidebar-item-icon">{item.icon}</div>
                        {!isCollapsed && (
                          <span className="sidebar-item-label">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span
                            className="sidebar-item-badge"
                            style={{
                              background: item.badgeColor || 'var(--accent-cyan)',
                              color: '#ffffff'
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <div className="sidebar-footer-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <Activity size={13} style={{ color: 'var(--accent-emerald)' }} />
              <strong style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>FreeRADIUS &amp; OLT UP</strong>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Engine: RadbooX Compatible v3.2
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                display: 'inline-block',
                boxShadow: '0 0 6px var(--accent-emerald)'
              }}
              title="System Online"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
