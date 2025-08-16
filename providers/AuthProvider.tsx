import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

export type UserProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId?: string;
  email?: string;
  birthDate?: string;
  gender?: "male" | "female" | "other";
};

export type AuthState = {
  token?: string;
  absherVerified: boolean;
  profile?: UserProfile;
  isHydrating: boolean;
  setToken: (token?: string) => Promise<void>;
  setAbsherVerified: (v: boolean) => Promise<void>;
  setProfile: (p?: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_KEY = "auth.token";
const ABSHER_KEY = "auth.absherVerified";
const PROFILE_KEY = "auth.profile";

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [token, setTokenState] = useState<string | undefined>(undefined);
  const [absherVerified, setAbsherVerifiedState] = useState<boolean>(false);
  const [profile, setProfileState] = useState<UserProfile | undefined>(undefined);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  useEffect(() => {
    hydrate();
  }, []);

  const hydrate = async () => {
    try {
      const [t, a, p] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(ABSHER_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
      ]);
      if (t) setTokenState(t);
      if (a) setAbsherVerifiedState(a === "true");
      if (p) setProfileState(JSON.parse(p));
    } catch (e) {
      console.error("[Auth] hydrate error", e);
    } finally {
      setIsHydrating(false);
    }
  };

  const setToken = async (t?: string) => {
    setTokenState(t);
    if (t) await AsyncStorage.setItem(TOKEN_KEY, t);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  };

  const setAbsherVerified = async (v: boolean) => {
    setAbsherVerifiedState(v);
    await AsyncStorage.setItem(ABSHER_KEY, v ? "true" : "false");
  };

  const setProfile = async (p?: UserProfile) => {
    setProfileState(p);
    if (p) await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    else await AsyncStorage.removeItem(PROFILE_KEY);
  };

  const signOut = async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(ABSHER_KEY),
      AsyncStorage.removeItem(PROFILE_KEY),
    ]);
    setTokenState(undefined);
    setAbsherVerifiedState(false);
    setProfileState(undefined);
  };

  return { token, absherVerified, profile, isHydrating, setToken, setAbsherVerified, setProfile, signOut };
});
