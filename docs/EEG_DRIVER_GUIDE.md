# EEG Driver Integration Guide

## 📡 Overview

NERA includes a comprehensive EEG driver layer supporting multiple headband types with a unified interface. This guide explains how to use, extend, and integrate real EEG devices.

---

## 🎧 Supported Devices

### 1. **Muse 2 (Muse Gen II)**
- **Channels**: 4 EEG (TP9, AF7, AF8, TP10)
- **Sampling Rate**: 256 Hz
- **Connection**: Bluetooth LE
- **Battery**: 5-6 hours
- **Status**: ✅ Fully Implemented
- **Notes**: Most popular consumer EEG headband, excellent signal quality

### 2. **NeuroSky MindWave Mobile 2**
- **Channels**: 1 EEG (Fp1)
- **Sampling Rate**: 512 Hz (raw), 1 Hz (processed)
- **Connection**: Bluetooth/Serial
- **Battery**: 8+ hours
- **Status**: ✅ Fully Implemented
- **Notes**: Great for budget-conscious projects, good eSense metrics

### 3. **Emotiv Insight**
- **Channels**: 5 EEG
- **Sampling Rate**: 128 Hz
- **Connection**: Bluetooth LE / USB
- **Status**: ⏳ Coming Soon
- **Notes**: Professional-grade device

### 4. **Simulator (Development)**
- **Channels**: Configurable (default 4)
- **Sampling Rate**: Configurable (default 256 Hz)
- **Status**: ✅ Always Available
- **Notes**: For development and testing without hardware

---

## 🚀 Quick Start

### Using the Device Manager

```typescript
import { createDeviceManager } from './modules/eeg-driver/device-manager';

// Initialize device manager with default simulator
const manager = createDeviceManager({
  deviceType: 'SIMULATOR',
  samplingRate: 256,
  channelCount: 4,
});

// Initialize
await manager.initialize();

// Connect
await manager.connect();

// Setup data callback
manager.onDataReceived((sample) => {
  console.log('EEG Sample:', sample);
  console.log('Channels:', sample.channels);
  console.log('Quality:', sample.quality);
});

// Start streaming
await manager.startStreaming();

// Later: stop and disconnect
await manager.stopStreaming();
await manager.disconnect();
```

### Switching Devices

```typescript
// Switch from simulator to Muse 2
await manager.switchDevice('MUSE_2', {
  bluetoothAddress: '00:1A:7D:DA:71:13' // Optional
});

// Or switch to NeuroSky
await manager.switchDevice('NEURSKY_MINDWAVE', {
  serialPort: 'COM3' // Windows
  // or
  // serialPort: '/dev/ttyUSB0' // Linux
  // or
  // serialPort: '/dev/tty.usbserial' // macOS
});
```

---

## 📊 Device Status & Information

### Get Device Status

```typescript
const status = await manager.getStatus();
console.log(status);
// Output:
// {
//   connected: true,
//   deviceType: 'Muse 2',
//   signalQuality: 92,
//   batteryLevel: 78,
//   activeChannels: 4,
//   samplingRate: 256
// }
```

### Get Device Info

```typescript
const info = await manager.getDeviceInfo();
console.log(info);
// Output:
// {
//   deviceType: 'Muse 2',
//   firmwareVersion: '4.4.10',
//   serialNumber: 'MUSE-ABC123',
//   channels: '4 (TP9, AF7, AF8, TP10)',
//   samplingRate: '256 Hz'
// }
```

### Calibrate Device

```typescript
// Calibrate for 5 seconds
await manager.calibrate(5000);
```

---

## 🔌 Using Individual Drivers Directly

If you prefer to use a specific driver directly:

### Muse 2

```typescript
import { Muse2Driver } from './modules/eeg-driver/muse-2.driver';

const driver = new Muse2Driver();

// Initialize
await driver.initialize({
  deviceType: 'MUSE_2',
  samplingRate: 256,
});

// Connect
await driver.connect();

// Setup callbacks
driver.onDataReceived((sample) => {
  console.log('Sample:', sample);
});

// Start streaming
await driver.startStreaming();
```

### NeuroSky MindWave

```typescript
import { NeuroSkyMindWaveDriver } from './modules/eeg-driver/neursky-mindwave.driver';

const driver = new NeuroSkyMindWaveDriver();

await driver.initialize({
  deviceType: 'NEURSKY_MINDWAVE',
  serialPort: 'COM3', // Windows
  baudRate: 57600,
});

await driver.connect();
await driver.startStreaming();
```

### Simulator

