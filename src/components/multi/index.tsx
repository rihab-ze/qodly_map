import config, { IMultiMapProps } from './MultiMap.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './MultiMap.build';
import Render from './MultiMap.render';

const MultiMap: T4DComponent<IMultiMapProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

MultiMap.craft = config.craft;
MultiMap.info = config.info;
MultiMap.defaultProps = config.defaultProps;

export default MultiMap;
