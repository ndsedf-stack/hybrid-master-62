// scripts/app.js
// Point d'entrée principal de l'application

// ====================================================================
// IMPORTS
// ====================================================================
import programData from './program-data.js'; // ← CHANGÉ : default export
import WorkoutRenderer from './ui/workout-renderer.js';
import TimerManager from './modules/timer-manager.js';
import { NavigationUI } from './ui/navigation-ui.js';
import ThemeSwitcher from './ui/theme-switcher.js';
import { HomeRenderer } from './modules/home-renderer.js';

// ====================================================================
// CLASSE PRINCIPALE APPLICATION
// ====================================================================
class HybridMasterApp {
  constructor() {
    console.log('🚀 Initialisation de l\'application...');
    
    // Récupérer les données du programme
    this.programData = programData; // ← Instance de ProgramData
    
    // Initialiser les modules
    this.timer = new TimerManager();
    this.renderer = new WorkoutRenderer();
    this.renderer.setTimerManager(this.timer); // ✅ CONNEXION IMMÉDIATE
    
    this.navigation = new NavigationUI(
      (week, day) => this.loadWorkout(week, day),
      () => this.showHome()
    );
    
    this.theme = new ThemeSwitcher();
    
    this.home = new HomeRenderer(
      'app',
      (dayData) => this.handleDaySelection(dayData)
    );
    
    // État actuel
    this.currentWeek = 1;
    this.currentDay = null;
    
    console.log('✅ Modules initialisés');
  }
  
  // ====================================================================
  // INITIALISATION
  // ====================================================================
  async init() {
    console.log('🔧 Initialisation des composants...');
    
    try {
      // Initialiser le timer
      this.timer.init();
      console.log('✅ Timer initialisé');
      
      // Initialiser le renderer
      this.renderer.init();
      console.log('✅ Renderer initialisé');
      
      // Initialiser la navigation
      this.navigation.init();
      console.log('✅ Navigation initialisée');
      
      // Initialiser le thème
      this.theme.init();
      console.log('✅ Thème initialisé');
      
      // Afficher l'accueil
      this.showHome();
      console.log('✅ Page d\'accueil affichée');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }
  
  // ====================================================================
  // AFFICHAGE PAGE D'ACCUEIL
  // ====================================================================
  showHome() {
    console.log('🏠 Affichage de la page d\'accueil...');
    
    const container = document.getElementById('app');
    if (!container) {
      console.error('❌ Container #app introuvable');
      return;
    }
    
    // Préparer les données pour le home renderer
    const weekData = this.programData.getWeek(this.currentWeek);
    
    // Convertir la structure pour le renderer
    const formattedData = {
      weeks: [{
        week: this.currentWeek,
        days: [
          { ...weekData.dimanche, day: 'dimanche', location: 'Maison' },
          { ...weekData.mardi, day: 'mardi', location: 'Salle' },
          { ...weekData.vendredi, day: 'vendredi', location: 'Salle' },
          { ...weekData.maison, day: 'maison', location: 'Maison' }
        ]
      }]
    };
    
    console.log('📊 Données formatées:', formattedData);
    
    // Afficher la page d'accueil
    this.home.render(container, formattedData);
    
    // Mettre à jour la navigation (si la méthode existe)
    if (this.navigation && typeof this.navigation.updateWeekDisplay === 'function') {
      this.navigation.updateWeekDisplay(this.currentWeek);
    } else {
      // Mettre à jour manuellement le label de semaine
      const weekLabel = document.getElementById('current-week-label');
      if (weekLabel) {
        weekLabel.textContent = `Semaine ${this.currentWeek}`;
      }
    }
    this.currentDay = null;
  }
  
  // ====================================================================
  // SÉLECTION D'UN JOUR
  // ====================================================================
  handleDaySelection(dayData) {
    console.log('📅 Jour sélectionné:', dayData);
    
    // Charger la séance
    this.loadWorkout(this.currentWeek, dayData.day);
  }
  
  // ====================================================================
  // CHARGER UNE SÉANCE
  // ====================================================================
  loadWorkout(week, day) {
    console.log(`💪 Chargement séance: Semaine ${week}, ${day}`);
    
    try {
      // Récupérer les données de la séance
      const workout = this.programData.getWorkout(week, day);
      
      if (!workout) {
        console.error('❌ Séance introuvable');
        return;
      }
      
      // Préparer les données pour le renderer
      const dayData = {
        day: day,
        location: this.getLocation(day),
        name: workout.name,
        duration: workout.duration,
        totalSets: workout.totalSets,
        exercises: workout.exercises
      };
      
      console.log('📋 Données séance:', dayData);
      
      // Afficher la séance
      const container = document.getElementById('app');
      this.renderer.render(container, dayData);
      
      // Mettre à jour l'état
      this.currentWeek = week;
      this.currentDay = day;
      this.navigation.updateWeekDisplay(week);
      
    } catch (error) {
      console.error('❌ Erreur chargement séance:', error);
    }
  }
  
  // ====================================================================
  // HELPER : Déterminer la location
  // ====================================================================
  getLocation(day) {
    if (day === 'dimanche' || day === 'maison') {
      return 'Maison';
    }
    return 'Salle';
  }
  
  // ====================================================================
  // NAVIGATION SEMAINES
  // ====================================================================
  nextWeek() {
    if (this.currentWeek < 26) {
      this.currentWeek++;
      if (this.currentDay) {
        this.loadWorkout(this.currentWeek, this.currentDay);
      } else {
        this.showHome();
      }
    }
  }
  
  previousWeek() {
    if (this.currentWeek > 1) {
      this.currentWeek--;
      if (this.currentDay) {
        this.loadWorkout(this.currentWeek, this.currentDay);
      } else {
        this.showHome();
      }
    }
  }
}

// ====================================================================
// INITIALISATION APPLICATION
// ====================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 DOM chargé, démarrage application...');
  
  try {
    // Créer l'instance de l'application
    window.app = new HybridMasterApp();
    
    // Initialiser
    await window.app.init();
    
    console.log('✅ Application démarrée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    
    // Afficher un message d'erreur à l'utilisateur
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>❌ Erreur de chargement</h2>
          <p>${error.message}</p>
          <button onclick="location.reload()">Recharger</button>
        </div>
      `;
    }
  }
});
