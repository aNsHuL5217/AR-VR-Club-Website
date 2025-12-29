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
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Sync user to Supabase if they don't exist (in case signup failed earlier)
    try {
      const checkResponse = await fetch(`/api/users?userId=${userCredential.user.uid}`);
      const checkData = await checkResponse.json();

      if (!checkData.success || !checkData.data) {
        // User doesn't exist in Supabase, create them
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
        } else {
          console.error('Failed to sync user to Supabase:', createData.error || 'Unknown error');
          console.error('Response status:', createResponse.status);
        }
      } else {
        console.log('User already exists in Supabase');
      }
    } catch (error: any) {
      console.error('Failed to sync user with database:', error);
      console.error('Error details:', error.message, error.stack);
      // Don't throw - sign in should still succeed
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
          roll_no: rollNo,
          mobile_number: mobileNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('Failed to create user in database:', data.error || 'Unknown error');
        // Don't throw - user is created in Firebase, database sync can happen later
      }
    } catch (error) {
      console.error('Failed to create user in database:', error);
      // Don't throw - user is created in Firebase, database sync can happen later
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

    // Sync user to Supabase if they don't exist (in case signup failed earlier)
    try {
      const checkResponse = await fetch(`/api/users?userId=${user.uid}`);
      const checkData = await checkResponse.json();

      if (!checkResponse.ok || !checkData.success || !checkData.data) {
        // User doesn't exist in Supabase, create them
        console.log('Google user exists in Firebase but not in Supabase, syncing...');
        const createResponse = await fetch('/api/users', {
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

        const createData = await createResponse.json();
        if (createResponse.ok && createData.success) {
          console.log('Google user successfully synced to Supabase');
        } else {
          console.error('Failed to sync Google user to Supabase:', createData.error || 'Unknown error');
          console.error('Response status:', createResponse.status);
        }
      } else {
        console.log('Google user already exists in Supabase');
      }
    } catch (error) {
      console.error('Failed to sync Google user with database:', error);
      // Don't throw - sign in should still succeed
    }

    return user;
  } catch (error: any) {
    // Handle specific Firebase errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google sign-in. Please contact support.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is not enabled. Please contact support.');
    }
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Get current user with role from database
 */
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

        // Handle both old and new data formats
        const role = data.data?.Role || data.data?.role || 'student';
        resolve({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role as 'student' | 'admin',
        });
      } catch (error) {
        // If database lookup fails, return user without role
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

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/users?userId=${userId}`);
    const data = await response.json();
    return data.data?.Role === 'admin';
  } catch (error) {
    return false;
  }
}

/**
 * Change user password
 * Note: Requires recent authentication. If user signed in with Google, they need to set a password first.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    // Check if user has email/password provider (not just Google)
    const email = user.email;
    if (!email) {
      throw new Error('User email not found');
    }

    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak. Please use at least 6 characters.');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('For security, please sign out and sign in again before changing your password.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Password change is not allowed for this account. If you signed in with Google, you need to set a password first.');
    }
    throw new Error(error.message || 'Failed to change password');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many password reset requests. Please try again later.');
    }
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

