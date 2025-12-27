
// Simple event bus for Paywall triggers
export const PAYWALL_EVENT = 'mercy_paywall_trigger';

interface UsageStats {
    vision: number;
    stt: number;
    translate: number;
    chat: number;
}

const STORAGE_KEY = 'mercy_quota_usage';

class QuotaService {
    private stats: UsageStats = {
        vision: 0,
        stt: 0,
        translate: 0,
        chat: 0
    };

    constructor() {
        this.load();
    }

    private load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) this.stats = JSON.parse(data);
        } catch (e) {
            console.error("Failed to load quota stats", e);
        }
    }

    private save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
    }

    increment(feature: keyof UsageStats) {
        this.stats[feature]++;
        this.save();
        console.log(`[Quota] ${feature} usage: ${this.stats[feature]}`);
    }

    getUsage(feature: keyof UsageStats): number {
        return this.stats[feature];
    }

    triggerPaywall(reason?: string) {
        console.warn(`[Quota] Paywall triggered: ${reason}`);
        window.dispatchEvent(new CustomEvent(PAYWALL_EVENT, { detail: { reason } }));
    }
}

export const quotaService = new QuotaService();
