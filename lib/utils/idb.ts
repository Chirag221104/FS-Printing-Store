// Simple IndexedDB wrapper for storing local blobs/files (custom artwork)
const DB_NAME = 'fs_printworks_idb';
const STORE_NAME = 'artwork_files';
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject('No window');
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject('IndexedDB error');
    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function setFile(key: string, file: File | Blob): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(file, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error saving file');
  });
}

export async function getFile(key: string): Promise<File | Blob | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = (e) => resolve((e.target as IDBRequest).result);
    request.onerror = () => reject('Error getting file');
  });
}

export async function deleteFile(key: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error deleting file');
  });
}
