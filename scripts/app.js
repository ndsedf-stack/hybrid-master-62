// ==================================================================
// HYBRID MASTER 61 - APP PRINCIPAL FINAL CORRIGÉ
// ==================================================================

console.log('🚀 app.js chargé - Version FINALE CORRIGÉE');

// ==================================================================
// IMPORTS
// ==================================================================
import programData from './program-data.js';
import { NavigationUI } from './ui/navigation-ui.js';
import { HomeRenderer } from './modules/home-renderer.js';
import { WorkoutRenderer } from './ui/workout-renderer.js';
import { TimerManager } from './ui/timer-manager.js';

// ==================================================================
// CLASSE PRINCIPALE
// ==================================================================
class HybridMasterApp {
    constructor() {
        console.log('🏗️ Initialisation HybridMasterApp');
        
        this.programData = programData;
        this.currentWeek = 1;
        this.currentView = 'home'; // 🔥 CORRECTION : Démarrer sur HOME
        
        // Initialiser les composants UI
        this.navigationUI = new NavigationUI(
            (week) => this.handleWeekChange(week)
        );
        
        this.homeRenderer = new HomeRenderer(
            document.getElementById('app'),
            (week, day) => this.handleDaySelected(week, day)
        );
        
        this.workoutRenderer = new WorkoutRenderer(
            document.getElementById('app'),
            () => this.handleBackToHome() // 🔥 NOUVEAU : Callback retour
        );
        
        // Initialiser le timer
        this.timerManager = new TimerManager();
        this.workoutRenderer.setTimerManager(this.timerManager);
        
        console.log('✅ Composants UI initialisés');
        
        // Démarrer l'application
        this.init();
    }
    
    init() {
        console.log('🎬 Démarrage application');
        
        // Vérifier les données
        try {
            const weekData = this.programData.getWeek(this.currentWeek);
            if (!weekData || !weekData.days) {
                throw new Error('Données semaine invalides');
            }
            console.log('✅ Données programme chargées');
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            this.showError('Impossible de charger les données du programme');
            return;
        }
        
        // 🔥 CORRECTION : Afficher HOME au démarrage
        this.showHome();
    }
    
    // ==================================================================
    // NAVIGATION
    // ==================================================================
    
    handleWeekChange(newWeek) {
        console.log(`🔄 Changement semaine : ${this.currentWeek} → ${newWeek}`);
        this.currentWeek = newWeek;
        
        // Rafraîchir la vue actuelle
        if (this.currentView === 'home') {
            this.showHome();
        }
    }
    
    handleDaySelected(week, day) {
        console.log(`📅 Jour sélectionné : Semaine ${week}, ${day}`);
        this.currentWeek = week;
        this.showWorkout(day);
    }
    
    handleBackToHome() {
        console.log('🏠 Retour à l\'accueil');
        this.showHome();
    }
    
    // ==================================================================
    // AFFICHAGE DES VUES
    // ==================================================================
    
    showHome() {
        console.log('🏠 Affichage HOME');
        this.currentView = 'home';
        
        try {
            const weekData = this.programData.getWeek(this.currentWeek);
            if (!weekData || !weekData.days) {
                throw new Error(`Données semaine ${this.currentWeek} introuvables`);
            }
            
            this.homeRenderer.render(weekData.days, this.currentWeek);
            this.navigationUI.updateWeekDisplay(this.currentWeek);
            
            console.log('✅ HOME affiché avec succès');
        } catch (error) {
            console.error('❌ Erreur affichage HOME:', error);
            this.showError('Impossible d\'afficher la page d\'accueil');
        }
    }
    
    showWorkout(day) {
        console.log(`💪 Affichage séance : ${day}`);
        this.currentView = 'workout';
        
        try {
            const weekData = this.programData.getWeek(this.currentWeek);
            if (!weekData || !weekData.days) {
                throw new Error(`Données semaine ${this.currentWeek} introuvables`);
            }
            
            const dayData = weekData.days.find(d => 
                d.day.toLowerCase() === day.toLowerCase()
            );
            
            if (!dayData) {
                throw new Error(`Jour ${day} introuvable dans semaine ${this.currentWeek}`);
            }
            
            this.workoutRenderer.render(dayData, this.currentWeek);
            console.log('✅ Séance affichée avec succès');
        } catch (error) {
            console.error('❌ Erreur affichage séance:', error);
            this.showError(`Impossible d'afficher la séance ${day}`);
        }
    }
    
    showError(message) {
        console.error('💥 Erreur application:', message);
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <h2 style="color: #ef4444; margin-bottom: 1rem;">⚠️ Erreur</h2>
                    <p style="color: #94a3b8; margin-bottom: 2rem;">${message}</p>
                    <button onclick="location.reload()" 
                            style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                        🔄 Recharger la page
                    </button>
                </div>
            `;
        }
    }
}

// ==================================================================
// DÉMARRAGE APPLICATION
// ==================================================================
window.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM chargé, démarrage app...');
    try {
        window.app = new HybridMasterApp();
        console.log('✅ Application démarrée avec succès');
    } catch (error) {
        console.error('💥 Erreur fatale au démarrage:', error);
    }
});

export default HybridMasterApp;
