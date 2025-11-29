// Mock for react-native-vector-icons
import React from 'react';
import { Text } from 'react-native';

const Icon = ({ name, ...props }: any) => {
    return <Text {...props}>{name}</Text>;
};

export default Icon;
