import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { userProgressService, AuthUser } from '../services/userProgress';
import { gameModeService } from '../services/gameMode';

interface SettingsScreenProps {
  onNavigateBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigateBack,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = () => {
    const user = userProgressService.getCurrentUser();
    setCurrentUser(user);
  };

  const handleLinkAccount = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      if (isCreatingAccount) {
        await userProgressService.createAccountWithEmail(email, password);
        Alert.alert('Success', 'Account created and linked successfully!');
      } else {
        await userProgressService.linkWithEmail(email, password);
        Alert.alert('Success', 'Account linked successfully!');
      }

      setShowLinkForm(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      loadCurrentUser();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to link account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await userProgressService.signOut();
            loadCurrentUser();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const renderAccountSection = () => {
    if (currentUser) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountInfo}>
            <Text style={styles.accountText}>
              {currentUser.isAnonymous ? 'Anonymous User' : 'Linked Account'}
            </Text>
            {currentUser.email && (
              <Text style={styles.emailText}>{currentUser.email}</Text>
            )}
            {currentUser.displayName && (
              <Text style={styles.nameText}>{currentUser.displayName}</Text>
            )}
          </View>

          {currentUser.isAnonymous ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowLinkForm(true)}>
              <Text style={styles.buttonText}>Link Account</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return null;
  };

  const renderLinkForm = () => {
    if (!showLinkForm) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Link Account</Text>
        <Text style={styles.formDescription}>
          Link your anonymous account to an email to save your progress across
          devices.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.formButtons}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              setShowLinkForm(false);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLinkAccount}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading
                ? 'Linking...'
                : isCreatingAccount
                ? 'Create Account'
                : 'Link Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.switchModeButton}
          onPress={() => setIsCreatingAccount(!isCreatingAccount)}>
          <Text style={styles.switchModeText}>
            {isCreatingAccount
              ? 'Already have an account? Sign in'
              : 'Need an account? Create one'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGameModeSection = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Mode</Text>
        <View style={styles.modeInfo}>
          <Text style={styles.modeText}>
            Current Mode:{' '}
            {gameModeService.isDevMode() ? 'Development' : 'Production'}
          </Text>
          <Text style={styles.modeDescription}>
            {gameModeService.isDevMode()
              ? 'All levels are unlocked for testing'
              : 'Levels unlock progressively as you complete them'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#9370DB']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderAccountSection()}
        {renderLinkForm()}
        {renderGameModeSection()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  accountInfo: {
    marginBottom: 15,
  },
  accountText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  nameText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#FF6B6B',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  formDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
    lineHeight: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  switchModeButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
  modeInfo: {
    marginBottom: 15,
  },
  modeText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  modeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});
