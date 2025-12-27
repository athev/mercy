
import { authService } from './authService';
import { quotaService } from './quotaService';

// Mimicking Dio's Options
interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
}

interface ApiError {
    status: number;
    message: string;
    code?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.mercy.ai/v1';

class HttpClient {
    private async getAuthToken(): Promise<string | null> {
        // In a real app, you might refresh the token here if expired
        const userStr = localStorage.getItem('mercy_auth_session');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.uid; // Using UID as mock token
        }
        return null;
    }

    private async request<T>(endpoint: string, method: string, body?: any, options: RequestOptions = {}): Promise<T> {
        const token = await this.getAuthToken();
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), options.timeout || 30000);

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal
            });

            clearTimeout(id);

            // --- Global Error Interceptor ---
            if (!response.ok) {
                // Handle Quota/Payment errors globally
                if (response.status === 402 || response.status === 429) {
                    quotaService.triggerPaywall(response.status === 429 ? "Rate Limit Exceeded" : "Premium Feature");
                    throw { status: response.status, message: "Quota Exceeded" };
                }

                // Handle Auth errors
                if (response.status === 401) {
                    await authService.signOut();
                    window.location.reload(); // Simple redirect to login
                    throw { status: 401, message: "Unauthorized" };
                }

                const errorBody = await response.json().catch(() => ({}));
                throw { 
                    status: response.status, 
                    message: errorBody.message || "Unknown Error",
                    code: errorBody.code 
                } as ApiError;
            }

            return await response.json();

        } catch (error: any) {
            console.error(`[API] ${method} ${endpoint} failed:`, error);
            throw error;
        }
    }

    // --- Public Methods ---

    public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, 'GET', undefined, options);
    }

    public async post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, 'POST', data, options);
    }

    public async put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, 'PUT', data, options);
    }

    public async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, 'DELETE', undefined, options);
    }
    
    // For uploading files (Multipart)
    public async upload<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
        const token = await this.getAuthToken();
        const headers: Record<string, string> = { ...options.headers }; // Don't set Content-Type for FormData, browser does it
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
             if (response.status === 402 || response.status === 429) {
                quotaService.triggerPaywall();
            }
            throw { status: response.status, message: "Upload failed" };
        }
        return await response.json();
    }
}

export const httpClient = new HttpClient();
