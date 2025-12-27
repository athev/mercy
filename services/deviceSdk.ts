
import { Device, MediaItem, IDeviceService, GestureMap, FirmwareProgress } from '../types';
import { analytics } from './analyticsService';
import { crashlytics } from './crashlyticsService';

type DeviceStatus = 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED';
type DeviceEvent = 'status' | 'battery' | 'settings' | 'log' | 'firmware_progress';

interface DeviceSettings {
    maxVideoDuration: number; // in minutes
    maxAudioDuration: number; // in minutes
}

export class MockDeviceService implements IDeviceService {
  private _status: DeviceStatus = 'DISCONNECTED';
  private _battery: number = 0;
  private _deviceInfo: Device | null = null;
  private _settings: DeviceSettings = {
      maxVideoDuration: 3,
      maxAudioDuration: 60
  };
  private _gestureMapping: GestureMap | null = null;

  private listeners: Map<DeviceEvent, Set<(data: any) => void>> = new Map();
  private logs: string[] = [];

  constructor() {
    this._status = 'DISCONNECTED';
    this.listeners.set('status', new Set());
    this.listeners.set('battery', new Set());
    this.listeners.set('settings', new Set());
    this.listeners.set('log', new Set());
    this.listeners.set('firmware_progress', new Set());
  }

  // --- Public Getters ---
  get status() { return this._status; }
  get deviceInfo() { return this._deviceInfo; }
  get settings() { return this._settings; }
  get recentLogs() { return this.logs; }
  get battery() { return this._battery; } // Legacy getter for UI compat

