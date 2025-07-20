import { supabase } from "./supabase";

const BUCKET_NAME = "receipt-images";

export const storageService = {
  /**
   * Upload a receipt image to storage
   */
  async uploadReceiptImage(
    imageUri: string,
    fileName: string,
    userId: string
  ): Promise<{ path: string; error: any }> {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create a unique file path
      const filePath = `${userId}/${Date.now()}_${fileName}`;

      // Upload directly to the bucket (bypassing listBuckets)
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        console.error("Storage upload error:", error);
        return { path: "", error };
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return { path: urlData.publicUrl, error: null };
    } catch (error) {
      console.error("Storage service error:", error);
      return { path: "", error };
    }
  },

  /**
   * Get public URL for an image
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Delete an image from storage
   */
  async deleteImage(filePath: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      return { error };
    } catch (error) {
      console.error("Storage delete error:", error);
      return { error };
    }
  },

  /**
   * Test if storage is working
   */
  async testStorage(): Promise<{ working: boolean; error?: string }> {
    try {
      // Try to list files in the bucket (this should work even with RLS)
      const { data: files, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list();

      if (error) {
        return { working: false, error: error.message };
      }

      return { working: true };
    } catch (error) {
      return {
        working: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
