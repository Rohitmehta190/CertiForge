"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FirebaseService, EventRecord, TicketRecord } from "@/utils/firebaseService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import BackButton from "@/components/BackButton";
import TicketTemplate from "@/components/TicketTemplate";
import { Users, Ticket, CheckCircle, Video, Search, MapPin, Calendar, Clock, Crown, Download, Plus, CalendarDays, X, Link as LinkIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Papa from "papaparse";

interface Sponsor {
  id: string;
  name: string;
  url: string;
  logo: string;
}

interface AgendaItem {
  id: string;
  time: string;
  title: string;
  speaker: string;
}

export default function EventDashboardPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendees' | 'schedule' | 'sponsors'>('overview');

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  
  // Sponsors state
  const [sponsors, setSponsors] = useState<Sponsor[]>([
    { id: '1', name: 'TechCorp', url: 'https://example.com', logo: '🌐' }
  ]);
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [newSponsor, setNewSponsor] = useState({ name: '', url: '', logo: '🌟' });

  // Schedule state
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    { id: '1', time: '09:00 AM', title: 'Registration & Breakfast', speaker: 'Event Team' },
    { id: '2', time: '10:00 AM', title: 'Opening Keynote', speaker: 'CEO' }
  ]);
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [newAgenda, setNewAgenda] = useState({ time: '', title: '', speaker: '' });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        setLoading(true);
        const [eventData, ticketsData] = await Promise.all([
          FirebaseService.getEventById(eventId),
          FirebaseService.getEventTickets(eventId)
        ]);

        if (eventData) setEvent(eventData);
        setTickets(ticketsData || []);
      } catch (error) {
        console.error("Error fetching event details:", error);
        showToast("Failed to load event details", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId, user, showToast]);

  const handleExportCSV = () => {
    if (tickets.length === 0) {
      showToast("No attendees to export.", "warning");
      return;
    }
    
    const exportData = tickets.map(t => ({
      Ticket_ID: t.ticketId,
      Name: t.attendeeName,
      Email: t.attendeeEmail,
      Status: t.status,
      Checked_In_At: t.scannedAt ? new Date((t.scannedAt as any).seconds * 1000).toLocaleString() : 'N/A'
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event?.title || 'event'}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Attendee list exported successfully!", "success");
  };

  const handleAddSponsor = () => {
    if (!newSponsor.name.trim()) return;
    setSponsors([...sponsors, { ...newSponsor, id: Date.now().toString() }]);
    setNewSponsor({ name: '', url: '', logo: '🌟' });
    setShowAddSponsor(false);
    showToast("Sponsor added to the event.", "success");
  };

  const handleAddAgenda = () => {
    if (!newAgenda.title.trim() || !newAgenda.time.trim()) return;
    setAgenda([...agenda, { ...newAgenda, id: Date.now().toString() }]);
    setNewAgenda({ time: '', title: '', speaker: '' });
    setShowAddAgenda(false);
    showToast("Schedule item added.", "success");
  };

  const checkedInCount = tickets.filter(t => t.status === 'checked-in').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center -mt-10">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10" />
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin-slow" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-slate-500 mb-6">The event you are looking for does not exist or has been deleted.</p>
        <BackButton to="/events" label="Return to Events" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden animate-fade-in-up shadow-2xl border border-white/5">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-black/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <BackButton label="Back to Events" to="/events" className="text-white/80 hover:text-white mb-3 bg-black/20 backdrop-blur-md rounded-xl px-3 py-1.5 inline-flex" />
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-indigo-200">
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(event.date), "MMMM d, yyyy")}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {event.time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.venue}</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href={`/events/${eventId}/scanner`} className="gradient-btn px-6 py-3 rounded-2xl text-sm font-semibold active:scale-[0.97] flex items-center gap-2 shadow-lg shadow-indigo-500/25">
                <Video className="w-4 h-4" /> Scan Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-indigo-500/10 pb-4 animate-fade-in-up stagger-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Calendar },
          { id: 'attendees', label: 'Attendees', icon: Ticket },
          { id: 'schedule', label: 'Schedule', icon: CalendarDays },
          { id: 'sponsors', label: 'Sponsors', icon: Crown }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in-up stagger-2">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40">
                <h3 className="text-xl font-bold text-white mb-4">About Event</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                  {event.description || "No description provided for this outstanding event."}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Tickets", value: tickets.length, icon: Ticket, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Checked In", value: checkedInCount, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Pending", value: tickets.length - checkedInCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: "Sponsors", value: sponsors.length, icon: Crown, color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6 flex flex-col items-center text-center rounded-3xl">
                    <div className={`p-3 rounded-2xl mb-4 ${stat.bg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-3xl font-extrabold text-white font-mono">{stat.value}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-4">
              <div className="glass-card p-6 rounded-3xl border-t-2 border-t-indigo-500 bg-slate-900/60">
                <h3 className="font-bold text-white text-lg mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-400"/> Management Actions</h3>
                <div className="space-y-3">
                  <Link href={`/events/${eventId}/tickets/new`} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-500/10 border border-white/[0.02] hover:border-indigo-500/20 transition-all font-medium text-slate-200">
                    <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400 shadow-inner"><Plus className="w-5 h-5" /></div>
                    Generate Individual Ticket
                  </Link>
                  <Link href={`/events/${eventId}/tickets/bulk`} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-500/10 border border-white/[0.02] hover:border-blue-500/20 transition-all font-medium text-slate-200">
                    <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 shadow-inner"><Users className="w-5 h-5" /></div>
                    Bulk Import Attendees
                  </Link>
                  <button onClick={handleExportCSV} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-500/10 border border-white/[0.02] hover:border-emerald-500/20 transition-all font-medium text-slate-200 text-left">
                    <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400 shadow-inner"><Download className="w-5 h-5" /></div>
                    Export Attendee CSV List
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDEES TAB */}
        {activeTab === 'attendees' && (
          <div className="glass-card flex flex-col rounded-3xl overflow-hidden border border-white/5">
            <div className="p-6 border-b border-white/[0.05] bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search attendees..." 
                  className="pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white w-full sm:w-72 shadow-inner"
                />
              </div>
              <div className="flex gap-3">
                 <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-2xl text-sm font-bold transition-colors">
                   <Download className="w-4 h-4" /> Export
                 </button>
                 <Link href={`/events/${eventId}/tickets/bulk`} className="flex items-center gap-2 px-5 py-3 bg-indigo-500 text-white rounded-2xl text-sm font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                   <Plus className="w-4 h-4" /> Import
                 </Link>
              </div>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 border-b border-white/10">
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Attendee Profile</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Ticket ID</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Check-in Status</th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {tickets.length > 0 ? (
                    tickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 shrink-0">
                            {ticket.attendeeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-base text-white">{ticket.attendeeName}</div>
                            <div className="text-sm text-slate-400">{ticket.attendeeEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-sm text-indigo-300 bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-500/20 shadow-inner">
                            {ticket.ticketId.substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {ticket.status === 'checked-in' ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle className="w-4 h-4" /> Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <Clock className="w-4 h-4 border-amber-500" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                             onClick={() => setSelectedTicket(ticket)}
                             className="text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-colors shadow-sm"
                          >
                            View Ticket
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Ticket className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-bold text-white mb-1">No Tickets Issued</p>
                        <p className="text-sm text-slate-400">Generate or import tickets to see them here.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="glass-card p-6 flex justify-between items-center bg-indigo-950/20 border-indigo-500/20">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2"><CalendarDays className="w-6 h-6 text-indigo-400"/> Official Agenda</h3>
                 <button onClick={() => setShowAddAgenda(true)} className="gradient-btn px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Item
                 </button>
              </div>

              <div className="space-y-4">
                 {agenda.map((item, index) => (
                    <div key={item.id} className="glass-card p-5 border-l-4 border-l-indigo-500 flex flex-col sm:flex-row sm:items-center gap-4 hover:translate-x-2 transition-transform duration-300 rounded-2xl">
                       <div className="bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-300 font-mono font-bold whitespace-nowrap text-center">
                         {item.time}
                       </div>
                       <div className="flex-1">
                          <h4 className="text-lg font-bold text-white">{item.title}</h4>
                          <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1"><Users className="w-3.5 h-3.5"/> Speaker: {item.speaker}</p>
                       </div>
                       <button onClick={() => setAgenda(agenda.filter(a => a.id !== item.id))} className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
                 {agenda.length === 0 && (
                   <p className="text-slate-500 text-center py-10">No schedule items added.</p>
                 )}
              </div>
            </div>

            {/* Add Agenda Modal Form */}
            {showAddAgenda && (
               <div className="glass-card p-6 rounded-3xl animate-fade-in-up border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
                  <h4 className="font-bold text-white text-lg mb-4 flex justify-between items-center">
                     New Item <button onClick={() => setShowAddAgenda(false)}><X className="w-5 h-5 text-slate-500"/></button>
                  </h4>
                  <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">Time</label>
                       <input value={newAgenda.time} onChange={e => setNewAgenda({...newAgenda, time: e.target.value})} type="text" placeholder="e.g. 09:30 AM" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">Session Title</label>
                       <input value={newAgenda.title} onChange={e => setNewAgenda({...newAgenda, title: e.target.value})} type="text" placeholder="e.g. Keynote Speech" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1">Speaker Name</label>
                       <input value={newAgenda.speaker} onChange={e => setNewAgenda({...newAgenda, speaker: e.target.value})} type="text" placeholder="e.g. John Doe" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                     </div>
                     <button onClick={handleAddAgenda} className="w-full gradient-btn py-3 rounded-xl font-bold flex justify-center items-center gap-2 mt-2">
                        <Plus className="w-4 h-4"/> Save Item
                     </button>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* SPONSORS TAB */}
        {activeTab === 'sponsors' && (
          <div className="space-y-6">
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-amber-900/40 via-slate-900/40 to-transparent border-amber-500/20">
               <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3"><Crown className="w-8 h-8 text-amber-500"/> Managing Sponsors</h3>
                  <p className="text-slate-400">Add event sponsors. They will be highlighted in attendee communications and tickets.</p>
               </div>
               <button onClick={() => setShowAddSponsor(true)} className="mt-4 md:mt-0 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-2">
                  <Plus className="w-5 h-5"/> Add Sponsor
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {sponsors.map(sponsor => (
                <div key={sponsor.id} className="glass-card p-6 flex flex-col items-center justify-center text-center group rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{sponsor.logo}</div>
                  <h4 className="font-bold text-white text-lg w-full truncate">{sponsor.name}</h4>
                  <a href={sponsor.url} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-amber-400 flex items-center gap-1 mt-2">
                     <LinkIcon className="w-3 h-3"/> Visit Site
                  </a>
                  <button onClick={() => setSponsors(sponsors.filter(s => s.id !== sponsor.id))} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                     <X className="w-5 h-5"/>
                  </button>
                </div>
              ))}
            </div>

            {/* Add Sponsor Form Modal */}
            {showAddSponsor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                 <div className="glass-card max-w-sm w-full p-8 rounded-[2rem] border border-amber-500/30 shadow-2xl animate-scale-up">
                    <h3 className="text-2xl font-bold text-white mb-6">Add Official Sponsor</h3>
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Sponsor Emoji Icon</label>
                          <input value={newSponsor.logo} onChange={e => setNewSponsor({...newSponsor, logo: e.target.value})} maxLength={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-3xl text-center focus:outline-none focus:border-amber-500" />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Company Name</label>
                          <input value={newSponsor.name} onChange={e => setNewSponsor({...newSponsor, name: e.target.value})} placeholder="e.g. Acme Corp" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Website URL (Optional)</label>
                          <input value={newSponsor.url} onChange={e => setNewSponsor({...newSponsor, url: e.target.value})} placeholder="https://" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                       </div>
                       <div className="flex gap-3 mt-6">
                         <button onClick={() => setShowAddSponsor(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Cancel</button>
                         <button onClick={handleAddSponsor} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors">Add</button>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticket Preview Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedTicket(null)}>
          <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
             {/* Close Button top right */}
             <button onClick={() => setSelectedTicket(null)} className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                <X className="w-6 h-6"/>
             </button>
             
             <div className="animate-scale-up w-full flex justify-center">
                <div className="w-[300px]">
                  <TicketTemplate 
                    attendeeName={selectedTicket.attendeeName}
                    eventName={event.title}
                    date={event.date}
                    time={event.time}
                    venue={event.venue}
                    ticketType={selectedTicket.ticketType || "General Admission"}
                    ticketId={selectedTicket.ticketId}
                    qrData={selectedTicket.ticketId}
                    template="vertical"
                  />
                </div>
             </div>

             <div className="mt-6 flex justify-center gap-4 animate-fade-in-up stagger-1">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/verify/${selectedTicket.ticketId}`;
                    navigator.clipboard.writeText(url);
                    showToast("Verification URL copied!", "success");
                  }} 
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-bold flex items-center gap-2 transition-all">
                  <LinkIcon className="w-4 h-4"/> Copy Link
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
