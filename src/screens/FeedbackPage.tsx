
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const emojis = ['😢', '😞', '😐', '😊', '😍'];

const FeedbackPage: React.FC = () => {
	const [selectedRating, setSelectedRating] = useState(4); // 0-4 scale, 4 happiest
	const [feedback, setFeedback] = useState('');
	const navigation = useNavigation();

	const handleSend = () => {
		// Send feedback logic
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
				<TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}>
					<Text style={styles.sendText}>Send</Text>
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
	},
	backBtn: {
		marginBottom: 12,
		marginTop: 30,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 24,
		marginTop: 16,
		fontFamily: 'Outfit-Bold',
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#0A0A0A',
		marginBottom: 8,
	},
	sectionSubtitle: {
		fontSize: 18,
		fontWeight: '400',
		color: '#0A0A0A',
		marginBottom: 24,
	},
	emojiRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 32,
	},
	emojiBtn: {
		width: 60,
		height: 60,
		borderRadius: 12,
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
		fontSize: 32,
	},
	feedbackLabel: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#0A0A0A',
		marginBottom: 12,
	},
	feedbackInput: {
		width: '100%',
		minHeight: 300,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#121212',
		padding: 16,
		fontSize: 16,
		backgroundColor: '#fff',
		color: '#121212',
		marginBottom: 32,
		textAlignVertical: 'top',
	},
	sendBtn: {
		width: '100%',
		height: 56,
		backgroundColor: '#7B66FF',
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
		shadowColor: '#7B66FF',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.35,
		shadowRadius: 20,
		elevation: 4,
	},
	sendText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		fontFamily: 'Outfit-Bold',
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	bottomNavContainer: {
		marginBottom: 25,
	},
});

export default FeedbackPage;
