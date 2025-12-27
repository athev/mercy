
import { GestureMap } from '../types';

const STORAGE_KEY = 'mercy_gesture_settings_v1';

const DEFAULT_MAPPING: GestureMap = {
    TAP: 'PLAY_PAUSE',
    DOUBLE_TAP: 'NEXT_TRACK',
    SWIPE_FORWARD: 'VOL_UP',
    SWIPE_BACKWARD: 'VOL_DOWN',
    HOLD: 'ASSISTANT'
};

export class GestureRepository {
    
    getMapping(): GestureMap {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : DEFAULT_MAPPING;
        } catch (e) {
            console.error("Failed to load gesture mapping", e);
            return DEFAULT_MAPPING;
        }
    }

    saveMapping(mapping: GestureMap): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
        } catch (e) {
            console.error("Failed to save gesture mapping", e);
        }
    }

    resetDefaults(): GestureMap {
        this.saveMapping(DEFAULT_MAPPING);
        return DEFAULT_MAPPING;
    }
}

export const gestureRepository = new GestureRepository();
