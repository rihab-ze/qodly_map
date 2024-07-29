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
    defaultValue: false,
  },
  {
    key: 'popup',
    label: 'Popup',
    type: ESetting.CHECKBOX,
    defaultValue: false,
  },
  {
    key: 'markerDragging',
    label: 'Single marker dragging',
    type: ESetting.CHECKBOX,
    defaultValue: false,
  },
  {
    key: 'long',
    label: 'Longitude',
    type: ESetting.TEXT_FIELD,
  },
  {
    key: 'lat',
    label: 'Latitude',
    type: ESetting.TEXT_FIELD,
  },
  {
    key: 'tooltiop',
    label: 'Tooltip',
    type: ESetting.TEXT_FIELD,
  },
  {
    key: 'icone',
    label: 'Marker Icone',
    type: ESetting.ICON_PICKER,
    defaultValue: 'fa-solid fa-location-dot',
  },
];

const Settings: TSetting[] = [
  {
    key: 'properties',
    label: 'Properties',
    type: ESetting.GROUP,
    components: commonSettings,
  },
  ...load(DEFAULT_SETTINGS).filter('style.overflow', 'font', 'background'),
];

export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter(
    'style.overflow',
    'style.fontFamily',
    'style.fontWeight',
    'style.fontSize',
    'style.textAlign',
    'style.textTransform',
    'background',
  ),
];

export default Settings;
