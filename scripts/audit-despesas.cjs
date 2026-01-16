const fs = require('fs');

const env = process.argv[2] || 'dev';
const despesasFiles = {
  dev: '/home/runner/.claude/projects/-home-runner-workspace/79b2d435-14c7-4b7f-a7c4-0cbcf351d4c0/tool-results/mcp-firebase-firebase_query-1768583886566.txt',
  prod: '/home/runner/.claude/projects/-home-runner-workspace/79b2d435-14c7-4b7f-a7c4-0cbcf351d4c0/tool-results/mcp-firebase-firebase_query-1768583980981.txt'
};

// Emendas inline (extraídas da query)
const emendasDev = {"7MXuX8veyPeL54igKbbW":{"municipio":"Passagem Franca","uf":"MA"},"9OORfj0LThxPUMDpvKXk":{"municipio":"Sucupira do Riachão","uf":"MA"},"O9xKeS3IhYbXql3Hgq0X":{"municipio":"Sucupira do Riachão","uf":"MA"},"SByU3fMjfRIYjNslCviC":{"municipio":"Passagem Franca","uf":"MA"},"SVmhPyzRGwIxmXsPjZ8H":{"municipio":"Passagem Franca","uf":"MA"},"Z9UBtWZblzKNYsaguj1E":{"municipio":"Ferreira Gomes","uf":"AP"},"M3qsDLMz6x00SiiD7xD9":{"municipio":"Águas Lindas de Goiás","uf":"GO"},"63irpXwAWDpp5yZ28U3A":{"municipio":"Belém","uf":"AL"},"WGcqFfwljRDvnyiGwOWb":{"municipio":"Anori","uf":"AM"},"3TJh5mH3IOnzU4GfNX5B":{"municipio":"Passagem Franca","uf":"MA"},"3lNuj5DGnZqowSOwgzGL":{"municipio":"Passagem Franca","uf":"MA"},"CvpshIl5IKtXYrmXzcP0":{"municipio":"Antônio Almeida","uf":"PI"},"Gu9wWwt4BG9GTfyiXVGW":{"municipio":"Antônio Almeida","uf":"PI"},"M9XYXHHisAzVDqHfwPwm":{"municipio":"Antônio Almeida","uf":"PI"},"aQVZSY3RMmjLkO9YvYTr":{"municipio":"Antônio Almeida","uf":"PI"},"ac83F65XeZIWFqcFUaUF":{"municipio":"Passagem Franca","uf":"MA"},"ctGMxVNWgLdgIbIALfTT":{"municipio":"Antônio Almeida","uf":"PI"},"it939ZfSmIF5Kof6aBBD":{"municipio":"Passagem Franca","uf":"MA"},"p4a63siJAhWUJa0nvSYD":{"municipio":"Antônio Almeida","uf":"PI"},"pnRUg8N64cFn1e0j6QHu":{"municipio":"Antônio Almeida","uf":"PI"},"srwLjuVnyBbc7dcHhQQq":{"municipio":"Passagem Franca","uf":"MA"}};

const emendasProd = {"114RdOhjnugPSWOIeX70":{"municipio":"São Domingos do Azeitão","uf":"MA"},"3TJh5mH3IOnzU4GfNX5B":{"municipio":"Passagem Franca","uf":"MA"},"3lNuj5DGnZqowSOwgzGL":{"municipio":"Passagem Franca","uf":"MA"},"7MXuX8veyPeL54igKbbW":{"municipio":"Passagem Franca","uf":"MA"},"9OORfj0LThxPUMDpvKXk":{"municipio":"Sucupira do Riachão","uf":"MA"},"9tisNttRq5gJsJPmg3q7":{"municipio":"São Domingos do Azeitão","uf":"MA"},"CvpshIl5IKtXYrmXzcP0":{"municipio":"Antônio Almeida","uf":"PI"},"DHcy0L2OVvRsm3E44PyQ":{"municipio":"Antônio Almeida","uf":"PI"},"Gu9wWwt4BG9GTfyiXVGW":{"municipio":"Antônio Almeida","uf":"PI"},"LTb2bIk5nn0rUjLqOegv":{"municipio":"Floriano","uf":"PI"},"M9XYXHHisAzVDqHfwPwm":{"municipio":"Antônio Almeida","uf":"PI"},"O9xKeS3IhYbXql3Hgq0X":{"municipio":"Sucupira do Riachão","uf":"MA"},"SVmhPyzRGwIxmXsPjZ8H":{"municipio":"Passagem Franca","uf":"MA"},"UKszNILYhFKD419rY6qn":{"municipio":"São Domingos do Azeitão","uf":"MA"},"aQVZSY3RMmjLkO9YvYTr":{"municipio":"Antônio Almeida","uf":"PI"},"ac83F65XeZIWFqcFUaUF":{"municipio":"Passagem Franca","uf":"MA"},"cWssCpdkOlCGG4Ia7rCg":{"municipio":"São Domingos do Azeitão","uf":"MA"},"ctGMxVNWgLdgIbIALfTT":{"municipio":"Antônio Almeida","uf":"PI"},"gFPsw38U46OWtsMlTd1m":{"municipio":"São Domingos do Azeitão","uf":"MA"},"it939ZfSmIF5Kof6aBBD":{"municipio":"Passagem Franca","uf":"MA"},"jVSzeMhoN5gldVQVEiDv":{"municipio":"São Domingos do Azeitão","uf":"MA"},"k8Y0wlEHMpjVYmplBxK2":{"municipio":"São Domingos do Azeitão","uf":"MA"},"p4a63siJAhWUJa0nvSYD":{"municipio":"Antônio Almeida","uf":"PI"},"pnRUg8N64cFn1e0j6QHu":{"municipio":"Antônio Almeida","uf":"PI"},"sXlFnPtpWuM4t4pbQwnd":{"municipio":"São Domingos do Azeitão","uf":"MA"},"skfu3XkCMn7eXvVtvwwn":{"municipio":"São Domingos do Azeitão","uf":"MA"},"srwLjuVnyBbc7dcHhQQq":{"municipio":"Passagem Franca","uf":"MA"},"OHEPwpv0UMkASbzzh2c8":{"municipio":"Floriano","uf":"PI"},"qz8BSCoQa4AZe65WBADU":{"municipio":"Floriano","uf":"PI"},"r3meWU8ODLxEO3Haqfaq":{"municipio":"Floriano","uf":"PI"}};

