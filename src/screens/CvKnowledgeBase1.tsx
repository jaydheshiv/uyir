import { useNavigation, useRoute } from '@react-navigation/native';
import { Edit } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { useAuth } from '../store/useAppStore';

interface VisibilityOption {
  title: string;
  value: 'public' | 'subscribers' | 'private';
  active: boolean;
}

const visibilityOptions: VisibilityOption[] = [
  { title: 'Share it in my public view', value: 'public', active: true },
  { title: 'For subscribers only', value: 'subscribers', active: false },
  { title: 'Keep it private', value: 'private', active: false },
];

const CvKnowledgeBase1: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();

  const selectedFiles = (route.params as any)?.selectedFiles || [];
  const [visibilityCards, setVisibilityCards] = useState(visibilityOptions);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (idx: number) => {
    setVisibilityCards(visibilityCards.map((card, i) => ({
      ...card,
      active: i === idx, // Only one can be active
    })));
  };

  const handleSave = async () => {
    const selectedVisibility = visibilityCards.find(card => card.active);
    if (!selectedVisibility) {
      Alert.alert('Error', 'Please select a visibility option');
      return;
    }

    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'No files selected to update visibility');
      return;
    }

    setIsSaving(true);
    try {
      console.log('📡 Updating visibility for', selectedFiles.length, 'files');
      console.log('Visibility:', selectedVisibility.value);

      // Update visibility for each selected file
      const apiBaseUrl = 'http://dev.api.uyir.ai:8081';
      const updatePromises = selectedFiles.map(async (file: any) => {
        const response = await fetch(
          `${apiBaseUrl}/professional/kb/${file.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              visibility: selectedVisibility.value,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Failed to update ${file.title}:`, response.status, errorText);
          throw new Error(`Failed to update ${file.title}`);
        }

        console.log(`✅ Updated ${file.title} to ${selectedVisibility.value}`);
        return response.json();
      });

      await Promise.all(updatePromises);

      Alert.alert(
        'Success!',
        `Visibility updated to "${selectedVisibility.title}" for ${selectedFiles.length} file(s).`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to content visibility or knowledge base
              navigation.navigate('ContentVisibility' as never);
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error updating visibility:', error);
      Alert.alert('Error', 'Failed to update visibility. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
      <View style={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Knowledge Base</Text>
        <Text style={styles.sectionDesc}>Select which memory capsules are visible on your public profile.</Text>
        <Text style={styles.selectedCount}>
          {selectedFiles.length} file(s) selected
        </Text>
        <FlatList
          data={visibilityCards}
          keyExtractor={(_, idx) => idx.toString()}
          style={styles.flatListMaxHeight}
          showsVerticalScrollIndicator={true}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleToggle(index)} activeOpacity={0.7}>
              <View style={[styles.radioCircle, !item.active && styles.radioInactive]} />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
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
    flex: 1,
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
  scrollContent: {
    paddingHorizontal: 10.8,
    paddingTop: 0,
    paddingBottom: 7.2,
    gap: 9,
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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12.6,
    paddingVertical: 12.6,
    paddingHorizontal: 12.6,
    marginBottom: 9,
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
  saveButton: {
    backgroundColor: '#8170FF',
    borderRadius: 18,
    paddingVertical: 10.8,
    alignItems: 'center',
    marginTop: 250,
    marginBottom: 23.4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14.4,
    fontFamily: 'Outfit',
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
  flatListMaxHeight: {
    maxHeight: 324,
  },
  selectedCount: {
    fontSize: 13.5,
    color: '#8170FF',
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4.5,
    fontFamily: 'Outfit',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0B0B0',
    opacity: 0.7,
  },
});

export default CvKnowledgeBase1;

