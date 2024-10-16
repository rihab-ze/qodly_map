import config, { ISingleMapProps } from './SingleMap.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './SingleMap.build';
import Render from './SingleMap.render';

const SingleMap: T4DComponent<ISingleMapProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

SingleMap.craft = config.craft;
SingleMap.info = config.info;
SingleMap.defaultProps = config.defaultProps;

export default SingleMap;
