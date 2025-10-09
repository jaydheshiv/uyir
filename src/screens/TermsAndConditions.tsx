import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProfileContext } from '../store/ProfileContext';

const TermsAndConditions: React.FC = () => {
	const [agreed, setAgreed] = useState(false);
	const { setAcceptedTerms } = useProfileContext();
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

	return (
		<View style={styles.root}>
			<Text style={styles.heading}>Terms and Conditions</Text>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>1. Licensing Consent</Text>
				<Text style={styles.sectionText}>
					By proceeding, you grant Uyir the right to use your avatar’s likeness, voice, and shared content (text, audio, video) for user interactions within the platform.
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>2. Ownership & Revenue</Text>
				<Text style={styles.sectionText}>
					You retain full ownership of your content. Monetization features (like subscriptions or donations) are governed by separate agreements, and revenue sharing will be handled transparently via your dashboard.
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>3. Right to Withdraw</Text>
				<Text style={styles.sectionText}>
					By proceeding, you grant Uyir the right to use your avatar’s likeness, voice, and shared content (text, audio, video) for user interactions within the platform.
				</Text>
			</View>

			<View style={styles.checkboxRow}>
				<TouchableOpacity
					style={[styles.checkbox, agreed && styles.checkboxChecked]}
					onPress={() => setAgreed(!agreed)}
					activeOpacity={0.7}
				>
					{agreed && (
						<Ionicons name="checkmark" size={18} color="#fff" />
					)}
				</TouchableOpacity>
				<Text style={styles.checkboxLabel}>
					I agree to the above terms and wish to proceed.
				</Text>
			</View>

			<TouchableOpacity
				style={[styles.button, agreed ? styles.buttonActive : styles.buttonDisabled]}
				disabled={!agreed}
				activeOpacity={agreed ? 0.7 : 1}
				onPress={() => {
					setAcceptedTerms(true);
					navigation.navigate('ProfileScreen');
				}}
			>
				<Text style={[styles.buttonText, agreed && styles.buttonTextActive]}>Agree & Continue</Text>
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
	heading: {
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 30,
		marginTop: 30,
		color: '#222',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
	},
	section: {
		marginBottom: 32,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: '800',
		color: '#222',
		marginBottom: 8,
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
	},
	sectionText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#222',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
	},
	checkboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 32,
		marginTop: 150,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderWidth: 2,
		borderColor: '#8170FF',
		borderRadius: 6,
		marginRight: 12,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkboxChecked: {
		backgroundColor: '#8170FF',
		borderColor: '#8170FF',
	},
	checkboxLabel: {
		fontSize: 16,
		color: '#BDBDBD',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
	},
	button: {
		backgroundColor: '#D9D9D9',
		borderRadius: 32,
		paddingVertical: 18,
		alignItems: 'center',
		marginBottom: 10,
	},
	buttonActive: {
		backgroundColor: '#8170FF',
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: '#222',
		fontSize: 18,
		fontWeight: '700',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
	},
	buttonTextActive: {
		color: '#fff',
	},
});

export default TermsAndConditions;
