import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, Keyboard, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/AppNavigator';

const LetUsKnowYou2: React.FC = () => {
	const [thoughts, setThoughts] = useState('');
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

	const handleSend = () => {
		Keyboard.dismiss();
		// Add your send logic here
	};

	return (
		<View style={styles.root}>
			{/* Back Arrow */}
			<TouchableOpacity style={styles.backButton}>
				<Ionicons name="arrow-back" size={28} color="#222" onPress={() => navigation.goBack()} />
			</TouchableOpacity>
			{/* Title */}
			<Text style={styles.title}>Here’s how your twin will appear and interact with others</Text>
			{/* Avatar Preview Card */}
			<View style={styles.avatarCard}>
				<Image
					source={{ uri: "https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg" }}
					style={styles.avatarImg}
				/>
				<TouchableOpacity style={styles.soundBtn}>
					<Ionicons name="volume-high" size={28} color="#8170FF" />
				</TouchableOpacity>
				<TouchableOpacity style={styles.refreshBtn}>
					<Ionicons name="refresh" size={28} color="#8170FF" />
				</TouchableOpacity>
			</View>
			{/* Chat Card */}
			<View style={styles.chatCard}>
				<View style={styles.chatHeaderRow}>
					<Text style={styles.chatTitle}>What’s been on your mind today?</Text>
					<TouchableOpacity>
						<Ionicons name="open-outline" size={22} color="#8170FF" />
					</TouchableOpacity>
				</View>
				<View style={styles.reactionRow}>
					<Ionicons name="thumbs-up" size={20} color="#8170FF" style={styles.iconSpacing} />
					<Ionicons name="thumbs-down" size={20} color="#8170FF" />
				</View>
				<View style={styles.flexFill} />
				{/* Typing Card from Avatarhome1 */}
				<View style={[styles.typingCardRow, styles.typingCardExtended]}>
					<TextInput
						style={styles.typingPlaceholder}
						value={thoughts}
						onChangeText={setThoughts}
						placeholder="Let your thoughts flow"
						placeholderTextColor="#868686"
						multiline
					/>
					<View style={styles.controlsRow}>
						<TouchableOpacity style={styles.micBtn}>
							<Ionicons name="mic" size={22} color="#8170FF" />
						</TouchableOpacity>
						<TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
							<Ionicons name="arrow-up" size={22} color="#8170FF" />
						</TouchableOpacity>
					</View>
				</View>
			</View>
			{/* Looks Good Button */}
			<TouchableOpacity style={styles.looksGoodBtn} onPress={() => navigation.navigate('TermsAndConditions')}>
				<Text style={styles.looksGoodBtnText}>Looks Good</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#fff',
		paddingHorizontal: 18,
		paddingTop: Platform.OS === 'ios' ? 50 : 32,
	},
	backButton: {
		marginBottom: 18,
		marginTop: 31.5,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 16.2,
		fontWeight: '500',
		color: '#222',
		marginBottom: 12.6,
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
	},
	avatarCard: {
		backgroundColor: '#18104A',
		borderRadius: 23.4,
		marginBottom: 21.6,
		minHeight: 162,
		height: 162,
		overflow: 'hidden',
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarImg: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		borderRadius: 23.4,
		resizeMode: 'cover',
	},
	soundBtn: {
		position: 'absolute',
		top: 10.8,
		left: 10.8,
		zIndex: 2,
	},
	refreshBtn: {
		position: 'absolute',
		top: 10.8,
		right: 10.8,
		zIndex: 2,
	},
	chatCard: {
		backgroundColor: '#F5F5F5',
		borderRadius: 23.4,
		padding: 18,
		marginBottom: 18,
		minHeight: 252,
		justifyContent: 'flex-start',
	},
	chatHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 5.4,
	},
	chatTitle: {
		fontSize: 14.4,
		fontWeight: '500',
		color: '#222',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
	},
	reactionRow: {
		flexDirection: 'row',
		marginBottom: 5.4,
	},
	typingCardRow: {
		backgroundColor: '#fff',
		borderRadius: 12.6,
		paddingVertical: 14.4,
		paddingHorizontal: 14.4,
		minHeight: 63,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 4,
		elevation: 1,
		marginBottom: -20,
	},
	typingPlaceholder: {
		color: '#868686',
		fontSize: 12.6,
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
		fontWeight: '300',
		marginBottom: 19.8,
		marginLeft: 0,
		textAlign: 'left',
		width: '100%',
		minHeight: 28.8,
		padding: 0.9,
	},
	controlsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		marginTop: -14,
	},
	micBtn: {
		marginRight: 198,
		marginBottom: 2.7,
	},
	sendBtn: {
		backgroundColor: '#EDEBFA',
		borderRadius: 12.6,
		padding: 4.5,
		marginBottom: 2.7,
	},
	looksGoodBtn: {
		backgroundColor: '#8170FF',
		borderRadius: 23.4,
		paddingVertical: 10.8,
		alignItems: 'center',
		marginTop: 7.2,
	},
	looksGoodBtnText: {
		color: '#fff',
		fontSize: 14.4,
		fontWeight: '700',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
	},
	iconSpacing: {
		marginRight: 14.4,
	},
	flexFill: {
		flex: 1,
	},
	typingCardExtended: {
		alignSelf: 'center',
		width: '115%',
		marginLeft: -20,
		marginRight: -20,
	},
});

export default LetUsKnowYou2;

