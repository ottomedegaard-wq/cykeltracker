import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Droplets, 
  Mountain, 
  CheckCircle, 
  Clock, 
  Bike, 
  CircleDashed,
  Award,
  Zap,
  TrendingUp,
  ShieldAlert,
  Trash2,
  Sparkles,
  CloudRain,
  Compass,
  MapPin,
  Navigation,
  Timer,
  Gauge,
  Flame,
  LogOut,
  Cloud
} from 'lucide-react';

const TEXT = {
  title: "Bike Tracker",
  subtitle: "Maintenance & XP",
  maintenanceTab: "Maintenance",
  plannerTab: "Route Planner",
  riderName: "Rider Name",
  level: "Level",
  totalDistance: "Total Distance",
  totalTime: "Total Time",
  nextLevel: "Next Level (500 XP)",
  trophies: "Trophies & Achievements",
  unlocked: "unlocked",
  registerRide: "Log New Bike Ride",
  distanceLabel: "Distance",
  durationLabel: "Duration",
  hoursPlaceholder: "Hours (e.g. 1)",
  hoursMax: "Max 24 hours",
  minutesPlaceholder: "Minutes (e.g. 45)",
  minutesMax: "Max 59 minutes",
  weatherLabel: "Weather",
  dry: "Dry",
  rain: "Rain",
  terrainLabel: "Terrain",
  asphalt: "Asphalt",
  gravel: "Gravel",
  mud: "Mud",
  addRideBtn: "Add Ride & Earn XP",
  componentHealth: "Component Health",
  chain: "Chain",
  tires: "Tires",
  gears: "Gear",
  brakes: "Disc Brakes",
  sinceLast: "Since last",
  xpReq: "XP requirement",
  cleanChainBtn: "I cleaned the chain",
  changeTiresBtn: "I changed tires",
  changeGearsBtn: "I changed gears",
  checkBrakesBtn: "I checked/changed brakes",
  rideHistory: "Ride History",
  noRides: "No rides logged yet. Add your first ride above!",
  deleteRide: "Delete ride",
  duration: "Duration",
  avgSpeed: "Avg speed",
  plannerTitle: "Route Planner",
  plannerDesc: "Generate a random loop via GPS, or plan a manual route with specific waypoints.",
  startLocation: "Manual Start Location",
  startPlaceholder: "e.g. City Hall Square, Copenhagen",
  desiredDistance: "Desired ride distance",
  desiredDistancePlaceholder: "e.g. 35",
  outboundWaypoint: "Outbound Waypoint",
  outboundPlaceholder: "e.g. Roskilde Cathedral",
  homeWaypoint: "Home Waypoint (Return via)",
  homePlaceholder: "e.g. Ballerup",
  openMapBtn: "Show route on map",
  gpsLoopBtn: "Generate Loop from my Location",
  fetchingLocation: "Fetching location...",
  locationError: "Could not find your location. Check GPS permissions.",
  gpsNotSupported: "GPS is not supported in this browser.",
  manualPlanner: "Or plan manually",
  autoAddressFallback: "Or enter start location (if GPS is denied):",
  autoAddressPlaceholder: "e.g. London",
  generateFromAddressBtn: "Generate loop from address",
  badges: {
    first: { name: 'First Ride', desc: 'Logged your first bike ride' },
    mud: { name: 'Mud Warrior', desc: 'Rode in rain & gravel/mud' },
    century: { name: 'Century (100+ km)', desc: 'Completed a 100+ km ride' },
    clean: { name: 'Perfect Care', desc: 'Cleaned chain with 150+ km' },
    veteran: { name: 'Weather Veteran', desc: 'Logged 5 rides in the rain' },
    iron: { name: 'Iron Rider', desc: 'Ridden over 500 km in total' },
    tire: { name: 'Tire Expert', desc: 'Changed bicycle tires' },
    gear: { name: 'Gear Guru', desc: 'Changed cassette or chainrings' },
    speedster: { name: 'Speedster', desc: 'Achieved an avg speed over 30 km/h' },
    hatTrick: { name: 'Hat Trick', desc: 'Logged 3 rides' },
    explorer: { name: 'Explorer', desc: 'Logged 10 rides in total' },
    marathon: { name: 'Marathon', desc: 'Accumulated 1000 km on the bike' },
    brakeMaster: { name: 'Brake Master', desc: 'Maintained disc brakes' },
    trailblazer: { name: 'Trailblazer', desc: 'Rode on challenging mud terrain' },
    centuryDouble: { name: 'Double Century', desc: 'Completed a 200+ km ride' },
    grandMaster: { name: 'Grand Master', desc: 'Reached Level 10 in the app' }
  }
};

const MAX_CHAIN_KM = 200;
const MIN_CHAIN_XP_KM = 150; 
const MAX_TIRE_KM = 3000;
const MIN_TIRE_XP_KM = 2000; 
const MAX_GEAR_KM = 6000;
const MIN_GEAR_XP_KM = 3000; 
const MAX_BRAKE_KM = 200; 
const MIN_BRAKE_XP_KM = 150; 
const XP_PER_LEVEL = 500;

// Roads are never straight, so a route is roughly this much longer than the
// straight lines between its points.
const ROAD_FACTOR = 1.3;
const LOOP_POINTS = 3;

// Picks the points for a cycling route that leaves and returns to the start as
// a real loop. The start and LOOP_POINTS turn points sit evenly on a circle that
// passes through the start, so you ride out one way and come home another.
const buildLoopPoints = (lat, lng, distKm) => {
  const corners = LOOP_POINTS + 1;
  // Perimeter of a regular polygon inscribed in a circle of radius r is
  // 2 * n * r * sin(PI / n). Solve for r so the road distance matches distKm.
  const radiusKm = distKm / (ROAD_FACTOR * 2 * corners * Math.sin(Math.PI / corners));

  const heading = Math.random() * 2 * Math.PI; // direction from start to circle centre
  const direction = Math.random() < 0.5 ? 1 : -1; // clockwise or counter-clockwise
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos(lat * (Math.PI / 180));

  const toPoint = (bearing, km) => ({
    lat: lat + (km * Math.cos(bearing)) / kmPerDegLat,
    lng: lng + (km * Math.sin(bearing)) / kmPerDegLng,
  });

  const centre = toPoint(heading, radiusKm);
  const startAngle = heading + Math.PI; // angle of the start, seen from the centre
  const waypoints = [];
  for (let i = 1; i <= LOOP_POINTS; i++) {
    const angle = startAngle + direction * (i * 2 * Math.PI) / corners;
    waypoints.push({
      lat: centre.lat + (radiusKm * Math.cos(angle)) / kmPerDegLat,
      lng: centre.lng + (radiusKm * Math.sin(angle)) / kmPerDegLng,
    });
  }

  const start = { lat, lng };
  return [start, ...waypoints, start];
};

// Turns a place name or address into { lat, lng } using OpenStreetMap
// (Nominatim). Returns null when nothing is found.
const geocode = async (query) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
};

const haversineKm = (a, b) => {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

// Picks `count` points spread evenly (by distance) along a line of points.
const sampleAlongLine = (line, count) => {
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + haversineKm(line[i - 1], line[i]));
  const total = cum[cum.length - 1];
  const samples = [];
  let seg = 1;
  for (let i = 0; i < count; i++) {
    const km = (total * i) / (count - 1);
    while (seg < line.length - 1 && cum[seg] < km) seg++;
    const a = line[seg - 1];
    const b = line[seg];
    const len = cum[seg] - cum[seg - 1];
    const f = len > 0 ? Math.min(1, Math.max(0, (km - cum[seg - 1]) / len)) : 0;
    samples.push({ km, lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f });
  }
  return samples;
};

