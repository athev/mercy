import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import { deviceSdk } from '../services/deviceSdk';
import { Glasses, Bluetooth, Battery, RefreshCw, CheckCircle2, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface DevicesProps {
    onBack?: () => void;
}

export const Devices: React.FC<DevicesProps> = ({ onBack }) => {
  const [status, setStatus] = useState(deviceSdk.status);
  const [device, setDevice] = useState<Device | null>(deviceSdk.deviceInfo);
  const [battery, setBattery] = useState(deviceSdk.battery);
  const [foundDevices, setFoundDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to SDK updates
  useEffect(() => {
    const unsubStatus = deviceSdk.subscribe('status', setStatus);
    const unsubBattery = deviceSdk.subscribe('battery', setBattery);
    
    // Sync initial state
    setDevice(deviceSdk.deviceInfo);

    return () => {
        unsubStatus();
        unsubBattery();
    };
  }, []);

  // Update local device state when SDK status changes
  useEffect(() => {
      setDevice(deviceSdk.deviceInfo);
  }, [status]);

  const scanForDevices = async () => {
    setError(null);
    const devices = await deviceSdk.scanForDevices();
    setFoundDevices(devices);
  };

  const connectToDevice = async (d: Device) => {
      const success = await deviceSdk.connect(d.id);
      if (!success) {
          setError("Failed to pair with device. Make sure it's in range.");
      } else {
          setFoundDevices([]); // Clear list on success
      }
  };

  const disconnectDevice = () => {
    deviceSdk.disconnect();
    setFoundDevices([]);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="p-6 flex items-center gap-4">
          {onBack && (
              <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-zinc-900">
                  <ChevronLeft className="text-white" />
              </button>
          )}
          <h2 className="text-2xl font-bold">Device Management</h2>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {status === 'CONNECTED' && device ? (
            <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Bluetooth className="text-blue-500 w-5 h-5" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center border border-white/10">
                            <Glasses className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{device.name}</h3>
                            <p className="text-green-500 text-sm flex items-center gap-1">
                                <CheckCircle2 size={12} /> Connected
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 rounded-lg p-3">
                            <span className="text-zinc-500 text-xs uppercase">Battery</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Battery className={`w-5 h-5 ${battery < 20 ? 'text-red-500' : 'text-white'}`} />
                                <span className="text-xl font-bold">{battery}%</span>
                            </div>
                        </div>
                        <div className="bg-black/40 rounded-lg p-3">
                            <span className="text-zinc-500 text-xs uppercase">Firmware</span>
                            <div className="flex items-center gap-2 mt-1">
                                <RefreshCw className="w-4 h-4 text-zinc-400" />
                                <span className="text-lg text-zinc-300">{device.firmwareVersion}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm text-zinc-500 uppercase font-bold tracking-wider">Capabilities</h4>
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                        <span>Audio Input (Mic)</span>
                        <span className="text-green-500 text-xs bg-green-900/20 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                        <span>Camera Stream</span>
                        <span className="text-zinc-500 text-xs bg-zinc-800 px-2 py-1 rounded">Standby</span>
                    </div>
                </div>

                <Button variant="danger" onClick={disconnectDevice} className="mt-8">
                    Disconnect Device
                </Button>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full pb-20">
                 {/* Empty State / Scanning */}
                <div className={`w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center mb-6 transition-all ${status === 'SCANNING' || status === 'CONNECTING' ? 'animate-pulse border-blue-500/50' : ''}`}>
                    {status === 'SCANNING' || status === 'CONNECTING' ? (
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    ) : (
                        <Glasses className="w-12 h-12 text-zinc-600" />
                    )}
                </div>
                
                <div className="text-center space-y-2 mb-8">
                    <h3 className="text-lg font-medium">
                        {status === 'SCANNING' ? 'Searching for Glasses...' : 
                         status === 'CONNECTING' ? 'Pairing...' : 'No Glasses Connected'}
                    </h3>
                    <p className="text-zinc-500 text-sm">
                        {status === 'DISCONNECTED' ? "Connect your Mercy Smart Glasses to enable\nhands-free translation." : "Please ensure your device is in range."}
                    </p>
                </div>

                {/* Found Devices List */}
                {foundDevices.length > 0 && status === 'DISCONNECTED' && (
                    <div className="w-full mb-6 space-y-2 animate-in slide-in-from-bottom-2">
                        <p className="text-xs text-zinc-500 font-bold uppercase pl-1">Available Devices</p>
                        {foundDevices.map(d => (
                            <button 
                                key={d.id}
                                onClick={() => connectToDevice(d)}
                                className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Glasses className="w-5 h-5 text-white" />
                                    <div>
                                        <p className="font-bold text-sm">{d.name}</p>
                                        <p className="text-xs text-zinc-500">Signal: Strong</p>
                                    </div>
                                </div>
                                <div className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold">Connect</div>
                            </button>
                        ))}
                    </div>
                )}

                {status === 'DISCONNECTED' && foundDevices.length === 0 && (
                    <Button onClick={scanForDevices} className="w-full max-w-xs">
                        Scan for Devices
                    </Button>
                )}
                
                {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-200">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <p className="text-xs text-zinc-600 mt-6">Supports: Mercy Air, Mercy Pro, Generic BLE Audio</p>
            </div>
        )}
      </div>
    </div>
  );
};