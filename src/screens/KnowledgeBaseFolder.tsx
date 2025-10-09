import { useNavigation } from '@react-navigation/native';
import { Edit, Menu } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const folders = Array(8).fill({ title: 'About Me' });

const KnowledgeBaseFolder: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
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
        <Text style={styles.sectionDesc}>Folders created by you</Text>
        <View style={styles.searchBar}>
          <Menu color="#868686" size={24} style={styles.menuIconMargin} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search in knowledge base"
            placeholderTextColor="#868686"
          />
          <Ionicons name="search" size={24} color="#868686" style={styles.searchIconMargin} />
        </View>
        <Text style={styles.filesLabel}>Files</Text>
        <FlatList
          data={folders}
          keyExtractor={(_, idx) => idx.toString()}
          numColumns={2}
          style={styles.flatListMaxHeight}
          showsVerticalScrollIndicator={true}
          columnWrapperStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.folderCard}>
              <View style={styles.folderHeader}>
                <Ionicons name="folder" size={22} color="#868686" style={styles.folderIconMarginRight} />
                <Text style={styles.folderTitle}>{item.title}</Text>
                <Ionicons name="ellipsis-vertical" size={18} color="#18181B" style={styles.ellipsisMarginLeft} />
              </View>
              <View style={styles.folderIconWrapper}>
                <Ionicons name="folder" size={56} color="#232326" style={styles.folderIconMarginTop} />
              </View>
            </View>
          )}
        />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: -30,
    marginTop: 10,
    fontFamily: 'Outfit',
  },
  editIcon: {
    padding: 4,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  sectionDesc: {
    fontSize: 16,
    color: '#222',
    marginBottom: 0,
    marginTop: -30,
    fontFamily: 'Outfit-Regular',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    paddingVertical: 8,
  },
  filesLabel: {
    fontSize: 16,
    color: '#222',
    marginBottom: 10,
    fontFamily: 'Outfit',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  folderCard: {
    width: '45%',
    backgroundColor: '#EDEDED',
    borderRadius: 18,
    marginBottom: 12,
    padding: 8,
    alignItems: 'center',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  folderTitle: {
    fontSize: 16,
    color: '#18181B',
    fontWeight: 'bold',
    fontFamily: 'Outfit',
  },
  folderIconWrapper: {
    width: 70,
    height: 56,
    marginTop: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  menuIconMargin: {
    marginRight: 8,
  },
  searchIconMargin: {
    marginLeft: 8,
  },
  flatListMaxHeight: {
    maxHeight: 700,
  },
  folderIconMarginRight: {
    marginRight: 6,
  },
  ellipsisMarginLeft: {
    marginLeft: 'auto',
  },
  folderIconMarginTop: {
    marginTop: 0,
  },
});

export default KnowledgeBaseFolder;
