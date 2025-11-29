import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useProfessional } from '../store/useAppStore'; // ✅ Use Zustand

const TermsAndConditions: React.FC = () => {
	const [agreed, setAgreed] = useState(false);
	const { markProTermsAccepted, markProfessionalCreated } = useProfessional();  // ✅ Use Zustand
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
					// ✅ NOW mark as professional - ALL screens completed!
					markProfessionalCreated();  // Mark professional profile as fully completed
					markProTermsAccepted();  // Mark terms accepted in Zustand
					console.log('✅ Pro terms accepted - User is now a professional');
					console.log('✅ All professional onboarding screens completed!');
					console.log('✅ Navigating to ProfileScreen with professional UI');
					// ✅ Navigate to ProfileScreen - it will show microsite buttons based on hasAcceptedProTerms
					navigation.reset({
						index: 0,
						routes: [{ name: 'ProfileScreen' as never }],
					});
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
		paddingHorizontal: 18,
		paddingTop: Platform.OS === 'ios' ? 50 : 32,
	},
	heading: {
		fontSize: 16.2,
		fontWeight: '700',
		marginBottom: 18,
		marginTop: 45,
		color: '#222',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
	},
	section: {
		marginBottom: 21.6,
	},
	sectionTitle: {
		fontSize: 17.1,
		fontWeight: '800',
		color: '#222',
		marginBottom: 5.4,
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
	},
	sectionText: {
		fontSize: 12.6,
		fontWeight: '500',
		color: '#222',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
	},
	checkboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 21.6,
		marginTop: 90,
	},
	checkbox: {
		width: 19.8,
		height: 19.8,
		borderWidth: 2,
		borderColor: '#8170FF',
		borderRadius: 4.5,
		marginRight: 9,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkboxChecked: {
		backgroundColor: '#8170FF',
		borderColor: '#8170FF',
	},
	checkboxLabel: {
		fontSize: 12.6,
		color: '#BDBDBD',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
	},
	button: {
		backgroundColor: '#D9D9D9',
		borderRadius: 23.4,
		paddingVertical: 12.6,
		alignItems: 'center',
		marginBottom: 7.2,
		bottom: 0,
	},
	buttonActive: {
		backgroundColor: '#8170FF',
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: '#222',
		fontSize: 14.4,
		fontWeight: '700',
		fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
	},
	buttonTextActive: {
		color: '#fff',
	},
});

export default TermsAndConditions;

