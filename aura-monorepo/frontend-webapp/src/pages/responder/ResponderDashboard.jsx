import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  RefreshCw, 
  ArrowLeft, 
  Battery, 
  User, 
  Eye, 
  ChevronRight,
  Flame,
  Volume2
} from 'lucide-react';
import L from 'leaflet';
import apiClient from '../../services/apiClient.js';

export default function ResponderDashboard() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState('active'); // 'all' | 'active' | 'resolved'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Johannesburg South / Mondeor
      const defaultCenter = [-26.2798, 28.0069];
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(defaultCenter, 13);

      // Dark tactical carto tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch Incidents from Backend API
  const fetchIncidents = async () => {
    try {
      const response = await apiClient.getResponderIncidents();
      if (response && response.incidents) {
        setIncidents(response.incidents);
        setLastFetchedAt(new Date().toLocaleTimeString());
        
        // Auto-select first active incident if none selected
        if (!selectedIncident && response.incidents.length > 0) {
          const firstOpen = response.incidents.find((i) => ['active', 'acknowledged', 'dispatched'].includes(i.status)) || response.incidents[0];
          setSelectedIncident(firstOpen);
        }
      }
    } catch (err) {
      console.warn('[RESPONDER_POLL_ERROR]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3-Second Real-Time Telemetry Polling Loop
  useEffect(() => {
    fetchIncidents();

    if (!autoRefresh) return;
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Update Map Markers on Incidents Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    incidents.forEach((inc) => {
      const lat = inc.coordinates?.lat || -26.2798;
      const lng = inc.coordinates?.lng || 28.0069;
      const isActive = ['active', 'acknowledged', 'dispatched'].includes(inc.status);

      // Custom Tactical Marker Element
      const iconHtml = `
        <div style="
          width: 32px; 
          height: 32px; 
          background: ${isActive ? '#ef4444' : '#10b981'}; 
          border: 3px solid #ffffff; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 0 15px ${isActive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.4)'};
        ">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="color: #111; font-family: sans-serif; font-size: 12px; padding: 4px;">
          <b style="color: #dc2626;">${inc.id}</b><br/>
          <strong>${inc.userName || 'Citizen'}</strong><br/>
          <span>${inc.type}</span><br/>
          <small>${inc.contextLocation || 'Mondeor Sector'}</small>
        </div>
      `);

      marker.on('click', () => {
        setSelectedIncident(inc);
      });

      markersRef.current[inc.id] = marker;
    });

    // Pan to selected incident
    if (selectedIncident?.coordinates) {
      map.panTo([selectedIncident.coordinates.lat, selectedIncident.coordinates.lng], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [incidents, selectedIncident]);

  // Action: Acknowledge, Dispatch, or Resolve
  const handleUpdateStatus = async (incidentId, newStatus) => {
    setIsUpdating(true);
    try {
      await apiClient.updateResponderIncident(incidentId, {
        status: newStatus,
        responderName: 'Capt. Johan Van Wyk (Flying Squad 4)',
        responderId: 'resp_saps_004',
      });
      await fetchIncidents();
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Update ETA
  const handleUpdateEta = async (incidentId, delta) => {
    if (!selectedIncident) return;
    const currentEta = selectedIncident.etaMinutes || 4;
    const nextEta = Math.max(1, currentEta + delta);

    setIsUpdating(true);
    try {
      await apiClient.updateResponderIncident(incidentId, { etaMinutes: nextEta });
      setSelectedIncident((prev) => ({ ...prev, etaMinutes: nextEta }));
      await fetchIncidents();
    } catch (err) {
      console.error('Failed to update ETA:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredIncidents = incidents.filter((i) => {
    if (filter === 'active') return ['active', 'acknowledged', 'dispatched'].includes(i.status);
    if (filter === 'resolved') return i.status === 'resolved' || i.status === 'cancelled';
    return true;
  });

  const activeCount = incidents.filter((i) => ['active', 'acknowledged', 'dispatched'].includes(i.status)).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-white font-sans overflow-hidden">
      {/* Top Tactical Command Header */}
      <header className="border-b border-zinc-900 bg-zinc-950 px-4 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition"
            title="Return to Citizen Portal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white leading-none">e-SAPS TACTICAL DISPATCH MESH</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                  {activeCount} ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Station: Mondeor GP &bull; Unit 4 Patrol</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-zinc-400 font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
            <span>3s Mesh Polling</span>
          </div>

          <button
            onClick={fetchIncidents}
            disabled={isLoading}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition"
            title="Refresh Incident Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Grid: Responsive Split View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: Incident Queue List */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950 flex flex-col shrink-0 max-h-[40vh] md:max-h-full overflow-hidden">
          {/* Queue Filter Tabs */}
          <div className="p-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80">
            <div className="flex space-x-1">
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filter === 'active' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({incidents.length})
              </button>
            </div>

            <span className="text-[10px] text-zinc-500 font-mono">
              {lastFetchedAt ? `Synced ${lastFetchedAt}` : 'Live'}
            </span>
          </div>

          {/* Queue Scroll List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 font-mono text-xs">
                No emergency incidents in this queue.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isActive = ['active', 'acknowledged', 'dispatched'].includes(inc.status);
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-rose-500/80 shadow-lg shadow-rose-950/20'
                        : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-rose-400">
                        {inc.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          inc.status === 'active'
                            ? 'bg-rose-600/30 text-rose-400 border border-rose-500/40'
                            : inc.status === 'dispatched'
                            ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                            : inc.status === 'acknowledged'
                            ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-white truncate">
                      {inc.userName || 'Anonymous Citizen'}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {inc.type}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-2 pt-2 border-t border-zinc-800/60">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span className="truncate max-w-[120px]">{inc.contextLocation?.split(',')[0] || 'Mondeor'}</span>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        ETA: {inc.etaMinutes || 4}m
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center / Right Side: Live Leaflet Map Container */}
        <div className="flex-1 relative flex flex-col min-h-[300px]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[300px] z-10" />

          {/* Floating Selected Incident Action Card Overlay */}
          {selectedIncident && (
            <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 md:max-w-xl z-20 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-4 shadow-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white">
                      DISPATCH ACTIVE
                    </span>
                    <span className="text-xs font-mono text-zinc-400">{selectedIncident.id}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-1">
                    {selectedIncident.userName} &bull; <span className="text-zinc-400">{selectedIncident.userPhone}</span>
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {selectedIncident.contextLocation || 'Mondeor Sector, Johannesburg South'}
                  </p>
                </div>

                {/* Direct Dial Link */}
                <a
                  href={`tel:${selectedIncident.userPhone || '+27821234567'}`}
                  className="p-2.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                  title="Direct Call Victim"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {selectedIncident.notes && (
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 text-[11px] text-zinc-300">
                  <span className="text-zinc-500 font-mono">Telemetry Notes: </span>
                  {selectedIncident.notes}
                </div>
              )}

              {/* Status & ETA Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
                {/* Status Toggles */}
                <div className="flex space-x-1.5">
                  {selectedIncident.status === 'active' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedIncident.id, 'acknowledged')}
                      disabled={isUpdating}
                      className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {selectedIncident.status === 'acknowledged' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedIncident.id, 'dispatched')}
                      disabled={isUpdating}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Unit En Route
                    </button>
                  )}
                  {['active', 'acknowledged', 'dispatched'].includes(selectedIncident.status) && (
                    <button
                      onClick={() => handleUpdateStatus(selectedIncident.id, 'resolved')}
                      disabled={isUpdating}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>

                {/* Dynamic ETA Adjustment */}
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-xs font-mono text-zinc-400">ETA:</span>
                  <button
                    onClick={() => handleUpdateEta(selectedIncident.id, -1)}
                    disabled={isUpdating}
                    className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold text-emerald-400 min-w-[32px] text-center">
                    {selectedIncident.etaMinutes || 4}m
                  </span>
                  <button
                    onClick={() => handleUpdateEta(selectedIncident.id, 1)}
                    disabled={isUpdating}
                    className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
