// import 'react-native-gesture-handler'; // 👈🏽 this must be at the top
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import NotActiveBluetooth from './src/screens/NotActiveBluetooth';
import Device from './src/screens/Device';
import Timer from './src/screens/Timer';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home' screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name='NotActiveBluetooth' component={NotActiveBluetooth} />
        <Stack.Screen name='Device' component={Device} />
        <Stack.Screen name='Timer' component={Timer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}