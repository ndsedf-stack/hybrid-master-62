// ==================================================================
// APP.JS - VERSION COMPLÈTE CORRIGÉE
// ==================================================================

import programData from './program-data.js';
// Exposer programData globalement pour superset-injector
window.programData = programData;
console.log('✅ programData exposé globalement', programData);
import { HomeRenderer } from './modules/home-renderer.js';
import { WorkoutRenderer } from './ui/workout-renderer.js';
import TimerManager from './modules/timer-manager.js';

class HybridMasterApp {
  constructor() {
    this.currentWeek = 1;
    this.currentView = 'home';
    this.currentDay = null;
    
    // Initialisation des renderers
    this.homeRenderer = new HomeRenderer('content', this.handleDaySelected.bind(this));
    this.workoutRenderer = new WorkoutRenderer(
      document.getElementById('content'),
      this.handleBackToHome.bind(this)
    );
    
    // Initialisation du TimerManager
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
      
      
      // Connecter le timer au WorkoutRenderer
      this.workoutRenderer.setTimerManager(this.timerManager);
      
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
    // Boutons navigation semaines
    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentWeek > 1) {
          this.currentWeek--;
          this.updateWeekLabel();
          if (this.currentView === 'home') {
            this.showHome();
          } else if (this.currentDay) {
            this.showWorkout(this.currentDay);
          }
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentWeek < 26) {
          this.currentWeek++;
          this.updateWeekLabel();
          if (this.currentView === 'home') {
            this.showHome();
          } else if (this.currentDay) {
            this.showWorkout(this.currentDay);
          }
        }
      });
    }
  }

  updateWeekLabel() {
    // Mise à jour du label de semaine
    const weekLabel = document.getElementById('current-week-label');
    if (weekLabel) {
      weekLabel.textContent = `Semaine ${this.currentWeek}`;
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

      // Mise à jour du label de semaine
      this.updateWeekLabel();
      
      // Préparation des données pour le HomeRenderer
      const daysArray = ['dimanche', 'mardi', 'vendredi', 'maison'].map(day => {
        const workout = weekData[day];
        return {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          name: workout?.name || 'Entraînement',
          duration: workout?.duration || 60,
          exercises: workout?.exercises || [],
          block: weekData.block,
          tempo: weekData.technique
        };
      });

      // Rendu de la page d'accueil
      const contentElement = document.getElementById('content');
      if (!contentElement) {
        throw new Error('Élément #content introuvable');
      }

      // Format attendu par HomeRenderer
      const formattedWeekData = {
        weekNumber: this.currentWeek,
        block: weekData.block,
        technique: weekData.technique,
        isDeload: weekData.isDeload,
        days: daysArray
      };

      contentElement.innerHTML = this.homeRenderer.render(formattedWeekData);
      
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
    const startButtons = document.querySelectorAll('.card-button');
    console.log(`🔘 ${startButtons.length} boutons COMMENCER trouvés`);
    
    startButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.workout-card');
        const day = card?.dataset.day;
        if (day) {
          console.log(`📅 Clic sur carte: ${day}`);
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

      console.log(`✅ Workout récupéré: ${workout.name}`);
      
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
    this.showHome();
  }

  showError(message) {
    const contentElement = document.getElementById('content');
    if (contentElement) {
      contentElement.innerHTML = `
        <div class="error-message" style="padding: 20px; text-align: center;">
          <h2 style="color: #ff4444;">❌ Erreur</h2>
          <p style="color: #fff; margin: 20px 0;">${message}</p>
          <button onclick="location.reload()" class="btn-primary" style="padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🔄 Recharger la page
          </button>
        </div>
      `;
    }
  }

  startWorkout(day) {
    console.log('🏋️ startWorkout appelé pour:', day);
    this.handleDaySelected(day.toLowerCase());
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM chargé, initialisation de l\'app...');
  
  try {
    const app = new HybridMasterApp();
    app.init();
    
    // Exposition globale pour le debug
    window.app = app;
    console.log('✅ App exposée dans window.app');
    
    // Exposition de startWorkout pour les boutons onclick
    window.startWorkout = function(day) {
      console.log('🏋️ window.startWorkout appelé:', day);
      if (window.app) {
        window.app.startWorkout(day);
      } else {
        console.error('❌ App non disponible');
      }
    };
    console.log('✅ window.startWorkout exposée');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    const contentElement = document.getElementById('content');
    if (contentElement) {
      contentElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2 style="color: #ff0000;">❌ Erreur fatale</h2>
          <p style="color: #fff;">${error.message}</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🔄 Recharger
          </button>
        </div>
      `;
    }
  }
});
