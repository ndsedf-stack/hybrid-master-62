// scripts/app.js
// Version FINALE AVEC TIMER
console.log('🚀 app.js chargé !');

// ====================================================================
// IMPORTS
// ====================================================================
import programData from './program-data.js';
import { NavigationUI } from './ui/navigation-ui.js';
import WorkoutRenderer from './ui/workout-renderer.js';
import { HomeRenderer } from './modules/home-renderer.js';

// ====================================================================
// TIMER MANAGER SIMPLE (inline pour éviter les imports)
// ====================================================================
class SimpleTimer {
    constructor() {
        this.isRunning = false;
        this.timeLeft = 0;
        this.interval = null;
        this.widget = null;
        this.onComplete = null;
    }

    init() {
        this.widget = document.getElementById('timer-widget');
        const closeBtn = document.getElementById('timer-close');
        const pauseBtn = document.getElementById('timer-pause');
        const skipBtn = document.getElementById('timer-skip');
        const minus15Btn = document.getElementById('timer-minus-15');
        const plus15Btn = document.getElementById('timer-plus-15');
        const resetBtn = document.getElementById('timer-reset');

        if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.toggle());
        if (skipBtn) skipBtn.addEventListener('click', () => this.skip());
        if (minus15Btn) minus15Btn.addEventListener('click', () => this.adjust(-15));
        if (plus15Btn) plus15Btn.addEventListener('click', () => this.adjust(15));
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

        console.log('✅ Timer initialisé');
    }

    start(seconds, exerciseName, setNumber, totalSets, onComplete) {
        this.stop();
        this.timeLeft = seconds;
        this.onComplete = onComplete;
        this.isRunning = true;

        // Mettre à jour l'interface
        if (this.widget) {
            document.getElementById('timer-exercise-name').textContent = exerciseName || 'Exercice';
            document.getElementById('timer-set-number').textContent = `Set ${setNumber}/${totalSets}`;
            this.widget.classList.add('active');
        }

        this.updateDisplay();

        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);

        console.log(`⏱️ Timer démarré: ${seconds}s pour ${exerciseName}`);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    toggle() {
        if (this.isRunning) {
            this.stop();
            document.getElementById('timer-pause').textContent = 'Reprendre';
        } else {
            this.isRunning = true;
            this.interval = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();
                if (this.timeLeft <= 0) {
                    this.complete();
                }
            }, 1000);
            document.getElementById('timer-pause').textContent = 'Pause';
        }
    }

    adjust(seconds) {
        this.timeLeft += seconds;
        if (this.timeLeft < 0) this.timeLeft = 0;
        this.updateDisplay();
    }

    reset() {
        this.timeLeft = 90; // Temps par défaut
        this.updateDisplay();
    }

    skip() {
        this.complete();
    }

    complete() {
        this.stop();
        if (this.onComplete) {
            this.onComplete();
        }
        // Son de notification (optionnel)
        console.log('⏰ Timer terminé !');
    }

    hide() {
        this.stop();
        if (this.widget) {
            this.widget.classList.remove('active');
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const timeElement = document.getElementById('timer-time');
        if (timeElement) {
            timeElement.textContent = display;
        }

        // Mettre à jour le cercle de progression (optionnel)
        // À implémenter si nécessaire
    }
}

// ====================================================================
// APPLICATION PRINCIPALE
// ====================================================================
class HybridMasterApp {
    constructor() {
        console.log('🚀 Construction HybridMasterApp...');
        
        // Modules
        this.navigation = null;
        this.workoutRenderer = null;
        this.home = null;
        this.timer = null;
        
        // État
        this.currentWeek = 1;
        this.currentDay = null;
    }

