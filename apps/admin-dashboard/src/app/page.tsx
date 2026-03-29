"use client";

import { useEffect, useState, useCallback } from "react";
import { getTranslation, getInitialLanguage, type Language } from "../lib/i18n";

type RequestorDetails = {
  name: string;
  organization?: string;
  country: string;
  city: string;
  issueDescription: string;
  mobile: string;
  altMobile?: string;
  email: string;
};

type Appointment = {
  id: string;
  requestor: RequestorDetails;
  state: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "RESCHEDULED";
  suggestedTime: string;
  confirmedTime?: string;
  rescheduleNotes?: string;
  createdAt: string;
  updatedAt: string;
};

function CountdownTimer({ targetDate, label, language }: { targetDate: string; label: string; language: Language }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference === 0) return setTimeLeft(getTranslation('timer.now', language));

      const absDiff = Math.abs(difference);
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((absDiff / 1000 / 60) % 60);
      const seconds = Math.floor((absDiff / 1000) % 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (days === 0) parts.push(`${seconds}s`);

      const timeStr = parts.slice(0, 2).join(" ");
      setTimeLeft(difference > 0 ? `${getTranslation('timer.in', language)} ${timeStr}` : `${timeStr} ${getTranslation('timer.ago', language)}`);
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate, language]);

  return (
    <div className="flex flex-col items-end">
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{label}</p>
      <p className={`text-sm font-mono ${timeLeft.includes(getTranslation('timer.ago', language)) ? 'text-destructive font-bold' : 'text-primary animate-pulse'}`}>
        {timeLeft}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Theme & View State
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [view, setView] = useState<"all" | "today" | "tomorrow" | "upcoming" | "passed">("all");
  const [subView, setSubView] = useState<"upcoming" | "late">("upcoming");

  // Language State - initialize to 'en' to avoid hydration mismatch, update in useEffect
  const [language, setLanguage] = useState<Language>('en');

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Reschedule Modal State
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [newTime, setNewTime] = useState("");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang);
    }
  };

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Initialize language from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'am') {
      setLanguage(saved);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      if (search) params.append('search', search);
      if (stateFilter) params.append('state', stateFilter);
      if (view !== 'all') params.append('view', view);

      // Add late parameter for today view subnavigation
      if (view === 'today') {
        if (subView === 'late') {
          params.append('late', 'true');
        } else {
          // Upcoming: show appointments that are not late (more than 15 minutes in future)
          params.append('late', 'false');
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://196.189.237.3:8080/api";
      const url = `${apiUrl}/appointments?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      setAppointments(result.data);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, stateFilter, view, subView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchAppointments, view, subView]);

  const confirmAppointment = async (id: string, time?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://196.189.237.3:8080/api";
      const res = await fetch(`${apiUrl}/appointments/${id}/confirm`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTime: time || new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Failed to confirm");
      await fetchAppointments();
    } catch (err: any) {
      alert("Error confirming: " + err.message);
    }
  };

  const rescheduleAppointment = async () => {
    if (!editingApt || !newTime) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://196.189.237.3:8080/api";
      const res = await fetch(`${apiUrl}/appointments/${editingApt.id}/reschedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newTime: new Date(newTime).toISOString(),
          notes: rescheduleNotes,
          sendEmail: sendEmail
        }),
      });
      if (!res.ok) throw new Error("Failed to reschedule");
      setEditingApt(null);
      setNewTime("");
      setRescheduleNotes("");
      await fetchAppointments();
    } catch (err: any) {
      alert("Error rescheduling: " + err.message);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans selection:bg-primary/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter">{getTranslation('title.main', language)}</h1>
            <p className="text-muted-foreground mt-2 font-medium">{getTranslation('title.subtitle', language)}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-card border border-border rounded-2xl p-1">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${language === 'en' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('am')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${language === 'am' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
              >
                AM
              </button>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-2xl bg-card border border-border shadow-xl hover:bg-muted transition-all text-muted-foreground hover:text-primary"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.243l.707.707M7.757 7.757l.707.707M12 7a5 5 0 110 10 5 5 0 010-10z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-3 bg-card p-1.5 rounded-2xl border border-border shadow-2xl">
              <div className="px-5 py-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{getTranslation('title.totalRequests', language)}</p>
                <p className="text-2xl font-black text-foreground">{total}</p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <button
                onClick={fetchAppointments}
                className="p-4 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all group"
                title="Refresh Data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* View Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 p-1.5 bg-card/50 backdrop-blur-xl border border-border rounded-2xl w-fit">
          <button
            onClick={() => { setView('all'); setPage(1); setSubView('upcoming'); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'all' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {getTranslation('nav.all', language)}
          </button>
          <button
            onClick={() => { setView('today'); setPage(1); setSubView('upcoming'); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'today' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {getTranslation('nav.today', language)}
          </button>
          <button
            onClick={() => { setView('tomorrow'); setPage(1); setSubView('upcoming'); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'tomorrow' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {getTranslation('nav.tomorrow', language)}
          </button>
          <button
            onClick={() => { setView('upcoming'); setPage(1); setSubView('upcoming'); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'upcoming' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {getTranslation('nav.upcoming', language)}
          </button>
          <button
            onClick={() => { setView('passed'); setPage(1); setSubView('upcoming'); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'passed' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {getTranslation('nav.history', language)}
          </button>
        </nav>

        {/* Today Subnavigation */}
        {view === 'today' && (
          <nav className="flex gap-2 p-1.5 bg-card/30 backdrop-blur-xl border border-border rounded-2xl w-fit mt-2">
            <button
              onClick={() => { setSubView('upcoming'); setPage(1); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${subView === 'upcoming' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {getTranslation('nav.upcomingSub', language)}
            </button>
            <button
              onClick={() => { setSubView('late'); setPage(1); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${subView === 'late' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {getTranslation('nav.late', language)}
            </button>
          </nav>
        )}

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/20 p-6 rounded-3xl border border-border shadow-sm backdrop-blur-sm">
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder={getTranslation('search.placeholder', language)}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-background border border-border rounded-xl px-12 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={stateFilter}
            onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
            className="bg-background border border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
          >
            <option value="">{getTranslation('filter.allStatuses', language)}</option>
            <option value="PENDING">{getTranslation('filter.requested', language)}</option>
            <option value="CONFIRMED">{getTranslation('filter.confirmed', language)}</option>
            <option value="RESCHEDULED">{getTranslation('filter.rescheduled', language)}</option>
            <option value="COMPLETED">{getTranslation('filter.completed', language)}</option>
          </select>
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground font-medium px-4">
            Page {page} of {totalPages || 1}
          </div>
        </div>

        {loading && appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 w-full h-full rounded-full border-4 border-muted"></div>
              <div className="absolute top-0 w-full h-full rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-muted-foreground animate-pulse uppercase tracking-widest text-xs font-bold">{getTranslation('status.synchronizing', language)}</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-8 rounded-3xl flex items-center gap-4">
            <div className="bg-red-500/20 p-3 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="font-medium text-lg">{error}</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-32 text-muted-foreground bg-muted/10 rounded-3xl border-2 border-border border-dashed">
            <p className="text-xl font-medium">{getTranslation('error.noResults', language)}</p>
            <button onClick={() => { setSearch(''); setStateFilter(''); setPage(1); }} className="mt-4 text-primary hover:underline">{getTranslation('error.clearFilters', language)}</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="bg-card/60 border border-border/80 rounded-3xl p-6 transition-all hover:bg-card hover:border-border flex flex-col lg:flex-row gap-6 lg:items-center justify-between group backdrop-blur-sm relative overflow-hidden">

                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${apt.state === 'REQUESTED' ? 'bg-amber-500' : apt.state === 'CONFIRMED' ? 'bg-primary' : apt.state === 'RESCHEDULED' ? 'bg-purple-500' : 'bg-muted'}`}></div>

                  {/* Information Block */}
                  <div className="space-y-5 flex-1">
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-full border shadow-sm ${apt.state === 'REQUESTED' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                        apt.state === 'CONFIRMED' ? 'bg-primary/10 border-primary/30 text-primary' :
                          apt.state === 'RESCHEDULED' ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' :
                            'bg-muted/10 border-muted/30 text-muted-foreground'
                        }`}>
                        {apt.state}
                      </span>
                      <span className="text-muted-foreground text-xs font-mono">{apt.id.split('-').pop()}</span>
                    </div>

                    <div className="flex gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-foreground flex items-center gap-2 tracking-tight">
                          {apt.requestor.name}
                          {apt.requestor.organization && <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest py-1 px-2 bg-secondary rounded-md">@{apt.requestor.organization}</span>}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {apt.requestor.email}
                          </p>
                          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {apt.requestor.mobile}
                          </p>
                        </div>
                      </div>

                      {/* Countdown Timer Hooked to Time */}
                      <CountdownTimer
                        targetDate={apt.confirmedTime || apt.suggestedTime}
                        label={apt.state === 'CONFIRMED' || apt.state === 'RESCHEDULED' ? getTranslation('appointment.confirmedTime', language) : getTranslation('appointment.suggestedTime', language)}
                        language={language}
                      />
                    </div>

                    <div className="bg-background/40 rounded-2xl p-5 text-sm text-foreground border border-border/50 group-hover:border-border transition-colors shadow-inner">
                      <p className="text-[10px] text-muted-foreground font-black mb-2 uppercase tracking-widest">{getTranslation('appointment.inquiryContext', language)}</p>
                      <p className="leading-relaxed opacity-80">{apt.requestor.issueDescription}</p>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex flex-col gap-3 min-w-[260px] bg-muted/10 p-6 rounded-3xl border border-border/50 self-stretch justify-center">
                    <div className="mb-2">
                      <p className="text-[10px] text-muted-foreground font-bold mb-1 uppercase tracking-widest">{apt.state === 'CONFIRMED' || apt.state === 'RESCHEDULED' ? getTranslation('appointment.finalizedSchedule', language) : getTranslation('appointment.requestedSchedule', language)}</p>
                      <p className="text-foreground text-lg font-black tracking-tight">
                        {new Date(apt.confirmedTime || apt.suggestedTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-primary text-sm font-bold font-mono">
                        {new Date(apt.confirmedTime || apt.suggestedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {apt.state === 'REQUESTED' && (
                        <button
                          onClick={() => confirmAppointment(apt.id)}
                          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black tracking-tight hover:opacity-90 active:scale-95 transition-all text-sm shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                        >
                          {getTranslation('appointment.approveRequest', language)}
                        </button>
                      )}

                      {(apt.state === 'CONFIRMED' || apt.state === 'RESCHEDULED' || apt.state === 'REQUESTED') && (
                        <button
                          onClick={() => {
                            setEditingApt(apt);
                            setNewTime(new Date(apt.confirmedTime || apt.suggestedTime).toISOString().slice(0, 16));
                          }}
                          className="w-full py-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold hover:bg-muted active:scale-95 transition-all text-sm border border-border"
                        >
                          {getTranslation('appointment.modifySchedule', language)}
                        </button>
                      )}
                    </div>
                  </div>

                  {apt.rescheduleNotes && (
                    <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-sm text-primary italic">
                      <p className="text-[9px] font-black uppercase mb-1 not-italic opacity-70">{getTranslation('appointment.rescheduleNote', language)}</p>
                      "{apt.rescheduleNotes}"
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Pagination UI */}
            <div className="flex items-center justify-between bg-card p-6 rounded-3xl border border-border shadow-sm">
              <p className="text-sm text-muted-foreground font-medium font-mono">
                {getTranslation('pagination.showing', language)} {appointments.length} {getTranslation('pagination.of', language)} {total} {getTranslation('pagination.entries', language)}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-6 py-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${page === i + 1 ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-secondary text-muted-foreground hover:bg-muted'}`}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">{getTranslation('modal.modifySchedule', language)}</h2>
            <p className="text-muted-foreground text-sm mb-6 font-medium">{getTranslation('modal.resettingFor', language)} <span className="text-primary">{editingApt.requestor.name}</span></p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{getTranslation('modal.newDateTime', language)}</label>
                <input
                  type="datetime-local"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Reschedule Reason / Notes (Optional)</label>
                <textarea
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Explain why the appointment is being moved..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px] text-sm"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="send-email"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background"
                />
                <label htmlFor="send-email" className="text-sm font-bold text-foreground cursor-pointer">
                  Send email notification to appointee
                </label>
              </div>

              <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                <p className="text-[10px] text-muted-foreground font-bold mb-1 uppercase tracking-widest">Impacted Inquiry</p>
                <p className="text-xs text-muted-foreground line-clamp-2 italic">"{editingApt.requestor.issueDescription}"</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setEditingApt(null); setRescheduleNotes(""); }}
                  className="flex-1 py-4 rounded-2xl bg-secondary text-secondary-foreground font-bold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={rescheduleAppointment}
                  className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                >
                  Update & Notify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
