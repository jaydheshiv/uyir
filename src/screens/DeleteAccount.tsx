import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

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

	const handleReasonToggle = (reason: string) => {
		setSelectedReasons(prev =>
			prev.includes(reason)
				? prev.filter(r => r !== reason)
				: [...prev, reason]
		);
	};

	const handleDelete = () => {
		// TODO: Implement delete logic
		console.log('Delete account with reasons:', selectedReasons, otherReason);
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
								/>
							)}
						</View>
					))}
				</View>
				{/* Delete Button */}
				<TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
					<Text style={styles.deleteBtnText}>Delete Avatar</Text>
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
		marginTop: 1,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 50,
		marginTop: 8,
		fontFamily: 'Outfit-Bold',
	},
	warningText: {
		fontSize: 16,
		lineHeight: 24,
		color: '#0A0A0A',
		marginBottom: 32,
	},
	checkboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 6,
		borderWidth: 2,
		borderColor: '#121212',
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
	},
	checkboxChecked: {
		borderColor: '#7B66FF',
		backgroundColor: '#F2F2F7',
	},
	reasonText: {
		fontSize: 16,
		color: '#0A0A0A',
		lineHeight: 24,
	},
	otherInput: {
		marginLeft: 36,
		marginTop: 8,
		width: '90%',
		height: 150,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: '#121212',
		paddingHorizontal: 16,
		paddingTop: 10,
		fontSize: 16,
		backgroundColor: '#fff',
		color: '#121212',
		textAlignVertical: 'top',
	},
	deleteBtn: {
		width: '100%',
		height: 56,
		backgroundColor: 'transparent',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 16,
	},
	deleteBtnText: {
		color: '#D74E4E',
		fontSize: 18,
		fontWeight: '600',
		fontFamily: 'Outfit-SemiBold',
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	reasonsContainer: {
		marginBottom: 24,
	},
	reasonItem: {
		marginBottom: 16,
	},
	bottomNavContainer: {
		marginBottom: 0,
	},
});

export default DeleteAccount;
