import { FC, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface ISingleMarkerProps extends webforms.ComponentProps {
  popup: boolean;
  zoom: number;
  markerDragging: boolean;
  animation: boolean;
  marker: string;
  mapDragging: boolean;
  data: LoactionAndPopup | undefined;
  handleDataChange: (value: LoactionAndPopup) => void;
  size: { width: number; height: number };
}

interface LoactionAndPopup {
  longitude: number;
  latitude: number;
  popupMessage: HTMLElement | null;
}

const SingleMarker: FC<ISingleMarkerProps> = ({
  popup,
  marker,
  zoom,
  markerDragging,
  animation,
  mapDragging,
  data,
  handleDataChange,
  size,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker | null>(null);
  var defaultIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/rihab-ze/qodly_map/develop/public/marker-icon.png',
    iconSize: [26, 42],
    iconAnchor: [13, 43],
    popupAnchor: [0, -36],
  });

  useEffect(() => {
    if (mapRef.current) {
      map.current = L.map(mapRef.current, { dragging: mapDragging }).setView(
        [+data!.latitude, +data!.longitude],
        zoom,
      );
      mapRef.current.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);
      if (marker == 'one') {
        markers.current = L.marker([+data!.latitude, +data!.longitude], {
          draggable: markerDragging,
          icon: defaultIcon,
        }).addTo(map.current);
        if (popup) {
          const popUpMessage = data!.popupMessage as HTMLElement;
          markers.current.bindPopup(popUpMessage);
        }
        // Attach event listener to listen for map moveend
        markers.current.on('moveend', (event) => {
          const newCenter = (event.target as L.Marker).getLatLng();
          data = {
            longitude: newCenter.lng,
            latitude: newCenter.lat,
            popupMessage: data!.popupMessage,
          };
          handleDataChange(data);
        });
        markers.current.on('mousedown', (event) => {
          event.originalEvent?.stopPropagation(); // Stop the event bubbling
        });
      }
    }
    // cleanUP
    return () => {
      if (map) map.current?.remove();
    };
  }, [markerDragging, zoom, map, mapDragging, popup, data, size]);

  useEffect(() => {
    map.current?.flyTo([+data!.latitude, +data!.longitude], zoom, {
      animate: animation,
    });
    if (map.current && marker == 'one') {
      markers.current?.setLatLng({
        lat: data!.latitude,
        lng: data!.longitude,
      });

      if (popup) {
        const popUpMessage = data!.popupMessage as HTMLElement;
        markers.current?.bindPopup(popUpMessage);
      }
    }
  }, [data]);

  return (
    <>
      {isLocationAndPopup(data) ? (
        <div ref={mapRef} style={size} />
      ) : (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">Datasource does not match the expected format. </span>
        </div>
      )}
    </>
  );
};

export default SingleMarker;
function isLocationAndPopup(obj: any): obj is LoactionAndPopup {
  return typeof obj == 'object' && !Array.isArray(obj) && 'latitude' in obj && 'longitude' in obj;
}
