// ==================================================================
// WORKOUT RENDERER - Affichage des séances AVEC TIMER
// ==================================================================

export class WorkoutRenderer {
    constructor(container, onBack) {
        this.container = container;
        this.onBack = onBack; // 🔥 NOUVEAU : Callback pour retour HOME
        this.timerManager = null;
        console.log('🏋️ WorkoutRenderer initialisé');
    }
    
    setTimerManager(timerManager) {
        this.timerManager = timerManager;
        console.log('✅ TimerManager connecté au WorkoutRenderer');
    }
    
    render(dayData, weekNumber) {
        console.log(`🎨 Rendu séance : ${dayData.day}, Semaine ${weekNumber}`);
        
        if (!dayData || !dayData.exercises) {
            console.error('❌ Données séance invalides');
            return;
        }
        
        const { day, location, exercises } = dayData;
        
        this.container.innerHTML = `
            <div class="workout-view">
                <!-- 🔥 NOUVEAU : Bouton retour -->
                <button id="back-to-home-btn" class="back-button">
                    ← Retour
                </button>
                
                <div class="workout-header">
                    <div class="workout-title">
                        <span class="workout-day">${day}</span>
                        <span class="workout-location">${location}</span>
                    </div>
                    <div class="workout-week">Semaine ${weekNumber}</div>
                </div>
                
                <div class="exercises-container">
                    ${exercises.map((exercise, index) => this.renderExercise(exercise, index, weekNumber)).join('')}
                </div>
            </div>
        `;
        
        // 🔥 NOUVEAU : Attacher event listener au bouton retour
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
    
    renderExercise(exercise, index, weekNumber) {
        const storageKey = `workout_${weekNumber}_${exercise.name}`;
        const savedState = this.loadExerciseState(storageKey);
        
        return `
            <div class="exercise-card" data-exercise="${exercise.name}">
                <div class="exercise-header">
                    <h3 class="exercise-name">${exercise.name}</h3>
                    ${exercise.variation ? `<span class="exercise-variation">${exercise.variation}</span>` : ''}
                </div>
                
                ${exercise.notes ? `
                    <div class="exercise-notes">
                        <span class="notes-icon">💡</span>
                        ${exercise.notes}
                    </div>
                ` : ''}
                
                <div class="exercise-params">
                    <div class="param">
                        <span class="param-label">Séries</span>
                        <span class="param-value">${exercise.sets}</span>
                    </div>
                    <div class="param">
                        <span class="param-label">Reps</span>
                        <span class="param-value">${exercise.reps}</span>
                    </div>
                    ${exercise.rest ? `
                        <div class="param">
                            <span class="param-label">Repos</span>
                            <span class="param-value">${exercise.rest}s</span>
                        </div>
                    ` : ''}
                    ${exercise.tempo ? `
                        <div class="param">
                            <span class="param-label">Tempo</span>
                            <span class="param-value">${exercise.tempo}</span>
                        </div>
                    ` : ''}
                    ${exercise.load ? `
                        <div class="param">
                            <span class="param-label">Charge</span>
                            <span class="param-value">${exercise.load}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="series-tracker" data-exercise="${exercise.name}">
                    ${this.renderSeriesCheckboxes(exercise.sets, savedState)}
                </div>
            </div>
        `;
    }
    
    renderSeriesCheckboxes(totalSets, savedState = {}) {
        const setCount = parseInt(totalSets) || 4;
        let checkboxes = '<div class="series-list">';
        
        for (let i = 1; i <= setCount; i++) {
            const isChecked = savedState[`set_${i}`] || false;
            checkboxes += `
                <div class="series-item ${isChecked ? 'completed' : ''}">
                    <label class="series-checkbox">
                        <input type="checkbox" 
                               data-set="${i}" 
                               data-total="${setCount}"
                               ${isChecked ? 'checked' : ''} />
                        <span class="checkbox-custom">
                            <span class="check-icon">✓</span>
                        </span>
                        <span class="series-label">Série ${i}</span>
                    </label>
                </div>
            `;
        }
        
        checkboxes += '</div>';
        return checkboxes;
    }
    
    attachCheckboxListeners(weekNumber) {
        const checkboxes = this.container.querySelectorAll('.series-item input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleSetComplete(e.target, weekNumber);
            });
        });
    }
    
    handleSetComplete(checkbox, weekNumber) {
        const exerciseCard = checkbox.closest('.exercise-card');
        const exerciseName = exerciseCard.dataset.exercise;
        const setNumber = parseInt(checkbox.dataset.set);
        const totalSets = parseInt(checkbox.dataset.total);
        const seriesItem = checkbox.closest('.series-item');
        
        console.log(`✅ Série ${setNumber}/${totalSets} - ${exerciseName}`);
        
        // Animation visuelle
        if (checkbox.checked) {
            seriesItem.classList.add('completed');
            
            // 🔥 TIMER AUTOMATIQUE : Récupérer le temps de repos du programme
            const restTime = this.getRestTimeForExercise(exerciseName);
            
            // Démarrer le timer si pas la dernière série
            if (this.timerManager && setNumber < totalSets) {
                console.log(`⏱️ Démarrage timer : ${restTime}s pour ${exerciseName}`);
                this.timerManager.start(
                    restTime,
                    exerciseName,
                    setNumber + 1,
                    totalSets,
                    () => {
                        console.log('🔔 Timer terminé !');
                        // Animation ou son de fin (optionnel)
                    }
                );
            }
        } else {
            seriesItem.classList.remove('completed');
        }
        
        // Sauvegarder l'état
        this.saveExerciseState(exerciseName, setNumber, checkbox.checked, weekNumber);
    }
    
    // 🔥 NOUVEAU : Récupérer le temps de repos selon l'exercise
    getRestTimeForExercise(exerciseName) {
        // Chercher l'exercice dans les données du DOM
        const exerciseCard = this.container.querySelector(`[data-exercise="${exerciseName}"]`);
        if (!exerciseCard) return 120; // Valeur par défaut
        
        const restParam = exerciseCard.querySelector('.param-label');
        if (!restParam) return 120;
        
        // Extraire le temps de repos depuis le HTML
        const params = exerciseCard.querySelectorAll('.param');
        for (const param of params) {
            const label = param.querySelector('.param-label');
            if (label && label.textContent.includes('Repos')) {
                const value = param.querySelector('.param-value').textContent;
                const seconds = parseInt(value.replace('s', ''));
                return isNaN(seconds) ? 120 : seconds;
            }
        }
        
        return 120; // Valeur par défaut
    }
    
    // ==================================================================
    // SAUVEGARDE D'ÉTAT
    // ==================================================================
    
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
