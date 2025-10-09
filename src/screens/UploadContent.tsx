import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/AppNavigator';

const UploadContent: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Placeholder states for each file type
  const [_document, _setDocument] = useState<string | null>(null);
  const [_video, _setVideo] = useState<string | null>(null);
  const [_audio, _setAudio] = useState<string | null>(null);
  const [_image, _setImage] = useState<string | null>(null);

  // Placeholder upload handler
  const handleUpload = (_type: string) => {
    // TODO: Implement file picker logic for each type
  };

  return (
    <View style={styles.root}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#222" onPress={() => navigation.goBack()} />
      </TouchableOpacity>
      {/* Title */}
      <Text style={styles.title}>Upload</Text>
      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Add files to help your avatar learn and respond better.
      </Text>
      {/* Upload Boxes */}
      <View style={styles.uploadBoxGroup}>
        {/* Documents */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadIconBtn} onPress={() => handleUpload('document')}>
            <Ionicons name="cloud-upload-outline" size={40} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        <View style={styles.uploadLabelRow}><Text style={styles.uploadLabel}>Documents (.docx, .pdf, .txt, .xlsx)</Text></View>
        {/* Videos */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadIconBtn} onPress={() => handleUpload('video')}>
            <Ionicons name="cloud-upload-outline" size={40} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        <View style={styles.uploadLabelRow}><Text style={styles.uploadLabel}>Videos (.mp4, .mov)</Text></View>
        {/* Audio */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadIconBtn} onPress={() => handleUpload('audio')}>
            <Ionicons name="cloud-upload-outline" size={40} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        <View style={styles.uploadLabelRow}><Text style={styles.uploadLabel}>Audio (.mp3, .wav)</Text></View>
        {/* Images */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadIconBtn} onPress={() => handleUpload('image')}>
            <Ionicons name="cloud-upload-outline" size={40} color="#BDBDBD" />
          </TouchableOpacity>
        </View>
        <View style={styles.uploadLabelRow}><Text style={styles.uploadLabel}>Images (.jpg, .png)</Text></View>
      </View>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('LetUsKnowYou2')}>
        <Text style={styles.skipBtnText}>Skip for Now</Text>
      </TouchableOpacity>
      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadFilesBtn}>
        <Text style={styles.uploadFilesBtnText}>Upload Files</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    marginBottom: 10,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  uploadBoxGroup: {
    marginTop: 24,
    marginBottom: 32,
  },
  uploadBox: {
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  uploadLabelRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    marginTop: 4,
  },
  uploadIconBtn: {
    width: 50,
    height: 50,
    borderRadius: 28,
    backgroundColor: '#EDEBFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  uploadLabel: {
    color: '#BDBDBD',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
    textAlign: 'right',
    flex: 1,
  },
  skipBtn: {
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  skipBtnText: {
    color: '#000000c5',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
  uploadFilesBtn: {
    backgroundColor: '#8170FF',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadFilesBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
});

export default UploadContent;