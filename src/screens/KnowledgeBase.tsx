import { useNavigation } from '@react-navigation/native';
import { Edit, FileImage, FileText, FileVideo, Menu, Mic, Search, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ImagePickerResponse, launchImageLibrary, MediaType } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { buildKnowledgeUrl } from '../config/api';
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

// Knowledge API types
interface KnowledgeEntry {
  id?: string;
  kb_id?: string;
  knowledge_id?: string;
  Knowledge_ID?: string;
  knowledgeId?: string;
  knowledge_base_id?: string;
  file_id?: string;
  fileId?: string;
  document_id?: string;
  uuid?: string;
  _id?: string;
  metadata?: {
    kb_id?: string;
    knowledge_id?: string;
    id?: string;
    title?: string;
    file_name?: string;
  };
  title: string;
  file_type: string;
  created_at: string;
  updated_at: string;
  PROFESSIONAL_ID: string;
  name?: string;
  file_name?: string;
  filename?: string;
  original_file_name?: string;
  display_name?: string;
  file_title?: string;
  document_title?: string;
}

interface SearchResult {
  title: string;
  content: string;
  score: number;
}

interface KnowledgeSearchResponse {
  PROFESSIONAL_ID: string;
  query: string;
  results: SearchResult[];
}

// Using main API_BASE_URL from config

