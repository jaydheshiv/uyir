import { useNavigation } from '@react-navigation/native';
import { Edit, UploadCloud } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

export default function ProfileSettings() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    creatorName: 'Sadhguru',
    greetings: 'Welcome to my personal space!',
    aboutMe: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <TouchableOpacity style={styles.editIcon}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Media Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Media</Text>
          <View style={styles.coverPhotoContainer}>
            <Text style={styles.inputLabel}>Cover Photo</Text>
            <View style={styles.coverPhotoBox}>
              <Image
                source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
                style={styles.coverPhotoImage}
              />
              <View style={styles.coverPhotoOverlay}>
                <UploadCloud color="black" size={40} style={styles.uploadIcon} />
                <Text style={styles.uploadText}>Click or drag to upload</Text>
              </View>
            </View>
          </View>
          <View style={styles.profilePicRow}>
            <Image
              source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
              style={styles.profilePicture}
            />
            <TouchableOpacity style={styles.uploadButton}>
              <UploadCloud color="#777777BB" size={20} />
              <Text style={styles.uploadButtonText}>Upload New Picture</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Creator Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Creator Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Creator Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.creatorName}
              onChangeText={(value) => handleInputChange('creatorName', value)}
              placeholder="Enter creator name"
              placeholderTextColor="#777777BB"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Greetings</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.greetings}
              onChangeText={(value) => handleInputChange('greetings', value)}
              placeholder="Enter greeting message"
              placeholderTextColor="#777777BB"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* About Me Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.aboutMe}
            onChangeText={(value) => handleInputChange('aboutMe', value)}
            placeholder="..............................."
            placeholderTextColor="#777777BB"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 0,
    marginLeft: -80,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 1,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  editIcon: {
    padding: 4,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: -25,
    marginTop: 10,
    fontFamily: 'Outfit',
  },
  headerWrapper: {
    paddingBottom: 12,
    backgroundColor: '#F7F7F7',
  },
  headerButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 0, // Add space below header
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Outfit-Bold',
    marginBottom: 16,
  },
  coverPhotoContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Outfit-Bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  coverPhotoBox: {
    width: '100%',
    height: 180,
    borderWidth: 1,
    borderColor: '#D1C9F7',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F3F3',
    position: 'relative',
    marginBottom: 8,
  },
  coverPhotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    opacity: 0.7,
  },
  uploadText: {
    fontSize: 16,
    color: 'black',
    opacity: 0.8,
    marginTop: 8,
    fontFamily: 'Outfit-Regular',
  },
  profilePicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  profilePicture: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 8,
    width: '100%',
    height: 48,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  bottomNavContainer: {
    marginBottom: 30,
  },
});