// ==================================================================
// SUPERSET INJECTOR - LECTURE DIRECTE DES DONNÉES
// ==================================================================

console.log('🔥 Superset Injector chargé');

let hasRun = false;

function enhanceSupersets() {
    if (hasRun) {
        console.log('⏸️ Déjà exécuté, ignoré');
        return;
    }
    
    const exercises = document.querySelectorAll('.exercise-block-modern');
    if (exercises.length === 0) {
        console.log('⏳ Pas d\'exercices encore, attente...');
        return;
    }
    
    hasRun = true;
    console.log('🎨 Détection des supersets...');
    console.log(`📊 ${exercises.length} exercices trouvés`);
    
    // Lire les données directement depuis le HTML (l'ordre est le même)
    // workout-renderer affiche les exercices dans l'ordre exact de workout.exercises
    const exerciseNames = [];
    exercises.forEach(ex => {
        const nameElement = ex.querySelector('h3');
        if (nameElement) {
            exerciseNames.push(nameElement.textContent.trim());
        }
    });
    
    console.log(`📋 Exercices trouvés: ${exerciseNames.join(', ')}`);
    
    // Identifier les paires en cherchant les exercices consécutifs qui ont "SUPERSET" dans leurs notes
    const dataExercises = [];
    exercises.forEach((ex, index) => {
        const notes = ex.querySelector('.exercise-notes')?.textContent || '';
        const name = ex.querySelector('h3')?.textContent.trim() || '';
        const isSuperset = notes.includes('SUPERSET');
        
        dataExercises.push({
            index,
            name,
            isSuperset,
            element: ex
        });
    });
    
    console.log(`📊 ${dataExercises.length} exercices analysés`);
    
    // Identifier les paires de supersets consécutifs
    const supersetPairs = [];
    
    for (let i = 0; i < dataExercises.length - 1; i++) {
        const current = dataExercises[i];
        const next = dataExercises[i + 1];
        
        // Si deux exercices consécutifs ont "SUPERSET" dans leurs notes
        if (current.isSuperset && next.isSuperset) {
            // Lire le temps de repos depuis l'exercice
            const restElement = current.element.querySelector('.exercise-info span');
            const restMatch = restElement?.textContent.match(/(\d+)s/);
            const rest = restMatch ? parseInt(restMatch[1]) : 90;
            
            supersetPairs.push({
                first: i,
                second: i + 1,
                firstName: current.name,
                secondName: next.name,
                rest: rest
            });
            
            console.log(`✅ Superset détecté: ${current.name} + ${next.name}`);
            i++; // Sauter le prochain car déjà traité
        }
    }
    
    if (supersetPairs.length === 0) {
        console.log('ℹ️ Aucun superset trouvé pour ce jour');
        return;
    }
    
    // Appliquer les styles aux exercices HTML
    supersetPairs.forEach(pair => {
        const firstBlock = dataExercises[pair.first].element;
        const secondBlock = dataExercises[pair.second].element;
        
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
            
            console.log(`✨ Styles appliqués: ${pair.firstName} + ${pair.secondName}`);
        }
    });
    
    console.log(`✅ ${supersetPairs.length} supersets créés`);
    console.log('✅ Traitement terminé - Pas de boucle !');
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
