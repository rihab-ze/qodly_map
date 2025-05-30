import {
  EComponentKind,
  splitDatasourceID,
  T4DComponentConfig,
  T4DComponentDatasourceDeclaration,
} from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { TbMapPin2 } from 'react-icons/tb';

import MultiMapSettings, { BasicSettings } from './MultiMap.settings';

export default {
  craft: {
    displayName: 'MultiMap',
    kind: EComponentKind.BASIC,
    props: {
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(MultiMapSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'MultiMap',
    exposed: true,
    icon: TbMapPin2,
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
        const { lat, long, tooltip, datasource = '' } = props;
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
            path: `${datasource}.[].${latSrc}`,
          });

          const { id: longSrc } = splitDatasourceID(long);
          declarations.push({
            path: `${datasource}.[].${longSrc}`,
          });

          const { id: tooltipSrc } = splitDatasourceID(tooltip);
          declarations.push({
            path: `${datasource}.[].${tooltipSrc}`,
          });
        }
        return declarations;
      },
      accept: ['entitySel', 'array'],
    },
  },
  defaultProps: {
    style: {
      height: '400px',
      width: '400px',
    },
    zoom: 10,
    showAllMarkers: false,
    animation: true,
    popup: true,
    mapDragging: true,
    distance: 100,
    icone: 'fa-solid fa-location-dot',
  },
} as T4DComponentConfig<IMultiMapProps>;

export interface IMultiMapProps extends webforms.ComponentProps {
  zoom: number;
  showAllMarkers: boolean;
  animation: boolean;
  popup: boolean;
  mapDragging: boolean;
  long: string;
  lat: string;
  tooltip: string;
  distance: number;
  icone: string;
}
