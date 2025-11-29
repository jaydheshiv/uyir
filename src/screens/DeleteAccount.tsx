import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { useAuth } from '../store/useAppStore';

const REASONS = [
	"I am no longer using my account",
	"The service is too expensive",
	"I want to change my phone number",
	"I don't understand how to use the service",
	"Other"
];

const DeleteAccount: React.FC = () => {
	const navigation = useNavigation();
	const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
	const [otherReason, setOtherReason] = useState('');
	const [deleting, setDeleting] = useState(false);
	const [showOTPInput, setShowOTPInput] = useState(false);
	const [otp, setOtp] = useState('');
	const [deletionId, setDeletionId] = useState('');
	const [verifying, setVerifying] = useState(false);
	const { token, user, logout } = useAuth();

	const handleReasonToggle = (reason: string) => {
		setSelectedReasons(prev =>
			prev.includes(reason)
				? prev.filter(r => r !== reason)
				: [...prev, reason]
		);
	};

	const handleInitiateDelete = async () => {
		if (!token) {
			Alert.alert('Authentication Error', 'You need to be logged in to delete your account.');
			return;
		}

		// Construct feedback from selected reasons
		const reasonsList = selectedReasons.filter(r => r !== 'Other').join(', ');
		const feedback = selectedReasons.includes('Other') && otherReason.trim()
			? `${reasonsList ? reasonsList + ', ' : ''}${otherReason.trim()}`
			: reasonsList;

		setDeleting(true);
		try {
			const backendUrl = 'http://dev.api.uyir.ai/auth/delete';

			console.log('🗑️ Initiating account deletion...');
			console.log('🗑️ User email:', user?.email);
			console.log('🗑️ Reasons:', feedback || 'No reason provided');

			const response = await fetch(backendUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					reason: reasonsList || null,
					feedback: feedback || null,
				}),
			});

			const responseText = await response.text();
			console.log('🗑️ Response status:', response.status);
			console.log('🗑️ Response:', responseText);

			if (response.ok) {
				const data = JSON.parse(responseText);
				setDeletionId(data.deletion_id);
				setShowOTPInput(true);

				Alert.alert(
					'OTP Sent',
					`We've sent a verification code to ${user?.email || user?.mobile}. Please enter it below to confirm account deletion.`,
					[{ text: 'OK' }]
				);
			} else {
				let errorMessage = 'Failed to initiate account deletion. Please try again.';

				try {
					const errorData = JSON.parse(responseText);
					if (errorData.detail) {
						if (typeof errorData.detail === 'string') {
							errorMessage = errorData.detail;
						} else if (Array.isArray(errorData.detail)) {
							errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
						}
					}
				} catch (e) {
					// Use default error message
				}

				console.error('❌ Account deletion initiation failed:', errorMessage);
				Alert.alert('Error', errorMessage);
			}
		} catch (error) {
			console.error('❌ Network error:', error);
			Alert.alert(
				'Network Error',
				'Could not initiate account deletion. Please check your connection and try again.'
			);
		} finally {
			setDeleting(false);
		}
	};

	const handleVerifyDelete = async () => {
		if (!otp.trim() || otp.length !== 4) {
			Alert.alert('Invalid OTP', 'Please enter a valid 4-digit OTP.');
			return;
		}

		if (!token) {
			Alert.alert('Authentication Error', 'You need to be logged in.');
			return;
		}

		setVerifying(true);
		try {
			const backendUrl = 'http://dev.api.uyir.ai/auth/delete/verify';

			console.log('🗑️ Verifying account deletion with OTP...');

			const response = await fetch(backendUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					otp: otp.trim(),
				}),
			});

			const responseText = await response.text();
			console.log('🗑️ Response status:', response.status);
			console.log('🗑️ Response:', responseText);

			if (response.ok) {
				Alert.alert(
					'Account Deleted',
					'Your account has been successfully deleted. All your data has been removed.',
					[
						{
							text: 'OK',
							onPress: () => {
								// Logout and navigate to onboarding
								logout();
								navigation.reset({
									index: 0,
									routes: [{ name: 'OnboardingScreen1' as never }],
								});
							}
						}
					]
				);
			} else {
				let errorMessage = 'Failed to verify deletion. Please try again.';

				try {
					const errorData = JSON.parse(responseText);
					if (errorData.detail) {
						if (typeof errorData.detail === 'string') {
							errorMessage = errorData.detail;
						} else if (Array.isArray(errorData.detail)) {
							errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
						}
					}
				} catch (e) {
					// Use default error message
				}

				console.error('❌ Account deletion verification failed:', errorMessage);
				Alert.alert('Error', errorMessage);
			}
		} catch (error) {
			console.error('❌ Network error:', error);
			Alert.alert(
				'Network Error',
				'Could not verify account deletion. Please check your connection and try again.'
			);
		} finally {
			setVerifying(false);
		}
	};

	const handleDelete = () => {
		if (selectedReasons.length === 0) {
			Alert.alert('Select Reason', 'Please select at least one reason for deleting your account.');
			return;
		}

		if (selectedReasons.includes('Other') && !otherReason.trim()) {
			Alert.alert('Provide Reason', 'Please provide details for "Other" reason.');
			return;
		}

		// Show confirmation dialog
		Alert.alert(
			'Delete Account?',
			'Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					text: 'Delete',
					style: 'destructive',
					onPress: handleInitiateDelete,
				},
			]
		);
	};

	return (
		<SafeAreaView style={styles.safeAreaContainer}>
			<ScrollView contentContainerStyle={styles.container}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={styles.title}>Delete Account</Text>
				<Text style={styles.warningText}>
					We're really sorry to see you go! Are you sure you want to delete your account? Once you confirm, your data will be gone.
				</Text>
				{/* Reasons List */}
				<View style={styles.reasonsContainer}>
					{REASONS.map((reason, idx) => (
						<View key={idx} style={styles.reasonItem}>
							<TouchableOpacity style={styles.checkboxRow} onPress={() => handleReasonToggle(reason)}>
								<View style={[styles.checkbox, selectedReasons.includes(reason) && styles.checkboxChecked]}>
									{selectedReasons.includes(reason) && <Ionicons name="checkmark" size={18} color="#7B66FF" />}
								</View>
								<Text style={styles.reasonText}>{reason}</Text>
							</TouchableOpacity>
							{reason === 'Other' && selectedReasons.includes('Other') && (
								<TextInput
									style={styles.otherInput}
									value={otherReason}
									onChangeText={setOtherReason}
									placeholder="If others, then kindly mention the reason"
									placeholderTextColor="#868686"
									editable={!showOTPInput}
								/>
							)}
						</View>
					))}
				</View>

				{/* OTP Input Section */}
				{showOTPInput && (
					<View style={styles.otpContainer}>
						<Text style={styles.otpLabel}>Enter OTP</Text>
						<Text style={styles.otpSubtext}>
							We've sent a 4-digit verification code to {user?.email || user?.mobile}
						</Text>
						<TextInput
							style={styles.otpInput}
							value={otp}
							onChangeText={setOtp}
							placeholder="Enter 4-digit OTP"
							placeholderTextColor="#868686"
							keyboardType="number-pad"
							maxLength={4}
							editable={!verifying}
						/>
						<TouchableOpacity
							style={[styles.verifyBtn, verifying && styles.verifyBtnDisabled]}
							onPress={handleVerifyDelete}
							disabled={verifying}
						>
							{verifying ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<Text style={styles.verifyBtnText}>Verify & Delete Account</Text>
							)}
						</TouchableOpacity>
					</View>
				)}

				{/* Delete Button */}
				{!showOTPInput && (
					<TouchableOpacity
						style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
						onPress={handleDelete}
						disabled={deleting}
					>
						{deleting ? (
							<ActivityIndicator size="small" color="#D74E4E" />
						) : (
							<Text style={styles.deleteBtnText}>Delete Account</Text>
						)}
					</TouchableOpacity>
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
		marginTop: 0.9,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 25.2,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 45,
		marginTop: 7.2,
		fontFamily: 'Outfit-Bold',
	},
	warningText: {
		fontSize: 14.4,
		lineHeight: 21.6,
		color: '#0A0A0A',
		marginBottom: 28.8,
	},
	checkboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	checkbox: {
		width: 21.6,
		height: 21.6,
		borderRadius: 5.4,
		borderWidth: 2,
		borderColor: '#121212',
		marginRight: 10.8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
	},
	checkboxChecked: {
		borderColor: '#7B66FF',
		backgroundColor: '#F2F2F7',
	},
	reasonText: {
		fontSize: 14.4,
		color: '#0A0A0A',
		lineHeight: 21.6,
	},
	otherInput: {
		marginLeft: 32.4,
		marginTop: 7.2,
		width: '90%',
		height: 135,
		borderRadius: 7.2,
		borderWidth: 2,
		borderColor: '#121212',
		paddingHorizontal: 14.4,
		paddingTop: 9,
		fontSize: 14.4,
		backgroundColor: '#fff',
		color: '#121212',
		textAlignVertical: 'top',
	},
	deleteBtn: {
		width: '100%',
		height: 50.4,
		backgroundColor: 'transparent',
		borderRadius: 10.8,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 14.4,
	},
	deleteBtnDisabled: {
		opacity: 0.5,
	},
	deleteBtnText: {
		color: '#D74E4E',
		fontSize: 16.2,
		fontWeight: '600',
		fontFamily: 'Outfit-SemiBold',
	},
	otpContainer: {
		marginTop: 21.6,
		marginBottom: 14.4,
	},
	otpLabel: {
		fontSize: 16.2,
		fontWeight: 'bold',
		color: '#0A0A0A',
		marginBottom: 7.2,
		fontFamily: 'Outfit-Bold',
	},
	otpSubtext: {
		fontSize: 12.6,
		color: '#6B7280',
		marginBottom: 14.4,
		lineHeight: 18,
	},
	otpInput: {
		width: '100%',
		height: 50.4,
		borderRadius: 10.8,
		borderWidth: 2,
		borderColor: '#121212',
		paddingHorizontal: 14.4,
		fontSize: 16.2,
		backgroundColor: '#fff',
		color: '#121212',
		textAlign: 'center',
		letterSpacing: 8,
		fontWeight: 'bold',
		marginBottom: 14.4,
	},
	verifyBtn: {
		width: '100%',
		height: 50.4,
		backgroundColor: '#D74E4E',
		borderRadius: 25.2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	verifyBtnDisabled: {
		backgroundColor: '#E8B4B4',
		opacity: 0.6,
	},
	verifyBtnText: {
		color: '#fff',
		fontSize: 16.2,
		fontWeight: 'bold',
		fontFamily: 'Outfit-Bold',
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	reasonsContainer: {
		marginBottom: 21.6,
	},
	reasonItem: {
		marginBottom: 14.4,
	},
	bottomNavContainer: {
		marginBottom: 31.5,
	},
});

export default DeleteAccount;

