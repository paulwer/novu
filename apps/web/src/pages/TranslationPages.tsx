import { IS_DOCKER_HOSTED } from '../config';

export const TranslationRoutes = () => {
  if (IS_DOCKER_HOSTED) {
    return null;
  }

  console.log('TranslationRoutes');

  const module = require('@novu/ee-translation-web');
  const Routes = module.Routes;

  return <Routes />;
};
