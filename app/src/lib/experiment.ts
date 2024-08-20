import '#/Analytics'; // Initialize amplitude
import { Experiment } from '@amplitude/experiment-react-native-client';
import { CONFIG } from '~/util/config';

export const experiment = Experiment.initializeWithAmplitudeAnalytics(CONFIG.amplitudeKey);
experiment.start();
