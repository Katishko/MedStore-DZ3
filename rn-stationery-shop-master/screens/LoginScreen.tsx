import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { TEST_CREDENTIALS } from '../config/auth';
import {
  GitHubDeviceAuthorization,
  pollGitHubDeviceAuthorization,
  startGitHubDeviceAuthorization,
} from '../services/githubAuth';
import { useAuthStore } from '../stores/authStore';

export default function LoginScreen() {
  usePreventScreenCapture();

  const signInWithCredentials = useAuthStore((state) => state.signInWithCredentials);
  const signInWithGitHub = useAuthStore((state) => state.signInWithGitHub);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [githubError, setGithubError] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [deviceAuthorization, setDeviceAuthorization] = useState<GitHubDeviceAuthorization | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const handleCredentialsLogin = () => {
    setLoginError('');
    if (!signInWithCredentials(username.trim(), password)) {
      setLoginError('Неверный логин или пароль.');
    }
  };

  const handleGitHubLogin = async () => {
    setGithubError('');
    setDeviceAuthorization(null);
    setGithubLoading(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const authorization = await startGitHubDeviceAuthorization();
      setDeviceAuthorization(authorization);
      const githubLogin = await pollGitHubDeviceAuthorization(authorization, controller.signal);
      signInWithGitHub(githubLogin);
    } catch (error) {
      if (!controller.signal.aborted) {
        setGithubError(error instanceof Error ? error.message : 'Не удалось войти через GitHub.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setGithubLoading(false);
        controllerRef.current = null;
      }
    }
  };

  const openVerificationPage = async () => {
    if (!deviceAuthorization) return;
    try {
      await Linking.openURL(deviceAuthorization.verificationUri);
    } catch {
      setGithubError('Не удалось открыть GitHub. Перейдите по ссылке вручную.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.brand}>MedStore</Text>
          <Text style={styles.title}>Вход в аккаунт</Text>
          <Text style={styles.subtitle}>Войдите, чтобы открыть каталог лекарств и корзину.</Text>

          <Text style={styles.label}>Логин</Text>
          <TextInput
            accessibilityLabel="Логин"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setUsername}
            onSubmitEditing={handleCredentialsLogin}
            placeholder="Введите логин"
            returnKeyType="next"
            style={styles.input}
            value={username}
          />

          <Text style={styles.label}>Пароль</Text>
          <View style={styles.passwordRow}>
            <TextInput
              accessibilityLabel="Пароль"
              autoCapitalize="none"
              onChangeText={setPassword}
              onSubmitEditing={handleCredentialsLogin}
              placeholder="Введите пароль"
              returnKeyType="done"
              secureTextEntry={!passwordVisible}
              style={styles.passwordInput}
              value={password}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
              onPress={() => setPasswordVisible((visible) => !visible)}
              style={styles.visibilityButton}
            >
              <Text style={styles.visibilityText}>{passwordVisible ? 'Скрыть' : 'Показать'}</Text>
            </Pressable>
          </View>

          {loginError ? <Text accessibilityRole="alert" style={styles.error}>{loginError}</Text> : null}
          <Pressable accessibilityRole="button" onPress={handleCredentialsLogin} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Войти</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={githubLoading}
            onPress={handleGitHubLogin}
            style={[styles.githubButton, githubLoading && styles.disabledButton]}
          >
            {githubLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.githubButtonText}>Войти через GitHub</Text>}
          </Pressable>

          {deviceAuthorization ? (
            <View style={styles.devicePanel}>
              <Text style={styles.deviceInstruction}>Введите этот код на странице GitHub:</Text>
              <Text selectable style={styles.deviceCode}>{deviceAuthorization.userCode}</Text>
              <Pressable accessibilityRole="link" onPress={openVerificationPage}>
                <Text style={styles.linkText}>{deviceAuthorization.verificationUri}</Text>
              </Pressable>
              <Text style={styles.waitingText}>Ожидаем подтверждение авторизации…</Text>
            </View>
          ) : null}

          {githubError ? <Text accessibilityRole="alert" style={styles.error}>{githubError}</Text> : null}
          <Text style={styles.demoHint}>
            Тестовый вход: {TEST_CREDENTIALS.username} / {TEST_CREDENTIALS.password}
          </Text>
          <Text style={styles.privacyNote}>Защита от снимков экрана включена на этом экране.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f5faf7' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#e1ece5' },
  brand: { color: '#16845b', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  title: { color: '#18342b', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#718078', fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 24 },
  label: { color: '#263c32', fontSize: 13, fontWeight: '700', marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#d8e5dc', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16, color: '#18342b' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d8e5dc', borderRadius: 12, marginBottom: 16 },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 13, color: '#18342b' },
  visibilityButton: { paddingHorizontal: 12, paddingVertical: 12 },
  visibilityText: { color: '#16845b', fontSize: 12, fontWeight: '700' },
  primaryButton: { backgroundColor: '#16845b', borderRadius: 12, alignItems: 'center', paddingVertical: 15 },
  primaryButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e1ece5' },
  dividerText: { color: '#87958d', fontSize: 12 },
  githubButton: { backgroundColor: '#24292f', borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 48, paddingVertical: 14 },
  githubButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabledButton: { opacity: 0.7 },
  devicePanel: { alignItems: 'center', backgroundColor: '#f5faf7', borderRadius: 12, marginTop: 16, padding: 14 },
  deviceInstruction: { color: '#52645a', fontSize: 12, textAlign: 'center' },
  deviceCode: { color: '#18342b', fontSize: 24, fontWeight: '800', letterSpacing: 4, marginVertical: 8 },
  linkText: { color: '#16845b', fontSize: 13, textDecorationLine: 'underline' },
  waitingText: { color: '#718078', fontSize: 12, marginTop: 10, textAlign: 'center' },
  error: { color: '#b42318', fontSize: 13, lineHeight: 18, marginBottom: 12, textAlign: 'center' },
  demoHint: { color: '#718078', fontSize: 12, marginTop: 20, textAlign: 'center' },
  privacyNote: { color: '#87958d', fontSize: 11, marginTop: 8, textAlign: 'center' },
});
