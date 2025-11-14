// ==================================================================
// SUPERSET INJECTOR - DÉTECTE supersetWith DANS LES DONNÉES
// ==================================================================

console.log('🔥 Superset Injector chargé');

let hasRun = false;

function enhanceSupersets() {
    if (hasRun) {
        console.log('⏸️ Déjà exécuté, ignoré');
        return;
    }
    
    const exercisesContainer = document.querySelector('.exercises-container');
    if (!exercisesContainer) {
        console.log('⏳ Container non trouvé, attente...');
        return;
    }
    
    const exercises = exercisesContainer.querySelectorAll('.exercise-block-modern');
    if (exercises.length === 0) {
        console.log('⏳ Pas d\'exercices encore, attente...');
        return;
    }
    
    hasRun = true;
    console.log('🎨 Détection des supersets...');
    console.log(`📊 ${exercises.length} exercices trouvés`);
    
    // Récupérer les données de program-data.js
    const currentWeek = parseInt(localStorage.getItem('currentWeek') || '1');
    const currentDay = document.querySelector('.workout-title h2')?.textContent.trim();
    
    console.log(`📅 Jour: ${currentDay}, Semaine: ${currentWeek}`);
    
    // Accéder aux données du programme
    if (!window.programData) {
        console.log('❌ programData non disponible');
        return;
    }
    
    // Trouver le workout actuel
    let currentWorkout = null;
    for (const block of window.programData.blocks) {
        for (const workout of block.workouts) {
            if (workout.day === currentDay) {
                currentWorkout = workout;
                break;
            }
        }
        if (currentWorkout) break;
    }
    
    if (!currentWorkout) {
        console.log('❌ Workout non trouvé');
        return;
    }
    
    console.log(`✅ Workout trouvé: ${currentWorkout.day}`);
    
    // Identifier les paires de supersets
    const supersetPairs = [];
    const processedIndices = new Set();
    
    currentWorkout.exercises.forEach((exercise, index) => {
        if (processedIndices.has(index)) return;
        
        if (exercise.supersetWith) {
            // Trouver le partenaire
            const partnerIndex = currentWorkout.exercises.findIndex((ex, idx) => 
                idx > index && ex.name === exercise.supersetWith
            );
            
            if (partnerIndex !== -1) {
                supersetPairs.push({
                    firstIndex: index,
                    secondIndex: partnerIndex,
                    firstName: exercise.name,
                    secondName: currentWorkout.exercises[partnerIndex].name,
                    rest: exercise.rest || 75
                });
                
                processedIndices.add(index);
                processedIndices.add(partnerIndex);
                
                console.log(`✅ Superset: ${exercise.name} + ${exercise.supersetWith}`);
            }
        }
    });
    
    if (supersetPairs.length === 0) {
        console.log('ℹ️ Aucun superset pour ce jour');
        return;
    }
    
    // Appliquer les transformations visuelles
    supersetPairs.forEach(pair => {
        const firstBlock = exercises[pair.firstIndex];
        const secondBlock = exercises[pair.secondIndex];
        
        if (!firstBlock || !secondBlock) {
            console.log(`❌ Blocs non trouvés pour ${pair.firstName}`);
            return;
        }
        
        // Créer le container superset
        const supersetContainer = document.createElement('div');
        supersetContainer.className = 'superset-container';
        
        // Badge SUPERSET
        const badge = document.createElement('div');
        badge.className = 'superset-badge';
        badge.textContent = 'SUPERSET';
        supersetContainer.appendChild(badge);
        
        // Marquer les exercices
        firstBlock.classList.add('is-superset-first');
        secondBlock.classList.add('is-superset-second');
        
        // Ajouter les spec-items aux exercices du superset
        enhanceExerciseSpecs(firstBlock, currentWorkout.exercises[pair.firstIndex]);
        enhanceExerciseSpecs(secondBlock, currentWorkout.exercises[pair.secondIndex]);
        
        // Insérer le premier exercice dans le container
        firstBlock.parentNode.insertBefore(supersetContainer, firstBlock);
        supersetContainer.appendChild(firstBlock);
        
        // Créer le connecteur
        const connector = document.createElement('div');
        connector.className = 'superset-connector';
        connector.innerHTML = '<div class="connector-icon">+</div>';
        supersetContainer.appendChild(connector);
        
        // Ajouter le deuxième exercice
        supersetContainer.appendChild(secondBlock);
        
        // Info repos
        const restInfo = document.createElement('div');
        restInfo.className = 'superset-rest-info';
        restInfo.innerHTML = `
            <span class="rest-icon">⏱️</span>
            <span class="rest-text">Repos après le duo</span>
            <span class="rest-time">${pair.rest}s</span>
        `;
        supersetContainer.appendChild(restInfo);
        
        console.log(`✨ Superset créé: ${pair.firstName} + ${pair.secondName}`);
    });
    
    console.log(`✅ ${supersetPairs.length} supersets créés`);
}

function enhanceExerciseSpecs(exerciseBlock, exerciseData) {
    const specsDiv = exerciseBlock.querySelector('.exercise-specs-modern');
    if (!specsDiv) return;
    
    // Sauvegarder les infos actuelles
    const sets = exerciseData.sets;
    const reps = exerciseData.reps;
    const weight = exerciseData.weight;
    const tempo = exerciseData.tempo;
    const rpe = exerciseData.rpe;
    
    // Remplacer par le format grille
    specsDiv.innerHTML = `
        <div class="spec-item">
            <span class="spec-label">Séries</span>
            <span class="spec-value">${sets}</span>
        </div>
        <div class="spec-item">
            <span class="spec-label">Reps</span>
            <span class="spec-value">${reps}</span>
        </div>
        <div class="spec-item">
            <span class="spec-label">Poids</span>
            <span class="spec-value">${weight}kg</span>
        </div>
        ${tempo ? `
        <div class="spec-item">
            <span class="spec-label">Tempo</span>
            <span class="spec-value">${tempo}</span>
        </div>
        ` : ''}
        ${rpe ? `
        <div class="spec-item">
            <span class="spec-label">RPE</span>
            <span class="spec-value">${rpe}</span>
        </div>
        ` : ''}
    `;
}

// Attendre que les exercices apparaissent
function waitForExercises() {
    console.log('✅ Script initialisé - En attente des exercices...');
    
    let attempts = 0;
    const maxAttempts = 50;
    
    const interval = setInterval(() => {
        attempts++;
        
        const exercises = document.querySelectorAll('.exercise-block-modern');
        if (exercises.length > 0 && window.programData) {
            console.log('🎯 Exercices et données détectés');
            clearInterval(interval);
            setTimeout(enhanceSupersets, 100);
        } else if (attempts >= maxAttempts) {
            console.log('⏱️ Timeout');
            clearInterval(interval);
        }
    }, 100);
}

// Lancer au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForExercises);
} else {
    waitForExercises();
}
