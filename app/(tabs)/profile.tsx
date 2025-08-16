import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  Platform,
  Animated,
  TextInput,
  Alert,
} from "react-native";
import {
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  LogOut,
  ChevronRight,
  Save,
} from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import AnimatedPressable from "@/components/AnimatedPressable";
import { useAuth } from "@/providers/AuthProvider";

export default function ProfileScreen() {
  const { theme, language, toggleTheme, toggleLanguage } = useAppSettings();
  const currentColors = colors[theme];
  const { profile, signOut, setProfile, absherVerified, token } = useAuth();

  const [firstName, setFirstName] = useState<string>(profile?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(profile?.lastName ?? "");
  const [phone, setPhone] = useState<string>(profile?.phone ?? "");
  const [email, setEmail] = useState<string>(profile?.email ?? "");

  useEffect(() => {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setPhone(profile?.phone ?? "");
    setEmail(profile?.email ?? "");
  }, [profile]);

  type SwitchSettingItem = {
    icon: any;
    title: string;
    type: "switch";
    value: boolean;
    onToggle: () => void;
  };

  type ButtonSettingItem = {
    icon: any;
    title: string;
    type: "button";
    value?: string;
    onPress: () => void;
  };

  type SettingItem = SwitchSettingItem | ButtonSettingItem;

  const settingsGroups: { title: string; items: SettingItem[] }[] = [
    {
      title: "Preferences",
      items: [
        {
          icon: theme === "dark" ? Moon : Sun,
          title: "Dark Mode",
          type: "switch",
          value: theme === "dark",
          onToggle: toggleTheme,
        },
        {
          icon: Globe,
          title: "Language",
          type: "button",
          value: language === "ar" ? "العربية" : "English",
          onPress: toggleLanguage,
        },
      ],
    },
  ];

  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [mount]);

  const onSaveProfile = async () => {
    try {
      await setProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      Alert.alert("Saved", "Profile updated");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save profile");
    }
  };

  return (
    <Animated.ScrollView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      showsVerticalScrollIndicator={false}
      testID="profile-scroll"
    >
      <Animated.View style={[styles.profileCard, { backgroundColor: currentColors.card, opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }] }]}>
        <View style={styles.profileAvatar}>
          <User size={40} color={currentColors.primary} />
        </View>
        <Text style={[styles.profileName, { color: currentColors.text }]}>
          {firstName || lastName ? `${firstName} ${lastName}`.trim() : (language === 'ar' ? 'مستخدم' : 'User')}
        </Text>
        <Text style={[styles.profileEmail, { color: currentColors.textSecondary }]}>
          {email || profile?.phone || ''}
        </Text>
        <View style={styles.profileBadges} testID="auth-badges">
          <View style={[styles.badge, { backgroundColor: token ? `${currentColors.success}22` : `${currentColors.error}22` }]}>
            <Text style={[styles.badgeText, { color: token ? currentColors.success : currentColors.error }]}>
              {token ? 'Signed In' : 'Signed Out'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: absherVerified ? `${currentColors.success}22` : `${currentColors.warning}22` }]}>
            <Text style={[styles.badgeText, { color: absherVerified ? currentColors.success : currentColors.warning }]}>
              {absherVerified ? 'Absher Verified' : 'Absher Pending'}
            </Text>
          </View>
        </View>
      </Animated.View>

      <View style={[styles.groupCard, { backgroundColor: currentColors.card }]}>
        <View style={[styles.formRow, { borderBottomColor: currentColors.border }]}>
          <Text style={[styles.formLabel, { color: currentColors.textSecondary }]}>First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor={currentColors.textSecondary}
            style={[styles.formInput, { color: currentColors.text }]}
            testID="input-first-name"
          />
        </View>
        <View style={[styles.formRow, { borderBottomColor: currentColors.border }]}>
          <Text style={[styles.formLabel, { color: currentColors.textSecondary }]}>Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor={currentColors.textSecondary}
            style={[styles.formInput, { color: currentColors.text }]}
            testID="input-last-name"
          />
        </View>
        <View style={[styles.formRow, { borderBottomColor: currentColors.border }]}>
          <Text style={[styles.formLabel, { color: currentColors.textSecondary }]}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+966512345678"
            placeholderTextColor={currentColors.textSecondary}
            keyboardType="phone-pad"
            style={[styles.formInput, { color: currentColors.text }]}
            testID="input-phone"
          />
        </View>
        <View style={[styles.formRow, { borderBottomColor: currentColors.border }]}>
          <Text style={[styles.formLabel, { color: currentColors.textSecondary }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={currentColors.textSecondary}
            keyboardType="email-address"
            style={[styles.formInput, { color: currentColors.text }]}
            testID="input-email"
          />
        </View>
        <AnimatedPressable
          style={[styles.saveButton, { backgroundColor: currentColors.primary }]}
          onPress={onSaveProfile}
          testID="btn-save-profile"
        >
          <Save size={18} color="#fff" />
          <Text style={styles.saveText}>Save</Text>
        </AnimatedPressable>
      </View>

      {settingsGroups.map((group, groupIndex) => (
        <Animated.View key={groupIndex} style={[styles.settingsGroup, { opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [24 + groupIndex * 4, 0] }) }] }]}>
          <Text style={[styles.groupTitle, { color: currentColors.textSecondary }]}>
            {group.title}
          </Text>
          <View style={[styles.groupCard, { backgroundColor: currentColors.card }]}>
            {group.items.map((item, itemIndex) => (
              item.type === "button" ? (
                <AnimatedPressable
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < group.items.length - 1 && styles.settingItemBorder,
                    { borderBottomColor: currentColors.border },
                  ]}
                  onPress={item.onPress}
                  testID={`setting-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: `${currentColors.primary}10` },
                      ]}
                    >
                      <item.icon size={20} color={currentColors.primary} />
                    </View>
                    <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                      {item.title}
                    </Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.value ? (
                      <Text style={[styles.settingValue, { color: currentColors.textSecondary }]}>
                        {item.value}
                      </Text>
                    ) : null}
                    <ChevronRight size={20} color={currentColors.textSecondary} />
                  </View>
                </AnimatedPressable>
              ) : (
                <View
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < group.items.length - 1 && styles.settingItemBorder,
                    { borderBottomColor: currentColors.border },
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <View
                      style={[
                        styles.settingIcon,
                        { backgroundColor: `${currentColors.primary}10` },
                      ]}
                    >
                      <item.icon size={20} color={currentColors.primary} />
                    </View>
                    <Text style={[styles.settingTitle, { color: currentColors.text }]}>
                      {item.title}
                    </Text>
                  </View>
                  <View style={styles.settingRight}>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{
                        false: currentColors.border,
                        true: currentColors.primary,
                      }}
                      thumbColor="white"
                    />
                  </View>
                </View>
              )
            ))}
          </View>
        </Animated.View>
      ))}

      <AnimatedPressable
        style={[styles.logoutButton, { borderColor: "#E91E63" }]}
        onPress={async () => { await signOut(); Alert.alert("Signed out", "See you soon"); }}
        testID="logout-button"
      >
        <LogOut size={20} color="#E91E63" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </AnimatedPressable>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 200, 81, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  profileBadges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginLeft: 20,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  groupCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  formRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  formLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#00000010",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#E91E63",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});