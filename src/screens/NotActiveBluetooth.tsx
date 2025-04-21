import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  TextInput, 
  Switch, 
  StyleSheet, 
  Image,
  TouchableOpacity,
  Linking, 
  Platform } from 'react-native';

import { useNavigation } from '@react-navigation/native';

const NotActiveBluetooth = () => {
  const navigation = useNavigation();

  const openBluetoothSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
      // Linking.openURL('bluetooth:')
    } else {
      Linking.openURL('App-Prefs:root=Bluetooth');
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
        <View style={styles.bluetooth}>
          <Image source={require('../../assets/Bluetooth.png')} 
            style={styles.bluetoothImage}
            />
        </View>
        
        <Text style={styles.notesTitle}>
          Turn On Bluetooth
        </Text>
        <Text style={styles.notes}>
          Turn on Bluetooth to search for your Swell device 
        </Text>
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

const styles = StyleSheet.create({
  container: {
      backgroundColor: '#38343c',
      height: '100%',
      flex: 1,
  },

  header:{
    marginTop: '5%',
    width: '10%',
    backgroundColor: '#38343c',
  },

  backImage: {
    width: 40,
    height: 40,
    marginRight: 16,
  },

  content:{
    margin: '10%',
  },

  bluetooth:{
    alignItems: 'center',
    justifyContent: 'center'
  },

  bluetoothImage:{
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },

  notesTitle:{
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },

  notes:{
    color: 'white',
    fontSize: 12
  },

  footer:{

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
