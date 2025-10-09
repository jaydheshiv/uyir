import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const SupportPage2: React.FC = () => {
	const navigation = useNavigation();
	return (
		<SafeAreaView style={styles.safeAreaContainer}>
			<ScrollView contentContainerStyle={styles.container}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={styles.title}>Support</Text>
				<View style={styles.imageContainer}>
					<Image
						source={require('../assets/support-success.jpg')}
						style={styles.image}
						resizeMode="contain"
					/>
				</View>
				<Text style={styles.thankText}>
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
		padding: 24,
		backgroundColor: '#fff',
		flexGrow: 1,
		paddingBottom: 32,
		alignItems: 'center',
	},
	backBtn: {
		marginBottom: 1,
		marginTop: -10,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 30,
		marginTop: 8,
		fontFamily: 'Outfit-Bold',
		alignSelf: 'flex-start',
	},
	imageContainer: {
		width: '100%',
		alignItems: 'center',
		marginTop: 24,
		marginBottom: 24,
	},
	image: {
		width: 350,
		height: 400,
	},
	thankText: {
		fontSize: 20,
		color: '#222',
		textAlign: 'center',
		fontFamily: 'Outfit-Regular',
		marginTop: 5,
		lineHeight: 30,
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	bottomNavContainer: {
		marginBottom: 0,
	},
});

export default SupportPage2;
