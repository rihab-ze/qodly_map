import { MdOutlineTextSnippet } from 'react-icons/md';
import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';

import MapSettings, { BasicSettings } from './Map.settings';

export default {
  craft: {
    displayName: 'Map',
    kind: EComponentKind.BASIC,
    props: {
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(MapSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'Map',
    exposed: true,
    icon: MdOutlineTextSnippet,
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
      accept: ['object'],
    },
  },

  defaultProps: {
    style: { height: '400px', width: '400px' },
    zoom: 10,
    markerDragging: false,
    animation: true,
    popup: false,
    mapDragging: true,
    marker: false,
  },
} as T4DComponentConfig<IMapProps>;

export interface IMapProps extends webforms.ComponentProps {
  zoom: number;
  markerDragging: boolean;
  animation: boolean;
  popup: boolean;
  mapDragging: boolean;
  marker: boolean;
  long: string;
  lat: string;
  tooltiop: string;
}
