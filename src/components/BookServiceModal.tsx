import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, CheckCircle2, Sparkles } from 'lucide-react';
import { STUDIO_SERVICES } from '../data/photographyData';
import { UserRecord } from '../types';

interface BookServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
  currentUser: UserRecord | null;
  onBookSuccess: (bookingData: {
    service: string;
    appointment_date: string;
    appointment_time: string;
    customer_name: string;
    phone: string;
    address: string;
    message: string;
    amount: number;
  }) => void;
}

export const BookServiceModal: React.FC<BookServiceModalProps> = ({
  isOpen,
  onClose,
  preselectedService,
  currentUser,
  onBookSuccess,
}) => {
  const [selectedService, setSelectedService] = useState<string>(
    preselectedService || STUDIO_SERVICES[0].name
  );
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [address, setAddress] = useState<string>(currentUser?.address || '');
  const [message, setMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
    }
    if (currentUser) {
      if (!name) setName(currentUser.name);
      if (!phone) setPhone(currentUser.phone);
      if (!address) setAddress(currentUser.address);
    }
  }, [preselectedService, currentUser]);

  if (!isOpen) return null;

  const currentServiceObj = STUDIO_SERVICES.find(s => s.name === selectedService) || STUDIO_SERVICES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onBookSuccess({
      service: selectedService,
      appointment_date: appointmentDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      appointment_time: appointmentTime,
      customer_name: name || 'Valued Client',
      phone: phone || '+91 98765 43210',
      address: address || 'Plot 42, Floor 2, Creative Arts Enclave, Off Linking Road, Bandra West, Mumbai - 400050',
      message: message,
      amount: currentServiceObj.numericPrice,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151e] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
            <p className="text-slate-300 text-sm">
              Your appointment for <strong>{selectedService}</strong> has been scheduled. You can view its status and invoice in <strong>My Bookings</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                SnepStudio Reservation
              </span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                Book a Photography Service
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select your service, preferred shoot date, and venue details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Service Select */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {STUDIO_SERVICES.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} &mdash; {s.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Shoot Date
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="09:00 AM">09:00 AM (Morning Glow)</option>
                    <option value="11:30 AM">11:30 AM (Studio Session)</option>
                    <option value="03:00 PM">03:00 PM (Afternoon)</option>
                    <option value="05:30 PM">05:30 PM (Golden Hour Sunset)</option>
                    <option value="07:30 PM">07:30 PM (Evening Reception)</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Venue Address */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Shoot Venue / City Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Grand Heritage Palace, Mumbai or Studio Session"
                  className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Creative Notes / Outfit Preferences
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell our photography team any specific shots or ideas you love..."
                  className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
              </div>

              {/* Price summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Investment:</span>
                <span className="text-base font-extrabold text-amber-400">
                  ₹{currentServiceObj.numericPrice.toLocaleString()}
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
