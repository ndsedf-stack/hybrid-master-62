// ==================================================================
// SUPERSET INJECTOR - DÉTECTION VIA supersetWith
// ==================================================================
console.log('🔥 Superset Injector chargé');

let hasRun = false;

function enhanceSupersets() {
    if (hasRun) {
        console.log('⏸️ Déjà exécuté, ignoré');
        return;
    }
    
    // ✅ ATTENDRE QUE programData SOIT DISPONIBLE
    if (!window.programData) {
        console.log('⏳ programData pas encore chargé, on réessaie dans 100ms...');
        setTimeout(enhanceSupersets, 100);
        return;
    }
    
    const exercises = document.querySelectorAll('.exercise-block-modern');
    if (exercises.length === 0) {
        console.log('⏳ Pas d\'exercices encore, attente...');
        setTimeout(enhanceSupersets, 100);
        return;
    }
    
    hasRun = true;
    console.log('🎨 Détection des supersets avec programData...');
    console.log(`📊 ${exercises.length} exercices trouvés`);
    
    // Récupérer les données du jour actuel
    const dayTitle = document.querySelector('.workout-day-title');
    if (!dayTitle) {
        console.log('❌ Titre du jour non trouvé');
        return;
    }
    
    const dayText = dayTitle.textContent.toLowerCase();
    let dayKey = null;
    
    if (dayText.includes('dimanche')) dayKey = 'dimanche';
    else if (dayText.includes('mardi')) dayKey = 'mardi';
    else if (dayText.includes('vendredi')) dayKey = 'vendredi';
    else if (dayText.includes('maison')) dayKey = 'maison';
    
    if (!dayKey) {
        console.log('❌ Jour non reconnu:', dayText);
        return;
    }
    
    console.log(`📅 Jour détecté: ${dayKey}`);
    
    // Trouver le workout correspondant
    let dayWorkout = null;
    for (const block of window.programData.blocks) {
        for (const week of block.weeks) {
            for (const day of week.days) {
                if (day.day === dayKey) {
                    dayWorkout = day;
                    break;
                }
            }
            if (dayWorkout) break;
        }
        if (dayWorkout) break;
    }
    
    if (!dayWorkout || !dayWorkout.exercises) {
        console.log('❌ Workout non trouvé pour ce jour');
        return;
    }
    
    console.log(`✅ Workout trouvé avec ${dayWorkout.exercises.length} exercices`);
    
    // Identifier les paires de supersets
    const supersetPairs = [];
    const processedIndices = new Set();
    
    dayWorkout.exercises.forEach((exercise, index) => {
        if (processedIndices.has(index)) return;
        
        if (exercise.supersetWith) {
            // Trouver l'exercice jumelé
            const partnerIndex = dayWorkout.exercises.findIndex((ex, idx) => 
                idx > index && ex.name === exercise.supersetWith
            );
            
            if (partnerIndex !== -1) {
                const partner = dayWorkout.exercises[partnerIndex];
                supersetPairs.push({
                    first: index,
                    second: partnerIndex,
                    firstName: exercise.name,
                    secondName: partner.name,
                    rest: exercise.rest || 90
                });
                
                processedIndices.add(index);
                processedIndices.add(partnerIndex);
                
                console.log(`✅ Superset: ${exercise.name} + ${partner.name}`);
            }
        }
    });
    
    if (supersetPairs.length === 0) {
        console.log('ℹ️ Aucun superset trouvé pour ce jour');
        return;
    }
    
    // Appliquer les styles aux exercices HTML
    supersetPairs.forEach(pair => {
        const firstBlock = exercises[pair.first];
        const secondBlock = exercises[pair.second];
        
        if (firstBlock && secondBlock) {
            // Marquer les blocs
            firstBlock.classList.add('is-superset-first');
            secondBlock.classList.add('is-superset-second');
            
            // Ajouter badge "SUPERSET" au premier exercice
            const header = firstBlock.querySelector('.exercise-header');
            if (header && !header.querySelector('.superset-badge')) {
                const badge = document.createElement('div');
                badge.className = 'superset-badge';
                badge.textContent = 'SUPERSET';
                header.style.position = 'relative';
                header.appendChild(badge);
            }
            
            // Créer le connecteur entre les deux exercices
            const connector = document.createElement('div');
            connector.className = 'superset-connector';
            connector.innerHTML = `
                <div class="connector-icon">+</div>
            `;
            
            // Insérer le connecteur entre les deux blocs
            secondBlock.parentNode.insertBefore(connector, secondBlock);
            
            // Ajouter l'info de repos après le deuxième exercice
            const restInfo = document.createElement('div');
            restInfo.className = 'superset-rest-info';
            restInfo.innerHTML = `
                <span class="rest-icon">⏱️</span>
                <span class="rest-text">Repos après le duo</span>
                <span class="rest-time">${pair.rest}s</span>
            `;
            secondBlock.appendChild(restInfo);
            
            console.log(`✨ Superset créé: ${pair.firstName} + ${pair.secondName}`);
        }
    });
    
    console.log(`✅ ${supersetPairs.length} supersets créés`);
}

// Attendre que les exercices apparaissent
function waitForExercises() {
    console.log('✅ Script initialisé - En attente des exercices...');
    
    // Essayer toutes les 100ms pendant 5 secondes
    let attempts = 0;
    const maxAttempts = 50;
    
    const interval = setInterval(() => {
        attempts++;
        
        const exercises = document.querySelectorAll('.exercise-block-modern');
        if (exercises.length > 0) {
            console.log('🎯 Exercices détectés, lancement du traitement...');
            clearInterval(interval);
            enhanceSupersets();
        } else if (attempts >= maxAttempts) {
            console.log('⏱️ Timeout - Exercices non trouvés');
            clearInterval(interval);
        }
    }, 100);
}

// Lancer au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForExercises);
} else {
    waitForExercises();
}
