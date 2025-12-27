import { MediaItem } from '../types';
import { deviceSdk } from './deviceSdk';

// Local Cache Keys
const STORAGE_KEY_DOWNLOADED = 'mercy_downloaded_media';

// --- Repository Implementation ---
// Acts as a single source of truth for Media (Mocking a Hive Box/Repository)
export class AlbumRepository {
    
    // Get all media: Combined list of Local (Offline) + Remote (Device)
    async getAlbumMedia(): Promise<MediaItem[]> {
        // 1. Fetch Local
        const localMedia = this.getLocalMedia();
        const localIds = new Set(localMedia.map(m => m.id));

        // 2. Fetch Remote (if connected)
        let remoteMedia: MediaItem[] = [];
        if (deviceSdk.status === 'CONNECTED') {
            try {
                remoteMedia = await deviceSdk.listMediaFiles();
            } catch (e) {
                console.warn("Failed to fetch remote media", e);
            }
        }

        // 3. Merge: If item exists locally, use local version (it might have better metadata/url)
        // Otherwise use remote. 
        const merged = [...localMedia];
        
        remoteMedia.forEach(remoteItem => {
            if (!localIds.has(remoteItem.id)) {
                merged.push({ ...remoteItem, isDownloaded: false });
            }
        });

        // Sort by timestamp desc
        return merged.sort((a, b) => b.timestamp - a.timestamp);
    }

    getLocalMedia(): MediaItem[] {
        try {
            const json = localStorage.getItem(STORAGE_KEY_DOWNLOADED);
            return json ? JSON.parse(json) : [];
        } catch (e) {
            console.error("Storage Error", e);
            return [];
        }
    }

    async saveToLocal(item: MediaItem, onProgress?: (p: number) => void): Promise<void> {
        // Simulate Download Progress
        if (onProgress) {
            for (let i = 0; i <= 100; i += 10) {
                onProgress(i);
                await new Promise(r => setTimeout(r, 150)); // Simulating network speed
            }
        }

        const localItems = this.getLocalMedia();
        if (!localItems.find(i => i.id === item.id)) {
            const newItem = { ...item, isDownloaded: true };
            localItems.push(newItem);
            localStorage.setItem(STORAGE_KEY_DOWNLOADED, JSON.stringify(localItems));
        }
    }

    async deleteLocal(id: string): Promise<void> {
        const localItems = this.getLocalMedia();
        const filtered = localItems.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY_DOWNLOADED, JSON.stringify(filtered));
    }

    clearCache() {
        localStorage.removeItem(STORAGE_KEY_DOWNLOADED);
    }
}

export const albumRepository = new AlbumRepository();