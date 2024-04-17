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
  marker: string;
  mapDragging: boolean;
  data: LoactionAndPopup;
  handleDataChange: (value: LoactionAndPopup) => void;
}

interface LoactionAndPopup {
  longitude: number;
  latitude: number;
  popupMessage: HTMLElement | null;
}

const SingleMarker: FC<ISingleMarkerProps> = ({
  style,
  popup,
  marker,
  zoom,
  markerDragging,
  animation,
  mapDragging,
  data,
  handleDataChange,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker | null>(null);
  var defaultIcon = L.icon({
    iconUrl: '../../../../public/marker-icon.png',
  });

  useEffect(() => {
    if (mapRef.current) {
      map.current = L.map(mapRef.current, { dragging: mapDragging }).setView(
        [+data.latitude, +data.longitude],
        zoom,
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);
      if (marker == 'one') {
        markers.current = L.marker([+data.latitude, +data.longitude], {
          draggable: markerDragging,
          icon: defaultIcon,
        }).addTo(map.current);
        if (popup) {
          const popUpMessage = data.popupMessage as HTMLElement;
          markers.current.bindPopup(popUpMessage);
        }
        // Attach event listener to listen for map moveend
        markers.current.on('moveend', (event) => {
          const newCenter = (event.target as L.Marker).getLatLng();
          data = {
            longitude: newCenter.lng,
            latitude: newCenter.lat,
            popupMessage: data.popupMessage,
          };
          handleDataChange(data);
        });
      }
    }
    // cleanUP
    return () => {
      if (map) map.current?.remove();
    };
  }, [markerDragging, zoom, map, mapDragging, popup]);

  useEffect(() => {
    map.current?.flyTo([+data.latitude, +data.longitude], zoom, {
      animate: animation,
    });
    if (map.current && marker == 'one') {
      markers.current?.setLatLng({
        lat: data.latitude,
        lng: data.longitude,
      });

      if (popup) {
        const popUpMessage = data.popupMessage as HTMLElement;
        markers.current?.bindPopup(popUpMessage);
      }
    }
  }, [data]);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div ref={mapRef} style={style} />
    </div>
  );
};

export default SingleMarker;
