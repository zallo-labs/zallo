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
    this.save();
    return super.set(dataID, record);
  }

  private save() {
    // Clear pending save
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.listener.remove();
      this.pending = undefined;
    }

    const save = () => {
      AsyncStorage.setItem(this.key, JSON.stringify(this.toJSON()));
    };

    // Save after delay (debounce)
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(save);
    }, DELAY);

    // Save pending immediately on background
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'background') save();
    });

    this.pending = { timer, listener };
  }
}
