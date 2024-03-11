import { useRenderer } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface IMultipleMarkerProps extends webforms.ComponentProps {
  zoom: number;
  mapDragging: boolean;
  data: LocationData[];
}

interface LocationData {
  longitude: number;
  latitude: number;
}
const MultipleMarker: FC<IMultipleMarkerProps> = ({
  style,
  zoom,
  mapDragging,
  className,
  data,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRefs = useRef<(L.Marker | null)[]>([]);

  useEffect(() => {
    if (mapRef.current && data[1]) {
      const bounds = L.latLngBounds(
        [+data[0]?.latitude, +data[0]?.longitude],
        [+data[1]?.latitude, +data[1]?.longitude],
      );
      map.current = L.map(mapRef.current, { dragging: mapDragging })
        .setView([+data[0].latitude, +data[0].longitude], zoom)
        .fitBounds(bounds, { padding: [50, 50] });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);
      for (let i = 0; i < data.length; i++) {
        markerRefs.current[i] = L.marker([+data[i]?.latitude, +data[i]?.longitude]).addTo(
          map.current,
        );
      }
    }
    // cleanUP
    return () => {
      if (map) map.current?.remove();
    };
  }, [zoom, map, mapDragging, data]);

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      <div ref={mapRef} style={{ height: '400px' }} />
    </span>
  );
};

export default MultipleMarker;
