import React, { useState, useEffect, useRef } from 'react';
import type { SampleCorridorItem, CorridorAnalysisResponse } from '../types';
import { fetchSampleCorridors, analyzeCorridorRoute } from '../api';
import { MapPin, Trees, Droplets, Home, AlertTriangle, Compass, CheckCircle2, RefreshCw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const waypointIcon = L.divIcon({
  className: 'custom-waypoint-icon',
  html: '<div style="background-color: #4f46e5; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export const CorridorAnalyzerView: React.FC = () => {
  const [samples, setSamples] = useState<SampleCorridorItem[]>([]);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('');
  const [analysis, setAnalysis] = useState<CorridorAnalysisResponse | null>(null);
  const [loadingSamples, setLoadingSamples] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  // Initialize native Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([22.0, 78.9], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    layersRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layersRef.current = null;
    };
  }, []);

  // Load sample corridors
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingSamples(true);
        const data = await fetchSampleCorridors();
        setSamples(data);
        if (data.length > 0) {
          setSelectedCorridorId(data[0].id);
          runAnalysis(data[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load sample corridors');
      } finally {
        setLoadingSamples(false);
      }
    };
    load();
  }, []);

  // Update map polyline and waypoints whenever analysis changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current || !analysis) return;

    layersRef.current.clearLayers();

    if (analysis.coordinates && analysis.coordinates.length > 0) {
      const latLngs = analysis.coordinates.map((c) => [c[0], c[1]] as [number, number]);

      const polyline = L.polyline(latLngs, {
        color: analysis.vulnerability_assessment.badge_color || '#4f46e5',
        weight: 5,
        opacity: 0.85,
        dashArray: analysis.sector === 'RAILWAYS' ? '8, 8' : undefined
      }).addTo(layersRef.current);

      latLngs.forEach((coord, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === latLngs.length - 1;
        const label = isStart ? 'Origin' : isEnd ? 'Destination' : `Waypoint #${idx + 1}`;
        const marker = L.marker(coord, { icon: waypointIcon }).addTo(layersRef.current!);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: #1e293b;">${label}</strong><br/>
            Lat: ${coord[0].toFixed(4)}, Lng: ${coord[1].toFixed(4)}
          </div>
        `);
      });

      try {
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [35, 35] });
      } catch (e) {
        // Bounds fit fallback
      }
    }
  }, [analysis]);

  const runAnalysis = async (corridor: SampleCorridorItem) => {
    try {
      setAnalyzing(true);
      setError(null);
      const res = await analyzeCorridorRoute(
        corridor.coordinates,
        corridor.sector,
        corridor.state,
        corridor.name
      );
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectChange = (id: string) => {
    setSelectedCorridorId(id);
    const corr = samples.find((s) => s.id === id);
    if (corr) {
      runAnalysis(corr);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-emerald-800/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
                Geospatial Alignment & Environmental Buffer Engine
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Linear Infrastructure Corridor Analyzer
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Trace highway, rail, and energy transmission alignments. Quantify forest diversion friction, hydrologic river crossings, and peri-urban displacement before site mobilization.
            </p>
          </div>

          {/* Corridor Selector */}
          <div className="shrink-0 w-full sm:w-auto">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
              Select National Alignment:
            </label>
            {loadingSamples ? (
              <div className="text-xs text-slate-400">Loading corridors...</div>
            ) : (
              <select
                value={selectedCorridorId}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="bg-slate-800/90 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
              >
                {samples.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.state})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Map & Route Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Map Container (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[520px]">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Corridor Alignment Polyline ({analysis?.total_distance_km || 0} km)
              </span>
            </div>
            {analyzing && (
              <span className="text-[10px] text-indigo-600 font-mono flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Tracing route...</span>
              </span>
            )}
          </div>

          <div className="flex-1 w-full h-full relative z-0">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>
        </div>

        {/* Right: Environmental Friction & Vulnerability Analysis (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {analysis ? (
            <>
              {/* Vulnerability Score Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Corridor Vulnerability Assessment
                </span>

                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase text-white shadow-xs inline-block"
                      style={{ backgroundColor: analysis.vulnerability_assessment.badge_color }}
                    >
                      {analysis.vulnerability_assessment.tier} VULNERABILITY
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">
                      {analysis.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900 block">
                      {analysis.vulnerability_assessment.score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">out of 100</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  {analysis.vulnerability_assessment.summary}
                </p>
              </div>

              {/* Environmental Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                    <Trees className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Forest Diversion</span>
                  </span>
                  <span className="text-base font-extrabold text-emerald-950 block mt-0.5">
                    {analysis.environmental_metrics.forest_overlap_pct}%
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    {analysis.environmental_metrics.forest_stretch_km} km buffer
                  </span>
                </div>

                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 flex items-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    <span>River Bridges</span>
                  </span>
                  <span className="text-base font-extrabold text-sky-950 block mt-0.5">
                    {analysis.environmental_metrics.river_crossings_count}
                  </span>
                  <span className="text-[10px] text-sky-700">hydrologic crossings</span>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                    <Home className="w-3.5 h-3.5 text-amber-600" />
                    <span>Settlement</span>
                  </span>
                  <span className="text-base font-extrabold text-amber-950 block mt-0.5">
                    {analysis.environmental_metrics.settlement_density_pct}%
                  </span>
                  <span className="text-[10px] text-amber-700">peri-urban friction</span>
                </div>
              </div>

              {/* Corridor Statutory Directives */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Route Clearance Action Plan
                </span>

                <div className="space-y-2">
                  {analysis.corridor_recommendations.map((rec, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{rec.category}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] pl-5 leading-relaxed">
                        {rec.directive}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              Select corridor to inspect environmental friction...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
