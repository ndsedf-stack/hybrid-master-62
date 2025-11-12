// scripts/app.js
// Point d'entrée principal de l'application

// ====================================================================
// IMPORTS
// ====================================================================
import programData from './program-data.js';
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
    
    this.programData = programData;
    
    this.timer = new TimerManager();
    this.renderer = new WorkoutRenderer();
    this.renderer.setTimerManager(this.timer);
    
    this.navigation = new NavigationUI(
      (week, day) => this.loadWorkout(week, day),
      () => this.showHome()
    );
    
    this.theme = new ThemeSwitcher();
    
    this.home = new HomeRenderer(
      'app',
      (dayData) => this.handleDaySelection(dayData)
    );
    
    this.currentWeek = 1;
    this.currentDay = null;
    
    console.log('✅ Modules initialisés');
  }
  
  async init() {
    console.log('🔧 Initialisation des composants...');
    
    try {
      this.timer.init();
      console.log('✅ Timer initialisé');
      
      this.renderer.init();
      console.log('✅ Renderer initialisé');
      
      this.navigation.init();
      console.log('✅ Navigation initialisée');
      
      this.theme.init();
      console.log('✅ Thème initialisé');
      
      this.showHome();
      console.log('✅ Page d\'accueil affichée');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }
  
  showHome() {
    console.log('🏠 Affichage de la page d\'accueil...');
    
    const container = document.getElementById('app');
    if (!container) {
      console.error('❌ Container #app introuvable');
      return;
    }
    
    const weekData = this.programData.getWeek(this.currentWeek);
    
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
    
    this.home.render(container, formattedData);
    
    // ✅ CORRECTION : Vérifier si la méthode existe
    const weekLabel = document.getElementById('current-week-label');
    if (weekLabel) {
      weekLabel.textContent = `Semaine ${this.currentWeek}`;
    }
    
    this.currentDay = null;
  }
  
  handleDaySelection(dayData) {
    console.log('📅 Jour sélectionné:', dayData);
    this.loadWorkout(this.currentWeek, dayData.day);
  }
  
  loadWorkout(week, day) {
    console.log(`💪 Chargement séance: Semaine ${week}, ${day}`);
    
    try {
      const workout = this.programData.getWorkout(week, day);
      
      if (!workout) {
        console.error('❌ Séance introuvable');
        return;
      }
      
      const dayData = {
        day: day,
        location: this.getLocation(day),
        name: workout.name,
        duration: workout.duration,
        totalSets: workout.totalSets,
        exercises: workout.exercises
      };
      
      console.log('📋 Données séance:', dayData);
      
      const container = document.getElementById('app');
      this.renderer.render(container, dayData);
      
      this.currentWeek = week;
      this.currentDay = day;
      
      // ✅ CORRECTION : Mettre à jour manuellement
      const weekLabel = document.getElementById('current-week-label');
      if (weekLabel) {
        weekLabel.textContent = `Semaine ${week}`;
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement séance:', error);
    }
  }
  
  getLocation(day) {
    if (day === 'dimanche' || day === 'maison') {
      return 'Maison';
    }
    return 'Salle';
  }
  
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

document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 DOM chargé, démarrage application...');
  
  try {
    window.app = new HybridMasterApp();
    await window.app.init();
    console.log('✅ Application démarrée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    
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
