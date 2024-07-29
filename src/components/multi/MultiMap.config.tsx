import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
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
      accept: ['string'],
    },
  },
  defaultProps: {
    style: { height: '400px', width: '400px' },
    zoom: 10,
    animation: true,
    popup: false,
    mapDragging: true,
    distance: 100,
  },
} as T4DComponentConfig<IMultiMapProps>;

export interface IMultiMapProps extends webforms.ComponentProps {
  zoom: number;
  animation: boolean;
  popup: boolean;
  mapDragging: boolean;
  long: string;
  lat: string;
  tooltip: string;
  distance: number;
  icone: string;
}
