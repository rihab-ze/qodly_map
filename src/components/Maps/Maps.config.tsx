import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { FaMapMarkedAlt } from 'react-icons/fa';

import MapsSettings, { BasicSettings } from './Maps.settings';

export default {
  craft: {
    displayName: 'Maps',
    kind: EComponentKind.BASIC,
    props: {
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(MapsSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'Maps',
    exposed: true,
    icon: FaMapMarkedAlt,
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
    style: { height: '400px' },
    zoom: 10,
    markerDragging: false,
    animation: true,
    popup: false,
    mapDragging: true,
    markerTypes: 'none',
    distance: 100,
  },
} as T4DComponentConfig<IMapsProps>;

export interface IMapsProps extends webforms.ComponentProps {
  zoom: number;
  markerDragging: boolean;
  animation: boolean;
  popup: boolean;
  mapDragging: boolean;
  markerTypes: 'none' | 'one' | 'multiple';
  distance: number;
}
