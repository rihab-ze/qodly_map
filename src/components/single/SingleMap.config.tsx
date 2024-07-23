import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
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
} as T4DComponentConfig<ISingleMapProps>;

export interface ISingleMapProps extends webforms.ComponentProps {
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
