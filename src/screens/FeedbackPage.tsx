
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { useAuth } from '../store/useAppStore';

const emojis = ['😢', '😞', '😐', '😊', '😍'];
const emojiLabels = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

const FeedbackPage: React.FC = () => {
	const [selectedRating, setSelectedRating] = useState(4); // 0-4 scale, 4 happiest
	const [feedback, setFeedback] = useState('');
	const [sending, setSending] = useState(false);
	const navigation = useNavigation();
	const { token, user } = useAuth();

	const handleSend = async () => {
		// Validation
		if (!feedback.trim()) {
			Alert.alert('Feedback Required', 'Please enter your feedback before sending.');
			return;
		}

		if (!token) {
			Alert.alert('Authentication Error', 'You need to be logged in to send feedback.');
			return;
		}

		setSending(true);
		try {
			// Construct the message with rating
			const ratingLabel = emojiLabels[selectedRating];
			const fullMessage = `Rating: ${emojis[selectedRating]} ${ratingLabel}\n\n${feedback.trim()}`;

			const backendUrl = 'http://dev.api.uyir.ai/support/feedback';

			console.log('📧 Sending feedback to:', backendUrl);
			console.log('📧 User email:', user?.email);
			console.log('📧 User mobile:', user?.mobile);
			console.log('📧 Rating:', `${emojis[selectedRating]} ${ratingLabel}`);

			const response = await fetch(backendUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: fullMessage,
				}),
			});

			const responseText = await response.text();
			console.log('📧 Response status:', response.status);
			console.log('📧 Response:', responseText);

			if (response.ok) {
				Alert.alert(
					'Thank You! 💜',
					'Your feedback has been sent successfully. We appreciate you taking the time to help us improve!',
					[
						{
							text: 'OK',
							onPress: () => {
								// Clear the form
								setFeedback('');
								setSelectedRating(4);
								// Navigate back
								navigation.goBack();
							}
						}
					]
				);
			} else {
				let errorMessage = 'Failed to send feedback. Please try again.';
				let userFriendlyMessage = errorMessage;

				try {
					const errorData = JSON.parse(responseText);
					if (errorData.detail) {
						if (typeof errorData.detail === 'string') {
							errorMessage = errorData.detail;

							// Make error messages more user-friendly
							if (errorMessage.includes('Failed to send email') || errorMessage.includes('Mailgun')) {
								userFriendlyMessage = 'We are experiencing email service issues. Your feedback has been recorded and our team will be notified. Please try again later.';
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

				console.error('❌ Feedback submission failed:', errorMessage);
				Alert.alert('Error', userFriendlyMessage);
			}
		} catch (error) {
			console.error('❌ Network error:', error);
			Alert.alert(
				'Network Error',
				'Could not send feedback. Please check your connection and try again.'
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
				<Text style={styles.title}>Feedback</Text>

				{/* Share Your Feedback Section */}
				<Text style={styles.sectionTitle}>Share Your Feedback</Text>
				<Text style={styles.sectionSubtitle}>Rate your Experience</Text>

				{/* Emoji Rating */}
				<View style={styles.emojiRow}>
					{emojis.map((emoji, idx) => (
						<TouchableOpacity
							key={idx}
							style={[styles.emojiBtn, selectedRating === idx && styles.emojiSelected]}
							onPress={() => setSelectedRating(idx)}
							activeOpacity={0.8}
						>
							<Text style={styles.emoji}>{emoji}</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Feedback Text Area */}
				<Text style={styles.feedbackLabel}>Your feedback</Text>
				<TextInput
					style={styles.feedbackInput}
					value={feedback}
					onChangeText={setFeedback}
					placeholder="Describe your experience here"
					placeholderTextColor="#A9A9A9"
					multiline
					numberOfLines={5}
				/>

				{/* Send Button */}
				<TouchableOpacity
					style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
					onPress={handleSend}
					activeOpacity={0.8}
					disabled={sending}
				>
					{sending ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Text style={styles.sendText}>Send</Text>
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
	},
	backBtn: {
		marginBottom: 10.8,
		marginTop: 27,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 25.2,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 21.6,
		marginTop: 14.4,
		fontFamily: 'Outfit-Bold',
	},
	sectionTitle: {
		fontSize: 21.6,
		fontWeight: 'bold',
		color: '#0A0A0A',
		marginBottom: 7.2,
	},
	sectionSubtitle: {
		fontSize: 16.2,
		fontWeight: '400',
		color: '#0A0A0A',
		marginBottom: 21.6,
	},
	emojiRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 28.8,
	},
	emojiBtn: {
		width: 54,
		height: 54,
		borderRadius: 10.8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: 'transparent',
	},
	emojiSelected: {
		borderColor: '#7B66FF',
		backgroundColor: '#F8F7FF',
	},
	emoji: {
		fontSize: 28.8,
	},
	feedbackLabel: {
		fontSize: 16.2,
		fontWeight: 'bold',
		color: '#0A0A0A',
		marginBottom: 10.8,
	},
	feedbackInput: {
		width: '100%',
		minHeight: 270,
		borderRadius: 10.8,
		borderWidth: 2,
		borderColor: '#121212',
		padding: 14.4,
		fontSize: 14.4,
		backgroundColor: '#fff',
		color: '#121212',
		marginBottom: 28.8,
		textAlignVertical: 'top',
	},
	sendBtn: {
		width: '100%',
		height: 50.4,
		backgroundColor: '#7B66FF',
		borderRadius: 25.2,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 14.4,
		shadowColor: '#7B66FF',
		shadowOffset: { width: 0, height: 7.2 },
		shadowOpacity: 0.35,
		shadowRadius: 20,
		elevation: 4,
	},
	sendBtnDisabled: {
		backgroundColor: '#B8B0FF',
		opacity: 0.6,
	},
	sendText: {
		color: '#fff',
		fontSize: 16.2,
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

export default FeedbackPage;

