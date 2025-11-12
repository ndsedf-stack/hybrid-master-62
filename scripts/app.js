// ==================================================================
// HYBRID MASTER 61 - APP PRINCIPAL FINAL CORRIGÉ
// ==================================================================

console.log('🚀 app.js chargé - Version FINALE COMPLÈTE');

// ==================================================================
// IMPORTS
// ==================================================================
import programData from './program-data.js';
import { NavigationUI } from './ui/navigation-ui.js';
import { HomeRenderer } from './modules/home-renderer.js';
import { WorkoutRenderer } from './ui/workout-renderer.js';
import TimerManager from './modules/timer-manager.js';

// ==================================================================
// CLASSE PRINCIPALE
// ==================================================================
class HybridMasterApp {
    constructor() {
        console.log('🏗️ Initialisation HybridMasterApp');
        
        this.programData = programData;
        this.currentWeek = 1;
        this.currentView = 'home'; // 🔥 Démarrer sur HOME
        
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
            () => this.handleBackToHome() // 🔥 Callback retour
        );
        
        // Initialiser le timer
        this.timerManager = new TimerManager();
        this.timerManager.init(); // 🔥 IMPORTANT : Initialiser le timer
        this.workoutRenderer.setTimerManager(this.timerManager);
        
        console.log('✅ Composants UI initialisés');
        
        // Démarrer l'application
        this.init();
    }
    
    init() {
        console.log('🎬 Démarrage application');
        
        try {
            const weekData = this.programData.getWeek(this.currentWeek);
            console.log('✅ weekData reçu:', weekData);
            
            if (!weekData) {
                throw new Error('getWeek() a retourné undefined');
            }
            
            console.log('✅ Données programme chargées');
            this.showHome();
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            this.showError('Impossible de charger les données du programme');
        }
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
            console.log('🔍 showHome - weekData:', weekData);
            
            if (!weekData) {
                throw new Error(`Données semaine ${this.currentWeek} introuvables`);
            }
            
            // 🔥 CONVERSION : weekData a la structure {dimanche: {...}, mardi: {...}, vendredi: {...}, maison: {...}}
            const daysArray = [
                { 
                    day: "Dimanche", 
                    location: weekData.dimanche.name, 
                    exercises: weekData.dimanche.exercises,
                    duration: weekData.dimanche.duration,
                    totalSets: weekData.dimanche.totalSets
                },
                { 
                    day: "Mardi", 
                    location: weekData.mardi.name, 
                    exercises: weekData.mardi.exercises,
                    duration: weekData.mardi.duration,
                    totalSets: weekData.mardi.totalSets
                },
                { 
                    day: "Vendredi", 
                    location: weekData.vendredi.name, 
                    exercises: weekData.vendredi.exercises,
                    duration: weekData.vendredi.duration,
                    totalSets: weekData.vendredi.totalSets
                },
                { 
                    day: "Maison", 
                    location: weekData.maison.name, 
                    exercises: weekData.maison.exercises,
                    duration: weekData.maison.duration,
                    totalSets: weekData.maison.totalSets
                }
            ];
            
            console.log('✅ daysArray créé:', daysArray);
            
            this.homeRenderer.render(daysArray, this.currentWeek);
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
            console.log('🔍 showWorkout - weekData:', weekData);
            
            if (!weekData) {
                throw new Error(`Données semaine ${this.currentWeek} introuvables`);
            }
            
            // 🔥 CONVERSION : Construire daysArray depuis weekData
            const daysArray = [
                { 
                    day: "Dimanche", 
                    location: weekData.dimanche.name, 
                    exercises: weekData.dimanche.exercises,
                    duration: weekData.dimanche.duration,
                    totalSets: weekData.dimanche.totalSets
                },
                { 
                    day: "Mardi", 
                    location: weekData.mardi.name, 
                    exercises: weekData.mardi.exercises,
                    duration: weekData.mardi.duration,
                    totalSets: weekData.mardi.totalSets
                },
                { 
                    day: "Vendredi", 
                    location: weekData.vendredi.name, 
                    exercises: weekData.vendredi.exercises,
                    duration: weekData.vendredi.duration,
                    totalSets: weekData.vendredi.totalSets
                },
                { 
                    day: "Maison", 
                    location: weekData.maison.name, 
                    exercises: weekData.maison.exercises,
                    duration: weekData.maison.duration,
                    totalSets: weekData.maison.totalSets
                }
            ];
            
            const dayData = daysArray.find(d => 
                d.day.toLowerCase() === day.toLowerCase()
            );
            
            console.log('🔍 dayData trouvé:', dayData);
            
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
