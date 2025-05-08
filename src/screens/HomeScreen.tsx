import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';

// Define the navigation type
type HomeScreenNavigationProp = NavigationProp<{
  Device: undefined;
  BluetoothScan: undefined;
}>;

// Define props type for the component
type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  return (
    <ImageBackground
      source={require('../screens/Background.png')} // Local image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.title}>
          {/* <Text style={styles.titleText}>Swell</Text> */}
        </View>

        <View style={styles.content}>
          <Text style={styles.contentText}>My Device</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Device')}>
            <View style={styles.card}>
              <Image
                source={require('../../assets/ActiveDevice.png')}
                style={styles.deviceImage}
                resizeMode="contain"
              />
              <View style={styles.textContainer}>
                <Text style={styles.deviceName}>SW_0</Text>
                <Text style={styles.status}>Connected via Bluetooth</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.card}>
            <Image
              source={require('../../assets/NotActiveDevice.png')}
              style={styles.deviceImage}
              resizeMode="contain"
            />
            <View style={styles.textContainer}>
              <Text style={styles.deviceName}>SW_1</Text>
              <Text style={styles.status}>Not Connected</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('BluetoothScan')}>
            <View style={styles.card}>
              <Text style={styles.status}>+ Add Device</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    // backgroundColor: '#38343c',
    height: '100%',
  },

  title: {
    marginTop: '5%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleText: {
    fontSize: 32,
    color: 'white'
  },

  content: {
    margin: '5%',
    marginTop: '30%'
  },

  contentText: {
    fontSize: 18,
    color: 'white',
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
  deviceImage: {
    width: 64,
    height: 64,
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
