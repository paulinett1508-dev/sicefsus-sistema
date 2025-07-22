// src/firebase/criarUsuario.js
import { db } from "./firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function criarUsuarioSeNaoExiste(user, role = "user") {
  const ref = doc(db, "users", user.uid);
  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email,
      role, // "user" ou "admin"
      createdAt: serverTimestamp(),
    },
    { merge: true }, // não sobrescreve se já existir
  );
}
