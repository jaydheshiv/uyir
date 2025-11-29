import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { applyPreset } from '../lib/imagekit';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../store/useAppStore';

interface Professional {
    professional_id: string;
    user_id: string;
    display_name: string;
    bio?: string;
    about?: string;
    session_price_per_hour?: number;
    profile_image_url?: string;
    image_url?: string;
    avatar_url?: string;
}

export default function SubscribedProfessionals() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { token } = useAuth();
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscribedProfessionals();
    }, []);

    const fetchSubscribedProfessionals = async () => {
        setLoading(true);
        try {
            const backendUrl = 'http://dev.api.uyir.ai:8081/user/subscribed-professionals';

            const response = await fetch(backendUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('📡 Subscribed professionals response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Subscribed professionals:', data);

                const profs = Array.isArray(data) ? data : (data.professionals || data.data || []);
                setProfessionals(profs);
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to fetch subscribed professionals:', response.status, errorText);
                Alert.alert('Error', 'Failed to load subscribed professionals');
                setProfessionals([]);
            }
        } catch (err) {
            console.error('❌ Error fetching subscribed professionals:', err);
            Alert.alert('Network Error', 'Could not connect to server');
            setProfessionals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProfessionalPress = (professional: Professional) => {
        navigation.navigate('PublicMicrositePTView', {
            professional_id: professional.professional_id,
        });
    };

    const renderProfessionalCard = ({ item }: { item: Professional }) => {
        const profileImageUrl = item.profile_image_url || item.image_url || item.avatar_url;

        return (
            <TouchableOpacity
                style={styles.professionalCard}
                onPress={() => handleProfessionalPress(item)}
                activeOpacity={0.7}
            >
                {profileImageUrl ? (
                    <Image
                        source={{
                            uri: applyPreset(profileImageUrl, 'profileAvatar', 80) || undefined
                        }}
                        style={styles.professionalImage}
                        onError={(e) => {
                            console.log('Failed to load professional image', e.nativeEvent);
                        }}
                    />
                ) : (
                    <View style={[styles.professionalImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={40} color="#999" />
                    </View>
                )}
                <View style={styles.professionalInfo}>
                    <Text style={styles.professionalName}>{item.display_name}</Text>
                    <Text style={styles.professionalBio} numberOfLines={2}>
                        {item.bio || 'Mental Health Professional'}
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Session:</Text>
                        <Text style={styles.price}>${item.session_price_per_hour || 'N/A'}/hr</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#8170FF" style={styles.chevron} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Subscribed Professionals</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#8170FF" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscribed Professionals</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Content */}
            {professionals.length > 0 ? (
                <FlatList
                    data={professionals}
                    renderItem={renderProfessionalCard}
                    keyExtractor={(item) => item.professional_id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerContent}>
                    <Ionicons name="person-add-outline" size={60} color="#CCC" />
                    <Text style={styles.emptyText}>No subscribed professionals yet</Text>
                    <Text style={styles.emptySubtext}>Subscribe to professionals to see them here</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        flex: 1,
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    professionalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    professionalImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 12,
        backgroundColor: '#E7E4FF',
    },
    professionalInfo: {
        flex: 1,
    },
    professionalName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
    },
    professionalBio: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
        lineHeight: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 11,
        color: '#999',
        marginRight: 4,
    },
    price: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8170FF',
    },
    chevron: {
        marginLeft: 8,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});
