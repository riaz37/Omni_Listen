"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Activity, AlertCircle } from "lucide-react";

export default function AutonomousHeadPage() {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState("Disconnected");
    const [speechProb, setSpeechProb] = useState(0);
    const [transcripts, setTranscripts] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const connect = async () => {
        try {
            setError(null);
            // 1. Get Microphone Access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // 2. Setup Audio Context & Processor
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000, // Important: Match backend
            });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(512, 1, 1); // 512 buffer size
            processorRef.current = processor;

            source.connect(processor);
            processor.connect(audioContext.destination);

            // 3. Setup WebSocket
            const ws = new WebSocket("ws://localhost:8000/ws/autonomous");
            socketRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                setStatus("Listening...");
            };

            ws.onclose = (event) => {
                setIsConnected(false);
                setStatus("Disconnected");
                stop(); // Cleanup if socket closes
            };

            ws.onerror = (event) => {
                setError("WebSocket connection failed. Ensure backend is running on port 8000.");
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.status === "recording") {
                    setIsRecording(true);
                    setStatus("Recording...");
                } else if (data.status === "listening") {
                    setIsRecording(false);
                    setStatus("Listening...");
                } else if (data.status === "processing") {
                    setStatus("Processing...");
                } else if (data.status === "completed") {
                    setTranscripts(prev => [...prev, data.transcript]);
                    setStatus("Listening...");
                } else if (data.status === "discarded") {
                    setIsRecording(false);
                    let reasonText = "Unknown";
                    if (data.reason === "too_short") reasonText = "Too Short";
                    else if (data.reason === "low_confidence") reasonText = "Low Confidence";
                    else if (data.reason === "non_speech") reasonText = "Noise (Non-Speech)";

                    setStatus(`Discarded (${reasonText})`);
                    // Reset to listening after a short delay
                    setTimeout(() => setStatus("Listening..."), 2000);
                } else if (data.prob !== undefined) {
                    setSpeechProb(data.prob);
                }
            };

            // 4. Stream Audio Data
            processor.onaudioprocess = (e) => {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0);

                    // Convert float32 [-1, 1] to int16 for backend
                    const int16Data = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]));
                        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }

                    socketRef.current.send(int16Data.buffer);
                }
            };

        } catch (err: any) {
            setError(err.message || "Failed to access microphone or connect to server.");
        }
    };

    const stop = () => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsConnected(false);
        setIsRecording(false);
        setStatus("Disconnected");
    };

    useEffect(() => {
        return () => stop(); // Cleanup on unmount
    }, []);

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                        <Activity className={isConnected ? "text-primary" : "text-muted-foreground"} />
                        Autonomous Head Test
                    </h3>
                </div>
                <div className="p-6 pt-0 space-y-6">

                    {error && (
                        <div className="relative w-full rounded-lg border border-destructive/50 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-destructive text-destructive dark:border-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <h5 className="mb-1 font-medium leading-none tracking-tight">Error</h5>
                            <div className="text-sm [&_p]:leading-relaxed">{error}</div>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-muted-foreground">Status</div>
                            <div className={`text-xl font-bold ${isRecording ? "text-red-500 animate-pulse" : "text-foreground"}`}>
                                {status}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {!isConnected ? (
                                <button
                                    onClick={connect}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                                >
                                    <Mic className="w-4 h-4" /> Start
                                </button>
                            ) : (
                                <button
                                    onClick={stop}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 gap-2"
                                >
                                    <Square className="w-4 h-4" /> Stop
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium">Transcripts</div>
                        <div className="h-64 overflow-y-auto border rounded-md p-4 bg-background space-y-2">
                            {transcripts.length === 0 && (
                                <div className="text-muted-foreground text-center py-8">
                                    Speak to trigger recording...
                                </div>
                            )}
                            {transcripts.map((text, i) => (
                                <div key={i} className="p-2 bg-secondary/50 rounded text-sm">
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
