import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';

import { IMapsProps } from './Maps.config';
import MultipleMarker from './components/MultipleMarker';
import SingleMarker from './components/SingleMarker';

interface LoactionAndPopup {
  longitude: number;
  latitude: number;
  popupMessage: HTMLElement | null;
}
const Maps: FC<IMapsProps> = ({
  style,
  popup,
  zoom,
  markerDragging,
  animation,
  mapDragging,
  markerTypes,
  distance,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const [value1, setValue1] = useState<LoactionAndPopup[]>([]);
  const [value, setValue] = useState<LoactionAndPopup>({
    longitude: 0,
    latitude: 0,
    popupMessage: null,
  });

  const {
    sources: { datasource: ds },
  } = useSources();
  useEffect(() => {
    if (!ds) return;
    const listener = async (/* event */) => {
      if (markerTypes == 'multiple') {
        const v = await ds.getValue<LoactionAndPopup[]>();
        if (v) setValue1(v);
      } else {
        const v = await ds.getValue<LoactionAndPopup>();
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

  const handleDataChange = (newValue: LoactionAndPopup) => {
    ds.setValue<object>(null, newValue);
  };

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      {markerTypes == 'multiple' ? (
        <MultipleMarker
          data={value1}
          zoom={zoom}
          mapDragging={mapDragging}
          popup={popup}
          distance={distance}
          style={style}
        />
      ) : (
        <SingleMarker
          data={value}
          popup={popup}
          zoom={zoom}
          markerDragging={markerDragging}
          animation={animation}
          marker={markerTypes}
          mapDragging={mapDragging}
          handleDataChange={handleDataChange}
          style={style}
        />
      )}
    </div>
  );
};

export default Maps;
