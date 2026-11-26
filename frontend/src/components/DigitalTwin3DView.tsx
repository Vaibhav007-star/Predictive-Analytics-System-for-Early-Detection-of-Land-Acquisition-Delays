import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Box,
  RotateCcw,
  Play,
  Pause,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Compass,
  TrendingUp
} from 'lucide-react';
import type { GeoProjectItem } from '../types';
import { fetchGeoProjects } from '../api';

interface DigitalTwin3DViewProps {
  onSelectProject: (projectCode: string) => void;
}

type ZMetric = 'risk_score' | 'orig_cost_cr' | 'delay_months';
type CameraPreset = 'iso' | 'top' | 'skyline';

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#10b981'
};

// Simplified India geographical outline [lon, lat] for 3D ground reference
const INDIA_OUTLINE: [number, number][] = [
  [68.2, 23.6], [69.0, 22.0], [70.5, 20.8], [72.6, 21.2], [72.8, 19.0],
  [73.8, 15.4], [74.8, 12.8], [76.2, 10.0], [77.5, 8.1], [79.8, 10.3],
  [80.3, 13.1], [82.2, 16.9], [84.9, 19.3], [87.0, 21.5], [88.9, 21.8],
  [89.8, 25.2], [92.3, 24.5], [94.5, 25.6], [96.5, 27.9], [95.0, 29.1],
  [92.0, 27.6], [88.2, 27.1], [85.5, 26.5], [82.0, 27.8], [79.0, 30.8],
  [77.0, 33.2], [74.5, 35.4], [73.8, 32.8], [74.5, 30.2], [70.5, 27.0],
  [68.8, 24.6], [68.2, 23.6]
];

function projectLonLatToXZ(lon: number, lat: number): [number, number] {
  // India bounds approx: lon 67..98, lat 6..36
  const x = ((lon - 82.5) / 15.5) * 20;
  const z = -((lat - 21.0) / 15.0) * 20;
  return [x, z];
}

function computePillarHeight(p: GeoProjectItem, metric: ZMetric): number {
  if (metric === 'risk_score') {
    return Math.max(0.35, (p.risk_score / 100) * 8.5);
  }
  if (metric === 'orig_cost_cr') {
    const val = Math.max(1, p.orig_cost_cr || 1);
    return Math.max(0.35, (Math.log10(val) / 5.2) * 9.0);
  }
  const delay = Math.max(0, p.delay_months || 0);
  return Math.max(0.35, Math.min(9.5, (delay / 120) * 9.0 + 0.35));
}

