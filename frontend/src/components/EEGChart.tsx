"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Brain, Activity, Zap, Eye, RefreshCcw } from "lucide-react";

interface EEGDataPoint {
  raw: {
    alpha: number;
    beta: number;
    theta: number;
    gamma: number;
    attention: number;
    meditation: number;
    signalQuality: number;
  };
  processed: {
    focusIndex: number;
    stressIndex: number;
    fRatio: number;
    focusCategory: string;
    recommendedMode: string;
  };
  time: string;
}

export default function EEGChart({ sessionId }: { sessionId?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [pattern, setPattern] = useState("MODERATE_FOCUS");
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
    socketRef.current = io(`${url}/eeg`, {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      // Automatically start streaming on connect
      socketRef.current?.emit("startStream", { pattern, sessionId });
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current.on("eegData", (payload: any) => {
      const now = new Date();
      const timeStr = `${now.getMinutes()}:${now.getSeconds()}.${Math.floor(now.getMilliseconds()/100)}`;
      
      const newDataPoint = {
        time: timeStr,
        alpha: payload.raw.alpha,
        beta: payload.raw.beta,
        theta: payload.raw.theta,
        gamma: payload.raw.gamma,
        focus: payload.processed.focusIndex,
        fRatio: payload.processed.fRatio,
      };

      setCurrentMetrics({
        attention: payload.raw.attention,
        meditation: payload.raw.meditation,
        focusCategory: payload.processed.focusCategory,
        fRatio: payload.processed.fRatio,
        mode: payload.processed.recommendedMode,
        quality: payload.raw.signalQuality,
      });

      setData((prev) => {
        const newArray = [...prev, newDataPoint];
        // Keep last 50 points (approx 5 seconds at 10Hz) for smooth scrolling chart
        if (newArray.length > 50) return newArray.slice(newArray.length - 50);
        return newArray;
      });
    });

    return () => {
      socketRef.current?.emit("stopStream");
      socketRef.current?.disconnect();
    };
  }, [sessionId]);

  const changePattern = (newPattern: string) => {
    setPattern(newPattern);
    socketRef.current?.emit("changePattern", { pattern: newPattern, sessionId });
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="organic-card p-4 flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-muted-foreground">Focus State</span>
            <Brain className={`w-5 h-5 ${currentMetrics?.focusCategory === 'HIGH' ? 'text-primary animate-eeg-pulse' : 'text-muted-foreground'}`} />
          </div>
          <span className="text-2xl font-bold">{currentMetrics?.focusCategory || 'CALIBRATING'}</span>
          <span className="text-xs text-muted-foreground mt-1">AI Recommendation: {currentMetrics?.mode || '-'}</span>
        </div>
        
        <div className="organic-card p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-muted-foreground">F-Ratio</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold">{currentMetrics?.fRatio?.toFixed(2) || '0.00'}</span>
          <span className="text-xs text-muted-foreground mt-1">β / (α + θ)</span>
        </div>

        <div className="organic-card p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-muted-foreground">Attention</span>
            <Eye className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl font-bold">{currentMetrics?.attention || 0}%</span>
          <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${currentMetrics?.attention || 0}%` }} />
          </div>
        </div>

        <div className="organic-card p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-muted-foreground">Signal Quality</span>
            <Zap className={`w-5 h-5 ${currentMetrics?.quality > 80 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <span className="text-2xl font-bold">{currentMetrics?.quality || 0}%</span>
          <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${currentMetrics?.quality > 80 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${currentMetrics?.quality || 0}%` }} />
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="organic-card p-6 h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              Live Brainwave Telemetry
            </h3>
            <p className="text-xs text-muted-foreground">10Hz Real-time WebSocket Stream</p>
          </div>
          
          <div className="flex space-x-2">
            <select 
              value={pattern} 
              onChange={(e) => changePattern(e.target.value)}
              className="text-sm bg-background border border-border rounded-md px-3 py-1.5"
            >
              <option value="LOW_FOCUS">Simulate: Low Focus</option>
              <option value="MODERATE_FOCUS">Simulate: Moderate Focus</option>
              <option value="HIGH_FOCUS">Simulate: High Focus</option>
              <option value="STRESS">Simulate: Stress</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              
              <Line type="monotone" dataKey="alpha" stroke="#3b82f6" dot={false} strokeWidth={2} isAnimationActive={false} name="Alpha (8-13Hz)" />
              <Line type="monotone" dataKey="beta" stroke="#8b5cf6" dot={false} strokeWidth={2} isAnimationActive={false} name="Beta (14-30Hz)" />
              <Line type="monotone" dataKey="theta" stroke="#10b981" dot={false} strokeWidth={1} isAnimationActive={false} name="Theta (4-7Hz)" opacity={0.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
