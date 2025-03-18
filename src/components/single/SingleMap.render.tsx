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
  mapDragging,
  marker,
  long,
  lat,
  icon,
  tooltip,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const [value, setValue] = useState<LoactionAndPopup>();
  const [size, setSize] = useState({ width: style?.width, height: style?.height });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPositionChanged, setIsPositionChanged] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const {
    sources: { datasource: ds },
  } = useSources();
  useEffect(() => {
    if (!ds) return;
    const listener = async (/* event */) => {
      const v = await ds.getValue();

      if (getValueByPath(v, long) && getValueByPath(v, lat)) {
        setValue({
          longitude: +getValueByPath(v, long),
          latitude: +getValueByPath(v, lat),
          popupMessage: getValueByPath(v, tooltip),
        });
        setIsLoaded(true);
      }
    };
    listener();
    ds.addListener('changed', listener);
    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker | null>(null);
  var myIcon = L.divIcon({
    html: `<i class="map_icon ${icon}" style="font-size: 30px ; display: flex; align-items: center; justify-content: center; width: 32px; height: 42px"></i>`,
    className: '',
    iconAnchor: [13, 33],
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
          icon: myIcon,
          draggable: markerDragging,
        }).addTo(map.current);

        if (popup) {
          const popUpMessage = value!.popupMessage as HTMLElement;
          markers.current.bindPopup(popUpMessage, { offset: L.point(3, -10) });
        }
        markers.current.on('moveend', (event) => {
          const newCenter = (event.target as L.Marker).getLatLng();
          setValue({
            longitude: newCenter.lng,
            latitude: newCenter.lat,
            popupMessage: value!.popupMessage,
          });
          setIsPositionChanged(true);
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
  }, [zoom, size, map, isLoaded]);

  useEffect(() => {
    if (value && isPositionChanged) {
      const positionChange = async () => {
        const v = await ds.getValue();
        function setNestedValue(obj: any, path: string, value: any): void {
          const keys = path.split('.');
          let target = obj;
          for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]];
            if (target === undefined) {
              target = {};
            }
          }
          target[keys[keys.length - 1]] = value;
        }
        setNestedValue(v, long, value.longitude);
        setNestedValue(v, lat, value.latitude);

        ds.setValue(null, v);
      };
      positionChange();
      setIsPositionChanged(false);
    }
  }, [isPositionChanged]);
  useEffect(() => {
    if (!isPositionChanged) {
      map.current?.flyTo([value!.latitude, value!.longitude]);
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
        <div ref={mapRef} style={{ ...size, zIndex: 1, ...style }} />
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
