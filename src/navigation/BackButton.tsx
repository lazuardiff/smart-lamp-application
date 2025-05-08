// components/BackButton.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Fixed import (removed curly braces)
import { useNavigation } from '@react-navigation/native';

// Define navigation prop type
type NavigationProp = {
  goBack: () => void;
};

const BackButton = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
  );
};

export default BackButton;
