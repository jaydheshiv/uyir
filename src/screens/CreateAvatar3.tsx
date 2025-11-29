import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, NativeModules, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../components/PrimaryButton';
import { buildKnowledgeUrl } from '../config/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { createReplicaWithUploads } from '../services/tavusService';
import { useAuth, useProfessional } from '../store/useAppStore';
import VideoRecordingGuide from './VideoRecordingGuide';

const PROFESSIONAL_PROFILE_URL = 'http://dev.api.uyir.ai:8081/professional/';
const CONSENT_SCRIPT_TEMPLATE = `<Keep lips closed and look into the camera for 1 second>

I, {{name}}, am currently speaking and give consent to Tavus to create an AI clone of me by using the audio and video samples I provide. I understand that this AI clone can be used to create videos that look and sound like me.`;

const TRAINING_SCRIPT_TEMPLATE = `<Start with a big smile. For the first part of your training you will read the script below. This script is for replicas that have a narrator-like tone. Keep your head steady, speak clearly as if talking to a group of friends, and smile occasionally. For the second part of your training, you will remain silent for 1 minute as if you were listening to an old friend tell a story. Make sure to keep your head still and minimize any movement.>

I, {{name}}, am currently speaking and give consent to Tavus to create an AI clone of me by using the audio and video samples I provide. I understand that this AI clone can be used to create videos that look and sound like me.`;

const VIDEO_FILE_REGEX = /(\.mp4|\.mov|\.m4v|\.webm|\.avi)$/i;
const DEFAULT_REPLICA_DESCRIPTION = 'Replica created via Uyir mobile app';

const extractProfessionalIdFromPayload = (payload: any): string | null => {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string' || typeof payload === 'number') {
    return String(payload);
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const derived = extractProfessionalIdFromPayload(item);
      if (derived) {
        return derived;
      }
    }
    return null;
  }

  const candidates = [
    payload.professional_id,
    payload.PROFESSIONAL_ID,
    payload.professionalId,
    payload.id,
    payload?.professional?.professional_id,
    payload?.profile?.professional_id,
  ];

  const match = candidates.find((value) => typeof value === 'string' || typeof value === 'number');
  return match ? String(match) : null;
};

