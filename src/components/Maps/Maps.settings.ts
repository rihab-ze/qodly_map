import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';
import { FaMapMarkerAlt } from "react-icons/fa";
import { TbMapPin2 } from "react-icons/tb";
import { LuMapPinOff } from "react-icons/lu";



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
    key: 'markerTypes',
    label: 'Marker types',
    type: ESetting.RADIOGROUP,
    defaultValue: 'none',
    options: [
      { value: 'none', icon:LuMapPinOff },
      { value: 'one', icon:FaMapMarkerAlt},
      { value: 'multiple', icon: TbMapPin2 },
    ],
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
    key: 'distance',
    label: 'Marker group distance (Km)',
    type: ESetting.NUMBER_FIELD,
    defaultValue: 100,
  }
];

const Settings: TSetting[] = [
  {
    key: 'properties',
    label: 'Properties',
    type: ESetting.GROUP,
    components: commonSettings,
  },
  ...load(DEFAULT_SETTINGS).filter('style.overflow','font','background'),
];
export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow','style.fontFamily',"style.fontWeight","style.fontSize","style.textAlign","style.textTransform",'background'),
];

export default Settings;
