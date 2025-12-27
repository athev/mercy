
type EventParams = Record<string, string | number | boolean>;

class AnalyticsService {
    private static instance: AnalyticsService;
    private enabled: boolean = true;

    private constructor() {}

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    // Core Logger
    public logEvent(eventName: string, params?: EventParams): void {
        if (!this.enabled) return;
        
        // In a real app, this would be: firebase.analytics().logEvent(eventName, params);
        console.groupCollapsed(`📊 [Analytics] ${eventName}`);
        console.table(params);
        console.groupEnd();
    }

    // --- Typed Helper Methods ---

    public logDeviceConnect(deviceId: string, success: boolean, error?: string) {
        this.logEvent(success ? 'device_connect_success' : 'device_connect_fail', {
            device_id: deviceId,
            error_msg: error || ''
        });
    }

    public logTranslation(action: 'start' | 'stop', mode: 'simultaneous' | 'conversation', languagePair?: string) {
        this.logEvent(action === 'start' ? 'start_translation' : 'stop_translation', {
            mode,
            language_pair: languagePair || 'unknown'
        });
    }

    public logVisionAnalyze(success: boolean) {
        this.logEvent('ai_vision_analyze', {
            success
        });
    }

    public logChatSend(hasAttachment: boolean) {
        this.logEvent('chat_send', {
            has_attachment: hasAttachment
        });
    }

    public logFirmwareUpdate(status: 'start' | 'success' | 'fail', version?: string) {
        this.logEvent(`firmware_update_${status}`, {
            target_version: version || 'unknown'
        });
    }
}

export const analytics = AnalyticsService.getInstance();