export default function KnowledgeBase() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { professionalData } = useProfessional();

  // Get PROFESSIONAL_ID from professional profile
  const PROFESSIONAL_ID = professionalData?.professional_id;

  // State management
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Upload state
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [currentFileType, setCurrentFileType] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch knowledge entries on component mount
  useEffect(() => {
    fetchKnowledgeEntries();
  }, []);

  // Search when search term changes (with debounce)
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (search.length >= 3) {
        performSearch();
      } else {
        setShowSearchResults(false);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [search]);

  const resolveEntryId = (entry: KnowledgeEntry) => {
    const candidates = [
      entry.id,
      entry.kb_id,
      entry.knowledge_id,
      entry.Knowledge_ID,
      entry.knowledgeId,
      entry.knowledge_base_id,
      entry.file_id,
      entry.fileId,
      entry.document_id,
      entry.uuid,
      entry._id,
      entry?.metadata?.kb_id,
      entry?.metadata?.knowledge_id,
      entry?.metadata?.id,
    ];

    const directMatch = candidates.find(idValue => typeof idValue === 'string' && idValue.trim().length > 0);
    if (directMatch) {
      return directMatch;
    }

    // Fallback: scan other keys that look like unique identifiers but avoid PROFESSIONAL_ID
    for (const [key, value] of Object.entries(entry)) {
      if (key.toLowerCase() === 'professional_id') {
        continue;
      }
      if (key.toLowerCase().endsWith('_id') || key.toLowerCase().includes('uuid')) {
        if (typeof value === 'string' && value.trim().length > 0) {
          return value;
        }
      }
    }

    return '';
  };

  const fetchKnowledgeEntries = async () => {
    if (!PROFESSIONAL_ID || !token) {
      console.log('⚠️ Missing PROFESSIONAL_ID or token');
      return;
    }

    setIsLoading(true);
    try {
      const listUrl = buildKnowledgeUrl('/professional/kb');
      console.log('📡 Fetching knowledge entries...');
      console.log('Professional ID:', PROFESSIONAL_ID);
      console.log('Endpoint:', listUrl);

      // Fetch knowledge entries
      const response = await fetch(
        listUrl,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const responseText = await response.text();
        let payload: any = [];
        try {
          payload = responseText ? JSON.parse(responseText) : [];
        } catch (parseError) {
          console.warn('Failed to parse knowledge list response JSON, using empty array', parseError);
        }
        const rawEntries = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.results)
              ? payload.results
              : Array.isArray(payload?.items)
                ? payload.items
                : [];
        console.log('✅ Fetched knowledge entries:', rawEntries.length);

        const normalizedEntries = rawEntries.map((entry: KnowledgeEntry) => {
          const resolvedId = resolveEntryId(entry);
          if (!resolvedId) {
            console.warn('⚠️ Knowledge entry missing identifier', entry);
          }
          return {
            ...entry,
            id: resolvedId,
          };
        });

        setKnowledgeEntries(normalizedEntries);
      } else {
        console.error('❌ Failed to fetch knowledge entries:', response.status);
        const errorText = await response.text();
        console.error('Error:', errorText);
        if (response.status === 404) {
          setKnowledgeEntries([]);
        } else {
          Alert.alert('Error', 'Failed to load knowledge base entries');
        }
      }
    } catch (error) {
      console.error('❌ Network error fetching knowledge entries:', error);
      Alert.alert('Network Error', 'Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async () => {
    if (!search.trim() || search.length < 3) return;

    if (!PROFESSIONAL_ID) {
      console.log('⚠️ Missing PROFESSIONAL_ID for search');
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const params = new URLSearchParams({
        professional_id: PROFESSIONAL_ID,
        query: search.trim(),
      });
      const url = buildKnowledgeUrl(`/professional/kb/search?${params.toString()}`);
      console.log('Performing knowledge search:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const responseText = await response.text();
        let payload: any = [];
        try {
          payload = responseText ? JSON.parse(responseText) : [];
        } catch (parseError) {
          console.warn('Failed to parse knowledge search response JSON, using empty array', parseError);
        }
        const results = Array.isArray(payload)
          ? payload
          : Array.isArray((payload as KnowledgeSearchResponse)?.results)
            ? (payload as KnowledgeSearchResponse).results
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.items)
                ? payload.items
                : [];
        console.log('🔍 Knowledge search results:', results.length);
        setSearchResults(results);
        setShowSearchResults(true);
      } else {
        const errorBody = await response.text();
        console.error('Search failed:', response.status, errorBody);
        Alert.alert('Error', 'Search failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during search:', error);
      Alert.alert('Error', 'Network error during search');
    } finally {
      setIsSearching(false);
    }
  };

  const deleteKnowledgeEntry = async (knowledgeId: string) => {
    if (!knowledgeId) {
      Alert.alert('Error', 'Unable to determine file identifier. Please refresh and try again.');
      return;
    }
    Alert.alert(
      'Delete Knowledge Entry',
      'Are you sure you want to delete this knowledge entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting knowledge entry:', knowledgeId);
              const deleteUrl = buildKnowledgeUrl(`/professional/kb/${knowledgeId}`);
              console.log('🔗 Delete endpoint:', deleteUrl);

              const response = await fetch(
                deleteUrl,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );

              if (response.ok || response.status === 204) {
                // Remove from local state
                setKnowledgeEntries(prev => prev.filter(entry => resolveEntryId(entry) !== knowledgeId));
                Alert.alert('Success', 'Knowledge entry deleted successfully');
              } else {
                console.error('Failed to delete knowledge entry:', response.status);
                Alert.alert('Error', 'Failed to delete knowledge entry');
              }
            } catch (error) {
              console.error('Error deleting knowledge entry:', error);
              Alert.alert('Error', 'Network error while deleting knowledge entry');
            }
          },
        },
      ]
    );
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('image')) return 'image-outline';
    if (type.includes('video')) return 'videocam-outline';
    if (type.includes('audio')) return 'mic-outline';
    return 'document-outline';
  };

  // Helper functions for file upload
  const getMimeType = (fileType: string, fileName?: string): string => {
    if (fileName) {
      const ext = fileName.toLowerCase().split('.').pop();
      switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'heic':
        case 'heif':
          return 'image/jpeg';
        case 'mp4':
        case 'mov':
        case 'm4v':
          return 'video/mp4';
        case 'mp3':
        case 'm4a':
        case 'wav':
        case 'aac':
        case 'ogg':
          return 'audio/mpeg';
        case 'pdf':
          return 'application/pdf';
        case 'doc':
          return 'application/msword';
        case 'docx':
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'txt':
          return 'text/plain';
        case 'xls':
          return 'application/vnd.ms-excel';
        case 'xlsx':
          return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'ppt':
          return 'application/vnd.ms-powerpoint';
        case 'pptx':
          return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        default:
          break;
      }
    }
    switch (fileType) {
      case 'photos': return 'image/jpeg';
      case 'videos': return 'video/mp4';
      case 'audios': return 'audio/mpeg';
      case 'docs': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  };

  const getFileExtension = (fileType: string): string => {
    switch (fileType) {
      case 'photos': return 'jpg';
      case 'videos': return 'mp4';
      case 'audios': return 'mp3';
      case 'docs': return 'pdf';
      default: return 'bin';
    }
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

  const ensureUploadableUri = async (uri: string, fileType: string, fileName?: string) => {
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
            console.warn('Failed to clear cached file before upload', cleanupError);
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

  const resolveEntryTitle = (entry: KnowledgeEntry) => {
    const candidates = [
      entry.title,
      entry.display_name,
      entry.name,
      entry.file_name,
      entry.filename,
      entry.original_file_name,
      entry.metadata?.title,
      entry.metadata?.file_name,
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    if (candidates.length) {
      const uniqueCandidates = candidates.filter((value, index) => candidates.indexOf(value) === index);
      const nonMimeCandidate = uniqueCandidates.find(value => value.toLowerCase() !== entry.file_type?.toLowerCase());
      return nonMimeCandidate || uniqueCandidates[0];
    }

    const fallbackBase = entry.id || entry.file_id || 'Knowledge Entry';
    return `${fallbackBase}`;
  };

  const getMediaType = (fileType: string): MediaType => {
    switch (fileType) {
      case 'photos': return 'photo';
      case 'videos': return 'video';
      default: return 'mixed';
    }
  };

  // File picker function
  const handleFilePicker = async (fileType: string) => {
    try {
      setCurrentFileType(fileType);

      if (fileType === 'photos' || fileType === 'videos') {
        // Use image picker for photos and videos
        launchImageLibrary(
          {
            mediaType: getMediaType(fileType),
            quality: fileType === 'photos' ? 0.8 : 0.7,
            videoQuality: 'medium',
          },
          (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorCode) {
              console.log('User cancelled or error occurred');
              return;
            }

            if (response.assets && response.assets[0]) {
              const asset = response.assets[0];
              const fallbackName = `upload.${getFileExtension(fileType)}`;
              const fileName = asset.fileName || asset.uri?.split('/').pop() || fallbackName;

              setSelectedFile({
                uri: asset.uri,
                type: asset.type || getMimeType(fileType, fileName),
                name: fileName,
                size: asset.fileSize,
              });
              setShowTitleModal(true);
            }
          }
        );
      } else {
        let docModule: typeof import('react-native-document-picker') | null = null;

        try {
          docModule = (await import('react-native-document-picker')) as typeof import('react-native-document-picker');
          const { default: DocumentPicker, types } = docModule;

          const pickerTypes =
            fileType === 'audios'
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
          const fileUri = result.fileCopyUri || result.uri;

          if (!fileUri) {
            Alert.alert('Error', 'Unable to access selected file. Please try again.');
            return;
          }

          setSelectedFile({
            uri: fileUri,
            type: result.type || getMimeType(fileType, fileName),
            name: fileName,
            size: result.size,
          });
          setShowTitleModal(true);
        } catch (pickerError: any) {
          if (docModule?.isCancel?.(pickerError)) {
            console.log('User cancelled file picker');
            return;
          }
          try {
            if (!docModule) {
              docModule = (await import('react-native-document-picker')) as typeof import('react-native-document-picker');
            }
            if (docModule.isCancel?.(pickerError)) {
              console.log('User cancelled file picker');
              return;
            }
          } catch { /* ignore secondary import error */ }

          console.error('Error picking file:', pickerError);
          Alert.alert('Error', 'Failed to pick file. Please try again.');
        }
      }
    } catch (error) {
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

    setIsUploading(true);
    try {
      // Validate file exists and is not a mock
      if (!selectedFile || !selectedFile.uri || selectedFile.uri.startsWith('mock://')) {
        Alert.alert('Error', 'Invalid file selected. Please try selecting again.');
        return;
      }

      const formData = new FormData();

      // Add required fields
      formData.append('PROFESSIONAL_ID', PROFESSIONAL_ID);
      formData.append('title', title.trim());

      const fallbackName = `upload.${getFileExtension(currentFileType)}`;
      const resolvedName = selectedFile.name || fallbackName;
      const uploadFileName = buildUploadFileName(title, resolvedName);
      const uploadUri = await ensureUploadableUri(selectedFile.uri, currentFileType, uploadFileName);

      // Add file with proper type detection
      const fileObj = {
        uri: uploadUri,
        type: selectedFile.type || getMimeType(currentFileType, uploadFileName),
        name: uploadFileName,
      };

      formData.append('filename', uploadFileName);
      formData.append('file_name', uploadFileName);
      formData.append('original_file_name', uploadFileName);
      formData.append('display_name', title.trim());
      formData.append('file', fileObj as any);

      const uploadUrl = buildKnowledgeUrl('/professional/kb');
      console.log('=== UPLOADING TO KNOWLEDGE API ===');
      console.log('URL:', uploadUrl);
      console.log('Professional ID:', PROFESSIONAL_ID);
      console.log('Title:', title);
      console.log('File Object:', JSON.stringify(fileObj, null, 2));
      console.log('File URI:', uploadUri);
      console.log('File Type:', selectedFile.type);
      console.log('File Size:', selectedFile.size);
      console.log('Token available:', !!token);

      const response = await fetch(
        uploadUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        }
      );

      console.log('Response status:', response?.status);

      // Try to get response text first, then parse as JSON
      const responseText = await response?.text();
      console.log('Response text:', responseText);

      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.log('Could not parse response as JSON');
        data = { detail: responseText };
      }

      if (response && response.ok) {
        console.log('✅ Knowledge uploaded successfully:', data);

        // Reset form first
        setTitle('');
        setSelectedFile(null);
        setCurrentFileType('');
        setShowTitleModal(false);

        // Show success message
        Alert.alert(
          'Success!',
          `"${title}" has been uploaded to your knowledge base and will help improve your avatar's responses.`,
          [{ text: 'OK', onPress: () => fetchKnowledgeEntries() }]
        );
      } else {
        console.error('Upload failed:', response?.status, data);

        let errorMsg = 'Failed to upload file to knowledge base';

        if (response?.status === 500) {
          errorMsg = 'Server error (500). The Knowledge API server encountered an issue.\n\nDetails: ' + (data.detail || 'Unknown server error');
        } else if (response?.status === 422) {
          errorMsg = 'Validation error (422). The server rejected the upload.\n\nDetails: ' + (data.detail || 'Invalid file format or data');
        } else if (response?.status === 401) {
          errorMsg = 'Authentication failed (401). Please ensure you are logged in.';
        } else if (response?.status === 413) {
          errorMsg = 'File too large (413). Please select a smaller file.';
        } else {
          errorMsg = data.detail || data.error || data.message || errorMsg;
        }

        Alert.alert('Upload Failed', errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);

      let errorMsg = 'Network error during upload.';

      if (error?.message?.includes('timeout') || error?.name === 'AbortError') {
        errorMsg = 'Upload timeout. The file may be too large or your connection is slow. Please try again.';
      } else if (error?.message?.includes('Network request failed')) {
        errorMsg = 'Network connection failed. Please check:\n\n1. Internet connection\n2. Knowledge API is accessible (http://64.227.179.250:8080)\n3. File is valid and not corrupted';
      } else if (error?.message) {
        errorMsg = `Upload error: ${error.message}`;
      }

      Alert.alert('Upload Error', errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadOption = (type: string) => {
    setShowUploadModal(false);
    // Use direct file picker and upload
    handleFilePicker(type);
  };

  const handleNew = () => {
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleMenuPress = () => {
    setShowMenuOverlay(true);
  };

  const closeMenuOverlay = () => {
    setShowMenuOverlay(false);
  };

  const clearSearch = () => {
    setSearch('');
    setShowSearchResults(false);
    setSearchResults([]);
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      {/* Header: Editing.tsx style */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Knowledge Base</Text>
        <TouchableOpacity style={styles.editIcon}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContent}>
        <Text style={styles.subTitle}>Train your avatar by adding your personalized data.</Text>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={handleMenuPress}>
            <Menu color="#000000ff" size={24} style={styles.menuIconMargin} />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search in knowledge base (min 3 chars)"
            placeholderTextColor="#777"
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#6C5CE7" style={styles.searchIconMargin} />
          ) : search.length > 0 ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close" size={24} color="#222" style={styles.searchIconMargin} />
            </TouchableOpacity>
          ) : (
            <Search color="#222" size={24} style={styles.searchIconMargin} />
          )}
        </View>
        {/* Files List */}
        <View style={styles.filesTitleRow}>
          <Text style={styles.filesTitle}>
            {showSearchResults ? `Search Results (${searchResults.length})` : `Files (${knowledgeEntries.length})`}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('KnowledgeBaseFolder')}>
            <Ionicons name="folder" size={26} color="#000000ff" style={styles.filesTitleIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.filesContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C5CE7" />
              <Text style={styles.loadingText}>Loading knowledge base...</Text>
            </View>
          ) : showSearchResults ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item, idx) => `${item?.title || 'result'}-${idx}`}
              style={styles.flatListMaxHeight}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <View style={styles.searchResultRow}>
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultTitle}>{item.title}</Text>
                    <Text style={styles.searchResultText} numberOfLines={2}>
                      {item.content}
                    </Text>
                    <Text style={styles.searchResultScore}>
                      Relevance: {(item.score * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No search results found</Text>
              }
            />
          ) : (
            <FlatList
              data={knowledgeEntries}
              keyExtractor={(item, index) => {
                const entryId = resolveEntryId(item);
                return entryId
                  ? String(entryId)
                  : `${item?.PROFESSIONAL_ID || 'entry'}-${item?.title || 'item'}-${index}`;
              }}
              style={styles.flatListMaxHeight}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <View style={styles.fileRow}>
                  <TouchableOpacity onPress={() => navigation.navigate('KnowledgeBaseFolder')}>
                    <Ionicons
                      name={getFileIcon(item.file_type)}
                      size={28}
                      color="#222"
                      style={styles.fileIcon}
                    />
                  </TouchableOpacity>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileLabel}>{resolveEntryTitle(item)}</Text>
                    <Text style={styles.fileType}>{item.file_type}</Text>
                    <Text style={styles.fileDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteKnowledgeEntry(resolveEntryId(item))}
                  >
                    <Trash2 color="#E53935" size={24} />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="folder-open-outline" size={80} color="#BDBDBD" />
                  <Text style={styles.emptyStateTitle}>No Files Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Your knowledge base is empty.{'\n'}
                    Click the "+ New" button below to upload your first file and start training your avatar.
                  </Text>
                </View>
              }
            />
          )}

          {/* Overlay New Button */}
          <View style={styles.newButtonOverlayWrapper}>
            <TouchableOpacity style={styles.newButton} onPress={handleNew}>
              <Text style={styles.plusIcon}>+</Text>
              <Text style={styles.newButtonText}> New</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        {/* Upload Modal */}
        <Modal
          visible={showUploadModal}
          animationType="slide"
          transparent
          onRequestClose={closeUploadModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeUploadModal}>
            <View style={styles.uploadSheet}>
              <Text style={styles.uploadTitle}>UPLOAD</Text>
              <View style={styles.uploadDivider} />
              <View style={styles.uploadOptionsRow}>
                <TouchableOpacity style={styles.uploadOption} onPress={() => handleUploadOption('photos')}>
                  <FileImage color="#222" size={32} />
                  <Text style={styles.uploadOptionText}>Photos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadOption} onPress={() => handleUploadOption('videos')}>
                  <FileVideo color="#222" size={32} />
                  <Text style={styles.uploadOptionText}>Videos</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.uploadOptionsRow}>
                <TouchableOpacity style={styles.uploadOption} onPress={() => handleUploadOption('audios')}>
                  <Mic color="#222" size={32} />
                  <Text style={styles.uploadOptionText}>Audios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadOption} onPress={() => handleUploadOption('docs')}>
                  <FileText color="#222" size={32} />
                  <Text style={styles.uploadOptionText}>Docs</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Title Input Modal */}
        <Modal
          visible={showTitleModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowTitleModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowTitleModal(false)}>
            <View style={styles.titleModalContainer}>
              <View style={styles.titleModalContent}>
                <Text style={styles.titleModalTitle}>Add Title</Text>
                <Text style={styles.titleModalSubtitle}>
                  Enter a title for your {currentFileType.slice(0, -1)} file
                </Text>

                <TextInput
                  style={styles.titleInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter title..."
                  placeholderTextColor="#999"
                  autoFocus
                  maxLength={100}
                />

                <View style={styles.titleModalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowTitleModal(false);
                      setTitle('');
                      setSelectedFile(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      (!title.trim() || isUploading) && styles.uploadButtonDisabled
                    ]}
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

                {selectedFile && (
                  <View style={styles.filePreview}>
                    <Text style={styles.filePreviewText}>
                      📁 {buildUploadFileName(
                        title || selectedFile.name || 'upload',
                        selectedFile.name || `upload.${getFileExtension(currentFileType)}`
                      )}
                      {' '}
                      (
                      {typeof selectedFile.size === 'number'
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                        : 'Size unknown'}
                      )
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>

      {/* Menu Overlay */}
      {showMenuOverlay && (
        <Pressable style={styles.menuOverlay} onPress={closeMenuOverlay}>
          <View style={styles.menuOverlayContent}>
            <Pressable style={styles.menuOverlayLeft}>
              <View style={styles.menuSheet}>
                <Text style={styles.menuHeader}>Knowledge Base</Text>
                <View style={styles.menuHeaderDivider} />
                <TouchableOpacity style={styles.menuItemRow}>
                  <Ionicons name="time-outline" size={24} color="#222" style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>Recent</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItemRow}>
                  <Ionicons name="trash-outline" size={24} color="#222" style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>Bin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItemRow}>
                  <Ionicons name="cloud-outline" size={24} color="#222" style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>Storage</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                {/* Storage Usage Indicator Bar */}
                <View style={styles.storageBarContainer}>
                  <View style={styles.storageBarBg}>
                    <View style={styles.storageBarFill} />
                  </View>
                </View>
                <Text style={styles.menuStorageText}>1.43 GB of 15 GB used</Text>
                <TouchableOpacity style={styles.menuStorageBtn}>
                  <Text style={styles.menuStorageBtnText}>Get more storage</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
            <Pressable style={styles.menuOverlayRight} onPress={closeMenuOverlay} />
          </View>
        </Pressable>
      )}
      {/* Bottom Navigation */}
      <View style={styles.bottomNavWrapper}>
        <CustomBottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadDivider: {
    width: '100%',
    height: 2.7,
    backgroundColor: '#202020ff',
    marginBottom: 16.2,
    borderRadius: 1.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  uploadSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 21.6,
    borderTopRightRadius: 21.6,
    paddingTop: 21.6,
    paddingBottom: 1.8,
    paddingHorizontal: 21.6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  uploadTitle: {
    fontSize: 16.2,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 14.4,
    color: '#222',
  },
  uploadOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16.2,
  },
  uploadOption: {
    flex: 1,
    alignItems: 'center',
  },
  uploadOptionText: {
    marginTop: 7.2,
    fontSize: 14.4,
    color: '#222',
    fontWeight: '500',
  },
  filesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12.6,
    justifyContent: 'space-between',
  },
  filesTitleIcon: {
    marginLeft: 0,
  },
  newButtonOverlayWrapper: {
    position: 'absolute',
    right: 16,
    bottom: -180,
    zIndex: 2,
  },
  newButtonScrollWrapper: {},
  newButtonWrapper: {
    alignItems: 'center',
    marginBottom: 9,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 14.4,
    paddingVertical: 14.4,
    paddingHorizontal: 28.8,
    minWidth: 108,
    elevation: 2,
  },
  plusIcon: {
    fontSize: 25.2,
    fontWeight: '600',
    color: '#222',
  },
  newButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22.5,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 7.2,
    borderTopLeftRadius: 21.6,
    borderTopRightRadius: 21.6,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 49.5,
    paddingHorizontal: 21.6,
    paddingBottom: -18,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 0.9,
    borderRadius: 18,
    marginBottom: 72,
    marginLeft: -10,
  },
  editIcon: {
    padding: 3.6,
    borderRadius: 18,
    marginBottom: 70,
    marginLeft: 36,
  },
  headerTitle: {
    fontSize: 24.3,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: -25,
    marginTop: -10,
    fontFamily: 'Outfit',
    marginBottom: -10,
  },
  scrollContent: {
    paddingHorizontal: 16.2,
    paddingBottom: 36,
    paddingTop: 9,
  },
  subTitle: {
    fontSize: 13.5,
    color: '#222',
    marginBottom: 16.2,
    marginTop: -30,
    fontFamily: 'Outfit-Regular',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 21.6,
    backgroundColor: '#fff',
    paddingHorizontal: 14.4,
    paddingVertical: 3.6,
    marginBottom: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.4,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    paddingVertical: 7.2,
  },
  filesTitle: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
  },
  filesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7.2,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16.2,
  },
  fileIcon: {
    marginRight: 7.2,
  },
  fileLabel: {
    fontSize: 14.4,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    flex: 1,
  },
  deleteBtn: {
    padding: 3.6,
    marginLeft: 7.2,
  },
  saveButton: {
    marginTop: 200,
    width: '100%',
    height: 43.2,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 31.5,
    marginBottom: 100,
  },
  saveButtonText: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  menuOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.01)',
    zIndex: 99,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuSheet: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    elevation: 10,
    paddingTop: 54,
    paddingHorizontal: 21.6,
  },
  menuHeader: {
    fontSize: 19.8,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16.2,
    fontFamily: 'Outfit-Bold',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16.2,
  },
  menuIcon: {
    marginRight: 10.8,
  },
  menuItemText: {
    fontSize: 16.2,
    color: '#222',
    fontFamily: 'Outfit',
  },
  menuDivider: {
    width: '100%',
    height: 1.8,
    backgroundColor: '#E0E0E0',
    marginVertical: 16.2,
    borderRadius: 1.8,
  },
  menuStorageText: {
    fontSize: 12.6,
    color: '#222',
    marginBottom: 10.8,
    fontFamily: 'Outfit-Regular',
  },
  menuStorageBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#222',
    borderRadius: 10.8,
    paddingVertical: 7.2,
    paddingHorizontal: 16.2,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  menuStorageBtnText: {
    fontSize: 13.5,
    color: '#222',
    fontWeight: 'bold',
    fontFamily: 'Outfit',
  },
  storageBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 7.2,
  },
  storageBarBg: {
    width: '100%',
    height: 5.4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.7,
    overflow: 'hidden',
  },
  storageBarFill: {
    width: '9.5%', // 1.43/15 ≈ 9.5%
    height: '100%',
    backgroundColor: '#222',
    borderRadius: 2.7,
  },
  menuHeaderDivider: {
    width: '100%',
    height: 1.8,
    backgroundColor: '#E0E0E0',
    marginBottom: 16.2,
    borderRadius: 1.8,
  },
  menuIconMargin: {
    marginRight: 7.2,
  },
  searchIconMargin: {
    marginLeft: 7.2,
  },
  filesContainer: {
    position: 'relative',
    minHeight: 198,
  },
  flatListMaxHeight: {
    maxHeight: 360,
  },
  menuOverlayContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  },
  menuOverlayLeft: {
    flex: 0.8,
    height: '100%',
  },
  menuOverlayRight: {
    flex: 0.1,
    height: '100%',
  },
  // New styles for Knowledge API integration
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 36,
  },
  loadingText: {
    marginTop: 10.8,
    fontSize: 14.4,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14.4,
    color: '#666',
    fontFamily: 'Outfit-Regular',
    marginTop: 36,
    paddingHorizontal: 18,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Outfit-Bold',
  },
  emptyStateText: {
    fontSize: 14.4,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Outfit-Regular',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 7.2,
  },
  fileType: {
    fontSize: 12.6,
    color: '#666',
    fontFamily: 'Outfit-Regular',
    marginTop: 1.8,
  },
  fileDate: {
    fontSize: 10.8,
    color: '#999',
    fontFamily: 'Outfit-Regular',
    marginTop: 1.8,
  },
  searchResultRow: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10.8,
    padding: 14.4,
    marginBottom: 10.8,
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
    marginBottom: 7.2,
  },
  searchResultText: {
    fontSize: 12.6,
    color: '#444',
    fontFamily: 'Outfit-Regular',
    lineHeight: 18,
    marginBottom: 7.2,
  },
  searchResultScore: {
    fontSize: 10.8,
    color: '#6C5CE7',
    fontFamily: 'Outfit',
    fontWeight: '600',
  },
  // Title Modal styles
  titleModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  titleModalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 21.6,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  titleModalTitle: {
    fontSize: 21.6,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 7.2,
    fontFamily: 'Outfit-Bold',
  },
  titleModalSubtitle: {
    fontSize: 14.4,
    color: '#666',
    textAlign: 'center',
    marginBottom: 21.6,
    fontFamily: 'Outfit-Regular',
  },
  titleInput: {
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 10.8,
    paddingHorizontal: 14.4,
    paddingVertical: 10.8,
    fontSize: 14.4,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    marginBottom: 21.6,
  },
  titleModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10.8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10.8,
    paddingHorizontal: 18,
    borderRadius: 10.8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14.4,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'Outfit',
  },
  uploadButton: {
    flex: 1,
    paddingVertical: 10.8,
    paddingHorizontal: 18,
    borderRadius: 10.8,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  uploadButtonText: {
    fontSize: 14.4,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  filePreview: {
    marginTop: 14.4,
    padding: 10.8,
    backgroundColor: '#F8F9FA',
    borderRadius: 7.2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filePreviewText: {
    fontSize: 12.6,
    color: '#666',
    fontFamily: 'Outfit-Regular',
    textAlign: 'center',
  },
});