```typescript
import { SimulatorDriver } from './modules/eeg-driver/simulator.driver';

const driver = new SimulatorDriver();

await driver.initialize({
  deviceType: 'SIMULATOR',
  channelCount: 4,
  samplingRate: 256,
});

// For testing, you can manipulate the simulation
driver.setFocusLevel(85); // High focus
driver.setStressLevel(20); // Low stress

// Simulate signal loss
await driver.simulateSignalLoss(2000);

// Simulate battery drain
await driver.simulateBatteryDrain(10); // Drain 10%
```

---

## 🏗️ Architecture

### Interface-Based Design

All drivers implement the `EEGDeviceDriver` interface:

```typescript
interface EEGDeviceDriver {
  initialize(config: EEGDeviceConfig): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getStatus(): Promise<DeviceStatus>;
  onDataReceived(callback: (sample: RawEEGSample) => void): void;
  onConnectionStatusChanged(callback: (connected: boolean) => void): void;
  onError(callback: (error: Error) => void): void;
  startStreaming(): Promise<void>;
  stopStreaming(): Promise<void>;
  getDeviceInfo(): Promise<Record<string, string>>;
  calibrate?(duration: number): Promise<void>;
}
```

### Device Manager Factory Pattern

The `EEGDeviceManager` uses the factory pattern to create appropriate drivers:

```
EEGDeviceManager
├── createDriver(deviceType)
│   ├── 'MUSE_2' → Muse2Driver
│   ├── 'NEURSKY_MINDWAVE' → NeuroSkyMindWaveDriver
│   ├── 'EMOTIV_INSIGHT' → SimulatorDriver (for now)
│   └── 'SIMULATOR' → SimulatorDriver
└── switchDevice(newType)
```

---

## 📡 Real Device Integration

### For Muse 2 (Bluetooth LE)

**Requirements:**
- Muse 2 headband
- Bluetooth adapter (built-in on most laptops)
- Platform support: Windows, macOS, Linux, Web (experimental)

**Connection Steps:**
1. Put Muse 2 in pairing mode (hold power button)
2. Create device manager with MUSE_2 type
3. Call `connect()` - browser will request Bluetooth access
4. Select your Muse device from the list

**Implementation Notes:**
- Uses Web Bluetooth API (`navigator.bluetooth`)
- Supports GATT characteristic reading
- Real-time data streaming via notifications

### For NeuroSky MindWave (Serial)

**Requirements:**
- NeuroSky MindWave headband
- Serial driver (USB-to-Serial for USB models)
- Platform support: Windows, macOS, Linux (Web Bluetooth available)

**Connection Steps:**
1. Identify serial port:
   - Windows: `COM1`, `COM2`, etc. (Device Manager)
   - macOS: `/dev/tty.usbserial-*`
   - Linux: `/dev/ttyUSB0`, `/dev/ttyUSB1`, etc.
2. Create device manager with NEURSKY_MINDWAVE type and serialPort
3. Call `connect()` to establish serial connection

**Implementation Notes:**
- Uses Web Serial API or Node.js serial library
- Default baud rate: 57600
- Packet-based communication

---

## 🧪 Testing & Simulation

### Automated Testing

```typescript
import { SimulatorDriver } from './modules/eeg-driver/simulator.driver';

async function testEEGPipeline() {
  const driver = new SimulatorDriver();
  
  // Test normal operation
  await driver.initialize();
  await driver.connect();
  
  let samplesReceived = 0;
  driver.onDataReceived(() => {
    samplesReceived++;
  });
  
  await driver.startStreaming();
  
  // Let it run for 1 second
  await new Promise(r => setTimeout(r, 1000));
  
  // Should receive ~256 samples (256 Hz)
  console.assert(samplesReceived > 200, 'Expected 256 samples, got ' + samplesReceived);
  
  // Test signal loss
  await driver.simulateSignalLoss(500);
  
  // Test device switch
  const status = await driver.getStatus();
  console.assert(status.connected, 'Expected connected status');
}
```

### Manual Testing with Different States

```typescript
const simulator = new SimulatorDriver();

// Test high focus state
simulator.setFocusLevel(90);
// Process EEG → Should show high focus score

// Test high stress state
simulator.setStressLevel(80);
// Process EEG → Should show high stress

// Test signal degradation
simulator.setFocusLevel(50);
simulator.setStressLevel(50);
// Process EEG → Should show mixed metrics
```

---

## 🔧 Adding New Device Support

### Step 1: Create Driver Class

```typescript
// devices/my-device.driver.ts
import { EEGDeviceDriver, EEGDeviceConfig, RawEEGSample } from './eeg-device.interface';

export class MyDeviceDriver implements EEGDeviceDriver {
  // Implement all interface methods
  async initialize(config: EEGDeviceConfig): Promise<void> {
    // Initialize connection
  }

  async connect(): Promise<void> {
    // Establish connection to device
  }

  // ... implement other methods
}
```

### Step 2: Register Driver

Update `device-manager.ts`:

