import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const goodPhotos = [
	'https://media.istockphoto.com/id/1477871619/photo/portrait-of-happy-businesswoman-arms-crossed-looking-at-camera-on-white-background-stock-photo.jpg?s=612x612&w=0&k=20&c=vH666X9xpurnAfKaxvHE43O-b0WxmF4_VpOfALsg0PY=',
	'https://media.istockphoto.com/id/1474167073/photo/businesswoman-confidently-posing-stock-photo.jpg?s=2048x2048&w=is&k=20&c=iJImoqip7jKYWBNa5kr7WMNZcUFpst_QLn02JP5D05w=',
	'https://media.istockphoto.com/id/1688340412/photo/portrait-of-young-working-woman.jpg?s=612x612&w=0&k=20&c=LmW9Pej_ccwYbBM_uUraIsbEBtRoIcX-nxGgc8-oFHY=',
	'https://media.istockphoto.com/id/1343165468/photo/business-woman-stock-photo.jpg?s=612x612&w=0&k=20&c=JA4KHCvvShVPlT2CbAkQ54hVqC8mWeqmxdbCmIrFdKc=',
];
const badPhotos = [
	'https://media.istockphoto.com/id/1335085226/photo/close-up-of-woman-work-on-laptop-at-home-office.jpg?s=612x612&w=0&k=20&c=4pp5UwodTzRkvBiXZy_D8J-fmyXr3ZPAqQ4hJRLaJRY=',
	'https://media.istockphoto.com/id/679811552/photo/indian-girl-sitting-on-roof-terrace.jpg?s=612x612&w=0&k=20&c=jK6aLm-748b6hFoMXbIxMAF9vjX0akAAcYlYr0nIGtM=',
	'https://media.istockphoto.com/id/1143284701/photo/closeup-of-woman-thinking-with-hand-on-chin.jpg?s=612x612&w=0&k=20&c=AuRSzSNHT3e-qNC_zGtyBqEgUvfpvU99pqNMyYeCcJg=',
	'https://images.unsplash.com/photo-1673404905144-43308715e581?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fGJhZCUyMHBvc2luZyUyMHBob3Rvc3xlbnwwfHwwfHx8MA%3D%3D',
];

type RootStackParamList = {
	CreateAccount: undefined;
	CreateAvatar3: undefined;
	CreateAvatar4: undefined;
	AccountGranted: undefined;
	Upload: undefined;
	// ...other screens
};

type LearnMoreProps = {
	onClose: () => void;
	onDone?: () => void;
	nextScreen?: keyof RootStackParamList; // Add this prop
};

const LearnMore: React.FC<LearnMoreProps> = ({ onClose: _onClose, onDone, nextScreen }) => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

	return (
		<View style={styles.root}>
			{/* Overlay */}
			<View style={styles.overlay} />
			{/* Modal Card */}
			<View style={styles.modalCard}>
				<View style={styles.innerCard}>
					<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
						<Text style={styles.header}>Photo Requirements</Text>
						{/* Good Photos */}
						<View style={styles.sectionRow}>
							<View style={styles.iconCircleGreen}>
								<Text style={styles.iconCheck}>✓</Text>
							</View>
							<Text style={styles.sectionTitleGood}>Good Photos</Text>
						</View>
						<Text style={styles.sectionDesc}>
							Recent photos of yourself (just you), showing a mix of close-ups and full-body shots, with different angles, expressions (smiling, neutral, serious), and a variety of outfits. Make sure they are High-resolution and reflect your current appearance.
						</Text>
						<View style={styles.photoRow}>
							{goodPhotos.map((img, idx) => (
								<View key={idx} style={styles.photoContainer}>
									<Image source={{ uri: img }} style={styles.photoImg} />
									<View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>
								</View>
							))}
						</View>
						{/* Bad Photos */}
						<View style={[styles.sectionRow, styles.sectionRowSpaced]}>
							<View style={styles.iconCircleRed}>
								<Text style={styles.iconCross}>✕</Text>
							</View>
							<Text style={styles.sectionTitleBad}>Bad Photos</Text>
						</View>
						<Text style={styles.sectionDesc}>
							No group photos, hats, sunglasses, pets, heavy filters, low-resolution images, or screenshots. Avoid photos that are too old, overly edited, or don't represent how you currently look.
						</Text>
						<View style={styles.photoRow}>
							{badPhotos.map((img, idx) => (
								<View key={idx} style={styles.photoContainer}>
									<Image source={{ uri: img }} style={styles.photoImg} />
									<View style={styles.crossCircle}><Text style={styles.crossMark}>✕</Text></View>
								</View>
							))}
						</View>
					</ScrollView>
				</View>
				<TouchableOpacity
					style={styles.doneBtn}
					onPress={() => {
						if (onDone) {
							onDone();
						} else if (nextScreen) {
							navigation.navigate(nextScreen);
						}
					}}
				>
					<Text style={styles.doneBtnText}>Done</Text>
				</TouchableOpacity>
			</View>
			{/* Home Indicator removed as requested */}
		</View>
	);
};

