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
interface entity {
  name: string;
  address: LocationData;
  city: string;
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
    name: '',
    address: { longitude: 0, latitude: 0 },
    city: '',
  });

  // const [value, setValue] = useState({
  //   longitude: 0,
  //   latitude: 0,
  // });
  const {
    sources: { datasource: ds },
  } = useSources();

  useEffect(() => {
    if (!ds) return;
    const listener = async (/* event */) => {
      //const v = await ds.getValue();
      //console.log(v.values);
      // const v = await ds.getValue<LocationData>();
      const v = await ds.getValue<entity>();
      console.log(v.name);
      // if (v) {
      // const test = v.map((e) => e.x);
      // setValue(v);
      setValue({
        name: v.name,
        address: v.address,
        city: v.city,
        // borderSkipped: false,
      });
      // }));
      console.log(value);
      // } else {
      //   console.warn('Invalid or missing properties in the received object');
      // }
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
        [+value.address.latitude, +value.address.longitude],
        zoom,
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);
      if (marker) {
        markers.current = L.marker([+value.address.latitude, +value.address.longitude], {
          draggable: markerDragging,
        }).addTo(map.current);
        if (popup) markers.current.bindPopup(message ? message : value.name).openPopup();

        // Attach event listener to listen for map moveend
        markers.current.on('moveend', (event) => {
          const newCenter = (event.target as L.Marker).getLatLng();
          console.log(newCenter);
          ds.setValue<entity>(null, {
            name: value.name,
            address: { longitude: newCenter.lng, latitude: newCenter.lat },
            city: value.city,
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
    map.current?.flyTo([+value.address.latitude, +value.address.longitude], 16, {
      animate: animation,
    });
    if (map.current && marker) {
      markers.current?.setLatLng({
        lat: value.address.latitude,
        lng: value.address.longitude,
      });

      if (popup) markers.current?.bindPopup(message ? message : value.name).openPopup();
    }
  }, [value]);

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      <div ref={mapRef} style={{ height: '400px' }} />
    </span>
  );
};

export default Maps;
