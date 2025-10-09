import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';

const SupportPage1: React.FC = () => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
	const [message, setMessage] = useState('');

	const handleSend = () => {
		// TODO: Implement send logic
		console.log('Message sent:', message);
		navigation.navigate('SupportPage2');
	};

	return (
		<SafeAreaView style={styles.safeAreaContainer}>
			<ScrollView contentContainerStyle={styles.container}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={styles.title}>Support</Text>
				<Text style={styles.label}>Type your message here</Text>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						value={message}
						onChangeText={setMessage}
						multiline
						placeholder=""
						textAlignVertical="top"
					/>
				</View>
				<TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
					<Text style={styles.sendBtnText}>Send</Text>
				</TouchableOpacity>
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
	},
	backBtn: {
		marginBottom: 12,
		marginTop: -10,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 32,
		marginTop: 8,
		fontFamily: 'Outfit-Bold',
	},
	label: {
		fontSize: 22,
		color: '#222',
		fontWeight: 'bold',
		marginBottom: 16,
		fontFamily: 'Outfit-Bold',
	},
	inputContainer: {
		width: '100%',
		minHeight: 160,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: '#121212',
		backgroundColor: '#fff',
		marginBottom: 32,
		justifyContent: 'flex-start',
	},
	input: {
		width: '100%',
		minHeight: 250,
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingTop: 16,
		fontSize: 18,
		backgroundColor: '#fff',
		color: '#121212',
		textAlignVertical: 'top',
	},
	sendBtn: {
		width: '100%',
		height: 56,
		backgroundColor: '#715CF6',
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 0,
		marginBottom: 16,
	},
	sendBtnText: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
		fontFamily: 'Outfit-Bold',
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	bottomNavContainer: {
		marginBottom: 0,
	},
});

export default SupportPage1;
