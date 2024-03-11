import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';

import { IMapsProps } from './Maps.config';
import MultipleMarker from './components/MultipleMarker';
import SingleMarker from './components/SingleMarker';

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
  multipleMarker,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const [value1, setValue1] = useState<LocationData[]>([{ longitude: 0, latitude: 0 }]);
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
      if (multipleMarker) {
        const v = await ds.getValue<LocationData[]>();
        if (v) {
          setValue1(v);
        }
      } else {
        const v = await ds.getValue<LocationData>();
        if (v) {
          setValue(v);
        }
      }
    };
    listener();
    ds.addListener('changed', listener);
    return () => {
      ds.removeListener('changed', listener);
    };
  }, [ds]);

  const handleDataChange = (newValue: LocationData) => {
    ds.setValue<object>(null, newValue);
  };

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      {multipleMarker ? (
        <MultipleMarker data={value1} zoom={zoom} mapDragging={mapDragging} />
      ) : (
        <SingleMarker
          data={value}
          popup={popup}
          zoom={zoom}
          markerDragging={markerDragging}
          animation={animation}
          marker={marker}
          message={message}
          mapDragging={mapDragging}
          handleDataChange={handleDataChange}
        />
      )}
    </span>
  );
};

export default Maps;
