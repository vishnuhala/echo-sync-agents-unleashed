import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Document } from '@/types/database';

interface DocumentsContextType {
  documents: Document[];
  loading: boolean;
  uploadDocument: (file: File) => Promise<{ document?: Document; error: any }>;
  deleteDocument: (documentId: string) => Promise<{ error: any }>;
  refreshDocuments: () => Promise<void>;
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDocuments = async () => {
    await fetchDocuments();
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const uploadDocument = async (file: File) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL for display (but store the file path for processing)
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Create document record
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_url: publicUrl, // Store public URL for download links
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (documentError) throw documentError;

      // Process the document content (pass the file path for processing)
      await supabase.functions.invoke('process-document', {
        body: {
          documentId: documentData.id,
          filePath: fileName, // Pass the storage path directly
          fileType: file.type,
        },
      });

      await fetchDocuments();
      return { document: documentData, error: null };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { error };
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Get the document to find the file path
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (document.file_url) {
        const filePath = document.file_url.split('/').slice(-2).join('/'); // Extract user_id/filename
        await supabase.storage
          .from('documents')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      await fetchDocuments();
      return { error: null };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { error };
    }
  };

  const value = {
    documents,
    loading,
    uploadDocument,
    deleteDocument,
    refreshDocuments,
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider');
  }
  return context;
}