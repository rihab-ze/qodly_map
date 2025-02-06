import { useDataLoader, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  useEnhancedNode,
  useDsChangeHandler,
  entitySubject,
  EntityActions,
} from '@ws-ui/webform-editor';
import { IMultiMapProps } from './MultiMap.config';
import { getLocationIndex, getValueByPath, getNearbyCoordinates, isDataValid } from './utils';
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
  const { id: nodeID } = useEnhancedNode();
  const [size, setSize] = useState({ width: style?.width, height: style?.height });
  const ref = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState(-1);
  const [_scrollIndex, setScrollIndex] = useState(0);
  const [_count, setCount] = useState(0);
  const [allEntities, setAllEntites] = useState<any[]>(() => []);
  const [values, setValues] = useState<LoactionAndPopup[]>(() => []);
  const [entities, setEntities] = useState<any[]>(() => []);
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  const {
    sources: { datasource, currentElement: ce },
  } = useSources({
    acceptIteratorSel: true,
  });

  const { fetchIndex } = useDataLoader({
    source: datasource,
  });

  const {
    fetchIndex: fetchIndexClone,
    query,
    loaderDatasource: ds,
  } = useDataLoader({
    source: ds,
  });

  const applyBounds = useCallback(
    debounce(async (bounds: L.LatLngBounds, prevBounds?: L.LatLngBounds) => {
      if (!bounds || (prevBounds && bounds.equals(prevBounds))) {
        return;
      }
      if (ds.type === 'scalar' && ds.dataType === 'array') {
        const v = await ds.getValue();
        if (v) {
          setValues(
            v.map((value: any) => ({
              longitude: +getValueByPath(value, long),
              latitude: +getValueByPath(value, lat),
              popupMessage: getValueByPath(value, tooltip),
            })),
          );
        }
      } else {
        const queryStr = `${lat} > :1 AND ${lat} < :2 $ AND ${long} > :3 AND ${long} < :4`;
        const placeholders = [
          bounds.getSouth(),
          bounds.getNorth(),
          bounds.getWest(),
          bounds.getEast(),
        ];

        query.entitysel({
          queryString: queryStr,
          placeholders,
        });
        fetchIndexClone(0);
      }
    }, 300),
    [ds, lat, long],
  );

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchIndex(0);
      setEntities(data);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchIndex(0);
      setAllEntites(
        data.map((item) => ({
          longitude: item[long as keyof typeof item] as number,
          latitude: item[lat as keyof typeof item] as number,
          popupMessage: item[tooltip as keyof typeof item] as any,
        })),
      );
    };
    fetchData();
  }, [ds]);
  let myIcone = L.divIcon({
    html: `<i class="map_icon ${icone}" style="font-size: 30px ; display: flex; align-items: center; justify-content: center; width: 32px; height: 42px"></i>`,
    className: '',
    iconAnchor: [13, 33],
  });
  const { updateCurrentDsValue } = useDsChangeHandler({
    source: datasource,
    currentDs: ce,
    selected,
    setSelected,
    setScrollIndex,
    setCount,
    fetchIndex,
    onDsChange: async (length, selected) => {
      const data = await fetchIndex(0);
      setEntities(data);
      if (selected >= 0) {
        updateCurrentDsValue({
          index: selected < length ? selected : 0,
          forceUpdate: true,
        });
      }
    },
    onCurrentDsChange: (selected) => {
      entitySubject.next({
        action: EntityActions.UPDATE,
        payload: {
          nodeID,
          rowIndex: selected,
        },
      });
    },
  });

  const handleSelectedElementChange = async ({ index }: { index: number }) => {
    if (!ds || !ce) {
      return;
    }
    const value = await ds.getValue();
    await ce.setValue(null, value[index]);
  };

  useEffect(() => {
    console.log(datasource.type);

    if (!mapRef.current && !ds) return;

    const updateBoundsAndFetchData = () => {
      const bounds = map.current?.getBounds();
      if (bounds) {
        applyBounds(bounds);
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

    if (entities.length > 0 || values.length > 0) {
      const groups =
        datasource.type === 'scalar'
          ? getNearbyCoordinates(values, distance)
          : getNearbyCoordinates(
              entities.map((item) => ({
                longitude: item[long as keyof typeof item] as number,
                latitude: item[lat as keyof typeof item] as number,
                popupMessage: item[tooltip as keyof typeof item] as any,
              })),
              distance,
            );

      map.current?.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
      const markers = L.markerClusterGroup();
      const markerList = [];
      for (let i = 0; i < groups.length; i++) {
        for (let j = 0; j < groups[i].length; j++) {
          const marker = L.marker([+groups[i][j]?.latitude, +groups[i][j]?.longitude], {
            icon: myIcone,
          });

          if (groups[i][j].popupMessage && popup) {
            const popupMessage = groups[i][j].popupMessage as HTMLElement;
            marker.bindPopup(popupMessage, { offset: L.point(3, -10) });
          }
          markerList.push(marker);
          marker.on('click', async (event) => {
            const { lat, lng } = (event as L.LeafletMouseEvent).latlng;
            if (datasource.type === 'scalar') {
              const index = getLocationIndex(lat, lng, values);
              handleSelectedElementChange({ index });
            } else {
              const index = getLocationIndex(lat, lng, allEntities as LoactionAndPopup[]);
              updateCurrentDsValue({ index, forceUpdate: true });
            }
          });
        }
        markers.addLayers(markerList);
        map.current.addLayer(markers);
      }
    }
  }, [entities, map.current, values]);

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
      {isDataValid(values ? values : entities) ? (
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

// const isDataValid = (arr: any[]) => {
//   return (
//     arr.length >= 0 &&
//     arr.every((obj) => typeof obj === 'object' && 'latitude' in obj && 'longitude' in obj)
//   );
// };
