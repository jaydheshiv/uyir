import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth, useProfessional } from '../store/useAppStore';

// Tag interface
interface Tag {
  tag_id: string;
  name: string;  // Backend uses 'name' not 'tag_name'
  slug: string;
  tag_type: 'domain' | 'sub_specialization';
  parent_id: string | null;
  is_active: boolean;
}

const LetUsKnowYou: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [about, setAbout] = useState('');
  const [sessionPrice, setSessionPrice] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [domainsExpanded, setDomainsExpanded] = useState(false);
  const [specializationsExpanded, setSpecializationsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [domainTags, setDomainTags] = useState<Tag[]>([]);
  const [specializationTags, setSpecializationTags] = useState<Tag[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ✅ Use Zustand for auth (professional tracking happens in TermsAndConditions)
  const { token } = useAuth();
  const { setProfessionalData, markProfessionalCreated } = useProfessional();

  // ✅ Fetch tags from backend on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoadingTags(true);
      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/tags';

      console.log('=== FETCHING TAGS ===');
      console.log('URL:', backendUrl);

      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Tags response:', data);
      console.log('Tags response type:', typeof data);
      console.log('Is array?', Array.isArray(data));

      if (response.ok) {
        // ✅ Backend returns: { domain_tags: [...], sub_specialization_tags: [...] }
        let domains: Tag[] = [];
        let specializations: Tag[] = [];

        if (data.domain_tags && Array.isArray(data.domain_tags)) {
          domains = data.domain_tags;
          console.log('✅ Found domain_tags:', domains.length);
        } else {
          console.warn('⚠️ No domain_tags found in response');
        }

        if (data.sub_specialization_tags && Array.isArray(data.sub_specialization_tags)) {
          specializations = data.sub_specialization_tags;
          console.log('✅ Found sub_specialization_tags:', specializations.length);
        } else {
          console.warn('⚠️ No sub_specialization_tags found in response');
        }

        console.log('Domain tags:', domains.length);
        console.log('Specialization tags:', specializations.length);

        setDomainTags(domains);
        setSpecializationTags(specializations);
      } else {
        console.error('Failed to fetch tags:', data);
        Alert.alert('Error', 'Failed to load tags. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      Alert.alert(
        'Network Error',
        'Could not load tags. Please ensure:\n\n' +
        '1. Backend server is running\n' +
        '2. You have internet connection\n\n' +
        'Error: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsLoadingTags(false);
    }
  };

  const toggleDomain = (id: string) => {
    setSelectedDomains(prev => {
      const newDomains = prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id];

      // ✅ Clear specializations that don't belong to the new domain selection
      setSelectedSpecializations(currentSpecs =>
        currentSpecs.filter(specId => {
          const spec = specializationTags.find(s => s.tag_id === specId);
          return spec && spec.parent_id && newDomains.includes(spec.parent_id);
        })
      );

      return newDomains;
    });
  };

  const toggleSpecialization = (id: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // ✅ Filter specializations to only show those belonging to selected domains
  const getFilteredSpecializations = (): Tag[] => {
    if (selectedDomains.length === 0) {
      return []; // No domains selected, show no specializations
    }
    return specializationTags.filter(spec =>
      spec.parent_id && selectedDomains.includes(spec.parent_id)
    );
  };

  const getSelectedDomainsText = () => {
    if (selectedDomains.length === 0) return 'Select domains';
    const labels = selectedDomains.map(id =>
      domainTags.find(d => d.tag_id === id)?.name
    ).filter(Boolean);
    return labels.join(', ');
  };

  const getSelectedSpecializationsText = () => {
    if (selectedSpecializations.length === 0) return 'Select specializations';
    const labels = selectedSpecializations.map(id =>
      specializationTags.find(s => s.tag_id === id)?.name
    ).filter(Boolean);
    return labels.join(', ');
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Please enter a display name');
      return;
    }

    if (selectedDomains.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one domain');
      return;
    }

    if (selectedSpecializations.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one specialization');
      return;
    }

    if (displayName.trim().length > 100) {
      Alert.alert('Validation Error', 'Display name must be 100 characters or less');
      return;
    }

    if (bio.trim().length > 255) {
      Alert.alert('Validation Error', 'Bio must be 255 characters or less');
      return;
    }

    if (about.trim().length > 2000) {
      Alert.alert('Validation Error', 'About section must be 2000 characters or less');
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Get token from Zustand
      if (!token) {
        Alert.alert('Authentication Error', 'Please login again');
        navigation.navigate('LoginFlow');
        return;
      }

      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/create';

      // Build request body
      const requestData: any = {
        display_name: displayName.trim(),
        domain_tag_ids: selectedDomains,  // ✅ Send selected domain IDs
        sub_specialization_tag_ids: selectedSpecializations,  // ✅ Send selected specialization IDs
      };

      // Add optional fields only if they have values
      if (bio.trim()) {
        requestData.bio = bio.trim();
      }

      if (about.trim()) {
        requestData.about = about.trim();
      }

      if (sessionPrice.trim()) {
        const priceNum = parseFloat(sessionPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
          Alert.alert('Validation Error', 'Session price must be a positive number');
          setIsLoading(false);
          return;
        }
        requestData.session_price_per_hour = priceNum;
      }

      console.log('=== PROFESSIONAL CREATE REQUEST ===');
      console.log('URL:', backendUrl);
      console.log('Request data:', requestData);
      console.log('Selected domain IDs:', selectedDomains);
      console.log('Selected specialization IDs:', selectedSpecializations);
      console.log('==================================');

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response data (parsed):', data);
      } catch (e) {
        console.error('Could not parse response as JSON:', e);
        data = { detail: responseText };
      }

      if (response.ok) {
        console.log('Professional profile created successfully:', data);

        // ✅ Extract and store professional + persona data safely
        try {
          const profPayload = {
            professional_id: data.professional_id || data.id || '',
            user_id: data.user_id || '',
            display_name: data.display_name || displayName.trim(),
            bio: data.bio,
            about: data.about,
            session_price_per_hour: data.session_price_per_hour,
            subscriber_count: data.subscriber_count ?? 0,
            follower_count: data.follower_count ?? 0,
            upcoming_session_count: data.upcoming_session_count ?? 0,
            persona_id: data.persona_id, // ✅ store persona_id if present
          };
          console.log('✅ Storing professionalData with persona_id:', profPayload.persona_id);
          setProfessionalData(profPayload as any);
          markProfessionalCreated(); // ✅ Flag professional profile created
        } catch (e) {
          console.warn('⚠️ Could not map professional data for storage:', e);
        }

        // ✅ Navigate to CreateAvatar3 to upload profile image
        console.log('✅ Redirecting to CreateAvatar3 to upload profile image...');
        navigation.navigate('CreateAvatar3' as never);
      } else if (response.status === 409) {
        // ✅ Profile already exists - fetch current profile to obtain persona_id
        console.log('✅ Professional profile already exists, fetching existing profile...');
        try {
          const existingResp = await fetch('http://dev.api.uyir.ai:8081/professional/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
          const existingData = await existingResp.json();
          console.log('Existing professional profile:', existingData);
          if (existingResp.ok) {
            const profPayload = {
              professional_id: existingData.professional_id || existingData.id || '',
              user_id: existingData.user_id || '',
              display_name: existingData.display_name || displayName.trim(),
              bio: existingData.bio,
              about: existingData.about,
              session_price_per_hour: existingData.session_price_per_hour,
              subscriber_count: existingData.subscriber_count ?? 0,
              follower_count: existingData.follower_count ?? 0,
              upcoming_session_count: existingData.upcoming_session_count ?? 0,
              persona_id: existingData.persona_id, // ✅ capture persona_id
            };
            console.log('✅ Storing existing professionalData with persona_id:', profPayload.persona_id);
            setProfessionalData(profPayload as any);
            markProfessionalCreated(); // ✅ Flag professional profile exists
          } else {
            console.warn('⚠️ Failed fetching existing professional profile for persona_id');
          }
        } catch (e) {
          console.warn('⚠️ Error fetching existing professional profile:', e);
        }
        navigation.navigate('CreateAvatar3' as never);
      } else {
        // Show detailed error from backend
        console.error('=== API ERROR RESPONSE ===');
        console.error('Status:', response.status);
        console.error('Full response:', JSON.stringify(data, null, 2));
        console.error('========================');

        let errorMessage = 'Failed to create professional profile';

        // Handle FastAPI validation errors (422)
        if (response.status === 422 && data.detail) {
          if (Array.isArray(data.detail)) {
            const errors = data.detail.map((err: any) => {
              const field = err.loc ? err.loc.join('.') : 'unknown';
              return `• ${field}: ${err.msg}`;
            }).join('\n');
            errorMessage = `Validation Error:\n\n${errors}`;
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          }
        } else if (response.status === 500) {
          // Handle internal server error
          errorMessage = 'Server Error: Please contact support.\n\nThe backend database schema may need to be updated.';
        } else {
          errorMessage = data.detail || data.message || errorMessage;
        }

        Alert.alert(`Error (${response.status})`, errorMessage);
      }
    } catch (error) {
      console.error('Professional creation error:', error);
      Alert.alert(
        'Network Error',
        'Could not connect to the server. Please ensure:\n\n' +
        '1. You have internet connection\n' +
        '2. Backend API is accessible (dev.api.uyir.ai)\n\n' +
        'Error: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Let us know you</Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Loading Tags */}
        {isLoadingTags ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8170FF" />
            <Text style={styles.loadingText}>Loading tags...</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              placeholderTextColor="#BDBDBD"
              maxLength={100}
            />

            {/* Domains Selection */}
            <Text style={styles.label}>Domains *</Text>
            <Text style={styles.helperText}>Select at least one domain you specialize in</Text>

            {/* Dropdown Toggle */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownToggle}
                onPress={() => setDomainsExpanded(!domainsExpanded)}
              >
                <Text style={[
                  styles.dropdownToggleText,
                  selectedDomains.length === 0 && styles.dropdownPlaceholder
                ]}>
                  {getSelectedDomainsText()}
                </Text>
                <Ionicons
                  name={domainsExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8170FF"
                />
              </TouchableOpacity>

              {/* Expandable Options */}
              {domainsExpanded && (
                <View style={styles.dropdownOptions}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {domainTags.length > 0 ? (
                      domainTags.map((domain) => (
                        <TouchableOpacity
                          key={domain.tag_id}
                          style={styles.checkboxItem}
                          onPress={() => toggleDomain(domain.tag_id)}
                        >
                          <View style={[
                            styles.checkbox,
                            selectedDomains.includes(domain.tag_id) && styles.checkboxSelected
                          ]}>
                            {selectedDomains.includes(domain.tag_id) && (
                              <Ionicons name="checkmark" size={16} color="#fff" />
                            )}
                          </View>
                          <Text style={styles.checkboxLabel}>{domain.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noTagsText}>No domains available</Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Specializations Selection */}
            <Text style={styles.label}>Specializations *</Text>
            <Text style={styles.helperText}>
              {selectedDomains.length === 0
                ? 'Select domains first to see available specializations'
                : 'Select at least one sub-specialization from your chosen domains'}
            </Text>

            {/* Dropdown Toggle */}
            <View style={[styles.dropdownContainer, styles.dropdownContainerSecondary]}>
              <TouchableOpacity
                style={[styles.dropdownToggle, selectedDomains.length === 0 && { opacity: 0.5 }]}
                onPress={() => selectedDomains.length > 0 && setSpecializationsExpanded(!specializationsExpanded)}
                disabled={selectedDomains.length === 0}
              >
                <Text style={[
                  styles.dropdownToggleText,
                  selectedSpecializations.length === 0 && styles.dropdownPlaceholder
                ]}>
                  {getSelectedSpecializationsText()}
                </Text>
                <Ionicons
                  name={specializationsExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#8170FF"
                />
              </TouchableOpacity>

              {/* Expandable Options */}
              {specializationsExpanded && (
                <View style={styles.dropdownOptions}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {getFilteredSpecializations().length > 0 ? (
                      getFilteredSpecializations().map((spec) => (
                        <TouchableOpacity
                          key={spec.tag_id}
                          style={styles.checkboxItem}
                          onPress={() => toggleSpecialization(spec.tag_id)}
                        >
                          <View style={[
                            styles.checkbox,
                            selectedSpecializations.includes(spec.tag_id) && styles.checkboxSelected
                          ]}>
                            {selectedSpecializations.includes(spec.tag_id) && (
                              <Ionicons name="checkmark" size={16} color="#fff" />
                            )}
                          </View>
                          <Text style={styles.checkboxLabel}>{spec.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noTagsText}>
                        {selectedDomains.length === 0
                          ? 'Select domains first'
                          : 'No specializations available for selected domains'}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={styles.label}>Bio (optional)</Text>
            <View style={styles.inputWithCount}>
              <TextInput
                style={[styles.input, styles.inputWithCountText]}
                value={bio}
                onChangeText={setBio}
                placeholder="A short bio about yourself"
                placeholderTextColor="#BDBDBD"
                maxLength={255}
              />
              <Text style={styles.countTextInside}>{bio.length}/255</Text>
            </View>

            <Text style={styles.label}>About (optional)</Text>
            <View style={styles.inputWithCount}>
              <TextInput
                style={[styles.input, styles.aboutMeInput, styles.inputWithCountText]}
                value={about}
                onChangeText={setAbout}
                placeholder="Tell us more about yourself..."
                placeholderTextColor="#BDBDBD"
                multiline
                maxLength={2000}
              />
              <Text style={styles.countTextInside}>{about.length}/2000</Text>
            </View>

            <Text style={styles.label}>Session Price ($/hour, optional)</Text>
            <TextInput
              style={styles.input}
              value={sessionPrice}
              onChangeText={setSessionPrice}
              placeholder="e.g., 50.00"
              placeholderTextColor="#BDBDBD"
              keyboardType="decimal-pad"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit</Text>
              )}
            </TouchableOpacity>

            {/* Sync Data Button */}
            <TouchableOpacity>
              <Text style={styles.syncText}>Sync my data</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 21.6,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    marginBottom: 9,
    marginTop: 13.5,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 21.6,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10.8,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 18,
  },
  form: {
    marginBottom: 9,
  },
  label: {
    fontSize: 13.5,
    color: '#222',
    marginBottom: 5.4,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
  helperText: {
    fontSize: 10.8,
    color: '#666',
    marginBottom: 7.2,
    fontStyle: 'italic',
  },
  dropdownContainer: {
    position: 'relative',
    marginBottom: 9,
    zIndex: 1000,
  },
  dropdownContainerSecondary: {
    zIndex: 999,
  },
  dropdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 43.2,
    backgroundColor: '#fff',
    borderRadius: 12.6,
    borderWidth: 2,
    borderColor: '#8170FF',
    paddingHorizontal: 14.4,
  },
  dropdownToggleText: {
    fontSize: 13.5,
    color: '#222',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  dropdownPlaceholder: {
    color: '#BDBDBD',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#F9F9F9',
    borderRadius: 12.6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 162,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.8 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownScroll: {
    maxHeight: 162,
    paddingHorizontal: 10.8,
    paddingVertical: 5.4,
  },
  checkboxContainer: {
    marginBottom: 10.8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7.2,
    paddingVertical: 1.8,
  },
  checkbox: {
    width: 19.8,
    height: 19.8,
    borderRadius: 5.4,
    borderWidth: 2,
    borderColor: '#8170FF',
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#8170FF',
  },
  checkboxLabel: {
    fontSize: 13.5,
    color: '#222',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  input: {
    height: 43.2,
    backgroundColor: '#fff',
    borderRadius: 12.6,
    marginBottom: 10.8,
    borderWidth: 2,
    borderColor: '#8170FF',
    paddingHorizontal: 14.4,
    fontSize: 13.5,
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  inputWithCount: {
    position: 'relative',
    marginBottom: 10.8,
  },
  countText: {
    display: 'none',
  },
  countTextInside: {
    position: 'absolute',
    right: 9,
    bottom: -10,
    color: '#BDBDBD',
    fontSize: 10.8,
    backgroundColor: 'transparent',
    paddingHorizontal: 1.8,
  },
  inputWithCountText: {
    paddingRight: 54,
  },
  aboutMeInput: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10.8,
  },
  submitBtn: {
    backgroundColor: '#8170FF',
    borderRadius: 28.8,
    paddingVertical: 12.6,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10.8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15.3,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  syncText: {
    color: '#8170FF',
    fontSize: 15.3,
    textAlign: 'center',
    marginTop: 0.9,
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 45,
  },
  loadingText: {
    marginTop: 14.4,
    fontSize: 14.4,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  noTagsText: {
    fontSize: 12.6,
    color: '#999',
    textAlign: 'center',
    padding: 18,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
});

export default LetUsKnowYou;
