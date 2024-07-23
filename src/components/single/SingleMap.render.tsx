import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getValueByPath } from './../multi/utils';

import { ISingleMapProps } from './SingleMap.config';

interface LoactionAndPopup {
  longitude: number;
  latitude: number;
  popupMessage: HTMLElement | null;
}

const SingleMap: FC<ISingleMapProps> = ({
  popup,
  zoom,
  markerDragging,
  animation,
  mapDragging,
  marker,
  long,
  lat,
  tooltiop,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const [value, setValue] = useState<LoactionAndPopup | undefined>(undefined);
  const [size, setSize] = useState({ width: style?.width, height: style?.height });
  const ref = useRef<HTMLElement | null>(null);
  const {
    sources: { datasource: ds },
  } = useSources();

  useEffect(() => {
    if (!ds) return;
    const listener = async (/* event */) => {
      const v = await ds.getValue();
      console.log(v);
      console.log(getValueByPath(v, long));
      if (getValueByPath(v, long) && getValueByPath(v, lat)) {
        setValue({
          longitude: +getValueByPath(v, long),
          latitude: +getValueByPath(v, lat),
          popupMessage: getValueByPath(v, tooltiop),
        });
      }
    };
    listener();
    ds.addListener('changed', listener);
    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds]);

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
        [value!.latitude, value!.longitude],
        zoom,
      );
      mapRef.current.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);

      if (marker) {
        markers.current = L.marker([+value!.latitude, +value!.longitude], {
          draggable: markerDragging,
          icon: defaultIcon,
        }).addTo(map.current);
        if (popup) {
          const popUpMessage = value!.popupMessage as HTMLElement;
          markers.current.bindPopup(popUpMessage);
        }
        // Attach event listener to listen for map moveend
        markers.current.on('moveend', (event) => {
          const newCenter = (event.target as L.Marker).getLatLng();
          setValue({
            longitude: newCenter.lng,
            latitude: newCenter.lat,
            popupMessage: value!.popupMessage,
          });
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
  }, [markerDragging, zoom, map, mapDragging, popup, value, size, tooltiop]);
  useEffect(() => {
    map.current?.flyTo([value!.latitude, value!.longitude], zoom, {
      animate: animation,
    });
    if (map.current && marker) {
      markers.current?.setLatLng({
        lat: value!.latitude,
        lng: value!.longitude,
      });

      if (popup) {
        const popUpMessage = value!.popupMessage as HTMLElement;
        markers.current?.bindPopup(popUpMessage);
      }
    }
  }, [value]);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);
  function isDataValid(obj: any): obj is LoactionAndPopup {
    return typeof obj == 'object' && !Array.isArray(obj) && 'latitude' in obj && 'longitude' in obj;
  }
  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      {isDataValid(value) ? (
        <div ref={mapRef} style={size} />
      ) : (
        <div
          className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-md"
          role="alert"
        >
          <div className="flex items-center">
            <strong className="font-bold text-red-700">Error!</strong>
          </div>
          <span className="block sm:inline mt-1 ">
            Datasource does not match the expected format.
          </span>
        </div>
      )}
    </div>
  );
};

export default SingleMap;
