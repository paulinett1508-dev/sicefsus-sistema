const admin = require('firebase-admin');

const serviceAccount = {
  projectId: 'emendas-parlamentares-60dbd',
  clientEmail: 'firebase-adminsdk-fbsvc@emendas-parlamentares-60dbd.iam.gserviceaccount.com',
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxMuajhVDLmUBq
wF0uSA5BZwheBTgIe1Bi6c0T7ANuuKoQj8FuPycei3A3d5aNn8aDsLsqkPMMgG0K
KXavbnXx3dKqoN27PHi3zb9SxxBxNEcjClonOCZ5/Zwe7BXb8bP5mMBQcX3db31y
VQc9xmtEjNhmCKAaFFoPXUlqTrnRCYyilTpQmDH6yU1ELCzkOk7HniMGmbgQNdgP
i7l6urmnb6ciyWJW5xIc1T+4kFkKpat9l15AybZmH3Ug26Yv7uw3h3BTKwDH6gFS
itb4iCZP4sVUSzBYZggQMUOz7uQXjAnN+URgKk+NyrmCXyfasZC+pw+HUoRbF0aj
YFq0VCu/AgMBAAECggEASt+jLP0sApui6HiX5vJzc5dBpdi2sH7KnMEF8qELYkGN
OqpDpX3x3ao1pHpXl0gn7YVD0NymlmW9rUmP6NjX5XdBiO+oQXFv4NqDOUr725mn
ZVr+dQv41hsfWMGRCvq6fYDZ4iPSdzqg2yqqgKPSt4h798E1RU/MLinQ16akRXr7
X0cjpJLWbIRXRuxOvJaV85jLO5qnApncNrxIjDF+p9J2jk4jCmizWgfcthpNMmdf
nX1qFbdBzfuc+qtfRoAh92IiqsLWZLNbE01Joq6uj4DKzJXN3w4S3/Ym7Ef23i+L
+oYgYiRqYLmZZK/eHBFEFSnn9ErIknNWJ3nyNY+5oQKBgQDdHxdZEYPfyPgRBKoq
51Nb0Oin/thbv4XjE8p2Pxv9NXqLcK69T9ldL9gw8uv9cLe74Lzbwl7UONJsq92l
ha98zc7IkeUQoYgDKmPf6Jb4OhH43dFouW/DawduAg8y0xaTEx2F9/QdTjlxXtA0
jvYWm73MhrLtGJEekvXiGfuGuwKBgQDNJjWibFFYJ3AYdcI5OZusy8B5U1u4apBj
d/8+pKf9xf+f/x+M4DEdlfL5at6kVLN0bi10rAlD+QmhovPtMnsdGp/AAR7g4diV
e+eJ8J5f1nDkmMkvq2yUnDSIIQpfhpcq+ry6q3e3gdUnd01mMAqb6Xc17ca0rt74
9wLOP7tYzQKBgGZYw7fIMZ/dJ2TJIfJly+GNmoJXpNEintfyCx4cK9pRbH0qFNcv
JE7LnGdbqPtPtttRNFkLaFUWT99Y1WiNriI4KGQRk1LVUV0Vu9ChmW8fgb4M/aZZ
Xm+3FGNItLwzlBlTGbEuiWEfGdttpTUOjrz8LSeDmUHAwzrBjumuWQuNAoGABB9h
cosks1XPjd5H8ehzdWx+yLFhJXqWvjj6GyMp8RKaiXeSBb23nvWVdWetY7YECTHx
neebJA+MHwBsUHb0PGh9j1k2aqR/OrnLtFzugdSIXj+nw1p5ix78e0PWtoa44Pc6
9bFebYShaPKfzo7ml62AZMgLdzQQbQZhuw1S0X0CgYEAosd3pMoJRCEoYXul3Hal
w7Mct1F+STQ8BC2o9EEdpkiShLxOQ0UHdAMt6HI0OBn1aUSvfxO7gAEOSQ461eZ3
2f2HR8/dkA7yU9SJstXMJzNZGBBUhWPq9xHGhFopk1XHBC166x3Y9sQHmtZfyL/P
FTODCIQM+GpS/GXMT/F4XXQ=
-----END PRIVATE KEY-----
`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function listCollections() {
  console.log('Conectando ao Firestore...\n');

  const collections = await db.listCollections();

  console.log('Coleções no Firestore (PROD):');
  console.log('='.repeat(50));

  for (const col of collections) {
    // Contar documentos (limitado a 100 para performance)
    const snapshot = await col.limit(100).get();
    const docCount = snapshot.size;
    const hasMore = docCount === 100 ? '+' : '';
    console.log(`  - ${col.id.padEnd(25)} (${docCount}${hasMore} docs)`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${collections.length} coleções`);
}

listCollections()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erro:', err.message);
    process.exit(1);
  });
