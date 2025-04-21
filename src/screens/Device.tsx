import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Switch, 
  StyleSheet, 
  Image,
  TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';

const data = [
  { label: 'Raindrop', value: '1' },
  { label: 'Nature in the morning', value: '2' },
];

const Device = ({ navigation }) => {
  const [isEnabledNL, setIsEnabledNL] = useState(false);
  const [isEnabledNS, setIsEnabledNS] = useState(false);
  const [isEnabledAT, setIsEnabledAT] = useState(false);

  const nightLights = () => setIsEnabledNL(previousState => !previousState);
  const [roomLight, setRoomLight] = useState(50);
  const snapToStepRL = (val) => {
    const levels = [0, 50, 100];
    const closest = levels.reduce((prev, curr) =>
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
    setValue(closest);
  };
  const getLabelRL = () => {
    if (value === 0) return 'Redup';
    if (value === 50) return 'Sedang';
    if (value === 100) return 'Terang';
    return '';
  };

  const [nightLightLevel, setNightLightLevel] = useState(50);
  const snapToStepNL = (val) => {
    const levels = [0, 50, 100];
    const closest = levels.reduce((prev, curr) =>
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
    setValue2(closest);
  };
  const getLabelNL = () => {
    if (value2 === 0) return 'Redup';
    if (value2 === 50) return 'Sedang';
    if (value2 === 100) return 'Terang';
    return '';
  };

  const natureSounds = () => setIsEnabledNS(previousState => !previousState);
  const [value, setValue] = useState(null);
  const [value2, setValue2] = useState(null);
  const [volume, setVolume] = useState(50);

  const aromaTherapy = () => setIsEnabledAT(previousState => !previousState);

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
            <Text style={styles.deviceName}>This device is On</Text>
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
              onValueChange={nightLights}
              value={isEnabledNL}
            />
          </View>

          {isEnabledNL && (
            <View style={styles.sliderBox}>
              <Text style={styles.sliderTitle}>Adjust room light intensity</Text>
              <Text style={styles.sliderLabel}>Room lighting</Text>
              <Slider
                value={roomLight}
                onValueChange={setRoomLight}
                onSlidingComplete={snapToStepRL}
                minimumValue={0}
                maximumValue={100}
              />
              <Text style={{ color: 'black', marginBottom: 10 }}>Level: {getLabelRL()}</Text>

              <Text style={styles.sliderLabel}>Nightlight</Text>
              <Slider
                value={nightLightLevel}
                onValueChange={setNightLightLevel}
                onSlidingComplete={snapToStepNL}
                minimumValue={0}
                maximumValue={100}
              />
              <Text style={{ color: 'black', marginBottom: 10 }}>Level: {getLabelNL()}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardFeatures}>
          <View style={styles.row}>
            <Text style={styles.label}>
              🔊 Nature Sounds: {isEnabledNS ? 'ON' : 'OFF'}
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabledNS ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={natureSounds}
              value={isEnabledNS}
            />
          </View>
          {isEnabledNS && (
            <View style={styles.sliderBox}>
              <Text style={styles.sliderTitle}>Sound for Swell</Text>
              <View style={styles.pickerWrapper}>
                <Icon name="musical-notes" size={20} color="#fff" style={styles.pickerIconLeft} />
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={data}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select item"
                  searchPlaceholder="Search..."
                  value={value}
                  onChange={item => {
                    setValue(item.value);
                  }}
                />
              </View>
              <Text style={styles.sliderTitle}>Volume</Text>
              <Slider
                value={volume}
                onValueChange={setVolume}
                minimumValue={0}
                maximumValue={100}
              />
            </View>
          )}
        </View>
        <View style={styles.cardFeatures}>
          <View style={styles.row}>
            <Text style={styles.label}>
              🧴 Aroma Therapy: {isEnabledAT ? 'ON' : 'OFF'}
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabledAT ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={aromaTherapy}
              value={isEnabledAT}
            />
          </View>
          
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Timer')}>
            <View style={styles.cardFeatures}>
              <Text style={styles.label}>
                Next
              </Text>
            </View>
          </TouchableOpacity>
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
  
  sliderBox: {
    marginTop: 16,
  },

  sliderTitle:{
    color: 'black',
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 15,
  },

  sliderLabel: {
    color: 'black',
    marginBottom: 4,
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

  pickerWrapper: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingLeft: 35,
    paddingRight: 10,
    marginTop: 8,
    height: 40,
    justifyContent: 'center',
  },

  pickerIconLeft: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 1,
  },

  dropdown: {
    // margin: 10,
    height: 40,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'white'
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    color: 'white',
    fontSize: 14,
    paddingVertical: 10,
  },
  inputAndroid: {
    color: 'white',
    fontSize: 14,
    paddingVertical: 10,
  },
  iconContainer: {
    top: 10,
    right: 10,
  },
};
