import React, { useState } from 'react';
import { CheckCircle, Calendar, Clock, MapPin, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteVisitBooking } from '../types';

interface BookingConfirmationViewProps {
  booking: SiteVisitBooking;
  onReturnToChat: () => void;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  booking,
  onReturnToChat,
}) => {
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const handleAddToCalendar = () => {
    // Generate .ics calendar event for download
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Northstar Homes//Northstar One Private Site Visit//EN
BEGIN:VEVENT
SUMMARY:Northstar One - Private Luxury Site Visit
DESCRIPTION:Exclusive walkthrough of Northstar One luxury residences in Sector 79, Gurugram. Host: Northstar Concierge.
LOCATION:Northstar One, Sector 79, Gurugram, Haryana
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Northstar_One_Site_Visit.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setAddedToCalendar(true);
    setTimeout(() => setAddedToCalendar(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center text-center my-auto"
    >
      {/* Ambient background glow */}
      <div className="w-16 h-16 rounded-full bg-white border border-[#EAE6E1] flex items-center justify-center mb-4 lux-shadow text-[#1A1A1A]">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-1.5">
        Visit Confirmed
      </h1>
      <p className="text-sm sm:text-base text-[#737373] mb-6">
        Your private tour of Northstar One is scheduled.
      </p>

      {/* Booking Details Card */}
      <div className="w-full bg-white border border-[#EAE6E1] rounded-2xl p-5 sm:p-6 mb-6 text-left lux-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE6] pb-4 mb-4">
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#735A3A] bg-[#F5EFEB] px-2 py-0.5 rounded mb-1.5 inline-block">
              Property
            </span>
            <h2 className="text-lg font-bold text-[#1A1A1A]">{booking.propertyName}</h2>
            <p className="text-xs text-[#595959] flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#735A3A]" />
              {booking.location}
            </p>
          </div>

          {/* Minimalist Map Preview */}
          <div className="w-full sm:w-36 h-20 rounded-xl overflow-hidden bg-[#FAF7F2] relative border border-[#EAE6E1] shrink-0">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=300"
              alt="Sector 79 Gurugram Map View"
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-radial from-transparent to-black/10"></div>
            <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-xs text-[9px] font-semibold text-[#1A1A1A] px-1.5 py-0.5 rounded">
              Sector 79
            </div>
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8C8C8C] block mb-1">
              Date
            </span>
            <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#735A3A]" />
              {booking.date}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8C8C8C] block mb-1">
              Time
            </span>
            <p className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#735A3A]" />
              {booking.time} (IST)
            </p>
          </div>
        </div>

        {/* Booking ID & Confirmation badge */}
        <div className="mt-4 pt-3 border-t border-[#F0ECE6] flex items-center justify-between text-xs text-[#737373]">
          <span>Booking Ref: <strong className="font-mono text-[#1A1A1A]">{booking.id || 'NS-782910'}</strong></span>
          <span className="text-emerald-700 font-medium">Concierge Assigned</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          onClick={handleAddToCalendar}
          className="w-full sm:w-auto bg-[#1A1A1A] text-white text-xs font-semibold px-6 py-3 rounded-xl hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Calendar className="w-4 h-4 text-[#E5D2B8]" />
          <span>{addedToCalendar ? '✓ Added to Calendar' : 'Add to Calendar (.ics)'}</span>
        </button>

        <button
          onClick={onReturnToChat}
          className="w-full sm:w-auto bg-transparent border border-[#735A3A] text-[#735A3A] text-xs font-semibold px-6 py-3 rounded-xl hover:bg-[#F5EFEB] transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Return to Chat</span>
        </button>
      </div>
    </motion.div>
  );
};
