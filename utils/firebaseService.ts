import { db, storage, auth } from "@/firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface CertificateData {
  name: string;
  email: string;
  course: string;
  date?: string;
  certificateId: string;
}

export interface CertificateRecord extends CertificateData {
  id: string;
  userId: string;
  fileUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TemplateRecord {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  userId: string;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirebaseService {
  // Certificate operations
  static async saveCertificate(
    certificateData: CertificateData,
    pdfBlob: Blob
  ): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      console.log("🔥 Starting Firebase upload...");
      console.log("📄 PDF Blob size:", pdfBlob.size);
      console.log("👤 User ID:", user.uid);
      console.log("📜 Certificate ID:", certificateData.certificateId);

      // Check if we're in development and CORS is an issue
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        console.log("🔧 Development mode detected, using local fallback...");
        return await this.saveCertificateLocal(certificateData, pdfBlob, user.uid);
      }

      // Production Firebase Storage upload
      const storageRef = ref(
        storage, 
        `certificates/${user.uid}/${certificateData.certificateId}.pdf`
      );
      
      const metadata = {
        contentType: 'application/pdf',
        cacheControl: 'public, max-age=31536000'
      };

      console.log("⬆️ Uploading to Firebase Storage...");
      const uploadResult = await uploadBytes(storageRef, pdfBlob, metadata);
      console.log("✅ Upload successful:", uploadResult);

      const fileUrl = await getDownloadURL(storageRef);
      console.log("🔗 Download URL:", fileUrl);

      // Save certificate data to Firestore
      const certificateRecord = {
        ...certificateData,
        userId: user.uid,
        fileUrl,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log("💾 Saving to Firestore...");
      const docRef = await addDoc(collection(db, "certificates"), certificateRecord);
      console.log("✅ Firestore save successful:", docRef.id);
      
      return docRef.id;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string; stack?: string };
      console.error("💥 Error saving certificate:", error);
      console.error("🔍 Error details:", {
        name: err?.name,
        message: err?.message,
        stack: err?.stack
      });
      
      // If Firebase fails, try local fallback
      if (err?.message?.includes('CORS') || err?.message?.includes('network')) {
        console.log("🔄 Firebase failed, trying local fallback...");
        const user = auth.currentUser;
        if (user) {
          return await this.saveCertificateLocal(certificateData, pdfBlob, user.uid);
        }
      }
      
      // Provide more user-friendly error messages
      if (err?.message?.includes('CORS')) {
        throw new Error("CORS error: Firebase Storage not configured for localhost. Using local storage fallback.");
      } else if (err?.message?.includes('network')) {
        throw new Error("Network error: Please check your internet connection and try again.");
      } else if (err?.message?.includes('unauthorized')) {
        throw new Error("Permission denied: Please check Firebase security rules and ensure you're logged in.");
      } else {
        throw new Error(`Failed to save certificate: ${err?.message || 'Unknown error'}`);
      }
    }
  }

  // Local development fallback
  private static async saveCertificateLocal(
    certificateData: CertificateData,
    pdfBlob: Blob,
    userId: string
  ): Promise<string> {
    try {
      console.log("💾 Using local storage fallback...");
      
      // Never persist blob: URLs to Firestore — they stop working after refresh.
      // PDF bytes are kept in localStorage under certificate_${certificateId} instead.
      const certificateRecord = {
        ...certificateData,
        userId,
        fileUrl: "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log("💾 Saving to Firestore with local URL...");
      const docRef = await addDoc(collection(db, "certificates"), certificateRecord);
      console.log("✅ Firestore save successful with local URL:", docRef.id);
      
      // Store the blob in localStorage for development (limited size)
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(pdfBlob);
        });
        
        // Store in localStorage with size limit
        const maxSize = 100 * 1024 * 1024; // 100MB limit
        if (base64.length < maxSize) {
          localStorage.setItem(`certificate_${certificateData.certificateId}`, base64);
          console.log("💾 PDF stored in localStorage for development");
        }
      } catch (storageError) {
        console.warn("⚠️ Could not store PDF in localStorage:", storageError);
      }
      
      return docRef.id;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string; stack?: string };
      console.error("💥 Local fallback also failed:", error);
      throw new Error(`Both Firebase and local storage failed: ${err?.message || 'Unknown error'}`);
    }
  }

  static async getCertificates(userId?: string): Promise<CertificateRecord[]> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Simple query without complex ordering to avoid index requirements
      const certificatesQuery = userId
        ? query(
            collection(db, "certificates"),
            where("userId", "==", userId)
          )
        : query(
            collection(db, "certificates"),
            where("userId", "==", user.uid)
          );

      const querySnapshot = await getDocs(certificatesQuery);
      const certificates = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
      })) as CertificateRecord[];

      // Sort locally instead of using Firestore orderBy
      certificates.sort((a, b) => 
        b.createdAt.toMillis() - a.createdAt.toMillis()
      );

      return certificates;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string; stack?: string };
      console.error("Error fetching certificates:", error);
      console.error("Error details:", {
        name: err?.name,
        message: err?.message,
        stack: err?.stack
      });
      throw error;
    }
  }

  static async getCertificateById(certificateId: string): Promise<CertificateRecord | null> {
    try {
      // Try to find by certificateId field first
      const q = query(
        collection(db, "certificates"),
        where("certificateId", "==", certificateId)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as CertificateRecord;
      }

      // If not found, try by document ID
      const docRef = doc(db, "certificates", certificateId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as CertificateRecord;
      }

      return null;
    } catch (error) {
      console.error("Error fetching certificate by ID:", error);
      return null;
    }
  }

  static async getCertificateByDocumentId(documentId: string): Promise<CertificateRecord | null> {
    try {
      const docRef = doc(db, "certificates", documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as CertificateRecord;
      }

      return null;
    } catch (error) {
      console.error("Error fetching certificate by document ID:", error);
      return null;
    }
  }

  static async deleteCertificate(certificateId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const certificate = await this.getCertificateById(certificateId);
      if (!certificate) throw new Error("Certificate not found");

      if (certificate.userId !== user.uid) {
        throw new Error("Permission denied");
      }

      // Delete from Firestore
      const docRef = doc(db, "certificates", certificate.id);
      await deleteDoc(docRef);

      // Note: You might want to also delete from Storage, but that requires the Storage SDK
      // For now, we'll keep the file in storage
    } catch (error) {
      console.error("Error deleting certificate:", error);
      throw error;
    }
  }

  // Template operations
  static async saveTemplate(templateData: Omit<TemplateRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const templateRecord = {
        ...templateData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, "templates"), templateRecord);
      return docRef.id;
    } catch (error) {
      console.error("Error saving template:", error);
      throw error;
    }
  }

  static async getTemplates(userId?: string): Promise<TemplateRecord[]> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const templatesQuery = userId
        ? query(
            collection(db, "templates"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
          )
        : query(
            collection(db, "templates"),
            where("isPublic", "==", true),
            orderBy("createdAt", "desc")
          );

      const querySnapshot = await getDocs(templatesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TemplateRecord));
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  }

  // Statistics operations
  static async getStats(userId: string): Promise<{
    totalCertificates: number;
    totalRecipients: number;
    activeTemplates: number;
  }> {
    try {
      // Get certificates count
      const certificatesQuery = query(
        collection(db, "certificates"),
        where("userId", "==", userId)
      );
      const certificatesSnapshot = await getDocs(certificatesQuery);
      const totalCertificates = certificatesSnapshot.size;

      // Get unique recipients count
      const recipientsSet = new Set();
      certificatesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          recipientsSet.add(data.email);
        }
      });
      const totalRecipients = recipientsSet.size;

      // Get templates count
      const templatesQuery = query(
        collection(db, "templates"),
        where("userId", "==", userId)
      );
      const templatesSnapshot = await getDocs(templatesQuery);
      const activeTemplates = templatesSnapshot.size;

      return {
        totalCertificates,
        totalRecipients,
        activeTemplates
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }

  // Search operations
  static async searchCertificates(
    searchTerm: string,
    userId?: string
  ): Promise<CertificateRecord[]> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // For now, we'll do a simple client-side search
      // In a production app, you might want to use Algolia or Elasticsearch
      const certificates = await this.getCertificates(userId || user.uid);
      
      return certificates.filter(cert => 
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching certificates:", error);
      throw error;
    }
  }
}
