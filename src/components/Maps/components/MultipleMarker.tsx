import { useRenderer } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface IMultipleMarkerProps extends webforms.ComponentProps {
  zoom: number;
  mapDragging: boolean;
  data: LoactionAndPopup[];
  popup: boolean;
  distance: number;
}

interface LoactionAndPopup {
  longitude: number;
  latitude: number;
  popupMessage: HTMLElement | null;
}
const MultipleMarker: FC<IMultipleMarkerProps> = ({
  style,
  zoom,
  mapDragging,
  className,
  data,
  distance,
  popup,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  var defaultIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/rihab-ze/qodly_map/develop/public/marker-icon.png',
    iconSize: [26, 42],
    iconAnchor: [13, 43],
    popupAnchor: [0, -36],
  });

  useEffect(() => {
    if (mapRef.current && data[1]) {
      map.current = L.map(mapRef.current, { dragging: mapDragging }).setView(
        [+data[0].latitude, +data[0].longitude],
        zoom,
      );
      mapRef.current.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map.current);
      const markers: L.MarkerClusterGroup[] = [];
      const groups = findNearbyCoordinates(data, distance);
      for (let i = 0; i < groups.length; i++) {
        markers[i] = L.markerClusterGroup();
        for (let j = 0; j < groups[i].length; j++) {
          const marker = L.marker([+groups[i][j]?.latitude, +groups[i][j]?.longitude], {
            icon: defaultIcon,
          });
          if (groups[i][j].popupMessage && popup) {
            const popupMessage = groups[i][j].popupMessage as HTMLElement;
            marker.bindPopup(popupMessage);
          }
          markers[i].addLayer(marker);
        }
        map.current.addLayer(markers[i]);
      }
    }
    // cleanUP
    return () => {
      if (map) map.current?.remove();
    };
  }, [zoom, map, mapDragging, data]);
  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      {isLocationAndPopupArray(data) ? (
        <div ref={mapRef} style={style} />
      ) : (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">Datasource does not match the expected format. </span>
        </div>
      )}
    </div>
  );
};

export default MultipleMarker;

function findNearbyCoordinates(
  coordinates: LoactionAndPopup[],
  distanceThreshold: number,
): LoactionAndPopup[][] {
  const result: LoactionAndPopup[][] = [];

  function calculateDistance(coord1: LoactionAndPopup, coord2: LoactionAndPopup): number {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
  }

  // Function to find or create a group for a coordinate
  function findOrCreateGroup(coord: LoactionAndPopup): LoactionAndPopup[] {
    for (const group of result) {
      for (const existingCoord of group) {
        if (calculateDistance(existingCoord, coord) <= distanceThreshold) {
          group.push(coord);
          return group;
        }
      }
    }
    const newGroup: LoactionAndPopup[] = [coord];
    result.push(newGroup);
    return newGroup;
  }

  // Group nearby coordinates
  coordinates.forEach((coord) => {
    findOrCreateGroup(coord);
  });

  return result;
}
function isLocationAndPopupArray(arr: any[]): arr is LoactionAndPopup[] {
  return (
    Array.isArray(arr) &&
    arr.length > 1 &&
    arr.every((obj) => typeof obj === 'object' && 'longitude' in obj && 'latitude' in obj)
  );
}
