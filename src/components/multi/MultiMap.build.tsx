import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { IMultiMapProps } from './MultiMap.config';

const MultiMap: FC<IMultiMapProps> = ({
  zoom,
  mapDragging,
  style,
  icone,
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
      setIconUrl(icone);
    };
    changeIconUrl();
  }, [icone]);
  useEffect(() => {
    let map: L.Map | null = null;
    if (mapRef.current) {
      map = L.map(mapRef.current, { dragging: mapDragging }).setView([51.505, -0.09], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      var myIcone = L.divIcon({
        html: `<i class="map_icon ${iconUrl}" style="font-size: 30px ; display: flex; align-items: center; justify-content: center; width: 32px; height: 42px"></i>`,
        className: '',
        iconAnchor: [13, 33],
      });
      var markers = L.markerClusterGroup();
      markers.addLayer(L.marker([51.505, -0.09], { icon: myIcone }));
      markers.addLayer(L.marker([51.505, -0.13], { icon: myIcone }));
      markers.addLayer(L.marker([51.505, -0.2], { icon: myIcone }));
      map.addLayer(markers);
    }

    // cleanUP
    return () => {
      if (map) map.remove();
    };
  }, [zoom, mapDragging, style, iconUrl]);

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      <div ref={mapRef} style={{ ...style, zIndex: 1 }}>
        {' '}
      </div>
    </span>
  );
};

export default MultiMap;
