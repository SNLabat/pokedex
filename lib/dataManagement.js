// lib/dataManagement.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

// Your Firebase configuration
// Note: In a production app, these values should be in environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (prevent multiple initializations)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase initialization error', error.stack);
  }
}

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Authentication functions
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      createdAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      collections: []
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Pokémon Collection Management Functions
export const savePokemonCollection = async (userId, collectionData) => {
  try {
    const collectionRef = doc(db, 'collections', userId);
    const collectionDoc = await getDoc(collectionRef);
    
    if (collectionDoc.exists()) {
      // Update existing collection
      await updateDoc(collectionRef, {
        data: collectionData,
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Create new collection
      await setDoc(collectionRef, {
        userId,
        data: collectionData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Update user document with last sync time
    await updateDoc(doc(db, 'users', userId), {
      lastSync: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving collection:', error);
    return { success: false, error: error.message };
  }
};

export const getPokemonCollection = async (userId) => {
  try {
    const collectionRef = doc(db, 'collections', userId);
    const collectionDoc = await getDoc(collectionRef);
    
    if (collectionDoc.exists()) {
      return { 
        success: true, 
        data: collectionDoc.data().data,
        lastUpdated: collectionDoc.data().lastUpdated
      };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error fetching collection:', error);
    return { success: false, error: error.message };
  }
};

// Team Management Functions
export const saveTeam = async (userId, team) => {
  try {
    // Generate a unique ID for the team if it doesn't have one
    if (!team.id) {
      team.id = Date.now().toString();
    }
    
    const teamRef = doc(db, 'teams', team.id);
    await setDoc(teamRef, {
      ...team,
      userId,
      lastUpdated: new Date().toISOString()
    });
    
    // Add team reference to user document if not already there
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      teams: arrayUnion(team.id)
    });
    
    return { success: true, teamId: team.id };
  } catch (error) {
    console.error('Error saving team:', error);
    return { success: false, error: error.message };
  }
};

export const getUserTeams = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists() || !userDoc.data().teams) {
      return { success: true, teams: [] };
    }
    
    const teamIds = userDoc.data().teams;
    const teams = [];
    
    for (const teamId of teamIds) {
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (teamDoc.exists()) {
        teams.push(teamDoc.data());
      }
    }
    
    return { success: true, teams };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return { success: false, error: error.message };
  }
};

export const deleteTeam = async (userId, teamId) => {
  try {
    // Delete the team document
    await deleteDoc(doc(db, 'teams', teamId));
    
    // Remove team reference from user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const teams = userDoc.data().teams.filter(id => id !== teamId);
      await updateDoc(userRef, { teams });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting team:', error);
    return { success: false, error: error.message };
  }
};

// User Preferences Functions
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { preferences });
    return { success: true };
  } catch (error) {
    console.error('Error saving preferences:', error);
    return { success: false, error: error.message };
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().preferences) {
      return { success: true, preferences: userDoc.data().preferences };
    } else {
      return { success: true, preferences: {} };
    }
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return { success: false, error: error.message };
  }
};

// Social sharing functions
export const shareCollection = async (userId, collectionData, isPublic = false) => {
  try {
    // Generate a unique share ID
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Create share document
    await setDoc(doc(db, 'shared', shareId), {
      userId,
      data: collectionData,
      createdAt: new Date().toISOString(),
      isPublic,
      viewCount: 0
    });
    
    return { success: true, shareId };
  } catch (error) {
    console.error('Error sharing collection:', error);
    return { success: false, error: error.message };
  }
};

export const getSharedCollection = async (shareId) => {
  try {
    const sharedRef = doc(db, 'shared', shareId);
    const sharedDoc = await getDoc(sharedRef);
    
    if (sharedDoc.exists()) {
      // Increment view count
      await updateDoc(sharedRef, {
        viewCount: (sharedDoc.data().viewCount || 0) + 1
      });
      
      return { 
        success: true, 
        data: sharedDoc.data().data,
        createdAt: sharedDoc.data().createdAt,
        viewCount: sharedDoc.data().viewCount + 1,
        isPublic: sharedDoc.data().isPublic
      };
    } else {
      return { success: false, error: 'Shared collection not found' };
    }
  } catch (error) {
    console.error('Error fetching shared collection:', error);
    return { success: false, error: error.message };
  }
};

export const getPublicCollections = async (limit = 10) => {
  try {
    const q = query(
      collection(db, 'shared'),
      where('isPublic', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const collections = [];
    
    querySnapshot.forEach((doc) => {
      collections.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by view count
    collections.sort((a, b) => b.viewCount - a.viewCount);
    
    return { success: true, collections: collections.slice(0, limit) };
  } catch (error) {
    console.error('Error fetching public collections:', error);
    return { success: false, error: error.message };
  }
};

// Data migration/sync function
export const syncLocalToCloud = async (userId, localData) => {
  try {
    // Get existing cloud data
    const { success, data, error } = await getPokemonCollection(userId);
    
    if (!success) {
      throw new Error(error);
    }
    
    let mergedData;
    
    if (data) {
      // Merge strategy: For each Pokémon ID, combine caught statuses
      // preferring the most recent data based on timestamps
      mergedData = { ...data };
      
      for (const [pokemonId, localForms] of Object.entries(localData)) {
        if (!mergedData[pokemonId]) {
          // Cloud doesn't have this Pokémon yet
          mergedData[pokemonId] = localForms;
        } else {
          // Merge forms
          for (const [formName, localStatus] of Object.entries(localForms)) {
            if (!mergedData[pokemonId][formName]) {
              // Cloud doesn't have this form yet
              mergedData[pokemonId][formName] = localStatus;
            } else {
              // Merge individual status flags
              for (const [statusKey, statusValue] of Object.entries(localStatus)) {
                // Simple strategy: local data overwrites cloud
                mergedData[pokemonId][formName][statusKey] = statusValue;
              }
            }
          }
        }
      }
    } else {
      // No existing cloud data, just use local data
      mergedData = localData;
    }
    
    // Save merged data to cloud
    await savePokemonCollection(userId, mergedData);
    
    return { success: true, data: mergedData };
  } catch (error) {
    console.error('Error syncing data:', error);
    return { success: false, error: error.message };
  }
};

export const syncCloudToLocal = async (userId) => {
  try {
    const { success, data, error } = await getPokemonCollection(userId);
    
    if (!success) {
      throw new Error(error);
    }
    
    if (data) {
      // Store to localStorage
      localStorage.setItem('caughtPokemon', JSON.stringify(data));
      return { success: true, data };
    } else {
      return { success: true, data: {} };
    }
  } catch (error) {
    console.error('Error syncing from cloud:', error);
    return { success: false, error: error.message };
  }
};
