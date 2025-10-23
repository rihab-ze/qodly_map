import {
  EComponentKind,
  splitDatasourceID,
  T4DComponentConfig,
  T4DComponentDatasourceDeclaration,
} from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { FaMapMarkerAlt } from 'react-icons/fa';

import SingleMapSettings, { BasicSettings } from './SingleMap.settings';

export default {
  craft: {
    displayName: 'SingleMap',
    kind: EComponentKind.BASIC,
    props: {
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(SingleMapSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'SingleMap',
    exposed: true,
    icon: FaMapMarkerAlt,
    events: [
      {
        label: 'On Click',
        value: 'onclick',
      },
      {
        label: 'On Blur',
        value: 'onblur',
      },
      {
        label: 'On Focus',
        value: 'onfocus',
      },
      {
        label: 'On MouseEnter',
        value: 'onmouseenter',
      },
      {
        label: 'On MouseLeave',
        value: 'onmouseleave',
      },
      {
        label: 'On KeyDown',
        value: 'onkeydown',
      },
      {
        label: 'On KeyUp',
        value: 'onkeyup',
      },
    ],
    datasources: {
      declarations: (props: any) => {
        const { lat, long, datasource = '' } = props;

        const declarations: T4DComponentDatasourceDeclaration[] = [
          { path: datasource, iterable: true },
        ];
        if (lat && long) {
          const { id: ds } = splitDatasourceID(datasource?.trim()) || {};

          if (!ds) {
            return;
          }

          const { id: latSrc } = splitDatasourceID(lat);

          declarations.push({
            path: `${datasource}.${latSrc}`,
          });

          const { id: longSrc } = splitDatasourceID(long);

          declarations.push({
            path: `${datasource}.${longSrc}`,
          });
        }
        return declarations;
      },
      accept: ['object', 'entity'],
    },
  },

  defaultProps: {
    style: {
      height: '400px',
      width: '400px',
    },
    zoom: 10,
    markerDragging: false,
    popup: false,
    mapDragging: true,
    marker: true,
    icon: 'fa-solid fa-location-dot',
  },
} as T4DComponentConfig;

export interface ISingleMapProps extends webforms.ComponentProps {
  zoom: number;
  markerDragging: boolean;
  popup: boolean;
  mapDragging: boolean;
  marker: boolean;
  long: string;
  lat: string;
  tooltip: string;
  icon: string;
}