```typescript
private createDriver(deviceType: string): EEGDeviceDriver | null {
  switch (deviceType.toUpperCase()) {
    case 'MY_DEVICE':
      return new MyDeviceDriver();
    // ... existing cases
  }
}
```

### Step 3: Export Driver

Update `modules/eeg-driver/index.ts`:

```typescript
export * from './my-device.driver';
```

### Step 4: Add to Supported Devices

```typescript
static readonly SUPPORTED_DEVICES = [
  'MUSE_2',
  'NEURSKY_MINDWAVE',
  'MY_DEVICE', // Add here
  'SIMULATOR'
] as const;
```

---

## 📊 Data Format

### Raw EEG Sample

```typescript
interface RawEEGSample {
  timestamp: number;        // Unix timestamp in milliseconds
  channels: number[];       // Raw channel values in microvolts (µV)
  sampleId: number;        // Sequential sample number
  quality?: number;        // Signal quality 0-100
}

// Example:
{
  timestamp: 1693321320000,
  channels: [102.5, 98.3, 101.2, 99.7],  // 4 channels
  sampleId: 42,
  quality: 92
}
```

### Device Status

```typescript
interface DeviceStatus {
  connected: boolean;       // Is device connected?
  deviceType: string;       // Device type string
  signalQuality: number;    // 0-100
  batteryLevel?: number;    // 0-100 (if available)
  lastDataPoint?: number;   // Unix timestamp
  activeChannels: number;   // Number of active EEG channels
  samplingRate: number;     // Sampling rate in Hz
}
```

---

## ⚙️ Configuration Options

### Muse 2 Config

```typescript
{
  deviceType: 'MUSE_2',
  bluetoothAddress?: 'xx:xx:xx:xx:xx:xx',  // Optional
  samplingRate?: 256,
  channelCount?: 4,
}
```

### NeuroSky Config

```typescript
{
  deviceType: 'NEURSKY_MINDWAVE',
  serialPort: 'COM3',          // Required on desktop
  baudRate?: 57600,            // Optional
  samplingRate?: 512,
  channelCount?: 1,
}
```

### Simulator Config

```typescript
{
  deviceType: 'SIMULATOR',
  samplingRate?: 256,          // 1-512 Hz
  channelCount?: 4,            // 1-8 channels
}
```

---

## 🐛 Troubleshooting

### Device Won't Connect

**Muse 2:**
- Ensure Muse 2 is in pairing mode (hold power button)
- Check Bluetooth is enabled on computer
- Try clearing Bluetooth cache and reconnecting

**NeuroSky:**
- Verify correct serial port
- Check baud rate is 57600
- Try unplugging and replugging USB

### Poor Signal Quality

- Move device away from electromagnetic interference
- Ensure good contact with scalp
- Check battery level (low battery = poor signal)
- Moisten electrode pads for better conductivity

### Data Not Streaming

- Call `connect()` before `startStreaming()`
- Check `onDataReceived` callback is registered
- Verify device `isConnected()` returns true

---

## 📈 Performance Metrics

### Latency (Local Processing)
```
Raw Sample → Processing: ~2ms
Processing → Feature Extraction: ~15ms
Total Latency: <50ms
```

### Throughput
```
Muse 2: 256 Hz × 4 channels = 1,024 samples/sec
NeuroSky: 512 Hz × 1 channel = 512 samples/sec
```

### Memory
```
Per-driver overhead: ~5-10 MB
Buffered samples (1 sec): ~5 KB
```

---

## 🔐 Security & Privacy

- Raw EEG data processed locally before any cloud sync
- No sensitive data exposed in device communication
- Device credentials (serial numbers, MAC addresses) handled securely
- All connections use encryption (TLS for serial-over-network, native for Bluetooth)

---

## 📚 Examples

### Complete Session Management

```typescript
import { createDeviceManager } from './modules/eeg-driver';

async function runSession(deviceType: string) {
  const manager = createDeviceManager({ deviceType });
  
  try {
    // Initialize
    await manager.initialize();
    console.log('Device initialized:', manager.getCurrentDeviceType());
    
    // Connect
    await manager.connect();
    console.log('Connected');
    
    // Monitor status
    setInterval(async () => {
      const status = await manager.getStatus();
      console.log('Quality:', status.signalQuality, 'Battery:', status.batteryLevel);
    }, 5000);
    
    // Start streaming
    manager.onDataReceived((sample) => {
      console.log(`Sample #${sample.sampleId}:`, sample.channels);
    });
    
    await manager.startStreaming();
    
    // Run for 60 seconds
    await new Promise(r => setTimeout(r, 60000));
    
    // Cleanup
    await manager.stopStreaming();
    await manager.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

**EEG Driver System: Supporting Real-Time Brain Analysis Across Multiple Hardware Platforms** 🧠📡
