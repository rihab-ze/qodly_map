import { useRenderer } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface ISingleMarkerProps extends webforms.ComponentProps {
  popup: boolean;
  zoom: number;
  markerDragging: boolean;
  animation: boolean;
  marker: boolean;
  message: string;
  mapDragging: boolean;
  data: LocationData;
  handleDataChange: (value: LocationData) => void;
}

interface LocationData {
  longitude: number;
  latitude: number;
}

const SingleMarker: FC<ISingleMarkerProps> = ({
  style,
  popup,
  marker,
  zoom,
  markerDragging,
  animation,
  mapDragging,
  message,
  data,
  handleDataChange,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      map.current = L.map(mapRef.current, { dragging: mapDragging }).setView(
        [+data.latitude, +data.longitude],
        zoom,
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);
      if (marker) {
        markers.current = L.marker([+data.latitude, +data.longitude], {
          draggable: markerDragging,
        }).addTo(map.current);
        if (popup && message) markers.current.bindPopup(message).openPopup();
        // Attach event listener to listen for map moveend
        markers.current.on('moveend', (event) => {
          const newCenter = (event.target as L.Marker).getLatLng();
          data = {
            longitude: newCenter.lng,
            latitude: newCenter.lat,
          };
          handleDataChange(data);
        });
      }
    }
    // cleanUP
    return () => {
      if (map) map.current?.remove();
    };
  }, [markerDragging, zoom, map, message, mapDragging, popup]);

  useEffect(() => {
    map.current?.flyTo([+data.latitude, +data.longitude], zoom, {
      animate: animation,
    });
    if (map.current && marker) {
      markers.current?.setLatLng({
        lat: data.latitude,
        lng: data.longitude,
      });

      if (popup && message) markers.current?.bindPopup(message).openPopup();
    }
  }, [data]);

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      <div ref={mapRef} style={{ height: '400px' }} />
    </span>
  );
};

export default SingleMarker;
