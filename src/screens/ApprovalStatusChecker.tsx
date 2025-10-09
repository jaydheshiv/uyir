import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

type RootStackParamList = {
  GuardianGrantedScreen: undefined;
  NotGuardianGrantedScreen: undefined;
};

interface Props {
  route: {
    params: {
      guardianEmail: string;
    };
  };
}

const ApprovalStatusChecker: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkCount, setCheckCount] = useState(0);
  const [approved, setApproved] = useState<boolean | null>(null);

  // Check approval on mount and poll every 5 seconds
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    let isMounted = true;
    const checkApproval = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://192.168.1.2:3001/approval-status?email=${encodeURIComponent(route.params.guardianEmail)}`);
        const data = await res.json();
        if (data.approved) {
          navigation.replace('GuardianGrantedScreen');
          return;
        } else {
          if (isMounted) setApproved(false);
        }
      } catch (e) {
        if (isMounted) setError('Failed to check approval status.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    checkApproval();
    intervalRef.current = setInterval(checkApproval, 5000);
    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [route.params.guardianEmail, navigation]);

  // Handler for Check Again button
  const handleCheckAgain = async () => {
    setLoading(true);
    setError('');
    try {
      setCheckCount((prev) => prev + 1);
      const res = await fetch(`http://192.168.1.2:3001/approval-status?email=${encodeURIComponent(route.params.guardianEmail)}`);
      const data = await res.json();
      if (data.approved) {
        navigation.replace('GuardianGrantedScreen');
        return;
      } else {
        setApproved(false);
        if (checkCount + 1 >= 3) {
          navigation.replace('NotGuardianGrantedScreen');
          return;
        }
      }
    } catch (e) {
      setError('Failed to check approval status.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8170FF" />
        <Text style={styles.loadingText}>Checking approval status...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  // If not approved, show Check Again button and info
  if (approved === false) {
    return (
      <View style={styles.notApprovedContainer}>
        <Text style={styles.notApprovedText}>Guardian has not approved yet.</Text>
        <PrimaryButton
          title="Check Again"
          onPress={handleCheckAgain}
          disabled={loading}
          style={styles.checkAgainButton}
        />
        <Text style={styles.attemptsText}>Attempts left: {3 - checkCount}</Text>
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  notApprovedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notApprovedText: {
    marginBottom: 24,
  },
  checkAgainButton: {
    width: 200,
    marginBottom: 12,
  },
  attemptsText: {
    color: '#898A8D',
    fontSize: 12,
  },
});

export default ApprovalStatusChecker;
