
import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

interface SplashScreenProps {
	navigation: StackNavigationProp<any, any>;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			navigation.replace('Walkthrough1');
		}, 2000);
		return () => clearTimeout(timer);
	}, [navigation]);

	return (
		<View style={styles.container}>
			<Image
				source={require('../assets/uyir-logo.png')}
				style={styles.logo}
				resizeMode="contain"
				accessible
				accessibilityLabel="Uyir Logo"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	logo: {
		width: 225,
		height: 72,
	},
});

export default SplashScreen;

