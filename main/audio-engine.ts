import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
// import { VAD } from '@ericedouard/vad-node-realtime';  // Dynamic import if needed
const record = require('node-record-lpcm16');
import axios from 'axios';
import { io } from 'socket.io-client';

let isRecording = false;
let vadInstance: any = null;
let audioStream: any = null;

export function setupAudioEngine(mainWindow: BrowserWindow | null) {

    ipcMain.handle('start-recording', async () => {
        if (isRecording) return false;
        isRecording = true;
        startListening(mainWindow);
        return true;
    });

    ipcMain.handle('stop-recording', async () => {
        if (!isRecording) return false;
        isRecording = false;
        stopListening();
        return true;
    });
}

function startListening(mainWindow: BrowserWindow | null) {
    console.log('Starting Background Listening...');

    // Here we would initialize the VAD and recording stream
    // For now, let's just log as a placeholder until dependencies are installed

    /*
    const vad = await VAD.new({
      onSpeechStart: () => {
        console.log('Speech detected');
        mainWindow?.webContents.send('vad-status', 'speaking');
      },
      onSpeechEnd: (audio: Float32Array) => {
        console.log('Speech ended, processing...');
        mainWindow?.webContents.send('vad-status', 'processing');
        // Send to backend
        sendToBackend(audio);
      }
    });
    
    // Pipe mic to VAD
    // record.start().pipe(vad);
    */
}

function stopListening() {
    console.log('Stopping Background Listening...');
    // record.stop();
    // vadInstance?.dispose();
}

async function sendToBackend(audioData: Float32Array) {
    // Convert Float32Array to Wav or send raw to WebSocket
    // Implementation pending backend WebSocket protocol confirmation
}
