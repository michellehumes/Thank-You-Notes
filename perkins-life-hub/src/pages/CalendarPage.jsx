import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import Card from '../components/Card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarPage({ data }) {
  const { events, addEvent } = data;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', category: 'personal' });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const eventsByDate = useMemo(() => {
    const map = {};
    (events || []).forEach((e) => {
      const key = format(new Date(e.date), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : [];

  const handleAdd = () => {
    if (!newEvent.title || !newEvent.date) return;
    addEvent({ ...newEvent, date: new Date(newEvent.date).toISOString() });
    setNewEvent({ title: '', date: '', category: 'personal' });
    setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-900">Calendar</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-[12px] rounded hover:bg-primary-700 transition-colors">
          <Plus size={14} /> Add Event
        </button>
      </div>

      {showAdd && (
        <Card className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input type="text" placeholder="Event title" value={newEvent.title} onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))} className="border border-neutral-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-primary-400" />
            <input type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))} className="border border-neutral-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-primary-400" />
            <select value={newEvent.category} onChange={(e) => setNewEvent((p) => ({ ...p, category: e.target.value }))} className="border border-neutral-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:border-primary-400">
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="home">Home</option>
              <option value="business">Business</option>
              <option value="social">Social</option>
              <option value="travel">Travel</option>
            </select>
            <button onClick={handleAdd} className="bg-primary-600 text-white text-[12px] rounded hover:bg-primary-700 transition-colors">Save</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-neutral-100 rounded"><ChevronLeft size={16} /></button>
            <h3 className="text-[15px] font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-neutral-100 rounded"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-neutral-50 text-center py-1.5 text-[11px] font-semibold text-neutral-500 uppercase">{d}</div>
            ))}
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[key] || [];
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const inMonth = isSameMonth(day, currentMonth);
              return (
                <button key={key} onClick={() => setSelectedDate(day)} className={`bg-white min-h-[72px] p-1.5 text-left transition-colors ${!inMonth ? 'opacity-40' : ''} ${isSelected ? 'ring-2 ring-primary-400' : ''} ${isToday ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}>
                  <span className={`text-[12px] ${isToday ? 'font-bold text-primary-700' : 'text-neutral-700'}`}>{format(day, 'd')}</span>
                  {dayEvents.slice(0, 2).map((e) => (
                    <div key={e.id} className="mt-0.5 text-[10px] px-1 py-0.5 rounded bg-primary-100 text-primary-700 truncate">{e.title}</div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[10px] text-neutral-500 mt-0.5">+{dayEvents.length - 2} more</div>}
                </button>
              );
            })}
          </div>
        </Card>

        <Card title={selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}>
          {selectedEvents.length === 0 ? (
            <p className="text-[13px] text-neutral-500">{selectedDate ? 'No events on this date' : 'Click a date to view events'}</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((e) => (
                <div key={e.id} className="border-b border-neutral-100 pb-2 last:border-0">
                  <p className="text-[13px] font-medium text-neutral-800">{e.title}</p>
                  <p className="text-[11px] text-neutral-500">{format(new Date(e.date), 'h:mm a')}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 mt-1 inline-block">{e.category}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
