import React from 'react';
import {
  Wifi,
  Radio,
  Server,
  Smartphone,
  CreditCard,
  Sun,
  Moon,
  Search,
  Bell,
  ShieldCheck,
  UserCheck,
  Wrench,
  User
} from 'lucide-react';
import { UserRole } from '../types';

import { Menu } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSimulateAutoIsolir: () => void;
  onToggleSidebar?: () => void;
  activeTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  theme,
  onThemeToggle,
  searchQuery,
  onSearchChange,
  onSimulateAutoIsolir,
  onToggleSidebar,
  activeTitle
}) => {
  return (
    <header className="navbar">
      {/* Left: Sidebar Hamburger + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {onToggleSidebar && (
          <button
            className="btn-icon"
            onClick={onToggleSidebar}
            title="Buka / Tutup Sidebar"
            style={{ width: '34px', height: '34px' }}
          >
            <Menu size={18} />
          </button>
        )}
        {activeTitle && (
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {activeTitle}
          </div>
        )}
      </div>

      {/* Real-time Heartbeat Pills */}
      <div className="system-status-pills">
        <div className="status-pill online" title="FreeRADIUS v3 AAA Server Terhubung">
          <span className="dot"></span>
          <span>RADIUS 3.2</span>
        </div>
        <div className="status-pill online" title="MikroTik RouterOS API Terhubung">
          <span className="dot"></span>
          <span>ROS v7</span>
        </div>
        <div className="status-pill online" title="3 OLT Aktif (ZTE, Huawei, VSOL)">
          <span className="dot"></span>
          <span>3 OLT UP</span>
        </div>
        <div className="status-pill online" title="GenieACS CWMP Server Terhubung">
          <span className="dot"></span>
          <span>TR-069</span>
        </div>
        <div className="status-pill online" title="WhatsApp Gateway Baileys Multi-Device">
          <span className="dot"></span>
          <span>WA GATEWAY</span>
        </div>
      </div>

      {/* Global Quick Search */}
      <div style={{ flex: 1, maxWidth: '360px', position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}
        />
        <input
          type="text"
          id="global-search-input"
          placeholder="Cari user, IP, ODP, SN ONT..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.4rem', height: '38px', borderRadius: 'var(--radius-full)' }}
        />
      </div>

      {/* Actions: Auto Isolir Trigger, Role Switcher & Theme */}
      <div className="nav-actions">
        {currentRole === 'SUPER_ADMIN' && (
          <button
            className="btn-danger"
            onClick={onSimulateAutoIsolir}
            title="Simulasikan Cron Harian Jam 00:00 untuk Isolir Pelanggan Menunggak"
            style={{ fontSize: '0.78rem', height: '36px' }}
          >
            <ShieldCheck size={15} />
            <span>Cron Isolir</span>
          </button>
        )}

        {/* Role Switcher */}
        <div className="role-badge" title="Ganti Mode Akses Peran Pengguna">
          {currentRole === 'SUPER_ADMIN' && <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)' }} />}
          {currentRole === 'NOC' && <Server size={16} style={{ color: 'var(--accent-blue)' }} />}
          {currentRole === 'TEKNISI' && <Wrench size={16} style={{ color: 'var(--accent-amber)' }} />}
          {currentRole === 'KASIR' && <CreditCard size={16} style={{ color: 'var(--accent-emerald)' }} />}
          {currentRole === 'PELANGGAN' && <User size={16} style={{ color: 'var(--accent-purple)' }} />}
          
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            id="role-switcher-select"
          >
            <option value="SUPER_ADMIN">👑 Super Admin</option>
            <option value="NOC">⚡ NOC Engineer</option>
            <option value="TEKNISI">🛠️ Teknisi Lapangan</option>
            <option value="KASIR">💳 Kasir & Billing</option>
            <option value="PELANGGAN">👤 Portal Pelanggan</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="btn-icon"
          onClick={onThemeToggle}
          title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <button className="btn-icon" title="Notifikasi Jaringan & Pembayaran" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-rose)'
            }}
          />
        </button>
      </div>
    </header>
  );
};
