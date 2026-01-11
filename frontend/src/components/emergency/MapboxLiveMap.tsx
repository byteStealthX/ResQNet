import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { Loader2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface MapboxLiveMapProps {
  patientLocation: Location;
  ambulanceLocation?: Location;
  hospitalLocation?: Location;
  showRoute?: boolean;
  onAmbulanceUpdate?: (location: Location) => void;
}

export function MapboxLiveMap({ 
  patientLocation, 
  ambulanceLocation, 
  hospitalLocation,
  showRoute = true,
  onAmbulanceUpdate,
}: MapboxLiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const patientMarker = useRef<mapboxgl.Marker | null>(null);
  const ambulanceMarker = useRef<mapboxgl.Marker | null>(null);
  const hospitalMarker = useRef<mapboxgl.Marker | null>(null);
  const [ambulancePos, setAmbulancePos] = useState(ambulanceLocation);
  
  const { token, loading, error } = useMapboxToken();

  // Simulate ambulance movement
  useEffect(() => {
    if (!ambulanceLocation || !patientLocation) return;

    const interval = setInterval(() => {
      setAmbulancePos(prev => {
        if (!prev) return ambulanceLocation;
        
        const dx = (patientLocation.lat - prev.lat) * 0.03;
        const dy = (patientLocation.lng - prev.lng) * 0.03;
        
        const newPos = {
          lat: prev.lat + dx,
          lng: prev.lng + dy,
        };
        
        onAmbulanceUpdate?.(newPos);
        return newPos;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [ambulanceLocation, patientLocation, onAmbulanceUpdate]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [patientLocation.lng, patientLocation.lat],
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Patient marker (blue pulsing)
    const patientEl = document.createElement('div');
    patientEl.className = 'patient-marker';
    patientEl.innerHTML = `
      <div class="patient-marker-pulse"></div>
      <div class="patient-marker-dot"></div>
    `;
    
    patientMarker.current = new mapboxgl.Marker({ element: patientEl })
      .setLngLat([patientLocation.lng, patientLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>📍 Your Location</strong>'))
      .addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token, patientLocation]);

  // Update ambulance marker
  useEffect(() => {
    if (!map.current || !ambulancePos) return;

    if (!ambulanceMarker.current) {
      const ambulanceEl = document.createElement('div');
      ambulanceEl.className = 'ambulance-marker';
      ambulanceEl.innerHTML = '🚑';
      
      ambulanceMarker.current = new mapboxgl.Marker({ element: ambulanceEl })
        .setLngLat([ambulancePos.lng, ambulancePos.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>🚑 Ambulance</strong>'))
        .addTo(map.current);
    } else {
      ambulanceMarker.current.setLngLat([ambulancePos.lng, ambulancePos.lat]);
    }
  }, [ambulancePos]);

  // Add hospital marker
  useEffect(() => {
    if (!map.current || !hospitalLocation) return;

    if (!hospitalMarker.current) {
      const hospitalEl = document.createElement('div');
      hospitalEl.className = 'hospital-marker';
      hospitalEl.innerHTML = '🏥';
      
      hospitalMarker.current = new mapboxgl.Marker({ element: hospitalEl })
        .setLngLat([hospitalLocation.lng, hospitalLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>🏥 Hospital</strong>'))
        .addTo(map.current);
    }
  }, [hospitalLocation]);

  // Draw route
  useEffect(() => {
    if (!map.current || !showRoute || !ambulancePos) return;

    const routeId = 'route';
    
    // Wait for map to load
    if (!map.current.loaded()) {
      map.current.on('load', addRoute);
    } else {
      addRoute();
    }

    function addRoute() {
      if (!map.current) return;
      
      // Remove existing route
      if (map.current.getSource(routeId)) {
        map.current.removeLayer(routeId);
        map.current.removeSource(routeId);
      }

      // Add new route
      map.current.addSource(routeId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [ambulancePos!.lng, ambulancePos!.lat],
              [patientLocation.lng, patientLocation.lat],
            ],
          },
        },
      });

      map.current.addLayer({
        id: routeId,
        type: 'line',
        source: routeId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#ef4444',
          'line-width': 4,
          'line-dasharray': [2, 1],
        },
      });
    }
  }, [ambulancePos, patientLocation, showRoute]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-muted rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-muted rounded-xl">
        <p className="text-muted-foreground text-sm">Map unavailable</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .patient-marker {
          position: relative;
          width: 24px;
          height: 24px;
        }
        .patient-marker-pulse {
          position: absolute;
          width: 24px;
          height: 24px;
          background: rgba(59, 130, 246, 0.4);
          border-radius: 50%;
          animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .patient-marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .ambulance-marker {
          font-size: 32px;
          animation: ambulance-move 1s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .hospital-marker {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes ambulance-move {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
      `}</style>
      <div 
        ref={mapContainer} 
        className="w-full h-full min-h-[300px] rounded-xl overflow-hidden"
      />
    </>
  );
}
