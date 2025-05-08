import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import ESP32Service from '../services/ESP32Service';

// Define the navigation type
type DeviceScreenNavigationProp = NavigationProp<{
  NotActiveBluetooth: undefined;
  Home: undefined;
}>;

// Define props type for the component
type DeviceProps = {
  navigation: DeviceScreenNavigationProp;
};

const Device = ({ navigation }: DeviceProps) => {
  const [isEnabledNL, setIsEnabledNL] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [deviceState, setDeviceState] = useState({
    isOn: false,
    brightness: 50,
    nightLightBrightness: 50
  });

  const nightLights = () => setIsEnabledNL(previousState => !previousState);

  const toggleLight = async (isOn: boolean) => {
    try {
      let success;

      if (isOn) {
        success = await ESP32Service.turnLedOn();
      } else {
        success = await ESP32Service.turnLedOff();
      }

      if (success) {
        setDeviceState({ ...deviceState, isOn });
      } else {
        Alert.alert('Failed to control LED');
      }
    } catch (error) {
      console.error('Error controlling LED:', error);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (ESP32Service.isConnected && ESP32Service.device) {
          setConnectionStatus('Connected via Bluetooth');

          const status = await ESP32Service.getLedStatus();
          if (status) {
            setDeviceState({
              isOn: status.isOn,
              brightness: 50,
              nightLightBrightness: 50
            });
            setIsEnabledNL(status.isOn);
          }
        } else {
          setConnectionStatus('Not connected');
          navigation.navigate('NotActiveBluetooth');
        }
      } catch (error) {
        console.error('Error checking BLE connection:', error);
        setConnectionStatus('Connection error');
      }
    };

    checkConnection();

    return () => {
      // Don't disconnect when navigating away
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/Back.png')}
            style={styles.backImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/ActiveDevice.png')}
            style={styles.deviceImage}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={styles.deviceName}>This device is {deviceState.isOn ? 'On' : 'Off'}</Text>
            <Text style={styles.status}>{connectionStatus}</Text>
          </View>
        </View>

        <Text style={styles.contentText}>Features</Text>

        <View style={styles.cardFeatures}>
          <View style={styles.row}>
            <Text style={styles.label}>
              🌞 Night Lights: {isEnabledNL ? 'ON' : 'OFF'}
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabledNL ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => {
                nightLights();
                toggleLight(value);
              }}
              value={isEnabledNL}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Device;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#38343c',
    height: '100%',
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
    margin: '5%',
  },

  contentText: {
    fontSize: 15,
    color: 'white',
    marginTop: '10%'
  },

  label: {
    marginRight: 10,
    color: 'black',
    fontSize: 16,
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
    margin: 5,
  },

  cardFeatures: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowRadius: 6,
    margin: 5,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  deviceImage: {
    width: 80,
    height: 80,
    marginRight: 16,
  },

  textContainer: {
    flex: 1,
  },

  deviceName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Cochin',
    color: '#000',
  },

  status: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});
