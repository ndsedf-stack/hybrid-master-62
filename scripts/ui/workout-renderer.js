// ==================================================================
// WORKOUT RENDERER - VERSION AVEC SUPERSETS ULTRA PREMIUM
// ==================================================================
export class WorkoutRenderer {
    constructor(container, onBack) {
        this.container = container;
        this.onBack = onBack;
        this.timerManager = null;
        console.log('🏋️ WorkoutRenderer initialisé');
    }

    setTimerManager(timerManager) {
        this.timerManager = timerManager;
        console.log('✅ TimerManager connecté au WorkoutRenderer');
    }

    render(dayData, weekNumber) {
        console.log('🎨 Rendu séance:', dayData.day, 'Semaine', weekNumber);

        if (!dayData || !dayData.exercises) {
            console.error('❌ Données séance invalides');
            return;
        }

        const { day, name, location, exercises, block, technique } = dayData;

        this.container.innerHTML = `
            <div class="workout-view">
                <!-- Header avec titre et semaine -->
                <div class="workout-header-modern">
                    <button id="back-to-home-btn" class="back-button-modern">
                        ← Retour
                    </button>
                    <div class="workout-info">
                        <h1 class="workout-day-title">${day || 'Séance'}</h1>
                        <p class="workout-subtitle">${name || location || 'Entraînement'}</p>
                        <div class="workout-meta">
                            <span class="meta-block">BLOCK ${block || 1}</span>
                            <span class="meta-separator">•</span>
                            <span class="meta-tempo">${technique || 'Tempo 3-1-2'}</span>
                        </div>
                    </div>
                </div>

                <!-- Liste des exercices -->
                <div class="exercises-list-modern">
                    ${this.renderExercisesList(exercises, weekNumber)}
                </div>
            </div>
        `;

        // Attacher event listener au bouton retour
        const backBtn = document.getElementById('back-to-home-btn');
        if (backBtn && this.onBack) {
            backBtn.addEventListener('click', () => {
                console.log('🏠 Clic bouton retour');
                this.onBack();
            });
        }

        // Attacher les event listeners
        this.attachCheckboxListeners(weekNumber);
        this.attachSupersetListeners(weekNumber);
    }

    // 🎯 NOUVELLE FONCTION : Détecte et groupe les supersets
    renderExercisesList(exercises, weekNumber) {
        let html = '';
        const processedIndices = new Set();

        exercises.forEach((exercise, index) => {
            // Si déjà traité dans un superset, skip
            if (processedIndices.has(index)) return;

            // Vérifier si c'est un superset
            if (exercise.isSuperset && exercise.supersetWith) {
                // Trouver le partenaire
                const partnerIndex = exercises.findIndex(
                    (ex, idx) => idx > index && ex.name === exercise.supersetWith
                );

                if (partnerIndex !== -1) {
                    // Générer HTML superset
                    html += this.renderSuperset(
                        exercise,
                        exercises[partnerIndex],
                        exercise.rest || 90,
                        weekNumber
                    );
                    processedIndices.add(index);
                    processedIndices.add(partnerIndex);
                } else {
                    // Si partenaire pas trouvé, afficher normalement
                    html += this.renderExerciseModern(exercise, index, weekNumber);
                    processedIndices.add(index);
                }
            } else {
                // Exercice normal
                html += this.renderExerciseModern(exercise, index, weekNumber);
                processedIndices.add(index);
            }
        });

        return html;
    }