    /**
     * Initialise l'application
     */
    async init() {
        console.log('🔧 Initialisation modules...');
        
        try {
            // Timer
            this.timer = new SimpleTimer();
            this.timer.init();
            console.log('✅ Timer initialisé');

            // Workout Renderer
            this.workoutRenderer = new WorkoutRenderer();
            this.workoutRenderer.setTimerManager(this.timer);
            console.log('✅ Workout renderer initialisé');
            
            // Navigation
            this.navigation = new NavigationUI();
            this.navigation.onWeekChange = (week) => this.handleWeekChange(week);
            this.navigation.init();
            console.log('✅ Navigation initialisée');
            
            // Home
            this.home = new HomeRenderer('app', this.handleDayClick.bind(this));
            console.log('✅ Home renderer initialisé');
            
            // Affichage initial
            this.showHome();
            
            console.log('✅ Application démarrée avec succès !');
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
        }
    }

    /**
     * Affiche la page d'accueil
     */
    showHome() {
        console.log('🏠 Affichage page d\'accueil');
        const container = document.getElementById('app');
        
        if (!container) {
            console.error('❌ Container #app introuvable !');
            return;
        }

        // Données de la semaine actuelle
        const weekData = this.getWorkout(this.currentWeek);
        console.log('📊 Données semaine:', weekData);

        if (!weekData) {
            container.innerHTML = '<p class="error">❌ Données introuvables</p>';
            return;
        }

        // Formater les données pour HomeRenderer
        const formattedData = {
            week: this.currentWeek,
            days: weekData.days || []
        };
        console.log('📋 Données formatées:', formattedData);

        // Render
        this.home.render(container, formattedData);
        console.log('✅ Page d\'accueil affichée');
    }

    /**
     * Récupère les données d'une semaine
     */
    getWorkout(week) {
        console.log(`📖 Récupération données semaine ${week}`);
        
        if (!programData) {
            console.error('❌ programData invalide !');
            return null;
        }

        try {
            // ✅ Utiliser la méthode getWeek() au lieu de programData.weeks
            const weekData = programData.getWeek(week);
            console.log('✅ Données récupérées:', weekData);
            
            // Transformer les données pour correspondre au format attendu
            return {
                week: weekData.weekNumber,
                days: [
                    { day: 'Dimanche', ...weekData.dimanche },
                    { day: 'Mardi', ...weekData.mardi },
                    { day: 'Vendredi', ...weekData.vendredi },
                    { day: 'Maison', ...weekData.maison }
                ]
            };
        } catch (error) {
            console.error(`❌ Erreur récupération semaine ${week}:`, error);
            return null;
        }
    }

    /**
     * Gère le clic sur une carte de jour
     */
    handleDayClick(week, day) {
        console.log(`🎯 Clic sur ${day} (semaine ${week})`);
        this.currentWeek = week;
        this.currentDay = day;
        this.showWorkout(week, day);
    }

    /**
     * Affiche une séance d'entraînement
     */
    showWorkout(week, day) {
        console.log(`🏋️ Affichage séance: semaine ${week}, ${day}`);
        const container = document.getElementById('app');
        
        if (!container) {
            console.error('❌ Container #app introuvable !');
            return;
        }

        const weekData = this.getWorkout(week);
        if (!weekData) {
            container.innerHTML = '<p class="error">❌ Données introuvables</p>';
            return;
        }

        // Trouver le jour
        const dayData = weekData.days.find(d => d.day.toLowerCase() === day.toLowerCase());
        
        if (!dayData) {
            console.error(`❌ Jour ${day} introuvable !`);
            container.innerHTML = '<p class="error">❌ Jour introuvable</p>';
            return;
        }

        console.log('📋 Données du jour:', dayData);

        // Render workout
        this.workoutRenderer.renderWorkout(container, dayData, week, day);
        console.log('✅ Séance affichée');
    }

    /**
     * Gère le changement de semaine
     */
    handleWeekChange(week) {
        console.log(`📅 Changement semaine: ${week}`);
        this.currentWeek = week;
        this.navigation.goToWeek(week);
        this.showHome();
    }
}

// ====================================================================
// DÉMARRAGE
// ====================================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 DOM ready');
    
    try {
        const app = new HybridMasterApp();
        console.log('✅ HybridMasterApp créé');
        
        await app.init();
    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        document.getElementById('app').innerHTML = `
            <div style="padding: 20px; color: #ff4444;">
                <h2>❌ Erreur de chargement</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
});

console.log('✅ app.js chargé complètement');
