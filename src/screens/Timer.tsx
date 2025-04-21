import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button,
  Switch, 
  StyleSheet, 
  Image,
  TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const data = [
  { label: 'Raindrop', value: '1' },
  { label: 'Nature in the morning', value: '2' },
];

const Timer = ({ navigation }) => {
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const onChangeFrom = (event, selectedTime) => {
    const currentTime = selectedTime || fromTime;
    setShowFromPicker(Platform.OS === 'ios');
    setFromTime(currentTime);
  };

  const onChangeTo = (event, selectedTime) => {
    const currentTime = selectedTime || toTime;
    setShowToPicker(Platform.OS === 'ios');
    setToTime(currentTime);
  };

  const [isEnabledAlarm, setIsEnabledAlarm] = useState(false);
  const Alarm = () => setIsEnabledAlarm(previousState => !previousState);

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
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.deviceName}>Set Sleep Time</Text>
          </View>
        </View>

        <Text style={styles.contentText}>From</Text>
        <View style={styles.cardTimer}>
          <TouchableOpacity onPress={() => setShowFromPicker(true)} style={styles.setTimeButton}>
            <Text style={styles.setTimeButtonText}>SET TIME</Text>
          </TouchableOpacity>
          {showFromPicker && (
            <DateTimePicker
              value={fromTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeFrom}
            />
          )}
          <View style={styles.timeContainer}>
            <Text style={styles.selectedTime}>
              {fromTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <Text style={styles.contentText}>To</Text>
        <View style={styles.cardTimer}>
          <TouchableOpacity onPress={() => setShowToPicker(true)} style={styles.setTimeButton}>
            <Text style={styles.setTimeButtonText}>SET TIME</Text>
          </TouchableOpacity>
          {showToPicker && (
            <DateTimePicker
              value={toTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onChangeTo}
            />
          )}
          <View style={styles.timeContainer}>
            <Text style={styles.selectedTime}>
              {toTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardFeatures}>
          <View style={styles.row}>
            <Text style={styles.label}>
              Alarm: {isEnabledAlarm ? 'ON' : 'OFF'}
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabledAlarm ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={Alarm}
              value={isEnabledAlarm}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity>
            <View style={styles.cardFeatures}>
              <Text style={styles.label}>
                Save Setting
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Timer;

const styles = StyleSheet.create({
  container: {
      backgroundColor: '#38343c',
      height: '100%',
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
    margin: '5%',
  },

  contentText:{
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
    padding: 40,
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    margin: 5,
  },

  cardTimer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    shadowRadius: 6,
    margin: 5,
  },

  buttonContainer: {
    borderRadius: 16,
    shadowRadius: 6,
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
    alignItems: 'center'
  },

  deviceName: {
    fontSize: 35,
    fontWeight: '600',
    fontFamily: 'Cochin',
    color: '#000',
  },

  timeContainer:{
    alignItems: 'center', 
    justifyContent: 'center'
  },

  selectedTime: {
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'Cochin',
    color: '#000',
    alignItems: 'center',
    justifyContent: 'center'
  },

  setTimeButton: {
    backgroundColor: '#FFC107', // Teal
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  setTimeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
