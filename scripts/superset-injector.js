// ═══════════════════════════════════════════════════════════
// 🔥 SUPERSET INJECTOR - Injection automatique
// Fichier: scripts/superset-injector.js
// ═══════════════════════════════════════════════════════════

(function() {
    'use strict';
    
    console.log('🔥 Superset Injector chargé');
    
    // ═════════════════════════════════════════════════════════
    // FONCTION : Détecter et marquer les supersets
    // ═════════════════════════════════════════════════════════
    
    function enhanceSupersets() {
        console.log('🎨 Détection des supersets...');
        
        // Trouver tous les blocs d'exercices
        const exerciseBlocks = document.querySelectorAll('.exercise-block-modern');
        
        if (exerciseBlocks.length === 0) {
            console.log('⚠️ Aucun exercice trouvé');
            return;
        }
        
        console.log(`📊 ${exerciseBlocks.length} exercices trouvés`);
        
        // Grouper les exercices consécutifs qui ont isSuperset
        const processedIndices = new Set();
        
        exerciseBlocks.forEach((block, index) => {
            if (processedIndices.has(index)) return;
            
            const exerciseName = block.dataset.exercise;
            if (!exerciseName) return;
            
            // Vérifier si c'est un superset dans les données
            const isSuperset = checkIfSuperset(exerciseName, index);
            
            if (isSuperset) {
                // Trouver le bloc suivant
                const nextBlock = exerciseBlocks[index + 1];
                
                if (nextBlock) {
                    console.log(`✅ Superset détecté: ${exerciseName} + ${nextBlock.dataset.exercise}`);
                    
                    // Marquer le premier bloc comme superset
                    block.setAttribute('data-superset', 'true');
                    block.setAttribute('data-rest', '90'); // Repos par défaut
                    
                    // Créer le diviseur +
                    const divider = document.createElement('div');
                    divider.className = 'superset-divider';
                    divider.innerHTML = '<div class="superset-plus">+</div>';
                    
                    // Insérer le diviseur entre les deux blocs
                    nextBlock.parentNode.insertBefore(divider, nextBlock);
                    
                    // Englober les deux blocs + divider dans un conteneur
                    const wrapper = document.createElement('div');
                    wrapper.setAttribute('data-superset', 'true');
                    wrapper.setAttribute('data-rest', '90');
                    
                    // Déplacer le premier bloc dans le wrapper
                    block.parentNode.insertBefore(wrapper, block);
                    wrapper.appendChild(block);
                    wrapper.appendChild(divider);
                    wrapper.appendChild(nextBlock);
                    
                    // Ajouter l'info repos
                    const restInfo = document.createElement('div');
                    restInfo.className = 'superset-rest-info';
                    restInfo.innerHTML = `
                        <div class="superset-rest-text">REPOS APRÈS LE DUO</div>
                        <div class="superset-rest-duration">90s</div>
                        <div class="superset-rest-subtitle">Récupération complète</div>
                    `;
                    wrapper.appendChild(restInfo);
                    
                    // Marquer comme traité
                    processedIndices.add(index);
                    processedIndices.add(index + 1);
                }
            }
        });
        
        console.log(`✅ ${processedIndices.size / 2} supersets créés`);
    }
    
    // ═════════════════════════════════════════════════════════
    // FONCTION : Vérifier si un exercice est un superset
    // ═════════════════════════════════════════════════════════
    
    function checkIfSuperset(exerciseName, index) {
        // Liste des exercices qui sont des supersets
        const supersetExercises = [
            'Lat Pulldown',
            'Landmine Press',
            'Incline Curl',
            'Spider Curl',
            'Cable Pushdown',
            'Extension Triceps Corde',
            'Lateral Raises',
            'Leg Curl',
            'Leg Extension',
            'Cable Fly',
            'Dumbbell Fly',
            'EZ Bar Curl',
            'Overhead Extension'
        ];
        
        return supersetExercises.some(name => 
            exerciseName.includes(name) || name.includes(exerciseName)
        );
    }
    
    // ═════════════════════════════════════════════════════════
    // FONCTION : Gérer les interactions superset
    // ═════════════════════════════════════════════════════════
    
    function attachSupersetListeners() {
        const supersetWrappers = document.querySelectorAll('[data-superset="true"]');
        
        supersetWrappers.forEach(wrapper => {
            const blocks = wrapper.querySelectorAll('.exercise-block-modern');
            
            if (blocks.length !== 2) return;
            
            const [block1, block2] = blocks;
            
            // Récupérer les grilles de séries
            const grid1 = block1.querySelector('.series-grid-modern');
            const grid2 = block2.querySelector('.series-grid-modern');
            
            if (!grid1 || !grid2) return;
            
            // Récupérer les checkboxes
            const checkboxes1 = grid1.querySelectorAll('input[type="checkbox"]');
            const checkboxes2 = grid2.querySelectorAll('input[type="checkbox"]');
            
            // Écouter les changements sur exercice 2
            checkboxes2.forEach((checkbox, index) => {
                checkbox.addEventListener('change', function(e) {
                    if (this.checked) {
                        // Vérifier que l'exercice 1 de la même série est coché
                        const checkbox1 = checkboxes1[index];
                        
                        if (!checkbox1 || !checkbox1.checked) {
                            alert('⚠️ Faites d\'abord l\'exercice 1 de cette série !');
                            this.checked = false;
                            return;
                        }
                        
                        console.log(`✅ Superset série ${index + 1} terminée !`);
                        
                        // Timer automatique (si le TimerManager existe)
                        if (window.app && window.app.timerManager) {
                            const restTime = parseInt(wrapper.dataset.rest) || 90;
                            const setNumber = index + 1;
                            const totalSets = checkboxes1.length;
                            const ex1Name = block1.querySelector('.exercise-title-modern h2').textContent;
                            const ex2Name = block2.querySelector('.exercise-title-modern h2').textContent;
                            
                            if (setNumber < totalSets) {
                                window.app.timerManager.start(
                                    restTime,
                                    `${ex1Name} + ${ex2Name}`,
                                    setNumber + 1,
                                    totalSets
                                );
                            }
                        }
                    }
                });
            });
        });
        
        console.log(`✅ Listeners attachés à ${supersetWrappers.length} supersets`);
    }
    
    // ═════════════════════════════════════════════════════════
    // INITIALISATION
    // ═════════════════════════════════════════════════════════
    
    function init() {
        // Attendre que la page soit chargée
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }
    
    function run() {
        // Attendre que les exercices soient rendus
        setTimeout(() => {
            enhanceSupersets();
            attachSupersetListeners();
        }, 500);
        
        // Observer les changements de DOM (navigation entre jours)
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    // Vérifier si des exercices ont été ajoutés
                    const hasExercises = Array.from(mutation.addedNodes).some(
                        node => node.querySelector && node.querySelector('.exercise-block-modern')
                    );
                    
                    if (hasExercises) {
                        console.log('🔄 Nouveaux exercices détectés, relance...');
                        setTimeout(() => {
                            enhanceSupersets();
                            attachSupersetListeners();
                        }, 300);
                    }
                }
            }
        });
        
        // Observer le conteneur principal
        const container = document.getElementById('content');
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Lancer l'injection
    init();
    
})();