const emendas = env === 'prod' ? emendasProd : emendasDev;

// Ler despesas
const despesasData = JSON.parse(fs.readFileSync(despesasFiles[env], 'utf8'));

const despesas = despesasData.documents.map(d => ({
  id: d.id,
  emendaId: d.emendaId || 'N/A',
  municipio: d.municipio || 'VAZIO',
  uf: d.uf || 'VAZIO',
  status: d.status || 'N/A',
  valor: d.valor || 0,
  descricao: d.descricao || ''
}));

console.log(`\n${'='.repeat(60)}`);
console.log(`=== AUDITORIA DESPESAS ${env.toUpperCase()} ===`);
console.log(`${'='.repeat(60)}\n`);
console.log('Total despesas:', despesas.length);

// 1. Despesas sem municipio
const semMunicipio = despesas.filter(d => d.municipio === 'VAZIO' || d.municipio === 'N/A' || d.municipio === '');
console.log('\n🔴 PROBLEMA 1: Despesas SEM municipio/uf:', semMunicipio.length);
if (semMunicipio.length > 0) {
  console.log('   (Operadores NÃO verão essas despesas!)');
  semMunicipio.slice(0, 10).forEach(d => {
    const emenda = emendas[d.emendaId];
    const emendaMunicipio = emenda ? `${emenda.municipio}/${emenda.uf}` : 'EMENDA NÃO ENCONTRADA';
    console.log(`   - ${d.id.substring(0,8)}... | emendaId: ${d.emendaId.substring(0,8)}... | Emenda é de: ${emendaMunicipio}`);
  });
  if (semMunicipio.length > 10) console.log(`   ... e mais ${semMunicipio.length - 10}`);
}

// 2. Despesas com municipio DIFERENTE da emenda
const comMunicipioDiferente = despesas.filter(d => {
  if (d.municipio === 'VAZIO' || d.emendaId === 'N/A') return false;
  const emenda = emendas[d.emendaId];
  if (!emenda) return false;
  return d.municipio !== emenda.municipio || d.uf !== emenda.uf;
});

console.log('\n🟠 PROBLEMA 2: Despesas com municipio DIFERENTE da emenda:', comMunicipioDiferente.length);
if (comMunicipioDiferente.length > 0) {
  console.log('   (Operadores verão em lugar errado!)');
  comMunicipioDiferente.forEach(d => {
    const emenda = emendas[d.emendaId];
    console.log(`   - ${d.id.substring(0,8)}... | Despesa: ${d.municipio}/${d.uf} | Emenda: ${emenda.municipio}/${emenda.uf}`);
  });
}

// 3. Despesas órfãs (emenda não existe)
const orfas = despesas.filter(d => d.emendaId !== 'N/A' && !emendas[d.emendaId]);
console.log('\n🟡 PROBLEMA 3: Despesas órfãs (emenda não existe):', orfas.length);
if (orfas.length > 0) {
  orfas.forEach(d => console.log(`   - ${d.id} | emendaId: ${d.emendaId}`));
}

// 4. Resumo por municipio/uf
console.log('\n📊 Distribuição por municipio/UF:');
const porMunicipio = {};
despesas.forEach(d => {
  const key = `${d.municipio}/${d.uf}`;
  porMunicipio[key] = (porMunicipio[key] || 0) + 1;
});
Object.entries(porMunicipio).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`   - ${k}: ${v} despesas`));

// 5. Impacto para operadores
console.log('\n⚠️  IMPACTO PARA OPERADORES:');
const problemTotal = semMunicipio.length + comMunicipioDiferente.length;
const percentProblema = ((problemTotal / despesas.length) * 100).toFixed(1);
console.log(`   ${problemTotal} de ${despesas.length} despesas (${percentProblema}%) com problemas de localização`);
if (problemTotal > 0) {
  console.log('   → Operadores podem não ver despesas que deveriam ver');
  console.log('   → Ou ver despesas no município errado');
}
