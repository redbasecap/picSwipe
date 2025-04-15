import { auth } from '@/firebase';
import { GoogleAuthProvider, getAuth, reauthenticateWithPopup } from 'firebase/auth';

/**
 * Represents a Google Photos media item.
 */
export interface MediaItem {
  /**
   * The ID of the media item.
   */
  id: string;
  /**
   * A URL to download the media item's bytes.
   */
  baseUrl: string;
  filename?: string;
  mimeType?: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  
  try {
    // Try to get the token from the current auth state
    const result = await user.getIdTokenResult(true);
    const provider = result.claims?.firebase?.sign_in_provider;
    
    if (provider === 'google.com') {
      // Get the OAuth access token from the current session
      const credential = await user.getIdToken();
      if (credential) {
        cachedToken = credential;
        tokenExpiry = Date.now() + 3600000; // Cache for 1 hour
        return credential;
      }
    }

    // If we don't have a valid token, we need to reauthenticate once
    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('https://www.googleapis.com/auth/photoslibrary');
    const userCred = await reauthenticateWithPopup(user, googleProvider);
    
    // Get the OAuth access token from the credential
    const accessToken = GoogleAuthProvider.credentialFromResult(userCred)?.accessToken;
    if (accessToken) {
      cachedToken = accessToken;
      tokenExpiry = Date.now() + 3600000; // Cache for 1 hour
      return accessToken;
    }

    throw new Error('Failed to get access token');
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to get access token');
  }
}

/**
 * Retrieves a list of media items from Google Photos.
 * @returns A promise that resolves to an array of MediaItem objects.
 */
export async function listMediaItems(): Promise<MediaItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  try {
    const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=100', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear cached token on authentication error
        cachedToken = null;
        tokenExpiry = null;
        throw new Error('Authentication expired, please try again');
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Photos API Error:', errorData);
      throw new Error(`Failed to fetch media items: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.mediaItems) {
      return [];
    }

    return data.mediaItems.map((item: any) => ({
      id: item.id,
      baseUrl: `${item.baseUrl}=w1024-h1024`, // Add size parameters for better loading
      filename: item.filename,
      mimeType: item.mimeType,
    }));
  } catch (error) {
    console.error('Error fetching media items:', error);
    throw error;
  }
}

/**
 * Archives a media item in Google Photos.
 * @param mediaItemId The ID of the media item to archive.
 * @returns A promise that resolves when the operation is complete.
 */
export async function archiveMediaItem(mediaItemId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  try {
    const response = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems/${mediaItemId}:batchModify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaItemIds: [mediaItemId],
        updateMask: 'archive',
        archive: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Photos API Error:', errorData);
      throw new Error('Failed to archive media item');
    }
  } catch (error) {
    console.error('Error archiving media item:', error);
    throw new Error('Failed to archive media item');
  }
}

/**
 * Favorites a media item in Google Photos.
 * @param mediaItemId The ID of the media item to favorite.
 * @returns A promise that resolves when the operation is complete.
 */
export async function favoriteMediaItem(mediaItemId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  try {
    const response = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems/${mediaItemId}:batchModify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaItemIds: [mediaItemId],
        updateMask: 'favorite',
        favorite: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Photos API Error:', errorData);
      throw new Error('Failed to favorite media item');
    }
  } catch (error) {
    console.error('Error favoriting media item:', error);
    throw new Error('Failed to favorite media item');
  }
}

/**
 * Deletes a media item in Google Photos.
 * @param mediaItemId The ID of the media item to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export async function deleteMediaItem(mediaItemId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  try {
    const response = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems/${mediaItemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Photos API Error:', errorData);
      throw new Error('Failed to delete media item');
    }
  } catch (error) {
    console.error('Error deleting media item:', error);
    throw new Error('Failed to delete media item');
  }
}
