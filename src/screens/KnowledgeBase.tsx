import { useNavigation } from '@react-navigation/native';
import { Edit, FileImage, FileText, FileVideo, Menu, Mic, Search, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const files = [
  { type: 'image', label: 'Tasks : Refining of flow' },
  { type: 'video', label: 'My birthday video' },
  { type: 'text', label: 'About me' },
  { type: 'audio', label: 'Voice notes' },
  { type: 'image', label: 'Tasks : Refining of flow' },
  { type: 'video', label: 'My birthday video' },
  { type: 'text', label: 'About me' },
  { type: 'audio', label: 'Voice notes' },
  { type: 'image', label: 'Tasks : Refining of flow' },
  { type: 'video', label: 'My birthday video' },
  { type: 'text', label: 'About me' },
  { type: 'audio', label: 'Voice notes' },
];

export default function KnowledgeBase() {
  const handleUploadOption = (_type: string) => {
    // TODO: Implement upload logic for type
    setShowUploadModal(false);
    // You can add navigation or file picker logic here
  };
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
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
            placeholder="Search in knowledge base"
            placeholderTextColor="#777"
          />
          <Search color="#222" size={24} style={styles.searchIconMargin} />
        </View>
        {/* Files List */}
        <View style={styles.filesTitleRow}>
          <Text style={styles.filesTitle}>Files</Text>
          <TouchableOpacity onPress={() => navigation.navigate('KnowledgeBaseFolder')}>
            <Ionicons name="folder" size={26} color="#000000ff" style={styles.filesTitleIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.filesContainer}>
          <FlatList
            data={files}
            keyExtractor={(_, idx) => idx.toString()}
            style={styles.flatListMaxHeight}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <View style={styles.fileRow}>
                <TouchableOpacity onPress={() => navigation.navigate('KnowledgeBaseFolder')}>
                  {item.type === 'image' && <Ionicons name="image-outline" size={28} color="#222" style={styles.fileIcon} />}
                  {item.type === 'video' && <Ionicons name="videocam-outline" size={28} color="#222" style={styles.fileIcon} />}
                  {item.type === 'text' && <Ionicons name="document-outline" size={28} color="#222" style={styles.fileIcon} />}
                  {item.type === 'audio' && <Ionicons name="mic-outline" size={28} color="#222" style={styles.fileIcon} />}
                </TouchableOpacity>
                <Text style={styles.fileLabel}>{item.label}</Text>
                <TouchableOpacity style={styles.deleteBtn}>
                  <Trash2 color="#E53935" size={24} />
                </TouchableOpacity>
              </View>
            )}
          />
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
    height: 3,
    backgroundColor: '#202020ff',
    marginBottom: 18,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  uploadSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
    color: '#222',
  },
  uploadOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  uploadOption: {
    flex: 1,
    alignItems: 'center',
  },
  uploadOptionText: {
    marginTop: 8,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  filesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 2,
    justifyContent: 'flex-start',
  },
  filesTitleIcon: {
    marginLeft: 309,
  },
  newButtonOverlayWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 2,
    marginRight: 0,
    marginBottom: 8,
  },
  newButtonScrollWrapper: {},
  newButtonWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
    elevation: 2,
  },
  plusIcon: {
    fontSize: 28,
    fontWeight: '600',
    color: '#222',
  },
  newButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#222',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    marginLeft: -30,
    marginTop: 10,
    fontFamily: 'Outfit',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 24,
  },
  subTitle: {
    fontSize: 16,
    color: '#222',
    marginBottom: 16,
    paddingRight: 64,
    marginLeft: 0,
    marginTop: -45,
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
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    paddingVertical: 8,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    marginLeft: 2,
    fontFamily: 'Outfit-Bold',
  },
  filesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 2,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginLeft: 2,
  },
  fileIcon: {
    marginRight: 8,
  },
  fileLabel: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  saveButton: {
    marginTop: 28,
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
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  menuHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    fontFamily: 'Outfit-Bold',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 18,
    color: '#222',
    fontFamily: 'Outfit',
  },
  menuDivider: {
    width: '100%',
    height: 2,
    backgroundColor: '#E0E0E0',
    marginVertical: 18,
    borderRadius: 2,
  },
  menuStorageText: {
    fontSize: 14,
    color: '#222',
    marginBottom: 12,
    fontFamily: 'Outfit-Regular',
  },
  menuStorageBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#222',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  menuStorageBtnText: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    fontFamily: 'Outfit',
  },
  storageBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  storageBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  storageBarFill: {
    width: '9.5%', // 1.43/15 ≈ 9.5%
    height: '100%',
    backgroundColor: '#222',
    borderRadius: 3,
  },
  menuHeaderDivider: {
    width: '100%',
    height: 2,
    backgroundColor: '#E0E0E0',
    marginBottom: 18,
    borderRadius: 2,
  },
  menuIconMargin: {
    marginRight: 8,
  },
  searchIconMargin: {
    marginLeft: 8,
  },
  filesContainer: {
    position: 'relative',
    minHeight: 220,
  },
  flatListMaxHeight: {
    maxHeight: 400,
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
});