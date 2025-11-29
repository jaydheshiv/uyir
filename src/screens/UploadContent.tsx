import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { buildKnowledgeUrl } from '../config/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth, useProfessional } from '../store/useAppStore';

type BlobUtilModule = typeof import('react-native-blob-util')['default'];

let cachedBlobUtil: BlobUtilModule | null = null;
const getBlobUtil = async (): Promise<BlobUtilModule> => {
  if (!cachedBlobUtil) {
    const module = await import('react-native-blob-util');
    if (!module?.default) {
      throw new Error('react-native-blob-util native module is unavailable');
    }
    cachedBlobUtil = module.default as BlobUtilModule;
  }
  return cachedBlobUtil;
};

type FileCategory = 'document' | 'video' | 'audio' | 'image';

interface SelectedFile {
  uri: string;
  name?: string;
  type?: string;
  size?: number | null;
}

const allowedExtensions: Record<FileCategory, string[]> = {
  document: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.ppt', '.pptx'],
  video: ['.mp4', '.mov', '.m4v', '.avi', '.mkv'],
  audio: ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
  image: ['.jpg', '.jpeg', '.png', '.heic', '.heif'],
};

const hasAllowedExtension = (fileName: string | undefined, fileType: FileCategory) => {
  if (!fileName) {
    return true;
  }
  const lower = fileName.toLowerCase();
  return allowedExtensions[fileType].some(ext => lower.endsWith(ext));
};

const inferMimeType = (fileName: string | undefined, fallback: string) => {
  if (!fileName) {
    return fallback;
  }
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
    case 'm4v':
      return 'video/quicktime';
    case 'mp3':
    case 'm4a':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'aac':
      return 'audio/aac';
    case 'ogg':
      return 'audio/ogg';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    case 'mkv':
      return 'video/x-matroska';
    case 'avi':
      return 'video/x-msvideo';
    default:
      return fallback;
  }
};

const getFileExtension = (fileType: FileCategory) => {
  switch (fileType) {
    case 'document':
      return 'pdf';
    case 'video':
      return 'mp4';
    case 'audio':
      return 'mp3';
    case 'image':
    default:
      return 'jpg';
  }
};

const getMimeType = (fileType: FileCategory, fileName?: string) => {
  const fallback = (() => {
    switch (fileType) {
      case 'document':
        return 'application/pdf';
      case 'video':
        return 'video/mp4';
      case 'audio':
        return 'audio/mpeg';
      case 'image':
      default:
        return 'image/jpeg';
    }
  })();

  return inferMimeType(fileName, fallback);
};

const sanitizeFileName = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) {
    return 'upload';
  }
  return trimmed.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, '_');
};

const buildUploadFileName = (requestedTitle: string, fallbackName: string) => {
  const extension = fallbackName.includes('.')
    ? fallbackName.slice(fallbackName.lastIndexOf('.') + 1)
    : '';
  const safeTitle = sanitizeFileName(requestedTitle);
  return extension ? `${safeTitle}.${extension}` : safeTitle;
};

