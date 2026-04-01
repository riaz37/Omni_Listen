import { app, BrowserWindow, Tray, Menu, ipcMain, shell, protocol, net, session } from 'electron';
import * as path from 'path';
import { spawn } from 'child_process';
import Store from 'electron-store';
// import { setupAudioEngine } from './audio-engine';


let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let backendProcess: any = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

// Deep Link Handling
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('esapai-listen', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('esapai-listen');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
        // Protocol handler for Windows
        // commandLine looks like: ['path/to/exe', 'esapai-listen://...']
        const url = commandLine.find(arg => arg.startsWith('esapai-listen://'));
        if (url) {
            console.log('Received deep link (Windows):', url);
            mainWindow?.webContents.send('deep-link-auth', url);
        }
    });
}

// Handle macOS open-url
app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        console.log('Received deep link (macOS):', url);
        mainWindow.webContents.send('deep-link-auth', url);
    }
});

// CRITICAL: Register custom scheme as privileged BEFORE app.ready
// This enables proper URL handling, fetch, cookies, etc.
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
            stream: true
        }
    }
]);

function getIconPath() {
    // In production (app.isPackaged), assets are usually in resources path or relative to binary.
    // In dev (from dist/main/index.js), the source public is two levels up.
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'public/esapai_logo.png');
    }
    return path.join(__dirname, '../../public/esapai_logo.png');
}

let miniWindow: BrowserWindow | null = null;
let recordingState = { isRecording: false, isPaused: false };

// Initialize electron-store for window position persistence
const store = new Store();

function createMiniWindow() {
    if (miniWindow) return;

    // Restore saved position or use default centering
    const savedBounds = store.get('miniWindowBounds') as { x?: number; y?: number; width?: number; height?: number } | undefined;
    const defaultBounds = { width: 280, height: 60 };
    
    miniWindow = new BrowserWindow({
        ...defaultBounds,
        x: savedBounds?.x,
        y: savedBounds?.y,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        movable: true, // Enable window dragging
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/index.js'),
        },
        show: false,
    });

    // Save window position when moved or resized
    miniWindow.on('moved', () => {
        if (miniWindow) {
            store.set('miniWindowBounds', miniWindow.getBounds());
        }
    });

    miniWindow.on('resized', () => {
        if (miniWindow) {
            store.set('miniWindowBounds', miniWindow.getBounds());
        }
    });

    const startUrl = process.env.ELECTRON_START_URL
        ? `${process.env.ELECTRON_START_URL}/mini`
        : 'app://frontend/mini.html';

    miniWindow.loadURL(startUrl);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/index.js'),
            backgroundThrottling: false,
        },
        autoHideMenuBar: true,
        icon: getIconPath(),
    });

    const startUrl = process.env.ELECTRON_START_URL || 'app://frontend/index.html';
    mainWindow.loadURL(startUrl);

    createMiniWindow(); // Create hidden mini window on start

    // Open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    // Close to Tray
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow?.hide();
            if (recordingState.isRecording) {
                miniWindow?.show(); // Show mini controller ONLY if recording
            }
            return false;
        }
        return true;
    });

    mainWindow.on('minimize', () => {
        if (recordingState.isRecording) {
            miniWindow?.show();
        }
    });

    mainWindow.on('restore', () => {
        miniWindow?.hide();
    });

    mainWindow.on('show', () => {
        miniWindow?.hide();
    });

    // Only open DevTools in development
    // if (process.env.NODE_ENV === 'development') {
    //     mainWindow.webContents.openDevTools();
    // }


}

// IPC for Mini Mode
ipcMain.handle('restore-main', () => {
    mainWindow?.show();
    mainWindow?.restore(); // In case it was minimized
    miniWindow?.hide();
});

ipcMain.handle('send-timer-update', (_event, time) => {
    // Forward time string to mini window
    miniWindow?.webContents.send('timer-update', time);
});

ipcMain.handle('send-processing-status', (_event, status) => {
    // Forward status string to mini window
    miniWindow?.webContents.send('processing-status', status);
});

ipcMain.handle('send-recording-state', (_event, state) => {
    // Forward recording state (isPaused) to mini window
    recordingState = { ...recordingState, ...state };
    miniWindow?.webContents.send('recording-state', state);
});

ipcMain.handle('forward-mini-action', (_event, action) => {
    if (action === 'hide' || action === 'cancel') {
        miniWindow?.hide();
    }

    if (action !== 'hide') {
        // Forward value to main window (dashboard needs to know about cancel/stop/pause)
        mainWindow?.webContents.send('trigger-mini-action', action);
    }

    // Logic to close Mini Window is handled by Renderer telling Main to hide/close 
    // OR we can just let the UI update and the user explicitly closes or we close after timeout?
    // User said: "when finished will show done and close".
    // So we might need a separate 'close-mini' event.
    // For now, removing the auto-restore.
});

// Configure custom protocol to serve static files from 'out' directory
function setupProtocol() {
    protocol.handle('app', async (request) => {
        try {
            const parsedUrl = new URL(request.url);
            let urlPath = parsedUrl.pathname;

            // Fix for Windows: new URL() might return path starting with / even if unnecessary?
            // Actually request.url for app://frontend/index.html -> pathname is /index.html

            if (urlPath === '/' || urlPath === '') {
                urlPath = '/index.html';
            }

            // Remove leading slash to prevent path.join issues on Windows
            if (urlPath.startsWith('/')) {
                urlPath = urlPath.substring(1);
            }

            // Path resolution:
            // In production: main process runs from app.asar/dist-electron/main/index.js
            //                out folder is at app.asar/out/
            //                So ../../out works for both dev and prod
            const basePath = path.join(__dirname, '../../out');
            const filePath = path.join(basePath, urlPath);

            // Debug logging
            console.log('Protocol request:', request.url, '->', filePath);

            // Read file using fs (works with ASAR) and return as Response
            const fs = require('fs');
            const data = fs.readFileSync(filePath);

            // Determine MIME type
            const mimeTypes: { [key: string]: string } = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject',
                '.txt': 'text/plain',
            };
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = mimeTypes[ext] || 'application/octet-stream';

            return new Response(data, {
                headers: { 'Content-Type': mimeType }
            });
        } catch (error: any) {
            console.error('Protocol handler error:', error.message, request.url);
            return new Response('Not Found', { status: 404 });
        }
    });
}


function createTray() {
    const iconPath = getIconPath();
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow?.show() },
        { type: 'separator' },
        {
            label: 'Quit', click: () => {
                app.isQuiting = true;
                app.quit();
            }
        },
    ]);
    tray.setToolTip('EsapListen - Background Recording Active');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow?.show();
    });
}

// Backend Management (Optional: Spawn Python Server)
function startBackend() {
    // In dev, we assume user runs backend manually or we spawn it differently.
    // In prod, we would spawn the compiled executable.
    console.log('Backend management currently expects external server on port 8000');
}

app.whenReady().then(() => {
    setupProtocol();
    createWindow();
    createTray();
    startBackend();

    // Initialize Background Audio Engine
    // setupAudioEngine(mainWindow); // Disabled as we are using frontend MediaRecorder

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Property to track quitting state
declare global {
    namespace Electron {
        interface App {
            isQuiting?: boolean;
        }
    }
}
