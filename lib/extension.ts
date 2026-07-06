// Extension connection utility
// Handles communication between web app and Omini Listen recorder extension

// Declare chrome as a global (it exists in Chrome/Edge browsers)
declare const chrome: {
    runtime?: {
        sendMessage: (extensionId: string, message: unknown, callback: (response: unknown) => void) => void;
        lastError?: { message: string };
    };
};

// Fallback hardcoded IDs — used only when the web-app-bridge content script
// hasn't run (e.g. extension not installed, or running on an unlisted origin).
const FALLBACK_EXTENSION_IDS: string[] = [
    'ligkiiohajikjhbcoogddgkliclhacim', // dev (local unpacked)
    'edipmfpeajaajboenhdlcebebgapimgl', // production (Edge Add-ons)
];

// The web-app-bridge.js content script stamps the live extension ID onto the
// document at document_start. Read it once and cache — prevents XSS from
// swapping the attribute between the initial stamp and token delivery.
let _dynamicIdChecked = false;
let _dynamicId: string | undefined;

function getDynamicExtensionId(): string | undefined {
    if (!_dynamicIdChecked) {
        _dynamicIdChecked = true;
        if (typeof document !== 'undefined') {
            _dynamicId = document.documentElement.dataset.omnilistenId || undefined;
        }
    }
    return _dynamicId;
}

function getExtensionIds(): string[] {
    const dynamic = getDynamicExtensionId();
    if (dynamic) return [dynamic];
    return FALLBACK_EXTENSION_IDS;
}

interface ExtensionStatus {
    installed: boolean;
    connected: boolean;
}

interface ExtensionResponse {
    success?: boolean;
    installed?: boolean;
    connected?: boolean;
}

// Check if extension is installed
export async function checkExtensionInstalled(): Promise<ExtensionStatus> {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        for (const id of getExtensionIds()) {
            try {
                const response = await new Promise<ExtensionStatus>((resolve) => {
                    chrome.runtime!.sendMessage(id, { action: 'checkConnection' }, (response: unknown) => {
                        if (chrome.runtime!.lastError) {
                            resolve({ installed: false, connected: false });
                        } else {
                            const res = response as ExtensionResponse;
                            resolve({ installed: res?.installed ?? false, connected: res?.connected ?? false });
                        }
                    });
                });
                if (response.installed) return response;
            } catch {
                continue;
            }
        }
    }
    return { installed: false, connected: false };
}

// Send auth token to extension
export async function sendTokenToExtension(token: string, userId?: number, refreshToken?: string): Promise<boolean> {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        for (const id of getExtensionIds()) {
            try {
                const response = await new Promise<ExtensionResponse>((resolve) => {
                    chrome.runtime!.sendMessage(id, {
                        action: 'setAuthToken',
                        token,
                        userId,
                        refreshToken: refreshToken || null
                    }, (response: unknown) => {
                        if (chrome.runtime!.lastError) {
                            resolve({ success: false });
                        } else {
                            resolve((response as ExtensionResponse) || { success: false });
                        }
                    });
                });
                if (response.success) {
                    return true;
                }
            } catch (error) {
                continue;
            }
        }
    }
    return false;
}

// Notify extension of logout
export async function notifyExtensionLogout(): Promise<boolean> {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        for (const id of getExtensionIds()) {
            try {
                const response = await new Promise<ExtensionResponse>((resolve) => {
                    chrome.runtime!.sendMessage(id, { action: 'logout' }, (response: unknown) => {
                        if (chrome.runtime!.lastError) {
                            resolve({ success: false });
                        } else {
                            resolve((response as ExtensionResponse) || { success: false });
                        }
                    });
                });
                if (response.success) return true;
            } catch {
                continue;
            }
        }
    }
    return false;
}