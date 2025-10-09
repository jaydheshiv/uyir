import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';

const Avatar: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('Raphael Rodricks');
  const [dob, setDob] = useState('April 12th , 2004');
  const [about, setAbout] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSave = () => {
    // Save logic here
  };

  const handleDelete = () => {
    // Delete logic here
  };

  const handleTakePhoto = () => {
    setModalVisible(false);
    // TODO: Implement take photo logic
  };
  const handleUploadGallery = () => {
    setModalVisible(false);
    // TODO: Implement upload from gallery logic
  };
  const handleDeletePhoto = () => {
    setModalVisible(false);
    // TODO: Implement delete photo logic
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Avatar</Text>

        {/* Avatar with edit badge */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=512&auto=format&fit=crop' }}
              style={styles.avatarImg}
            />
            <TouchableOpacity style={styles.editBadge} onPress={() => setModalVisible(true)}>
              <View style={styles.editCircleVisible}>
                <Ionicons name="create-outline" size={25} color="#7B66FF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, styles.inputText]}
            value={username}
            onChangeText={setUsername}
            placeholder="Raphael Rodricks"
            placeholderTextColor="#A9A9A9"
          />

          <Text style={styles.label}>DoB</Text>
          <TextInput
            style={[styles.input, styles.inputText]}
            value={dob}
            onChangeText={setDob}
            placeholder="April 12th , 2004"
            placeholderTextColor="#A9A9A9"
          />

          <Text style={styles.label}>About me</Text>
          <TextInput
            style={[styles.input, styles.textArea, styles.inputText]}
            value={about}
            onChangeText={setAbout}
            placeholder="Write about yourself..............."
            placeholderTextColor="#A9A9A9"
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

        {/* Delete Avatar */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Avatar</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.modalContentBottom}>
            <TouchableOpacity style={styles.modalBtn} onPress={handleTakePhoto}>
              <Text style={styles.modalBtnText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={handleUploadGallery}>
              <Text style={styles.modalBtnText}>Upload from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={handleDeletePhoto}>
              <Text style={styles.modalBtnText}>Delete Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
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
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  backBtn: {
    marginBottom: 0,
    marginTop: -10,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
    marginTop: 16,
    fontFamily: 'Outfit-Bold',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  avatarContainer: {
    position: 'relative',
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    resizeMode: 'cover',
  },
  editBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  editCircleVisible: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B66FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#7B66FF',
  },
  formSection: {
    marginTop: 8,
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8170FF',
    marginBottom: 6,
    fontFamily: 'Outfit-Bold',
  },
  input: {
    width: '100%',
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#222',
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#222',
    marginBottom: 18,
    fontFamily: 'Outfit-Regular',
  },
  inputText: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  textArea: {
    minHeight: 100,
    paddingVertical: 16,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  saveBtn: {
    width: '100%',
    height: 64,
    backgroundColor: '#8170FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#8170FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  deleteBtn: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  deleteText: {
    color: '#D74E4E',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  modalOverlayBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  modalContentBottom: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalBtn: {
    width: '95%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#8170FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  modalBtnText: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  cancelBtn: {
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#8170FF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    textDecorationLine: 'underline',
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomNavContainer: {
    marginBottom: 25,
  },
});

export default Avatar;
