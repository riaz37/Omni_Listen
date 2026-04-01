import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    startRecording: () => ipcRenderer.invoke('start-recording'),
    stopRecording: () => ipcRenderer.invoke('stop-recording'),
    onVadStatus: (callback: (status: string) => void) =>
        ipcRenderer.on('vad-status', (_event, value) => callback(value)),
    restoreMain: () => ipcRenderer.invoke('restore-main'),
    sendMiniAction: (action: string) => ipcRenderer.invoke('forward-mini-action', action),
    onMiniAction: (callback: (action: string) => void) =>
        ipcRenderer.on('trigger-mini-action', (_event, value) => callback(value)),
    sendTimerUpdate: (time: string) => ipcRenderer.invoke('send-timer-update', time),
    onTimerUpdate: (callback: (time: string) => void) =>
        ipcRenderer.on('timer-update', (_event, value) => callback(value)),
    sendProcessingStatus: (status: string) => ipcRenderer.invoke('send-processing-status', status),
    onProcessingStatus: (callback: (status: string) => void) =>
        ipcRenderer.on('processing-status', (_event, value) => callback(value)),
    sendRecordingState: (state: { isPaused: boolean; isRecording: boolean }) => ipcRenderer.invoke('send-recording-state', state),
    onRecordingState: (callback: (state: { isPaused: boolean }) => void) =>
        ipcRenderer.on('recording-state', (_event, value) => callback(value)),
    onDeepLinkAuth: (callback: (url: string) => void) =>
        ipcRenderer.on('deep-link-auth', (_event, value) => callback(value)),
});