  // --- Connection Logic ---
  async scanForDevices(): Promise<Device[]> {
    this.log("Scanning for BLE devices...");
    this.setStatus('SCANNING');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setStatus('DISCONNECTED');
        this.log("Device found: Mercy Glass Pro (Signal: -45dBm)");
        resolve([{
          id: 'mercy-glass-mvp',
          name: 'Mercy Glass Pro',
          connected: false,
          batteryLevel: 78,
          type: 'GLASSES_AI',
          firmwareVersion: '1.0.0-MVP',
          image: ''
        }]);
      }, 2000);
    });
  }

  async connect(deviceId: string): Promise<boolean> {
    this.log(`Initiating connection to ${deviceId}...`);
    this.setStatus('CONNECTING');
    crashlytics.log(`Attempting connection to ${deviceId}`);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            await this.mockConnectionHandshake();
            this._deviceInfo = {
                id: deviceId,
                name: 'Mercy Glass Pro',
                connected: true,
                batteryLevel: 85,
                type: 'GLASSES_AI',
                firmwareVersion: '1.0.0-MVP'
            };
            this._battery = 85;
            this.setStatus('CONNECTED');
            this.log("Connected securely.");
            
            // Analytics: Success
            analytics.logDeviceConnect(deviceId, true);
            
            this.startBatteryMonitor();
            return true;
        } catch (e) {
            attempts++;
            this.log(`Connection attempt ${attempts} failed. Retrying...`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    this.setStatus('DISCONNECTED');
    this.log("Failed to connect after 3 attempts.");
    
    // Analytics: Fail
    analytics.logDeviceConnect(deviceId, false, "Timeout after 3 attempts");
    crashlytics.recordError(new Error("Connection Timeout"), undefined, 'DeviceSDK.connect');
    
    return false;
  }

  async disconnect(): Promise<void> {
    this.log("Disconnecting...");
    this._deviceInfo = null;
    this._battery = 0;
    this.setStatus('DISCONNECTED');
  }

  async getBatteryLevel(): Promise<number> {
      return this._battery;
  }

  // --- Actions ---

  async capturePhoto(): Promise<boolean> {
      return this.sendCommand('CAPTURE_PHOTO');
  }

  async startVideoRecording(): Promise<boolean> {
      return this.sendCommand('START_RECORDING');
  }

  async stopVideoRecording(): Promise<boolean> {
      return this.sendCommand('STOP_RECORDING');
  }

  async startAudioRecording(): Promise<boolean> {
      return this.sendCommand('START_AUDIO');
  }

  async stopAudioRecording(): Promise<boolean> {
      return this.sendCommand('STOP_AUDIO');
  }
  
  updateSettings(newSettings: Partial<DeviceSettings>) {
      this._settings = { ...this._settings, ...newSettings };
      this.log(`Settings updated: Video=${this._settings.maxVideoDuration}m, Audio=${this._settings.maxAudioDuration}m`);
      this.emit('settings', this._settings);
  }

  async updateFirmware(file?: File): Promise<void> {
      if (this._status !== 'CONNECTED') throw new Error("Device not connected");
      
      this.log("Starting Firmware Update Process...");
      analytics.logFirmwareUpdate('start');
      
      const emitProgress = (state: FirmwareProgress) => {
          this.emit('firmware_progress', state);
          if (state.stage !== 'IDLE') {
             // this.log(`FW: ${state.stage} (${state.progress}%)`);
          }
      };

      try {
        // 1. Downloading
        emitProgress({ stage: 'DOWNLOADING', progress: 0, message: 'Fetching package...' });
        for (let i = 0; i <= 100; i += 20) {
            await new Promise(r => setTimeout(r, 400));
            emitProgress({ stage: 'DOWNLOADING', progress: i, message: 'Downloading firmware...' });
        }

        // 2. Flashing
        emitProgress({ stage: 'FLASHING', progress: 0, message: 'Writing to memory...' });
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(r => setTimeout(r, 800)); // Flashing takes longer
            emitProgress({ stage: 'FLASHING', progress: i, message: 'Do not turn off device...' });
        }

        // 3. Verifying
        emitProgress({ stage: 'VERIFYING', progress: 0, message: 'Checking checksums...' });
        await new Promise(r => setTimeout(r, 1500));
        emitProgress({ stage: 'VERIFYING', progress: 100, message: 'Integrity verified.' });

        // 4. Complete
        await new Promise(r => setTimeout(r, 500));
        this.log("Firmware Update Complete. v1.2.0 installed.");
        
        if (this._deviceInfo) {
            this._deviceInfo.firmwareVersion = '1.2.0-STABLE';
            this.emit('status', this._status); // Trigger UI update for version text
        }

        analytics.logFirmwareUpdate('success', '1.2.0-STABLE');
        emitProgress({ stage: 'COMPLETE', progress: 100, message: 'Update Successful' });
        
      } catch (error) {
          analytics.logFirmwareUpdate('fail');
          crashlytics.recordError(error, undefined, 'FirmwareUpdate');
          emitProgress({ stage: 'FAILED', progress: 0, message: 'Update Failed' });
          throw error;
      }
  }

  async setGestureMapping(mapping: GestureMap): Promise<boolean> {
      if (this._status !== 'CONNECTED') {
          this.log("Cannot sync gestures: Device disconnected.");
          return false;
      }
      
      this.log("Syncing gesture map to device...");
      await new Promise(r => setTimeout(r, 800)); // Simulate BLE write
      this._gestureMapping = mapping;
      this.log("Gestures updated successfully.");
      return true;
  }

  // --- Media Management ---

  async listMediaFiles(): Promise<MediaItem[]> {
      if (this._status !== 'CONNECTED') {
          this.log("Cannot list media: Disconnected");
          return [];
      }
      this.log("Listing media files from device...");
      await new Promise(r => setTimeout(r, 800)); // Simulate fetch latency
      return [
          { id: `file-${Date.now()}-1`, type: 'image', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', timestamp: Date.now() - 500000, location: 'Synced', aiDescription: 'Office View' },
          { id: `file-${Date.now()}-2`, type: 'image', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600', timestamp: Date.now() - 1000000, location: 'Synced', aiDescription: 'Hiking Trip' },
          { id: `file-${Date.now()}-3`, type: 'video', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', timestamp: Date.now() - 3600000, location: 'Synced', aiDescription: 'City Walk' },
          { id: `file-${Date.now()}-4`, type: 'audio', url: 'MOCK_AUDIO', timestamp: Date.now() - 7200000, location: 'Synced', aiDescription: 'Meeting Notes' },
          { id: `file-${Date.now()}-5`, type: 'audio', url: 'MOCK_AUDIO', timestamp: Date.now() - 8000000, location: 'Synced', aiDescription: 'Ambient Noise' },
      ];
  }

  async downloadMediaFile(fileId: string): Promise<string> {
      this.log(`Downloading file ${fileId}...`);
      await new Promise(r => setTimeout(r, 1500)); // Simulate transfer
      this.log(`Download complete: ${fileId}`);
      // In a real app, this would return a Blob URL or base64. 
      // For mock, we return the same placeholder URL or a "downloaded" variant.
      return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&downloaded=true';
  }

  // Kept for backward compatibility if needed, but 'listMediaFiles' is preferred
  async syncMedia(onProgress: (percent: number) => void): Promise<MediaItem[]> {
     return this.listMediaFiles();
  }

  // --- Private Helpers ---

  private async sendCommand(command: string): Promise<boolean> {
    if (this._status !== 'CONNECTED') {
        this.log(`Command ${command} failed: Device not connected.`);
        return false;
    }
    this.log(`Sending Command: ${command}`);
    await new Promise(r => setTimeout(r, 300));
    this.log(`Command ${command} ACK received.`);
    return true;
  }

  private mockConnectionHandshake() {
      return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
              Math.random() > 0.1 ? resolve() : reject(new Error("Connection timeout"));
          }, 1500);
      });
  }

  private startBatteryMonitor() {
      setInterval(() => {
          if (this._status === 'CONNECTED' && this._battery > 0) {
              this._battery = Math.max(0, this._battery - 1);
              this.emit('battery', this._battery);
          }
      }, 60000); 
  }

  private setStatus(status: DeviceStatus) {
      this._status = status;
      this.emit('status', status);
  }

  private log(message: string) {
      const timestamp = new Date().toLocaleTimeString();
      const entry = `[${timestamp}] ${message}`;
      console.log(entry);
      this.logs.unshift(entry);
      if (this.logs.length > 50) this.logs.pop();
      this.emit('log', entry);
  }

  // --- Event System ---
  subscribe(event: DeviceEvent, callback: (data: any) => void) {
      this.listeners.get(event)?.add(callback);
      if (event === 'status') callback(this._status);
      if (event === 'battery') callback(this._battery);
      if (event === 'settings') callback(this._settings);
      return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: DeviceEvent, data: any) {
      this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// Singleton export for simple module injection, but Context is preferred for React
export const deviceSdk = new MockDeviceService();
