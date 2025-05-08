import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform,
    PermissionsAndroid,
    Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Device } from 'react-native-ble-plx';
import ESP32Service from '../services/ESP32Service';

// Add proper navigation type
type NavigationProps = {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
};

const BluetoothScanScreen = () => {
    // Define navigation with proper typing
    const navigation = useNavigation<NavigationProps>();
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [connecting, setConnecting] = useState(false);

    // Initialize BLE service when component mounts
    useEffect(() => {
        const initBLE = async () => {
            try {
                await ESP32Service.initialize();
                // Start scanning automatically when screen opens
                startScan();
            } catch (error) {
                console.error('Failed to initialize BLE:', error);
                Alert.alert('Bluetooth Error', 'Failed to initialize Bluetooth. Please restart the app.');
            }
        };

        initBLE();

        return () => {
            // Stop scanning when component unmounts
            if (isScanning) {
                ESP32Service.bleManager.stopDeviceScan();
            }
        };
    }, []);

    const openAppSettings = () => {
        console.log("Opening app settings...");
        // For Android
        if (Platform.OS === 'android') {
            Linking.openSettings();
        }
        // For iOS
        else if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        }
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                // Check Android version
                const apiLevel = parseInt(Platform.Version.toString(), 10);
                console.log('Android API Level:', apiLevel);

                // For Android 12+ (API 31+)
                if (apiLevel >= 31) {
                    // Add more logging to help debug
                    console.log("Checking Android 12+ permissions");

                    // Define permissions
                    const permissions = [
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    ];

                    // First check if we already have permissions - this can help debug
                    const checkResults = await Promise.all(
                        permissions.map(permission =>
                            PermissionsAndroid.check(permission)
                        )
                    );

                    console.log("Permission check results:",
                        permissions.map((perm, i) => `${perm}: ${checkResults[i]}`)
                    );

                    // If all permissions are granted, return true immediately
                    if (checkResults.every(result => result === true)) {
                        console.log("All permissions already granted");
                        return true;
                    }

                    // Otherwise, request the permissions
                    console.log("Requesting permissions...");
                    const results = await PermissionsAndroid.requestMultiple(permissions);

                    console.log('Permission request results:', results);

                    // Type-safe checking for granted permissions
                    const allGranted = Object.values(results).every(
                        result => result === PermissionsAndroid.RESULTS.GRANTED
                    );

                    if (!allGranted) {
                        // Show a more helpful dialog that takes them directly to settings
                        Alert.alert(
                            'Permissions Required',
                            'To scan for Bluetooth devices, this app needs Bluetooth and Location permissions. Would you like to grant these permissions in settings?',
                            [
                                { text: 'Not Now', style: 'cancel' },
                                {
                                    text: 'Open Settings',
                                    onPress: openAppSettings
                                }
                            ]
                        );
                        return false;
                    }

                    return allGranted;
                }

                // For Android 6.0 to 11 (API 23-30)
                else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: "Location Permission",
                            message: "Bluetooth scanning requires location permission",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert(
                            'Location Permission Required',
                            'Bluetooth scanning requires location permission. Please enable it in app settings.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Open Settings',
                                    onPress: openAppSettings
                                }
                            ]
                        );
                    }

                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            } catch (error) {
                console.error('Permission request error:', error);
                return false;
            }
        }
        return true;
    };

    const startScan = async () => {
        if (isScanning) return;

        try {
            const permissionsGranted = await requestPermissions();
            if (!permissionsGranted) {
                return;
            }

            setIsScanning(true);
            setDevices([]);

            // Add more logging to debug scanning
            console.log('Starting BLE scan...');

            ESP32Service.bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
                if (error) {
                    console.error('Scan error:', error);
                    stopScan();
                    Alert.alert('Scan Error', error.message || 'Failed to scan for devices');
                    return;
                }

                if (device) {
                    console.log('Found device:', device.name || 'Unknown', device.id);

                    // Add device to list if it has a name
                    if (device.name) {
                        setDevices(currentDevices => {
                            if (!currentDevices.find(d => d.id === device.id)) {
                                return [...currentDevices, device];
                            }
                            return currentDevices;
                        });
                    }
                }
            });

            // Stop scanning after 10 seconds
            setTimeout(stopScan, 10000);
        } catch (error) {
            console.error('Error starting scan:', error);
            Alert.alert('Error', 'Failed to start scanning for Bluetooth devices');
            setIsScanning(false);
        }
    };

    const stopScan = () => {
        if (!isScanning) return;

        ESP32Service.bleManager.stopDeviceScan();
        setIsScanning(false);
    };

    const connectToDevice = async (device: Device) => {
        try {
            setConnecting(true);

            // Check if device is ESP32
            const isESP32 = device.name && (
                device.name.includes('ESP32') ||
                device.name.includes('ESP') ||
                device.name.toLowerCase() === 'esp32-led'
            );

            if (!isESP32) {
                Alert.alert(
                    'Not an ESP32 Device',
                    'This does not appear to be an ESP32 device. Do you still want to connect?',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setConnecting(false) },
                        { text: 'Connect', onPress: () => proceedWithConnection(device) }
                    ]
                );
            } else {
                await proceedWithConnection(device);
            }
        } catch (error) {
            console.error('Error in connect flow:', error);
            Alert.alert('Connection Error', 'An error occurred while trying to connect.');
            setConnecting(false);
        }
    };

    const proceedWithConnection = async (device: Device) => {
        try {
            const success = await ESP32Service.connectToDevice(device.id);

            if (success) {
                Alert.alert(
                    'Connected',
                    `Successfully connected to ${device.name || 'device'}`,
                    [{
                        text: 'OK',
                        onPress: () => {
                            // This fixes the navigation type error
                            navigation.navigate('Device');
                        }
                    }]
                );
            } else {
                Alert.alert('Connection Failed', 'Could not connect to the selected device');
            }
        } catch (error) {
            console.error('Error connecting to device:', error);
            Alert.alert('Connection Error', 'Failed to connect to the selected device');
        } finally {
            setConnecting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../../assets/Back.png')}
                        style={styles.backImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Device</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Image
                        source={require('../../assets/Bluetooth.png')}
                        style={styles.bluetoothIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.scanTitle}>Scan for Bluetooth Devices</Text>
                    <Text style={styles.scanSubtitle}>
                        Find and connect to your ESP32 device
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.scanButton,
                        isScanning ? styles.scanningButton : null
                    ]}
                    onPress={isScanning ? stopScan : startScan}
                    disabled={connecting}
                >
                    <Text style={styles.scanButtonText}>
                        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                    </Text>
                </TouchableOpacity>

                {isScanning && (
                    <View style={styles.scanningContainer}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.scanningText}>Scanning for devices...</Text>
                    </View>
                )}

                <View style={styles.deviceListContainer}>
                    <Text style={styles.deviceListTitle}>
                        {devices.length > 0
                            ? `Available Devices (${devices.length})`
                            : 'No devices found yet'}
                    </Text>

                    <FlatList
                        data={devices}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.deviceItem}
                                onPress={() => connectToDevice(item)}
                                disabled={connecting}
                            >
                                <View style={styles.deviceItemContent}>
                                    <View>
                                        <Text style={styles.deviceName}>
                                            {item.name || 'Unknown Device'}
                                        </Text>
                                        <Text style={styles.deviceId}>ID: {item.id}</Text>
                                    </View>
                                    <View style={styles.rssiContainer}>
                                        <Text style={styles.rssiText}>
                                            {/* Handle the potentially null rssi */}
                                            {item.rssi !== null ? `${item.rssi} dBm` : 'No signal'}
                                        </Text>
                                        <View
                                            style={[
                                                styles.signalStrength,
                                                // Fixed the null check for rssi
                                                item.rssi !== null && item.rssi > -60 ? styles.signalStrong :
                                                    item.rssi !== null && item.rssi > -80 ? styles.signalMedium :
                                                        styles.signalWeak
                                            ]}
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            !isScanning ? (
                                <View style={styles.emptyListContainer}>
                                    <Text style={styles.emptyListText}>
                                        No Bluetooth devices found. Try scanning again.
                                    </Text>
                                </View>
                            ) : null
                        )}
                    />
                </View>
            </View>

            {connecting && (
                <View style={styles.connectingOverlay}>
                    <View style={styles.connectingDialog}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.connectingText}>Connecting...</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#38343c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backImage: {
        width: 40,
        height: 40,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 16,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    bluetoothIcon: {
        width: 80,
        height: 80,
        marginBottom: 16,
    },
    scanTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    scanSubtitle: {
        fontSize: 14,
        color: '#cccccc',
        textAlign: 'center',
    },
    scanButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    scanningButton: {
        backgroundColor: '#f44336',
    },
    scanButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scanningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    scanningText: {
        color: '#4CAF50',
        marginLeft: 8,
        fontSize: 16,
    },
    deviceListContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
    },
    deviceListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    deviceItem: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
    },
    deviceItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    deviceId: {
        fontSize: 12,
        color: '#cccccc',
        marginTop: 4,
    },
    rssiContainer: {
        alignItems: 'center',
    },
    rssiText: {
        fontSize: 12,
        color: '#cccccc',
        marginBottom: 4,
    },
    signalStrength: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    signalStrong: {
        backgroundColor: '#4CAF50',
    },
    signalMedium: {
        backgroundColor: '#FFC107',
    },
    signalWeak: {
        backgroundColor: '#f44336',
    },
    emptyListContainer: {
        padding: 16,
        alignItems: 'center',
    },
    emptyListText: {
        color: '#cccccc',
        textAlign: 'center',
    },
    connectingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectingDialog: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '80%',
    },
    connectingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default BluetoothScanScreen;