    // 🔥 NOUVELLE FONCTION : Générer HTML Superset Ultra Premium
    renderSuperset(exercise1, exercise2, restTime, weekNumber) {
        return `
            <div class="superset-container">
                <div class="exercise-block-modern" data-superset="true" data-rest="${restTime}">
                    
                    <!-- Exercice 1 du superset -->
                    <div class="superset-exercise" data-superset-order="1" data-exercise="${exercise1.name}" data-exercise-id="${exercise1.id || exercise1.name}">
                        <div class="exercise-title-modern">
                            <h2>${exercise1.name}</h2>
                            ${exercise1.variation ? `<span class="variation-badge">${exercise1.variation}</span>` : ''}
                        </div>

                        ${exercise1.notes ? `
                            <div class="exercise-notes-modern">
                                <span class="notes-icon">💡</span>
                                <p>${exercise1.notes}</p>
                            </div>
                        ` : ''}

                        <div class="exercise-specs-modern">
                            <div class="spec-item">
                                <span class="spec-label">Séries:</span>
                                <span class="spec-value">${exercise1.sets}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Reps:</span>
                                <span class="spec-value">${exercise1.reps}</span>
                            </div>
                            ${exercise1.weight ? `
                                <div class="spec-item">
                                    <span class="spec-label">Poids:</span>
                                    <span class="spec-value">${exercise1.weight}kg</span>
                                </div>
                            ` : ''}
                            ${exercise1.tempo ? `
                                <div class="spec-item">
                                    <span class="spec-label">Tempo:</span>
                                    <span class="spec-value">${exercise1.tempo}</span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="series-grid-modern" data-exercise="${exercise1.name}">
                            ${this.renderSeriesGridModern(exercise1, {}, weekNumber)}
                        </div>
                    </div>

                    <!-- Diviseur + -->
                    <div class="superset-divider">
                        <div class="superset-plus">+</div>
                    </div>

                    <!-- Exercice 2 du superset -->
                    <div class="superset-exercise" data-superset-order="2" data-exercise="${exercise2.name}" data-exercise-id="${exercise2.id || exercise2.name}">
                        <div class="exercise-title-modern">
                            <h2>${exercise2.name}</h2>
                            ${exercise2.variation ? `<span class="variation-badge">${exercise2.variation}</span>` : ''}
                        </div>

                        ${exercise2.notes ? `
                            <div class="exercise-notes-modern">
                                <span class="notes-icon">💡</span>
                                <p>${exercise2.notes}</p>
                            </div>
                        ` : ''}

                        <div class="exercise-specs-modern">
                            <div class="spec-item">
                                <span class="spec-label">Séries:</span>
                                <span class="spec-value">${exercise2.sets}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Reps:</span>
                                <span class="spec-value">${exercise2.reps}</span>
                            </div>
                            ${exercise2.weight ? `
                                <div class="spec-item">
                                    <span class="spec-label">Poids:</span>
                                    <span class="spec-value">${exercise2.weight}kg</span>
                                </div>
                            ` : ''}
                            ${exercise2.tempo ? `
                                <div class="spec-item">
                                    <span class="spec-label">Tempo:</span>
                                    <span class="spec-value">${exercise2.tempo}</span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="series-grid-modern" data-exercise="${exercise2.name}">
                            ${this.renderSeriesGridModern(exercise2, {}, weekNumber)}
                        </div>
                    </div>

                    <!-- Info repos après le duo -->
                    <div class="superset-rest-info">
                        <div class="superset-rest-text">REPOS APRÈS LE DUO</div>
                        <div class="superset-rest-duration">${restTime}s</div>
                        <div class="superset-rest-subtitle">Récupération ${restTime > 75 ? 'complète' : 'modérée'}</div>
                    </div>

                </div>
            </div>
        `;
    }

    renderExerciseModern(exercise, index, weekNumber) {
        const storageKey = `workout_${weekNumber}_${exercise.name}`;
        const savedState = this.loadExerciseState(storageKey);

        return `
            <div class="exercise-block-modern" data-exercise="${exercise.name}" data-exercise-id="${exercise.id || exercise.name}">
                <!-- Titre de l'exercice -->
                <div class="exercise-title-modern">
                    <h2>${exercise.name}</h2>
                    ${exercise.variation ? `<span class="variation-badge">${exercise.variation}</span>` : ''}
                </div>

                <!-- Notes (si présentes) -->
                ${exercise.notes ? `
                    <div class="exercise-notes-modern">
                        <span class="notes-icon">💡</span>
                        <p>${exercise.notes}</p>
                    </div>
                ` : ''}

                <!-- Infos de l'exercice (en ligne) -->
                <div class="exercise-specs-modern">
                    <div class="spec-item">
                        <span class="spec-label">Séries:</span>
                        <span class="spec-value">${exercise.sets}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Reps:</span>
                        <span class="spec-value">${exercise.reps}</span>
                    </div>
                    ${exercise.weight ? `
                        <div class="spec-item">
                            <span class="spec-label">Poids:</span>
                            <span class="spec-value">${exercise.weight}kg</span>
                        </div>
                    ` : ''}
                    ${exercise.tempo ? `
                        <div class="spec-item">
                            <span class="spec-label">Tempo:</span>
                            <span class="spec-value">${exercise.tempo}</span>
                        </div>
                    ` : ''}
                    ${exercise.rpe ? `
                        <div class="spec-item">
                            <span class="spec-label">RPE:</span>
                            <span class="spec-value">${exercise.rpe}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- Grille de séries (style moderne) -->
                <div class="series-grid-modern" data-exercise="${exercise.name}">
                    ${this.renderSeriesGridModern(exercise, savedState, weekNumber)}
                </div>
            </div>
        `;
    }

    renderSeriesGridModern(exercise, savedState = {}, weekNumber) {
        const setCount = parseInt(exercise.sets) || 4;
        const reps = exercise.reps || '10';
        const weight = exercise.weight || '';
        const rest = exercise.rest || 120;
        
        let html = '';

        for (let i = 1; i <= setCount; i++) {
            const isChecked = savedState[`set_${i}`] || false;
            html += `
                <div class="series-card-modern ${isChecked ? 'completed' : ''}" data-set="${i}">
                    <div class="series-number">${i}</div>
                    <div class="series-info">
                        <div class="series-reps">${reps} reps</div>
                        ${weight ? `<div class="series-weight">${weight}kg</div>` : ''}
                    </div>
                    <div class="series-timer">
                        <svg class="timer-icon" width="20" height="20" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <span>${rest}s</span>
                    </div>
                    <label class="series-checkbox-modern">
                        <input type="checkbox" 
                               data-set="${i}" 
                               data-total="${setCount}"
                               ${isChecked ? 'checked' : ''} />
                        <span class="checkbox-checkmark">✓</span>
                    </label>
                </div>
            `;
        }

        return html;
    }

    attachCheckboxListeners(weekNumber) {
        const checkboxes = this.container.querySelectorAll('.series-checkbox-modern input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleSetCompleteModern(e.target, weekNumber);
            });
        });
    }

    // 🔥 NOUVELLE FONCTION : Gestion des supersets
    attachSupersetListeners(weekNumber) {
        const supersetBlocks = this.container.querySelectorAll('[data-superset="true"]');

        supersetBlocks.forEach(block => {
            const ex1Grid = block.querySelector('[data-superset-order="1"] .series-grid-modern');
            const ex2Grid = block.querySelector('[data-superset-order="2"] .series-grid-modern');
            const restTime = parseInt(block.dataset.rest) || 90;

            if (!ex1Grid || !ex2Grid) return;

            // Écouter les checkboxes des 2 exercices
            const ex1Checkboxes = ex1Grid.querySelectorAll('input[type="checkbox"]');
            const ex2Checkboxes = ex2Grid.querySelectorAll('input[type="checkbox"]');

            ex2Checkboxes.forEach((checkbox, index) => {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        // Vérifier que ex1 de la même série est coché
                        const ex1Checkbox = ex1Checkboxes[index];
                        
                        if (!ex1Checkbox || !ex1Checkbox.checked) {
                            alert('⚠️ Faites d\'abord l\'exercice 1 de cette série !');
                            e.target.checked = false;
                            return;
                        }

                        // ✅ Les 2 exercices sont faits → Démarrer timer
                        const ex1Name = block.querySelector('[data-superset-order="1"] .exercise-title-modern h2').textContent;
                        const ex2Name = block.querySelector('[data-superset-order="2"] .exercise-title-modern h2').textContent;
                        const setNumber = parseInt(e.target.dataset.set);
                        const totalSets = parseInt(e.target.dataset.total);

                        console.log(`✅ Superset série ${setNumber}/${totalSets} terminée !`);

                        if (this.timerManager && setNumber <= totalSets) {
                            const firstExerciseBlock = block.querySelector('[data-superset-order="1"]');
                            const exerciseId = firstExerciseBlock?.dataset.exerciseId;
                            const exerciseData = exerciseId ? this.getExerciseData(exerciseId) : {};

                            this.timerManager.startTimer(
                                {
                                    name: `${ex1Name} + ${ex2Name}`,
                                    gif: exerciseData.gif || 'assets/gifs/default.svg',
                                    tempo: exerciseData.tempo || '3-1-2-0'
                                },
                                setNumber,
                                totalSets,
                                restTime
                            );
                        }
                    }
                });
            });
        });
    }

    handleSetCompleteModern(checkbox, weekNumber) {
        const seriesCard = checkbox.closest('.series-card-modern');
        const exerciseBlock = checkbox.closest('.exercise-block-modern');
        const exerciseName = exerciseBlock.dataset.exercise || 
                             exerciseBlock.closest("[data-exercise]") && exerciseBlock.closest("[data-exercise]").dataset.exercise;
        const setNumber = parseInt(checkbox.dataset.set);
        const totalSets = parseInt(checkbox.dataset.total);

        console.log(`✅ Série ${setNumber}/${totalSets} - ${exerciseName}`);

        // Animation visuelle
        if (checkbox.checked) {
            seriesCard.classList.add('completed');

            // Timer automatique UNIQUEMENT pour exercices normaux (pas supersets)
            const isSuperset = exerciseBlock.hasAttribute('data-superset');
            
            if (!isSuperset) {
                const restTime = this.getRestTimeForExercise(exerciseBlock);

                // ✅ FIX: Timer sur TOUTES les séries (y compris la dernière)
                if (this.timerManager && setNumber <= totalSets) {
                    console.log(`⏱️ Démarrage timer : ${restTime}s pour ${exerciseName}`);
                    
                    const exerciseId = exerciseBlock.dataset.exerciseId;
                    const exerciseData = exerciseId ? this.getExerciseData(exerciseId) : {};

                    this.timerManager.startTimer(
                        {
                            name: exerciseName,
                            gif: exerciseData.gif || 'assets/gifs/default.svg',
                            tempo: exerciseData.tempo || '3-1-2-0'
                        },
                        setNumber,
                        totalSets,
                        restTime
                    );
                }
            }
        } else {
            seriesCard.classList.remove('completed');
        }

        // Sauvegarder l'état
        this.saveExerciseState(exerciseName, setNumber, checkbox.checked, weekNumber);
    }

    getRestTimeForExercise(exerciseBlock) {
        const timerElement = exerciseBlock.querySelector('.series-timer span');
        if (timerElement) {
            const seconds = parseInt(timerElement.textContent.replace('s', ''));
            return isNaN(seconds) ? 120 : seconds;
        }
        return 120;
    }

    saveExerciseState(exerciseName, setNumber, isChecked, weekNumber) {
        const storageKey = `workout_${weekNumber}_${exerciseName}`;
        const state = this.loadExerciseState(storageKey);
        state[`set_${setNumber}`] = isChecked;

        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('⚠️ Erreur sauvegarde localStorage:', error);
        }
    }

    loadExerciseState(storageKey) {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('⚠️ Erreur lecture localStorage:', error);
            return {};
        }
    }

    /**
     * ✅ FIX: Récupère les données d'un exercice depuis programData
     */
    getExerciseData(exerciseId) {
        if (!window.programData || !window.programData.program) {
            console.error('❌ programData non disponible');
            return { name: 'Exercice', gif: 'assets/gifs/default.gif', tempo: '3-1-2-0' };
        }

        // Cherche dans week1 (adapte selon la semaine active)
        const weekData = window.programData.program.week1;
        
        if (weekData) {
            // Parcourt tous les jours de la semaine
            for (const [dayKey, dayData] of Object.entries(weekData)) {
                if (dayData && dayData.exercises) {
                    const exercise = dayData.exercises.find(ex => ex.id === exerciseId);
                    if (exercise) {
                        console.log(`✅ Exercice trouvé: ${exercise.name} | Tempo: ${exercise.tempo} | GIF: ${exercise.gif}`);
                        return exercise;
                    }
                }
            }
        }

        console.warn(`⚠️ Exercice non trouvé pour ID: ${exerciseId}`);
        return {
            name: 'Exercice',
            gif: 'assets/gifs/default.svg',
            tempo: '3-1-2-0'
        };
    }
}