const CreateAvatar3: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const { professionalData, setProfessionalData } = useProfessional();

  const [isCreatingReplica, setIsCreatingReplica] = useState(false);
  const [hasCreatedReplica, setHasCreatedReplica] = useState<boolean>(Boolean(professionalData?.replica_id));
  const [showVideoGuide, setShowVideoGuide] = useState(true);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [hasUploadedVoice, setHasUploadedVoice] = useState(false);
  const [selectedVoiceFile, setSelectedVoiceFile] = useState<any>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(professionalData?.professional_id ?? null);
  const [consentVideoFile, setConsentVideoFile] = useState<any>(null);
  const [trainingVideoFile, setTrainingVideoFile] = useState<any>(null);
  const [replicaStatusMessage, setReplicaStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (professionalData?.professional_id) {
      setProfessionalId(professionalData.professional_id);
    }
  }, [professionalData?.professional_id]);

  useEffect(() => {
    if (professionalData?.replica_id) {
      setHasCreatedReplica(true);
      setReplicaStatusMessage('Replica already linked to your profile. You can retrain anytime.');
    }
  }, [professionalData?.replica_id]);

  const displayNameForScripts = useMemo(() => professionalData?.display_name || 'Introspect Labs', [professionalData?.display_name]);
  const consentScript = useMemo(() => CONSENT_SCRIPT_TEMPLATE.replace(/{{name}}/g, displayNameForScripts), [displayNameForScripts]);
  const trainingScript = useMemo(() => TRAINING_SCRIPT_TEMPLATE.replace(/{{name}}/g, displayNameForScripts), [displayNameForScripts]);

  const resetReplicaProgress = () => {
    setHasCreatedReplica(false);
    setHasUploadedVoice(false);
    setReplicaStatusMessage(null);
  };

  const ensureProfessionalProfile = async () => {
    if (professionalId) {
      return { status: 'ok' as const, id: professionalId };
    }

    if (professionalData?.professional_id) {
      setProfessionalId(professionalData.professional_id);
      return { status: 'ok' as const, id: professionalData.professional_id };
    }

    if (!token) {
      return {
        status: 'error' as const,
        id: null,
        message: 'Not authenticated. Please login again.',
      };
    }

    try {
      console.log('🔍 Checking professional profile...');
      const response = await fetch(PROFESSIONAL_PROFILE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 404) {
        console.error('❌ Professional profile not found');
        return { status: 'not_found' as const, id: null };
      }

      const payload = await response
        .json()
        .catch(() => {
          console.warn('⚠️ Professional profile response was not JSON');
          return null;
        });

      if (!response.ok) {
        const detail = payload?.detail || 'Could not verify your professional profile. Please try again.';
        console.error('❌ Professional profile check failed:', detail);
        return {
          status: 'error' as const,
          id: null,
          message: detail,
        };
      }

      const derivedId = extractProfessionalIdFromPayload(payload);
      if (derivedId) {
        console.log('✅ Professional profile confirmed. ID:', derivedId);
        setProfessionalId(derivedId);
        return { status: 'ok' as const, id: derivedId };
      }

      console.warn('⚠️ Professional ID missing in profile response');
      return {
        status: 'error' as const,
        id: null,
        message: 'Professional ID is missing from the profile response.',
      };
    } catch (error) {
      console.error('❌ Failed to verify professional profile:', error);
      return {
        status: 'error' as const,
        id: null,
        message: 'Could not verify your professional profile. Please try again.',
      };
    }
  };

  const requestVideoPermissionIfNeeded = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Required', 'Video access permission denied.');
        throw new Error('permission-denied');
      }
    }
  };

  const handleVideoSelection = async (type: 'consent' | 'training') => {
    try {
      await requestVideoPermissionIfNeeded();

      const documentPickerModule = (await import('react-native-document-picker')) as typeof import('react-native-document-picker');
      const { default: DocumentPicker, types } = documentPickerModule;

      const picked = await DocumentPicker.pickSingle({
        type: types?.video ? [types.video] : Platform.OS === 'ios' ? ['public.movie'] : ['video/*'],
        presentationStyle: 'formSheet',
        copyTo: 'cachesDirectory',
      });

      if (!picked) {
        Alert.alert('Cancelled', 'No video selected.');
        return;
      }

      const fileUri = picked.fileCopyUri || picked.uri;
      if (!fileUri) {
        Alert.alert('Error', 'Unable to access selected video. Please try again.');
        return;
      }

      const resolvedName = picked.name || picked.fileCopyUri?.split('/')?.pop() || 'video.mp4';
      const lowerName = (resolvedName || '').toLowerCase();
      if (!VIDEO_FILE_REGEX.test(lowerName)) {
        Alert.alert('Invalid File', 'Please choose a valid video file (MP4, MOV, M4V, WEBM, AVI).');
        return;
      }

      const selected = {
        uri: fileUri,
        type: picked.type || 'video/mp4',
        name: resolvedName,
      };

      resetReplicaProgress();
      if (type === 'consent') {
        setConsentVideoFile(selected);
      } else {
        setTrainingVideoFile(selected);
      }

      console.log('🎥 Video selected:', type, resolvedName, fileUri);
      Alert.alert('Video Selected', `${type === 'consent' ? 'Consent' : 'Training'} video ready. Review the script before recording or uploading.`);
    } catch (error: any) {
      if (error?.message === 'permission-denied') {
        return;
      }

      try {
        const documentPickerModule = await import('react-native-document-picker');
        if (documentPickerModule.isCancel?.(error)) {
          console.log('User cancelled video picker');
          return;
        }
      } catch (importErr) {
        // ignore; handled below
      }

      console.error('Video picker error:', error);
      Alert.alert('Error', 'Failed to pick video file.');
    }
  };

  const handleClearReplicaSelection = () => {
    setConsentVideoFile(null);
    setTrainingVideoFile(null);
    resetReplicaProgress();
    setSelectedVoiceFile(null);
  };

  const handleReplicaCreation = async () => {
    if (!consentVideoFile) {
      Alert.alert('Consent Video Required', 'Please upload the consent video following the provided script.');
      return;
    }

    if (!trainingVideoFile) {
      Alert.alert('Training Video Required', 'Please upload your training video before creating the replica.');
      return;
    }

    try {
      const profileResult = await ensureProfessionalProfile();

      if (profileResult.status === 'not_found') {
        Alert.alert(
          'Profile Not Found',
          'Please complete your professional profile first in the previous screen.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ],
        );
        return;
      }

      if (profileResult.status === 'error') {
        Alert.alert('Error', profileResult.message || 'Could not verify your professional profile. Please try again.');
        return;
      }

      setIsCreatingReplica(true);
      setReplicaStatusMessage('Uploading videos to Tavus. This may take a minute...');

      const replicaResponse = await createReplicaWithUploads({
        trainingVideo: trainingVideoFile,
        consentVideo: consentVideoFile,
        replicaName: displayNameForScripts,
        consentScript,
        trainingScript,
        description: `${DEFAULT_REPLICA_DESCRIPTION} (${profileResult.id})`,
      });

      const newReplicaId = replicaResponse.replica_id;
      if (newReplicaId) {
        setHasCreatedReplica(true);
        setReplicaStatusMessage('Replica request submitted. Tavus will notify you once training completes.');
        setProfessionalId(profileResult.id);
        setSelectedVoiceFile(null);
        setHasUploadedVoice(false);

        if (professionalData) {
          setProfessionalData({
            ...professionalData,
            replica_id: newReplicaId,
          });
        } else {
          console.warn('⚠️ Replica created but no professional data cached to persist the replica ID locally.');
        }
      } else {
        setReplicaStatusMessage('Replica request sent. Awaiting Tavus confirmation.');
      }

      Alert.alert(
        'Replica Requested',
        'Your consent and training videos were uploaded successfully. Replica training will take a few minutes.',
      );
    } catch (error: any) {
      console.error('Replica creation error:', error);
      const message = typeof error?.message === 'string' ? error.message : 'Failed to create replica. Please try again.';
      setReplicaStatusMessage(message);
      Alert.alert('Replica Upload Failed', message);
    } finally {
      setIsCreatingReplica(false);
    }
  };

  const handleVideoGuideDone = () => {
    setShowVideoGuide(false);
  };

  const handleVoiceUpload = async () => {
    try {
      // On Android we can use ACTION_OPEN_DOCUMENT without storage permission (scoped access)
      if (Platform.OS === 'android') {
        // Request READ_MEDIA_AUDIO for Android 13+ only for better compatibility (optional)
        if (Platform.Version >= 33) {
          const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
          if (res !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Required', 'Audio access permission denied.');
            return;
          }
        }
      }

      if (!hasCreatedReplica) {
        Alert.alert('Replica Required', 'Please assign your replica before uploading audio.');
        return;
      }

      const { AudioFilePicker } = NativeModules as any;
      if (!AudioFilePicker || !AudioFilePicker.pickAudioFile) {
        console.warn('AudioFilePicker native module not found; falling back to DocumentPicker.');
        await openFilePicker();
        return;
      }

      const picked = await AudioFilePicker.pickAudioFile();
      if (!picked) {
        Alert.alert('Cancelled', 'No file selected.');
        return;
      }

      // Validate mime or extension (restrict to mp3 if needed)
      const fileName = (picked.fileName || '').toLowerCase();
      const isSupported = fileName.endsWith('.mp3') || fileName.endsWith('.m4a') || fileName.endsWith('.wav') || fileName.endsWith('.aac') || (picked.type && picked.type.startsWith('audio'));
      if (!isSupported) {
        Alert.alert('Invalid File', 'Please choose a valid audio file (MP3, M4A, WAV, AAC).');
        return;
      }

      const resolvedName = picked.fileName || 'voice_sample.mp3';
      setSelectedVoiceFile({
        uri: picked.uri,
        type: picked.type || 'audio/mpeg',
        fileName: resolvedName,
        name: resolvedName,
      });
      setHasUploadedVoice(false);

      console.log('✅ Audio file selected (native picker):', picked.fileName, picked.uri);
      Alert.alert('File Selected', `Selected: ${picked.fileName}\n\nTap "Upload Voice Sample" to upload.`);
    } catch (err: any) {
      console.error('Audio picker error:', err);
      Alert.alert('Error', 'Failed to pick audio file.');
    }
  };

  const openFilePicker = async () => {
    if (!hasCreatedReplica) {
      Alert.alert('Replica Required', 'Please assign your replica before uploading audio.');
      return;
    }

    let documentPickerModule: typeof import('react-native-document-picker') | undefined;
    try {
      documentPickerModule = (await import('react-native-document-picker')) as typeof import('react-native-document-picker');
      const { default: DocumentPicker, types } = documentPickerModule;

      const picked = await DocumentPicker.pickSingle({
        type: [types.audio],
        presentationStyle: 'formSheet',
        copyTo: 'cachesDirectory',
      });

      if (!picked) {
        Alert.alert('Cancelled', 'No file selected.');
        return;
      }

      const fileUri = picked.fileCopyUri || picked.uri;
      if (!fileUri) {
        Alert.alert('Error', 'Unable to access selected file. Please try again.');
        return;
      }

      const resolvedName = picked.name || picked.fileCopyUri?.split('/')?.pop() || 'voice_sample.mp3';
      const lowerCaseName = (resolvedName || '').toLowerCase();
      const isSupported = lowerCaseName.endsWith('.mp3') ||
        lowerCaseName.endsWith('.m4a') ||
        lowerCaseName.endsWith('.wav') ||
        lowerCaseName.endsWith('.aac') ||
        (picked.type && picked.type.startsWith('audio'));

      if (!isSupported) {
        Alert.alert('Invalid File', 'Please choose a valid audio file (MP3, M4A, WAV, AAC).');
        return;
      }

      setSelectedVoiceFile({
        uri: fileUri,
        type: picked.type || 'audio/mpeg',
        fileName: resolvedName,
        name: resolvedName,
      });
      setHasUploadedVoice(false);

      console.log('✅ Audio file selected (DocumentPicker):', resolvedName, fileUri);
      Alert.alert('File Selected', `Selected: ${resolvedName}\n\nTap "Upload Voice Sample" to upload.`);
    } catch (error: any) {
      const isCancel = documentPickerModule?.isCancel;
      if (isCancel?.(error)) {
        console.log('User cancelled audio picker');
        return;
      }

      console.error('Audio picker error:', error);
      Alert.alert('Error', 'Failed to pick audio file.');
    }
  };

  const uploadVoiceToBackend = async () => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated.');
      return;
    }

    if (!selectedVoiceFile) {
      Alert.alert('Error', 'No audio file selected.');
      return;
    }

    if (!hasCreatedReplica) {
      Alert.alert('Replica Required', 'Please assign your replica before uploading audio.');
      return;
    }

    setIsUploadingVoice(true);
    try {
      const profileResult = await ensureProfessionalProfile();

      if (profileResult.status === 'not_found') {
        Alert.alert(
          'Profile Not Found',
          'Please complete your professional profile first in the previous screen.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ],
        );
        setIsUploadingVoice(false);
        return;
      }

      if (profileResult.status === 'error') {
        Alert.alert('Error', profileResult.message || 'Could not verify your professional profile. Please try again.');
        setIsUploadingVoice(false);
        return;
      }

      const professionalIdentifier = profileResult.id!;
      const sampleText = 'sample_text'; // TODO: make dynamic if needed
      const endpoint = buildKnowledgeUrl(`/professional/${encodeURIComponent(professionalIdentifier)}/persona_voice/voice_samples`);

      const formData = new FormData();
      formData.append('audio_file', {
        uri: selectedVoiceFile.uri,
        type: selectedVoiceFile.type || 'audio/mpeg',
        name: selectedVoiceFile.name || selectedVoiceFile.fileName || 'voice_sample.mp3',
      } as any);
      formData.append('sample_text', sampleText);

      console.log('=== UPLOADING VOICE FILE TO PROFESSIONAL VOICE API ===');
      console.log('URL:', endpoint);
      console.log('Professional ID:', professionalIdentifier);
      console.log('File:', selectedVoiceFile.name || selectedVoiceFile.fileName);
      console.log('Type:', selectedVoiceFile.type);
      console.log('Sample Text:', sampleText);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        console.warn('Could not parse JSON response');
      }
      console.log('Voice upload status:', response.status, 'body:', data);

      if (response.ok) {
        console.log('✅ Voice sample uploaded successfully');
        setHasUploadedVoice(true);
        Alert.alert('Success', 'Voice sample uploaded successfully!');
      } else if (response.status === 404) {
        Alert.alert('Endpoint Not Found', 'Voice upload endpoint returned 404. Please confirm the server path.');
      } else if (response.status === 400) {
        const msg = (data && (data.detail || data.message || JSON.stringify(data))) || 'Bad request';
        if (msg.toLowerCase().includes('persona')) {
          Alert.alert(
            'Persona Missing',
            'Server says persona not found for this professional. You may need to complete persona creation (e.g. upload initial video or create professional profile) before adding a voice sample.'
          );
        } else {
          Alert.alert('Invalid Request', msg);
        }
      } else {
        console.error('Voice upload failed:', data);
        Alert.alert('Upload Failed', (data && (data.detail || data.message)) || 'Failed to upload voice sample.');
      }
    } catch (error) {
      console.error('Error uploading voice:', error);
      Alert.alert('Network Error', 'Could not connect to server. Please try again.');
    } finally {
      setIsUploadingVoice(false);
    }
  };  // ✅ Activate continue button after successful upload (like CreateAvatar1.tsx)
  const isFormComplete = hasCreatedReplica && hasUploadedVoice && !isCreatingReplica && !isUploadingVoice;

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#222" onPress={() => navigation.goBack()} />
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Let us set up your pro account</Text>
          <Text style={styles.subtitle}>This improves your avatar's expressiveness</Text>
          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={() => setShowVideoGuide(true)}>
              <Text style={styles.learnMore}>Learn more</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Replica Assignment Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.imageUploadCard}>
            <Text style={styles.cardTitle}>Create your AI twin videos</Text>
            <Text style={styles.cardText}>
              Record or upload the consent and training videos that Tavus needs to build your replica.
            </Text>

            <View style={styles.scriptBlock}>
              <Text style={styles.scriptLabel}>Consent Script</Text>
              <Text style={styles.scriptText}>{consentScript}</Text>
            </View>

            <TouchableOpacity
              style={styles.videoUploadButton}
              onPress={() => handleVideoSelection('consent')}
              activeOpacity={0.8}
            >
              <Ionicons name={consentVideoFile ? 'refresh' : 'videocam'} size={18} color="#8170FF" />
              <Text style={styles.videoUploadButtonText}>
                {consentVideoFile ? 'Replace Consent Video' : 'Upload Consent Video'}
              </Text>
            </TouchableOpacity>
            {consentVideoFile && (
              <Text style={styles.selectedFileText}>{consentVideoFile.name}</Text>
            )}

            <View style={styles.scriptBlock}>
              <Text style={styles.scriptLabel}>Training Script</Text>
              <Text style={styles.scriptText}>{trainingScript}</Text>
            </View>

            <TouchableOpacity
              style={styles.videoUploadButton}
              onPress={() => handleVideoSelection('training')}
              activeOpacity={0.8}
            >
              <Ionicons name={trainingVideoFile ? 'refresh' : 'cloud-upload-outline'} size={18} color="#8170FF" />
              <Text style={styles.videoUploadButtonText}>
                {trainingVideoFile ? 'Replace Training Video' : 'Upload Training Video'}
              </Text>
            </TouchableOpacity>
            {trainingVideoFile && (
              <Text style={styles.selectedFileText}>{trainingVideoFile.name}</Text>
            )}

            <Text style={styles.helperText}>
              Tip: Keep your head steady, smile naturally, and follow the scripts above while recording.
            </Text>

            <TouchableOpacity
              onPress={handleReplicaCreation}
              style={[
                styles.primaryActionButton,
                (!consentVideoFile || !trainingVideoFile || isCreatingReplica) && styles.primaryActionButtonDisabled,
              ]}
              disabled={!consentVideoFile || !trainingVideoFile || isCreatingReplica}
            >
              {isCreatingReplica ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryActionButtonText}>
                  {hasCreatedReplica ? 'Re-upload & Retrain Replica' : 'Upload Videos & Create Replica'}
                </Text>
              )}
            </TouchableOpacity>

            {replicaStatusMessage && (
              <Text style={styles.statusMessage}>{replicaStatusMessage}</Text>
            )}

            {hasCreatedReplica && !isCreatingReplica && (
              <Text style={styles.successText}>✓ Replica request submitted</Text>
            )}

            {(consentVideoFile || trainingVideoFile) && (
              <TouchableOpacity onPress={handleClearReplicaSelection} style={styles.replaceReplicaButton}>
                <Text style={styles.replaceReplicaText}>Clear selections</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Voice Upload Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.voiceRecordCard}>
            <Text style={styles.voiceTitle}>Add the sound of you to your twin</Text>

            {/* Upload Button */}
            <TouchableOpacity
              onPress={handleVoiceUpload}
              style={styles.uploadButton}
              activeOpacity={0.7}
              disabled={!hasCreatedReplica || isUploadingVoice}
            >
              <Ionicons name="cloud-upload-outline" size={32} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.recordInstruction}>
              {selectedVoiceFile
                ? `Selected: ${selectedVoiceFile.name || selectedVoiceFile.fileName}`
                : hasCreatedReplica
                  ? 'Tap to upload your voice (Audio only)'
                  : 'Assign your replica to enable voice upload'}
            </Text>

            {/* Upload Voice Button */}
            {selectedVoiceFile && !hasUploadedVoice && (
              <TouchableOpacity
                onPress={uploadVoiceToBackend}
                style={styles.uploadVoiceButton}
                disabled={isUploadingVoice}
              >
                {isUploadingVoice ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.uploadVoiceButtonText}>Upload Voice Sample</Text>
                )}
              </TouchableOpacity>
            )}

            {hasUploadedVoice && (
              <Text style={styles.successText}>✓ Voice uploaded successfully</Text>
            )}
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <PrimaryButton
            title="Continue"
            onPress={() => navigation.navigate('Upload')}
            style={styles.continueButtonSpacing}
            disabled={!isFormComplete}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Upload')}>
            <Text style={styles.syncDataText}>
              Sync my data
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <VideoRecordingGuide
        visible={showVideoGuide}
        onClose={() => setShowVideoGuide(false)}
        onGetStarted={handleVideoGuideDone}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: -10,
  },
  backButton: {
    marginBottom: 13.5,
    marginTop: 27,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    paddingBottom: 18
  },
  headerContainer: {
    marginTop: 10.8,
    marginBottom: 18,
  },
  title: {
    fontSize: 16.2,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5.4,
    fontFamily: 'Outfit'
  },
  subtitle: {
    fontSize: 12.6,
    color: '#000',
    marginBottom: 2.7,
    fontFamily: 'Outfit'
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14.4,
    marginTop: 7.2,
  },
  guidelinesLink: {
    color: '#8170FF',
    fontSize: 12.6,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  learnMore: {
    color: '#8170FF',
    fontSize: 11.7,
    textDecorationLine: 'underline',
    marginTop: 1.8
  },
  sectionContainer: {
    marginBottom: 16.2,
  },
  imageUploadCard: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 18,
    padding: 14.4,
    backgroundColor: '#fff',
    position: 'relative',
    minHeight: 135,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#000',
    marginBottom: 7.2,
    fontFamily: 'Outfit',
  },
  cardText: {
    fontSize: 12.6,
    color: '#000',
    fontWeight: '400',
    flex: 1,
    marginBottom: 10.8,
  },
  successText: {
    fontSize: 11.7,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 9,
    fontWeight: '600',
  },
  replaceReplicaButton: {
    marginTop: 6,
    alignSelf: 'center',
  },
  replaceReplicaText: {
    color: '#8170FF',
    fontSize: 11.7,
    textDecorationLine: 'underline',
  },
  scriptBlock: {
    borderWidth: 1,
    borderColor: '#E0E0F5',
    backgroundColor: '#F7F7FF',
    padding: 12.6,
    borderRadius: 12.6,
    marginBottom: 12.6,
  },
  scriptLabel: {
    fontSize: 12.6,
    fontWeight: '600',
    color: '#5146D9',
    marginBottom: 5.4,
  },
  scriptText: {
    fontSize: 11.7,
    color: '#333',
    lineHeight: 17,
  },
  videoUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8170FF',
    borderRadius: 12.6,
    paddingVertical: 10.8,
    paddingHorizontal: 14.4,
    backgroundColor: '#fff',
    marginBottom: 4.5,
  },
  videoUploadButtonText: {
    color: '#8170FF',
    fontSize: 12.6,
    fontWeight: '600',
    marginLeft: 6,
  },
  selectedFileText: {
    fontSize: 11.7,
    color: '#555',
    textAlign: 'center',
    marginBottom: 9,
  },
  helperText: {
    fontSize: 11.7,
    color: '#666',
    textAlign: 'center',
    marginTop: 7.2,
  },
  primaryActionButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 18,
    paddingVertical: 12.6,
    alignItems: 'center',
    marginTop: 12.6,
  },
  primaryActionButtonDisabled: {
    opacity: 0.5,
  },
  primaryActionButtonText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '600',
  },
  statusMessage: {
    fontSize: 11.7,
    color: '#333',
    textAlign: 'center',
    marginTop: 9,
  },
  voiceRecordCard: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 18,
    padding: 16.2,
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: 234,
  },
  voiceTitle: {
    fontSize: 12.6,
    color: '#000',
    textAlign: 'center',
    marginBottom: 9,
    marginTop: -2,
    fontWeight: '500',
  },
  uploadButton: {
    width: 72,
    height: 67.5,
    borderRadius: 30.6,
    backgroundColor: '#8170FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },
  recordInstruction: {
    fontSize: 11.7,
    color: '#666',
    textAlign: 'center',
    marginBottom: 14.4,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 7.2,
  },
  playButton: {
    width: 32.4,
    height: 32.4,
    borderRadius: 7.2,
    backgroundColor: '#E8E3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  waveformContainer: {
    flex: 1,
    marginRight: 9,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32.4,
    justifyContent: 'space-between',
  },
  waveBar: {
    width: 2.7,
    backgroundColor: '#8170FF',
    borderRadius: 1.4,
    marginHorizontal: 0.9,
  },
  duration: {
    fontSize: 12.6,
    fontWeight: '600',
    color: '#000',
  },
  bottomButtons: {
    marginTop: 'auto',
    paddingTop: 14.4,
    gap: 10.8,
    bottom: 9,
  },
  continueButtonSpacing: {
    width: '100%',
  },
  syncDataText: {
    color: '#8170FF',
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  deleteRecordingButton: {
    padding: 5.4,
    marginLeft: 5.4,
  },
  uploadVoiceButton: {
    backgroundColor: '#8170FF',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10.8,
    marginTop: 10.8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 37.8,
  },
  uploadVoiceButtonDisabled: {
    backgroundColor: '#4CAF50',
    opacity: 0.8,
  },
  uploadVoiceButtonText: {
    color: '#fff',
    fontSize: 12.6,
    fontWeight: '600',
  },
});

export default CreateAvatar3;

