import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const PasswordChange: React.FC = () => {
	const navigation = useNavigation();
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);

	const handleChangePassword = () => {
		// TODO: Implement password change logic
		console.log('Change password:', currentPassword, newPassword, confirmPassword);
		setModalVisible(true);
	};

	return (
		<SafeAreaView style={styles.safeAreaContainer}>
			<ScrollView contentContainerStyle={styles.container}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={styles.title}>Change Password</Text>

				{/* Current Password */}
				<Text style={styles.label}>Current Password</Text>
				<View style={styles.inputRow}>
					<TextInput
						style={styles.input}
						value={currentPassword}
						onChangeText={setCurrentPassword}
						placeholder="********************"
						placeholderTextColor="#868686"
						secureTextEntry={!showCurrent}
					/>
					<TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
						<Ionicons name={showCurrent ? 'eye' : 'eye-off'} size={24} color="#222" />
					</TouchableOpacity>
				</View>

				{/* New Password */}
				<Text style={styles.label}>New Password</Text>
				<View style={styles.inputRow}>
					<TextInput
						style={styles.input}
						value={newPassword}
						onChangeText={setNewPassword}
						placeholder="********************"
						placeholderTextColor="#868686"
						secureTextEntry={!showNew}
					/>
					<TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
						<Ionicons name={showNew ? 'eye' : 'eye-off'} size={24} color="#222" />
					</TouchableOpacity>
				</View>

				{/* Confirm Password */}
				<Text style={styles.label}>Re-enter new password</Text>
				<View style={styles.inputRow}>
					<TextInput
						style={styles.input}
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						placeholder="abcd@2007#"
						placeholderTextColor="#868686"
						secureTextEntry={!showConfirm}
					/>
					<TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
						<Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={24} color="#222" />
					</TouchableOpacity>
				</View>

				{/* Change Password Button */}
				<TouchableOpacity style={styles.changeBtn} onPress={handleChangePassword}>
					<Text style={styles.changeBtnText}>Change Password</Text>
				</TouchableOpacity>

				{/* Forgot Password Link */}
				<View style={styles.forgotRow}>
					<Text style={styles.forgotText}>Forgot password?</Text>
					<TouchableOpacity>
						<Text style={styles.resetText}>Click here to reset</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
			<Modal
				visible={modalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.simpleOverlay} />
					<View style={styles.modalContent}>
						<Text style={styles.modalText}>Password has been updated</Text>
						<View style={styles.modalIconWrap}>
							<View style={styles.modalIconCircle}>
								<Ionicons name="checkmark" size={32} color="#715CF6" />
							</View>
						</View>
						<TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
							<Text style={styles.modalBtnText}>Done</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
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
		marginBottom: 1.8,
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
		fontSize: 16.2,
		color: '#222',
		fontWeight: 'bold',
		marginBottom: 7.2,
		fontFamily: 'Outfit-Bold',
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#121212',
		borderRadius: 14.4,
		backgroundColor: '#fff',
		marginBottom: 16.2,
		paddingHorizontal: 10.8,
		height: 50.4,
	},
	input: {
		flex: 1,
		fontSize: 16.2,
		color: '#121212',
		backgroundColor: '#fff',
		fontFamily: 'Outfit-Regular',
		paddingVertical: 0,
	},
	eyeBtn: {
		padding: 7.2,
	},
	changeBtn: {
		width: '100%',
		height: 50.4,
		backgroundColor: '#715CF6',
		borderRadius: 25.2,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 180,
		marginBottom: 14.4,
	},
	changeBtnText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		fontFamily: 'Outfit-Bold',
	},
	forgotRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 14.4,
	},
	forgotText: {
		fontSize: 14.4,
		color: '#868686',
		fontFamily: 'Outfit-Regular',
	},
	resetText: {
		fontSize: 14.4,
		color: '#2D2175',
		fontFamily: 'Outfit-Bold',
		marginLeft: 3.6,
		textDecorationLine: 'underline',
	},
	modalOverlay: {
		flex: 1,
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
	},
	simpleOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255,255,255,0.85)',
		zIndex: 0,
	},
	modalContent: {
		width: 306,
		backgroundColor: '#fff',
		borderRadius: 16.2,
		alignItems: 'center',
		paddingVertical: 28.8,
		paddingHorizontal: 16.2,
		shadowColor: '#000',
		shadowOpacity: 0.12,
		shadowRadius: 12,
		elevation: 8,
		zIndex: 1,
	},
	modalText: {
		fontSize: 16.2,
		color: '#222',
		fontFamily: 'Outfit-Bold',
		textAlign: 'center',
		marginBottom: 16.2,
	},
	modalIconWrap: {
		marginBottom: 16.2,
	},
	modalIconCircle: {
		width: 43.2,
		height: 43.2,
		borderRadius: 21.6,
		backgroundColor: '#EDE7FE',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalBtn: {
		width: '100%',
		height: 43.2,
		backgroundColor: '#715CF6',
		borderRadius: 21.6,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 7.2,
	},
	modalBtnText: {
		color: '#fff',
		fontSize: 16.2,
		fontWeight: 'bold',
		fontFamily: 'Outfit-Bold',
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	bottomNavContainer: {
		marginBottom: 31.5,
	},
});

export default PasswordChange;

