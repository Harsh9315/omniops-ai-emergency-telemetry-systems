import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { 
  FaExclamationTriangle, 
  FaHospital, 
  FaSatellite, 
  FaBroadcastTower,
  FaShieldAlt,
  FaRoute,
  FaUserCog,
  FaPlay,
  FaTrafficLight,
  FaMobileAlt,
  FaNetworkWired,
  FaUserShield,
  FaBed,
  FaCamera,
  FaFileCsv,
  FaDirections
} from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import './App.css';

// MAP RESIZE AUTO-FIX HOOK
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Leaflet Default Icon Bug Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// CUSTOM HIGH-TECH NEON MARKERS
const createCustomIcon = (color, pulseClass = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px ${color}, 0 0 20px ${color};
        position: relative;
      " class="${pulseClass}"></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

const incidentIcon = createCustomIcon('#ef4444', 'pulse-glow');
const hospitalIcon = createCustomIcon('#3b82f6');

const greenSignalIcon = L.divIcon({
  className: 'custom-signal-marker',
  html: `
    <div style="
      background: #10b981;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 15px #10b981, 0 0 25px #34d399;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #fff;
    " class="pulse-glow">🚦</div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const ambulanceIcon = L.divIcon({
  className: 'custom-ambulance-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #10b981, #047857);
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 15px #10b981, 0 0 25px rgba(16, 185, 129, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #ffffff;
    " class="pulse-glow">
      🚑
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19]
});

function App() {
  const [incidents, setIncidents] = useState([]);
  const [hospitals, setHospitals] = useState([
    { id: 1, name: "Max Super Speciality & Trauma Center", latitude: 28.6304, longitude: 77.3200, availableIcuBeds: 14, district: "Ghaziabad/Noida Border" },
    { id: 2, name: "Fortis Hospital (Sector 62)", latitude: 28.6280, longitude: 77.3640, availableIcuBeds: 9, district: "Noida Sec 62" },
    { id: 3, name: "District Civil Hospital (Ghaziabad)", latitude: 28.6692, longitude: 77.4538, availableIcuBeds: 24, district: "Ghaziabad Central" }
  ]);
  
  const [ambPos, setAmbPos] = useState([28.6692, 77.4538]);
  const [isSimulating, setIsSimulating] = useState(false);
  const animIntervalRef = useRef(null);

  // Form States
  const [source, setSource] = useState('CCTV AI Detection');
  const [severity, setSeverity] = useState('HIGH');
  const [lat, setLat] = useState('28.6600');
  const [lng, setLng] = useState('77.4200');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Route, Turn-by-Turn & Smart Triage State
  const [activeRoute, setActiveRoute] = useState(null);
  const [signalPoints, setSignalPoints] = useState([]);
  const [triageInfo, setTriageInfo] = useState(null);
  const [navigationInstruction, setNavigationInstruction] = useState("Awaiting emergency dispatch routing...");

  // RBAC Roles & Views ('command' | 'hospital' | 'public' | 'telemetry')
  const [activeRole, setActiveRole] = useState('command'); 
  const [publicStatus, setPublicStatus] = useState('');

  // Public Citizen Report Form State
  const [citizenDesc, setCitizenDesc] = useState('');
  const [citizenImage, setCitizenImage] = useState(null);
  const [citizenStatus, setCitizenStatus] = useState('');
  
  // Simulated Webhook Stream Log State
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 1, time: '10:00:12', type: 'INFO', msg: 'WebSocket Gateway initialized. Listening to edge microservices.' },
    { id: 2, time: '10:00:15', type: 'SUCCESS', msg: 'OSRM routing matrix & Fast2SMS gateway service connected.' }
  ]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const incRes = await axios.get('http://localhost:8080/api/incidents').catch(() => null);
      if (incRes && incRes.data) setIncidents(incRes.data);
    } catch (error) {
      // Local distributed memory fallback
    }
  };

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log("Audio suppressed");
    }
  };

  const logTelemetry = (type, msg) => {
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type,
      msg
    };
    setTelemetryLogs(prev => [newLog, ...prev.slice(0, 20)]);
  };

  const triggerSmsAlert = (incidentSource, coordinates) => {
    logTelemetry('SUCCESS', `[Fast2SMS Gateway] Automated emergency alert dispatched to 108 Ambulance & Nearest Traffic Police Node`);
  };

  const handleTriggerSOS = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    playAlertSound();

    logTelemetry('WARN', `Event Ingested via ${source} [Lat: ${lat}, Lng: ${lng}]`);

    const newIncident = {
      id: Date.now(),
      source,
      severity,
      status: 'DISPATCHED',
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      timestamp: new Date().toLocaleTimeString()
    };

    setTimeout(() => {
      setIncidents((prev) => [newIncident, ...prev]);
      setIsSubmitting(false);
      triggerSmsAlert(source, `${lat}, ${lng}`);
      logTelemetry('SUCCESS', `Incident #${newIncident.id} processed by Event-Driven Triage Engine.`);
    }, 400);
  };

  const handleCitizenSubmit = (e) => {
    e.preventDefault();
    playAlertSound();
    setCitizenStatus('Uploading evidence and geotagging incident packet...');
    logTelemetry('INFO', 'Crowdsourced public incident report submitted with media attachment.');

    setTimeout(() => {
      const citizenIncident = {
        id: Date.now(),
        source: 'Citizen Crowdsource / PWA',
        severity: 'MEDIUM',
        status: 'DISPATCHED',
        latitude: 28.6500 + (Math.random() * 0.01),
        longitude: 77.4100 + (Math.random() * 0.01),
        description: citizenDesc || 'Road obstruction reported by citizen',
        hasImage: !!citizenImage,
        timestamp: new Date().toLocaleTimeString()
      };

      setIncidents(prev => [citizenIncident, ...prev]);
      triggerSmsAlert('Citizen Crowdsource App', `${citizenIncident.latitude}, ${citizenIncident.longitude}`);
      setCitizenStatus('✅ Incident successfully broadcasted to Command Center queue!');
      setCitizenDesc('');
      setCitizenImage(null);
      logTelemetry('SUCCESS', `Crowdsourced Incident #${citizenIncident.id} integrated into dispatch queue.`);
    }, 800);
  };

  const handlePublicOneTapSOS = () => {
    playAlertSound();
    setPublicStatus('Acquiring high-precision GPS lock via browser Geolocation API...');
    logTelemetry('INFO', 'Public PWA client requested emergency geo-lock.');

    if (!navigator.geolocation) {
      setPublicStatus('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setPublicStatus(`GPS secured! Broadcasting telemetry packet...`);

        const newIncident = {
          id: Date.now(),
          source: 'Public Mobile SOS App',
          severity: 'HIGH',
          status: 'DISPATCHED',
          latitude: userLat,
          longitude: userLng,
          timestamp: new Date().toLocaleTimeString()
        };

        setIncidents((prev) => [newIncident, ...prev]);
        triggerSmsAlert('Public Mobile SOS App', `${userLat}, ${userLng}`);
        logTelemetry('SUCCESS', `PWA SOS broadcast received [Lat: ${userLat.toFixed(4)}, Lng: ${userLng.toFixed(4)}]`);
        
        setTimeout(() => {
          setPublicStatus('✅ Emergency Alert Broadcasted! Automated Green Corridor initiated.');
        }, 800);
      },
      () => {
        const fallbackLat = 28.6600;
        const fallbackLng = 77.4200;
        const newIncident = {
          id: Date.now(),
          source: 'Public Mobile SOS App',
          severity: 'HIGH',
          status: 'DISPATCHED',
          latitude: fallbackLat,
          longitude: fallbackLng,
          timestamp: new Date().toLocaleTimeString()
        };
        setIncidents((prev) => [newIncident, ...prev]);
        triggerSmsAlert('Public Mobile SOS App', `${fallbackLat}, ${fallbackLng}`);
        setPublicStatus('✅ Emergency Alert Broadcasted successfully!');
        logTelemetry('WARN', 'Fallback geolocation applied for PWA client.');
      }
    );
  };

  const handleSelectIncidentRoute = async (inc) => {
    const incLat = parseFloat(inc.latitude) || 28.6600;
    const incLng = parseFloat(inc.longitude) || 77.4200;

    logTelemetry('INFO', `Running Multi-Factor Triage & Load-Balancing Algorithm for Incident #${inc.id}...`);

    let nearestHospital = hospitals[0];
    let optimalScore = Infinity;

    hospitals.forEach(hosp => {
      const approxDist = Math.sqrt(Math.pow(hosp.latitude - incLat, 2) + Math.pow(hosp.longitude - incLng, 2));
      const bedScarcityWeight = 1 / (hosp.availableIcuBeds || 1); 
      const score = approxDist * 0.6 + bedScarcityWeight * 0.4;

      if (score < optimalScore) {
        optimalScore = score;
        nearestHospital = hosp;
      }
    });

    logTelemetry('SUCCESS', `AI Triage Selected: ${nearestHospital.name} (${nearestHospital.availableIcuBeds} ICU Beds available)`);
    setAmbPos([nearestHospital.latitude, nearestHospital.longitude]);

    setHospitals(prev => prev.map(h => h.id === nearestHospital.id ? { ...h, availableIcuBeds: Math.max(0, h.availableIcuBeds - 1) } : h));

    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${nearestHospital.longitude},${nearestHospital.latitude};${incLng},${incLat}?overview=full&geometries=geojson`
      );

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(2);
        const durationMins = (route.duration / 60).toFixed(1);

        const rawCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const coords = rawCoords.filter((_, index) => index % Math.max(1, Math.floor(rawCoords.length / 40)) === 0);
        
        setActiveRoute(coords);
        const midIndex = Math.floor(coords.length / 2);
        setSignalPoints([coords[Math.floor(midIndex / 2)], coords[midIndex]]);

        setTriageInfo({
          name: nearestHospital.name,
          beds: nearestHospital.availableIcuBeds - 1,
          eta: `${durationMins} mins`,
          distance: `${distanceKm} km (OSRM Verified)`,
          load: "AI Dynamic Load Balanced"
        });

        setNavigationInstruction(`Proceed along corridor: Head towards ${nearestHospital.name} (${distanceKm} km). Green wave active at upcoming signals.`);
        logTelemetry('SUCCESS', `OSRM Route Calculated: ${distanceKm}km, ETA: ${durationMins} mins.`);
        return coords;
      }
    } catch (err) {
      logTelemetry('ERROR', 'OSRM API routing failed, utilizing fallback spatial matrix.');
      const fallbackRoute = [
        [nearestHospital.latitude, nearestHospital.longitude],
        [incLat, incLng]
      ];
      setActiveRoute(fallbackRoute);
      setTriageInfo({
        name: nearestHospital.name,
        beds: nearestHospital.availableIcuBeds - 1,
        eta: "5.5 mins",
        distance: "4.2 km away",
        load: "Fallback Matrix Route"
      });
      setNavigationInstruction(`Turn right towards ${nearestHospital.name} in 300 meters. Maintain green corridor speed.`);
      return fallbackRoute;
    }
  };

  const handleStartSimulation = async (inc) => {
    let routeCoords = activeRoute;
    if (!routeCoords) {
      routeCoords = await handleSelectIncidentRoute(inc);
    }

    if (!routeCoords || routeCoords.length === 0 || isSimulating) return;
    setIsSimulating(true);
    logTelemetry('SUCCESS', `Green Corridor Wave Active. Ambulance dispatched towards incident #${inc.id}`);

    let currentStep = 0;
    const totalPoints = routeCoords.length;

    if (animIntervalRef.current) clearInterval(animIntervalRef.current);

    animIntervalRef.current = setInterval(() => {
      if (currentStep < totalPoints) {
        setAmbPos(routeCoords[currentStep]);
        if (currentStep === Math.floor(totalPoints / 2)) {
          setNavigationInstruction("Continue straight through overriden traffic junction. Priority corridor active.");
        }
        currentStep++;
      } else {
        clearInterval(animIntervalRef.current);
        setIsSimulating(false);
        setIncidents(prev => prev.map(item => item.id === inc.id ? { ...item, status: 'ARRIVED' } : item));
        setNavigationInstruction("Ambulance arrived at destination. Patient transferred to trauma center.");
        logTelemetry('SUCCESS', `Ambulance successfully arrived at incident location #${inc.id}. Patient transferred.`);
      }
    }, 150);
  };

  const handleExportCSV = () => {
    if (incidents.length === 0) {
      alert("No incident telemetry data available for export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Incident_ID,Source,Severity,Status,Latitude,Longitude,Timestamp\n";
    incidents.forEach(inc => {
      csvContent += `${inc.id},"${inc.source}",${inc.severity},${inc.status},${inc.latitude},${inc.longitude},"${inc.timestamp || 'N/A'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OmniOps_Incident_Analytics_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logTelemetry('SUCCESS', 'Municipal Analytics CSV Report exported successfully by administrator.');
  };

  const handleManualOverride = (id) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        logTelemetry('WARN', `HITL Manual Override executed on incident #${id}`);
        return { ...inc, status: 'MANUAL_DISPATCH' };
      }
      return inc;
    }));
  };

  const handleClearQueue = () => {
    setIncidents([]);
    setActiveRoute(null);
    setSignalPoints([]);
    setTriageInfo(null);
    setNavigationInstruction("Awaiting emergency dispatch routing...");
    setAmbPos([28.6692, 77.4538]);
    if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    setIsSimulating(false);
    logTelemetry('INFO', 'System state reset by administrator.');
  };

  return (
    <div className="command-center">
      {/* PROFESSIONAL RBAC NAVIGATION NAVBAR */}
      <header className="navbar">
        <div className="brand">
          <FaShieldAlt className="brand-icon" />
          <div>
            <h1>OMNIOPS AI</h1>
            <span className="sub-title">Distributed Autonomous Emergency Engine (Production Grade)</span>
          </div>
        </div>

        <div className="status-bar" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveRole('command')}
            style={{
              background: activeRole === 'command' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
              color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
            }}
          >
            <FaUserShield /> Admin Command Center
          </button>
          
          <button 
            onClick={() => setActiveRole('hospital')}
            style={{
              background: activeRole === 'hospital' ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
              color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
            }}
          >
            <FaHospital /> Hospital Desk View
          </button>

          <button 
            onClick={() => setActiveRole('public')}
            style={{
              background: activeRole === 'public' ? '#10b981' : 'rgba(255,255,255,0.1)',
              color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
            }}
          >
            <FaMobileAlt /> Public Citizen Portal (PWA)
          </button>

          <button 
            onClick={() => setActiveRole('telemetry')}
            style={{
              background: activeRole === 'telemetry' ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
              color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
            }}
          >
            <FaNetworkWired /> WebSocket Telemetry Stream
          </button>

          <button 
            onClick={handleExportCSV}
            style={{
              background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            <FaFileCsv /> Export Analytics CSV
          </button>

          <button onClick={handleClearQueue} className="reset-btn" style={{ marginLeft: '10px' }}>
            Reset
          </button>
        </div>
      </header>

      {/* RENDER VIEW BASED ON RBAC ACTIVE ROLE */}
      {activeRole === 'public' ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 'calc(100vh - 70px)', background: 'radial-gradient(circle at center, #1e1e2f 0%, #0d0d15 100%)',
          color: '#ffffff', padding: '30px', textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '35px', borderRadius: '20px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', maxWidth: '500px', width: '100%'
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: '10px' }}><FaMobileAlt /> Public Citizen SOS & Reporting Portal</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '25px' }}>
              Crowdsource road incidents, upload live photos, or transmit one-tap emergency geolocation payloads directly to the command center webhook.
            </p>

            <button
              onClick={handlePublicOneTapSOS}
              style={{
                width: '150px', height: '150px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #991b1b)', color: '#ffffff',
                border: '6px solid rgba(255, 255, 255, 0.3)', fontSize: '18px', fontWeight: 'bold',
                cursor: 'pointer', boxShadow: '0 0 30px rgba(239, 68, 68, 0.8)', outline: 'none', margin: '0 auto 25px auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              🚨 ONE-TAP SOS
            </button>

            {publicStatus && (
              <p style={{ margin: '10px 0 20px 0', fontSize: '14px', color: '#34d399', fontWeight: 'bold' }}>
                {publicStatus}
              </p>
            )}

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

            <form onSubmit={handleCitizenSubmit} style={{ textAlign: 'left' }}>
              <h4 style={{ color: '#38bdf8', marginBottom: '10px', fontSize: '14px' }}><FaCamera /> Crowdsource Road Hazard / Accident</h4>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Incident Description & Landmark</label>
                <input 
                  type="text" 
                  value={citizenDesc} 
                  onChange={(e) => setCitizenDesc(e.target.value)} 
                  placeholder="e.g., Heavy traffic collision near sector 62 cut"
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid #2a2a3c', color: '#fff', borderRadius: '6px', fontSize: '13px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Upload Incident Photo (Evidence)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setCitizenImage(e.target.files[0])}
                  style={{ width: '100%', color: '#94a3b8', fontSize: '12px' }}
                />
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
                }}
              >
                SUBMIT CITIZEN REPORT
              </button>

              {citizenStatus && (
                <p style={{ marginTop: '12px', fontSize: '13px', color: '#34d399', textAlign: 'center', fontWeight: 'bold' }}>
                  {citizenStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      ) : activeRole === 'hospital' ? (
        <div style={{
          height: 'calc(100vh - 70px)', background: '#0d0d15', color: '#ffffff', padding: '30px', overflowY: 'auto'
        }}>
          <h2 style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <FaHospital /> Hospital Emergency Desk & Dynamic Bed Availability (RBAC Node)
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '14px' }}>
            Real-time synchronization between emergency dispatch routes and trauma center ICU capacities.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {hospitals.map(hosp => (
              <div key={hosp.id} style={{ background: '#12121c', border: '1px solid #2a2a3c', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ color: '#38bdf8', marginBottom: '10px' }}>{hosp.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '15px' }}>Location: {hosp.district}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaBed /> Available ICU Beds:</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: hosp.availableIcuBeds < 5 ? '#ef4444' : '#10b981' }}>
                    {hosp.availableIcuBeds} Units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeRole === 'telemetry' ? (
        <div style={{
          height: 'calc(100vh - 70px)', background: '#0d0d15', color: '#34d399', padding: '30px',
          fontFamily: 'monospace', overflowY: 'auto'
        }}>
          <h2 style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaNetworkWired /> Live Event-Driven Telemetry Ingestion Stream (WebSocket Engine)
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '14px' }}>
            Real-time server log showing incoming JSON payloads, SMS gateway alerts, and crowdsourced reports.
          </p>
          <div style={{ background: '#12121c', border: '1px solid #2a2a3c', padding: '20px', borderRadius: '10px' }}>
            {telemetryLogs.map((log) => (
              <div key={log.id} style={{ marginBottom: '10px', borderBottom: '1px solid #1e1e2f', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b', marginRight: '15px' }}>[{log.time}]</span>
                <span style={{ 
                  color: log.type === 'SUCCESS' ? '#34d399' : log.type === 'WARN' ? '#f59e0b' : '#38bdf8', 
                  fontWeight: 'bold', marginRight: '15px' 
                }}>
                  [{log.type}]
                </span>
                <span style={{ color: '#e2e8f0' }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          <aside className="sidebar" style={{ height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
            <div className="panel-card glass-panel">
              <h3><FaBroadcastTower /> Trigger Event Telemetry</h3>
              <form onSubmit={handleTriggerSOS}>
                <div className="form-group">
                  <label>Ingestion Source</label>
                  <select value={source} onChange={(e) => setSource(e.target.value)}>
                    <option value="CCTV AI Detection">CCTV AI Computer Vision (YOLOv8)</option>
                    <option value="IoT Crash Sensor">IoT Crash Sensor (MQTT Stream)</option>
                    <option value="Citizen Crowdsource App">Public Citizen App</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Severity Score</label>
                  <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    <option value="HIGH"> HIGH</option>
                    <option value="MEDIUM">MODERATE</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="dispatch-btn" disabled={isSubmitting}>
                  <FaExclamationTriangle /> {isSubmitting ? 'INGESTING...' : 'DISPATCH EVENT PAYLOAD'}
                </button>
              </form>
            </div>

            {/* FEATURE 3: TURN-BY-TURN NAVIGATION INSTRUCTION BOX */}
            <div className="panel-card glass-panel" style={{ borderLeft: '4px solid #38bdf8', padding: '12px' }}>
              <h4 style={{ color: '#38bdf8', margin: '0 0 6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaDirections /> Driver Turn-by-Turn Navigation
              </h4>
              <p style={{ fontSize: '12px', margin: '0', color: '#e2e8f0', lineHeight: '1.4' }}>
                {navigationInstruction}
              </p>
            </div>

            {triageInfo && (
              <div className="panel-card glass-panel triage-panel" style={{ borderLeft: '4px solid #10b981', padding: '12px' }}>
                <h4 style={{ color: '#34d399', margin: '0 0 8px 0', fontSize: '14px' }}><FaHospital /> Smart Triage & Load Balancer</h4>
                <p style={{ fontSize: '12px', margin: '4px 0' }}><strong>Assigned Hospital:</strong> {triageInfo.name}</p>
                <p style={{ fontSize: '12px', margin: '4px 0' }}><strong>Verified Distance:</strong> <span style={{ color: '#38bdf8' }}>{triageInfo.distance}</span></p>
                <p style={{ fontSize: '12px', margin: '4px 0' }}><strong>ICU Capacity:</strong> <span style={{ color: '#10b981' }}>{triageInfo.beds} Units</span></p>
                <p style={{ fontSize: '12px', margin: '4px 0' }}><strong>Optimized ETA:</strong> {triageInfo.eta}</p>
              </div>
            )}

            <div className="panel-card glass-panel queue-panel" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <h3><FaSatellite /> Event Ingestion Queue (HITL)</h3>
              <div className="incident-list">
                {incidents.length === 0 ? (
                  <p className="no-data">No active event telemetry streams.</p>
                ) : (
                  incidents.map((inc, index) => (
                    <div key={inc.id || index} className="incident-card">
                      <div className="card-header">
                        <span className="incident-source">{inc.source || 'AI Alert'}</span>
                        <span className={`badge badge-${(inc.status || 'REPORTED').toLowerCase()}`}>
                          {inc.status || 'REPORTED'}
                        </span>
                      </div>
                      <div className="card-body">
                        <p><strong>Severity:</strong> <span className="text-red">{inc.severity || 'HIGH'}</span></p>
                        {inc.description && <p style={{ fontSize: '11px', color: '#94a3b8' }}>{inc.description}</p>}
                        <p className="coords">Lat: {inc.latitude} | Lng: {inc.longitude}</p>
                      </div>
                      <div className="action-buttons">
                        <button type="button" className="route-btn" onClick={() => handleSelectIncidentRoute(inc)}>
                          <FaRoute /> Route
                        </button>
                        <button type="button" className="sim-btn" onClick={() => handleStartSimulation(inc)}>
                          <FaPlay /> Live Track
                        </button>
                        <button type="button" className="override-btn" onClick={() => handleManualOverride(inc.id)}>
                          <FaUserCog /> Override
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          <main className="map-container-wrapper">
            <MapContainer 
              center={[28.6600, 77.4200]} 
              zoom={12} 
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <MapResizeFix />
              
              <TileLayer
                className="dark-map-tiles"
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {activeRoute && (
                <Polyline 
                  positions={activeRoute} 
                  pathOptions={{ color: '#00f2fe', weight: 5, dashArray: '8, 8' }} 
                />
              )}

              {signalPoints.map((sigPos, idx) => (
                <Marker key={`signal-${idx}`} position={sigPos} icon={greenSignalIcon}>
                  <Popup>
                    <div className="popup-box">
                      <h4 className="text-green"><FaTrafficLight /> Green Corridor Wave Active</h4>
                      <p>Traffic Signal #{idx + 1} overridden dynamically via API.</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {incidents.map((inc, idx) => (
                inc.latitude && inc.longitude && (
                  <Marker key={`inc-${idx}`} position={[parseFloat(inc.latitude), parseFloat(inc.longitude)]} icon={incidentIcon}>
                    <Popup>
                      <div className="popup-box">
                        <h4 className="text-red">EVENT TELEMETRY PAYLOAD</h4>
                        <p><strong>Source:</strong> {inc.source}</p>
                        {inc.description && <p><strong>Desc:</strong> {inc.description}</p>}
                        <p><strong>Status:</strong> {inc.status || 'PENDING'}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}

              {hospitals.map((hosp, idx) => (
                hosp.latitude && hosp.longitude && (
                  <Marker key={`hosp-${idx}`} position={[parseFloat(hosp.latitude), parseFloat(hosp.longitude)]} icon={hospitalIcon}>
                    <Popup>
                      <div className="popup-box">
                        <h4 className="text-blue">{hosp.name}</h4>
                        <p>Available ICU Beds: {hosp.availableIcuBeds}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}

              <Marker position={ambPos} icon={ambulanceIcon}>
                <Popup>
                  <div className="popup-box">
                    <h4 className="text-green">Ambulance AMB-101 (Autonomous)</h4>
                    <p>Status: {isSimulating ? 'GREEN CORRIDOR ACTIVE' : 'STANDBY'}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;