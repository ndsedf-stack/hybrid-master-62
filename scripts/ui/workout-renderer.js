/**
 * WORKOUT RENDERER - Affichage des séances d'entraînement
 */
export default class WorkoutRenderer {
    constructor() {
        this.currentWorkout = null;
        this.timerManager = null;
        this.onBackHome = null;
        console.log('✅ WorkoutRenderer initialisé');
    }

    /**
     * Définit le gestionnaire de timer
     */
    setTimerManager(timerManager) {
        this.timerManager = timerManager;
        console.log('✅ TimerManager connecté au WorkoutRenderer');
    }

    /**
     * Définit le callback de retour à l'accueil
     */
    setBackCallback(callback) {
        this.onBackHome = callback;
    }

    /**
     * Affiche une séance d'entraînement
     */
    renderWorkout(container, dayData, week, day) {
        console.log('🎨 Rendu de la séance...', dayData);

        if (!dayData || !dayData.exercises) {
            container.innerHTML = '<p class="error">❌ Aucun exercice trouvé</p>';
            return;
        }

        this.currentWorkout = dayData;

        // En-tête
        const location = dayData.location || 'Salle';
        const workoutName = dayData.name || 'Séance';
        const duration = dayData.duration || 0;
        const totalSets = dayData.totalSets || 0;

        const headerHTML = `
            <div class="workout-header">
                <button class="btn-back" id="btn-back-home">← Retour</button>
                <h2 class="workout-title">${location.toUpperCase()}</h2>
                <p class="workout-subtitle">Semaine ${week} ${this.capitalize(day)}</p>
                <p class="workout-stats">
                    ${dayData.exercises.length} exercices ${totalSets} séries
                </p>
            </div>
        `;

        // Exercices
        const exercisesHTML = dayData.exercises.map((exercise, index) => {
            return this.renderExercise(exercise, index + 1);
        }).join('');

        container.innerHTML = `
            <div class="workout-container">
                ${headerHTML}
                <div class="exercises-list">
                    ${exercisesHTML}
                </div>
            </div>
        `;

        // Attacher les event listeners
        this.attachEventListeners(container);
    }

    /**
     * Affiche un exercice
     */
    renderExercise(exercise, exerciseNumber) {
        const sets = typeof exercise.sets === 'number' ? exercise.sets : 1;
        const reps = exercise.reps || '';
        const weight = exercise.weight || 0;
        const rest = exercise.rest || 60;
        const notes = exercise.notes || '';

        // Générer les séries
        const setsHTML = Array.from({ length: sets }, (_, i) => {
            const setNumber = i + 1;
            return `
                <div class="set-row" data-exercise-id="${exercise.id}" data-set="${setNumber}">
                    <div class="set-number">
                        <div class="set-badge-circle">${setNumber}</div>
                    </div>
                    <div class="set-details">
                        <span class="set-reps">${reps} reps</span>
                        <span class="set-weight">${weight}kg</span>
                    </div>
                    <label class="set-checkbox-wrapper">
                        <input type="checkbox" 
                               class="set-checkbox-input"
                               data-exercise-id="${exercise.id}" 
                               data-set="${setNumber}"
                               data-rest="${rest}"
                               data-exercise-name="${exercise.name}"
                               data-total-sets="${sets}">
                        <span class="set-checkmark">✓</span>
                    </label>
                </div>
            `;
        }).join('');

        return `
            <div class="exercise-card" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <h3 class="exercise-name">${exercise.name}</h3>
                    <span class="exercise-number">#${exerciseNumber}</span>
                </div>
                
                <div class="exercise-details">
                    <div class="detail-item">
                        <span class="detail-label">Séries</span>
                        <span class="detail-value">${sets}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Répétitions</span>
                        <span class="detail-value">${reps}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Poids</span>
                        <span class="detail-value">${weight}kg</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Repos</span>
                        <span class="detail-value">${rest}s</span>
                    </div>
                </div>

                ${notes ? `
                    <div class="exercise-notes">
                        <span class="notes-icon">💡</span>
                        <p>${notes}</p>
                    </div>
                ` : ''}

                <div class="sets-container">
                    ${setsHTML}
                </div>
            </div>
        `;
    }

    /**
     * Attache les event listeners
     */
    attachEventListeners(container) {
        // Bouton retour
        const backBtn = container.querySelector('#btn-back-home');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.onBackHome) {
                    this.onBackHome();
                }
            });
        }

        const checkboxes = container.querySelectorAll('.set-checkbox input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.handleSetCompleted(e.target);
                }
            });
        });

        console.log(`✅ ${checkboxes.length} checkboxes attachées`);
    }

    /**
     * Gère la complétion d'une série
     */
    handleSetCompleted(checkbox) {
        const exerciseName = checkbox.dataset.exerciseName;
        const setNumber = checkbox.dataset.set;
        const totalSets = checkbox.dataset.totalSets;
        const restTime = parseInt(checkbox.dataset.rest) || 60;

        console.log(`✅ Série ${setNumber}/${totalSets} complétée pour ${exerciseName}`);

        // Marquer visuellement comme complété
        const setRow = checkbox.closest('.set-row');
        if (setRow) {
            setRow.classList.add('completed');
        }

        // Démarrer le timer si disponible
        if (this.timerManager && parseInt(setNumber) < parseInt(totalSets)) {
            console.log(`⏱️ Démarrage timer: ${restTime}s`);
            this.timerManager.start(
                restTime,
                exerciseName,
                parseInt(setNumber) + 1,
                totalSets,
                () => {
                    console.log('⏰ Repos terminé !');
                    // Optionnel : jouer un son ou afficher une notification
                }
            );
        } else if (parseInt(setNumber) === parseInt(totalSets)) {
            console.log('🎉 Exercice terminé !');
        }
    }

    /**
     * Capitalise la première lettre
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}

console.log('✅ WorkoutRenderer module chargé');
