import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Sun, Cloud, Moon, Sunset,
  Pill, Check, Clock
} from 'lucide-react';
import {
  startOfWeek, endOfWeek, addDays, addWeeks, subWeeks,
  format, isSameDay, isWithinInterval, parseISO, isToday
} from 'date-fns';

const TIME_SLOTS = [
  { key: 'Morning', label: 'Morning', time: '08:00 AM', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  { key: 'Afternoon', label: 'Afternoon', time: '01:00 PM', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  { key: 'Evening', label: 'Evening', time: '06:00 PM', icon: Sunset, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { key: 'Night', label: 'Night', time: '09:00 PM', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
];

const PILL_COLORS = [
  'from-blue-400 to-blue-600',
  'from-rose-400 to-rose-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-amber-400 to-amber-600',
  'from-cyan-400 to-cyan-600',
];

const MedicineCalendar = ({ medicines, selectedMember, onToggleTaken }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [animationDir, setAnimationDir] = useState('');

  const currentWeekStart = useMemo(() => {
    const base = addWeeks(new Date(), weekOffset);
    return startOfWeek(base, { weekStartsOn: 1 });
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    setAnimationDir('slide-right');
    setWeekOffset(prev => prev - 1);
    setTimeout(() => setAnimationDir(''), 300);
  };

  const handleNextWeek = () => {
    setAnimationDir('slide-left');
    setWeekOffset(prev => prev + 1);
    setTimeout(() => setAnimationDir(''), 300);
  };

  // Generate scheduled medicines for the selected date
  const scheduledMedicines = useMemo(() => {
    if (!medicines || medicines.length === 0) return [];
    
    return medicines.filter(med => {
      if (!med.startDate || !med.durationDays || !med.scheduleTimes) return false;
      
      const start = med.startDate.toDate ? med.startDate.toDate() : new Date(med.startDate);
      const end = addDays(start, med.durationDays - 1);
      
      return isWithinInterval(selectedDate, { start, end });
    }).flatMap((med, medIndex) => {
      const times = med.scheduleTimes || ['Morning'];
      return times.map(time => ({
        ...med,
        timeSlot: time,
        pillColor: PILL_COLORS[medIndex % PILL_COLORS.length],
        takenKey: `${med.id}_${format(selectedDate, 'yyyy-MM-dd')}_${time}`,
      }));
    });
  }, [medicines, selectedDate]);

  // Group by time slot
  const groupedMedicines = useMemo(() => {
    const groups = {};
    TIME_SLOTS.forEach(slot => {
      const meds = scheduledMedicines.filter(m => m.timeSlot === slot.key);
      if (meds.length > 0) {
        groups[slot.key] = meds;
      }
    });
    return groups;
  }, [scheduledMedicines]);

  const totalScheduled = scheduledMedicines.length;
  const totalTaken = scheduledMedicines.filter(m => m.taken && m.taken[format(selectedDate, 'yyyy-MM-dd')]?.includes(m.timeSlot)).length;
  const progressPercent = totalScheduled > 0 ? (totalTaken / totalScheduled) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Weekly Calendar Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Month/Year header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {format(currentWeekStart, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevWeek}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setWeekOffset(0); setSelectedDate(new Date()); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
            >
              Today
            </button>
            <button 
              onClick={handleNextWeek}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Pills */}
        <div className={`px-6 pb-5 transition-all duration-300 ${animationDir === 'slide-left' ? 'animate-slide-left' : animationDir === 'slide-right' ? 'animate-slide-right' : ''}`}>
          <div className="flex justify-between items-center">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-200 flex-1 mx-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                      : isTodayDate
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-lg font-bold ${isSelected ? 'text-white' : ''}`}>
                    {format(day, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Progress Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {isToday(selectedDate) ? "Today's Progress" : format(selectedDate, 'MMM d') + "'s Progress"}
              </h3>
              <p className="text-sm text-slate-500">
                {totalScheduled === 0 ? 'No medicines scheduled' : `${totalTaken} of ${totalScheduled} completed`}
              </p>
            </div>
          </div>
          
          {/* Circular Progress */}
          {totalScheduled > 0 && (
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  stroke="#e2e8f0" strokeWidth="4" fill="none"
                />
                <circle
                  cx="32" cy="32" r="28"
                  stroke="#3b82f6" strokeWidth="4" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-800">
                  {totalTaken}<span className="text-slate-400 text-xs">/{totalScheduled}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medicine Timeline */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800">
          {isToday(selectedDate) ? "Today's Medicines" : `Medicines for ${format(selectedDate, 'MMM d, yyyy')}`}
        </h3>

        {Object.keys(groupedMedicines).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No medicines scheduled for this day</p>
            <p className="text-sm text-slate-400 mt-1">
              Add medicines with scheduling to see them here
            </p>
          </div>
        ) : (
          TIME_SLOTS.map(slot => {
            const meds = groupedMedicines[slot.key];
            if (!meds) return null;
            const SlotIcon = slot.icon;

            return (
              <div key={slot.key} className="space-y-3">
                {/* Time Header */}
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${slot.bg} ${slot.border} border`}>
                    <SlotIcon className={`w-4 h-4 ${slot.color}`} />
                    <span className={`text-sm font-semibold ${slot.color}`}>{slot.label}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{slot.time}</span>
                  </div>
                </div>

                {/* Medicine Cards */}
                {meds.map((med, i) => {
                  const dateKey = format(selectedDate, 'yyyy-MM-dd');
                  const isTaken = med.taken && med.taken[dateKey]?.includes(med.timeSlot);

                  return (
                    <div
                      key={med.takenKey}
                      className={`bg-white rounded-2xl shadow-sm border p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md ${
                        isTaken ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Taken checkbox */}
                        <button
                          onClick={() => onToggleTaken && onToggleTaken(med.id, dateKey, med.timeSlot)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isTaken
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                              : 'border-2 border-slate-300 text-transparent hover:border-blue-400'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <div>
                          <h4 className={`font-semibold ${isTaken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {med.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {med.dosage || '1 tablet'} • {med.instructions || 'with water'}
                          </p>
                        </div>
                      </div>

                      {/* Pill Icon */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${med.pillColor} flex items-center justify-center shadow-sm`}>
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MedicineCalendar;
