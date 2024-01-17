import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { IMapsProps } from './Maps.config';

interface LocationData {
  longitude: number;
  latitude: number;
}
const Maps: FC<IMapsProps> = ({
  style,
  popup,
  marker,
  zoom,
  markerDragging,
  animation,
  mapDragging,
  message,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker | null>(null);
  const [value, setValue] = useState({
    longitude: 0,
    latitude: 0,
  });
  const {
    sources: { datasource: ds },
  } = useSources();

  useEffect(() => {
    if (!ds) return;
    const listener = async (/* event */) => {
      const v = await ds.getValue<LocationData>();
      if (v) {
        setValue(v);
      }
    };
    listener();
    ds.addListener('changed', listener);
    return () => {
      ds.removeListener('changed', listener);
    };
  }, [ds]);

  useEffect(() => {
    if (mapRef.current) {
      map.current = L.map(mapRef.current, { dragging: mapDragging }).setView(
        [+value.latitude, +value.longitude],
        zoom,
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);
      if (marker) {
        markers.current = L.marker([+value.latitude, +value.longitude], {
          draggable: markerDragging,
        }).addTo(map.current);
        if (popup && message) markers.current.bindPopup(message).openPopup();
        // Attach event listener to listen for map moveend
        markers.current.on('moveend', (event) => {
          const newCenter = (event.target as L.Marker).getLatLng();
          ds.setValue<object>(null, {
            longitude: newCenter.lng,
            latitude: newCenter.lat,
          });
        });
      }
    }
    console.log(value);
    // cleanUP
    return () => {
      if (map) map.current?.remove();
    };
  }, [markerDragging, zoom, ds, map, message, mapDragging, popup]);

  useEffect(() => {
    map.current?.flyTo([+value.latitude, +value.longitude], 16, {
      animate: animation,
    });
    if (map.current && marker) {
      markers.current?.setLatLng({
        lat: value.latitude,
        lng: value.longitude,
      });

      if (popup && message) markers.current?.bindPopup(message).openPopup();
    }
  }, [value]);

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      <div ref={mapRef} style={{ height: '400px' }} />
    </span>
  );
};

export default Maps;
