import { splitDatasourceID, useDataLoader, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { IMultiMapProps } from './MultiMap.config';
import { getLocationIndex, getValueByPath, getNearbyCoordinates, isDataValid } from './utils';
import findIndex from 'lodash/findIndex';
import { updateEntity } from '././hooks/useDsChangeHandler';

type LoactionAndPopup = {
  longitude: number;
  latitude: number;
  popupMessage?: HTMLElement | null;
};

const MultiMap: FC<IMultiMapProps> = ({
  popup,
  zoom,
  showAllMarkers,
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
  const [size, setSize] = useState<{ width: string | number; height: string | number }>({
    width: '100%',
    height: '100%',
  });
  const ref = useRef<HTMLElement | null>(null);
  const entities = useRef<datasources.IEntity[]>([]);
  const [values, setValues] = useState<LoactionAndPopup[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const isFlyingRef = useRef(false);
  const hasInitialFlyRef = useRef(false);
  const { id: longID } = splitDatasourceID(long);
  long = longID;
  const { id: latID } = splitDatasourceID(lat);
  lat = latID;
  const { id: tooltipID } = splitDatasourceID(tooltip);
  tooltip = tooltipID;
  const {
    sources: { datasource, currentElement: ce },
  } = useSources({
    acceptIteratorSel: true,
  });

  const { fetchIndex, query, loaderDatasource } = useDataLoader({
    source: datasource,
  });

  let myIcone = L.divIcon({
    html: `<i class="map_icon ${icone}" style="font-size: 30px ; display: flex; align-items: center; justify-content: center; width: 32px; height: 42px"></i>`,
    className: '',
    iconAnchor: [13, 33],
  });

  const fetchData = useCallback(
    (entities: datasources.IEntity[] | LoactionAndPopup[]) => {
      if (!map.current) return;

      if (entities.length > 0 || values.length > 0) {
        const groups =
          datasource.type === 'scalar'
            ? getNearbyCoordinates(values, distance)
            : getNearbyCoordinates(entities, distance);

        map.current?.eachLayer((layer) => {
          if (!(layer instanceof L.TileLayer)) {
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
              const { lat: latitude, lng } = (event as L.LeafletMouseEvent).latlng;
              if (datasource.type === 'scalar') {
                const index = getLocationIndex(latitude, lng, values);
                handleSelectedElementChange({ index });
              } else {
                const index = findIndex(
                  entities,
                  (e: any) => e[long] === lng && e[lat] === latitude,
                );
                handleSelectedElementChange({ index });
              }
              map.current?.flyTo([latitude, lng], map.current.getZoom(), { animate: animation });
            });
          }
          markers.addLayers(markerList);
          map.current.addLayer(markers);
        }
        if (!hasInitialFlyRef.current) {
          isFlyingRef.current = true;
          hasInitialFlyRef.current = true;
          if (ce) {
            handleSelectedElementChange({ index: 0 });
          }

          if (showAllMarkers) {
            const bounds = L.latLngBounds(
              groups.flat().map(({ latitude, longitude }) => [latitude, longitude]),
            );

            map.current.fitBounds(bounds, { padding: [50, 50], animate: animation });
          } else {
            map.current?.flyTo(
              [+groups[0][0]?.latitude, +groups[0][0]?.longitude],
              map.current.getZoom(),
              { animate: animation },
            );
          }
        }
      }
    },
    [map.current, values, entities.current],
  );

  useEffect(() => {
    if (!datasource) return;

    const listener = async (/* event */) => {
      const v = await datasource.getValue();
      if (v) {
        if (datasource.type == 'entitysel') {
          entities.current = v._private.curPage.entitiesDef.map((item: any) => ({
            longitude: item[long as keyof typeof item] as number,
            latitude: item[lat as keyof typeof item] as number,
            popupMessage: item[tooltip as keyof typeof item] as any,
          }));
          hasInitialFlyRef.current = false;
          fetchData(entities.current);
        } else {
          setValues(
            v.map((value: any) => ({
              longitude: +getValueByPath(value, long),
              latitude: +getValueByPath(value, lat),
              popupMessage: getValueByPath(value, tooltip),
            })),
          );
          hasInitialFlyRef.current = false;
          fetchData(values);
        }
      }
    };
    listener();
    datasource.addListener('changed', listener);
    return () => {
      datasource.removeListener('changed', listener);
    };
  }, [datasource]);

  useEffect(() => {
    if (datasource.type != 'entitysel') return;
    const fetch = async () => {
      const rawEntities = await fetchIndex(0);
      entities.current = rawEntities.map((item: any) => ({
        ...item,
        longitude: item[long as keyof typeof item] as number,
        latitude: item[lat as keyof typeof item] as number,
        popupMessage: item[tooltip as keyof typeof item] as any,
      }));
      fetchData(entities.current);
    };
    fetch();
  }, [loaderDatasource]);

  const handleSelectedElementChange = async ({
    index,
    fireEvent = true,
  }: {
    index: number;
    forceUpdate?: boolean;
    fireEvent?: boolean;
  }) => {
    if (!datasource || !ce) {
      return;
    }
    switch (ce.type) {
      case 'entity': {
        await updateEntity({ index, datasource: datasource, currentElement: ce, fireEvent });
        break;
      }
      case 'scalar': {
        if (datasource.dataType !== 'array') {
          return;
        }
        const value = await datasource.getValue();
        await ce.setValue(null, value[index]);
        break;
      }
    }
  };

  const applyBounds = useCallback(
    async (bounds: L.LatLngBounds) => {
      if (!bounds || isFlyingRef.current) {
        isFlyingRef.current = false;
        return;
      }
      const queryStr = `${lat} > :1 AND ${lat} < :2  AND ${long} > :3 AND ${long} < :4`;
      const placeholders = [
        bounds.getSouth().toString(),
        bounds.getNorth().toString(),
        bounds.getWest().toString(),
        bounds.getEast().toString(),
      ];
      query.entitysel({
        queryString: queryStr,
        placeholders,
      });
    },
    [query, fetchIndex, loaderDatasource],
  );

  useEffect(() => {
    fetchData(values);
  }, [values]);

  useEffect(() => {
    if (!mapRef.current) return;
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
        { animate: false },
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
      className={cn(className, classNames, 'flex items-center justify-center  overflow-hidden')}
    >
      {isDataValid(values ? values : entities.current) ? (
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
