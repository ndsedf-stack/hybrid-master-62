// scripts/app.js
// Point d'entrée principal de l'application

// ====================================================================
// IMPORTS
// ====================================================================
import programData from './program-data.js';
import { NavigationUI } from './modules/navigation-ui.js';
import { HomeRenderer } from './modules/home-renderer.js';
import { WorkoutRenderer } from './modules/workout-renderer.js'; // ← AJOUTÉ
import { Timer } from './modules/timer.js';
import { StorageManager } from './modules/storage-manager.js';
import { ThemeManager } from './modules/theme-manager.js';

// ====================================================================
// APPLICATION PRINCIPALE
// ====================================================================
class HybridMasterApp {
  constructor() {
    console.log('🚀 Initialisation HybridMasterApp...');
    
    this.programData = programData;
    this.currentWeek = 1;
    this.currentDay = null;
    
    // Modules UI
    this.navigation = null;
    this.home = null;
    this.workoutRenderer = null; // ← CHANGÉ : nom plus explicite
    this.timer = null;
    this.storage = null;
    this.theme = null;
  }

  async init() {
    try {
      console.log('🔧 Initialisation des modules...');
      
      // Initialiser le stockage
      this.storage = new StorageManager();
      await this.storage.init();
      console.log('✅ Storage initialisé');

      // Initialiser le timer
      this.timer = new Timer();
      console.log('✅ Timer initialisé');

      // Initialiser le renderer de workout
      this.workoutRenderer = new WorkoutRenderer(this.timer, this.storage); // ← CHANGÉ
      console.log('✅ Workout renderer initialisé');

      // Initialiser la navigation
      this.navigation = new NavigationUI(
        (week) => this.handleWeekChange(week),
        () => this.showHome()
      );
      console.log('✅ Navigation initialisée');

      // Initialiser le home renderer
      this.home = new HomeRenderer(
        (dayData) => this.handleDaySelection(dayData)
      );
      console.log('✅ Home renderer initialisé');

      // Initialiser le thème
      this.theme = new ThemeManager();
      console.log('✅ Thème initialisé');

      // Afficher la page d'accueil
      this.showHome();
      console.log('✅ Page d\'accueil affichée');

      console.log('✅ Application démarrée avec succès !');
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
    }
  }

  showHome() {
    console.log('🏠 Affichage page d\'accueil');
    
    const container = document.getElementById('app');
    if (!container) {
      console.error('❌ Container #app introuvable');
      return;
    }

    // Récupérer les données de la première semaine
    const firstWeekData = this.programData.getWeek(this.currentWeek);
    
    // Formatter les données pour le home renderer
    const formattedData = {
      week: this.currentWeek,
      days: [
        { ...firstWeekData.dimanche, day: 'dimanche', location: 'Maison' },
        { ...firstWeekData.mardi, day: 'mardi', location: 'Salle' },
        { ...firstWeekData.vendredi, day: 'vendredi', location: 'Salle' },
        { ...firstWeekData.maison, day: 'maison', location: 'Maison' }
      ]
    };

    // Afficher la page d'accueil
    this.home.render(container, formattedData);

    // Mettre à jour le label de semaine dans la navigation
    const weekLabel = document.getElementById('current-week-label');
    if (weekLabel) {
      weekLabel.textContent = `Semaine ${this.currentWeek}`;
    }

    this.currentDay = null;
  }

  handleDaySelection(dayData) {
    console.log('🎯 Jour sélectionné:', dayData);
    this.loadWorkout(this.currentWeek, dayData.day);
  }

  handleWeekChange(week) {
    console.log('📅 Changement de semaine:', week);
    this.currentWeek = week;
    
    if (this.currentDay) {
      this.loadWorkout(week, this.currentDay);
    } else {
      this.showHome();
    }
  }

  loadWorkout(week, day) {
    console.log(`💪 Chargement séance: Semaine ${week}, ${day}`);
    
    const container = document.getElementById('app');
    if (!container) {
      console.error('❌ Container #app introuvable');
      return;
    }

    try {
      // Récupérer les données de la séance
      const workout = this.programData.getWorkout(week, day);
      console.log('📋 Données séance:', workout);

      if (!workout) {
        console.error('❌ Aucune séance trouvée');
        container.innerHTML = '<p>Aucune séance trouvée pour ce jour.</p>';
        return;
      }

      // Mettre à jour l'état
      this.currentWeek = week;
      this.currentDay = day;

      // Mettre à jour le label de semaine
      const weekLabel = document.getElementById('current-week-label');
      if (weekLabel) {
        weekLabel.textContent = `Semaine ${week}`;
      }

      // Afficher la séance avec le WorkoutRenderer
      console.log('🎨 Rendu de la séance...');
      this.workoutRenderer.render(container, workout, week, day); // ← CHANGÉ
      console.log('✅ Séance affichée');

    } catch (error) {
      console.error('❌ Erreur chargement séance:', error);
      container.innerHTML = `<p>Erreur lors du chargement de la séance: ${error.message}</p>`;
    }
  }
}

// ====================================================================
// DÉMARRAGE APPLICATION
// ====================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 DOM chargé, démarrage application...');
  const app = new HybridMasterApp();
  await app.init();
});
