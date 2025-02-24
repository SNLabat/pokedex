// lib/dataManagement.js
// LocalStorage-based data management

// Helper to ensure localStorage is available (avoid SSR issues)
const isLocalStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem('test', 'test');
    window.localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
};

// Get current caught data
export const getPokemonCollection = async () => {
  if (!isLocalStorageAvailable()) return { success: false, data: {} };
  
  try {
    const data = localStorage.getItem('caughtPokemon');
    return { 
      success: true, 
      data: data ? JSON.parse(data) : {},
      lastUpdated: localStorage.getItem('lastUpdated') || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error retrieving collection:', error);
    return { success: false, error: error.message, data: {} };
  }
};

// Save caught data
export const savePokemonCollection = async (_, collectionData) => {
  if (!isLocalStorageAvailable()) return { success: false, error: 'LocalStorage not available' };
  
  try {
    localStorage.setItem('caughtPokemon', JSON.stringify(collectionData));
    localStorage.setItem('lastUpdated', new Date().toISOString());
    return { success: true };
  } catch (error) {
    console.error('Error saving collection:', error);
    return { success: false, error: error.message };
  }
};

// Export data as JSON file for backup
export const exportDataToFile = () => {
  if (!isLocalStorageAvailable()) return { success: false, error: 'LocalStorage not available' };
  
  try {
    const data = localStorage.getItem('caughtPokemon');
    if (!data) return { success: false, error: 'No data to export' };
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokedex-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error.message };
  }
};

// Import data from JSON file
export const importDataFromFile = async (file) => {
  if (!isLocalStorageAvailable()) return { success: false, error: 'LocalStorage not available' };
  
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          localStorage.setItem('caughtPokemon', JSON.stringify(data));
          localStorage.setItem('lastUpdated', new Date().toISOString());
          resolve({ success: true, data });
        } catch (error) {
          reject({ success: false, error: 'Invalid backup file' });
        }
      };
      
      reader.onerror = () => reject({ success: false, error: 'Error reading file' });
      reader.readAsText(file);
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
};

// Placeholder values instead of functions - prevents serialization issues
export const currentUserPlaceholder = null;
export const localCloudSyncStatus = { success: false, error: 'Cloud sync not available' };
export const cloudLocalSyncStatus = { success: false, error: 'Cloud sync not available' };
export const userAccountsStatus = { success: false, error: 'User accounts not available' };

// Client-side only functions
// These should never be imported in getStaticProps or getServerSideProps
export const getCurrentUser = () => currentUserPlaceholder;
export const syncLocalToCloud = async () => localCloudSyncStatus;
export const syncCloudToLocal = async () => cloudLocalSyncStatus;
export const registerUser = async () => userAccountsStatus;
export const loginUser = async () => userAccountsStatus;
export const logoutUser = async () => userAccountsStatus;
export const resetPassword = async () => userAccountsStatus;

export const saveTeam = async (_, team) => {
  if (!isLocalStorageAvailable()) return { success: false, error: 'LocalStorage not available' };
  
  try {
    const teamsString = localStorage.getItem('savedTeams');
    const teams = teamsString ? JSON.parse(teamsString) : [];
    const teamWithId = { ...team, id: Date.now().toString(), createdAt: new Date().toISOString() };
    teams.push(teamWithId);
    localStorage.setItem('savedTeams', JSON.stringify(teams));
    return { success: true, teamId: teamWithId.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getTeams = async () => {
  if (!isLocalStorageAvailable()) return { success: false, teams: [] };
  
  try {
    const teamsString = localStorage.getItem('savedTeams');
    const teams = teamsString ? JSON.parse(teamsString) : [];
    return { success: true, teams };
  } catch (error) {
    return { success: false, error: error.message, teams: [] };
  }
};

// User preferences functions
export const saveUserPreferences = async (preferences) => {
  if (!isLocalStorageAvailable()) return { success: false, error: 'LocalStorage not available' };
  
  try {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserPreferences = async () => {
  if (!isLocalStorageAvailable()) return { success: false, preferences: {} };
  
  try {
    const data = localStorage.getItem('userPreferences');
    return { success: true, preferences: data ? JSON.parse(data) : {} };
  } catch (error) {
    return { success: false, error: error.message, preferences: {} };
  }
};

// Mocked social functions placeholder values
export const socialSharingStatus = { success: false, error: 'Sharing not available in offline mode' };
export const publicCollectionsDefault = { success: false, collections: [] };

// Social function implementations (client-side only)
export const shareCollection = async () => socialSharingStatus;
export const getSharedCollection = async () => socialSharingStatus;
export const getPublicCollections = async () => publicCollectionsDefault;

export const deleteTeam = async (teamId) => {
  if (!isLocalStorageAvailable()) return { success: false, error: 'LocalStorage not available' };
  
  try {
    const teamsString = localStorage.getItem('savedTeams');
    if (!teamsString) return { success: false, error: 'No teams found' };
    
    const teams = JSON.parse(teamsString);
    const filteredTeams = teams.filter(team => team.id !== teamId);
    
    localStorage.setItem('savedTeams', JSON.stringify(filteredTeams));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
