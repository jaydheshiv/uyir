import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const TopLeftProfileIcon = () => (
  <View>
    <Svg width={43} height={30} viewBox="0 0 40 22" fill="none">
      {/* Outer rounded rectangle */}
      <Rect x={2} y={2} width={37} height={22} rx={10} stroke="#9170FF" strokeWidth={2} />
      {/* Notification red dot */}
      <Circle cx={31} cy={7} r={3} fill="#EF5F5F" />
      {/* Main user (front) */}
      <Circle cx={17} cy={11} r={3} stroke="#9170FF" strokeWidth={1.5} fill="none" />
      <Path
        d="M12.5 17c0-2.2 2.24-4 5-4s5 1.8 5 4"
        stroke="#9170FF"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
      {/* Second user (back, right) */}
      <Circle cx={25} cy={10} r={2.9} stroke="#9170FF" strokeWidth={1.4} fill="#9170FF" />
      <Path
        d="M21.2 17c0-2.2 2.24-4 4-4s6 1.8 3.9 4"
        stroke="#9170FF"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

export default TopLeftProfileIcon;