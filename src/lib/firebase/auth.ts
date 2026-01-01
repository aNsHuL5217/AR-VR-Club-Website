/**
 * Firebase Authentication Helpers
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'student' | 'admin';
  year?: string;
  dept?: string;
  rollNo?: string;
  mobileNumber?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Sync user to Supabase if they don't exist
    try {
      const checkResponse = await fetch(`/api/users?userId=${userCredential.user.uid}`);
      const checkData = await checkResponse.json();

      if (!checkData.success || !checkData.data) {
        console.log('User exists in Firebase but not in Supabase, syncing...');
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UserID: userCredential.user.uid,
            Name: userCredential.user.displayName || 'User',
            Email: userCredential.user.email || email,
            Role: 'student',
            Year: '',
            Dept: '',
          }),
        });

        const createData = await createResponse.json();
        if (createResponse.ok && createData.success) {
          console.log('User successfully synced to Supabase');
        }
      }
    } catch (error: any) {
      console.error('Failed to sync user with database:', error);
    }

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name: string, year: string, dept: string, rollNo: string, mobileNumber: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    await updateProfile(userCredential.user, { displayName: name });

    // Create user in database via API
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: userCredential.user.uid,
          Name: name,
          Email: email,
          Role: 'student',
          Year: year,
          Dept: dept,
          // FIX: Use 'roll_no' (snake_case) to match Supabase column exactly
          roll_no: rollNo, 
          // Keep 'MobileNumber' (PascalCase) since you confirmed it is working
          MobileNumber: mobileNumber, 
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('Failed to create user in database:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to create user in database:', error);
    }

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    try {
      const checkResponse = await fetch(`/api/users?userId=${user.uid}`);
      const checkData = await checkResponse.json();

      if (!checkResponse.ok || !checkData.success || !checkData.data) {
        console.log('Google user exists in Firebase but not in Supabase, syncing...');
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UserID: user.uid,
            Name: user.displayName || 'User',
            Email: user.email || '',
            Role: 'student',
            Year: '',
            Dept: '',
          }),
        });
      }
    } catch (error) {
      console.error('Failed to sync Google user with database:', error);
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
}

export async function getCurrentUserWithRole(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        resolve(null);
        return;
      }
      try {
        const response = await fetch(`/api/users?userId=${user.uid}`);
        const data = await response.json();
        const role = data.data?.Role || data.data?.role || 'student';
        resolve({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role as 'student' | 'admin',
          year: data.data?.Year || data.data?.year || '',
          dept: data.data?.Dept || data.data?.dept || '',
          rollNo: data.data?.RollNo || data.data?.roll_no || '',
          mobileNumber: data.data?.MobileNumber || data.data?.mobile_number || '',
        });
      } catch (error) {
        resolve({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'student',
        });
      }
    });
  });
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/users?userId=${userId}`);
    const data = await response.json();
    return data.data?.Role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user is currently signed in');
    if (!user.email) throw new Error('User email not found');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to change password');
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send password reset email');
  }
}
