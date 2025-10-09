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
		padding: 24,
		backgroundColor: '#fff',
		flexGrow: 1,
		paddingBottom: 12,
	},
	backBtn: {
		marginBottom: 12,
		marginTop: -10,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 16,
		marginTop: 8,
		fontFamily: 'Outfit-Bold',
	},
	hiText: {
		fontSize: 18,
		color: '#7B66FF',
		fontWeight: 'bold',
		marginBottom: 2,
		fontFamily: 'Outfit-Bold',
	},
	helpText: {
		fontSize: 22,
		color: '#222',
		fontWeight: 'bold',
		marginBottom: 24,
		fontFamily: 'Outfit-Bold',
	},
	messageCard: {
		backgroundColor: '#F2F2F7',
		borderRadius: 18,
		padding: 20,
		marginBottom: 24,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	messageTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#222',
		fontFamily: 'Outfit-Bold',
	},
	messageSubtitle: {
		fontSize: 15,
		color: '#222',
		marginTop: 2,
		fontFamily: 'Outfit-Regular',
	},
	faqCard: {
		backgroundColor: '#F2F2F7',
		borderRadius: 18,
		padding: 20,
		marginBottom: 24,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	faqTitle: {
		fontSize: 20,
		color: '#7B66FF',
		fontWeight: 'bold',
		marginBottom: 18,
		fontFamily: 'Outfit-Bold',
	},
	faqRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 16,
		position: 'relative',
	},
	faqText: {
		fontSize: 17,
		color: '#222',
		fontFamily: 'Outfit-Regular',
		flex: 1,
	},
	faqDivider: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 1,
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
		marginBottom: 0,
	},
});

export default SupportPage;
