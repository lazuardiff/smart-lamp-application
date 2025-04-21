import React, { useState } from 'react';
import { View, Text, Button, TextInput, Switch, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
// import styles from './style/style'; 

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text>Swell</Text>
      </View>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details', { itemId: 42 })}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
      backgroundColor: 'grey',
      margin: '3%',
  },

  title:{
      alignItems: 'center',
      justifyContent: 'center',
  }
});