const ELEVATION_SAMPLES = 100; // Open-Meteo allows up to 100 points per request

// Gets the bike route along the roads (OpenStreetMap routing), then the
// height above sea level at 100 points along it (Open-Meteo). Both are free
// and need no API key.
const fetchRouteDetails = async (points) => {
  const coords = points.map((p) => `${p.lng.toFixed(5)},${p.lat.toFixed(5)}`).join(';');
  const routeRes = await fetch(`https://routing.openstreetmap.de/routed-bike/route/v1/driving/${coords}?overview=full&geometries=geojson`);
  const routeData = await routeRes.json();
  if (routeData.code !== 'Ok' || !routeData.routes?.length) throw new Error('No bike route found');
  const route = routeData.routes[0];
  const line = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

  const samples = sampleAlongLine(line, ELEVATION_SAMPLES);
  const lats = samples.map((p) => p.lat.toFixed(5)).join(',');
  const lngs = samples.map((p) => p.lng.toFixed(5)).join(',');
  const elevRes = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`);
  const elevData = await elevRes.json();
  if (!Array.isArray(elevData.elevation)) throw new Error('No elevation data');

  // Scale sample distances to the route's own length.
  const scale = route.distance / 1000 / (samples[samples.length - 1].km || 1);
  const profile = samples.map((p, i) => ({ km: p.km * scale, m: elevData.elevation[i], lat: p.lat, lng: p.lng }));

  let climb = 0;
  let descent = 0;
  for (let i = 1; i < profile.length; i++) {
    const diff = profile[i].m - profile[i - 1].m;
    if (diff > 0) climb += diff;
    else descent -= diff;
  }
  const heights = profile.map((p) => p.m);
  return {
    distanceKm: route.distance / 1000,
    profile,
    line,
    climb: Math.round(climb),
    descent: Math.round(descent),
    high: Math.round(Math.max(...heights)),
    low: Math.round(Math.min(...heights)),
  };
};

const MAP_W = 600; // map drawing size in pixels; it is scaled to fit the screen
const MAP_H = 400;
const TILE = 256;

// Position on the OpenStreetMap "world picture" at zoom level z, in pixels.
const worldPx = (p, z) => {
  const n = TILE * 2 ** z;
  const sin = Math.sin((p.lat * Math.PI) / 180);
  return {
    x: ((p.lng + 180) / 360) * n,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * n,
  };
};

// Map of the loop drawn from OpenStreetMap tiles, with the route on top.
// `marker` is an optional { lat, lng } to highlight (e.g. from the hill chart).
function RouteMap({ line, marker }) {
  // Pick the closest zoom where the whole route fits with some margin.
  let zoom = 17;
  while (zoom > 3) {
    const pts = line.map((p) => worldPx(p, zoom));
    const w = Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x));
    const h = Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y));
    if (w <= MAP_W * 0.85 && h <= MAP_H * 0.85) break;
    zoom--;
  }
  const pts = line.map((p) => worldPx(p, zoom));
  const cx = (Math.max(...pts.map((p) => p.x)) + Math.min(...pts.map((p) => p.x))) / 2;
  const cy = (Math.max(...pts.map((p) => p.y)) + Math.min(...pts.map((p) => p.y))) / 2;
  const left = cx - MAP_W / 2;
  const top = cy - MAP_H / 2;
  const toView = (p) => {
    const w = worldPx(p, zoom);
    return { x: w.x - left, y: w.y - top };
  };

  const tiles = [];
  const maxTile = 2 ** zoom;
  for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + MAP_W) / TILE); tx++) {
    for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + MAP_H) / TILE); ty++) {
      if (ty < 0 || ty >= maxTile) continue;
      const wrappedX = ((tx % maxTile) + maxTile) % maxTile;
      tiles.push({ key: `${tx}-${ty}`, src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${ty}.png`, x: tx * TILE - left, y: ty * TILE - top });
    }
  }

  const path = line.map((p, i) => {
    const v = toView(p);
    return `${i ? 'L' : 'M'}${v.x.toFixed(1)},${v.y.toFixed(1)}`;
  }).join(' ');
  const start = toView(line[0]);
  const mark = marker ? toView(marker) : null;
  const pct = (v, total) => `${(v / total) * 100}%`;

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-800" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
      {tiles.map((tile) => (
        <img
          key={tile.key}
          src={tile.src}
          alt=""
          draggable="false"
          className="absolute max-w-none select-none"
          style={{ left: pct(tile.x, MAP_W), top: pct(tile.y, MAP_H), width: pct(TILE, MAP_W), height: pct(TILE, MAP_H) }}
        />
      ))}
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 w-full h-full pointer-events-none">
        <path d={path} fill="none" stroke="#020617" strokeOpacity="0.5" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path} fill="none" stroke="#10b981" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={start.x} cy={start.y} r="8" fill="#020617" stroke="#34d399" strokeWidth="3" />
        {mark && <circle cx={mark.x} cy={mark.y} r="7" fill="#34d399" stroke="#020617" strokeWidth="3" />}
      </svg>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-0 right-0 bg-white/80 text-slate-700 text-[9px] px-1.5 py-0.5 rounded-tl"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
}

