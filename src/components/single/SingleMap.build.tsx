import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { ISingleMapProps } from './SingleMap.config';

const SingleMap: FC<ISingleMapProps> = ({
  popup,
  zoom,
  markerDragging,
  mapDragging,
  icon,
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();
  const mapRef = useRef<HTMLDivElement>(null);
  const [iconUrl, setIconUrl] = useState('fa-solid fa-map-pin');

  useEffect(() => {
    const changeIconUrl = () => {
      setIconUrl(icon);
    };
    changeIconUrl();
  }, [icon]);

  useEffect(() => {
    let map: L.Map | null = null;
    if (mapRef.current) {
      map = L.map(mapRef.current, { dragging: mapDragging }).setView([51.505, -0.09], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      var myIcon = L.divIcon({
        html: `<i class="map_icon ${iconUrl}" style="font-size: 30px ; display: flex; align-items: center; justify-content: center; width: 32px; height: 42px"></i>`,
        className: '',
        iconAnchor: [13, 33],
      });
      const marker = L.marker([51.505, -0.09], {
        draggable: markerDragging,
        icon: myIcon,
      }).addTo(map);
      if (popup) marker.bindPopup('your message here', { offset: L.point(3, -10) }).openPopup();
    }

    // cleanUP
    return () => {
      if (map) map.remove();
    };
  }, [zoom, markerDragging, popup, mapDragging, iconUrl]);

  return (
    <div
      ref={connect}
      style={style}
      className={cn(className, classNames, 'flex items-center justify-center overflow-hidden')}
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }}>
        {' '}
      </div>
    </div>
  );
};

export default SingleMap;
