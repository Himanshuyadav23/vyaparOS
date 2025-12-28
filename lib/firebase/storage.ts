import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  if (!storage) throw new Error("Storage not initialized");
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteImage(path: string): Promise<void> {
  if (!storage) throw new Error("Storage not initialized");
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export function getImagePath(collection: string, itemId: string, filename: string): string {
  return `${collection}/${itemId}/${filename}`;
}

