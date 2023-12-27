import { CONFIG } from '~/config';
import { ampli } from '~/util/ampli';

ampli.load({
  client: {
    apiKey: CONFIG.amplitudeKey,
    configuration: {
      useBatch: true,
    },
  },
});
