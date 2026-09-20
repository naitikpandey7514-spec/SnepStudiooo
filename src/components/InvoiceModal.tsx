import React from 'react';
import { X, Printer, Download, Camera, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AppointmentRecord } from '../types';

interface InvoiceModalProps {
  booking: AppointmentRecord | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const invoiceNumber = `INV-SNEP-${2026}-${String(booking.id).padStart(4, '0')}`;
  const subtotal = booking.amount;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // Generate text/html printable download
    const invoiceContent = `
SNEPSTUDIO TAX INVOICE
======================================
Invoice Number: ${invoiceNumber}
Date: ${booking.appointment_date}
Customer: ${booking.customer_name}
Phone: ${booking.phone}
Venue: ${booking.address}
Service: ${booking.service}
Scheduled Time: ${booking.appointment_time}

Amount: ₹${subtotal.toLocaleString()}
GST (18%): ₹${gst.toLocaleString()}
Total Amount: ₹${total.toLocaleString()}
Payment Status: ${booking.payment_status.toUpperCase()} (${booking.payment_method || 'UPI/Online'})
======================================
SnepStudio - Capture. Create. Cherish.
hello@snepstudio.com | +91 98765 43210
    `;
    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12151e] border border-white/20 rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-lg cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Card Area */}
        <div id="printable-invoice" className="bg-[#161a25] border border-white/10 rounded-2xl p-6 sm:p-8 text-slate-200">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Camera className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Snep<span className="text-amber-400">Studio</span>
                </h2>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                  Capture. Create. Cherish.
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="text-amber-400 font-bold uppercase tracking-wider block text-[11px]">
                Official Tax Invoice
              </span>
              <span className="font-mono text-white text-sm font-bold block mt-0.5">{invoiceNumber}</span>
              <span className="text-slate-400 text-[11px]">Date: {booking.appointment_date}</span>
            </div>
          </div>

          {/* Billed To & Studio Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-white/10 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Billed To (Client):
              </span>
              <h4 className="text-sm font-bold text-white">{booking.customer_name}</h4>
              <p className="text-slate-400 mt-0.5">{booking.phone}</p>
              <p className="text-slate-400 mt-0.5">{booking.address}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Studio Office:
              </span>
              <h4 className="text-sm font-bold text-white">SnepStudio Media Labs</h4>
              <p className="text-slate-400 mt-0.5">Film City Road, Pune &middot; Mumbai</p>
              <p className="text-slate-400 mt-0.5">GSTIN: 27AABCS1429B1Z8</p>
            </div>
          </div>

          {/* Service Line Items */}
          <div className="py-6 border-b border-white/10">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/10 pb-2">
                  <th className="font-bold uppercase tracking-wider text-[10px] pb-2">Service Description</th>
                  <th className="font-bold uppercase tracking-wider text-[10px] pb-2 text-center">Schedule</th>
                  <th className="font-bold uppercase tracking-wider text-[10px] pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3">
                    <span className="font-bold text-white block">{booking.service}</span>
                    <span className="text-[11px] text-slate-400">Master color calibrated deliverables in 4K resolution</span>
                  </td>
                  <td className="py-3 text-center text-slate-300">
                    {booking.appointment_date} &middot; {booking.appointment_time}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-white">
                    ₹{subtotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Status */}
          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Payment Verification
              </span>
              {booking.payment_status === 'Paid' ? (
                <div className="inline-flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-bold px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Paid &amp; Cleared ({booking.payment_method || 'Online/UPI'})</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold px-3 py-1.5 rounded-xl">
                  <span>Payment Pending</span>
                </div>
              )}
            </div>

            <div className="w-full sm:w-48 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18%):</span>
                <span className="font-mono text-white">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-amber-400 pt-2 border-t border-white/10">
                <span>Total Due:</span>
                <span className="font-mono">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 text-xs">
          <button
            onClick={handlePrint}
            className="bg-white/10 hover:bg-white/15 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
