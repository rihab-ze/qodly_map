import config, { IMapsProps } from './Maps.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './Maps.build';
import Render from './Maps.render';

const Maps: T4DComponent<IMapsProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

Maps.craft = config.craft;
Maps.info = config.info;
Maps.defaultProps = config.defaultProps;

export default Maps;
