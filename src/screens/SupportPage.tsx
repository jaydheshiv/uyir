import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';

const FAQS = [
	'How to setup my profile?',
	'How to upgrade to pro?',
	'How to share my capsule?',
	'How do I create my avatar?',
	'How to delete my account?',
];

const SupportPage: React.FC = () => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
	return (
		<SafeAreaView style={styles.safeAreaContainer}>
			<View style={styles.container}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={styles.title}>Support</Text>
				<Text style={styles.hiText}>Hi</Text>
				<Text style={styles.helpText}>How can we help?</Text>

				{/* Message Card */}
				<TouchableOpacity style={styles.messageCard} onPress={() => navigation.navigate('SupportPage1')}>
					<View style={styles.messageCardRow}>
						<View>
							<Text style={styles.messageTitle}>Send us a message</Text>
							<Text style={styles.messageSubtitle}>We reach back in 24-48 hours</Text>
						</View>
						<Ionicons name="chevron-forward" size={28} color="#7B66FF" />
					</View>
				</TouchableOpacity>

				{/* FAQ Card */}
				<View style={styles.faqCard}>
					<Text style={styles.faqTitle}>FAQ</Text>
					<FlatList
						data={FAQS}
						keyExtractor={(_, idx) => idx.toString()}
						renderItem={({ item, index }) => (
							<TouchableOpacity style={styles.faqRow}>
								<Text style={styles.faqText}>{item}</Text>
								<Ionicons name="chevron-forward" size={22} color="#222" />
								{index < FAQS.length - 1 && <View style={styles.faqDivider} />}
							</TouchableOpacity>
						)}
					/>
				</View>
			</View>
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
		paddingBottom: 10.8,
	},
	backBtn: {
		marginBottom: 10.8,
		marginTop: -10,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 25.2,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 14.4,
		marginTop: 7.2,
		fontFamily: 'Outfit-Bold',
	},
	hiText: {
		fontSize: 16.2,
		color: '#7B66FF',
		fontWeight: 'bold',
		marginBottom: 1.8,
		fontFamily: 'Outfit-Bold',
	},
	helpText: {
		fontSize: 19.8,
		color: '#222',
		fontWeight: 'bold',
		marginBottom: 21.6,
		fontFamily: 'Outfit-Bold',
	},
	messageCard: {
		backgroundColor: '#F2F2F7',
		borderRadius: 16.2,
		padding: 18,
		marginBottom: 21.6,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	messageTitle: {
		fontSize: 19.8,
		fontWeight: 'bold',
		color: '#222',
		fontFamily: 'Outfit-Bold',
	},
	messageSubtitle: {
		fontSize: 13.5,
		color: '#222',
		marginTop: 1.8,
		fontFamily: 'Outfit-Regular',
	},
	faqCard: {
		backgroundColor: '#F2F2F7',
		borderRadius: 16.2,
		padding: 18,
		marginBottom: 21.6,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	faqTitle: {
		fontSize: 18,
		color: '#7B66FF',
		fontWeight: 'bold',
		marginBottom: 16.2,
		fontFamily: 'Outfit-Bold',
	},
	faqRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 14.4,
		position: 'relative',
	},
	faqText: {
		fontSize: 15.3,
		color: '#222',
		fontFamily: 'Outfit-Regular',
		flex: 1,
	},
	faqDivider: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 0.9,
		backgroundColor: '#E5E5E5',
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	messageCardRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	bottomNavContainer: {
		marginBottom: 31.5,
	},
});

export default SupportPage;

