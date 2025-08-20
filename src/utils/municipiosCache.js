// src/utils/municipiosCache.js
// 🎯 SISTEMA DE CACHE INTELIGENTE PARA MUNICÍPIOS

// ⚙️ Configurações do cache
const CACHE_CONFIG = {
  PREFIX: "sicefsus_municipios_",
  EXPIRY_DAYS: 30, // Cache válido por 30 dias
  API_TIMEOUT: 8000, // 8 segundos para IBGE
  RETRY_ATTEMPTS: 2, // Tentar 2 vezes se falhar
  RETRY_DELAY: 1000, // 1 segundo entre tentativas
};

// 🕐 Verificar se cache está válido
const isCacheValid = (cacheData) => {
  if (!cacheData || !cacheData.timestamp) return false;

  const now = new Date().getTime();
  const cacheTime = new Date(cacheData.timestamp).getTime();
  const expiryTime = CACHE_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  return now - cacheTime < expiryTime;
};

// 💾 Salvar no cache
const saveToCache = (uf, municipios) => {
  try {
    const cacheData = {
      uf,
      municipios,
      timestamp: new Date().toISOString(),
      source: "ibge_api",
    };

    localStorage.setItem(
      `${CACHE_CONFIG.PREFIX}${uf}`,
      JSON.stringify(cacheData),
    );

    console.log(`💾 Cache salvo para ${uf}: ${municipios.length} municípios`);
  } catch (error) {
    console.warn(`⚠️ Erro ao salvar cache para ${uf}:`, error);
  }
};

// 📖 Ler do cache
const loadFromCache = (uf) => {
  try {
    const cacheKey = `${CACHE_CONFIG.PREFIX}${uf}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (!cachedData) return null;

    const parsed = JSON.parse(cachedData);

    if (!isCacheValid(parsed)) {
      console.log(`🗑️ Cache expirado para ${uf}, removendo...`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log(
      `📖 Cache válido encontrado para ${uf}: ${parsed.municipios.length} municípios`,
    );
    return parsed.municipios;
  } catch (error) {
    console.warn(`⚠️ Erro ao ler cache para ${uf}:`, error);
    return null;
  }
};

// 🌐 Chamar API IBGE com retry
const fetchFromIBGE = async (uf, attempt = 1) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    CACHE_CONFIG.API_TIMEOUT,
  );

  try {
    console.log(
      `🌐 Tentativa ${attempt}/${CACHE_CONFIG.RETRY_ATTEMPTS} - API IBGE para ${uf}`,
    );

    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
      { signal: controller.signal },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const municipios = data.map((municipio) => ({
      id: municipio.id,
      nome: municipio.nome,
    }));

    console.log(
      `✅ API IBGE sucesso para ${uf}: ${municipios.length} municípios`,
    );

    // 💾 Salvar no cache para próximas vezes
    saveToCache(uf, municipios);

    return municipios;
  } catch (error) {
    clearTimeout(timeoutId);

    // 🔄 Retry se ainda tem tentativas
    if (attempt < CACHE_CONFIG.RETRY_ATTEMPTS) {
      console.log(
        `🔄 Tentativa ${attempt} falhou, tentando novamente em ${CACHE_CONFIG.RETRY_DELAY}ms...`,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, CACHE_CONFIG.RETRY_DELAY),
      );
      return fetchFromIBGE(uf, attempt + 1);
    }

    console.warn(
      `❌ API IBGE falhou definitivamente para ${uf}:`,
      error.message,
    );
    throw error;
  }
};

// 🎯 Função principal - estratégia híbrida
export const carregarMunicipios = async (uf) => {
  if (!uf) return [];

  console.log(`🏙️ Carregando municípios para ${uf}...`);

  try {
    // 1️⃣ PRIMEIRO: Tentar API IBGE
    const municipiosAPI = await fetchFromIBGE(uf);
    return municipiosAPI;
  } catch (apiError) {
    // 2️⃣ SEGUNDO: Usar cache se disponível
    console.log(`🔄 API falhou, tentando cache para ${uf}...`);
    const municipiosCache = loadFromCache(uf);

    if (municipiosCache && municipiosCache.length > 0) {
      console.log(
        `✅ Usando cache para ${uf}: ${municipiosCache.length} municípios`,
      );
      return municipiosCache;
    }

    // 3️⃣ TERCEIRO: Fallback mínimo (só capital)
    console.warn(`❌ Nem API nem cache disponível para ${uf}`);
    const fallbackMinimo = [{ id: `${uf}-capital`, nome: getCapital(uf) }];

    console.log(`🆘 Usando fallback mínimo para ${uf}`);
    return fallbackMinimo;
  }
};

// 🏛️ Capitais brasileiras (fallback final)
const getCapital = (uf) => {
  const capitais = {
    AC: "Rio Branco",
    AL: "Maceió",
    AP: "Macapá",
    AM: "Manaus",
    BA: "Salvador",
    CE: "Fortaleza",
    DF: "Brasília",
    ES: "Vitória",
    GO: "Goiânia",
    MA: "São Luís",
    MT: "Cuiabá",
    MS: "Campo Grande",
    MG: "Belo Horizonte",
    PA: "Belém",
    PB: "João Pessoa",
    PR: "Curitiba",
    PE: "Recife",
    PI: "Teresina",
    RJ: "Rio de Janeiro",
    RN: "Natal",
    RS: "Porto Alegre",
    RO: "Porto Velho",
    RR: "Boa Vista",
    SC: "Florianópolis",
    SP: "São Paulo",
    SE: "Aracaju",
    TO: "Palmas",
  };

  return capitais[uf] || `Capital de ${uf}`;
};

// 🧹 Limpar cache expirado (executar ocasionalmente)
export const limparCacheExpirado = () => {
  try {
    const keys = Object.keys(localStorage);
    let removidos = 0;

    keys.forEach((key) => {
      if (key.startsWith(CACHE_CONFIG.PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (!isCacheValid(data)) {
            localStorage.removeItem(key);
            removidos++;
          }
        } catch (error) {
          // Cache corrompido, remover
          localStorage.removeItem(key);
          removidos++;
        }
      }
    });

    if (removidos > 0) {
      console.log(`🧹 ${removidos} caches expirados removidos`);
    }
  } catch (error) {
    console.warn("⚠️ Erro ao limpar cache:", error);
  }
};

// 📊 Status do cache
export const getCacheStatus = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_CONFIG.PREFIX));

    const status = {
      total: cacheKeys.length,
      validos: 0,
      expirados: 0,
      ufs: [],
    };

    cacheKeys.forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const uf = key.replace(CACHE_CONFIG.PREFIX, "");

        if (isCacheValid(data)) {
          status.validos++;
          status.ufs.push({
            uf,
            municipios: data.municipios.length,
            timestamp: data.timestamp,
          });
        } else {
          status.expirados++;
        }
      } catch (error) {
        status.expirados++;
      }
    });

    return status;
  } catch (error) {
    return { erro: error.message };
  }
};
