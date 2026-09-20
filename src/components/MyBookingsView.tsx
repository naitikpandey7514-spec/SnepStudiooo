import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CreditCard, FileText, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { AppointmentRecord } from '../types';

interface MyBookingsViewProps {
  bookings: AppointmentRecord[];
  onOpenBookingModal: () => void;
  onPayBooking: (bookingId: number, method: string) => void;
  onViewInvoice: (booking: AppointmentRecord) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onOpenBookingModal,
  onPayBooking,
  onViewInvoice,
}) => {
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<AppointmentRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  const handleConfirmPayment = () => {
    if (!selectedBookingForPayment) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      onPayBooking(selectedBookingForPayment.id, paymentMethod);
      setIsProcessingPayment(false);
      setSelectedBookingForPayment(null);
    }, 900);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Approved</span>;
      case 'In Progress':
        return <span className="bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">In Progress</span>;
      case 'Completed':
        return <span className="bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'Cancelled':
      case 'Rejected':
        return <span className="bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">{status}</span>;
      case 'Pending':
      default:
        return <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Pending Review</span>;
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            Client Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            My Scheduled Shoots &amp; Bookings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review your studio appointments, track status updates, and download service tax invoices.
          </p>
        </div>

        <button
          onClick={onOpenBookingModal}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Shoot</span>
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-[#12151e] border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Bookings Yet</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            You don't have any photography shoots or editing requests booked right now.
          </p>
          <button
            onClick={onOpenBookingModal}
            className="bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
          >
            Explore &amp; Book Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(b => (
            <div
              key={b.id}
              className="bg-[#12151e] border border-white/10 hover:border-white/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                {/* Top: Status & Booking ID */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-mono text-slate-500">
                    ID #{b.id}
                  </span>
                  <div>{getStatusBadge(b.status)}</div>
                </div>

                {/* Service Name */}
                <h3 className="text-xl font-bold text-white mb-3">{b.service}</h3>

                {/* Date & Time */}
                <div className="space-y-2 text-xs text-slate-300 mb-6 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{b.appointment_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{b.appointment_time}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{b.address}</span>
                  </div>
                </div>

                {b.message && (
                  <p className="text-[11px] text-slate-400 italic mb-4 line-clamp-2">
                    &ldquo;{b.message}&rdquo;
                  </p>
                )}
              </div>

              {/* Bottom: Price, Payment status & Actions */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Total</span>
                    <span className="font-extrabold text-amber-400 text-lg">
                      ₹{b.amount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    {b.payment_status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-400/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-400/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-400/10 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-400/20">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Payment Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => onViewInvoice(b)}
                    className="bg-white/5 hover:bg-white/10 text-slate-200 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Invoice</span>
                  </button>

                  {b.payment_status !== 'Paid' ? (
                    <button
                      onClick={() => setSelectedBookingForPayment(b)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Now</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-white/5 text-slate-500 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Settled</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Simulator Modal */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151e] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-1">Simulate Service Payment</h3>
            <p className="text-xs text-slate-400 mb-6">
              Payment for <strong className="text-white">{selectedBookingForPayment.service}</strong> (ID #{selectedBookingForPayment.id})
            </p>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6 flex items-center justify-between">
              <span className="text-xs text-slate-400">Payable Amount:</span>
              <span className="text-2xl font-black text-amber-400">
                ₹{selectedBookingForPayment.amount.toLocaleString()}
              </span>
            </div>

            {/* Payment method selector */}
            <div className="space-y-2 mb-6 text-xs">
              <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[10px]">
                Choose Payment Method
              </label>

              {[
                { id: 'UPI', label: 'UPI / Google Pay / PhonePe' },
                { id: 'Credit/Debit Card', label: 'Credit or Debit Card' },
                { id: 'Net Banking', label: 'Net Banking' },
                { id: 'Cash on Shoot', label: 'Cash Payment at Shoot Venue' },
              ].map(m => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === m.id
                      ? 'border-amber-400 bg-amber-400/10 text-white font-semibold'
                      : 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{m.label}</span>
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="accent-amber-400"
                  />
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => setSelectedBookingForPayment(null)}
                className="bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl cursor-pointer shadow-md"
              >
                {isProcessingPayment ? 'Processing...' : `Pay ₹${selectedBookingForPayment.amount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
