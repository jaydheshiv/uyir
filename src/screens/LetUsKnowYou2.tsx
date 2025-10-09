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
		paddingHorizontal: 24,
		paddingTop: Platform.OS === 'ios' ? 60 : 40,
	},
	backButton: {
		marginBottom: 30,
		marginTop: 25,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 20,
		fontWeight: '500',
		color: '#222',
		marginBottom: 18,
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
	},
	avatarCard: {
		backgroundColor: '#18104A',
		borderRadius: 32,
		marginBottom: 32,
		minHeight: 220,
		height: 220,
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
		borderRadius: 32,
		resizeMode: 'cover',
	},
	soundBtn: {
		position: 'absolute',
		top: 16,
		left: 16,
		zIndex: 2,
	},
	refreshBtn: {
		position: 'absolute',
		top: 16,
		right: 16,
		zIndex: 2,
	},
	chatCard: {
		backgroundColor: '#F5F5F5',
		borderRadius: 32,
		padding: 24,
		marginBottom: 24,
		minHeight: 320,
		justifyContent: 'flex-start',
	},
	chatHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	chatTitle: {
		fontSize: 18,
		fontWeight: '500',
		color: '#222',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
	},
	reactionRow: {
		flexDirection: 'row',
		marginBottom: 8,
	},
	typingCardRow: {
		backgroundColor: '#fff',
		borderRadius: 15,
		paddingVertical: 20,
		paddingHorizontal: 20,
		minHeight: 80,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 4,
		elevation: 1,
		marginBottom: -24,
	},
	typingPlaceholder: {
		color: '#868686',
		fontSize: 16,
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
		fontWeight: '300',
		marginBottom: 28,
		marginLeft: 0,
		textAlign: 'left',
		width: '100%',
		minHeight: 36,
		padding: 1,
	},
	controlsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		marginTop: -18,
	},
	micBtn: {
		marginRight: 260,
		marginBottom: 4,
	},
	sendBtn: {
		backgroundColor: '#EDEBFA',
		borderRadius: 16,
		padding: 6,
		marginBottom: 4,
	},
	looksGoodBtn: {
		backgroundColor: '#8170FF',
		borderRadius: 32,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 10,
	},
	looksGoodBtnText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '700',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
	},
	iconSpacing: {
		marginRight: 20,
	},
	flexFill: {
		flex: 1,
	},
	typingCardExtended: {
		alignSelf: 'center',
		width: '115%',
		marginLeft: -24,
		marginRight: -24,
	},
});

export default LetUsKnowYou2;
