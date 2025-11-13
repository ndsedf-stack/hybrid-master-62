// ==================================================================
// WORKOUT RENDERER - VERSION PREMIUM iOS 18 COMPATIBLE
// ==================================================================
export class WorkoutRenderer {
    constructor(container, onBack) {
        this.container = container;
        this.onBack = onBack;
        this.timerManager = null;
        console.log('🏋️ WorkoutRenderer Premium initialisé');
    }

    setTimerManager(timerManager) {
        this.timerManager = timerManager;
        console.log('✅ TimerManager connecté');
    }

    render(dayData, weekNumber) {
        console.log('🎨 Rendu séance:', dayData.name, 'Semaine', weekNumber);

        if (!dayData || !dayData.exercises) {
            console.error('❌ Données séance invalides');
            return;
        }

        const { name, exercises } = dayData;
        const weekData = this.getWeekData(weekNumber);

        this.container.innerHTML = `
            <div class="workout-view">
                <!-- Header Premium -->
                <div class="workout-header-premium">
                    <button id="back-to-home-btn" class="btn-back">
                        <span class="btn-back-icon">←</span>
                    </button>
                    <div class="workout-header-info">
                        <h1 class="workout-title">${name || 'Entraînement'}</h1>
                        <div class="workout-badges">
                            <span class="badge badge-block">BLOC ${weekData.block}</span>
                            <span class="badge badge-technique">${weekData.technique}</span>
                            ${weekData.isDeload ? '<span class="badge badge-deload">DELOAD</span>' : ''}
                        </div>
                    </div>
                </div>

                <!-- Liste des exercices -->
                <div class="exercises-container">
                    ${this.renderExercises(exercises, weekNumber, weekData)}
                </div>
            </div>
        `;

        // Event listeners
        const backBtn = document.getElementById('back-to-home-btn');
        if (backBtn && this.onBack) {
            backBtn.addEventListener('click', () => {
                console.log('🏠 Retour accueil');
                this.onBack();
            });
        }

        // Initialiser l'interactivité (appelé après rendu)
        this.initInteractive(weekNumber);
    }

    getWeekData(weekNumber) {
        // Récupérer les infos de la semaine depuis program-data
        try {
            const programData = window.programData || {};
            const week = programData[`week${weekNumber}`] || {};
            return {
                block: week.block || 1,
                technique: week.technique || 'Tempo 3-1-2',
                isDeload: week.isDeload || false,
                rpeTarget: week.rpeTarget || '7-8'
            };
        } catch (e) {
            return { block: 1, technique: 'Tempo 3-1-2', isDeload: false };
        }
    }

    renderExercises(exercises, weekNumber, weekData) {
        if (!exercises || !Array.isArray(exercises)) return '';

        // Grouper les supersets
        const grouped = this.groupSupersets(exercises);
        
        return grouped.map((item, index) => {
            if (item.isSuperset) {
                return this.renderSuperset(item.exercises, index, weekNumber, weekData);
            } else {
                return this.renderExercise(item, index, weekNumber, weekData);
            }
        }).join('');
    }

    groupSupersets(exercises) {
        const grouped = [];
        const processed = new Set();

        exercises.forEach((ex, i) => {
            if (processed.has(i)) return;

            if (ex.isSuperset && ex.supersetWith) {
                // Trouver le partenaire
                const partnerIndex = exercises.findIndex((e, idx) => 
                    idx > i && e.name === ex.supersetWith
                );

                if (partnerIndex !== -1) {
                    grouped.push({
                        isSuperset: true,
                        exercises: [ex, exercises[partnerIndex]],
                        rest: Math.max(ex.rest || 90, exercises[partnerIndex].rest || 90)
                    });
                    processed.add(i);
                    processed.add(partnerIndex);
                } else {
                    grouped.push(ex);
                    processed.add(i);
                }
            } else if (!processed.has(i)) {
                grouped.push(ex);
                processed.add(i);
            }
        });

        return grouped;
    }

