// scripts/app.js - VERSION TEST SANS IMPORTS
console.log('🚀 APP.JS CHARGÉ !');

// AUCUN IMPORT POUR TESTER
// On va juste afficher un message

class HybridMasterApp {
  constructor() {
    console.log('✅ HybridMasterApp créé');
  }

  init() {
    console.log('🔧 Init app...');
    
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: sans-serif;">
          <h1 style="color: #4CAF50; font-size: 32px;">✅ ÇA MARCHE !</h1>
          <p style="font-size: 18px; color: #666;">app.js est chargé et s'exécute correctement</p>
          <p style="font-size: 14px; color: #999;">Maintenant on peut ajouter les imports progressivement</p>
        </div>
      `;
      console.log('✅ HTML injecté avec succès');
    } else {
      console.error('❌ Container #app introuvable');
    }
  }
}

// Démarrage
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM ready');
  const app = new HybridMasterApp();
  app.init();
});

console.log('📄 Fin du script app.js');
