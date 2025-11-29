import React, { useState } from 'react';
import { View } from 'react-native';
import LabeledInput from '../components/LabeledInput';

const CreateAccountScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <LabeledInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
      />
      <LabeledInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry
      />
    </View>
  );
};

export default CreateAccountScreen;
