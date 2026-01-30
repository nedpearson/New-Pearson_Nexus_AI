import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, X, Calendar as CalendarIcon, Link2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { CalendarEvent } from '../types';
import { ProofLinks } from '../components/ProofLinks';

const STORAGE_KEY = 'pnx_events';

function loadFromLocalStorage(): CalendarEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage(events: CalendarEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

interface CalendarProps {
  selectedEventId?: string;
}

export function Calendar({ selectedEventId }: CalendarProps) {
  const { organization } = useAuth();
  const { refresh } = useData();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (organization) {
      loadEvents();
    }
  }, [organization]);

  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        setSelectedEvent(event);
      }
    }
  }, [selectedEventId, events]);

  const loadEvents = () => {
    setLoading(true);
    const orgId = organization?.id || '1';
    const allEvents = loadFromLocalStorage();
    setEvents(allEvents.filter(e => e.organization_id === orgId));
    setLoading(false);
  };

  const deleteEvent = (eventId: string) => {
    const allEvents = loadFromLocalStorage();
    const updatedEvents = allEvents.filter(e => e.id !== eventId);
    saveToLocalStorage(updatedEvents);
    loadEvents();
    setSelectedEvent(null);
    refresh();
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Add Event</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading calendar...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {monthNames[month]} {year}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  const dayEvents = getEventsForDate(date);
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square p-2 rounded-lg border transition-all ${
                        isToday
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="flex-1 flex flex-col gap-0.5 mt-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs px-1 py-0.5 rounded truncate ${
                                  event.event_type === 'meeting'
                                    ? 'bg-blue-100 text-blue-700'
                                    : event.event_type === 'appointment'
                                    ? 'bg-green-100 text-green-700'
                                    : event.event_type === 'deadline'
                                    ? 'bg-red-100 text-red-700'
                                    : event.event_type === 'reminder'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{dayEvents.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <EventsList
              events={events}
              selectedDate={selectedDate}
              onEventClick={setSelectedEvent}
            />
          </div>
        </div>
      )}

      {showAddModal && (
        <AddEventModal
          defaultDate={selectedDate || new Date()}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadEvents();
            refresh();
          }}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={() => {
            loadEvents();
            refresh();
          }}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}

interface EventsListProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  onEventClick: (event: CalendarEvent) => void;
}

function EventsList({ events, selectedDate, onEventClick }: EventsListProps) {
  const filteredEvents = selectedDate
    ? events.filter(e => e.date === selectedDate.toISOString().split('T')[0])
    : events.filter(e => new Date(e.date) >= new Date(new Date().toDateString()));

  const getEventTypeColor = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'appointment':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'deadline':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {selectedDate
          ? `Events on ${selectedDate.toLocaleDateString()}`
          : 'Upcoming Events'
        }
      </h3>

      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-sm">No events</p>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map(event => (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className="w-full text-left p-3 rounded-lg border hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    {event.time && !event.all_day && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time.slice(0, 5)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-xs px-2 py-1 rounded border ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                    {event.source_bill_id && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Link2 className="w-3 h-3" />
                        <span>From bill</span>
                      </div>
                    )}
                    {event.source_case_id && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Link2 className="w-3 h-3" />
                        <span>From case</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface AddEventModalProps {
  defaultDate: Date;
  onClose: () => void;
  onSuccess: () => void;
}

function AddEventModal({ defaultDate, onClose, onSuccess }: AddEventModalProps) {
  const { organization } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate.toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['event_type']>('other');
  const [allDay, setAllDay] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const allEvents = loadFromLocalStorage();
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      organization_id: organization?.id || '1',
      title,
      description,
      date,
      time: allDay ? undefined : (time || undefined),
      end_time: allDay ? undefined : (endTime || undefined),
      location: location || undefined,
      notes,
      event_type: eventType,
      all_day: allDay,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allEvents.push(newEvent);
    saveToLocalStorage(allEvents);

    setSaving(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CalendarEvent['event_type'])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="meeting">Meeting</option>
                <option value="appointment">Appointment</option>
                <option value="deadline">Deadline</option>
                <option value="reminder">Reminder</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
              All Day Event
            </label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

function EventDetailModal({ event, onClose, onUpdate, onDelete }: EventDetailModalProps) {
  const { bills, cases } = useData();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time || '');
  const [endTime, setEndTime] = useState(event.end_time || '');
  const [location, setLocation] = useState(event.location || '');
  const [notes, setNotes] = useState(event.notes);
  const [eventType, setEventType] = useState(event.event_type);
  const [allDay, setAllDay] = useState(event.all_day);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);

    const allEvents = loadFromLocalStorage();
    const updatedEvents = allEvents.map(e =>
      e.id === event.id
        ? {
            ...e,
            title,
            description,
            date,
            time: allDay ? undefined : (time || undefined),
            end_time: allDay ? undefined : (endTime || undefined),
            location: location || undefined,
            notes,
            event_type: eventType,
            all_day: allDay,
            updated_at: new Date().toISOString(),
          }
        : e
    );

    saveToLocalStorage(updatedEvents);
    setSaving(false);
    setEditing(false);
    onUpdate();
  };

  const getEventTypeColor = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700';
      case 'appointment':
        return 'bg-green-100 text-green-700';
      case 'deadline':
        return 'bg-red-100 text-red-700';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {editing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as CalendarEvent['event_type'])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="appointment">Appointment</option>
                    <option value="deadline">Deadline</option>
                    <option value="reminder">Reminder</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editAllDay"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="editAllDay" className="text-sm font-medium text-gray-700">
                  All Day Event
                </label>
              </div>

              {!allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                {event.description && <p className="text-gray-600">{event.description}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">{new Date(event.date).toLocaleDateString()}</span>
                </div>

                {event.time && !event.all_day && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">
                      {event.time.slice(0, 5)}
                      {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                    </span>
                  </div>
                )}

                {event.all_day && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">All Day</span>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">{event.location}</span>
                  </div>
                )}

                <div>
                  <span className={`inline-block px-3 py-1 rounded-lg font-medium ${getEventTypeColor(event.event_type)}`}>
                    {event.event_type}
                  </span>
                </div>

                {event.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                    <p className="text-gray-600">{event.notes}</p>
                  </div>
                )}

                {(event.source_bill_id || event.source_case_id) && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created From</p>
                    <div className="flex flex-col gap-1">
                      {event.source_bill_id && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Link2 className="w-4 h-4" />
                          <span>Bill: {bills.find(b => b.id === event.source_bill_id)?.title || 'Unknown'}</span>
                        </div>
                      )}
                      {event.source_case_id && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Link2 className="w-4 h-4" />
                          <span>Case: {cases.find(c => c.id === event.source_case_id)?.title || 'Unknown'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Proof Documents</p>
                <ProofLinks entityType="event" entityId={event.id} />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this event?')) {
                      onDelete(event.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete Event
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