// Height profile of the loop: green area chart, hover or drag to read a point.
function ElevationChart({ profile, low, high, hover, setHover }) {
  const pad = Math.max(10, (50 - (high - low)) / 2); // keep flat routes looking flat
  const yMin = low - pad;
  const yMax = high + pad;
  const total = profile[profile.length - 1].km || 1;
  const x = (km) => (km / total) * 100;
  const y = (m) => 100 - ((m - yMin) / (yMax - yMin)) * 100;
  const line = profile.map((p, i) => `${i ? 'L' : 'M'}${x(p.km).toFixed(2)},${y(p.m).toFixed(2)}`).join(' ');
  const area = `${line} L100,100 L0,100 Z`;

  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    setHover(Math.round(f * (profile.length - 1)));
  };
  const h = hover !== null ? profile[hover] : null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono text-slate-500">
        <span>High {high} m</span>
        <span>Low {low} m</span>
      </div>
      <div
        className="relative h-28 touch-none cursor-crosshair"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <line x1="0" x2="100" y1={y(high)} y2={y(high)} stroke="currentColor" className="text-slate-800" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2="100" y1={y(low)} y2={y(low)} stroke="currentColor" className="text-slate-800" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={area} className="fill-emerald-500/20" />
          <path d={line} fill="none" stroke="currentColor" className="text-emerald-400" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
        {h && (
          <>
            <div className="absolute top-0 bottom-0 w-px bg-slate-400/60 pointer-events-none" style={{ left: `${x(h.km)}%` }} />
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${x(h.km)}%`, top: `${y(h.m)}%` }}
            />
            <div
              className="absolute -top-7 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-100 whitespace-nowrap pointer-events-none -translate-x-1/2"
              style={{ left: `${Math.min(85, Math.max(15, x(h.km)))}%` }}
            >
              {h.km.toFixed(1)} km · {Math.round(h.m)} m
            </div>
          </>
        )}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-500">
        <span>0 km</span>
        <span>{total.toFixed(1)} km</span>
      </div>
    </div>
  );
}

function Tracker({ saved = {}, onDataChange, account }) {
  const t = TEXT;

  const [activeTab, setActiveTab] = useState('tracker');
  const [profileName, setProfileName] = useState(saved.profileName ?? '');

  // Maintenance States
  const [totalChainKm, setTotalChainKm] = useState(saved.totalChainKm ?? 0);
  const [totalTireKm, setTotalTireKm] = useState(saved.totalTireKm ?? 0);
  const [totalGearKm, setTotalGearKm] = useState(saved.totalGearKm ?? 0);
  const [totalBrakeKm, setTotalBrakeKm] = useState(saved.totalBrakeKm ?? 0);
  const [totalDistanceRidden, setTotalDistanceRidden] = useState(saved.totalDistanceRidden ?? 0);
  const [totalTimeMinutes, setTotalTimeMinutes] = useState(saved.totalTimeMinutes ?? 0);
  const [rainRidesCount, setRainRidesCount] = useState(saved.rainRidesCount ?? 0);
  const [chainCleanCount, setChainCleanCount] = useState(saved.chainCleanCount ?? 0);
  const [tireChangeCount, setTireChangeCount] = useState(saved.tireChangeCount ?? 0);
  const [gearChangeCount, setGearChangeCount] = useState(saved.gearChangeCount ?? 0);
  const [brakeCheckCount, setBrakeCheckCount] = useState(saved.brakeCheckCount ?? 0);

  const [kmSinceLastClean, setKmSinceLastClean] = useState(saved.kmSinceLastClean ?? 0);
  const [cleanErrorMsg, setCleanErrorMsg] = useState(null);

  const [kmSinceLastTireChange, setKmSinceLastTireChange] = useState(saved.kmSinceLastTireChange ?? 0);
  const [tireErrorMsg, setTireErrorMsg] = useState(null);

  const [kmSinceLastGearChange, setKmSinceLastGearChange] = useState(saved.kmSinceLastGearChange ?? 0);
  const [gearErrorMsg, setGearErrorMsg] = useState(null);

  const [kmSinceLastBrakeCheck, setKmSinceLastBrakeCheck] = useState(saved.kmSinceLastBrakeCheck ?? 0);
  const [brakeErrorMsg, setBrakeErrorMsg] = useState(null);
  
  const [rideHistory, setRideHistory] = useState(saved.rideHistory ?? []);
  const [xp, setXp] = useState(saved.xp ?? 0);

  // New Ride Form States
  const [distance, setDistance] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [weather, setWeather] = useState('dry');
  const [terrain, setTerrain] = useState('asphalt');

  // Route Planner States
  const [plannerStartLocation, setPlannerStartLocation] = useState('');
  const [autoPlannerAddress, setAutoPlannerAddress] = useState('');
  const [plannerDesiredDistance, setPlannerDesiredDistance] = useState('');
  const [plannerOutboundWaypoint, setPlannerOutboundWaypoint] = useState('');
  const [plannerHomeWaypoint, setPlannerHomeWaypoint] = useState('');
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [plannerErrorMsg, setPlannerErrorMsg] = useState(null);
  const [routeSource, setRouteSource] = useState(null); // 'loop' | 'manual': which planner made the route shown
  const [isFetchingManual, setIsFetchingManual] = useState(false);
  const [manualErrorMsg, setManualErrorMsg] = useState(null);
  const [elevation, setElevation] = useState(null); // null | { status: 'loading' | 'error' } | { status: 'ready', ...data }
  const elevationRequest = useRef(0);
  const [routeHover, setRouteHover] = useState(null); // index into elevation.profile

  const formatDistNum = (kmVal) => Math.round(kmVal * 10) / 10;
  const formatDist = (kmVal) => `${formatDistNum(kmVal)} km`;

  // Shows an "Open route" button in the app and also tries to open Maps
  // straight away. Phones often block tabs opened after a wait, so the
  // button is the reliable way in.
  const showRoute = (points, source) => {
    setRouteSource(source);
    loadElevation(points);
  };

  const loadElevation = async (points) => {
    const id = ++elevationRequest.current; // ignore answers for an older loop
    setElevation({ status: 'loading' });
    setRouteHover(null);
    try {
      const data = await fetchRouteDetails(points);
      if (id === elevationRequest.current) setElevation({ status: 'ready', ...data });
    } catch (err) {
      if (id === elevationRequest.current) setElevation({ status: 'error' });
    }
  };

  const clearLoop = () => {
    elevationRequest.current++;
    setRouteSource(null);
    setElevation(null);
  };

  const handleGenerateGPSLoop = () => {
    const dist = parseFloat(plannerDesiredDistance);
    if (!dist || dist <= 0) return;

    setPlannerErrorMsg(null);
    clearLoop();

    if (!navigator.geolocation) {
      setPlannerErrorMsg(t.gpsNotSupported);
      return;
    }

    // Ask for the location first, while this tab is still visible. Opening
    // the Maps tab before this hid the browser's "Allow location?" prompt,
    // so the lookup never finished.
    setIsFetchingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsFetchingGPS(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        showRoute(buildLoopPoints(lat, lng, dist), 'loop');
      },
      (error) => {
        setIsFetchingGPS(false);
        let errorText = t.locationError;
        if (error.code === 1) {
          errorText = "Location access is blocked. Allow location for this site in your browser settings, or type a start location below.";
        } else if (error.code === 2 || error.code === 3) {
          errorText = "Could not find your location. Try again outside, or type a start location below.";
        }
        setPlannerErrorMsg(errorText);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    );
  };

  const handleGenerateAddressLoop = async () => {
    const dist = parseFloat(plannerDesiredDistance);
    if (!dist || dist <= 0) {
      setPlannerErrorMsg('Enter a desired distance first.');
      return;
    }
    if (!autoPlannerAddress.trim()) {
      setPlannerErrorMsg('Please enter a start location above the button.');
      return;
    }

    setPlannerErrorMsg(null);
    clearLoop();
    setIsFetchingAddress(true);

    try {
      const place = await geocode(autoPlannerAddress);
      if (!place) {
        setIsFetchingAddress(false);
        setPlannerErrorMsg('Could not find the address.');
        return;
      }

      const { lat, lng } = place;

      showRoute(buildLoopPoints(lat, lng, dist), 'loop');
      setIsFetchingAddress(false);

    } catch (err) {
      setIsFetchingAddress(false);
      setPlannerErrorMsg('Network error looking up address.');
    }
  };

  const handleShowManualRoute = async () => {
    const names = [plannerStartLocation, plannerOutboundWaypoint, plannerHomeWaypoint].map((n) => n.trim());
    if (!names[0] || (!names[1] && !names[2])) return;

    setManualErrorMsg(null);
    clearLoop();
    setIsFetchingManual(true);
    try {
      const [start, outbound, home] = await Promise.all(names.map((n) => (n ? geocode(n) : null)));
      const missing = [[start, names[0]], [outbound, names[1]], [home, names[2]]].find(([place, name]) => name && !place);
      if (missing) {
        setManualErrorMsg(`Could not find "${missing[1]}". Try adding the town name.`);
        return;
      }
      showRoute([start, outbound, home, start].filter(Boolean), 'manual');
    } catch (err) {
      setManualErrorMsg('Network error looking up the places.');
    } finally {
      setIsFetchingManual(false);
    }
  };
  const calculateEffectiveWear = (dist, w, t) => {
    let chainMult = 1.0;
    let tireMult = 1.0;
    let gearMult = 1.0;
    let brakeMult = 1.0;

    if (w === 'dry' && t === 'asphalt') {
      chainMult = 1.0; tireMult = 1.0; gearMult = 1.0; brakeMult = 1.0;
    } else if (w === 'rain' && t === 'asphalt') {
      chainMult = 2.0; tireMult = 1.2; gearMult = 1.2; brakeMult = 1.8;
    } else if (w === 'dry' && t === 'gravel') {
      chainMult = 1.5; tireMult = 2.0; gearMult = 1.5; brakeMult = 1.5;
    } else if (w === 'rain' && t === 'gravel') {
      chainMult = 3.0; tireMult = 2.5; gearMult = 2.5; brakeMult = 2.5;
    } else if (w === 'dry' && t === 'mud') {
      chainMult = 2.5; tireMult = 1.2; gearMult = 2.0; brakeMult = 2.2;
    } else if (w === 'rain' && t === 'mud') {
      chainMult = 4.0; tireMult = 1.5; gearMult = 3.5; brakeMult = 3.5;
    }

    return {
      chainKm: Math.round(dist * chainMult),
      tireKm: Math.round(dist * tireMult),
      gearKm: Math.round(dist * gearMult),
      brakeKm: Math.round(dist * brakeMult)
    };
  };

  const handleAddRide = (e) => {
    e.preventDefault();
    const distNumKm = Number(distance);
    if (!distNumKm || distNumKm <= 0) return;

    const hours = Math.min(24, Math.max(0, parseInt(durationHours) || 0));
    const minutes = Math.min(59, Math.max(0, parseInt(durationMinutes) || 0));
    const totalMinutes = hours * 60 + minutes;

    const { chainKm, tireKm, gearKm, brakeKm } = calculateEffectiveWear(distNumKm, weather, terrain);

    setTotalChainKm(prev => prev + chainKm);
    setTotalTireKm(prev => prev + tireKm);
    setTotalGearKm(prev => prev + gearKm);
    setTotalBrakeKm(prev => prev + brakeKm);
    setTotalDistanceRidden(prev => prev + distNumKm);
    setTotalTimeMinutes(prev => prev + totalMinutes);
    setKmSinceLastClean(prev => prev + distNumKm);
    setKmSinceLastTireChange(prev => prev + distNumKm);
    setKmSinceLastGearChange(prev => prev + distNumKm);
    setKmSinceLastBrakeCheck(prev => prev + distNumKm);

    if (weather === 'rain') {
      setRainRidesCount(prev => prev + 1);
    }

    const earnedXp = Math.round(distNumKm);
    setXp(prev => prev + earnedXp);

    const newRide = {
      id: Date.now(),
      distance: distNumKm,
      durationMinutes: totalMinutes,
      weather,
      terrain,
      chainKm,
      tireKm,
      gearKm,
      brakeKm,
      earnedXp,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
    
    setRideHistory([newRide, ...rideHistory]);
    setDistance("");
    setDurationHours("");
    setDurationMinutes("");
  };

  const handleDeleteRide = (id) => {
    const rideToDelete = rideHistory.find(r => r.id === id);
    if (!rideToDelete) return;

    setTotalChainKm(prev => Math.max(0, prev - rideToDelete.chainKm));
    setTotalTireKm(prev => Math.max(0, prev - rideToDelete.tireKm));
    setTotalGearKm(prev => Math.max(0, prev - rideToDelete.gearKm));
    setTotalBrakeKm(prev => Math.max(0, prev - (rideToDelete.brakeKm || 0)));
    setTotalDistanceRidden(prev => Math.max(0, prev - rideToDelete.distance));
    setTotalTimeMinutes(prev => Math.max(0, prev - rideToDelete.durationMinutes));
    setKmSinceLastClean(prev => Math.max(0, prev - rideToDelete.distance));
    setKmSinceLastTireChange(prev => Math.max(0, prev - rideToDelete.distance));
    setKmSinceLastGearChange(prev => Math.max(0, prev - rideToDelete.distance));
    setKmSinceLastBrakeCheck(prev => Math.max(0, prev - rideToDelete.distance));
    
    if (rideToDelete.weather === 'rain') {
      setRainRidesCount(prev => Math.max(0, prev - 1));
    }
    setXp(prev => Math.max(0, prev - rideToDelete.earnedXp));
    
    setRideHistory(rideHistory.filter(r => r.id !== id));
  };

  const handleCleanChain = () => {
    if (kmSinceLastClean >= MIN_CHAIN_XP_KM) {
      setChainCleanCount(prev => prev + 1);
      setTotalChainKm(0);
      setKmSinceLastClean(0);
      setXp(prev => prev + 100);
      setCleanErrorMsg({ type: 'success', text: 'Chain cleaned! You received +100 XP.' });
    } else {
      setTotalChainKm(0);
      setKmSinceLastClean(0);
      setCleanErrorMsg({ type: 'error', text: `Chain reset without XP (requires ${MIN_CHAIN_XP_KM} km).` });
    }
  };

  const handleResetTires = () => {
    if (kmSinceLastTireChange >= MIN_TIRE_XP_KM) {
      setTireChangeCount(prev => prev + 1);
      setTotalTireKm(0);
      setKmSinceLastTireChange(0);
      setXp(prev => prev + 200);
      setTireErrorMsg({ type: 'success', text: 'Tires changed! You received +200 XP.' });
    } else {
      setTotalTireKm(0);
      setKmSinceLastTireChange(0);
      setTireErrorMsg({ type: 'error', text: `Tires reset without XP (requires ${MIN_TIRE_XP_KM} km).` });
    }
  };

  const handleResetGears = () => {
    if (kmSinceLastGearChange >= MIN_GEAR_XP_KM) {
      setGearChangeCount(prev => prev + 1);
      setTotalGearKm(0);
      setKmSinceLastGearChange(0);
      setXp(prev => prev + 300);
      setGearErrorMsg({ type: 'success', text: 'Gears changed! You received +300 XP.' });
    } else {
      setTotalGearKm(0);
      setKmSinceLastGearChange(0);
      setGearErrorMsg({ type: 'error', text: `Gears reset without XP (requires ${MIN_GEAR_XP_KM} km).` });
    }
  };

  const handleResetBrakes = () => {
    if (kmSinceLastBrakeCheck >= MIN_BRAKE_XP_KM) {
      setBrakeCheckCount(prev => prev + 1);
      setTotalBrakeKm(0);
      setKmSinceLastBrakeCheck(0);
      setXp(prev => prev + 150);
      setBrakeErrorMsg({ type: 'success', text: 'Brakes checked/changed! You received +150 XP.' });
    } else {
      setTotalBrakeKm(0);
      setKmSinceLastBrakeCheck(0);
      setBrakeErrorMsg({ type: 'error', text: `Brakes reset without XP (requires ${MIN_BRAKE_XP_KM} km).` });
    }
  };

  // Everything that belongs to the rider's profile. Sent to the parent so it
  // can be saved online whenever something changes.
  useEffect(() => {
    onDataChange?.({ profileName, totalChainKm, totalTireKm, totalGearKm, totalBrakeKm, totalDistanceRidden, totalTimeMinutes, rainRidesCount, chainCleanCount, tireChangeCount, gearChangeCount, brakeCheckCount, kmSinceLastClean, kmSinceLastTireChange, kmSinceLastGearChange, kmSinceLastBrakeCheck, rideHistory, xp });
  }, [profileName, totalChainKm, totalTireKm, totalGearKm, totalBrakeKm, totalDistanceRidden, totalTimeMinutes, rainRidesCount, chainCleanCount, tireChangeCount, gearChangeCount, brakeCheckCount, kmSinceLastClean, kmSinceLastTireChange, kmSinceLastGearChange, kmSinceLastBrakeCheck, rideHistory, xp]);

  // Map, numbers and hill graph for the route being shown.
  const routeCard = elevation && (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
        <Mountain className="w-4 h-4" /> {routeSource === 'loop' ? 'Your loop' : 'Your route'}
      </div>
      {elevation.status === 'loading' && (
        <p className="text-xs text-slate-400">Loading map and hills...</p>
      )}
      {elevation.status === 'error' && (
        <p className="text-xs text-rose-300">Could not load the map and hills. Check your internet and try again.</p>
      )}
      {elevation.status === 'ready' && (
        <>
          <RouteMap line={elevation.line} marker={routeHover !== null ? elevation.profile[routeHover] : null} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            {[
              ['Distance', `${formatDistNum(elevation.distanceKm)} km`],
              ['Climb', `↑ ${elevation.climb} m`],
              ['Descent', `↓ ${elevation.descent} m`],
              ['Highest', `${elevation.high} m`],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-900 rounded-lg p-2 border border-slate-800/60 min-w-0">
                <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
                <div className="text-[11px] font-bold text-slate-100 whitespace-nowrap">{value}</div>
              </div>
            ))}
          </div>
          <ElevationChart profile={elevation.profile} low={elevation.low} high={elevation.high} hover={routeHover} setHover={setRouteHover} />
          <p className="text-[10px] text-slate-500">Bike route from OpenStreetMap. Touch the hill graph to see that spot on the map.</p>
        </>
      )}
    </div>
  );

  const currentLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoCurrentLevel = xp % XP_PER_LEVEL;

  const hasMudWarrior = rideHistory.some(r => r.weather === 'rain' && (r.terrain === 'mud' || r.terrain === 'gravel'));
  const hasCentury = rideHistory.some(r => r.distance >= 100);
  const hasFirstRide = rideHistory.length > 0;
  const hasIronChain = totalDistanceRidden >= 500;
  const hasWeatherVeteran = rainRidesCount >= 5;
  const hasCleanFreak = chainCleanCount >= 1;
  const hasTireMaster = tireChangeCount >= 1;
  const hasGearGuru = gearChangeCount >= 1;

  const hasSpeedster = rideHistory.some(r => {
    if (!r.durationMinutes || r.durationMinutes <= 0) return false;
    const hoursDecimal = r.durationMinutes / 60;
    const speedKmH = r.distance / hoursDecimal;
    return speedKmH > 30;
  });
  const hasHatTrick = rideHistory.length >= 3;
  const hasExplorer = rideHistory.length >= 10;
  const hasMarathon = totalDistanceRidden >= 1000;
  const hasBrakeMaster = brakeCheckCount >= 1;
  const hasTrailblazer = rideHistory.some(r => r.terrain === 'mud');
  const hasCenturyDouble = rideHistory.some(r => r.distance >= 200);
  const hasGrandMaster = currentLevel >= 10;

  const badgesList = [
    { id: 'first', icon: <Compass className="w-4 h-4 text-emerald-400" />, unlocked: hasFirstRide, ...t.badges.first },
    { id: 'mud', icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />, unlocked: hasMudWarrior, ...t.badges.mud },
    { id: 'century', icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, unlocked: hasCentury, ...t.badges.century },
    { id: 'clean', icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, unlocked: hasCleanFreak, ...t.badges.clean },
    { id: 'veteran', icon: <CloudRain className="w-4 h-4 text-emerald-400" />, unlocked: hasWeatherVeteran, ...t.badges.veteran },
    { id: 'iron', icon: <Flame className="w-4 h-4 text-emerald-400" />, unlocked: hasIronChain, ...t.badges.iron },
    { id: 'tire', icon: <CircleDashed className="w-4 h-4 text-emerald-400" />, unlocked: hasTireMaster, ...t.badges.tire },
    { id: 'gear', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, unlocked: hasGearGuru, ...t.badges.gear },
    { id: 'speedster', icon: <Zap className="w-4 h-4 text-emerald-400" />, unlocked: hasSpeedster, ...t.badges.speedster },
    { id: 'hatTrick', icon: <Clock className="w-4 h-4 text-emerald-400" />, unlocked: hasHatTrick, ...t.badges.hatTrick },
    { id: 'explorer', icon: <MapPin className="w-4 h-4 text-emerald-400" />, unlocked: hasExplorer, ...t.badges.explorer },
    { id: 'marathon', icon: <Award className="w-4 h-4 text-emerald-400" />, unlocked: hasMarathon, ...t.badges.marathon },
    { id: 'brakeMaster', icon: <Settings className="w-4 h-4 text-emerald-400" />, unlocked: hasBrakeMaster, ...t.badges.brakeMaster },
    { id: 'trailblazer', icon: <Mountain className="w-4 h-4 text-emerald-400" />, unlocked: hasTrailblazer, ...t.badges.trailblazer },
    { id: 'centuryDouble', icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, unlocked: hasCenturyDouble, ...t.badges.centuryDouble },
    { id: 'grandMaster', icon: <Sparkles className="w-4 h-4 text-emerald-400" />, unlocked: hasGrandMaster, ...t.badges.grandMaster }
  ];

  const getProgressProps = (current, max) => {
    const percentage = Math.min((current / max) * 100, 100);
    let colorClass = 'bg-emerald-500';
    if (percentage >= 50) colorClass = 'bg-amber-400';
    if (percentage >= 85) colorClass = 'bg-rose-500';
    return { percentage, colorClass };
  };

  const formatTotalTime = (totalMins) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  const chainStatus = getProgressProps(totalChainKm, MAX_CHAIN_KM);
  const tireStatus = getProgressProps(totalTireKm, MAX_TIRE_KM);
  const gearStatus = getProgressProps(totalGearKm, MAX_GEAR_KM);
  const brakeStatus = getProgressProps(totalBrakeKm, MAX_BRAKE_KM);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-16">
      <div className="max-w-md mx-auto p-4 md:pt-6 space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
              <Bike className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white uppercase font-mono">
                Bike <span className="text-emerald-400">Tracker</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-md">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-amber-300 font-mono">{xp} XP</span>
            </div>
          </div>
        </header>

        {account && (
          <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 truncate">{account.email}</span>
              <span className={`shrink-0 font-mono ${account.saveStatus === 'error' ? 'text-rose-300' : 'text-slate-500'}`}>
                {account.saveStatus === 'saving' ? 'Saving...' : account.saveStatus === 'error' ? 'Not saved!' : 'Saved'}
              </span>
            </div>
            <button
              onClick={account.onLogout}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-300 font-bold shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Log out
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tracker'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>{t.maintenanceTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'planner'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{t.plannerTab}</span>
          </button>
        </div>

        {activeTab === 'tracker' ? (
          <>
            {/* Profile & XP Progress Card */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 rounded-3xl p-5 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="grid grid-cols-2 gap-3 items-center mb-4">
                <div>
                  <input 
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder={t.riderName}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors font-mono placeholder:text-slate-500"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">{t.level}</span>
                  <h2 className="text-lg font-black text-white mt-0.5">{currentLevel}</h2>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 mb-4 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    <Compass className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">{t.totalDistance}</span>
                    <span className="text-xl font-black text-white font-mono">{formatDistNum(totalDistanceRidden)} <span className="text-sm font-semibold text-emerald-400">km</span></span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                  <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                     <Timer className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">{t.totalTime}</span>
                    <span className="text-xl font-black text-white font-mono">{formatTotalTime(totalTimeMinutes)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium">
                  <span>{t.nextLevel}</span>
                  <span className="font-mono">{xpIntoCurrentLevel} / {XP_PER_LEVEL} XP</span>
                </div>
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min((xpIntoCurrentLevel / XP_PER_LEVEL) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2.5">
                  <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> {t.trophies}
                  </p>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {badgesList.filter(b => b.unlocked).length} / {badgesList.length} {t.unlocked}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {badgesList.map((badge) => {
                    return (
                      <div 
                        key={badge.id}
                        title={`${badge.name}: ${badge.desc}`}
                        className={`p-2.5 rounded-2xl text-xs font-medium border transition-all flex flex-col items-center justify-center gap-1.5 cursor-help ${
                          badge.unlocked 
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 shadow-sm shadow-emerald-500/10' 
                            : 'bg-slate-950/50 border-slate-900 text-slate-600 opacity-50'
                        }`}
                      >
                        {badge.icon}
                        <span className="text-[10px] leading-tight font-semibold truncate w-full">{badge.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Ride Registration Form */}
            <section className="bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-800">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-400" />
                {t.registerRide}
              </h2>

              <form onSubmit={handleAddRide} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">{t.distanceLabel} (km)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-base font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono placeholder:text-slate-500"
                    min="0.1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-emerald-400" /> {t.durationLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input 
                        type="number" 
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value)}
                        placeholder={t.hoursPlaceholder}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 font-mono placeholder:text-slate-500"
                        min="0"
                        max="24"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono">{t.hoursMax}</span>
                    </div>
                    <div>
                      <input 
                        type="number" 
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        placeholder={t.minutesPlaceholder}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 font-mono placeholder:text-slate-500"
                        min="0"
                        max="59"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono">{t.minutesMax}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-emerald-400" /> {t.weatherLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'dry', label: `☀️ ${t.dry}` },
                      { id: 'rain', label: `🌧️ ${t.rain}` }
                    ].map((wObj) => (
                      <button
                        type="button"
                        key={wObj.id}
                        onClick={() => setWeather(wObj.id)}
                        className={`py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
                          weather === wObj.id 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 font-bold' 
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {wObj.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-emerald-400" /> {t.terrainLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'asphalt', label: `🛣 ${t.asphalt}` },
                      { id: 'gravel', label: `🪨 ${t.gravel}` },
                      { id: 'mud', label: `🤎 ${t.mud}` }
                    ].map((tObj) => (
                      <button
                        type="button"
                        key={tObj.id}
                        onClick={() => setTerrain(tObj.id)}
                        className={`py-2.5 rounded-2xl text-sm font-semibold transition-all border ${
                          terrain === tObj.id 
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 font-bold' 
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {tObj.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 px-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  <span>{t.addRideBtn} (1 XP / km)</span>
                  <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                </button>
              </form>
            </section>

            {/* Dashboard Components Health Overview */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-white px-1">{t.componentHealth}</h2>

              {/* 1. Chain gauge */}
              <div className="bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Vedligeholdelse</span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-400" /> {t.chain}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 font-mono">{formatDistNum(totalChainKm)}</span>
                    <span className="text-xs text-emerald-400 font-mono"> / {MAX_CHAIN_KM} km</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden mb-3 p-0.5 border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${chainStatus.colorClass}`}
                    style={{ width: `${chainStatus.percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 mb-3 px-1 font-medium font-mono">
                  <span>{t.sinceLast}: {formatDist(kmSinceLastClean)}</span>
                  <span>{t.xpReq}: {MIN_CHAIN_XP_KM} km</span>
                </div>

                {cleanErrorMsg && (
                  <div className={`border rounded-2xl p-3 mb-3 flex items-start gap-2.5 ${
                    cleanErrorMsg.type === 'success' 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' 
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  }`}>
                    {cleanErrorMsg.type === 'success' ? (
                      <span className="text-lg leading-none shrink-0 mt-0.5">👍</span>
                    ) : (
                      <span className="text-lg leading-none shrink-0 mt-0.5">👎</span>
                    )}
                    <p className="text-xs leading-relaxed">{cleanErrorMsg.text}</p>
                  </div>
                )}

                <button 
                  onClick={handleCleanChain}
                  className="w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200 shadow-md"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.cleanChainBtn} (+100 XP at {MIN_CHAIN_XP_KM}+ km)</span>
                </button>
              </div>

              {/* 2. Tire gauge */}
              <div className="bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Udskiftning</span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CircleDashed className="w-4 h-4 text-emerald-400" /> {t.tires}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 font-mono">{formatDistNum(totalTireKm)}</span>
                    <span className="text-xs text-emerald-400 font-mono"> / {MAX_TIRE_KM} km</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden mb-3 p-0.5 border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${tireStatus.colorClass}`}
                    style={{ width: `${tireStatus.percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 mb-3 px-1 font-medium font-mono">
                  <span>{t.sinceLast}: {formatDist(kmSinceLastTireChange)}</span>
                  <span>{t.xpReq}: {MIN_TIRE_XP_KM} km</span>
                </div>

                {tireErrorMsg && (
                  <div className={`border rounded-2xl p-3 mb-3 flex items-start gap-2.5 ${
                    tireErrorMsg.type === 'success' 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' 
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  }`}>
                    {tireErrorMsg.type === 'success' ? (
                      <span className="text-lg leading-none shrink-0 mt-0.5">👍</span>
                    ) : (
                      <span className="text-lg leading-none shrink-0 mt-0.5">👎</span>
                    )}
                    <p className="text-xs leading-relaxed">{tireErrorMsg.text}</p>
                  </div>
                )}

                <button 
                  onClick={handleResetTires}
                  className="w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200 shadow-md"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.changeTiresBtn} (+200 XP at {MIN_TIRE_XP_KM}+ km)</span>
                </button>
              </div>

              {/* 3. Gear gauge */}
              <div className="bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Udskiftning</span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-400" /> {t.gears}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 font-mono">{formatDistNum(totalGearKm)}</span>
                    <span className="text-xs text-emerald-400 font-mono"> / {MAX_GEAR_KM} km</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden mb-3 p-0.5 border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${gearStatus.colorClass}`}
                    style={{ width: `${gearStatus.percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 mb-3 px-1 font-medium font-mono">
                  <span>{t.sinceLast}: {formatDist(kmSinceLastGearChange)}</span>
                  <span>{t.xpReq}: {MIN_GEAR_XP_KM} km</span>
                </div>

                {gearErrorMsg && (
                  <div className={`border rounded-2xl p-3 mb-3 flex items-start gap-2.5 ${
                    gearErrorMsg.type === 'success' 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' 
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  }`}>
                    {gearErrorMsg.type === 'success' ? (
                      <span className="text-lg leading-none shrink-0 mt-0.5">👍</span>
                    ) : (
                      <span className="text-lg leading-none shrink-0 mt-0.5">👎</span>
                    )}
                    <p className="text-xs leading-relaxed">{gearErrorMsg.text}</p>
                  </div>
                )}

                <button 
                  onClick={handleResetGears}
                  className="w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200 shadow-md"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.changeGearsBtn} (+300 XP at {MIN_GEAR_XP_KM}+ km)</span>
                </button>
              </div>

              {/* 4. Disc brake gauge */}
              <div className="bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Vedligeholdelse</span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" /> {t.brakes}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 font-mono">{formatDistNum(totalBrakeKm)}</span>
                    <span className="text-xs text-emerald-400 font-mono"> / {MAX_BRAKE_KM} km</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden mb-3 p-0.5 border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${brakeStatus.colorClass}`}
                    style={{ width: `${brakeStatus.percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 mb-3 px-1 font-medium font-mono">
                  <span>{t.sinceLast}: {formatDist(kmSinceLastBrakeCheck)}</span>
                  <span>{t.xpReq}: {MIN_BRAKE_XP_KM} km</span>
                </div>

                {brakeErrorMsg && (
                  <div className={`border rounded-2xl p-3 mb-3 flex items-start gap-2.5 ${
                    brakeErrorMsg.type === 'success' 
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' 
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                  }`}>
                    {brakeErrorMsg.type === 'success' ? (
                      <span className="text-lg leading-none shrink-0 mt-0.5">👍</span>
                    ) : (
                      <span className="text-lg leading-none shrink-0 mt-0.5">👎</span>
                    )}
                    <p className="text-xs leading-relaxed">{brakeErrorMsg.text}</p>
                  </div>
                )}

                <button 
                  onClick={handleResetBrakes}
                  className="w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 border bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200 shadow-md"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.checkBrakesBtn} (+150 XP at {MIN_BRAKE_XP_KM}+ km)</span>
                </button>
              </div>
            </section>

            {/* Ride History Log */}
            <section className="bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-800">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                {t.rideHistory} ({rideHistory.length})
              </h2>
              {rideHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm font-medium border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  {t.noRides}
                </div>
              ) : (
                <div className="space-y-3">
                  {rideHistory.map((ride) => {
                    const h = Math.floor(ride.durationMinutes / 60);
                    const m = ride.durationMinutes % 60;
                    const durationStr = ride.durationMinutes > 0 ? (h > 0 ? `${h}h ${m}m` : `${m} min`) : 'Not specified';
                    
                    let avgSpeed = null;
                    if (ride.durationMinutes > 0 && ride.distance > 0) {
                      const hoursDecimal = ride.durationMinutes / 60;
                      const speedKmH = ride.distance / hoursDecimal;
                      avgSpeed = speedKmH.toFixed(1);
                    }

                    return (
                      <div key={ride.id} className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2.5 relative group shadow-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-base text-white font-mono">{formatDistNum(ride.distance)} km</span>
                            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-500/20 font-mono">+{ride.earnedXp} XP</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-medium font-mono">{ride.date}</span>
                            <button 
                              onClick={() => handleDeleteRide(ride.id)}
                              title={t.deleteRide}
                              className="text-slate-500 hover:text-rose-400 bg-slate-900 hover:bg-rose-500/10 p-1.5 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 text-xs items-center justify-between">
                          <div className="flex gap-1.5">
                            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-300 font-medium">{t[ride.weather]}</span>
                            <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-300 font-medium">{t[ride.terrain]}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {ride.durationMinutes > 0 && (
                              <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
                                <Timer className="w-3.5 h-3.5 text-emerald-400" /> {durationStr}
                              </span>
                            )}
                            {avgSpeed && (
                              <span className="text-emerald-300 font-mono text-xs font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                <Gauge className="w-3.5 h-3.5 text-emerald-400" /> {avgSpeed} km/h
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-1 font-mono">
                          <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/50">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">{t.chain}</span>
                            <span className="text-xs font-bold text-emerald-400">+{formatDistNum(ride.chainKm)} km</span>
                          </div>
                          <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/50">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">{t.tires}</span>
                            <span className="text-xs font-bold text-emerald-400">+{formatDistNum(ride.tireKm)} km</span>
                          </div>
                          <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/50">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">{t.gears}</span>
                            <span className="text-xs font-bold text-emerald-400">+{formatDistNum(ride.gearKm)} km</span>
                          </div>
                          <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/50">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold">{t.brakes}</span>
                            <span className="text-xs font-bold text-emerald-400">+{formatDistNum(ride.brakeKm || 0)} km</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          /* Route Planner Tab */
          <section className="bg-slate-900 rounded-3xl p-5 shadow-xl border border-slate-800 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                {t.plannerTitle}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.plannerDesc}
              </p>
            </div>

            <div className="space-y-6">
              
              {/* GPS Auto Loop Generator */}
              <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 font-mono flex items-center gap-1.5">
                    <Compass className="w-4 h-4" /> {t.desiredDistance} (km)
                  </label>
                  <input 
                    type="number"
                    step="any"
                    value={plannerDesiredDistance}
                    onChange={(e) => { setPlannerDesiredDistance(e.target.value); setPlannerErrorMsg(null); clearLoop(); }}
                    placeholder={t.desiredDistancePlaceholder}
                    className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-100 text-sm font-semibold focus:outline-none focus:border-emerald-500 font-mono placeholder:text-slate-600 shadow-inner"
                    min="1"
                  />
                </div>

                <button
                  onClick={handleGenerateGPSLoop}
                  disabled={isFetchingGPS || !plannerDesiredDistance}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 py-3.5 px-4 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>{isFetchingGPS ? t.fetchingLocation : t.gpsLoopBtn}</span>
                </button>

                <div className="pt-3 mt-3 border-t border-emerald-500/20 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5 font-mono">
                      {t.autoAddressFallback}
                    </label>
                    <input 
                      type="text"
                      value={autoPlannerAddress}
                      onChange={(e) => { setAutoPlannerAddress(e.target.value); setPlannerErrorMsg(null); }}
                      placeholder={t.autoAddressPlaceholder}
                      className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-emerald-100 text-sm font-semibold focus:outline-none focus:border-emerald-500 font-mono placeholder:text-slate-600 shadow-inner"
                    />
                  </div>

                  <button
                    onClick={handleGenerateAddressLoop}
                    disabled={isFetchingAddress || !plannerDesiredDistance}
                    className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-400 py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border border-emerald-500/30"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{isFetchingAddress ? "Looking up address..." : t.generateFromAddressBtn}</span>
                  </button>
                </div>

                {routeSource === 'loop' && routeCard}

                {plannerErrorMsg && (
                  <div className="border p-3 rounded-xl flex items-start gap-2.5 mt-4 bg-rose-500/15 border-rose-500/40 text-rose-200">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed font-medium">{plannerErrorMsg}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">{t.manualPlanner}</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              {/* Manual Route Builder */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {t.startLocation}
                  </label>
                  <input 
                    type="text"
                    value={plannerStartLocation}
                    onChange={(e) => setPlannerStartLocation(e.target.value)}
                    placeholder={t.startPlaceholder}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 font-mono placeholder:text-slate-600 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {t.outboundWaypoint}
                  </label>
                  <input 
                    type="text"
                    value={plannerOutboundWaypoint}
                    onChange={(e) => setPlannerOutboundWaypoint(e.target.value)}
                    placeholder={t.outboundPlaceholder}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 font-mono placeholder:text-slate-600 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {t.homeWaypoint}
                  </label>
                  <input 
                    type="text"
                    value={plannerHomeWaypoint}
                    onChange={(e) => setPlannerHomeWaypoint(e.target.value)}
                    placeholder={t.homePlaceholder}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 font-mono placeholder:text-slate-600 shadow-inner"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleShowManualRoute}
                disabled={isFetchingManual || !plannerStartLocation.trim() || (!plannerOutboundWaypoint.trim() && !plannerHomeWaypoint.trim())}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-slate-700 py-3.5 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>{isFetchingManual ? 'Finding places...' : t.openMapBtn}</span>
              </button>

              {manualErrorMsg && (
                <div className="border p-3 rounded-xl flex items-start gap-2.5 bg-rose-500/15 border-rose-500/40 text-rose-200">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">{manualErrorMsg}</p>
                </div>
              )}

              {routeSource === 'manual' && routeCard}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Online accounts and saving (Supabase)
//
// Fill in the two values below from your Supabase project
// (Project Settings -> API). The "anon public" key is meant to be public;
// the database rules below make sure each person can only see their own data.
// While they are empty the app runs without login and nothing is saved.
//
// Run this once in Supabase -> SQL Editor:
//
//   create table public.profiles (
//     id uuid primary key references auth.users on delete cascade,
//     data jsonb not null default '{}'::jsonb,
//     updated_at timestamptz not null default now()
//   );
//   alter table public.profiles enable row level security;
//   create policy "Read own profile" on public.profiles
//     for select using (auth.uid() = id);
//   create policy "Create own profile" on public.profiles
//     for insert with check (auth.uid() = id);
//   create policy "Update own profile" on public.profiles
//     for update using (auth.uid() = id) with check (auth.uid() = id);
// ---------------------------------------------------------------------------
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
const CLOUD_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const SESSION_STORAGE_KEY = 'bike-tracker-session';

const readStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch {
    return null;
  }
};

const storeSession = (session) => {
  try {
    if (session) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Private mode etc.: you just have to log in again next time.
  }
};

const supabaseFetch = async (path, { method = 'GET', body, token, headers = {} } = {}) => {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.msg || data?.error_description || data?.message || `Error ${res.status}`);
  }
  return data;
};

// Supabase answers a login with tokens; keep what we need.
const toSession = (data) => ({
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
  expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
  user: { id: data.user.id, email: data.user.email },
});

const cloud = {
  async signUp(email, password) {
    const data = await supabaseFetch('/auth/v1/signup', { method: 'POST', body: { email, password } });
    // When e-mail confirmation is on, there is no login yet.
    return data?.access_token ? toSession(data) : null;
  },
  async signIn(email, password) {
    return toSession(await supabaseFetch('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }));
  },
  async signOut(session) {
    try {
      await supabaseFetch('/auth/v1/logout', { method: 'POST', token: session.accessToken });
    } catch {
      // Logging out locally is enough.
    }
  },
  // Login tokens expire after an hour; swap for a fresh one shortly before.
  async freshSession(session) {
    if (session.expiresAt - 60 > Date.now() / 1000) return session;
    const next = toSession(await supabaseFetch('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refreshToken } }));
    storeSession(next);
    return next;
  },
  async loadProfile(session) {
    const rows = await supabaseFetch(`/rest/v1/profiles?id=eq.${session.user.id}&select=data`, { token: session.accessToken });
    return rows?.[0]?.data ?? {};
  },
  async saveProfile(session, data) {
    await supabaseFetch('/rest/v1/profiles', {
      method: 'POST',
      token: session.accessToken,
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: { id: session.user.id, data, updated_at: new Date().toISOString() },
    });
  },
};

const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-base font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-slate-500";

function LoginScreen({ onLoggedIn }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'error' | 'info', text }

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (mode === 'signup') {
        const session = await cloud.signUp(email.trim(), password);
        if (session) onLoggedIn(session);
        else {
          setMode('login');
          setMessage({ type: 'info', text: 'Account created! Check your e-mail and click the link, then log in here.' });
        }
      } else {
        onLoggedIn(await cloud.signIn(email.trim(), password));
      }
    } catch (err) {
      const text = /invalid login/i.test(err.message) ? 'Wrong e-mail or password.'
        : /not confirmed/i.test(err.message) ? 'Please click the link in your e-mail first.'
        : /already registered/i.test(err.message) ? 'That e-mail already has an account. Log in instead.'
        : `Something went wrong: ${err.message}`;
      setMessage({ type: 'error', text });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/30">
            <Bike className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white uppercase font-mono">
            Bike <span className="text-emerald-400">Tracker</span>
          </h1>
        </div>

        <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-white">{mode === 'login' ? 'Log in' : 'Create account'}</h2>
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">E-mail</label>
            <input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Password</label>
            <input id="login-password" type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 6 characters' : ''} className={inputClass} />
          </div>

          {message && (
            <p className={`text-xs leading-relaxed rounded-xl p-3 border ${message.type === 'error' ? 'bg-rose-500/15 border-rose-500/40 text-rose-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`}>
              {message.text}
            </p>
          )}

          <button type="submit" disabled={busy} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95">
            {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }}
            className="w-full text-xs text-slate-400 hover:text-emerald-300"
          >
            {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Decides what to show: login screen, loading, or the tracker with the
// rider's saved data. Saves changes online about a second after they happen.
export default function App() {
  const [session, setSession] = useState(() => (CLOUD_ENABLED ? readStoredSession() : null));
  const [saved, setSaved] = useState(null); // the rider's data once loaded
  const [loadError, setLoadError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const sessionRef = useRef(session);
  const saveTimer = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    sessionRef.current = session;
    if (!session) return;
    let cancelled = false;
    loaded.current = false;
    setSaved(null);
    setLoadError(null);
    (async () => {
      try {
        const fresh = await cloud.freshSession(session);
        if (fresh !== session) {
          if (!cancelled) setSession(fresh);
          return; // runs again with the fresh session
        }
        const data = await cloud.loadProfile(fresh);
        if (!cancelled) setSaved(data);
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [session?.accessToken]);

  const handleLoggedIn = (next) => {
    storeSession(next);
    setSession(next);
  };

  const handleLogout = async () => {
    clearTimeout(saveTimer.current);
    const old = sessionRef.current;
    storeSession(null);
    setSession(null);
    setSaved(null);
    if (old) cloud.signOut(old);
  };

  const handleDataChange = (data) => {
    if (!sessionRef.current) return;
    // The first call is just the data we loaded; nothing new to save.
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    setSaveStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const fresh = await cloud.freshSession(sessionRef.current);
        sessionRef.current = fresh;
        await cloud.saveProfile(fresh, data);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 1000);
  };

  if (!CLOUD_ENABLED) return <Tracker />;
  if (!session) return <LoginScreen onLoggedIn={handleLoggedIn} />;

  if (loadError || !saved) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-sm">
          {loadError ? (
            <>
              <p className="text-sm text-rose-200">Could not load your data. Check your internet and try again.</p>
              <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-emerald-300 underline">Log out</button>
            </>
          ) : (
            <p className="text-sm text-slate-400">Loading your rides...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Tracker
      key={session.user.id}
      saved={saved}
      onDataChange={handleDataChange}
      account={{ email: session.user.email, saveStatus, onLogout: handleLogout }}
    />
  );
}
