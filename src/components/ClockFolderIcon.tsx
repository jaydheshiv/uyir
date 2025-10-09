import React from 'react';
import { Image } from 'react-native';

const ClockFolderIcon = ({ width = 32, height = 32, color }: { width?: number; height?: number; color?: string }) => (
  <Image
    source={require('../assets/clockfolder.png')}
    style={{ width, height, resizeMode: 'contain', tintColor: color }}
  />
);

export default ClockFolderIcon;
