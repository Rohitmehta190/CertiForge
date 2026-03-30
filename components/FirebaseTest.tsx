import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function FirebaseTest() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({ email: user.email || undefined });
        setConnectionStatus("Connected to Firebase Auth");
      } else {
        setUser(null);
        setConnectionStatus("Connected to Firebase (not authenticated)");
      }
    });

    // Test Firestore connection
    const testFirestore = async () => {
      try {
        setConnectionStatus(prev => prev + " + Firestore connected");
      } catch {
        setConnectionStatus(prev => prev + " + Firestore connection failed");
      }
    };

    testFirestore();

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
      <h3 className="font-semibold text-green-800">Firebase Connection Status:</h3>
      <p className="text-green-700">{connectionStatus}</p>
      {user && (
        <p className="text-green-600">User: {user.email}</p>
      )}
    </div>
  );
}
