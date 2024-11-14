import { useDataLoader, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { IMultiMapProps } from './MultiMap.config';
import { updateEntity } from './hooks/useDsChangeHandler';
import { getLocationIndex, getValueByPath, getNearbyCoordinates } from './utils';
import { cloneDeep, debounce } from 'lodash';

type LoactionAndPopup = {
  longitude: number;
  latitude: number;
  popupMessage?: HTMLElement | null;
};

const MultiMap: FC<IMultiMapProps> = ({
  popup,
  zoom,
  animation,
  mapDragging,
  distance,
  long,
  lat,
  tooltip,
  icone,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const [size, setSize] = useState({ width: style?.width, height: style?.height });
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState<LoactionAndPopup[]>(() => []);
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const {
    sources: { datasource, currentElement: ce },
  } = useSources();

  const ds = useMemo(() => {
    if (datasource) {
      const clone: any = cloneDeep(datasource);
      clone.id = `${clone.id}_clone`;
      clone.children = {};
      return clone;
    }
    return null;
  }, [datasource?.id, (datasource as any)?.entitysel]);

  const { entities, fetchIndex } = useDataLoader({
    source: ds,
  });

  const applyBounds = useCallback(
    debounce(
      async (
        source: datasources.DataSource,
        bounds: L.LatLngBounds,
        prevBounds?: L.LatLngBounds,
      ) => {
        if (!bounds || (prevBounds && bounds.equals(prevBounds))) {
          return;
        }
        if (source.type === 'scalar' && source.dataType === 'array') {
          const v = await ds.getValue();
          if (v) {
            setValue(
              v.map((value: any) => ({
                longitude: +getValueByPath(value, long),
                latitude: +getValueByPath(value, lat),
                popupMessage: getValueByPath(value, tooltip),
              })),
            );
          }
        } else {
          const { entitysel } = source as any;
          const dataSetName = entitysel?.getServerRef();
          const queryStr = `${lat} > ${bounds.getSouth()} AND ${lat} < ${bounds.getNorth()} AND ${long} > ${bounds.getWest()} AND ${long} < ${bounds.getEast()}`;

          (source as any).entitysel = source.dataclass.query(queryStr, {
            dataSetName,
            filterAttributes: source.filterAttributesText || entitysel._private.filterAttributes,
          });

          fetchIndex(0);
        }
      },
      300,
    ),
    [],
  );

  useEffect(() => {
    fetchIndex(0);
  }, [ds]);

  let myIcone = L.divIcon({
    html: `<i class="map_icon ${icone}" style="font-size: 30px ; display: flex; align-items: center; justify-content: center; width: 32px; height: 42px"></i>`,
    className: '',
    iconAnchor: [13, 33],
  });

  const handleSelectedElementChange = async ({
    index,
    fireEvent = true,
  }: {
    index: number;
    forceUpdate?: boolean;
    fireEvent?: boolean;
  }) => {
    if (!ds || !ce) {
      return;
    }
    switch (ce.type) {
      case 'entity': {
        await updateEntity({ index, datasource: ds, currentElement: ce, fireEvent });
        break;
      }
      case 'scalar': {
        if (ds.dataType !== 'array') {
          return;
        }
        const value = await ds.getValue();
        await ce.setValue(null, value[index]);
        break;
      }
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const updateBoundsAndFetchData = () => {
      const bounds = map.current?.getBounds();
      if (bounds && ds) {
        applyBounds(ds, bounds);
      }
    };

    if (mapRef.current) {
      map.current = L.map(mapRef.current, { dragging: mapDragging }).setView(
        [51.505, -0.09],
        zoom,
        { animate: animation },
      );

      mapRef.current.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map.current);

      map.current.on('moveend', updateBoundsAndFetchData);
    }

    return () => {
      if (map.current) {
        map.current.off();
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !map.current) return;

    // Clear previous markers
    // find a solution so that the popup don't vanish
    /*map.current.eachLayer((layer) => {
      if (layer instanceof L.MarkerClusterGroup) {
        map.current?.removeLayer(layer);
      }
    });*/

    if (entities.length > 0 || value.length > 0) {
      const markers: L.MarkerClusterGroup[] = [];
      const groups = value
        ? getNearbyCoordinates(value, distance)
        : getNearbyCoordinates(
            entities.map((item) => ({
              longitude: item[long as keyof typeof item] as number,
              latitude: item[lat as keyof typeof item] as number,
              popupMessage: item[tooltip as keyof typeof item] as any,
            })),
            distance,
          );
      for (let i = 0; i < groups.length; i++) {
        markers[i] = L.markerClusterGroup();
        for (let j = 0; j < groups[i].length; j++) {
          const marker = L.marker([+groups[i][j]?.latitude, +groups[i][j]?.longitude], {
            icon: myIcone,
          });

          if (groups[i][j].popupMessage && popup) {
            const popupMessage = groups[i][j].popupMessage as HTMLElement;
            marker.bindPopup(popupMessage, { offset: L.point(3, -10) });
          }
          markers[i].addLayer(marker);
          marker.on('click', (event) => {
            const { lat, lng } = (event as L.LeafletMouseEvent).latlng;
            const index = getLocationIndex(
              lat,
              lng,
              value ? value : (entities as LoactionAndPopup[]),
            );
            handleSelectedElementChange({ index, forceUpdate: true });
          });
        }
        map.current.addLayer(markers[i]);
      }
    }
  }, [entities, map.current, value]);

  useEffect(() => {
    if (!ce) return;
    const listener = async () => {
      const v = await ce.getValue();
      if (v) map.current?.flyTo([+getValueByPath(v, lat), +getValueByPath(v, long)]);
    };
    listener();
    ce.addListener('changed', listener);
    return () => {
      ce.removeListener('changed', listener);
    };
  }, [ce]);

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

  return (
    <div
      ref={(R) => {
        connect(R);
        ref.current = R;
      }}
      style={style}
      className={cn(className, classNames)}
    >
      {isDataValid(value ? value : entities) ? (
        <div ref={mapRef} style={{ ...size, zIndex: 1 }} />
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

export default MultiMap;

const isDataValid = (arr: any[]) => {
  return (
    arr.length >= 0 &&
    arr.every((obj) => typeof obj === 'object' && 'latitude' in obj && 'longitude' in obj)
  );
};
