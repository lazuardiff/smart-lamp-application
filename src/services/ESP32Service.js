import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

// UUIDs for BLE service and characteristics - using the provided UUIDs
const SERVICE_UUID = '6b447bc4-70ac-4602-8a97-71bbcc14cde9';
const LED_CHARACTERISTIC_UUID = '9017bf83-2249-4f30-ae68-8a06b992a5aa';

class ESP32Service {
    constructor() {
        this.bleManager = new BleManager();
        this.device = null;
        this.isConnected = false;
        this.isScanning = false;
        this.deviceName = 'ESP32-LED';
    }

    // Initialize BLE module
    async initialize() {
        // Request necessary permissions for BLE
        if (Platform.OS === 'android') {
            await this.requestAndroidPermissions();
        }

        // Start BLE manager
        this.bleManager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                console.log('Bluetooth is powered on');
            } else {
                console.log('Bluetooth state:', state);
            }
        }, true);
    }

    // Request necessary Android permissions
    async requestAndroidPermissions() {
        if (Platform.OS !== 'android') return true;

        const bluetoothScanPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
                title: 'Bluetooth Scan Permission',
                message: 'App needs Bluetooth scanning permission',
                buttonPositive: 'OK',
            }
        );

        const bluetoothConnectPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
                title: 'Bluetooth Connect Permission',
                message: 'App needs Bluetooth connection permission',
                buttonPositive: 'OK',
            }
        );

        const fineLocationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Permission',
                message: 'Bluetooth scanning requires location permission',
                buttonPositive: 'OK',
            }
        );

        return (
            bluetoothScanPermission === PermissionsAndroid.RESULTS.GRANTED &&
            bluetoothConnectPermission === PermissionsAndroid.RESULTS.GRANTED &&
            fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED
        );
    }

    // Scan for BLE devices
    async scanForDevices() {
        if (this.isScanning) {
            return [];
        }

        try {
            this.isScanning = true;
            const devices = [];

            return new Promise((resolve) => {
                // Scan for 5 seconds then stop
                const subscription = this.bleManager.onDeviceFound((device) => {
                    // Only include devices with names
                    if (device.name) {
                        devices.push(device);
                    }
                });

                setTimeout(() => {
                    subscription.remove();
                    this.bleManager.stopDeviceScan();
                    this.isScanning = false;
                    resolve(devices);
                }, 5000);

                this.bleManager.startDeviceScan(null, null, (error) => {
                    if (error) {
                        console.error('Scan error:', error);
                        this.bleManager.stopDeviceScan();
                        this.isScanning = false;
                        resolve([]);
                    }
                });
            });
        } catch (error) {
            console.error('Error scanning for devices:', error);
            this.isScanning = false;
            return [];
        }
    }

    // Connect to a specific device
    async connectToDevice(deviceId) {
        try {
            // Connect to the device
            const device = await this.bleManager.connectToDevice(deviceId);
            console.log('Connected to device:', device.name);

            // Discover services and characteristics
            await device.discoverAllServicesAndCharacteristics();
            console.log('Discovered services and characteristics');

            this.device = device;
            this.isConnected = true;

            // Setup disconnect listener
            device.onDisconnected(() => {
                console.log('Device disconnected');
                this.device = null;
                this.isConnected = false;
            });

            return true;
        } catch (error) {
            console.error('Error connecting to device:', error);
            return false;
        }
    }

    // Disconnect from device
    async disconnect() {
        if (this.device && this.isConnected) {
            try {
                await this.device.cancelConnection();
                this.device = null;
                this.isConnected = false;
                return true;
            } catch (error) {
                console.error('Error disconnecting:', error);
                return false;
            }
        }
        return true;
    }

    // Read LED status
    async getLedStatus() {
        if (!this.device || !this.isConnected) {
            console.warn('Not connected to any device');
            return null;
        }

        try {
            const characteristic = await this.device.readCharacteristicForService(
                SERVICE_UUID,
                LED_CHARACTERISTIC_UUID
            );

            const decodedValue = this._decodeBase64(characteristic.value);
            return JSON.parse(decodedValue);
        } catch (error) {
            console.error('Error reading LED status:', error);
            return null;
        }
    }

    // Turn LED on
    async turnLedOn() {
        if (!this.device || !this.isConnected) {
            console.warn('Not connected to any device');
            return false;
        }

        try {
            await this.device.writeCharacteristicWithResponseForService(
                SERVICE_UUID,
                LED_CHARACTERISTIC_UUID,
                this._encodeBase64(JSON.stringify({ command: 'on' }))
            );
            return true;
        } catch (error) {
            console.error('Error turning LED on:', error);
            return false;
        }
    }

    // Turn LED off
    async turnLedOff() {
        if (!this.device || !this.isConnected) {
            console.warn('Not connected to any device');
            return false;
        }

        try {
            await this.device.writeCharacteristicWithResponseForService(
                SERVICE_UUID,
                LED_CHARACTERISTIC_UUID,
                this._encodeBase64(JSON.stringify({ command: 'off' }))
            );
            return true;
        } catch (error) {
            console.error('Error turning LED off:', error);
            return false;
        }
    }

    // Helper function to encode string to base64
    _encodeBase64(str) {
        return btoa(str);
    }

    // Helper function to decode base64 to string
    _decodeBase64(base64) {
        return atob(base64);
    }
}

// Create a singleton instance
export default new ESP32Service();