const ensureUploadableUri = async (uri: string, fileType: FileCategory, fileName?: string) => {
  if (!uri) {
    return uri;
  }

  const extractExtension = (name?: string) => {
    if (!name) {
      return '';
    }
    const idx = name.lastIndexOf('.');
    return idx >= 0 ? name.slice(idx + 1) : '';
  };

  const extractBaseName = (name?: string) => {
    if (!name) {
      return '';
    }
    const idx = name.lastIndexOf('.');
    return idx >= 0 ? name.slice(0, idx) : name;
  };

  const desiredExtension = extractExtension(fileName) || getFileExtension(fileType);
  const desiredBase = sanitizeFileName(extractBaseName(fileName) || `kb-upload-${Date.now()}`);
  const desiredFileName = `${desiredBase}.${desiredExtension}`;

  const normalizeResult = (path: string) => (path.startsWith('file://') ? path : `file://${path}`);

  if (Platform.OS === 'android') {
    try {
      const RNFetchBlob = await getBlobUtil();
      const { fs } = RNFetchBlob;
      const cacheDir = fs.dirs.CacheDir;
      const targetPath = `${cacheDir}/${desiredFileName}`;

      const copyContentUri = async () => {
        const readStream = (await fs.readStream(uri, 'base64', 1024 * 64)) as any;
        const writeStream = (await fs.writeStream(targetPath, 'base64', false)) as any;

        await new Promise<void>((resolve, reject) => {
          let writing: Promise<unknown> = Promise.resolve();

          const cleanUp = (error?: unknown) => {
            try {
              readStream.close?.();
            } catch (closeErr) {
              console.warn('Failed to close read stream', closeErr);
            }
            try {
              writeStream.close?.();
            } catch (closeErr) {
              console.warn('Failed to close write stream', closeErr);
            }
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          };

          readStream.open();

          readStream.onData((chunk: string) => {
            writing = writing.then(() => writeStream.write(chunk));
          });

          readStream.onError((streamError: unknown) => {
            writing.catch(() => undefined).finally(() => cleanUp(streamError));
          });

          readStream.onEnd(() => {
            writing.then(() => cleanUp()).catch(cleanUp);
          });
        });
      };

      const copyFileUri = async (sourcePath: string) => {
        if (sourcePath === targetPath) {
          return;
        }

        try {
          await (fs as any).cp?.(sourcePath, targetPath);
          if (!(await fs.exists(targetPath))) {
            throw new Error('fs.cp did not create destination file');
          }
        } catch (cpError) {
          // Fallback to manual stream copy if cp is unavailable
          const readStream = (await fs.readStream(sourcePath, 'base64', 1024 * 64)) as any;
          const writeStream = (await fs.writeStream(targetPath, 'base64', false)) as any;

          await new Promise<void>((resolve, reject) => {
            let writing: Promise<unknown> = Promise.resolve();

            const cleanUp = (error?: unknown) => {
              try {
                readStream.close?.();
              } catch (closeErr) {
                console.warn('Failed to close read stream', closeErr);
              }
              try {
                writeStream.close?.();
              } catch (closeErr) {
                console.warn('Failed to close write stream', closeErr);
              }
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            };

            readStream.open();

            readStream.onData((chunk: string) => {
              writing = writing.then(() => writeStream.write(chunk));
            });

            readStream.onError((streamError: unknown) => {
              writing.catch(() => undefined).finally(() => cleanUp(streamError));
            });

            readStream.onEnd(() => {
              writing.then(() => cleanUp()).catch(cleanUp);
            });
          });
        }
      };

      const ensureDestinationReady = async () => {
        try {
          if (await fs.exists(targetPath)) {
            await fs.unlink(targetPath);
          }
        } catch (cleanupError) {
          console.warn('Failed to clear existing cached file before upload', cleanupError);
        }
      };

      const copyIfNeeded = async () => {
        if (uri.startsWith('content://')) {
          await ensureDestinationReady();
          await copyContentUri();
          return normalizeResult(targetPath);
        }

        const absoluteSourcePath = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
        const sourceName = absoluteSourcePath.split('/').pop();

        if (sourceName === desiredFileName) {
          return normalizeResult(absoluteSourcePath);
        }

        await ensureDestinationReady();
        await copyFileUri(absoluteSourcePath);
        return normalizeResult(targetPath);
      };

      return await copyIfNeeded();
    } catch (error) {
      console.warn('Failed to normalize upload URI; using original path', { uri, error });
      if (uri.startsWith('/')) {
        return `file://${uri}`;
      }
      return uri;
    }
  }

  if (uri.startsWith('/')) {
    return `file://${uri}`;
  }

  return uri;
};

