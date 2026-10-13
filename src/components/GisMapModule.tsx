import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Info,
  Plus,
  Trash2,
  Edit2,
  Check,
  Building,
  Activity,
  Copy,
  X,
  Satellite,
  Search,
  Maximize2,
  Minimize2,
  Navigation,
  Eye,
  Globe,
  Map as MapIcon,
  Layers,
  ChevronDown,
  Users
} from 'lucide-react';
import { ODCPoint, ODPPoint, CableRoute, PPPoEClient } from '../types';
import { FiberTrayVisualizerModal } from './FiberTrayVisualizerModal';

interface GisMapModuleProps {
  odcs: ODCPoint[];
  odps: ODPPoint[];
  cables: CableRoute[];
  clients: PPPoEClient[];
  theme: 'dark' | 'light';
  onSelectOdpForProvisioning?: (odpId: string) => void;
  onAddOdp: (odp: ODPPoint) => void;
  onEditOdp: (odp: ODPPoint) => void;
  onDeleteOdp: (odpId: string) => void;
  onAddOdc: (odc: ODCPoint) => void;
  onEditOdc?: (odc: ODCPoint) => void;
  onDeleteOdc: (odcId: string) => void;
  onAddCable?: (cable: CableRoute) => void;
  onEditCable?: (cable: CableRoute) => void;
  onDeleteCable?: (cableId: string) => void;
  onEditClient?: (client: PPPoEClient) => void;
}

// 12 Standard Fiber Colors (TIA-598-A Standard)
const TIA_598_COLORS = [
  { no: 1, name: 'Biru (Blue)', hex: '#0070ba', text: '#ffffff' },
  { no: 2, name: 'Oranye (Orange)', hex: '#f97316', text: '#ffffff' },
  { no: 3, name: 'Hijau (Green)', hex: '#22c55e', text: '#ffffff' },
  { no: 4, name: 'Cokelat (Brown)', hex: '#854d0e', text: '#ffffff' },
  { no: 5, name: 'Abu-abu (Slate)', hex: '#64748b', text: '#ffffff' },
  { no: 6, name: 'Putih (White)', hex: '#f8fafc', text: '#0f172a' },
  { no: 7, name: 'Merah (Red)', hex: '#ef4444', text: '#ffffff' },
  { no: 8, name: 'Hitam (Black)', hex: '#1e293b', text: '#ffffff' },
  { no: 9, name: 'Kuning (Yellow)', hex: '#eab308', text: '#0f172a' },
  { no: 10, name: 'Ungu (Violet)', hex: '#a855f7', text: '#ffffff' },
  { no: 11, name: 'Merah Muda (Rose)', hex: '#f43f5e', text: '#ffffff' },
  { no: 12, name: 'Toska (Aqua)', hex: '#06b6d4', text: '#ffffff' }
];

// Helper: Haversine distance in meters
function calculateRouteDistance(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;
  let totalMeters = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[i + 1];
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalMeters += R * c;
  }
  return Math.round(totalMeters);
}

// Helper: Find closest ODC
function findClosestOdc(lat: number, lng: number, odcList: ODCPoint[]): ODCPoint | null {
  if (odcList.length === 0) return null;
  let closest = odcList[0];
  let minDistance = Infinity;
  odcList.forEach((odc) => {
    const dist = Math.hypot(odc.lat - lat, odc.lng - lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = odc;
    }
  });
  return closest;
}

type BaseLayerKey = 'google-hybrid' | 'osm' | 'google-satellite' | 'google-streets';

interface ContextMenuData {
  visible: boolean;
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export const GisMapModule: React.FC<GisMapModuleProps> = ({
  odcs,
  odps,
  cables,
  clients,
  theme: _theme,
  onSelectOdpForProvisioning,
  onAddOdp,
  onEditOdp,
  onDeleteOdp,
  onAddOdc,
  onEditOdc,
  onDeleteOdc,
  onAddCable,
  onEditCable,
  onDeleteCable,
  onEditClient
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups for markers, polylines, and drawing
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const cablesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Marker and Polyline instance caches for 1-click focus
  const odcMarkerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const odpMarkerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const cablePolylineMapRef = useRef<Map<string, L.Polyline>>(new Map());

  // Base Layer State (Default: Google Satelit Hybrid)
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayerKey>('google-hybrid');

  // UI States
  const [selectedOdpId, setSelectedOdpId] = useState<string | null>(odps[0]?.id || null);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);
  const [mapSearchTerm, setMapSearchTerm] = useState<string>('');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Active Bottom Table Tab
  const [activeTableTab, setActiveTableTab] = useState<'cables' | 'odcs' | 'odps' | 'clients'>('cables');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [cableTypeFilter, setCableTypeFilter] = useState<'ALL' | 'FEEDER' | 'DISTRIBUTION' | 'DROP'>('ALL');
  const [clientStatusFilter, setClientStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ISOLATED' | 'OFFLINE'>('ALL');

  // Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuData>({
    visible: false,
    x: 0,
    y: 0,
    lat: 0,
    lng: 0
  });

  // Interactive Cable Drawing Mode
  const [isDrawingCable, setIsDrawingCable] = useState<boolean>(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);

