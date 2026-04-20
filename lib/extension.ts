// Extension connection utility
// Handles communication between web app and Omini Listen recorder extension

// Declare chrome as a global (it exists in Chrome/Edge browsers)
declare const chrome: {
    runtime?: {
        sendMessage: (extensionId: string, message: unknown, callback: (response: unknown) => void) => void;
        lastError?: { message: string };
    };
};

// Extension IDs - will need to be updated after publishing to Chrome Web Store
const EXTENSION_IDS: string[] = [
    // Development: Use your local extension ID from edge://extensions
    'ligkiiohajikjhbcoogddgkliclhacim',
    // Production: Edge Webstore ID
    'edipmfpeajaajboenhdlcebebgapimgl',
];

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
        for (const id of EXTENSION_IDS) {
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
export async function sendTokenToExtension(token: string, userId?: number): Promise<boolean> {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        for (const id of EXTENSION_IDS) {
            try {
                const response = await new Promise<ExtensionResponse>((resolve) => {
                    chrome.runtime!.sendMessage(id, {
                        action: 'setAuthToken',
                        token,
                        userId
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
    } else {
    }
    return false;
}

// Notify extension of logout
export async function notifyExtensionLogout(): Promise<boolean> {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        for (const id of EXTENSION_IDS) {
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