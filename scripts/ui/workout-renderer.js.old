// ==================================================================
// WORKOUT RENDERER - VERSION ORIGINALE (CARTES ORANGE)
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
                    ${exercises.map((exercise, index) => this.renderExerciseModern(exercise, index, weekNumber)).join('')}
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

    renderExerciseModern(exercise, index, weekNumber) {
        const storageKey = `workout_${weekNumber}_${exercise.name}`;
        const savedState = this.loadExerciseState(storageKey);

        return `
            <div class="exercise-block-modern" data-exercise="${exercise.name}">
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

    handleSetCompleteModern(checkbox, weekNumber) {
        const seriesCard = checkbox.closest('.series-card-modern');
        const exerciseBlock = checkbox.closest('.exercise-block-modern');
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
