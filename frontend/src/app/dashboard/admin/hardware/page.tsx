"use client";

import { Battery, Bluetooth, Cpu, RefreshCw, Smartphone, Search, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHardware() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  if (loading) return <div className="animate-pulse p-4">Memuat data perangkat...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Manajemen Headband</h2>
        <div className="w-10 h-10"></div>
      </div>

      <div className="bg-primary/10 rounded-3xl p-6 text-center shadow-sm border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
        <Cpu className="w-10 h-10 mx-auto text-primary mb-3" />
        <h3 className="font-extrabold text-secondary text-xl mb-1">42 Perangkat Aktif</h3>
        <p className="text-sm text-muted-foreground font-medium mb-4">Terhubung ke server via WebSocket gateway.</p>
        
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-full text-sm hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {isScanning ? (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Memindai...</>
          ) : (
            <><Bluetooth className="w-4 h-4 mr-2" /> Pindai Perangkat Baru</>
          )}
        </button>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-extrabold text-secondary flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-primary" />
            Daftar Perangkat Terhubung
          </h3>
          <button className="text-primary hover:text-primary/80 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Device 1 */}
          <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 shrink-0">
                  <Cpu className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-sm">NERA-HB-10A-01</h4>
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mt-0.5 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                    Online (Alya J.)
                  </p>
                </div>
              </div>
              <div className="flex items-center text-secondary">
                <Battery className="w-4 h-4 mr-1 text-green-500" />
                <span className="text-xs font-bold">85%</span>
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-3 text-xs flex justify-between items-center">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">Firmware</span>
                <span className="font-semibold">v2.1.0</span>
              </div>
              <div className="w-px h-6 bg-border"></div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">Sinyal (dBm)</span>
                <span className="font-semibold">-45 (Kuat)</span>
              </div>
              <div className="w-px h-6 bg-border"></div>
              <button className="text-primary font-bold hover:underline">Kalibrasi</button>
            </div>
          </div>

          {/* Device 2 */}
          <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 shrink-0">
                  <Cpu className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-sm">NERA-HB-10B-14</h4>
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mt-0.5 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                    Online (Budi S.)
                  </p>
                </div>
              </div>
              <div className="flex items-center text-secondary">
                <Battery className="w-4 h-4 mr-1 text-orange-500" />
                <span className="text-xs font-bold">22%</span>
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-3 text-xs flex justify-between items-center">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">Firmware</span>
                <span className="font-semibold">v2.1.0</span>
              </div>
              <div className="w-px h-6 bg-border"></div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">Sinyal (dBm)</span>
                <span className="font-semibold">-68 (Cukup)</span>
              </div>
              <div className="w-px h-6 bg-border"></div>
              <button className="text-primary font-bold hover:underline">Kalibrasi</button>
            </div>
          </div>

          {/* Device 3 */}
          <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm opacity-60">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3 shrink-0">
                  <Cpu className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-sm">NERA-HB-11A-05</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 flex items-center">
                    Offline (Tidak dipakai)
                  </p>
                </div>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Battery className="w-4 h-4 mr-1" />
                <span className="text-xs font-bold">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
