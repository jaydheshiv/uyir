import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://api.builder.io/api/v1/image/assets/TEMP/c45d4d93ad09a27f2183cc6acc6bc43c8e12b265?width=786',
        }}
        style={styles.bgImage}
        imageStyle={styles.backgroundImageOpacity}
        resizeMode="cover"
      >
        <View style={styles.contentScale}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
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
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1440' },
  bgImage: { flex: 1, width: '100%', height: '100%' },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 36 : 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
    minHeight: Dimensions.get('window').height,
  },
  contentScale: {
    transform: [{ scale: 0.9 }],
  },

  backButton: {
    marginBottom: 18,
    marginTop: 25,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(44,44,44,0.2)',
    borderRadius: 20,
    padding: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 40,
    marginTop: 20,
    gap: 6,
    justifyContent: 'center',
  },
  toggleButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: '#E6E6E6',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  toggleButtonActive: {
    backgroundColor: '#E1DBFF',
  },
  toggleButtonText: {
    fontSize: 18,
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
    marginBottom: 50,
    marginTop: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24, // Increased space between lines
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIconIncluded: {
    backgroundColor: '#fff',
  },
  featureIconExcluded: {
    backgroundColor: '#B3B3B3',
  },
  featureText: {
    fontSize: 23,
    fontWeight: 'bold',
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
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 100,
    marginTop: -50,
    fontWeight: '400',
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 18,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#B3B3B3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  radioOuterActive: {
    borderColor: '#8170FF',
  },
  radioInnerActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8170FF',
  },
  pricingTypeText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '400',
  },
  pricingAmount: {
    fontSize: 22,
    color: '#222',
    fontWeight: '700',
  },
  subscribeButton: {
    backgroundColor: '#E6E6E6',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 0,
  },
  subscribeButtonActive: {
    backgroundColor: '#8170FF',
  },
  subscribeButtonText: {
    color: '#222',
    fontSize: 20,
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