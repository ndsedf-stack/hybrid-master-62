// ==================================================================
// SUPERSET INJECTOR - VERSION CORRIGÉE (SANS BOUCLE INFINIE)
// ==================================================================

console.log('🔥 Superset Injector chargé');

let isProcessing = false;
let processedExercises = new Set();

function enhanceSupersets() {
    // Éviter les appels multiples simultanés
    if (isProcessing) {
        console.log('⏸️ Traitement déjà en cours, ignoré');
        return;
    }
    
    isProcessing = true;
    console.log('🎨 Détection des supersets...');
    
    const exercises = document.querySelectorAll('.exercise-block-modern');
    console.log(`📊 ${exercises.length} exercices trouvés`);
    
    if (exercises.length === 0) {
        isProcessing = false;
        return;
    }
    
    let supersetCount = 0;
    
    exercises.forEach((exercise, index) => {
        // Vérifier si déjà traité
        const exerciseName = exercise.querySelector('h3')?.textContent || '';
        const exerciseId = `${exerciseName}-${index}`;
        
        if (processedExercises.has(exerciseId)) {
            return; // Déjà traité, on saute
        }
        
        const nextExercise = exercises[index + 1];
        if (!nextExercise) return;
        
        const currentRest = exercise.querySelector('.exercise-rest')?.textContent || '';
        const nextRest = nextExercise.querySelector('.exercise-rest')?.textContent || '';
        
        // Détecter si c'est un superset (repos = 0s)
        if (currentRest.includes('0s') && index < exercises.length - 1) {
            const nextName = nextExercise.querySelector('h3')?.textContent || '';
            
            console.log(`✅ Superset détecté: ${exerciseName} + ${nextName}`);
            
            // Marquer comme traité
            processedExercises.add(exerciseId);
            processedExercises.add(`${nextName}-${index + 1}`);
            
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
    isProcessing = false;
}

// Observer pour détecter les changements de DOM (une seule fois)
let observer = null;

function startObserver() {
    if (observer) return; // Déjà créé
    
    observer = new MutationObserver((mutations) => {
        const hasExerciseChanges = mutations.some(mutation => 
            Array.from(mutation.addedNodes).some(node => 
                node.classList && node.classList.contains('exercise-block-modern')
            )
        );
        
        if (hasExerciseChanges) {
            console.log('🔄 Nouveaux exercices détectés');
            setTimeout(enhanceSupersets, 100); // Petit délai pour éviter les appels multiples
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialisation au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            enhanceSupersets();
            startObserver();
        }, 500);
    });
} else {
    setTimeout(() => {
        enhanceSupersets();
        startObserver();
    }, 500);
}

// Exposer la fonction pour debug manuel
window.enhanceSupersets = enhanceSupersets;
