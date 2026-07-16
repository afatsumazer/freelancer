import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App and Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive and Sheets scopes
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive");
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize Auth State Listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to check if we have a token or trigger signIn
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In trigger (must be initiated by click)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Gagal mendapatkan access token dari Firebase Auth");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ==========================================
// GOOGLE DRIVE API FUNCTIONS
// ==========================================

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
  createdTime?: string;
}

/**
 * List files from user's Google Drive.
 * We filter files that are spreadsheets, folders, or document formats, or let user search.
 */
export const listDriveFiles = async (
  accessToken: string,
  searchQuery = ""
): Promise<GoogleDriveFile[]> => {
  try {
    let q = "trashed = false";
    if (searchQuery) {
      q += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
    }
    
    // Sort by modification time
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink,iconLink,size,createdTime)&orderBy=recency&pageSize=40`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal mengambil daftar file dari Google Drive");
    }
    
    const data = await res.json();
    return data.files || [];
  } catch (error: any) {
    console.error("Error listing Drive files:", error);
    throw error;
  }
};

/**
 * Upload a local binary file / blob to Google Drive.
 */
export const uploadFileToDrive = async (
  accessToken: string,
  name: string,
  blob: Blob,
  mimeType: string
): Promise<GoogleDriveFile> => {
  try {
    const metadata = {
      name: name,
      mimeType: mimeType,
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", blob);

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,iconLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal mengunggah file ke Google Drive");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error uploading file to Drive:", error);
    throw error;
  }
};

/**
 * Create a new folder on Google Drive.
 */
export const createDriveFolder = async (
  accessToken: string,
  folderName: string
): Promise<GoogleDriveFile> => {
  try {
    const metadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    const res = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal membuat folder di Google Drive");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error creating folder in Drive:", error);
    throw error;
  }
};

/**
 * Delete a file from Google Drive.
 */
export const deleteDriveFile = async (
  accessToken: string,
  fileId: string
): Promise<void> => {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal menghapus file di Google Drive");
    }
  } catch (error: any) {
    console.error("Error deleting Drive file:", error);
    throw error;
  }
};

// ==========================================
// GOOGLE SHEETS API FUNCTIONS
// ==========================================

export interface GoogleSpreadsheet {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
    };
  }>;
}

/**
 * Create a brand new Google Spreadsheet.
 */
export const createSpreadsheet = async (
  accessToken: string,
  title: string
): Promise<GoogleSpreadsheet> => {
  try {
    const body = {
      properties: {
        title: title,
      },
    };

    const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal membuat Google Spreadsheet baru");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error creating Spreadsheet:", error);
    throw error;
  }
};

/**
 * Update cell values in a range of a Google Spreadsheet.
 */
export const updateSpreadsheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<any> => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    
    const body = {
      range: range,
      majorDimension: "ROWS",
      values: values,
    };

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal memperbarui data Google Spreadsheet");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error updating Spreadsheet values:", error);
    throw error;
  }
};

/**
 * Read values from a specific spreadsheet range.
 */
export const getSpreadsheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<string[][]> => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal membaca data dari Google Spreadsheet");
    }

    const data = await res.json();
    return data.values || [];
  } catch (error: any) {
    console.error("Error getting Spreadsheet values:", error);
    throw error;
  }
};

/**
 * Fetch spreadsheet metadata (e.g. to get sheets/tab list).
 */
export const getSpreadsheetMetadata = async (
  accessToken: string,
  spreadsheetId: string
): Promise<GoogleSpreadsheet> => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Gagal membaca metadata Google Spreadsheet");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Error getting Spreadsheet metadata:", error);
    throw error;
  }
};
