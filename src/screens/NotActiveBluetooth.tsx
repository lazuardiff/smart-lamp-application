import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  PermissionsAndroid
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Device } from 'react-native-ble-plx';
import ESP32Service from '../services/ESP32Service';

// Define navigation prop type
type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

// Define a type for WiFi networks
interface WiFiNetwork {
  SSID: string;
  level: number;
}

const NotActiveWiFi = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [connecting, setConnecting] = useState(false);

  // Since WiFi functions are no longer in ESP32Service, redirect to Bluetooth scan
  const scanNetworks = () => {
    Alert.alert(
      'WiFi Scanning Not Available',
      'WiFi scanning has been replaced with Bluetooth. Would you like to scan for Bluetooth devices instead?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Scan Bluetooth',
          onPress: () => navigation.navigate('BluetoothScan')
        }
      ]
    );
  };

  const openWiFiSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('App-Prefs:root=WIFI');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/Back.png')}
            style={styles.backImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.wifiIcon}>
          <Image source={require('../../assets/Bluetooth.png')}
            style={styles.wifiImage}
          />
        </View>

        <Text style={styles.notesTitle}>
          Connect to WiFi
        </Text>
        <Text style={styles.notes}>
          Connect to WiFi to search for your Swell device
        </Text>

        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.disabledButton]}
          onPress={scanNetworks}
          disabled={isScanning}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Text>
        </TouchableOpacity>

        {isScanning && (
          <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
        )}

        {networks.length > 0 && (
          <View style={styles.networksContainer}>
            <Text style={styles.networksTitle}>Available Networks:</Text>
            <FlatList
              data={networks}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.networkItem}
                  disabled={connecting}>
                  <Text style={styles.networkName}>{item.SSID}</Text>
                  <Text style={styles.signalStrength}>
                    Signal: {item.level}dBm
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={openWiFiSettings}>
          <View style={styles.card}>
            <Text>WiFi Settings</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NotActiveBluetooth = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connecting, setConnecting] = useState(false);

  // Initialize BLE service when component mounts
  useEffect(() => {
    const initBLE = async () => {
      try {
        await ESP32Service.initialize();
      } catch (error) {
        console.error('Failed to initialize BLE:', error);
        Alert.alert('Bluetooth Error', 'Failed to initialize Bluetooth. Please restart the app.');
      }
    };

    initBLE();
  }, []);

  // Function to scan for BLE devices
  const scanDevices = async () => {
    try {
      setIsScanning(true);
      setDevices([]);

      // Check and request permissions
      if (Platform.OS === 'android') {
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
          Alert.alert("Permission Denied", "Bluetooth scanning requires location permission");
          setIsScanning(false);
          return;
        }
      }

      // Start scanning
      const discoveredDevices = await ESP32Service.scanForDevices();
      setDevices(discoveredDevices);
    } catch (error) {
      console.error('Error scanning for devices:', error);
      Alert.alert('Error', 'Failed to scan for Bluetooth devices');
    } finally {
      setIsScanning(false);
    }
  };

  // Function to connect to a BLE device
  const connectToDevice = async (device: Device) => {
    try {
      setConnecting(true);
      const success = await ESP32Service.connectToDevice(device.id);

      if (success) {
        Alert.alert('Connected', `Successfully connected to ${device.name || 'device'}`);
        navigation.navigate('Device');
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

  const openBluetoothSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('App-Prefs:Bluetooth');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/Back.png')}
            style={styles.backImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.bluetoothIcon}>
          <Image source={require('../../assets/Bluetooth.png')}
            style={styles.bluetoothImage}
          />
        </View>

        <Text style={styles.notesTitle}>
          Connect to Bluetooth
        </Text>
        <Text style={styles.notes}>
          Connect to Bluetooth to control your Swell device
        </Text>

        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.disabledButton]}
          onPress={scanDevices}
          disabled={isScanning}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Text>
        </TouchableOpacity>

        {isScanning && (
          <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
        )}

        {devices.length > 0 && (
          <View style={styles.devicesContainer}>
            <Text style={styles.devicesTitle}>Available Devices:</Text>
            <FlatList
              data={devices}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.deviceItem}
                  onPress={() => connectToDevice(item)}
                  disabled={connecting}>
                  <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
                  <Text style={styles.deviceId}>ID: {item.id}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={openBluetoothSettings}>
          <View style={styles.card}>
            <Text>Bluetooth Settings</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotActiveBluetooth;
export { NotActiveWiFi };

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#38343c',
    height: '100%',
    flex: 1,
  },

  header: {
    marginTop: '5%',
    width: '10%',
    backgroundColor: '#38343c',
  },

  backImage: {
    width: 40,
    height: 40,
    marginRight: 16,
  },

  content: {
    margin: '10%',
  },

  wifiIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  wifiImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },

  bluetoothIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  bluetoothImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },

  notesTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },

  notes: {
    color: 'white',
    fontSize: 12
  },

  scanButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },

  disabledButton: {
    backgroundColor: '#CCCCCC',
  },

  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loader: {
    marginTop: 20,
  },

  networksContainer: {
    marginTop: 20,
    maxHeight: 200,
  },

  networksTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  networkItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  networkName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  signalStrength: {
    color: 'white',
    fontSize: 12,
  },

  devicesContainer: {
    marginTop: 20,
    maxHeight: 200,
  },

  devicesTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  deviceItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  deviceName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  deviceId: {
    color: 'white',
    fontSize: 12,
  },

  footer: {

  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    margin: '10%',
  },
});