export const DigitalTwin3DView: React.FC<DigitalTwin3DViewProps> = ({ onSelectProject }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const [projects, setProjects] = useState<GeoProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Controls State
  const [zMetric, setZMetric] = useState<ZMetric>('risk_score');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [showArcs, setShowArcs] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Hover & Selection HUD State
  const [hoveredProject, setHoveredProject] = useState<{
    item: GeoProjectItem;
    x: number;
    y: number;
  } | null>(null);
  const [selectedItem, setSelectedItem] = useState<GeoProjectItem | null>(null);

  // Refs for Three.js imperative updates
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const autoRotateRef = useRef<boolean>(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Load projects
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchGeoProjects();
        if (active) {
          setProjects(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load geospatial projects');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const sectors = useMemo(() => {
    const s = new Set(projects.map((p) => p.sector).filter(Boolean));
    return ['ALL', ...Array.from(s).sort()];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (riskFilter !== 'ALL' && p.risk_category !== riskFilter) return false;
      if (sectorFilter !== 'ALL' && p.sector !== sectorFilter) return false;
      return typeof p.latitude === 'number' && typeof p.longitude === 'number';
    });
  }, [projects, riskFilter, sectorFilter]);

  const stats = useMemo(() => {
    const totalCap = filteredProjects.reduce((acc, p) => acc + (p.orig_cost_cr || 0), 0);
    const criticalCount = filteredProjects.filter((p) => p.risk_category === 'CRITICAL').length;
    const avgRisk =
      filteredProjects.length > 0
        ? filteredProjects.reduce((acc, p) => acc + (p.risk_score || 0), 0) / filteredProjects.length
        : 0;
    return {
      count: filteredProjects.length,
      criticalCount,
      totalCapCr: Math.round(totalCap),
      avgRisk: avgRisk.toFixed(1)
    };
  }, [filteredProjects]);

  const setCameraPreset = (preset: CameraPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (preset === 'iso') {
      cameraRef.current.position.set(22, 20, 24);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0, 36, 0.01);
    } else if (preset === 'skyline') {
      cameraRef.current.position.set(26, 6.5, 18);
    }
    controlsRef.current.target.set(0, 1.5, 0);
    controlsRef.current.update();
  };

  // Initialize & rebuild Three.js scene when filtered data / metric / arcs change
  useEffect(() => {
    const container = mountRef.current;
    if (!container || loading || filteredProjects.length === 0) return;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');
    scene.fog = new THREE.FogExp2('#020617', 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(22, 20, 24);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 8;
    controls.maxDistance = 60;
    controls.target.set(0, 1.5, 0);
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.65;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#cbd5e1', 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.4);
    dirLight.position.set(20, 35, 20);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.7);
    rimLight.position.set(-25, 15, -20);
    scene.add(rimLight);

    // Ground Grid & Radar Rings
    const gridHelper = new THREE.GridHelper(48, 48, '#1e293b', '#0f172a');
    scene.add(gridHelper);

    const baseGeo = new THREE.PlaneGeometry(48, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#060c1a',
      roughness: 0.9,
      metalness: 0.2
    });
    const basePlane = new THREE.Mesh(baseGeo, baseMat);
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.position.y = -0.02;
    scene.add(basePlane);

    // India Outline Wireframe
    const outlinePoints = INDIA_OUTLINE.map(([lon, lat]) => {
      const [x, z] = projectLonLatToXZ(lon, lat);
      return new THREE.Vector3(x, 0.04, z);
    });
    const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePoints);
    const outlineMat = new THREE.LineBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.55
    });
    const outlineLine = new THREE.Line(outlineGeo, outlineMat);
    scene.add(outlineLine);

    // InstancedMesh for Project Pillars
    const pillarGeo = new THREE.BoxGeometry(0.24, 1, 0.24);
    pillarGeo.translate(0, 0.5, 0); // Pivot at bottom
    const pillarMat = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.45
    });

    const count = filteredProjects.length;
    const instancedMesh = new THREE.InstancedMesh(pillarGeo, pillarMat, count);
    instancedMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    filteredProjects.forEach((p, i) => {
      const [x, z] = projectLonLatToXZ(p.longitude, p.latitude);
      const h = computePillarHeight(p, zMetric);

      dummy.position.set(x, 0, z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);

      const hex = RISK_COLORS[p.risk_category] || '#94a3b8';
      color.set(hex);
      instancedMesh.setColorAt(i, color);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

    // Critical Project Pulse Rings (limit to top 25 critical for crispness)
    const criticalTop = filteredProjects
      .filter((p) => p.risk_category === 'CRITICAL')
      .slice(0, 25);

    const ringGeo = new THREE.RingGeometry(0.22, 0.34, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const pulseRings: THREE.Mesh[] = [];

    criticalTop.forEach((p) => {
      const [x, z] = projectLonLatToXZ(p.longitude, p.latitude);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#ef4444',
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, 0.03, z);
      scene.add(ring);
      pulseRings.push(ring);
    });

    // Contagion / Corridor 3D Arcs connecting high-risk projects in the same state
    const arcObjects: { geo: THREE.BufferGeometry; mat: THREE.LineBasicMaterial }[] = [];
    if (showArcs) {
      const highRisk = filteredProjects
        .filter((p) => p.risk_category === 'CRITICAL' || p.risk_category === 'HIGH')
        .slice(0, 60);

      const byState = new Map<string, GeoProjectItem[]>();
      highRisk.forEach((p) => {
        const list = byState.get(p.state) || [];
        list.push(p);
        byState.set(p.state, list);
      });

      byState.forEach((list) => {
        for (let i = 0; i < Math.min(list.length - 1, 3); i++) {
          const a = list[i];
          const b = list[i + 1];
          const [x1, z1] = projectLonLatToXZ(a.longitude, a.latitude);
          const [x2, z2] = projectLonLatToXZ(b.longitude, b.latitude);
          const h1 = computePillarHeight(a, zMetric);
          const h2 = computePillarHeight(b, zMetric);

          const start = new THREE.Vector3(x1, h1, z1);
          const end = new THREE.Vector3(x2, h2, z2);
          const dist = start.distanceTo(end);
          if (dist < 0.3 || dist > 18) continue;

          const mid = start.clone().lerp(end, 0.5);
          mid.y += Math.max(2.0, dist * 0.45);

          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const curveGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
          const curveMat = new THREE.LineBasicMaterial({
            color: '#f59e0b',
            transparent: true,
            opacity: 0.38
          });
          scene.add(new THREE.Line(curveGeo, curveMat));
          arcObjects.push({ geo: curveGeo, mat: curveMat });
        }
      });
    }

    // Raycasting for Hover & Click
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(instancedMesh);
      if (hits.length > 0 && hits[0].instanceId !== undefined) {
        const item = filteredProjects[hits[0].instanceId];
        if (item) {
          renderer.domElement.style.cursor = 'pointer';
          setHoveredProject({
            item,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          return;
        }
      }
      renderer.domElement.style.cursor = 'grab';
      setHoveredProject(null);
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 5) return; // Ignore drag

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(instancedMesh);
      if (hits.length > 0 && hits[0].instanceId !== undefined) {
        const item = filteredProjects[hits[0].instanceId];
        if (item) {
          setSelectedItem(item);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      pulseRings.forEach((ring, idx) => {
        const phase = (t * 1.4 + idx * 0.25) % 1;
        const scale = 1 + phase * 2.2;
        ring.scale.set(scale, scale, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.65;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);

      controls.dispose();
      pillarGeo.dispose();
      pillarMat.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      outlineGeo.dispose();
      outlineMat.dispose();
      ringGeo.dispose();
      pulseRings.forEach((r) => (r.material as THREE.MeshBasicMaterial).dispose());
      arcObjects.forEach((a) => {
        a.geo.dispose();
        a.mat.dispose();
      });
      renderer.dispose();
    };
  }, [filteredProjects, zMetric, showArcs, loading]);

  return (
    <div className="space-y-4">
      {/* Header & Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold uppercase tracking-wider">
                WebGL 3D Digital Twin
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-400" />
                <span>National 3D Risk & Contagion Command Twin</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Drag to orbit 360°, scroll to zoom, right-click to pan, and click any 3D asset pillar to inspect SHAP drivers & survival curves.
            </p>
          </div>

          {/* Live 3D Portfolio Telemetry */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">3D Assets</div>
              <div className="text-sm font-bold text-white">{stats.count}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">Critical</div>
              <div className="text-sm font-bold text-red-400">{stats.criticalCount}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5">
              <div className="text-[10px] text-slate-400 uppercase">Avg Risk</div>
              <div className="text-sm font-bold text-amber-400">{stats.avgRisk}</div>
            </div>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          {/* Z-Axis Metric */}
          <div className="flex items-center space-x-1.5 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
            <span className="text-[11px] text-slate-400 pr-1">Height:</span>
            {([
              ['risk_score', 'Risk Score'],
              ['orig_cost_cr', 'Capital (₹ Cr)'],
              ['delay_months', 'Delay Months']
            ] as [ZMetric, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setZMetric(key)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  zMetric === key
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">CRITICAL Only</option>
            <option value="HIGH">HIGH Only</option>
            <option value="MEDIUM">MEDIUM Only</option>
            <option value="LOW">LOW Only</option>
          </select>

          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Sectors' : s}
              </option>
            ))}
          </select>

          {/* Contagion Arcs Toggle */}
          <button
            onClick={() => setShowArcs((v) => !v)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              showArcs
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contagion Arcs</span>
          </button>

          {/* Auto-Orbit Toggle */}
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              autoRotate
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoRotate ? 'Auto-Orbit On' : 'Auto-Orbit Off'}</span>
          </button>

          {/* Camera Presets */}
          <div className="flex items-center space-x-1 ml-auto">
            <Compass className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <button
              onClick={() => setCameraPreset('iso')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] text-slate-300 cursor-pointer"
            >
              Isometric
            </button>
            <button
              onClick={() => setCameraPreset('skyline')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] text-slate-300 cursor-pointer"
            >
              Skyline
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] text-slate-300 cursor-pointer"
            >
              Top-Down
            </button>
            <button
              onClick={() => setCameraPreset('iso')}
              title="Reset Camera"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl h-[580px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mb-2" />
            <p className="text-xs font-medium">Constructing 3D Geospatial Digital Twin...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-6 text-center">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full" />
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-2 text-[11px] text-slate-200 pointer-events-none">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-300 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Risk Tier Legend</span>
          </div>
          <div className="flex items-center space-x-3">
            {Object.entries(RISK_COLORS).map(([tier, hex]) => (
              <div key={tier} className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: hex }} />
                <span>{tier}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredProject && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-2.5 text-xs text-white shadow-2xl max-w-xs"
            style={{
              left: Math.min(hoveredProject.x + 14, 720),
              top: Math.max(hoveredProject.y - 10, 12)
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-[10px] text-amber-400">{hoveredProject.item.project_code}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: `${RISK_COLORS[hoveredProject.item.risk_category]}25`,
                  color: RISK_COLORS[hoveredProject.item.risk_category]
                }}
              >
                {hoveredProject.item.risk_category} ({hoveredProject.item.risk_score.toFixed(1)})
              </span>
            </div>
            <div className="font-semibold text-slate-100 leading-snug mb-1">
              {hoveredProject.item.project_name}
            </div>
            <div className="text-[11px] text-slate-400">
              {hoveredProject.item.state} • {hoveredProject.item.sector}
            </div>
            <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-between">
              <span>₹{hoveredProject.item.orig_cost_cr.toLocaleString()} Cr</span>
              <span>Delay: {hoveredProject.item.delay_months} mo</span>
            </div>
          </div>
        )}

        {/* Selected Asset Inspector Card */}
        {selectedItem && (
          <div className="absolute top-4 right-4 z-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] text-amber-400">{selectedItem.project_code}</span>
                <h3 className="text-sm font-bold text-white leading-snug mt-0.5">
                  {selectedItem.project_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="bg-slate-800/80 rounded-lg p-2">
                <div className="text-[10px] text-slate-400">Risk Score</div>
                <div className="font-bold text-sm" style={{ color: RISK_COLORS[selectedItem.risk_category] }}>
                  {selectedItem.risk_score.toFixed(1)} / 100 ({selectedItem.risk_category})
                </div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2">
                <div className="text-[10px] text-slate-400">Capital Exposure</div>
                <div className="font-bold text-sm text-white">
                  ₹{selectedItem.orig_cost_cr.toLocaleString()} Cr
                </div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2">
                <div className="text-[10px] text-slate-400">State / Jurisdiction</div>
                <div className="font-medium text-slate-200 truncate">{selectedItem.state}</div>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2">
                <div className="text-[10px] text-slate-400">Delay</div>
                <div className="font-medium text-amber-300">{selectedItem.delay_months} months</div>
              </div>
            </div>

            <button
              onClick={() => onSelectProject(selectedItem.project_code)}
              className="mt-3 w-full flex items-center justify-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
            >
              <span>Open Full SHAP & Survival Analysis</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
