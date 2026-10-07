import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function getUserRole(email: string) {
  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("email", "==", email)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const data = snapshot.docs[0].data();

  return (data.role || "").trim() || null;
}