import React, { useState } from 'react';
import { Calendar, MapPin, User, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface SiteVisitWidgetProps {
  onBook: (bookingData: { date: string; time: string; name: string; phone: string }) => void;
  isLoading?: boolean;
}

export const SiteVisitWidget: React.FC<SiteVisitWidgetProps> = ({ onBook, isLoading = false }) => {
  const dates = [
    { label: 'Thu, 12', value: 'Thursday, Oct 12' },
    { label: 'Fri, 13', value: 'Friday, Oct 13' },
    { label: 'Sat, 14', value: 'Saturday, Oct 14' },
    { label: 'Sun, 15', value: 'Sunday, Oct 15' },
  ];
  const times = ['11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

  const [selectedDate, setSelectedDate] = useState(dates[2].value);
  const [selectedTime, setSelectedTime] = useState('4:00 PM');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showContactFields, setShowContactFields] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({ date: selectedDate, time: selectedTime, name: customerName || 'Valued Buyer', phone: customerPhone || 'Not provided' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 bg-white border border-[#EAE6E1] rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#EAE6E1] flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F5EFEB] text-[#735A3A] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#1A1A1A]">Schedule a Site Visit</h3>
            <p className="text-[11px] text-[#737373] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#735A3A]" />
              Northstar One, Sector 79
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Private
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Date */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#737373] mb-2">
            Preferred Date
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {dates.map((d) => (
              <button
                type="button"
                key={d.value}
                onClick={() => setSelectedDate(d.value)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all touch-manipulation ${
                  selectedDate === d.value
                    ? 'bg-[#F5EFEB] border-2 border-[#735A3A] text-[#735A3A]'
                    : 'bg-[#FAF7F2] border border-[#EAE6E1] text-[#595959] hover:border-[#DFCBB9]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#737373] mb-2">
            Preferred Time
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {times.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all touch-manipulation ${
                  selectedTime === t
                    ? 'bg-[#F5EFEB] border-2 border-[#735A3A] text-[#735A3A]'
                    : 'bg-[#FAF7F2] border border-[#EAE6E1] text-[#595959] hover:border-[#DFCBB9]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Optional contact details */}
        <div className="pt-2 border-t border-[#F0ECE6]">
          <button
            type="button"
            onClick={() => setShowContactFields(!showContactFields)}
            className="text-xs text-[#735A3A] hover:underline flex items-center justify-between w-full py-0.5"
          >
            <span>{showContactFields ? 'Hide contact details' : 'Add your contact details (optional)'}</span>
            <span className="text-[10px] text-[#8C8C8C]">{showContactFields ? '▲' : '▼'}</span>
          </button>

          {showContactFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-2 border-t border-[#F0ECE6]">
              <div>
                <label className="block text-[10px] text-[#737373] mb-1">Your Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#A3A3A3] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE6E1] rounded-lg pl-8 pr-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#735A3A]"
                    placeholder="Rahul Sharma"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[#737373] mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#A3A3A3] absolute left-2.5 top-2.5" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EAE6E1] rounded-lg pl-8 pr-3 py-2 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#735A3A]"
                    placeholder="+91 98100 00000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#735A3A] hover:bg-[#5E472D] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors touch-manipulation"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Securing Slot…
            </span>
          ) : (
            <>
              Request Site Visit
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
