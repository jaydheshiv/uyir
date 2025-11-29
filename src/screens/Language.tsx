
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const Language: React.FC = () => {
	const [selectedLanguage, setSelectedLanguage] = useState('English (UK) 2');
	const navigation = useNavigation();

	const handleLanguageSelect = (language: string) => {
		setSelectedLanguage(language);
	};

	return (
		<SafeAreaView style={styles.safeAreaContainer}>
			<ScrollView contentContainerStyle={styles.container}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={styles.title}>Language</Text>

				{/* Suggested Section */}
				<View style={styles.sectionSpacing}>
					<Text style={styles.sectionTitle}>Suggested</Text>
					<LanguageOption
						language="English (UK)"
						isSelected={selectedLanguage === 'English (UK) 1'}
						onSelect={() => handleLanguageSelect('English (UK) 1')}
					/>
					<LanguageOption
						language="English (UK)"
						isSelected={selectedLanguage === 'English (UK) 2'}
						onSelect={() => handleLanguageSelect('English (UK) 2')}
					/>
				</View>

				{/* Others Section */}
				<View>
					<Text style={styles.sectionTitle}>Others</Text>
					<LanguageOption
						language="Tamil"
						isSelected={selectedLanguage === 'Tamil'}
						onSelect={() => handleLanguageSelect('Tamil')}
					/>
					<LanguageOption
						language="Hindi"
						isSelected={selectedLanguage === 'Hindi'}
						onSelect={() => handleLanguageSelect('Hindi')}
					/>
				</View>
			</ScrollView>
			<View style={styles.bottomNavContainer}>
				<CustomBottomNav />
			</View>
		</SafeAreaView>
	);
};

type LanguageOptionProps = {
	language: string;
	isSelected: boolean;
	onSelect: () => void;
};

const LanguageOption: React.FC<LanguageOptionProps> = ({ language, isSelected, onSelect }) => (
	<TouchableOpacity onPress={onSelect} style={styles.languageOption}>
		<Text style={styles.languageText}>{language}</Text>
		<RadioButton isSelected={isSelected} />
	</TouchableOpacity>
);

const RadioButton: React.FC<{ isSelected: boolean }> = ({ isSelected }) => (
	<View style={[styles.radioBase, isSelected ? styles.radioActive : styles.radioInactive]}>
		{isSelected && <View style={styles.radioDot} />}
	</View>
);

const styles = StyleSheet.create({
	container: {
		padding: 21.6,
		backgroundColor: '#fff',
		flexGrow: 1,
	},
	backBtn: {
		marginBottom: 10.8,
		marginTop: 27,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 25.2,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 21.6,
		marginTop: 14.4,
		fontFamily: 'Outfit-Bold',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#0A0A0A',
		marginBottom: 14.4,
	},
	languageOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 14.4,
		borderBottomWidth: 1,
		borderBottomColor: '#F2F2F7',
	},
	languageText: {
		fontSize: 16.2,
		fontWeight: '400',
		color: '#0A0A0A',
	},
	radioBase: {
		width: 21.6,
		height: 21.6,
		borderRadius: 10.8,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#D1D5F7',
		backgroundColor: '#F6F7FF',
	},
	radioActive: {
		borderColor: '#7B66FF',
		backgroundColor: '#fff',
	},
	radioInactive: {
		borderColor: '#D1D5F7',
		backgroundColor: '#F6F7FF',
	},
	radioDot: {
		width: 10.8,
		height: 10.8,
		borderRadius: 5.4,
		backgroundColor: '#7B66FF',
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	sectionSpacing: {
		marginBottom: 28.8,
	},
	bottomNavContainer: {
		marginBottom: 31.5,
	},
});

export default Language;

