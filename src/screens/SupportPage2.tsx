import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { useTheme } from '../theme/ThemeContext';

const SupportPage2: React.FC = () => {
	const navigation = useNavigation();
	const { theme } = useTheme();
	return (
		<SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: theme.background }]}>
			<ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color={theme.text} />
				</TouchableOpacity>
				<Text style={[styles.title, { color: theme.text }]}>Support</Text>
				<View style={styles.imageContainer}>
					<Image
						source={require('../assets/support-success.jpg')}
						style={styles.image}
						resizeMode="contain"
					/>
				</View>
				<Text style={[styles.thankText, { color: theme.text }]}>
					Thanks for reaching out.{"\n"}
					We have received your query.{"\n"}
					We will respond back in 2-3 workind days.
				</Text>
			</ScrollView>
			<View style={styles.bottomNavContainer}>
				<CustomBottomNav />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 21.6,
		backgroundColor: '#fff',
		flexGrow: 1,
		paddingBottom: 28.8,
		alignItems: 'center',
	},
	backBtn: {
		marginBottom: 0.9,
		marginTop: -10,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 25.2,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 27,
		marginTop: 7.2,
		fontFamily: 'Outfit-Bold',
		alignSelf: 'flex-start',
	},
	imageContainer: {
		width: '100%',
		alignItems: 'center',
		marginTop: 21.6,
		marginBottom: 21.6,
	},
	image: {
		width: 315,
		height: 360,
	},
	thankText: {
		fontSize: 18,
		color: '#222',
		textAlign: 'center',
		fontFamily: 'Outfit-Regular',
		marginTop: 4.5,
		lineHeight: 27,
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	bottomNavContainer: {
		marginBottom: 31.5,
	},
});

export default SupportPage2;

