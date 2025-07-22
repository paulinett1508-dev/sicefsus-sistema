// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // ✨ ADICIONADO

const firebaseConfig = {
  apiKey: "AIzaSyCzPAX38D6a_S55-BdoKb8nMe-12Eo1egU",
  authDomain: "emendas-parlamentares-60dbd.firebaseapp.com",
  projectId: "emendas-parlamentares-60dbd",
  storageBucket: "emendas-parlamentares-60dbd.appspot.com",
  messagingSenderId: "713722518727",
  appId: "1:713722518727:web:d2ce76ad87b2e3e075f2e2",
  measurementId: "G-NM7L5HLVPE",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // ✨ ADICIONADO

export { db, auth, storage }; // ✨ ADICIONADO storage no export
