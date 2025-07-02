import fetch from 'node-fetch';

async function testAuth() {
  try {
    console.log('🧪 Test de l\'endpoint d\'authentification...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@simplon.sn',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📋 Response:', data);
    
    if (response.ok) {
      console.log('✅ Authentification réussie !');
    } else {
      console.log('❌ Erreur d\'authentification');
    }
  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
  }
}

testAuth();