const UploadContent: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token } = useAuth();
  const { professionalData } = useProfessional();

  // States for file uploads
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [currentFileType, setCurrentFileType] = useState<FileCategory | ''>('');
  const [title, setTitle] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<FileCategory, boolean>>>({});

  // Get PROFESSIONAL_ID from professional profile
  const PROFESSIONAL_ID = professionalData?.professional_id;

  // File picker handler
  const handleFilePicker = async (fileType: FileCategory) => {
    if (fileType === 'image' || fileType === 'video') {
      try {
        const mediaType = fileType === 'image' ? 'photo' : 'video';
        const result = await launchImageLibrary({
          mediaType,
          quality: 0.8,
          includeBase64: false,
        });

        if (result.didCancel) {
          console.log('User cancelled file picker');
          return;
        }

        if (result.errorCode) {
          console.error('File Picker Error:', result.errorMessage);
          Alert.alert('Error', 'Failed to pick file. Please try again.');
          return;
        }

        const asset: Asset | undefined = result.assets?.[0];
        if (!asset?.uri) {
          Alert.alert('Error', 'No file selected. Please try again.');
          return;
        }

        const derivedName = asset.fileName || asset.uri.split('/').pop() || undefined;
        if (derivedName && !hasAllowedExtension(derivedName, fileType)) {
          Alert.alert(
            'Unsupported File',
            `Please select a ${fileType} file with one of the following extensions: ${allowedExtensions[fileType].join(', ')}`
          );
          return;
        }

        const fileName = derivedName || `upload.${getFileExtension(fileType)}`;

        const normalizedUri = await ensureUploadableUri(asset.uri, fileType, fileName);

        const normalized: SelectedFile = {
          uri: normalizedUri,
          name: fileName,
          type: asset.type || getMimeType(fileType, fileName),
          size: asset.fileSize ?? null,
        };

        setSelectedFile(normalized);
        setCurrentFileType(fileType);
        setShowTitleModal(true);
      } catch (error) {
        console.error('Error picking file:', error);
        Alert.alert('Error', 'Failed to pick file. Please try again.');
      }
      return;
    }

    let docModule: typeof import('react-native-document-picker') | null = null;

    try {
      docModule = (await import('react-native-document-picker')) as typeof import('react-native-document-picker');
      const { default: DocumentPicker, types } = docModule;

      const pickerTypes =
        fileType === 'audio'
          ? [types.audio, 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg'].filter(Boolean)
          : [
            types.pdf,
            types.plainText,
            types.doc,
            types.docx,
            types.xls,
            types.xlsx,
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
          ].filter(Boolean);

      const result = await DocumentPicker.pickSingle({
        type: pickerTypes,
        presentationStyle: 'formSheet',
        copyTo: 'cachesDirectory',
      });

      const fallbackName = `upload.${getFileExtension(fileType)}`;
      const fileName = result.name || result.fileCopyUri?.split('/').pop() || result.uri?.split('/').pop() || fallbackName;

      if (!hasAllowedExtension(fileName, fileType)) {
        Alert.alert(
          'Unsupported File',
          `Please select a ${fileType} file with one of the following extensions: ${allowedExtensions[fileType].join(', ')}`
        );
        return;
      }

      const fileUri = result.fileCopyUri || result.uri;
      if (!fileUri) {
        Alert.alert('Error', 'Unable to access selected file. Please try again.');
        return;
      }

      const normalizedUri = await ensureUploadableUri(fileUri, fileType, fileName);

      const normalized: SelectedFile = {
        uri: normalizedUri,
        name: fileName,
        type: result.type || getMimeType(fileType, fileName),
        size: result.size ?? null,
      };

      setSelectedFile(normalized);
      setCurrentFileType(fileType);
      setShowTitleModal(true);
    } catch (error: any) {
      if (docModule?.isCancel?.(error)) {
        console.log('User cancelled file picker');
        return;
      }
      try {
        if (!docModule) {
          docModule = (await import('react-native-document-picker')) as typeof import('react-native-document-picker');
        }
        if (docModule.isCancel?.(error)) {
          console.log('User cancelled file picker');
          return;
        }
      } catch {
        // Ignore secondary import errors
      }
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  // Upload to knowledge API
  const uploadToKnowledgeAPI = async () => {
    if (!selectedFile || !title.trim() || !token) {
      Alert.alert('Error', 'Please provide a title and ensure you are authenticated.');
      return;
    }

    if (!PROFESSIONAL_ID) {
      Alert.alert('Error', 'Professional profile not found. Please complete professional setup first.');
      return;
    }

    if (!currentFileType) {
      Alert.alert('Error', 'Unable to determine file type. Please select the file again.');
      return;
    }

    const fileType = currentFileType as FileCategory;

    setIsUploading(true);
    try {
      const formData = new FormData();

      // Add required fields
      formData.append('PROFESSIONAL_ID', PROFESSIONAL_ID);
      formData.append('title', title.trim());

      const fallbackExtension = getFileExtension(fileType);
      const fallbackName = `upload.${fallbackExtension}`;
      const resolvedName = selectedFile.name || fallbackName;
      const uploadName = buildUploadFileName(title, resolvedName);
      const mimeType = selectedFile.type || getMimeType(fileType, uploadName);
      const uploadUri = await ensureUploadableUri(selectedFile.uri, fileType, uploadName);

      formData.append('filename', uploadName);
      formData.append('file_name', uploadName);
      formData.append('original_file_name', uploadName);
      formData.append('display_name', title.trim());

      formData.append('file', {
        uri: uploadUri,
        type: mimeType,
        name: uploadName,
      } as any);

      const uploadUrl = buildKnowledgeUrl('/professional/kb');

      console.log('=== UPLOADING TO KNOWLEDGE API ===');
      console.log('URL:', uploadUrl);
      console.log('Professional ID:', PROFESSIONAL_ID);
      console.log('Title:', title);
      console.log('File:', uploadName);
      console.log('File Type:', fileType);
      console.log('MIME Type:', mimeType);
      console.log('File Size:', selectedFile.size);
      console.log('Upload URI:', uploadUri);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        data = { detail: responseText };
      }

      console.log('Upload response status:', response.status);
      console.log('Upload response body:', data);

      if (response.ok) {
        console.log('✅ Knowledge uploaded successfully:', data);
        setUploadedFiles(prev => ({ ...prev, [fileType]: true }));
        Alert.alert(
          'Success!',
          `Your ${fileType} file "${title}" has been uploaded successfully and will help improve your avatar's responses.`,
          [{ text: 'OK', onPress: resetModal }]
        );
      } else {
        console.error('Upload failed:', response.status, data);
        const errorMsg =
          data.detail ||
          data.error ||
          data.message ||
          response.statusText ||
          'Failed to upload file. Please try again.';
        Alert.alert('Upload Failed', errorMsg);
      }
    } catch (error) {
      console.error('Error uploading to knowledge API:', error);
      Alert.alert('Network Error', 'Could not connect to server. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper functions
  const resetModal = () => {
    setShowTitleModal(false);
    setSelectedFile(null);
    setCurrentFileType('');
    setTitle('');
  };

  // Placeholder upload handler
  const handleUpload = (type: FileCategory) => {
    handleFilePicker(type);
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
            <Ionicons
              name={uploadedFiles.document ? "checkmark-circle" : "cloud-upload-outline"}
              size={40}
              color={uploadedFiles.document ? "#4CAF50" : "#BDBDBD"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.uploadLabelRow}>
          <Text style={[styles.uploadLabel, uploadedFiles.document && styles.uploadedLabel]}>
            Documents (.docx, .pdf, .txt, .xlsx, .ppt) {uploadedFiles.document && '✓'}
          </Text>
        </View>

        {/* Videos */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadIconBtn} onPress={() => handleUpload('video')}>
            <Ionicons
              name={uploadedFiles.video ? "checkmark-circle" : "cloud-upload-outline"}
              size={40}
              color={uploadedFiles.video ? "#4CAF50" : "#BDBDBD"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.uploadLabelRow}>
          <Text style={[styles.uploadLabel, uploadedFiles.video && styles.uploadedLabel]}>
            Videos (.mp4, .mov, .avi) {uploadedFiles.video && '✓'}
          </Text>
        </View>

        {/* Audio */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadIconBtn} onPress={() => handleUpload('audio')}>
            <Ionicons
              name={uploadedFiles.audio ? "checkmark-circle" : "cloud-upload-outline"}
              size={40}
              color={uploadedFiles.audio ? "#4CAF50" : "#BDBDBD"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.uploadLabelRow}>
          <Text style={[styles.uploadLabel, uploadedFiles.audio && styles.uploadedLabel]}>
            Audio (.mp3, .wav, .m4a) {uploadedFiles.audio && '✓'}
          </Text>
        </View>

        {/* Images */}
        <View style={styles.uploadBox}>
          <TouchableOpacity style={styles.uploadIconBtn} onPress={() => handleUpload('image')}>
            <Ionicons
              name={uploadedFiles.image ? "checkmark-circle" : "cloud-upload-outline"}
              size={40}
              color={uploadedFiles.image ? "#4CAF50" : "#BDBDBD"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.uploadLabelRow}>
          <Text style={[styles.uploadLabel, uploadedFiles.image && styles.uploadedLabel]}>
            Images (.jpg, .png, .heic) {uploadedFiles.image && '✓'}
          </Text>
        </View>
      </View>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('LetUsKnowYou2')}>
        <Text style={styles.skipBtnText}>Skip for Now</Text>
      </TouchableOpacity>
      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.uploadFilesBtn, Object.keys(uploadedFiles).length === 0 && styles.uploadFilesBtnDisabled]}
        onPress={() => navigation.navigate('LetUsKnowYou2')}
      >
        <Text style={styles.uploadFilesBtnText}>
          {Object.keys(uploadedFiles).length > 0 ? 'Continue' : 'Continue (No Files Uploaded)'}
        </Text>
      </TouchableOpacity>

      {/* Title Input Modal */}
      <Modal visible={showTitleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Title</Text>
            <Text style={styles.modalSubtitle}>
              Give your {currentFileType} file a descriptive title
            </Text>

            <TextInput
              style={styles.titleInput}
              placeholder={`Enter ${currentFileType} title...`}
              value={title}
              onChangeText={setTitle}
              autoFocus
              multiline={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetModal}
                disabled={isUploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadButton, (!title.trim() || isUploading) && styles.uploadButtonDisabled]}
                onPress={uploadToKnowledgeAPI}
                disabled={!title.trim() || isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.uploadButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 50 : 32,
  },
  backButton: {
    marginBottom: 13.5,
    marginTop: 21.6,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 21.6,
    fontWeight: '700',
    color: '#222',
    marginBottom: 5.4,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  subtitle: {
    fontSize: 12.6,
    color: '#666',
    marginBottom: 2.7,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  uploadBoxGroup: {
    marginTop: 16.2,
    marginBottom: 21.6,
  },
  uploadBox: {
    height: 61.2,
    borderRadius: 12.6,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 12.6,
  },
  uploadLabelRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14.4,
    marginTop: 2.7,
  },
  uploadIconBtn: {
    width: 39.6,
    height: 39.6,
    borderRadius: 21.6,
    backgroundColor: '#EDEBFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12.6,
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  uploadLabel: {
    color: '#BDBDBD',
    fontSize: 11.7,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
    textAlign: 'right',
    flex: 1,
  },
  skipBtn: {
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderRadius: 23.4,
    paddingVertical: 10.8,
    alignItems: 'center',
    marginBottom: 10.8,
  },
  skipBtnText: {
    color: '#000000c5',
    fontSize: 14.4,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
  uploadFilesBtn: {
    backgroundColor: '#8170FF',
    borderRadius: 23.4,
    paddingVertical: 10.8,
    alignItems: 'center',
    marginBottom: 7.2,
  },
  uploadFilesBtnText: {
    color: '#fff',
    fontSize: 14.4,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  uploadFilesBtnDisabled: {
    backgroundColor: '#B39DFF',
    opacity: 0.7,
  },
  uploadedLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14.4,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12.6,
    padding: 18,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 16.2,
    fontWeight: '700',
    color: '#222',
    marginBottom: 5.4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  modalSubtitle: {
    fontSize: 11.7,
    color: '#666',
    marginBottom: 14.4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 9,
    paddingHorizontal: 12.6,
    paddingVertical: 9,
    fontSize: 12.6,
    marginBottom: 14.4,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 9,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 12.6,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#8170FF',
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 37.8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 12.6,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
});

export default UploadContent;



