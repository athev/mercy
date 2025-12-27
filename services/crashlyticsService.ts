
class CrashlyticsService {
    private static instance: CrashlyticsService;

    private constructor() {}

    public static getInstance(): CrashlyticsService {
        if (!CrashlyticsService.instance) {
            CrashlyticsService.instance = new CrashlyticsService();
        }
        return CrashlyticsService.instance;
    }

    public log(message: string) {
        // Logs a message that will be included in the next crash report
        console.log(`📝 [Crashlytics Log] ${message}`);
    }

    public recordError(error: any, stack?: string, context?: string) {
        // In real app: firebase.crashlytics().recordError(error, stack);
        console.group(`🔥 [Crashlytics] Exception Caught in ${context || 'App'}`);
        console.error(error);
        if (stack) console.warn(stack);
        console.groupEnd();
    }
}

export const crashlytics = CrashlyticsService.getInstance();
