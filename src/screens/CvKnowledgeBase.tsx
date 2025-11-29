import { useNavigation } from '@react-navigation/native';
import { Edit } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { buildKnowledgeUrl } from '../config/api';
import { useAuth, useProfessional } from '../store/useAppStore';
import { NormalizedKnowledgeEntry, normalizeKnowledgeEntry } from '../utils/knowledgeNormalization';

type KnowledgeBaseFile = NormalizedKnowledgeEntry & {
  active: boolean;
};

const CvKnowledgeBase: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { professionalData } = useProfessional();

  const [search, setSearch] = useState('');
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeBaseFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Fetch knowledge base files for professional
  useEffect(() => {
    if (professionalData?.professional_id) {
      fetchKnowledgeFiles();
    }
  }, [professionalData]);

  const fetchKnowledgeFiles = async () => {
    if (!professionalData?.professional_id || !token) {
      console.log('⚠️ Missing professional_id or token');
      return;
    }

    try {
      setIsLoading(true);
      const listUrl = buildKnowledgeUrl(`/professionals/${encodeURIComponent(professionalData.professional_id)}/kb`);
      console.log('📡 Fetching professional knowledge files...');
      console.log('Professional ID:', professionalData.professional_id);
      console.log('Endpoint:', listUrl);

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
          console.warn('⚠️ Failed to parse knowledge list response JSON, using empty array', parseError);
        }

        const filesArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.results)
                ? payload.results
                : [];
        console.log('✅ Fetched knowledge files:', filesArray.length);

        // Transform API data to include active state
        const filesWithState = filesArray.map((file: any) => {
          const normalized = normalizeKnowledgeEntry(file);

          if (!normalized.id) {
            console.warn('⚠️ Knowledge entry missing identifier', file);
          }

          return {
            ...normalized,
            updated_at: normalized.updated_at ?? file?.updated_at,
            professional_id: normalized.professional_id ?? file?.professional_id,
            active: normalized.visibility !== 'private',
          } as KnowledgeBaseFile;
        });

        setKnowledgeFiles(filesWithState);
        setSelectedFiles(
          filesWithState
            .filter((file: KnowledgeBaseFile) => file.active && typeof file.id === 'string')
            .map((file: KnowledgeBaseFile) => file.id)
        );
      } else {
        console.error('❌ Failed to fetch knowledge files:', response.status);
        const errorText = await response.text();
        console.error('Error:', errorText);
        Alert.alert('Error', 'Failed to load knowledge base files');
      }
    } catch (error) {
      console.error('❌ Network error fetching knowledge files:', error);
      Alert.alert('Network Error', 'Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (idx: number) => {
    setKnowledgeFiles(prev => prev.map((file, i) => {
      if (i === idx) {
        const newActive = !file.active;
        setSelectedFiles(current => {
          if (!file.id) {
            return current;
          }
          if (newActive) {
            return current.includes(file.id) ? current : [...current, file.id];
          }
          return current.filter(id => id !== file.id);
        });
        return { ...file, active: newActive };
      }
      return file;
    }));
  };

  const handleNext = () => {
    const activeFiles = knowledgeFiles.filter(f => f.active);
    if (activeFiles.length === 0) {
      Alert.alert('No Selection', 'Please select at least one knowledge base file to set visibility.');
      return;
    }
    // Navigate with selected files
    navigation.navigate('CvKnowledgeBase1', { selectedFiles: activeFiles });
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredFiles = normalizedSearch
    ? knowledgeFiles.filter(file => (file.title || '').toLowerCase().includes(normalizedSearch))
    : knowledgeFiles;

  const hasSelection = knowledgeFiles.some(file => file.active);
  const nextDisabled = !hasSelection || isLoading;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Visibility</Text>
        <TouchableOpacity style={styles.editIcon}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <View style={styles.mainContent}>
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Knowledge Base</Text>
          <Text style={styles.sectionDesc}>Select which data are visible on your public profile.</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search"
              placeholderTextColor="#777"
            />
            <Ionicons name="search" size={24} color="#777" style={styles.searchIconMargin} />
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8170FF" />
              <Text style={styles.loadingText}>Loading knowledge base files...</Text>
            </View>
          ) : (
            <FlatList<KnowledgeBaseFile>
              data={filteredFiles}
              keyExtractor={(item, index) => (item.id && item.id.length > 0 ? item.id : `kb-${index}`)}
              style={styles.flatList}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={true}
              renderItem={({ item, index }) => (
                <TouchableOpacity style={styles.card} onPress={() => handleToggle(index)} activeOpacity={0.7}>
                  <View style={[styles.radioCircle, !item.active && styles.radioInactive]} />
                  <View style={styles.flex1}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.created_at).toLocaleDateString()} • {item.file_type}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-open-outline" size={64} color="#BDBDBD" />
                  <Text style={styles.emptyText}>No knowledge base files found</Text>
                  <Text style={styles.emptySubtext}>Upload files in Knowledge Base to manage visibility</Text>
                </View>
              }
            />
          )}
        </View>
        <View style={styles.nextButtonWrapper}>
          <TouchableOpacity
            style={[styles.nextButton, nextDisabled && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={nextDisabled}
          >
            <Text style={[styles.nextButtonText, nextDisabled && styles.nextButtonTextDisabled]}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottomNavWrapper}>
        <CustomBottomNav />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 49.5,
    paddingHorizontal: 18,
    paddingBottom: 0,
    marginLeft: -60,
    marginBottom: -24,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 0.9,
    borderRadius: 16.2,
    marginBottom: 57.6,
    marginLeft: 50.4,
  },
  headerTitle: {
    fontSize: 21.6,
    fontWeight: 'bold',
    color: '#222',
    paddingBottom: 42,
    textAlign: 'left',
    marginLeft: -24,
    marginTop: 7.2,
    fontFamily: 'Outfit',
  },
  editIcon: {
    padding: 0.9,
    borderRadius: 16.2,
    marginBottom: 57.6,
    marginLeft: 50.4,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 10.8,
    paddingTop: 0,
  },
  listSection: {
    flex: 1,
    paddingBottom: 18,
  },
  sectionTitle: {
    fontSize: 17.1,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 0,
    fontFamily: 'Outfit',
    marginLeft: 4.5,
  },
  sectionDesc: {
    fontSize: 12.6,
    color: '#222',
    marginBottom: 12.6,
    fontFamily: 'Outfit-Regular',
    marginLeft: 4.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 10.8,
    paddingVertical: 2.7,
    marginBottom: 7.2,
    marginTop: -3,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    paddingVertical: 5.4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12.6,
    paddingVertical: 12.6,
    paddingHorizontal: 12.6,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    elevation: 0,
  },
  radioCircle: {
    width: 19.8,
    height: 19.8,
    borderRadius: 9.9,
    borderWidth: 4,
    borderColor: '#8170FF',
    marginRight: 10.8,
    backgroundColor: '#F7F7F7',
  },
  radioInactive: {
    borderColor: '#7e7e80ff',
    backgroundColor: '#F7F7FF',
  },
  cardTitle: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit',
  },
  cardDate: {
    fontSize: 12.6,
    color: '#868686',
    fontFamily: 'Outfit-Regular',
    marginTop: 1.8,
  },
  nextButtonWrapper: {
    paddingHorizontal: 10.8,
    paddingTop: 12,
    paddingBottom: 200,
  },
  nextButton: {
    backgroundColor: '#8170FF',
    borderRadius: 18,
    paddingVertical: 10.8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#C9C3F7',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14.4,
    fontFamily: 'Outfit',
  },
  nextButtonTextDisabled: {
    color: '#F4F3FF',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 13.5,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 14.4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  searchIconMargin: {
    marginLeft: 5.4,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14.4,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
  },
});

export default CvKnowledgeBase;