    renderSuperset(exercises, index, weekNumber, weekData) {
        const rest = Math.max(...exercises.map(e => e.rest || 90));
        const sets = Math.max(...exercises.map(e => e.sets || 4));

        return `
            <div class="superset-group" data-rest="${rest}">
                <div class="superset-label">
                    <span class="superset-badge">SUPERSET</span>
                    <span class="superset-info">${exercises.length} exercices</span>
                </div>
                
                <div class="superset-connector"></div>

                ${exercises.map((ex, i) => `
                    <div class="exercise-card superset-item" data-exercise-id="${ex.id || ex.name}">
                        ${this.renderExerciseContent(ex, `${index}_${i}`, weekNumber, weekData, true)}
                    </div>
                `).join('')}

                <!-- Timer unique pour le superset -->
                <div class="superset-timer-wrapper">
                    <div class="timer-label">Repos après les 2 exercices</div>
                    <div class="timer-circular" data-duration="${rest}" data-type="superset">
                        <svg viewBox="0 0 120 120" class="timer-svg">
                            <defs>
                                <linearGradient id="gradient-superset-${index}">
                                    <stop offset="0%" stop-color="#FF9F0A"/>
                                    <stop offset="100%" stop-color="#FFB340"/>
                                </linearGradient>
                            </defs>
                            <circle cx="60" cy="60" r="52" class="timer-bg"/>
                            <circle cx="60" cy="60" r="52" class="timer-progress" 
                                    stroke="url(#gradient-superset-${index})"
                                    stroke-dasharray="326.73" 
                                    stroke-dashoffset="0"/>
                        </svg>
                        <div class="timer-text">
                            <span class="timer-value">${this.formatTime(rest)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderExercise(exercise, index, weekNumber, weekData, isInSuperset = false) {
        if (isInSuperset) return ''; // Déjà rendu dans le superset

        return `
            <div class="exercise-card" data-exercise-id="${exercise.id || exercise.name}">
                ${this.renderExerciseContent(exercise, index, weekNumber, weekData, false)}
            </div>
        `;
    }

    renderExerciseContent(exercise, index, weekNumber, weekData, isInSuperset) {
        const sets = exercise.sets || 4;
        const reps = exercise.reps || '10';
        const weight = exercise.weight || 0;
        const rest = exercise.rest || 120;

        return `
            <div class="exercise-header">
                <h3 class="exercise-name">${exercise.name}</h3>
                ${exercise.category ? `<span class="exercise-category">${exercise.category}</span>` : ''}
            </div>

            <!-- Stats principales (modifiables) -->
            <div class="exercise-stats">
                <div class="stat-item">
                    <span class="stat-label">Poids</span>
                    <div class="stat-value-group">
                        <button class="stat-btn stat-minus" data-type="weight">−</button>
                        <input type="number" class="stat-value" value="${weight}" step="2.5" data-type="weight">
                        <button class="stat-btn stat-plus" data-type="weight">+</button>
                        <span class="stat-unit">kg</span>
                    </div>
                </div>

                <div class="stat-item">
                    <span class="stat-label">Reps</span>
                    <div class="stat-value-group">
                        <button class="stat-btn stat-minus" data-type="reps">−</button>
                        <input type="number" class="stat-value" value="${reps}" step="1" data-type="reps">
                        <button class="stat-btn stat-plus" data-type="reps">+</button>
                    </div>
                </div>

                <div class="stat-item">
                    <span class="stat-label">Repos</span>
                    <div class="stat-value-group">
                        <button class="stat-btn stat-minus" data-type="rest">−</button>
                        <input type="number" class="stat-value" value="${rest}" step="5" data-type="rest">
                        <button class="stat-btn stat-plus" data-type="rest">+</button>
                        <span class="stat-unit">s</span>
                    </div>
                </div>
            </div>

            <!-- Infos secondaires -->
            <div class="exercise-meta">
                ${exercise.tempo ? `<span class="meta-badge">Tempo: ${exercise.tempo}</span>` : ''}
                ${exercise.rpe ? `<span class="meta-badge">RPE: ${exercise.rpe}</span>` : ''}
            </div>

            <!-- Notes -->
            ${exercise.notes ? `
                <div class="exercise-notes">
                    <span class="notes-icon">💡</span>
                    <p>${exercise.notes}</p>
                </div>
            ` : ''}

            <!-- Grille des séries (sans timer individuel pour superset) -->
            <div class="sets-grid">
                ${this.renderSets(sets, reps, weight, rest, exercise, isInSuperset)}
            </div>
        `;
    }

    renderSets(setCount, reps, weight, rest, exercise, isInSuperset) {
        let html = '';
        
        for (let i = 1; i <= setCount; i++) {
            const setId = `${exercise.id || exercise.name}_set_${i}`;
            
            html += `
                <div class="set-card" data-set-id="${setId}" data-set-number="${i}" data-rest="${rest}">
                    <div class="set-number">${i}</div>
                    
                    <div class="set-info">
                        <span class="set-reps">${reps} reps</span>
                        <span class="set-weight">${weight}kg</span>
                    </div>

                    <button class="set-check">
                        <span class="check-icon"></span>
                    </button>

                    ${!isInSuperset ? `
                        <div class="timer-circular" data-duration="${rest}">
                            <svg viewBox="0 0 80 80" class="timer-svg">
                                <circle cx="40" cy="40" r="35" class="timer-bg"/>
                                <circle cx="40" cy="40" r="35" class="timer-progress" 
                                        stroke-dasharray="219.91" 
                                        stroke-dashoffset="0"/>
                            </svg>
                            <div class="timer-text">
                                <span class="timer-value">${this.formatTime(rest)}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        return html;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    initInteractive(weekNumber) {
        // Attendre que workout-interactive.js soit chargé
        setTimeout(() => {
            if (window.workoutApp) {
                console.log('🔄 Réinitialisation interactive');
                window.workoutApp.init();
                window.workoutApp.loadSavedData();
            } else {
                console.warn('⚠️ workout-interactive.js non chargé');
            }
        }, 100);
    }
}
