import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

import { IMapsProps } from './Maps.config';

const Maps: FC<IMapsProps> = ({
  style,
  marker,
  popup,
  zoom,
  markerDragging,
  mapDragging,
  message,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: L.Map | null = null;
    if (mapRef.current) {
      map = L.map(mapRef.current, { dragging: mapDragging }).setView([51.505, -0.09], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      if (marker) {
        const marker = L.marker([51.505, -0.09], { draggable: markerDragging }).addTo(map);
        if (popup) marker.bindPopup(message).openPopup();
      }
    }

    // cleanUP
    return () => {
      if (map) map.remove();
    };
  }, [zoom, markerDragging, marker, popup, mapDragging,message]);

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      <div ref={mapRef} style={{ height: style?.height }}></div>
    </span>
  );
};

export default Maps;
