import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  DollarSign,
  QrCode,
  Printer,
  Clock,
  Building,
  Copy,
  Check,
  Zap,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { Invoice, PPPoEClient } from '../types';

interface BillingModuleProps {
  invoices: Invoice[];
  clients: PPPoEClient[];
  onPayInvoice: (invoiceId: string, paymentMethod: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'CASH_KASIR' | 'INDOMARET') => void;
  onGenerateMonthlyInvoices: () => void;
  onAddInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
}

export const BillingModule: React.FC<BillingModuleProps> = ({
  invoices,
  clients,
  onPayInvoice,
  onGenerateMonthlyInvoices,
  onAddInvoice,
  onEditInvoice,
  onDeleteInvoice
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PAID' | 'OVERDUE'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentTab, setPaymentTab] = useState<'QRIS' | 'VA' | 'CASH'>('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);
  const [cashGiven, setCashGiven] = useState<number>(300000);
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);

  // Modals: Add / Edit Invoice
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Form: Add Invoice
  const [targetUsername, setTargetUsername] = useState(clients[0]?.username || '');
  const [invPlanName, setInvPlanName] = useState(clients[0]?.profile || 'HOME-20MBPS');
  const [invSubtotal, setInvSubtotal] = useState(clients[0]?.monthlyFee || 150000);
  const [invDueDate, setInvDueDate] = useState('2026-10-10');

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'UNPAID') return inv.status === 'UNPAID';
    if (filter === 'PAID') return inv.status === 'PAID';
    if (filter === 'OVERDUE') return inv.status === 'OVERDUE';
    return true;
  });

  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalUnpaid = invoices
    .filter((inv) => inv.status !== 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowThermalReceipt(false);
    setCopiedVa(false);
    setCashGiven(Math.ceil(inv.totalAmount / 50000) * 50000);
  };

  const handleExecutePayment = (method: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'CASH_KASIR' | 'INDOMARET') => {
    if (!selectedInvoice) return;
    setIsProcessing(true);

    setTimeout(() => {
      onPayInvoice(selectedInvoice.id, method);
      setIsProcessing(false);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback
      }

      if (method === 'CASH_KASIR') {
        setShowThermalReceipt(true);
      } else {
        setSelectedInvoice(null);
      }
    }, 1200);
  };

  const handleSaveAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.username === targetUsername) || clients[0];
    const taxPpn = Math.round(invSubtotal * 0.11);
    const totalAmount = invSubtotal + taxPpn;

    onAddInvoice({
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV/202610/${Math.floor(100 + Math.random() * 900)}`,
      customerName: client.fullName,
      phone: client.phone,
      pppoeUser: client.username,
      planName: invPlanName,
      subtotal: invSubtotal,
      taxPpn,
      totalAmount,
      dueDate: invDueDate,
      status: 'UNPAID'
    });
    setIsAddInvoiceOpen(false);
  };

  const handleSaveEditInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    onEditInvoice(editingInvoice);
    setEditingInvoice(null);
  };

  return (
    <div className="billing-module">
      {/* Top Banner & Fast Actions */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Automated Billing &amp; Multi-Payment Gateway</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Integrasi Midtrans, Xendit, Tripay (QRIS Dinamis, Virtual Account, &amp; Kasir POS Thermal)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={onGenerateMonthlyInvoices}>
              <Zap size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span>Generate Tagihan Bulan Baru</span>
            </button>
            <button className="btn-primary" onClick={() => setIsAddInvoiceOpen(true)}>
              <Plus size={14} />
              <span>+ Buat Faktur Manual</span>
            </button>
          </div>
        </div>

        {/* Quick Revenue Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total Penerimaan (Lunas): </span>
            <strong style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
              Rp {totalPaid.toLocaleString('id-ID')}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Tertunggak / Belum Bayar: </span>
            <strong style={{ color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
              Rp {totalUnpaid.toLocaleString('id-ID')}
            </strong>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-active">AUTO UN-ISOLIR REALTIME ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Invoice Table Panel */}
      <div className="glass-panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Daftar Faktur Tagihan ({invoices.length})</h3>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                className={`btn-secondary ${filter === 'ALL' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setFilter('ALL')}
              >
                Semua ({invoices.length})
              </button>
              <button
                className={`btn-secondary ${filter === 'UNPAID' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setFilter('UNPAID')}
              >
                Belum Bayar ({invoices.filter((i) => i.status === 'UNPAID').length})
              </button>
              <button
                className={`btn-secondary ${filter === 'OVERDUE' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setFilter('OVERDUE')}
              >
                Terisolir ({invoices.filter((i) => i.status === 'OVERDUE').length})
              </button>
              <button
                className={`btn-secondary ${filter === 'PAID' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setFilter('PAID')}
              >
                Lunas ({invoices.filter((i) => i.status === 'PAID').length})
              </button>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Nama Pelanggan</th>
                <th>Paket Internet</th>
                <th>Subtotal + PPN 11%</th>
                <th>Total Tagihan</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
                <th>Aksi Pembayaran &amp; CRUD</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {inv.invoiceNumber}
                    </strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      User: {inv.pppoeUser}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem' }}>{inv.planName}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    Rp {inv.subtotal.toLocaleString('id-ID')} + Rp {inv.taxPpn.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Rp {inv.totalAmount.toLocaleString('id-ID')}
                    </strong>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {inv.dueDate}
                  </td>
                  <td>
                    {inv.status === 'PAID' && (
                      <span className="badge badge-paid">
                        LUNAS ({inv.paymentMethod})
                      </span>
                    )}
                    {inv.status === 'UNPAID' && (
                      <span className="badge badge-warning">
                        BELUM BAYAR
                      </span>
                    )}
                    {inv.status === 'OVERDUE' && (
                      <span className="badge badge-isolated">
                        TERISOLIR
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {inv.status !== 'PAID' ? (
                        <button
                          className="btn-primary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                          onClick={() => handleOpenPayment(inv)}
                        >
                          <CreditCard size={12} />
                          <span>Bayar</span>
                        </button>
                      ) : (
                        <button
                          className="btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.55rem' }}
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowThermalReceipt(true);
                          }}
                        >
                          <Printer size={12} />
                          <span>Nota</span>
                        </button>
                      )}

                      <button
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}
                        onClick={() => setEditingInvoice(inv)}
                        title="Edit Faktur"
                      >
                        <Edit2 size={12} />
                      </button>

                      <button
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem', color: 'var(--accent-rose)' }}
                        onClick={() => onDeleteInvoice(inv.id)}
                        title="Batalkan / Hapus Faktur"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BUAT FAKTUR MANUAL */}
      {isAddInvoiceOpen && (
        <div className="modal-overlay" onClick={() => setIsAddInvoiceOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>+ Buat Faktur Tagihan Manual</h3>
              <button className="btn-icon" onClick={() => setIsAddInvoiceOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveAddInvoice}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Pilih Pelanggan</label>
                  <select
                    className="form-select"
                    value={targetUsername}
                    onChange={(e) => {
                      setTargetUsername(e.target.value);
                      const c = clients.find((x) => x.username === e.target.value);
                      if (c) {
                        setInvPlanName(c.profile);
                        setInvSubtotal(c.monthlyFee);
                      }
                    }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.username}>
                        {c.fullName} ({c.username} - {c.profile})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi Paket</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invPlanName}
                    onChange={(e) => setInvPlanName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Subtotal Pokok (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={invSubtotal}
                      onChange={(e) => setInvSubtotal(+e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Jatuh Tempo</label>
                    <input
                      type="date"
                      className="form-input"
                      value={invDueDate}
                      onChange={(e) => setInvDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  <div>PPN 11%: <strong>Rp {Math.round(invSubtotal * 0.11).toLocaleString('id-ID')}</strong></div>
                  <div>Total Tagihan: <strong style={{ color: 'var(--accent-emerald)' }}>Rp {(invSubtotal + Math.round(invSubtotal * 0.11)).toLocaleString('id-ID')}</strong></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddInvoiceOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Terbitkan Faktur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT FAKTUR */}
      {editingInvoice && (
        <div className="modal-overlay" onClick={() => setEditingInvoice(null)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Edit Faktur: {editingInvoice.invoiceNumber}</h3>
              <button className="btn-icon" onClick={() => setEditingInvoice(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveEditInvoice}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Pelanggan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingInvoice.customerName}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, customerName: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Total Tagihan (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editingInvoice.totalAmount}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, totalAmount: +e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jatuh Tempo</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingInvoice.dueDate}
                      onChange={(e) => setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status Tagihan</label>
                  <select
                    className="form-select"
                    value={editingInvoice.status}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as any })}
                  >
                    <option value="UNPAID">BELUM BAYAR</option>
                    <option value="OVERDUE">TERISOLIR (OVERDUE)</option>
                    <option value="PAID">LUNAS (PAID)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingInvoice(null)}>
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

      {/* MODAL CHECKOUT PAYMENT GATEWAY & KASIR */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => !isProcessing && setSelectedInvoice(null)}>
          <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-neutral">{selectedInvoice.invoiceNumber}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {showThermalReceipt ? 'Kwitansi Pelunasan Tagihan' : 'Payment Gateway Checkout'}
                </h3>
              </div>
              {!isProcessing && (
                <button className="btn-icon" onClick={() => setSelectedInvoice(null)}>✕</button>
              )}
            </div>

            {showThermalReceipt ? (
              <div className="modal-body" style={{ background: '#f8fafc', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="thermal-receipt" id="printable-payment-receipt">
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>
                    SCORIP FIBER NETWORK
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>
                    PT SCORIP TELEKOMUNIKASI INDONESIA<br />
                    Izin ISP No: 194/TEL.02.02/2026<br />
                    Telp: 0812-3456-7890
                  </div>
                  <hr />
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', margin: '0.3rem 0' }}>
                    BUKTI PEMBAYARAN SAH (LUNAS)
                  </div>
                  <hr />
                  <div style={{ fontSize: '0.72rem' }}>No Faktur : {selectedInvoice.invoiceNumber}</div>
                  <div style={{ fontSize: '0.72rem' }}>Pelanggan : {selectedInvoice.customerName}</div>
                  <div style={{ fontSize: '0.72rem' }}>User PPPoE: {selectedInvoice.pppoeUser}</div>
                  <div style={{ fontSize: '0.72rem' }}>Paket     : {selectedInvoice.planName}</div>
                  <div style={{ fontSize: '0.72rem' }}>Tgl Lunas : {selectedInvoice.paidAt || '28/09/2026 22:15'}</div>
                  <div style={{ fontSize: '0.72rem' }}>Metode    : {selectedInvoice.paymentMethod || 'KASIR_TUNAI'}</div>
                  <hr />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Tagihan Pokok</span>
                    <span>Rp {selectedInvoice.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>PPN 11%</span>
                    <span>Rp {selectedInvoice.taxPpn.toLocaleString('id-ID')}</span>
                  </div>
                  <hr />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    <span>TOTAL BAYAR</span>
                    <span>Rp {selectedInvoice.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <hr />
                  <div style={{ textAlign: 'center', fontSize: '0.68rem', marginTop: '0.5rem' }}>
                    Status internet telah dipulihkan otomatis.<br />
                    Simpan resi ini sebagai bukti pembayaran yang sah.<br />
                    Terima kasih atas kepercayaan Anda!
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-secondary" onClick={() => setSelectedInvoice(null)}>
                    Selesai &amp; Tutup
                  </button>
                  <button className="btn-primary" onClick={() => window.print()}>
                    <Printer size={15} />
                    <span>Cetak Nota Bluetooth 58mm</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pelanggan:</div>
                    <strong style={{ fontSize: '0.95rem' }}>{selectedInvoice.customerName}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {selectedInvoice.planName}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Pembayaran:</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                      Rp {selectedInvoice.totalAmount.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <button
                    className={`tab-btn ${paymentTab === 'QRIS' ? 'active' : ''}`}
                    onClick={() => setPaymentTab('QRIS')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <QrCode size={15} />
                    <span>QRIS Dinamis</span>
                  </button>

                  <button
                    className={`tab-btn ${paymentTab === 'VA' ? 'active' : ''}`}
                    onClick={() => setPaymentTab('VA')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Building size={15} />
                    <span>Virtual Account</span>
                  </button>

                  <button
                    className={`tab-btn ${paymentTab === 'CASH' ? 'active' : ''}`}
                    onClick={() => setPaymentTab('CASH')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <DollarSign size={15} />
                    <span>Kasir / Tunai</span>
                  </button>
                </div>

                {paymentTab === 'QRIS' && (
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Pindai QRIS Menggunakan BCA, GoPay, OVO, Dana, Mandiri, ShopeePay
                    </div>

                    <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', display: 'inline-block', margin: '0.5rem 0', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                      <svg width="180" height="180" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="#ffffff" />
                        <rect x="5" y="5" width="25" height="25" fill="#000000" />
                        <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
                        <rect x="11" y="11" width="13" height="13" fill="#000000" />

                        <rect x="70" y="5" width="25" height="25" fill="#000000" />
                        <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
                        <rect x="76" y="11" width="13" height="13" fill="#000000" />

                        <rect x="5" y="70" width="25" height="25" fill="#000000" />
                        <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
                        <rect x="11" y="76" width="13" height="13" fill="#000000" />

                        <rect x="35" y="10" width="8" height="8" fill="#000000" />
                        <rect x="50" y="15" width="8" height="8" fill="#000000" />
                        <rect x="40" y="30" width="20" height="20" fill="#06b6d4" rx="2" />
                        <rect x="44" y="34" width="12" height="12" fill="#ffffff" />
                        <rect x="46" y="36" width="8" height="8" fill="#06b6d4" />
                        <rect x="15" y="45" width="10" height="10" fill="#000000" />
                        <rect x="70" y="45" width="15" height="8" fill="#000000" />
                        <rect x="35" y="65" width="8" height="20" fill="#000000" />
                        <rect x="50" y="75" width="15" height="8" fill="#000000" />
                        <rect x="75" y="70" width="15" height="15" fill="#000000" />
                      </svg>
                      <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#000000', marginTop: '0.2rem' }}>
                        NMID: ID102688941209
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '0.4rem' }}>
                      <Clock size={13} />
                      <span>Berlaku 14:59 menit • Nominal Tepat Pas</span>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                      <button
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleExecutePayment('QRIS')}
                        disabled={isProcessing}
                      >
                        <Zap size={15} />
                        <span>{isProcessing ? 'Memverifikasi Webhook Pembayaran...' : 'Simulasikan Scan QRIS Berhasil'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {paymentTab === 'VA' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BCA Virtual Account:</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                          88012 08123456789
                        </div>
                      </div>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          navigator.clipboard.writeText('8801208123456789');
                          setCopiedVa(true);
                          setTimeout(() => setCopiedVa(false), 2000);
                        }}
                      >
                        {copiedVa ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                        <span>{copiedVa ? 'Tersalin' : 'Salin VA'}</span>
                      </button>
                    </div>

                    <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mandiri Virtual Account:</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          89022 08123456789
                        </div>
                      </div>
                      <span className="badge badge-neutral">Auto Detect</span>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleExecutePayment('VA_BCA')}
                        disabled={isProcessing}
                      >
                        <Zap size={15} />
                        <span>{isProcessing ? 'Memverifikasi Transfer Bank...' : 'Simulasikan Transfer Virtual Account Berhasil'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {paymentTab === 'CASH' && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Uang Tunai Diterima (Rp)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={cashGiven}
                        onChange={(e) => setCashGiven(+e.target.value)}
                      />
                    </div>

                    <div style={{ padding: '0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Kembalian Kasir:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                        Rp {Math.max(0, cashGiven - selectedInvoice.totalAmount).toLocaleString('id-ID')}
                      </strong>
                    </div>

                    <button
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleExecutePayment('CASH_KASIR')}
                      disabled={isProcessing || cashGiven < selectedInvoice.totalAmount}
                    >
                      <Printer size={15} />
                      <span>{isProcessing ? 'Menyimpan Transaksi...' : 'Terima Pembayaran Tunai & Cetak Struk POS'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
