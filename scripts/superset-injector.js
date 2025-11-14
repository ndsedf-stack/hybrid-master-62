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
    
    // Récupérer les données du programme
    const programData = window.programData;
    if (!programData) {
        console.log('❌ programData non trouvé dans window');
        return;
    }
    
    // Trouver le jour actuel (depuis le titre ou l'URL)
    const titleElement = document.querySelector('.workout-title');
    if (!titleElement) {
        console.log('❌ Titre du workout non trouvé');
        return;
    }
    
    const dayMatch = titleElement.textContent.match(/(Dimanche|Mardi|Vendredi|Maison)/i);
    if (!dayMatch) {
        console.log('❌ Jour non détecté dans le titre');
        return;
    }
    
    const currentDay = dayMatch[1].toLowerCase();
    console.log(`📅 Jour détecté: ${currentDay}`);
    
    // Récupérer les exercices du jour depuis programData
    let workoutData;
    try {
        // Essayer de trouver le workout dans programData
        const allWeeks = programData.program || programData;
        const firstWeek = allWeeks['1'] || allWeeks.week1;
        workoutData = firstWeek[currentDay];
        
        if (!workoutData) {
            console.log('❌ Données du workout non trouvées');
            return;
        }
    } catch (e) {
        console.log('❌ Erreur lecture programData:', e);
        return;
    }
    
    const dataExercises = workoutData.exercises || [];
    console.log(`📋 ${dataExercises.length} exercices dans les données`);
    
    // Identifier les paires de supersets
    const supersetPairs = [];
    const processed = new Set();
    
    dataExercises.forEach((ex, index) => {
        if (ex.isSuperset && !processed.has(index)) {
            // Trouver son partenaire
            const partnerIndex = dataExercises.findIndex((partner, pIndex) => 
                pIndex !== index && 
                partner.isSuperset && 
                (partner.supersetWith === ex.name || ex.supersetWith === partner.name)
            );
            
            if (partnerIndex !== -1) {
                supersetPairs.push({
                    first: index,
                    second: partnerIndex,
                    firstName: ex.name,
                    secondName: dataExercises[partnerIndex].name,
                    rest: ex.rest || 90
                });
                processed.add(index);
                processed.add(partnerIndex);
                console.log(`✅ Superset détecté: ${ex.name} + ${dataExercises[partnerIndex].name}`);
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
