import { DataID, RecordSource } from 'relay-runtime';
import { Record, RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, InteractionManager, NativeEventSubscription } from 'react-native';

const DELAY = 2_000;

// All records stored in memory, and persisted to AsyncStorage
export class PersitedRecordSource extends RecordSource {
  private pending: { timer: NodeJS.Timeout; listener: NativeEventSubscription } | undefined;

  constructor(
    private key: string,
    records?: RecordMap,
  ) {
    super(records);
  }

  static async restore(key: string) {
    const json = await AsyncStorage.getItem(key);
    const records = json ? JSON.parse(json) : undefined;
    return new PersitedRecordSource(key, records);
  }

  set(dataID: DataID, record: Record): void {
    this.saveAfterDelay();
    return super.set(dataID, record);
  }

  private saveAfterDelay() {
    this.clearPending();

    // Save after delay (debounce)
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => this.save());
    }, DELAY);

    // Save pending immediately on background
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'background') this.save();
    });

    this.pending = { timer, listener };
  }

  private clearPending() {
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.listener.remove();
      this.pending = undefined;
    }
  }

  private save() {
    this.clearPending();

    const allRecords = this.toJSON();

    const filteredRecords = Object.fromEntries(
      Object.entries(allRecords)
        .filter(([key]) => !key.startsWith('client:local'))
        .map(([key, value]) => {
          if ('__invalidated_at' in value) {
            const { __invalidated_at, ...rest } = value;
            return [key, rest];
          }

          return [key, value];
        }),
    );

    AsyncStorage.setItem(this.key, JSON.stringify(filteredRecords));
  }
}
