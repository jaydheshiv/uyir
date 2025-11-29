import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../store/useAppStore';

const SupportPage1: React.FC = () => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
	const [message, setMessage] = useState('');
	const [sending, setSending] = useState(false);
	const { token, user } = useAuth();

	const handleSend = async () => {
		// Validation
		if (!message.trim()) {
			Alert.alert('Message Required', 'Please enter your message before sending.');
			return;
		}

		if (!token) {
			Alert.alert('Authentication Error', 'You need to be logged in to send a support message.');
			return;
		}

		setSending(true);
		try {
			const backendUrl = 'http://dev.api.uyir.ai/support/message';

			console.log('📧 Sending support message to:', backendUrl);
			console.log('📧 User email:', user?.email);
			console.log('📧 User mobile:', user?.mobile);

			const response = await fetch(backendUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: message.trim(),
				}),
			});

			const responseText = await response.text();
			console.log('📧 Response status:', response.status);
			console.log('📧 Response:', responseText);

			if (response.ok) {
				Alert.alert(
					'Message Sent! 💜',
					'Your support message has been sent successfully. Our team will get back to you soon!',
					[
						{
							text: 'OK',
							onPress: () => {
								// Clear the form
								setMessage('');
								// Navigate to success page
								navigation.navigate('SupportPage2');
							}
						}
					]
				);
			} else {
				let errorMessage = 'Failed to send message. Please try again.';
				let userFriendlyMessage = errorMessage;

				try {
					const errorData = JSON.parse(responseText);
					if (errorData.detail) {
						if (typeof errorData.detail === 'string') {
							errorMessage = errorData.detail;

							// Make error messages more user-friendly
							if (errorMessage.includes('Failed to send email') || errorMessage.includes('Mailgun')) {
								userFriendlyMessage = 'We are experiencing email service issues. Your message has been recorded and our team will be notified. Please try again later.';
							} else {
								userFriendlyMessage = errorMessage;
							}
						} else if (Array.isArray(errorData.detail)) {
							errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
							userFriendlyMessage = errorMessage;
						}
					}
				} catch (e) {
					// Use default error message
				}

				console.error('❌ Support message submission failed:', errorMessage);
				Alert.alert('Error', userFriendlyMessage);
			}
		} catch (error) {
			console.error('❌ Network error:', error);
			Alert.alert(
				'Network Error',
				'Could not send message. Please check your connection and try again.'
			);
		} finally {
			setSending(false);
		}
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
				<TouchableOpacity
					style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
					onPress={handleSend}
					disabled={sending}
				>
					{sending ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Text style={styles.sendBtnText}>Send</Text>
					)}
				</TouchableOpacity>

				{/* Info Text */}
				{user?.email && (
					<Text style={styles.infoText}>
						Reply will be sent to: {user.email}
					</Text>
				)}
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
	},
	backBtn: {
		marginBottom: 10.8,
		marginTop: -10,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 25.2,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 28.8,
		marginTop: 7.2,
		fontFamily: 'Outfit-Bold',
	},
	label: {
		fontSize: 19.8,
		color: '#222',
		fontWeight: 'bold',
		marginBottom: 14.4,
		fontFamily: 'Outfit-Bold',
	},
	inputContainer: {
		width: '100%',
		minHeight: 144,
		borderRadius: 14.4,
		borderWidth: 2,
		borderColor: '#121212',
		backgroundColor: '#fff',
		marginBottom: 28.8,
		justifyContent: 'flex-start',
	},
	input: {
		width: '100%',
		minHeight: 225,
		borderRadius: 14.4,
		paddingHorizontal: 14.4,
		paddingTop: 14.4,
		fontSize: 16.2,
		backgroundColor: '#fff',
		color: '#121212',
		textAlignVertical: 'top',
	},
	sendBtn: {
		width: '100%',
		height: 50.4,
		backgroundColor: '#715CF6',
		borderRadius: 25.2,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 0,
		marginBottom: 14.4,
	},
	sendBtnDisabled: {
		backgroundColor: '#B8B0FF',
		opacity: 0.6,
	},
	sendBtnText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		fontFamily: 'Outfit-Bold',
	},
	infoText: {
		fontSize: 12.6,
		color: '#6B7280',
		textAlign: 'center',
		fontFamily: 'Outfit-Regular',
		marginTop: 7.2,
		marginBottom: 14.4,
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	bottomNavContainer: {
		marginBottom: 31.5,
	},
});

export default SupportPage1;

