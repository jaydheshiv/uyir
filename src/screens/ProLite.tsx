import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { wp } from '../utils/responsive';

const allFeatures = [
  { name: 'Twin Creation', includedLite: true, includedPlus: true },
  { name: 'Chat Interface (Text/Voice)', includedLite: true, includedPlus: true },
  { name: 'Live Avatar Streaming', includedLite: false, includedPlus: true },
  { name: 'Session Booking (1:1)', includedLite: false, includedPlus: true },
  { name: 'Custom Microsite', includedLite: true, includedPlus: true },
  { name: 'Donation Module', includedLite: true, includedPlus: true },
  { name: 'Subscription Earnings', includedLite: true, includedPlus: true },
  { name: 'Advanced Twin Behavior Settings', includedLite: true, includedPlus: true },
];

import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  ChoosePaymentMethod: undefined;
  // add other screens if needed
};

const ProLite: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedPlan, setSelectedPlan] = useState<'lite' | 'plus'>('lite');
  const [monthlyActive, setMonthlyActive] = useState(false);

  const features =
    selectedPlan === 'lite'
      ? allFeatures.map(f => ({ name: f.name, included: f.includedLite }))
      : allFeatures.map(f => ({ name: f.name, included: f.includedPlus }));

  const price = selectedPlan === 'lite' ? '₹199/month' : '₹499/month';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ImageBackground
        source={{
          uri: 'https://api.builder.io/api/v1/image/assets/TEMP/c45d4d93ad09a27f2183cc6acc6bc43c8e12b265?width=786',
        }}
        style={styles.bgImage}
        imageStyle={styles.backgroundImageOpacity}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(7)} color="#fff" />
          </TouchableOpacity>

          {/* Plan Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedPlan === 'lite' && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedPlan('lite')}
              activeOpacity={0.8}
            >
              <View style={styles.toggleButtonContent}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedPlan === 'lite' && styles.toggleButtonTextActive,
                  ]}
                >
                  Pro Lite
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedPlan === 'plus' && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedPlan('plus')}
              activeOpacity={0.8}
            >
              <View style={styles.toggleButtonContent}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    selectedPlan === 'plus' && styles.toggleButtonTextActive,
                  ]}
                >
                  Pro Plus
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            {features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIcon,
                    feature.included ? styles.featureIconIncluded : styles.featureIconExcluded,
                  ]}
                >
                  <Ionicons
                    name={feature.included ? 'checkmark' : 'close'}
                    size={20}
                    color={feature.included ? '#222' : '#fff'}
                  />
                </View>
                <Text
                  style={[
                    styles.featureText,
                    feature.included ? styles.featureTextIncluded : styles.featureTextExcluded,
                  ]}
                >
                  {feature.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Sub Description */}
          <Text style={styles.subDescription}>
            Essential tools to build and share your twin’s journey.
          </Text>

          {/* Pricing Section */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <TouchableOpacity
                style={styles.pricingTypeRow}
                onPress={() => setMonthlyActive(prev => !prev)}
                activeOpacity={0.8}
              >
                <View style={[styles.radioOuter, monthlyActive && styles.radioOuterActive]}>
                  {monthlyActive && <View style={styles.radioInnerActive} />}
                </View>
                <Text style={styles.pricingTypeText}>Monthly</Text>
              </TouchableOpacity>
              <Text style={styles.pricingAmount}>{price}</Text>
            </View>
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              monthlyActive && styles.subscribeButtonActive,
            ]}
            activeOpacity={monthlyActive ? 0.8 : 1}
            disabled={!monthlyActive}
            onPress={() => {
              if (monthlyActive) {
                navigation.navigate('ChoosePaymentMethod');
              }
            }}
          >
            <Text style={[
              styles.subscribeButtonText,
              monthlyActive && styles.subscribeButtonTextActive,
            ]}>
              Subscribe Now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1440' },
  bgImage: { flex: 1, width: '100%', height: '100%' },
  scrollContent: {
    paddingTop: 14.4,
    paddingBottom: 28.8,
    paddingHorizontal: 18,
    flexGrow: 1,
  },

  backButton: {
    marginBottom: 14.4,
    marginTop: 7.2,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(44,44,44,0.2)',
    borderRadius: 18,
    padding: 3.6,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 25.2,
    marginTop: 12.6,
    gap: 7.2,
    justifyContent: 'center',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 25.2,
    backgroundColor: '#E6E6E6',
    alignItems: 'center',
    marginHorizontal: 3.6,
  },
  toggleButtonActive: {
    backgroundColor: '#E1DBFF',
  },
  toggleButtonText: {
    fontSize: 12.6,
    color: '#222',
    fontWeight: '700',
  },
  toggleButtonTextActive: {
    color: '#222',
    fontWeight: '700',
  },
  toggleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuresList: {
    marginBottom: 28.8,
    marginTop: 7.2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16.2,
  },
  featureIcon: {
    width: 25.2,
    height: 25.2,
    borderRadius: 12.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  featureIconIncluded: {
    backgroundColor: '#fff',
  },
  featureIconExcluded: {
    backgroundColor: '#B3B3B3',
  },
  featureText: {
    fontSize: 14.4,
    fontWeight: 'bold',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  featureTextIncluded: {
    color: '#fff',
  },
  featureTextExcluded: {
    color: '#B3B3B3',
    textDecorationLine: 'line-through',
  },
  subDescription: {
    color: '#fff',
    fontSize: 11.7,
    opacity: 0.9,
    marginBottom: 45,
    marginTop: -32,
    fontWeight: '400',
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 25.2,
    paddingVertical: 12.6,
    paddingHorizontal: 16.2,
    marginBottom: 14.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pricingTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 25.2,
    height: 25.2,
    borderRadius: 12.6,
    borderWidth: 2,
    borderColor: '#B3B3B3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    backgroundColor: '#fff',
  },
  radioOuterActive: {
    borderColor: '#8170FF',
  },
  radioInnerActive: {
    width: 14.4,
    height: 14.4,
    borderRadius: 7.2,
    backgroundColor: '#8170FF',
  },
  pricingTypeText: {
    fontSize: 14.4,
    color: '#222',
    fontWeight: '400',
  },
  pricingAmount: {
    fontSize: 16.2,
    color: '#222',
    fontWeight: '700',
  },
  subscribeButton: {
    backgroundColor: '#E6E6E6',
    borderRadius: 25.2,
    paddingVertical: 12.6,
    alignItems: 'center',
    marginBottom: 14.4,
    marginTop: 0,
  },
  subscribeButtonActive: {
    backgroundColor: '#8170FF',
  },
  subscribeButtonText: {
    color: '#222',
    fontSize: 14.4,
    fontWeight: '700',
  },
  subscribeButtonTextActive: {
    color: '#fff',
  },
  backgroundImageOpacity: {
    opacity: 0.4,
  },
});

export default ProLite;
