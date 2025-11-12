// ==================================================================
// APP.JS - Application principale CORRIGÉE
// ==================================================================

import programData from './program-data.js';
import { HomeRenderer } from './modules/home-renderer.js';      // ✅ CORRIGÉ : modules/
import { WorkoutRenderer } from './ui/workout-renderer.js';     // ✅ ui/
import { NavigationUI } from './ui/navigation-ui.js';           // ✅ ui/
import { TimerManager } from './modules/timer-manager.js';      // ✅ modules/

class HybridMasterApp {
  constructor() {
    this.currentWeek = 1;
    this.currentView = 'home';
    this.currentDay = null;
    
    // Initialisation des modules UI
    this.navigationUI = new NavigationUI();
    this.homeRenderer = new HomeRenderer('content', this.handleDaySelected.bind(this));
    this.workoutRenderer = new WorkoutRenderer(
      document.getElementById('content'),
      this.handleBackToHome.bind(this)
    );
    this.timerManager = new TimerManager();
    
    console.log('✅ App initialisée');
  }

  init() {
    console.log('🚀 Démarrage de l\'application...');
    
    try {
      // Test de chargement des données
      const week1 = programData.getWeek(1);
      if (!week1) {
        throw new Error('Données de la semaine 1 introuvables');
      }
      
      console.log('✅ Données chargées:', week1);
      
      // Configuration de la navigation
      this.setupNavigation();
      
      // Affichage de la page d'accueil
      this.showHome();
      
      console.log('✅ Application prête !');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      this.showError('Impossible de charger les données du programme');
    }
  }

  setupNavigation() {
    // Écouteurs pour les boutons de navigation des semaines
    document.getElementById('nav-prev')?.addEventListener('click', () => {
      if (this.currentWeek > 1) {
        this.currentWeek--;
        this.navigationUI.setWeek(this.currentWeek);
        if (this.currentView === 'home') {
          this.showHome();
        } else if (this.currentDay) {
          this.showWorkout(this.currentDay);
        }
      }
    });

    document.getElementById('nav-next')?.addEventListener('click', () => {
      if (this.currentWeek < 26) {
        this.currentWeek++;
        this.navigationUI.setWeek(this.currentWeek);
        if (this.currentView === 'home') {
          this.showHome();
        } else if (this.currentDay) {
          this.showWorkout(this.currentDay);
        }
      }
    });

    // Écouteur pour le bouton retour (si présent dans la navigation)
    const backBtn = document.querySelector('.back-button');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.handleBackToHome());
    }
  }

  showHome() {
    console.log('🏠 Affichage de la page d\'accueil');
    
    try {
      this.currentView = 'home';
      this.currentDay = null;
      
      // Récupération des données de la semaine
      const weekData = programData.getWeek(this.currentWeek);
      
      if (!weekData) {
        throw new Error(`Semaine ${this.currentWeek} introuvable`);
      }

      // Mise à jour de l'affichage de la semaine dans la navigation
      this.navigationUI.setWeek(this.currentWeek);
      
      // Préparation des données pour le HomeRenderer
      const daysArray = ['dimanche', 'mardi', 'vendredi', 'maison'].map(day => {
        const workout = weekData[day];
        return {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          data: workout
        };
      });

      // Rendu de la page d'accueil
      const contentElement = document.getElementById('content');
      if (!contentElement) {
        throw new Error('Élément #content introuvable');
      }

      // Le HomeRenderer attend (container, weekData) où weekData a une propriété .days
      const formattedWeekData = {
        weekNumber: this.currentWeek,
        block: weekData.block,
        technique: weekData.technique,
        isDeload: weekData.isDeload,
        days: daysArray
      };

      contentElement.innerHTML = this.homeRenderer.render(contentElement, formattedWeekData);
      
      // Attache les écouteurs d'événements aux cartes
      this.attachHomeEventListeners();
      
      console.log('✅ Page d\'accueil affichée');
      
    } catch (error) {
      console.error('❌ Erreur affichage HOME:', error);
      this.showError(`Erreur lors de l'affichage de la page d'accueil: ${error.message}`);
    }
  }

  attachHomeEventListeners() {
    // Écouteurs pour les boutons "COMMENCER" des cartes
    const startButtons = document.querySelectorAll('.workout-card-start');
    startButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.workout-card');
        const day = card?.dataset.day;
        if (day) {
          this.handleDaySelected(day.toLowerCase());
        }
      });
    });
  }

  handleDaySelected(day) {
    console.log(`📅 Jour sélectionné: ${day}`);
    this.showWorkout(day);
  }

  showWorkout(day) {
    console.log(`💪 Affichage du workout: ${day}`);
    
    try {
      this.currentView = 'workout';
      this.currentDay = day;
      
      // Récupération des données du workout
      const workout = programData.getWorkout(this.currentWeek, day);
      
      if (!workout) {
        throw new Error(`Workout introuvable pour ${day} semaine ${this.currentWeek}`);
      }

      // Mise à jour de la navigation
      this.navigationUI.setDay(day);
      
      // Rendu du workout avec le WorkoutRenderer
      this.workoutRenderer.render(workout, this.currentWeek);
      
      console.log('✅ Workout affiché');
      
    } catch (error) {
      console.error('❌ Erreur affichage WORKOUT:', error);
      this.showError(`Erreur lors de l'affichage du workout: ${error.message}`);
    }
  }

  handleBackToHome() {
    console.log('🔙 Retour à l\'accueil');
    
    // Arrêt du timer si actif
    if (this.timerManager) {
      this.timerManager.stop();
    }
    
    this.showHome();
  }

  showError(message) {
    const contentElement = document.getElementById('content');
    if (contentElement) {
      contentElement.innerHTML = `
        <div class="error-message">
          <h2>❌ Erreur</h2>
          <p>${message}</p>
          <button onclick="location.reload()" class="btn-primary">
            🔄 Recharger la page
          </button>
        </div>
      `;
    }
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM chargé, initialisation de l\'app...');
  
  const app = new HybridMasterApp();
  app.init();
  
  // Exposition globale pour le debug
  window.app = app;
});
