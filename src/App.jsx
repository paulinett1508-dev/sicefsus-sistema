// CORREÇÃO PARA APP.JSX - useEffect que carrega dados do usuário (linha ~148)

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        console.log("🔍 Carregando dados do usuário:", firebaseUser.uid);

        // ✅ CORREÇÃO PRINCIPAL: Usar coleção "usuarios" em vez de "users"
        const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("✅ Dados do usuário encontrados:", userData);

          // ✅ NORMALIZAÇÃO DE CAMPOS para compatibilidade
          const nome =
            userData.nome ||
            userData.name ||
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Usuário";
          const tipo = userData.tipo || userData.role || "operador";
          const status = userData.status || "ativo";

          setUsuario({
            uid: firebaseUser.uid,
            email: firebaseUser.email,

            // ✅ CAMPOS NORMALIZADOS:
            nome: nome,
            displayName: nome, // Para compatibilidade com Sidebar

            // ✅ MAPEAMENTO DE TIPOS:
            role: tipo === "admin" ? "admin" : "user", // Para compatibilidade
            tipo: tipo, // Campo original do sistema

            // ✅ MAPEAMENTO DE STATUS:
            isActive: status === "ativo", // Para compatibilidade
            status: status, // Campo original do sistema

            // ✅ DADOS GEOGRÁFICOS:
            municipio: userData.municipio,
            uf: userData.uf,

            // ✅ MANTER TODOS OS CAMPOS ORIGINAIS:
            ...userData,
          });

          console.log("👤 Usuário configurado:", {
            nome: nome,
            tipo: tipo,
            municipio: userData.municipio,
            uf: userData.uf,
          });
        } else {
          console.log(
            "⚠️ Documento do usuário não encontrado, criando básico...",
          );

          // ✅ CRIAR DOCUMENTO BÁSICO se não existir
          const nomeBasico =
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Usuário";

          const basicUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nome: nomeBasico,
            tipo: "operador",
            status: "ativo",
            primeiroAcesso: true,
            criadoPor: "sistema",
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
          };

          // ✅ CRIAR NA COLEÇÃO CORRETA "usuarios"
          await setDoc(doc(db, "usuarios", firebaseUser.uid), basicUserData);
          console.log("✅ Novo usuário criado:", basicUserData);

          setUsuario({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            nome: nomeBasico,
            displayName: nomeBasico,
            role: "user",
            tipo: "operador",
            isActive: true,
            status: "ativo",
            ...basicUserData,
          });
        }
      } catch (error) {
        console.error("❌ Erro ao carregar dados do usuário:", error);

        // ✅ FALLBACK robusto em caso de erro
        const fallbackName =
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "Usuário";
        setUsuario({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          nome: fallbackName,
          displayName: fallbackName,
          role: "user",
          tipo: "operador",
          isActive: true,
          status: "ativo",
        });
      }
    } else {
      console.log("🚪 Usuário deslogado");
      setUsuario(null);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);