  // Compact UI Menus
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);

  // Modals for Add & Edit
  const [isAddOdpOpen, setIsAddOdpOpen] = useState(false);
  const [isEditOdpOpen, setIsEditOdpOpen] = useState(false);
  const [selectedOdpForEdit, setSelectedOdpForEdit] = useState<ODPPoint | null>(null);

  const [isAddOdcOpen, setIsAddOdcOpen] = useState(false);
  const [isEditOdcOpen, setIsEditOdcOpen] = useState(false);
  const [selectedOdcForEdit, setSelectedOdcForEdit] = useState<ODCPoint | null>(null);

  const [isAddCableModalOpen, setIsAddCableModalOpen] = useState(false);
  const [isEditCableOpen, setIsEditCableOpen] = useState(false);
  const [selectedCableForEdit, setSelectedCableForEdit] = useState<CableRoute | null>(null);

  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<PPPoEClient | null>(null);

  // POP Sentral / NOC State
  const [popNoc, setPopNoc] = useState<{ id: string; name: string; lat: number; lng: number; isVisible: boolean }>({
    id: 'POP-PUSAT',
    name: 'POP Sentral / NOC Provider',
    lat: -8.718,
    lng: 115.1745,
    isVisible: true
  });

  // Fiber Optic Splice Tray Visualizer Modal State
  const [isTrayModalOpen, setIsTrayModalOpen] = useState(false);
  const [trayModalTarget, setTrayModalTarget] = useState<{
    id: string;
    name: string;
    code: string;
    type: 'ODC' | 'ODP';
    capacityPorts?: number;
    usedPorts?: number;
  } | null>(null);

  const handleOpenTrayModalForOdc = (odc: ODCPoint) => {
    setTrayModalTarget({
      id: odc.id,
      name: odc.name,
      code: odc.code,
      type: 'ODC',
      capacityPorts: odc.capacityPorts,
      usedPorts: odc.usedPorts
    });
    setIsTrayModalOpen(true);
  };

  const handleOpenTrayModalForOdp = (odp: ODPPoint) => {
    setTrayModalTarget({
      id: odp.id,
      name: odp.name,
      code: odp.code,
      type: 'ODP',
      capacityPorts: odp.capacityPorts,
      usedPorts: odp.usedPorts
    });
    setIsTrayModalOpen(true);
  };

  // Form: ODP
  const [odpCode, setOdpCode] = useState('');
  const [odpName, setOdpName] = useState('');
  const [odpLat, setOdpLat] = useState(-8.718);
  const [odpLng, setOdpLng] = useState(115.174);
  const [odpCapacity, setOdpCapacity] = useState(8);
  const [odpParentOdcId, setOdpParentOdcId] = useState(odcs[0]?.id || '');
  const [odpCoreNumber, setOdpCoreNumber] = useState(1);
  const [odpTubeColor, setOdpTubeColor] = useState('Biru (Blue)');
  const [odpLossDbm, setOdpLossDbm] = useState(-18.5);

  // Form: ODC
  const [odcCode, setOdcCode] = useState('');
  const [odcName, setOdcName] = useState('');
  const [odcLat, setOdcLat] = useState(-8.72);
  const [odcLng, setOdcLng] = useState(115.176);
  const [odcCap, setOdcCap] = useState(24);
  const [odcArea, setOdcArea] = useState('Area Baru');

  // Form: Cable
  const [cableName, setCableName] = useState('');
  const [cableType, setCableType] = useState<'FEEDER' | 'DISTRIBUTION' | 'DROP'>('DISTRIBUTION');
  const [cableCoreCount, setCableCoreCount] = useState<number>(12);
  const [cableColor, setCableColor] = useState<string>('#06b6d4');
  const [_cableCoords, setCableCoords] = useState<[number, number][]>([]);

  // Form: Client Edit
  const [clientFullName, setClientFullName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientProfile, setClientProfile] = useState('');
  const [clientStatus, setClientStatus] = useState<'ACTIVE' | 'ISOLATED' | 'OFFLINE'>('ACTIVE');
  const [clientOdpId, setClientOdpId] = useState('');
  const [clientOdpPort, setClientOdpPort] = useState(1);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3800);
  };

  // Helper to create TileLayer based on key
  const createTileLayer = (layerKey: BaseLayerKey): L.TileLayer => {
    switch (layerKey) {
      case 'google-hybrid':
        return L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 22,
          maxNativeZoom: 20,
          attribution: '&copy; Google Maps Satelit Hybrid'
        });
      case 'osm':
        return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
      case 'google-satellite':
        return L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 22,
          maxNativeZoom: 20,
          attribution: '&copy; Google Maps Satelit Murni'
        });
      case 'google-streets':
        return L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 22,
          maxNativeZoom: 20,
          attribution: '&copy; Google Maps Roadmap'
        });
      default:
        return L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 22,
          attribution: '&copy; Google Maps'
        });
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Initialize Map with Center in Kuta / Bali network cluster
    const map = L.map(mapContainerRef.current, {
      center: [-8.718, 115.1745],
      zoom: 16,
      zoomControl: false // Using our sleek custom zoom controls
    });

    // Add Base Tile Layer
    const baseLayer = createTileLayer(activeBaseLayer);
    baseLayer.addTo(map);
    activeTileLayerRef.current = baseLayer;

    // Create Layer Groups
    const cablesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const drawingGroup = L.layerGroup().addTo(map);

    cablesLayerGroupRef.current = cablesGroup;
    markersLayerGroupRef.current = markersGroup;
    drawingLayerGroupRef.current = drawingGroup;
    leafletMapRef.current = map;

    // Event: Right Click (contextmenu)
    map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      L.DomEvent.preventDefault(e.originalEvent);
      setContextMenu({
        visible: true,
        x: e.containerPoint.x,
        y: e.containerPoint.y,
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    });

    // Event: Map Click
    map.on('click', (_e: L.LeafletMouseEvent) => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    });

    // Event: Mouse Move (live cursor coordinates)
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      try {
        map.stop();
        map.remove();
      } catch (_e) {
        // Ignore transition cleanup race
      }
      leafletMapRef.current = null;
    };
  }, []);

  // Switch Base Layer when activeBaseLayer changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const newLayer = createTileLayer(activeBaseLayer);
    newLayer.addTo(map);
    activeTileLayerRef.current = newLayer;
  }, [activeBaseLayer]);

  // Handle map click during cable drawing mode
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const handleDrawClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingCable) return;
      const newPt: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawingPoints((prev) => [...prev, newPt]);
    };

    map.on('click', handleDrawClick);
    return () => {
      map.off('click', handleDrawClick);
    };
  }, [isDrawingCable]);

  // Render Drawing Waypoints and Polyline
  useEffect(() => {
    const drawingGroup = drawingLayerGroupRef.current;
    if (!drawingGroup) return;

    drawingGroup.clearLayers();

    if (drawingPoints.length > 0) {
      // Draw polyline connecting points
      const polyline = L.polyline(drawingPoints, {
        color: '#f59e0b',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.95
      });
      drawingGroup.addLayer(polyline);

      // Draw waypoint markers
      drawingPoints.forEach((pt, idx) => {
        const circle = L.circleMarker(pt, {
          radius: idx === 0 || idx === drawingPoints.length - 1 ? 7 : 5,
          color: idx === 0 ? '#10b981' : idx === drawingPoints.length - 1 ? '#ef4444' : '#f59e0b',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 2
        });
        drawingGroup.addLayer(circle);
      });
    }
  }, [drawingPoints]);

  // Close context menu and compact dropdowns on global click or Escape
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
      setIsLayerMenuOpen(false);
      setIsAddMenuOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu((prev) => ({ ...prev, visible: false }));
        setIsLayerMenuOpen(false);
        setIsAddMenuOpen(false);
        if (isDrawingCable) {
          setIsDrawingCable(false);
          setDrawingPoints([]);
          triggerNotification('Mode tarik kabel dibatalkan.');
        }
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawingCable]);

  // Render Cable Polylines
  useEffect(() => {
    const cablesGroup = cablesLayerGroupRef.current;
    if (!cablesGroup || !leafletMapRef.current) return;

    cablesGroup.clearLayers();
    cablePolylineMapRef.current.clear();

    cables.forEach((cable) => {
      const isSelected = cable.id === selectedCableId;
      const polyline = L.polyline(cable.coordinates, {
        color: cable.color || '#06b6d4',
        weight: isSelected ? 7 : cable.type === 'FEEDER' ? 5 : cable.type === 'DISTRIBUTION' ? 4 : 3,
        opacity: isSelected ? 1 : 0.85,
        dashArray: cable.type === 'DROP' ? '6, 6' : undefined
      });

      // Hover tooltip
      const dist = cable.totalLengthMeters || calculateRouteDistance(cable.coordinates);
      const estLoss = (dist * 0.00035).toFixed(2);
      polyline.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; font-weight: 700;">
          <div style="color: ${cable.color}; font-size: 12px;">${cable.name} (${cable.type})</div>
          <div>Kapasitas: ${cable.coreCount} Core</div>
          <div>Jarak: ~${dist} m | Est. Loss: ~${estLoss} dB</div>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      // Popup
      polyline.bindPopup(
        `<div style="font-family: inherit; padding: 4px; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; color: ${cable.color}; margin-bottom: 4px;">
            ${cable.name}
          </div>
          <div style="font-size: 11px; margin-bottom: 2px;">Tipe: <b>${cable.type}</b> (${cable.coreCount} Core)</div>
          <div style="font-size: 11px; margin-bottom: 2px;">Panjang Rute: <b>~${dist} meter</b></div>
          <div style="font-size: 11px; margin-bottom: 6px;">Redaman Kabel: <b>~${estLoss} dB</b></div>
          <button id="btn-select-cable-${cable.id}" style="width: 100%; padding: 4px 8px; background: #0284c7; color: #ffffff; border: none; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
            Lihat Detail Rute
          </button>
        </div>`
      );

      polyline.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-cable-${cable.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedCableId(cable.id);
            setSelectedOdpId(null);
          };
        }
      });

      polyline.on('click', () => {
        setSelectedCableId(cable.id);
        setSelectedOdpId(null);
      });

      cablesGroup.addLayer(polyline);
      cablePolylineMapRef.current.set(cable.id, polyline);
    });
  }, [cables, selectedCableId]);

  // Render Markers: POP Sentral, ODC, and ODP
  useEffect(() => {
    const markersGroup = markersLayerGroupRef.current;
    if (!markersGroup || !leafletMapRef.current) return;

    markersGroup.clearLayers();
    odcMarkerMapRef.current.clear();
    odpMarkerMapRef.current.clear();

    // 1. POP Central Marker (Headend / Central Office)
    if (popNoc.isVisible) {
      const popIcon = L.divIcon({
        className: 'pop-custom-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(6, 182, 212, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #06b6d4, #0284c7); border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(6,182,212,0.6); color: #ffffff; font-size: 16px;">
              🏢
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const popMarker = L.marker([popNoc.lat, popNoc.lng], { icon: popIcon });
      popMarker.bindPopup(
        `<div style="font-family: inherit; padding: 4px; min-width: 190px;">
          <div style="font-weight: 800; font-size: 13px; color: #06b6d4; margin-bottom: 4px;">🏢 ${popNoc.name}</div>
          <div style="font-size: 11px; margin-bottom: 2px;">Kapasitas OLT: <b>4x GPON 16-Port (64 PON)</b></div>
          <div style="font-size: 11px; margin-bottom: 2px;">Status Uplink: <b>10 Gbps Metro-E (Active)</b></div>
          <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-bottom: 8px;">🟢 Core Router Online</div>
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px; display: flex; justify-content: flex-end;">
            <button id="btn-delete-pop-noc" style="padding: 4px 8px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              🗑️ Hapus POP NOC
            </button>
          </div>
        </div>`
      );

      popMarker.on('popupopen', () => {
        const btnDel = document.getElementById('btn-delete-pop-noc');
        if (btnDel) {
          btnDel.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Apakah Anda yakin ingin menghapus / menyembunyikan titik POP Sentral / NOC dari peta?')) {
              setPopNoc((prev) => ({ ...prev, isVisible: false }));
              triggerNotification('Titik POP Sentral / NOC berhasil dihapus dari peta.');
            }
          };
        }
      });

      markersGroup.addLayer(popMarker);
    }

    // 2. ODC Markers (Optical Distribution Cabinets)
    odcs.forEach((odc) => {
      const odcIcon = L.divIcon({
        className: 'odc-custom-marker',
        html: `
          <div style="display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #0284c7, #0369a1); border: 2px solid #ffffff; border-radius: 8px; padding: 3px 8px; color: #ffffff; font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap; cursor: pointer;">
            <span style="font-size: 12px;">🗄️</span>
            <span>${odc.code}</span>
            <span style="background: rgba(255,255,255,0.25); border-radius: 4px; padding: 1px 5px; font-size: 9px; font-family: monospace;">${odc.usedPorts}/${odc.capacityPorts}</span>
          </div>
        `,
        iconSize: [85, 26],
        iconAnchor: [42, 13]
      });

      const marker = L.marker([odc.lat, odc.lng], { icon: odcIcon });
      const connectedOdps = odps.filter((o) => o.odcId === odc.id);

      marker.bindPopup(
        `<div style="font-family: inherit; padding: 4px; min-width: 200px;">
          <div style="font-weight: 800; font-size: 13px; color: #0284c7; margin-bottom: 4px;">
            🗄️ ${odc.code} - ${odc.name}
          </div>
          <div style="font-size: 11px; margin-bottom: 2px;">Wilayah: <b>${odc.coverageArea}</b></div>
          <div style="font-size: 11px; margin-bottom: 2px;">Kapasitas Port: <b>${odc.usedPorts}/${odc.capacityPorts} Port (${Math.round((odc.usedPorts / odc.capacityPorts) * 100)}%)</b></div>
          <div style="font-size: 11px; margin-bottom: 2px;">Splitter: <b>${odc.splitterRatio || '1:4'}</b></div>
          <div style="font-size: 11px; margin-bottom: 8px;">ODP Terhubung: <b>${connectedOdps.length} ODP</b></div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <button id="btn-tray-odc-${odc.id}" style="padding: 5px 8px; background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid #06b6d4; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 3px;">
              🔬 Splice Tray
            </button>
            <button id="btn-add-odp-from-odc-${odc.id}" style="flex: 1; padding: 5px 8px; background: #06b6d4; color: #ffffff; border: none; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              + ODP
            </button>
            <button id="btn-delete-odc-${odc.id}" style="padding: 5px 8px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Hapus
            </button>
          </div>
        </div>`
      );

      marker.on('popupopen', () => {
        const btnTray = document.getElementById(`btn-tray-odc-${odc.id}`);
        if (btnTray) {
          btnTray.onclick = () => {
            handleOpenTrayModalForOdc(odc);
          };
        }
        const btnAdd = document.getElementById(`btn-add-odp-from-odc-${odc.id}`);
        if (btnAdd) {
          btnAdd.onclick = () => {
            setOdpParentOdcId(odc.id);
            setOdpLat(odc.lat + 0.001);
            setOdpLng(odc.lng + 0.001);
            setIsAddOdpOpen(true);
          };
        }
        const btnDel = document.getElementById(`btn-delete-odc-${odc.id}`);
        if (btnDel) {
          btnDel.onclick = () => {
            if (confirm(`Hapus ODC ${odc.code}?`)) {
              onDeleteOdc(odc.id);
              triggerNotification(`ODC ${odc.code} berhasil dihapus.`);
            }
          };
        }
      });

      markersGroup.addLayer(marker);
      odcMarkerMapRef.current.set(odc.id, marker);
    });

    // 3. ODP Markers (Optical Distribution Points)
    odps.forEach((odp) => {
      const isFull = odp.usedPorts >= odp.capacityPorts;
      const color = odp.tubeColor || (isFull ? '#ef4444' : '#10b981');
      const isSelected = odp.id === selectedOdpId;

      const odpIcon = L.divIcon({
        className: 'odp-custom-marker',
        html: `
          <div style="display: inline-flex; align-items: center; gap: 4px; background: ${isFull ? 'rgba(239, 68, 68, 0.95)' : isSelected ? 'rgba(6, 182, 212, 0.95)' : 'rgba(15, 23, 42, 0.92)'}; border: 2px solid ${color}; border-radius: 6px; padding: 2px 6px; color: #ffffff; font-weight: 600; font-size: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.45); white-space: nowrap; cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.15s ease;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; display: inline-block; border: 1px solid #ffffff;"></span>
            <span>${odp.code}</span>
            <span style="font-size: 9px; opacity: 0.9; font-family: monospace;">(${odp.usedPorts}/${odp.capacityPorts})</span>
          </div>
        `,
        iconSize: [75, 22],
        iconAnchor: [37, 11]
      });

      const marker = L.marker([odp.lat, odp.lng], { icon: odpIcon });

      marker.bindPopup(
        `<div style="font-family: inherit; padding: 4px; min-width: 190px;">
          <div style="font-weight: 800; font-size: 13px; color: ${color}; margin-bottom: 4px;">
            📦 ${odp.code} - ${odp.name}
          </div>
          <div style="font-size: 11px; margin-bottom: 2px;">Kapasitas Port: <b>${odp.usedPorts}/${odp.capacityPorts} Port</b></div>
          <div style="font-size: 11px; margin-bottom: 2px;">Warna Tube Core: <b>${odp.tubeColor || 'Biru'}</b></div>
          <div style="font-size: 11px; margin-bottom: 2px;">Estimasi Redaman: <b>${odp.avgDbm} dBm</b></div>
          <div style="font-size: 11px; margin-bottom: 8px;">Status: <b style="color: ${isFull ? '#ef4444' : '#10b981'};">${isFull ? '🔴 FULL' : '🟢 NORMAL'}</b></div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <button id="btn-tray-odp-${odp.id}" style="padding: 5px 8px; background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid #06b6d4; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 3px;">
              🔬 Tray
            </button>
            <button id="btn-select-odp-pop-${odp.id}" style="flex: 1; padding: 5px 8px; background: #06b6d4; color: #ffffff; border: none; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Pilih ODP Ini
            </button>
            <button id="btn-delete-odp-pop-${odp.id}" style="padding: 5px 8px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Hapus
            </button>
          </div>
        </div>`
      );

      marker.on('popupopen', () => {
        const btnTray = document.getElementById(`btn-tray-odp-${odp.id}`);
        if (btnTray) {
          btnTray.onclick = () => {
            handleOpenTrayModalForOdp(odp);
          };
        }
        const btnSelect = document.getElementById(`btn-select-odp-pop-${odp.id}`);
        if (btnSelect) {
          btnSelect.onclick = () => {
            setSelectedOdpId(odp.id);
            setSelectedCableId(null);
            if (onSelectOdpForProvisioning) {
              onSelectOdpForProvisioning(odp.id);
            }
          };
        }
        const btnDel = document.getElementById(`btn-delete-odp-pop-${odp.id}`);
        if (btnDel) {
          btnDel.onclick = () => {
            if (confirm(`Hapus ODP ${odp.code}?`)) {
              onDeleteOdp(odp.id);
              triggerNotification(`ODP ${odp.code} berhasil dihapus.`);
            }
          };
        }
      });

      marker.on('click', () => {
        setSelectedOdpId(odp.id);
        setSelectedCableId(null);
      });

      markersGroup.addLayer(marker);
      odpMarkerMapRef.current.set(odp.id, marker);
    });
  }, [odcs, odps, selectedOdpId, popNoc]);

  // Selected ODP & Cable details for inspector panel
  const selectedOdp = useMemo(() => odps.find((o) => o.id === selectedOdpId), [odps, selectedOdpId]);
  const selectedCable = useMemo(() => cables.find((c) => c.id === selectedCableId), [cables, selectedCableId]);
  const odpClients = useMemo(
    () => (selectedOdp ? clients.filter((c) => c.odpId === selectedOdp.id) : []),
    [clients, selectedOdp]
  );

  // Focus Map on specific target coordinates
  const focusOnMap = (lat: number, lng: number, zoomLevel: number = 18) => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoomLevel, { duration: 1.2 });
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Focus on Cable route bounds
  const focusOnCable = (cable: CableRoute) => {
    setSelectedCableId(cable.id);
    setSelectedOdpId(null);
    if (leafletMapRef.current && cable.coordinates.length > 0) {
      const bounds = L.latLngBounds(cable.coordinates);
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Search on Map input handler
  const handleSearchOnMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchTerm.trim()) return;
    const term = mapSearchTerm.toLowerCase();

    // Check POP NOC
    if (popNoc.isVisible && (term.includes('pop') || term.includes('noc'))) {
      focusOnMap(popNoc.lat, popNoc.lng, 18);
      triggerNotification(`Menemukan: ${popNoc.name}`);
      return;
    }

    // Check ODC
    const matchedOdc = odcs.find(
      (o) => o.code.toLowerCase().includes(term) || o.name.toLowerCase().includes(term)
    );
    if (matchedOdc) {
      focusOnMap(matchedOdc.lat, matchedOdc.lng, 18);
      const marker = odcMarkerMapRef.current.get(matchedOdc.id);
      if (marker) marker.openPopup();
      triggerNotification(`Menemukan ODC: ${matchedOdc.code} - ${matchedOdc.name}`);
      return;
    }

    // Check ODP
    const matchedOdp = odps.find(
      (o) => o.code.toLowerCase().includes(term) || o.name.toLowerCase().includes(term)
    );
    if (matchedOdp) {
      setSelectedOdpId(matchedOdp.id);
      focusOnMap(matchedOdp.lat, matchedOdp.lng, 19);
      const marker = odpMarkerMapRef.current.get(matchedOdp.id);
      if (marker) marker.openPopup();
      triggerNotification(`Menemukan ODP: ${matchedOdp.code} - ${matchedOdp.name}`);
      return;
    }

    // Check Client
    const matchedClient = clients.find(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.username.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term)
    );
    if (matchedClient) {
      const odp = odps.find((o) => o.id === matchedClient.odpId);
      if (odp) {
        setSelectedOdpId(odp.id);
        setSelectedCableId(null);
        focusOnMap(odp.lat, odp.lng, 19);
        const marker = odpMarkerMapRef.current.get(odp.id);
        if (marker) marker.openPopup();
        triggerNotification(
          `Menemukan Pelanggan: ${matchedClient.fullName} di ${odp.code} (Port #${matchedClient.odpPort})`
        );
        return;
      }
    }

    triggerNotification(`Tidak ditemukan ODC/ODP/Kabel/Pelanggan dengan kata kunci "${mapSearchTerm}"`);
  };

  // Right-Click Context Menu Actions
  const handleContextAddOdc = () => {
    setOdcCode(`ODC-${odcs.length + 1 < 10 ? '0' : ''}${odcs.length + 1}`);
    setOdcName(`ODC Baru ${odcs.length + 1}`);
    setOdcLat(Number(contextMenu.lat.toFixed(6)));
    setOdcLng(Number(contextMenu.lng.toFixed(6)));
    setIsAddOdcOpen(true);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleContextAddOdp = () => {
    const closest = findClosestOdc(contextMenu.lat, contextMenu.lng, odcs);
    setOdpCode(`ODP-${odps.length + 1 < 10 ? '0' : ''}${odps.length + 1}`);
    setOdpName(`ODP Baru ${odps.length + 1}`);
    setOdpLat(Number(contextMenu.lat.toFixed(6)));
    setOdpLng(Number(contextMenu.lng.toFixed(6)));
    if (closest) setOdpParentOdcId(closest.id);
    setIsAddOdpOpen(true);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleContextStartCable = () => {
    setIsDrawingCable(true);
    setDrawingPoints([[contextMenu.lat, contextMenu.lng]]);
    setContextMenu((prev) => ({ ...prev, visible: false }));
    triggerNotification('Titik awal kabel ditetapkan. Klik titik-titik berikutnya di peta untuk melanjutkan.');
  };

  // Form Submissions
  const handleSaveOdp = (e: React.FormEvent) => {
    e.preventDefault();
    const newOdp: ODPPoint = {
      id: `odp-${Date.now()}`,
      code: odpCode.toUpperCase(),
      name: odpName,
      odcId: odpParentOdcId,
      lat: Number(odpLat),
      lng: Number(odpLng),
      capacityPorts: Number(odpCapacity),
      usedPorts: 0,
      status: 'NORMAL',
      tubeColor: odpTubeColor,
      coreNumber: Number(odpCoreNumber),
      avgDbm: Number(odpLossDbm)
    };
    onAddOdp(newOdp);
    setIsAddOdpOpen(false);
    setSelectedOdpId(newOdp.id);
    triggerNotification(`ODP ${newOdp.code} berhasil ditambahkan!`);
  };

  const handleSaveOdc = (e: React.FormEvent) => {
    e.preventDefault();
    const newOdc: ODCPoint = {
      id: `odc-${Date.now()}`,
      code: odcCode.toUpperCase(),
      name: odcName,
      lat: Number(odcLat),
      lng: Number(odcLng),
      capacityPorts: Number(odcCap),
      usedPorts: 0,
      coverageArea: odcArea,
      splitterRatio: '1:4'
    };
    onAddOdc(newOdc);
    setIsAddOdcOpen(false);
    triggerNotification(`ODC ${newOdc.code} berhasil ditambahkan!`);
  };

  const handleSaveDrawnCable = (e: React.FormEvent) => {
    e.preventDefault();
    if (drawingPoints.length < 2) {
      alert('Rute kabel minimal membutuhkan 2 titik koordinat.');
      return;
    }
    const dist = calculateRouteDistance(drawingPoints);
    const newCable: CableRoute = {
      id: `cable-${Date.now()}`,
      name: cableName.trim() || `Kabel ${cableType} #${cables.length + 1}`,
      type: cableType,
      coreCount: cableCoreCount,
      color: cableColor,
      coordinates: drawingPoints,
      totalLengthMeters: dist
    };

    if (onAddCable) {
      onAddCable(newCable);
    }
    setIsAddCableModalOpen(false);
    setIsDrawingCable(false);
    setDrawingPoints([]);
    setSelectedCableId(newCable.id);
    triggerNotification(`Rute kabel ${newCable.name} berhasil disimpan!`);
  };

  // Open Edit Handlers
  const handleOpenEditCable = (cable: CableRoute) => {
    setSelectedCableForEdit(cable);
    setCableName(cable.name);
    setCableType(cable.type);
    setCableCoreCount(cable.coreCount);
    setCableColor(cable.color);
    setIsEditCableOpen(true);
  };

  const handleOpenEditOdc = (odc: ODCPoint) => {
    setSelectedOdcForEdit(odc);
    setOdcCode(odc.code);
    setOdcName(odc.name);
    setOdcLat(odc.lat);
    setOdcLng(odc.lng);
    setOdcCap(odc.capacityPorts);
    setOdcArea(odc.coverageArea);
    setIsEditOdcOpen(true);
  };

  const handleOpenEditOdp = (odp: ODPPoint) => {
    setSelectedOdpForEdit(odp);
    setOdpCode(odp.code);
    setOdpName(odp.name);
    setOdpCapacity(odp.capacityPorts);
    setOdpParentOdcId(odp.odcId);
    setOdpLat(odp.lat);
    setOdpLng(odp.lng);
    setOdpLossDbm(odp.avgDbm);
    setOdpTubeColor(odp.tubeColor || 'Biru (Blue)');
    setOdpCoreNumber(odp.coreNumber || 1);
    setIsEditOdpOpen(true);
  };

  const handleOpenEditClient = (client: PPPoEClient) => {
    setSelectedClientForEdit(client);
    setClientFullName(client.fullName);
    setClientPhone(client.phone);
    setClientAddress(client.address);
    setClientProfile(client.profile);
    setClientStatus(client.status);
    setClientOdpId(client.odpId);
    setClientOdpPort(client.odpPort);
    setIsEditClientOpen(true);
  };

  // Save Edit Handlers
  const handleSaveEditCable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCableForEdit) return;
    const updated: CableRoute = {
      ...selectedCableForEdit,
      name: cableName.trim() || selectedCableForEdit.name,
      type: cableType,
      coreCount: cableCoreCount,
      color: cableColor
    };
    if (onEditCable) onEditCable(updated);
    setIsEditCableOpen(false);
    triggerNotification(`Rute kabel ${updated.name} berhasil diperbarui.`);
  };

  const handleSaveEditOdc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOdcForEdit) return;
    const updated: ODCPoint = {
      ...selectedOdcForEdit,
      code: odcCode.toUpperCase(),
      name: odcName,
      lat: Number(odcLat),
      lng: Number(odcLng),
      capacityPorts: Number(odcCap),
      coverageArea: odcArea
    };
    if (onEditOdc) onEditOdc(updated);
    setIsEditOdcOpen(false);
    triggerNotification(`Data ODC ${updated.code} berhasil diperbarui.`);
  };

  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForEdit) return;
    const updated: PPPoEClient = {
      ...selectedClientForEdit,
      fullName: clientFullName,
      phone: clientPhone,
      address: clientAddress,
      profile: clientProfile,
      status: clientStatus,
      odpId: clientOdpId,
      odpPort: Number(clientOdpPort)
    };
    if (onEditClient) onEditClient(updated);
    setIsEditClientOpen(false);
    triggerNotification(`Data pelanggan ${updated.fullName} berhasil diperbarui.`);
  };

  // Filtered Tables Data
  const filteredCables = useMemo(() => {
    return cables.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(tableSearchQuery.toLowerCase());
      const matchType = cableTypeFilter === 'ALL' || c.type === cableTypeFilter;
      return matchSearch && matchType;
    });
  }, [cables, tableSearchQuery, cableTypeFilter]);

  const filteredOdcs = useMemo(() => {
    return odcs.filter(
      (o) =>
        o.code.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        o.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        o.coverageArea.toLowerCase().includes(tableSearchQuery.toLowerCase())
    );
  }, [odcs, tableSearchQuery]);

  const filteredOdps = useMemo(() => {
    return odps.filter(
      (o) =>
        o.code.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        o.name.toLowerCase().includes(tableSearchQuery.toLowerCase())
    );
  }, [odps, tableSearchQuery]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const parentOdp = odps.find((o) => o.id === c.odpId);
      const matchSearch =
        c.fullName.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        c.ipAddress.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        (parentOdp?.code || '').toLowerCase().includes(tableSearchQuery.toLowerCase());
      const matchStatus = clientStatusFilter === 'ALL' || c.status === clientStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [clients, odps, tableSearchQuery, clientStatusFilter]);

  return (
    <div className="gis-map-module">
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--accent-cyan)',
            backdropFilter: 'blur(12px)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(2, 132, 199, 0.4))',
                border: '1px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <Globe size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Peta GIS Jaringan Fiber Optik (ODC &amp; ODP)
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}
                >
                  LEAFLETJS &bull; MULTI-LAYER GIS
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Didukung oleh <b>LeafletJS.com</b> dengan layer <b>Google Satelit (Hybrid)</b>, <b>OpenStreetMap</b>, dan <b>Google Streets</b>. Klik kanan di peta untuk menambah ODC/ODP atau tarik kabel optik.
              </p>
            </div>
          </div>

          {/* Streamlined Action Dropdown & Tray Visualizer Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                background: 'rgba(6, 182, 212, 0.12)',
                color: 'var(--accent-cyan)'
              }}
              onClick={() => {
                const defOdc = odcs[0]
                  ? {
                      id: odcs[0].id,
                      name: odcs[0].name,
                      code: odcs[0].code,
                      type: 'ODC' as const,
                      capacityPorts: odcs[0].capacityPorts,
                      usedPorts: odcs[0].usedPorts
                    }
                  : null;
                setTrayModalTarget(defOdc);
                setIsTrayModalOpen(true);
              }}
            >
              <Layers size={15} />
              <span>🔬 Visualizer Tray Fiber</span>
            </button>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddMenuOpen((prev) => !prev);
                }}
              >
                <Plus size={15} />
                <span>+ Tambah Jaringan</span>
                <ChevronDown
                  size={14}
                  style={{
                    transform: isAddMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>

            {isAddMenuOpen && (
              <div className="compact-action-dropdown" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="compact-action-item"
                  onClick={() => {
                    setIsAddOdpOpen(true);
                    setIsAddMenuOpen(false);
                  }}
                >
                  <Plus size={15} style={{ color: 'var(--accent-cyan)' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Pasang ODP Baru</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Titik distribusi pelanggan</div>
                  </div>
                </button>
                <button
                  type="button"
                  className="compact-action-item"
                  onClick={() => {
                    setIsAddOdcOpen(true);
                    setIsAddMenuOpen(false);
                  }}
                >
                  <Building size={15} style={{ color: 'var(--accent-blue)' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Pasang ODC Baru</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Kabinet feeder &amp; splitter</div>
                  </div>
                </button>
                <button
                  type="button"
                  className="compact-action-item"
                  onClick={() => {
                    setIsDrawingCable(true);
                    setDrawingPoints([]);
                    setIsAddMenuOpen(false);
                    triggerNotification('🎯 Mode Tarik Kabel: Klik pada peta untuk mulai menggambar.');
                  }}
                >
                  <Activity size={15} style={{ color: 'var(--accent-amber)' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Tarik Jalur Kabel Optik</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Rute Feeder, Distribusi, Drop</div>
                  </div>
                </button>

                {!popNoc.isVisible && (
                  <button
                    type="button"
                    className="compact-action-item"
                    style={{ background: 'rgba(6, 182, 212, 0.1)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    onClick={() => {
                      setPopNoc((prev) => ({ ...prev, isVisible: true }));
                      setIsAddMenuOpen(false);
                      triggerNotification('Titik POP Sentral / NOC berhasil dimunculkan kembali di peta.');
                    }}
                  >
                    <Building size={15} style={{ color: 'var(--accent-cyan)' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Munculkan Kembali POP NOC</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Tampilkan titik Headend OLT utama</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Main Grid: Leaflet Map (Left) + ODP / Cable Inspector (Right) */}
      <div className="grid-2col">
        {/* Map Container */}
        <div className="glass-panel" style={{ padding: '0.75rem', margin: 0, position: 'relative' }}>
          <div
            className="leaflet-map-wrapper"
            style={{
              height: isMapFullscreen ? '85vh' : '560px',
              transition: 'height 0.3s ease',
              position: 'relative'
            }}
          >
            {/* Floating Search Bar (Top Left) */}
            <form className="gmaps-floating-search" onSubmit={handleSearchOnMap}>
              <Search size={16} style={{ color: 'var(--accent-cyan)' }} />
              <input
                type="text"
                className="gmaps-search-input"
                placeholder="Cari ODC, ODP, atau jalur kabel..."
                value={mapSearchTerm}
                onChange={(e) => setMapSearchTerm(e.target.value)}
              />
              {mapSearchTerm && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  onClick={() => setMapSearchTerm('')}
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Cable Drawing Banner (Top Center) */}
            {isDrawingCable && (
              <div className="cable-drawing-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--accent-amber)',
                      boxShadow: '0 0 10px #f59e0b'
                    }}
                  />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                    Mode Tarik Jalur Kabel Aktif
                  </span>
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {drawingPoints.length} Titik (Total: ~{calculateRouteDistance(drawingPoints)} m)
                </span>
                {drawingPoints.length > 0 && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                    onClick={() => setDrawingPoints((prev) => prev.slice(0, -1))}
                  >
                    Urungkan Titik
                  </button>
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                  onClick={() => {
                    setIsDrawingCable(false);
                    setDrawingPoints([]);
                    triggerNotification('Tarik kabel dibatalkan.');
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '4px 12px', fontSize: '0.74rem' }}
                  disabled={drawingPoints.length < 2}
                  onClick={() => {
                    setCableCoords(drawingPoints);
                    setIsAddCableModalOpen(true);
                  }}
                >
                  Simpan Rute Kabel
                </button>
              </div>
            )}

            {/* Compact Layer Switcher Widget (Bottom Left) */}
            <div className="compact-layer-widget" onClick={(e) => e.stopPropagation()}>
              {isLayerMenuOpen && (
                <div className="compact-layer-popover">
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      padding: '4px 8px 6px',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '4px'
                    }}
                  >
                    LAPISAN PETA
                  </div>
                  <button
                    type="button"
                    className={`compact-layer-option ${activeBaseLayer === 'google-hybrid' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveBaseLayer('google-hybrid');
                      setIsLayerMenuOpen(false);
                    }}
                  >
                    <Satellite size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>Google Satelit Hybrid</span>
                  </button>
                  <button
                    type="button"
                    className={`compact-layer-option ${activeBaseLayer === 'osm' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveBaseLayer('osm');
                      setIsLayerMenuOpen(false);
                    }}
                  >
                    <Globe size={14} style={{ color: 'var(--accent-emerald)' }} />
                    <span>OpenStreetMap</span>
                  </button>
                  <button
                    type="button"
                    className={`compact-layer-option ${activeBaseLayer === 'google-streets' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveBaseLayer('google-streets');
                      setIsLayerMenuOpen(false);
                    }}
                  >
                    <MapIcon size={14} style={{ color: 'var(--accent-blue)' }} />
                    <span>Google Streets</span>
                  </button>
                  <button
                    type="button"
                    className={`compact-layer-option ${activeBaseLayer === 'google-satellite' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveBaseLayer('google-satellite');
                      setIsLayerMenuOpen(false);
                    }}
                  >
                    <Satellite size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>Satelit Murni</span>
                  </button>
                </div>
              )}
              <button
                type="button"
                className="compact-layer-btn"
                onClick={() => setIsLayerMenuOpen((prev) => !prev)}
                title="Ganti Lapisan Peta"
              >
                <Layers size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span>
                  {activeBaseLayer === 'google-hybrid'
                    ? 'Satelit Hybrid'
                    : activeBaseLayer === 'osm'
                    ? 'OpenStreetMap'
                    : activeBaseLayer === 'google-streets'
                    ? 'Google Streets'
                    : 'Satelit Murni'}
                </span>
                <ChevronDown
                  size={13}
                  style={{
                    transform: isLayerMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>
            </div>

            {/* Map Control Stack (Bottom Right: Zoom, Recenter, Fullscreen) */}
            <div className="gmaps-control-stack">
              <button
                type="button"
                className="gmaps-control-btn"
                title="Perbesar Peta (Zoom In)"
                onClick={() => leafletMapRef.current?.zoomIn()}
              >
                +
              </button>
              <div className="gmaps-control-divider" />
              <button
                type="button"
                className="gmaps-control-btn"
                title="Perkecil Peta (Zoom Out)"
                onClick={() => leafletMapRef.current?.zoomOut()}
              >
                &minus;
              </button>
              <div className="gmaps-control-divider" />
              <button
                type="button"
                className="gmaps-control-btn"
                title="Fokus Kembali ke POP Sentral"
                onClick={() => focusOnMap(-8.718, 115.1745, 16)}
              >
                <Navigation size={15} />
              </button>
              <div className="gmaps-control-divider" />
              <button
                type="button"
                className="gmaps-control-btn"
                title={isMapFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              >
                {isMapFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>

            {/* Live Cursor Coordinates Watermark */}
            {cursorCoords && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '65px',
                  zIndex: 900,
                  fontSize: '0.68rem',
                  color: 'rgba(255, 255, 255, 0.75)',
                  background: 'rgba(0, 0, 0, 0.65)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {cursorCoords.lat.toFixed(6)}, {cursorCoords.lng.toFixed(6)}
              </div>
            )}

            {/* Leaflet DOM Node */}
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                zIndex: 1
              }}
            />
          </div>

          {/* Right Click Custom Context Menu */}
          {contextMenu.visible && (
            <div
              className="gis-context-menu"
              style={{
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="gis-context-header">
                📍 {contextMenu.lat.toFixed(5)}, {contextMenu.lng.toFixed(5)}
              </div>
              <button className="gis-context-item" onClick={handleContextAddOdc}>
                <Building size={14} style={{ color: 'var(--accent-blue)' }} />
                <span>Pasang ODC Baru di Sini</span>
              </button>
              <button className="gis-context-item" onClick={handleContextAddOdp}>
                <Plus size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span>Pasang ODP Baru di Sini</span>
              </button>
              <button className="gis-context-item" onClick={handleContextStartCable}>
                <Activity size={14} style={{ color: 'var(--accent-amber)' }} />
                <span>Tarik Jalur Kabel Optik Dari Sini</span>
              </button>
              <button
                className="gis-context-item"
                onClick={() => {
                  setPopNoc((prev) => ({
                    ...prev,
                    lat: Number(contextMenu.lat.toFixed(6)),
                    lng: Number(contextMenu.lng.toFixed(6)),
                    isVisible: true
                  }));
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                  triggerNotification(
                    popNoc.isVisible
                      ? 'Titik POP Sentral / NOC dipindahkan ke lokasi baru.'
                      : 'Titik POP Sentral / NOC berhasil dipasang di lokasi baru.'
                  );
                }}
              >
                <Building size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span>{popNoc.isVisible ? 'Pindahkan Titik POP NOC ke Sini' : 'Pasang Titik POP NOC di Sini'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Inspector Panel: Selected ODP or Cable Route */}
        {selectedCable ? (
          <div className="glass-panel" style={{ padding: '1.25rem', margin: 0, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: `${selectedCable.color}25`,
                    color: selectedCable.color,
                    border: `1px solid ${selectedCable.color}60`
                  }}
                >
                  KABEL {selectedCable.type}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.35rem' }}>{selectedCable.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  className="btn-icon"
                  title="Fokus di Peta"
                  onClick={() => focusOnCable(selectedCable)}
                >
                  <Eye size={15} />
                </button>
                <button
                  className="btn-icon"
                  style={{ color: 'var(--accent-rose)' }}
                  title="Hapus Kabel"
                  onClick={() => {
                    if (confirm(`Hapus rute kabel ${selectedCable.name}?`)) {
                      if (onDeleteCable) onDeleteCable(selectedCable.id);
                      setSelectedCableId(null);
                      triggerNotification(`Kabel ${selectedCable.name} berhasil dihapus.`);
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
                <button className="btn-icon" onClick={() => setSelectedCableId(null)}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Cable Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Panjang Rute</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  ~{selectedCable.totalLengthMeters || calculateRouteDistance(selectedCable.coordinates)} m
                </span>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Kapasitas Core</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: selectedCable.color }}>
                  {selectedCable.coreCount} Core
                </span>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Titik Waypoints</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {selectedCable.coordinates.length} Point
                </span>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Estimasi Redaman</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                  ~{((selectedCable.totalLengthMeters || calculateRouteDistance(selectedCable.coordinates)) * 0.00035).toFixed(2)} dB
                </span>
              </div>
            </div>

            {/* Cores Breakdown */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Warna Core Tube (TIA-598 Standar):
              </h4>
              <div className="fiber-color-grid">
                {TIA_598_COLORS.slice(0, Math.min(selectedCable.coreCount, 12)).map((c) => (
                  <div key={c.no} className="fiber-core-pill">
                    <div className="fiber-color-dot" style={{ backgroundColor: c.hex }} />
                    <span style={{ fontSize: '0.68rem' }}>#{c.no} {c.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => focusOnCable(selectedCable)}
            >
              <Eye size={14} />
              <span>Fokus Jalur Kabel di Peta</span>
            </button>
          </div>
        ) : selectedOdp ? (
          <div className="glass-panel" style={{ padding: '1.25rem', margin: 0, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background:
                      selectedOdp.status === 'FULL'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)',
                    color: selectedOdp.status === 'FULL' ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    border: `1px solid ${
                      selectedOdp.status === 'FULL' ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                    }`
                  }}
                >
                  {selectedOdp.status}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>
                  {selectedOdp.code}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedOdp.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  className="btn-icon"
                  title="Fokus di Peta"
                  onClick={() => focusOnMap(selectedOdp.lat, selectedOdp.lng, 19)}
                >
                  <Eye size={15} />
                </button>
                <button
                  className="btn-icon"
                  title="Edit ODP"
                  onClick={() => {
                    setOdpCode(selectedOdp.code);
                    setOdpName(selectedOdp.name);
                    setOdpCapacity(selectedOdp.capacityPorts);
                    setOdpParentOdcId(selectedOdp.odcId);
                    setOdpLat(selectedOdp.lat);
                    setOdpLng(selectedOdp.lng);
                    setOdpLossDbm(selectedOdp.avgDbm);
                    setOdpTubeColor(selectedOdp.tubeColor || 'Biru (Blue)');
                    setOdpCoreNumber(selectedOdp.coreNumber || 1);
                    setIsEditOdpOpen(true);
                  }}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  className="btn-icon"
                  style={{ color: 'var(--accent-rose)' }}
                  title="Hapus ODP"
                  onClick={() => {
                    if (confirm(`Hapus ODP ${selectedOdp.code}?`)) {
                      onDeleteOdp(selectedOdp.id);
                      setSelectedOdpId(null);
                      triggerNotification(`ODP ${selectedOdp.code} berhasil dihapus.`);
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* ODP Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Induk ODC</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                  {odcs.find((o) => o.id === selectedOdp.odcId)?.name || 'Direct OLT'}
                </span>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Redaman Optik</span>
                <span
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: selectedOdp.avgDbm < -24 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                  }}
                >
                  {selectedOdp.avgDbm} dBm
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                <span>Kapasitas Port Terpakai</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {selectedOdp.usedPorts} / {selectedOdp.capacityPorts} Port (
                  {Math.round((selectedOdp.usedPorts / selectedOdp.capacityPorts) * 100)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(selectedOdp.usedPorts / selectedOdp.capacityPorts) * 100}%`,
                    height: '100%',
                    background: selectedOdp.status === 'FULL' ? 'var(--accent-rose)' : 'var(--accent-cyan)'
                  }}
                />
              </div>
            </div>

            {/* Spliced Tube Core */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Info size={13} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Warna Tube &amp; Core Fiber (TIA-598 Standard)</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                  Core #{selectedOdp.coreNumber}: {selectedOdp.tubeColor}
                </span>
              </div>

              <div className="fiber-color-grid">
                {TIA_598_COLORS.slice(0, 8).map((c) => {
                  const isSplicedCore = c.no === selectedOdp.coreNumber;
                  return (
                    <div
                      key={c.no}
                      className="fiber-core-pill"
                      style={{
                        borderColor: isSplicedCore ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                        background: isSplicedCore ? 'var(--bg-elevated)' : 'var(--bg-tertiary)'
                      }}
                    >
                      <div className="fiber-color-dot" style={{ backgroundColor: c.hex }} />
                      <span style={{ fontSize: '0.68rem' }}>
                        #{c.no} {c.name.split(' ')[0]} {isSplicedCore && '★'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clients on ODP Ports */}
            <div style={{ flex: 1, marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Pelanggan Terhubung di Port ODP:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                {Array.from({ length: selectedOdp.capacityPorts }).map((_, i) => {
                  const portNumber = i + 1;
                  const clientOnPort = odpClients.find((c) => c.odpPort === portNumber);

                  return (
                    <div
                      key={portNumber}
                      style={{
                        padding: '0.45rem 0.65rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: clientOnPort ? 'var(--accent-cyan)' : 'var(--bg-primary)',
                            color: clientOnPort ? '#ffffff' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}
                        >
                          {portNumber}
                        </span>
                        {clientOnPort ? (
                          <div>
                            <span style={{ fontWeight: 600, display: 'block' }}>{clientOnPort.fullName}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              PPPoE: {clientOnPort.username}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Port Tersedia</span>
                        )}
                      </div>
                      <div>
                        {clientOnPort ? (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: 'var(--accent-emerald)',
                              background: 'rgba(16, 185, 129, 0.15)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: 'var(--text-muted)',
                              border: '1px dashed var(--border-subtle)',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            Kosong
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{
                width: '100%',
                marginBottom: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                background: 'rgba(6, 182, 212, 0.1)',
                color: 'var(--accent-cyan)'
              }}
              onClick={() => handleOpenTrayModalForOdp(selectedOdp)}
            >
              <Layers size={14} />
              <span>🔬 Buka Visualizer Splice Tray (ODP)</span>
            </button>

            {onSelectOdpForProvisioning && (
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => onSelectOdpForProvisioning(selectedOdp.id)}
              >
                <span>Gunakan ODP Ini untuk Pasang Baru Pelanggan</span>
              </button>
            )}
          </div>
        ) : (
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              gap: '0.5rem',
              textAlign: 'center',
              padding: '2rem'
            }}
          >
            <MapPin size={36} style={{ color: 'var(--accent-cyan)', opacity: 0.6 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Pilih salah satu titik ODC, ODP, atau rute kabel optik di peta untuk melihat detail teknis.
            </p>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------------
          DATA TABLES SECTION: TABEL LIST KABEL & LIST ODC (Requested by User)
          -------------------------------------------------------------------------- */}
      <div className="gis-tables-section">
        {/* Navigation Tabs Bar */}
        <div className="gis-tabs-bar">
          <div className="gis-tab-nav-group">
            <button
              type="button"
              className={`gis-tab-btn ${activeTableTab === 'cables' ? 'active' : ''}`}
              onClick={() => setActiveTableTab('cables')}
            >
              <Activity size={16} />
              <span>Tabel List Kabel Optik</span>
              <span className="gis-stat-pill">{cables.length}</span>
            </button>
            <button
              type="button"
              className={`gis-tab-btn ${activeTableTab === 'odcs' ? 'active' : ''}`}
              onClick={() => setActiveTableTab('odcs')}
            >
              <Building size={16} />
              <span>Tabel List ODC</span>
              <span className="gis-stat-pill">{odcs.length}</span>
            </button>
            <button
              type="button"
              className={`gis-tab-btn ${activeTableTab === 'odps' ? 'active' : ''}`}
              onClick={() => setActiveTableTab('odps')}
            >
              <MapPin size={16} />
              <span>Tabel List ODP</span>
              <span className="gis-stat-pill">{odps.length}</span>
            </button>
            <button
              type="button"
              className={`gis-tab-btn ${activeTableTab === 'clients' ? 'active' : ''}`}
              onClick={() => setActiveTableTab('clients')}
            >
              <Users size={16} />
              <span>Tabel List Pelanggan</span>
              <span className="gis-stat-pill">{clients.length}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeTableTab === 'cables' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setIsDrawingCable(true);
                  setDrawingPoints([]);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                  triggerNotification('Klik pada peta untuk mulai menggambar jalur kabel optik.');
                }}
              >
                <Activity size={14} />
                <span>+ Tarik Kabel Baru</span>
              </button>
            )}
            {activeTableTab === 'odcs' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddOdcOpen(true)}
              >
                <Building size={14} />
                <span>+ Tambah ODC Baru</span>
              </button>
            )}
            {activeTableTab === 'odps' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddOdpOpen(true)}
              >
                <Plus size={14} />
                <span>+ Tambah ODP Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: TABEL LIST KABEL OPTIK */}
        {activeTableTab === 'cables' && (
          <div className="gis-table-card">
            <div className="gis-table-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Daftar Jalur Kabel Fiber Optik</h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Total {cables.length} rute kabel optik aktif di jaringan GIS.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div className="gis-filter-pills">
                  {(['ALL', 'FEEDER', 'DISTRIBUTION', 'DROP'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`gis-filter-pill ${cableTypeFilter === type ? 'active' : ''}`}
                      onClick={() => setCableTypeFilter(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Cari rute kabel..."
                    style={{ paddingLeft: '32px', fontSize: '0.78rem' }}
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="gis-data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama &amp; Kode Kabel</th>
                    <th>Tipe Rute</th>
                    <th>Kapasitas Core</th>
                    <th>Panjang Rute</th>
                    <th>Est. Loss (dB)</th>
                    <th>Titik Waypoint</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCables.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Tidak ada jalur kabel yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredCables.map((c, idx) => {
                      const dist = c.totalLengthMeters || calculateRouteDistance(c.coordinates);
                      const estLoss = (dist * 0.00035).toFixed(2);
                      const isSelected = c.id === selectedCableId;

                      return (
                        <tr key={c.id} style={{ background: isSelected ? 'rgba(6, 182, 212, 0.08)' : undefined }}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '3px',
                                  backgroundColor: c.color || '#06b6d4'
                                }}
                              />
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background:
                                  c.type === 'FEEDER'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : c.type === 'DISTRIBUTION'
                                    ? 'rgba(6, 182, 212, 0.15)'
                                    : 'rgba(245, 158, 11, 0.15)',
                                color:
                                  c.type === 'FEEDER'
                                    ? 'var(--accent-rose)'
                                    : c.type === 'DISTRIBUTION'
                                    ? 'var(--accent-cyan)'
                                    : 'var(--accent-amber)'
                              }}
                            >
                              {c.type}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              {c.coreCount} Core
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>
                              ~{dist} m
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                              ~{estLoss} dB
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                              {c.coordinates.length} titik
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="Fokuskan Rute di Peta"
                                onClick={() => focusOnCable(c)}
                              >
                                <Eye size={12} />
                                <span>Fokus</span>
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="Edit Rute Kabel"
                                onClick={() => handleOpenEditCable(c)}
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="btn-icon"
                                style={{ color: 'var(--accent-rose)', padding: '4px' }}
                                title="Hapus Rute Kabel"
                                onClick={() => {
                                  if (confirm(`Hapus kabel ${c.name}?`)) {
                                    if (onDeleteCable) onDeleteCable(c.id);
                                    triggerNotification(`Kabel ${c.name} berhasil dihapus.`);
                                  }
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TABEL LIST ODC */}
        {activeTableTab === 'odcs' && (
          <div className="gis-table-card">
            <div className="gis-table-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Daftar Kabinet Distribusi (ODC)</h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Total {odcs.length} unit ODC aktif di seluruh area coverage.
                </p>
              </div>

              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari kode, nama, atau wilayah ODC..."
                  style={{ paddingLeft: '32px', fontSize: '0.78rem' }}
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="gis-data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode ODC</th>
                    <th>Nama Kabinet</th>
                    <th>Wilayah Coverage</th>
                    <th>Koordinat GPS</th>
                    <th>Utilisasi Port</th>
                    <th>Splitter Ratio</th>
                    <th>ODP Terhubung</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOdcs.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Tidak ada data ODC yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredOdcs.map((odc, idx) => {
                      const connectedOdps = odps.filter((o) => o.odcId === odc.id);
                      const percentUsed = Math.round((odc.usedPorts / odc.capacityPorts) * 100);

                      return (
                        <tr key={odc.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: 800,
                                color: 'var(--accent-blue)',
                                fontFamily: 'var(--font-mono)'
                              }}
                            >
                              {odc.code}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{odc.name}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {odc.coverageArea}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {odc.lat.toFixed(5)}, {odc.lng.toFixed(5)}
                              </span>
                              <button
                                type="button"
                                className="btn-icon"
                                style={{ padding: '2px' }}
                                title="Salin Koordinat"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${odc.lat}, ${odc.lng}`);
                                  triggerNotification(`Koordinat ${odc.code} disalin ke clipboard!`);
                                }}
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: '110px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
                                <span>{odc.usedPorts}/{odc.capacityPorts} Port</span>
                                <span style={{ fontWeight: 700, color: percentUsed > 80 ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>
                                  {percentUsed}%
                                </span>
                              </div>
                              <div style={{ height: '5px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${percentUsed}%`,
                                    height: '100%',
                                    background: percentUsed > 80 ? 'var(--accent-rose)' : 'var(--accent-cyan)'
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                              {odc.splitterRatio || '1:4'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                              {connectedOdps.length} ODP
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="Fokuskan di Peta"
                                onClick={() => {
                                  focusOnMap(odc.lat, odc.lng, 18);
                                  const marker = odcMarkerMapRef.current.get(odc.id);
                                  if (marker) marker.openPopup();
                                }}
                              >
                                <Eye size={12} />
                                <span>Fokus</span>
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem', color: 'var(--accent-cyan)' }}
                                title="Tambah ODP di ODC Ini"
                                onClick={() => {
                                  setOdpParentOdcId(odc.id);
                                  setOdpLat(odc.lat + 0.001);
                                  setOdpLng(odc.lng + 0.001);
                                  setIsAddOdpOpen(true);
                                }}
                              >
                                <Plus size={12} />
                                <span>ODP</span>
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem', color: 'var(--accent-cyan)' }}
                                title="Buka Visualizer Splice Tray ODC"
                                onClick={() => handleOpenTrayModalForOdc(odc)}
                              >
                                <Layers size={12} />
                                <span>Tray</span>
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="Edit Data ODC"
                                onClick={() => handleOpenEditOdc(odc)}
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="btn-icon"
                                style={{ color: 'var(--accent-rose)', padding: '4px' }}
                                title="Hapus ODC"
                                onClick={() => {
                                  if (confirm(`Hapus ODC ${odc.code}?`)) {
                                    onDeleteOdc(odc.id);
                                    triggerNotification(`ODC ${odc.code} berhasil dihapus.`);
                                  }
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TABEL LIST ODP */}
        {activeTableTab === 'odps' && (
          <div className="gis-table-card">
            <div className="gis-table-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Daftar Titik Distribusi Pelanggan (ODP)</h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Total {odps.length} unit ODP titik sambungan drop core ke rumah pelanggan.
                </p>
              </div>

              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari kode atau nama ODP..."
                  style={{ paddingLeft: '32px', fontSize: '0.78rem' }}
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="gis-data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode ODP</th>
                    <th>Nama Titik</th>
                    <th>ODC Induk</th>
                    <th>Warna Tube</th>
                    <th>Kapasitas Port</th>
                    <th>Avg Loss (dBm)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOdps.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Tidak ada data ODP yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredOdps.map((odp, idx) => {
                      const isFull = odp.usedPorts >= odp.capacityPorts;
                      const parentOdc = odcs.find((o) => o.id === odp.odcId);

                      return (
                        <tr key={odp.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                              {odp.code}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{odp.name}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                              {parentOdc ? parentOdc.code : 'Direct OLT'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: odp.tubeColor || '#06b6d4',
                                  display: 'inline-block'
                                }}
                              />
                              <span style={{ fontSize: '0.75rem' }}>{odp.tubeColor || 'Biru'}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {odp.usedPorts} / {odp.capacityPorts} Port
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                color: odp.avgDbm < -24 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                              }}
                            >
                              {odp.avgDbm} dBm
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: isFull ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isFull ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                              }}
                            >
                              {isFull ? 'FULL' : odp.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="Fokuskan di Peta"
                                onClick={() => {
                                  setSelectedOdpId(odp.id);
                                  focusOnMap(odp.lat, odp.lng, 19);
                                  const marker = odpMarkerMapRef.current.get(odp.id);
                                  if (marker) marker.openPopup();
                                }}
                              >
                                <Eye size={12} />
                                <span>Fokus</span>
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem', color: 'var(--accent-cyan)' }}
                                title="Buka Visualizer Splice Tray ODP"
                                onClick={() => handleOpenTrayModalForOdp(odp)}
                              >
                                <Layers size={12} />
                                <span>Tray</span>
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="Edit Data ODP"
                                onClick={() => handleOpenEditOdp(odp)}
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="btn-icon"
                                style={{ color: 'var(--accent-rose)', padding: '4px' }}
                                title="Hapus ODP"
                                onClick={() => {
                                  if (confirm(`Hapus ODP ${odp.code}?`)) {
                                    onDeleteOdp(odp.id);
                                    triggerNotification(`ODP ${odp.code} berhasil dihapus.`);
                                  }
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TABEL LIST PELANGGAN */}
        {activeTableTab === 'clients' && (
          <div className="gis-table-card">
            <div className="gis-table-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Daftar Pelanggan Terhubung (FTTH / PPPoE)</h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Total {clients.length} pelanggan tersebar di seluruh titik ODP.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div className="gis-filter-pills">
                  {(['ALL', 'ACTIVE', 'ISOLATED', 'OFFLINE'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`gis-filter-pill ${clientStatusFilter === st ? 'active' : ''}`}
                      onClick={() => setClientStatusFilter(st)}
                    >
                      {st === 'ALL' ? 'SEMUA' : st}
                    </button>
                  ))}
                </div>
                <div style={{ position: 'relative', width: '260px' }}>
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Cari nama, user, IP, atau ODP..."
                    style={{ paddingLeft: '32px', fontSize: '0.78rem' }}
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="gis-data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama &amp; Username</th>
                    <th>Status</th>
                    <th>Titik ODP &amp; Port</th>
                    <th>Induk ODC</th>
                    <th>Paket Profil</th>
                    <th>IP Address &amp; ONT</th>
                    <th>Alamat Rumah</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        Tidak ada data pelanggan yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client, idx) => {
                      const odp = odps.find((o) => o.id === client.odpId);
                      const parentOdc = odp ? odcs.find((c) => c.id === odp.odcId) : null;

                      return (
                        <tr key={client.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <div>
                              <span style={{ fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>
                                {client.fullName}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                                {client.username}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background:
                                  client.status === 'ACTIVE'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : client.status === 'ISOLATED'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(100, 116, 139, 0.15)',
                                color:
                                  client.status === 'ACTIVE'
                                    ? 'var(--accent-emerald)'
                                    : client.status === 'ISOLATED'
                                    ? 'var(--accent-rose)'
                                    : 'var(--text-muted)'
                              }}
                            >
                              {client.status}
                            </span>
                          </td>
                          <td>
                            {odp ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    fontWeight: 800,
                                    color: odp.tubeColor || 'var(--accent-cyan)',
                                    fontFamily: 'var(--font-mono)'
                                  }}
                                >
                                  {odp.code}
                                </span>
                                <span
                                  style={{
                                    background: 'var(--bg-tertiary)',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Port #{client.odpPort}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>- Belum Terhubung -</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
                              {parentOdc ? parentOdc.code : '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{client.profile}</span>
                          </td>
                          <td>
                            <div>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', display: 'block' }}>
                                {client.ipAddress || 'Dynamic IP'}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                SN: {client.ontSerial}
                              </span>
                            </div>
                          </td>
                          <td style={{ maxWidth: '180px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block'
                              }}
                              title={client.address}
                            >
                              {client.address}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="Fokuskan Titik ODP Pelanggan di Peta"
                                onClick={() => {
                                  if (odp) {
                                    setSelectedOdpId(odp.id);
                                    setSelectedCableId(null);
                                    focusOnMap(odp.lat, odp.lng, 19);
                                    const marker = odpMarkerMapRef.current.get(odp.id);
                                    if (marker) marker.openPopup();
                                    triggerNotification(
                                      `Fokus ke ODP ${odp.code} (Port #${client.odpPort} - ${client.fullName})`
                                    );
                                  } else {
                                    triggerNotification(`Pelanggan ${client.fullName} belum terhubung ke ODP.`);
                                  }
                                }}
                              >
                                <Eye size={12} />
                                <span>Fokus</span>
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                title="Edit Data Pelanggan"
                                onClick={() => handleOpenEditClient(client)}
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------------
          MODALS SECTION (ODP, ODC, CABLE)
          -------------------------------------------------------------------------- */}

      {/* MODAL SIMPAN JALUR KABEL */}
      {isAddCableModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddCableModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Simpan Jalur Kabel Optik Baru</h3>
              <button className="btn-icon" onClick={() => setIsAddCableModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveDrawnCable}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Jalur Kabel</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Feeder Utama POP ke ODC-01"
                    value={cableName}
                    onChange={(e) => setCableName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipe Kabel</label>
                    <select
                      className="form-select"
                      value={cableType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setCableType(val);
                        if (val === 'FEEDER') setCableColor('#ef4444');
                        else if (val === 'DISTRIBUTION') setCableColor('#06b6d4');
                        else setCableColor('#f59e0b');
                      }}
                    >
                      <option value="FEEDER">FEEDER (Trunk Utama)</option>
                      <option value="DISTRIBUTION">DISTRIBUTION (Distribusi Antar ODC/ODP)</option>
                      <option value="DROP">DROP CORE (Akses Pelanggan)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kapasitas Core</label>
                    <select
                      className="form-select"
                      value={cableCoreCount}
                      onChange={(e) => setCableCoreCount(Number(e.target.value))}
                    >
                      <option value={2}>2 Core</option>
                      <option value={4}>4 Core</option>
                      <option value={6}>6 Core</option>
                      <option value={8}>8 Core</option>
                      <option value={12}>12 Core</option>
                      <option value={24}>24 Core</option>
                      <option value={48}>48 Core</option>
                      <option value={96}>96 Core</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warna Garis Rute di Peta</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="color"
                      value={cableColor}
                      onChange={(e) => setCableColor(e.target.value)}
                      style={{ width: '40px', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{cableColor}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Jumlah Titik Waypoint:</span>
                    <span style={{ fontWeight: 700 }}>{drawingPoints.length} Titik</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimasi Panjang Total:</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                      ~{calculateRouteDistance(drawingPoints)} Meter
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddCableModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan Rute Kabel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ODP BARU */}
      {isAddOdpOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOdpOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Tambah Titik ODP Baru</h3>
              <button className="btn-icon" onClick={() => setIsAddOdpOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveOdp}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kode ODP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={odpCode}
                      onChange={(e) => setOdpCode(e.target.value)}
                      placeholder="ODP-05"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama / Lokasi Titik</label>
                    <input
                      type="text"
                      className="form-input"
                      value={odpName}
                      onChange={(e) => setOdpName(e.target.value)}
                      placeholder="Jl. Raya Kuta No. 45"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Induk ODC</label>
                    <select
                      className="form-select"
                      value={odpParentOdcId}
                      onChange={(e) => setOdpParentOdcId(e.target.value)}
                    >
                      {odcs.map((odc) => (
                        <option key={odc.id} value={odc.id}>
                          {odc.code} - {odc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kapasitas Port</label>
                    <select
                      className="form-select"
                      value={odpCapacity}
                      onChange={(e) => setOdpCapacity(Number(e.target.value))}
                    >
                      <option value={8}>8 Port</option>
                      <option value={16}>16 Port</option>
                      <option value={24}>24 Port</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Warna Tube Core (TIA-598)</label>
                    <select
                      className="form-select"
                      value={odpTubeColor}
                      onChange={(e) => setOdpTubeColor(e.target.value)}
                    >
                      {TIA_598_COLORS.map((c) => (
                        <option key={c.no} value={c.name}>
                          #{c.no} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Core (1-12)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      className="form-input"
                      value={odpCoreNumber}
                      onChange={(e) => setOdpCoreNumber(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={odpLat}
                      onChange={(e) => setOdpLat(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={odpLng}
                      onChange={(e) => setOdpLng(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimasi Redaman (dBm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={odpLossDbm}
                    onChange={(e) => setOdpLossDbm(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddOdpOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan ODP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT ODP */}
      {isEditOdpOpen && selectedOdp && (
        <div className="modal-overlay" onClick={() => setIsEditOdpOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Edit Data ODP: {selectedOdp.code}</h3>
              <button className="btn-icon" onClick={() => setIsEditOdpOpen(false)}>
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEditOdp({
                  ...selectedOdp,
                  name: odpName,
                  capacityPorts: Number(odpCapacity),
                  odcId: odpParentOdcId,
                  lat: Number(odpLat),
                  lng: Number(odpLng),
                  avgDbm: Number(odpLossDbm),
                  tubeColor: odpTubeColor,
                  coreNumber: Number(odpCoreNumber)
                });
                setIsEditOdpOpen(false);
                triggerNotification(`Data ODP ${selectedOdp.code} berhasil diperbarui.`);
              }}
            >
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama ODP</label>
                  <input
                    type="text"
                    className="form-input"
                    value={odpName}
                    onChange={(e) => setOdpName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Induk ODC</label>
                    <select
                      className="form-select"
                      value={odpParentOdcId}
                      onChange={(e) => setOdpParentOdcId(e.target.value)}
                    >
                      {odcs.map((odc) => (
                        <option key={odc.id} value={odc.id}>
                          {odc.code} - {odc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kapasitas Port</label>
                    <select
                      className="form-select"
                      value={odpCapacity}
                      onChange={(e) => setOdpCapacity(Number(e.target.value))}
                    >
                      <option value={8}>8 Port</option>
                      <option value={16}>16 Port</option>
                      <option value={24}>24 Port</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={odpLat}
                      onChange={(e) => setOdpLat(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={odpLng}
                      onChange={(e) => setOdpLng(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimasi Redaman (dBm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={odpLossDbm}
                    onChange={(e) => setOdpLossDbm(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditOdpOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ODC BARU */}
      {isAddOdcOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOdcOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Tambah Kabinet Distribusi (ODC) Baru</h3>
              <button className="btn-icon" onClick={() => setIsAddOdcOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveOdc}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kode ODC</label>
                    <input
                      type="text"
                      className="form-input"
                      value={odcCode}
                      onChange={(e) => setOdcCode(e.target.value)}
                      placeholder="ODC-03"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Kabinet ODC</label>
                    <input
                      type="text"
                      className="form-input"
                      value={odcName}
                      onChange={(e) => setOdcName(e.target.value)}
                      placeholder="ODC Pertigaan Legian"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Port ODC</label>
                    <select
                      className="form-select"
                      value={odcCap}
                      onChange={(e) => setOdcCap(Number(e.target.value))}
                    >
                      <option value={24}>24 Port</option>
                      <option value={48}>48 Port</option>
                      <option value={96}>96 Port</option>
                      <option value={144}>144 Port</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wilayah Cakupan (Coverage)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={odcArea}
                      onChange={(e) => setOdcArea(e.target.value)}
                      placeholder="Kuta Utara Sector 3"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={odcLat}
                      onChange={(e) => setOdcLat(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={odcLng}
                      onChange={(e) => setOdcLng(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddOdcOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan ODC</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA KABEL OPTIK */}
      {isEditCableOpen && selectedCableForEdit && (
        <div className="modal-overlay" onClick={() => setIsEditCableOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Edit Jalur Kabel Optik: {selectedCableForEdit.name}</h3>
              <button className="btn-icon" onClick={() => setIsEditCableOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditCable}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Jalur Kabel</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cableName}
                    onChange={(e) => setCableName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipe Kabel</label>
                    <select
                      className="form-select"
                      value={cableType}
                      onChange={(e) => setCableType(e.target.value as any)}
                    >
                      <option value="FEEDER">FEEDER (Trunk Utama)</option>
                      <option value="DISTRIBUTION">DISTRIBUTION (Distribusi Antar ODC/ODP)</option>
                      <option value="DROP">DROP CORE (Akses Pelanggan)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kapasitas Core</label>
                    <select
                      className="form-select"
                      value={cableCoreCount}
                      onChange={(e) => setCableCoreCount(Number(e.target.value))}
                    >
                      <option value={2}>2 Core</option>
                      <option value={4}>4 Core</option>
                      <option value={6}>6 Core</option>
                      <option value={8}>8 Core</option>
                      <option value={12}>12 Core</option>
                      <option value={24}>24 Core</option>
                      <option value={48}>48 Core</option>
                      <option value={96}>96 Core</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warna Garis Rute di Peta</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="color"
                      value={cableColor}
                      onChange={(e) => setCableColor(e.target.value)}
                      style={{ width: '40px', height: '36px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{cableColor}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditCableOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT KABINET ODC */}
      {isEditOdcOpen && selectedOdcForEdit && (
        <div className="modal-overlay" onClick={() => setIsEditOdcOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Edit Kabinet ODC: {selectedOdcForEdit.code}</h3>
              <button className="btn-icon" onClick={() => setIsEditOdcOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditOdc}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kode ODC</label>
                    <input
                      type="text"
                      className="form-input"
                      value={odcCode}
                      onChange={(e) => setOdcCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Kabinet ODC</label>
                    <input
                      type="text"
                      className="form-input"
                      value={odcName}
                      onChange={(e) => setOdcName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Port ODC</label>
                    <select
                      className="form-select"
                      value={odcCap}
                      onChange={(e) => setOdcCap(Number(e.target.value))}
                    >
                      <option value={24}>24 Port</option>
                      <option value={48}>48 Port</option>
                      <option value={96}>96 Port</option>
                      <option value={144}>144 Port</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wilayah Cakupan (Coverage)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={odcArea}
                      onChange={(e) => setOdcArea(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={odcLat}
                      onChange={(e) => setOdcLat(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={odcLng}
                      onChange={(e) => setOdcLng(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditOdcOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA PELANGGAN */}
      {isEditClientOpen && selectedClientForEdit && (
        <div className="modal-overlay" onClick={() => setIsEditClientOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Edit Data Pelanggan: {selectedClientForEdit.fullName} ({selectedClientForEdit.username})
              </h3>
              <button className="btn-icon" onClick={() => setIsEditClientOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditClient}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-input"
                      value={clientFullName}
                      onChange={(e) => setClientFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. Telepon / WhatsApp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Pemasangan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Paket Profil</label>
                    <input
                      type="text"
                      className="form-input"
                      value={clientProfile}
                      onChange={(e) => setClientProfile(e.target.value)}
                      placeholder="Contoh: 50 Mbps Home Ultra"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status Koneksi</label>
                    <select
                      className="form-select"
                      value={clientStatus}
                      onChange={(e) => setClientStatus(e.target.value as any)}
                    >
                      <option value="ACTIVE">ACTIVE (Aktif Normal)</option>
                      <option value="ISOLATED">ISOLATED (Terisolir / Belum Bayar)</option>
                      <option value="OFFLINE">OFFLINE (Perangkat Mati)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Titik Sambungan ODP</label>
                    <select
                      className="form-select"
                      value={clientOdpId}
                      onChange={(e) => setClientOdpId(e.target.value)}
                    >
                      <option value="">-- Pilih ODP --</option>
                      {odps.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.code} - {o.name} ({o.usedPorts}/{o.capacityPorts} Port)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Port ODP</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      className="form-input"
                      value={clientOdpPort}
                      onChange={(e) => setClientOdpPort(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditClientOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Simpan Perubahan Pelanggan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          FIBER OPTIC SPLICE TRAY VISUALIZER MODAL
          ========================================================================= */}
      <FiberTrayVisualizerModal
        isOpen={isTrayModalOpen}
        onClose={() => setIsTrayModalOpen(false)}
        targetDevice={trayModalTarget}
        cables={cables}
        odcs={odcs}
        odps={odps}
        clients={clients}
      />
    </div>
  );
};