const styles = StyleSheet.create({
	innerCard: {
		backgroundColor: '#F7F8FA',
		borderRadius: 16,
		padding: 18,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.07,
		shadowRadius: 8,
		elevation: 2,
	},
	root: {
		flex: 1,
		backgroundColor: 'transparent',
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		position: 'relative',
	},
	overlay: {
		position: 'absolute',
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		backgroundColor: 'rgba(13,13,13,0.74)',
		top: 0,
		left: 0,
		zIndex: 1,
	},
	modalCard: {
		position: 'absolute',
		top: 200,
		left: -12,
		width: SCREEN_WIDTH,
		minHeight: 600,
		backgroundColor: '#fff',
		borderRadius: 20,
		zIndex: 2,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 50,
		marginHorizontal: 12,
		alignSelf: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.11,
		shadowRadius: 16.2,
		elevation: 8,
	},
	scrollContent: {
		paddingBottom: 32,
	},
	header: {
		fontFamily: 'Outfit',
		fontWeight: '700',
		fontSize: 20,
		color: '#222',
		marginBottom: 18,
		alignSelf: 'flex-start',
	},
	sectionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
		marginTop: 8,
	},
	iconCircleGreen: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#1ED760',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	},
	iconCheck: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	sectionTitleGood: {
		fontFamily: 'Outfit',
		fontWeight: '600',
		fontSize: 17,
		color: '#222',
	},
	sectionDesc: {
		fontFamily: 'Outfit',
		fontWeight: '400',
		fontSize: 14,
		color: '#222',
		marginBottom: 10,
		lineHeight: 20,
	},
	photoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 8,
		marginTop: 4,
	},
	photoContainer: {
		position: 'relative',
		marginRight: 8,
	},
	photoImg: {
		width: 60,
		height: 60,
		borderRadius: 10,
		backgroundColor: '#ccc',
	},
	checkCircle: {
		position: 'absolute',
		bottom: 2,
		right: 2,
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: '#1ED760',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#fff',
	},
	checkMark: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 14,
	},
	iconCircleRed: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#FF4B4B',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	},
	iconCross: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	sectionTitleBad: {
		fontFamily: 'Outfit',
		fontWeight: '600',
		fontSize: 17,
		color: '#222',
	},
	crossCircle: {
		position: 'absolute',
		bottom: 2,
		right: 2,
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: '#FF4B4B',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#fff',
	},
	crossMark: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 14,
	},
	doneBtn: {
		marginTop: 16,
		alignSelf: 'center',
		backgroundColor: 'transparent',
		borderWidth: 0,
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	doneBtnText: {
		color: '#6C5CE7',
		fontFamily: 'Outfit',
		fontWeight: '700',
		fontSize: 17,
		textAlign: 'center',
		textDecorationColor: '#6C5CE7',
		textDecorationStyle: 'solid',
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	sectionRowSpaced: {
		marginTop: 24,
	},
	// homeIndicator styles removed
});

export default LearnMore;
