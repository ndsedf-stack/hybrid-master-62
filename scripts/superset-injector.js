// ==================================================================
// SUPERSET INJECTOR - VERSION SANS OBSERVER (UNE SEULE EXÉCUTION)
// ==================================================================

console.log('🔥 Superset Injector chargé');

let hasRun = false;

function enhanceSupersets() {
    // Exécuter UNE SEULE FOIS
    if (hasRun) {
        console.log('⏸️ Déjà exécuté, ignoré');
        return;
    }
    
    hasRun = true;
    console.log('🎨 Détection des supersets...');
    
    const exercises = document.querySelectorAll('.exercise-block-modern');
    console.log(`📊 ${exercises.length} exercices trouvés`);
    
    if (exercises.length === 0) {
        console.log('⚠️ Aucun exercice trouvé');
        hasRun = false; // Permettre de réessayer plus tard
        return;
    }
    
    let supersetCount = 0;
    const processedIndices = new Set();
    
    exercises.forEach((exercise, index) => {
        // Si déjà traité comme second exercice, on saute
        if (processedIndices.has(index)) return;
        
        const nextExercise = exercises[index + 1];
        if (!nextExercise) return;
        
        const currentRest = exercise.querySelector('.exercise-rest')?.textContent || '';
        const nextRest = nextExercise.querySelector('.exercise-rest')?.textContent || '';
        
        // Détecter si c'est un superset (repos = 0s)
        if (currentRest.includes('0s')) {
            const exerciseName = exercise.querySelector('h3')?.textContent || '';
            const nextName = nextExercise.querySelector('h3')?.textContent || '';
            
            console.log(`✅ Superset détecté: ${exerciseName} + ${nextName}`);
            
            // Marquer les indices comme traités
            processedIndices.add(index);
            processedIndices.add(index + 1);
            
            // Ajouter les classes superset
            exercise.classList.add('is-superset-first');
            nextExercise.classList.add('is-superset-second');
            
            // Badge SUPERSET sur les deux
            if (!exercise.querySelector('.superset-badge')) {
                const badge1 = document.createElement('div');
                badge1.className = 'superset-badge';
                badge1.textContent = 'SUPERSET';
                exercise.querySelector('.exercise-header').appendChild(badge1);
            }
            
            if (!nextExercise.querySelector('.superset-badge')) {
                const badge2 = document.createElement('div');
                badge2.className = 'superset-badge';
                badge2.textContent = 'SUPERSET';
                nextExercise.querySelector('.exercise-header').appendChild(badge2);
            }
            
            // Créer le connecteur entre les deux exercices
            if (!exercise.nextElementSibling?.classList.contains('superset-connector')) {
                const connector = document.createElement('div');
                connector.className = 'superset-connector';
                connector.innerHTML = `
                    <div class="connector-line"></div>
                    <div class="connector-icon">+</div>
                    <div class="connector-line"></div>
                `;
                exercise.parentNode.insertBefore(connector, nextExercise);
            }
            
            // Ajouter l'info de repos après le duo
            const finalRest = nextRest.replace('Repos : ', '');
            if (!nextExercise.querySelector('.superset-rest-info')) {
                const restInfo = document.createElement('div');
                restInfo.className = 'superset-rest-info';
                restInfo.innerHTML = `
                    <div class="rest-icon">⏱️</div>
                    <div class="rest-text">REPOS APRÈS LE DUO</div>
                    <div class="rest-time">${finalRest}</div>
                `;
                nextExercise.appendChild(restInfo);
            }
            
            supersetCount++;
        }
    });
    
    console.log(`✅ ${supersetCount} supersets créés`);
    console.log('✅ Traitement terminé - Pas de boucle !');
}

// Attendre que les exercices soient chargés, puis exécuter UNE fois
function waitForExercisesAndEnhance() {
    const checkInterval = setInterval(() => {
        const exercises = document.querySelectorAll('.exercise-block-modern');
        if (exercises.length > 0) {
            clearInterval(checkInterval);
            console.log('🎯 Exercices détectés, lancement du traitement...');
            enhanceSupersets();
        }
    }, 200);
    
    // Timeout après 5 secondes
    setTimeout(() => {
        clearInterval(checkInterval);
        if (!hasRun) {
            console.log('⏱️ Timeout - Lancement forcé');
            enhanceSupersets();
        }
    }, 5000);
}

// Initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForExercisesAndEnhance);
} else {
    waitForExercisesAndEnhance();
}

// Exposer pour forcer manuellement si besoin
window.enhanceSupersets = () => {
    hasRun = false;
    enhanceSupersets();
};

console.log('✅ Script initialisé - En attente des exercices...');
