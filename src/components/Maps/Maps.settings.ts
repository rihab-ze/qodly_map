import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';

const commonSettings: TSetting[] = [
  {
    key: 'zoom',
    label: 'Zoom',
    type: ESetting.NUMBER_FIELD,
    defaultValue: 10,
  },
  {
    key: 'mapDragging',
    label: 'Map dragging',
    type: ESetting.CHECKBOX,
    defaultValue: true,
  },
  {
    key: 'animation',
    label: 'Animation',
    type: ESetting.CHECKBOX,
    defaultValue: true,
  },
  {
    key: 'marker',
    label: 'Marker',
    type: ESetting.CHECKBOX,
    defaultValue: true,
  },
  {
    key: 'multipleMarker',
    label: 'Multiple marker',
    type: ESetting.CHECKBOX,
    defaultValue: false,
  },
  {
    key: 'markerDragging',
    label: 'Marker dragging',
    type: ESetting.CHECKBOX,
    defaultValue: false,
  },
  {
    key: 'popup',
    label: 'Popup',
    type: ESetting.CHECKBOX,
    defaultValue: false,
  },
  {
    key: 'message',
    label: 'Popup message',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
];

const Settings: TSetting[] = [
  {
    key: 'properties',
    label: 'Properties',
    type: ESetting.GROUP,
    components: commonSettings,
  },
  ...DEFAULT_SETTINGS,
];
export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow'),
];

export default Settings;
