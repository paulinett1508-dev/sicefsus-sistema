import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);
  const [lembrarEmail, setLembrarEmail] = useState(false);
  const [perfil, setPerfil] = useState("user"); // "user" ou "admin"

  // Ao carregar, verifica se há e-mail salvo
  useEffect(() => {
    const emailSalvo = localStorage.getItem("sicefsus_email");
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarEmail(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      if (modoCadastro) {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);
        // Cria o documento do usuário no Firestore com o perfil escolhido
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          role: perfil, // "admin" ou "user"
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
      }
      if (lembrarEmail) {
        localStorage.setItem("sicefsus_email", email);
      } else {
        localStorage.removeItem("sicefsus_email");
      }
      onLoginSuccess();
    } catch (err) {
      setErro(traduzirErroFirebase(err));
    }
  }

  function traduzirErroFirebase(err) {
    if (err.code === "auth/email-already-in-use")
      return "E-mail já cadastrado.";
    if (err.code === "auth/invalid-email") return "E-mail inválido.";
    if (err.code === "auth/weak-password")
      return "A senha deve ter pelo menos 6 caracteres.";
    if (
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password"
    )
      return "E-mail ou senha incorretos.";
    return err.message;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{modoCadastro ? "Criar Conta" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            autoFocus
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={styles.input}
          />
          {modoCadastro && (
            <div style={styles.radioContainer}>
              <label>
                <input
                  type="radio"
                  name="perfil"
                  value="user"
                  checked={perfil === "user"}
                  onChange={() => setPerfil("user")}
                />
                Operador
              </label>
              <label style={{ marginLeft: 16 }}>
                <input
                  type="radio"
                  name="perfil"
                  value="admin"
                  checked={perfil === "admin"}
                  onChange={() => setPerfil("admin")}
                />
                Administrador
              </label>
            </div>
          )}
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="lembrarEmail"
              checked={lembrarEmail}
              onChange={(e) => setLembrarEmail(e.target.checked)}
            />
            <label
              htmlFor="lembrarEmail"
              style={{ marginLeft: 8, fontSize: 14 }}
            >
              Lembrar e-mail
            </label>
          </div>
          <button type="submit" style={styles.button}>
            {modoCadastro ? "Cadastrar" : "Entrar"}
          </button>
        </form>
        <button
          style={styles.link}
          onClick={() => setModoCadastro(!modoCadastro)}
        >
          {modoCadastro ? "Já tenho conta" : "Criar nova conta"}
        </button>
        {erro && <p style={styles.erro}>{erro}</p>}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    padding: 32,
    minWidth: 320,
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "8px 0",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  radioContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "8px 0",
    gap: 16,
    fontSize: 15,
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    margin: "8px 0 0 0",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#4a90e2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    marginTop: 12,
    cursor: "pointer",
  },
  link: {
    background: "none",
    border: "none",
    color: "#4a90e2",
    marginTop: 12,
    cursor: "pointer",
    textDecoration: "underline",
  },
  erro: {
    color: "red",
    marginTop: 10,
  },
};
