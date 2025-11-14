// ==================================================================
// WORKOUT RENDERER - AVEC SUPERSETS INTÉGRÉS
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

        // Attacher les event listeners pour les checkboxes
        this.attachCheckboxListeners(weekNumber);
    }

    // ✨ NOUVELLE FONCTION : Détecte et groupe les supersets
    renderExercisesList(exercises, weekNumber) {
        let html = '';
        const processed = new Set();

        exercises.forEach((exercise, index) => {
            if (processed.has(index)) return;

            // Vérifier si c'est un superset
            if (exercise.isSuperset && exercise.supersetWith) {
                const partnerIndex = exercises.findIndex(
                    (ex, idx) => idx > index && ex.name === exercise.supersetWith
                );

                if (partnerIndex !== -1) {
                    // Rendre le superset
                    html += this.renderSuperset(exercise, exercises[partnerIndex], weekNumber);
                    processed.add(index);
                    processed.add(partnerIndex);
                } else {
                    // Partenaire non trouvé, afficher normalement
                    html += this.renderExerciseModern(exercise, index, weekNumber);
                    processed.add(index);
                }
            } else {
                // Exercice normal
                html += this.renderExerciseModern(exercise, index, weekNumber);
                processed.add(index);
            }
        });

        return html;
    }

    // ✨ NOUVELLE FONCTION : Rendre un superset
    renderSuperset(ex1, ex2, weekNumber) {
        return `
            <div class="superset-container">
                <!-- Badge SUPERSET -->
                <div class="superset-badge">SUPERSET</div>
                
                <!-- Premier exercice -->
                <div class="exercise-block-modern is-superset-first">
                    ${this.renderExerciseContent(ex1, weekNumber)}
                </div>

                <!-- Connecteur + -->
                <div class="superset-connector">
                    <div class="connector-icon">+</div>
                </div>

                <!-- Deuxième exercice -->
                <div class="exercise-block-modern is-superset-second">
                    ${this.renderExerciseContent(ex2, weekNumber)}
                </div>

                <!-- Info repos après le duo -->
                <div class="superset-rest-info">
                    <span class="rest-icon">⏱️</span>
                    <span class="rest-text">Repos après le duo</span>
                    <span class="rest-time">${ex1.rest || 90}s</span>
                </div>
            </div>
        `;
    }

    // ✨ NOUVELLE FONCTION : Contenu d'un exercice (réutilisable)
    renderExerciseContent(exercise, weekNumber) {
        const storageKey = `workout_${weekNumber}_${exercise.name}`;
        const savedState = this.loadExerciseState(storageKey);

        return `
            <div data-exercise="${exercise.name}">
                <!-- Titre -->
                <div class="exercise-title-modern">
                    <h2>${exercise.name}</h2>
                    ${exercise.variation ? `<span class="variation-badge">${exercise.variation}</span>` : ''}
                </div>

                <!-- Notes -->
                ${exercise.notes ? `
                    <div class="exercise-notes-modern">
                        <span class="notes-icon">💡</span>
                        <p>${exercise.notes}</p>
                    </div>
                ` : ''}

                <!-- Specs -->
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

                <!-- Grille séries -->
                <div class="series-grid-modern" data-exercise="${exercise.name}">
                    ${this.renderSeriesGridModern(exercise, savedState, weekNumber)}
                </div>
            </div>
        `;
    }

    renderExerciseModern(exercise, index, weekNumber) {
        const storageKey = `workout_${weekNumber}_${exercise.name}`;
        const savedState = this.loadExerciseState(storageKey);

        return `
            <div class="exercise-block-modern" data-exercise="${exercise.name}">
                ${this.renderExerciseContent(exercise, weekNumber)}
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

    handleSetCompleteModern(checkbox, weekNumber) {
        const seriesCard = checkbox.closest('.series-card-modern');
        const exerciseBlock = checkbox.closest('[data-exercise]');
        const exerciseName = exerciseBlock.dataset.exercise;
        const setNumber = parseInt(checkbox.dataset.set);
        const totalSets = parseInt(checkbox.dataset.total);

        console.log(`✅ Série ${setNumber}/${totalSets} - ${exerciseName}`);

        // Animation visuelle
        if (checkbox.checked) {
            seriesCard.classList.add('completed');

            // Timer automatique
            const restTime = this.getRestTimeForExercise(exerciseBlock);

            // Démarrer le timer si pas la dernière série
            if (this.timerManager && setNumber < totalSets) {
                console.log(`⏱️ Démarrage timer : ${restTime}s pour ${exerciseName}`);
                this.timerManager.start(
                    restTime,
                    exerciseName,
                    setNumber + 1,
                    totalSets
                );
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
}
