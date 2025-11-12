// scripts/app.js
// Version TEST SANS TIMER
console.log('🚀 app.js chargé !');

// ====================================================================
// IMPORTS
// ====================================================================
import programData from './program-data.js';
import { NavigationUI } from './ui/navigation-ui.js';
import WorkoutRenderer from './ui/workout-renderer.js';
import { HomeRenderer } from './modules/home-renderer.js';

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
            // Initialisation des renderers
            this.workoutRenderer = new WorkoutRenderer();
            console.log('✅ Workout renderer initialisé');
            
            // Navigation
            this.navigation = new NavigationUI();
            this.navigation.onWeekChange = (week) => this.handleWeekChange(week);
            this.navigation.init();
            console.log('✅ Navigation initialisée');
            
            // Home
            this.home = new HomeRenderer('app', (week, day) => this.handleDayClick(week, day));
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
        
        if (!programData || !programData.weeks) {
            console.error('❌ programData invalide !');
            return null;
        }

        const weekData = programData.weeks.find(w => w.week === week);
        
        if (!weekData) {
            console.error(`❌ Semaine ${week} introuvable !`);
            return null;
        }

        console.log('✅ Données récupérées:', weekData);
        return weekData;
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
