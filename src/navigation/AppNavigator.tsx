import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import Device from '../screens/Device';
import NotActiveBluetooth from '../screens/NotActiveBluetooth'; // Changed to default import
import BluetoothScanScreen from '../screens/BluetoothScanScreen';
import Timer from '../screens/Timer';
import DetailsScreen from '../screens/DetailsScreen';

export type RootStackParamList = {
    Home: undefined;
    Device: undefined;
    NotActiveBluetooth: undefined;
    BluetoothScan: undefined; // Add this new route
    Timer: undefined;
    Details: { itemId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Device" component={Device} />
                <Stack.Screen name="NotActiveBluetooth" component={NotActiveBluetooth} />
                <Stack.Screen name="BluetoothScan" component={BluetoothScanScreen} />
                <Stack.Screen name="Timer" component={Timer} />
                <Stack.Screen name="Details" component={DetailsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;