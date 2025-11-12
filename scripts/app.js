import ProgramData from './program-data.js';
import WorkoutRenderer from './ui/workout-renderer.js';
import TimerManager from './modules/timer-manager.js';
import { HomeRenderer } from './modules/home-renderer.js';
import ThemeSwitcher from './ui/theme-switcher.js';

class App {
  constructor() {
    this.renderer = new WorkoutRenderer();
    this.timer = new TimerManager();
    this.weekNumber = 1;
    this.dayName = null; // ✅ Pas de jour présélectionné
    
    // ✅ CORRECTION CRITIQUE : Attacher le timer AVANT d'initialiser le renderer
    this.renderer.setTimerManager(this.timer);
    
    // ✅ onDaySelected branché directement
    this.home = new HomeRenderer('homeRoot', (day, week) => {
      this.dayName = day;
      this.weekNumber = week;
      this.renderWorkout();
    });
    this.theme = new ThemeSwitcher();
  }

  async init() {
    console.log('🚀 Initialisation de l\'app...');
    
    // ✅ ORDRE CORRECT : Timer d'abord !
    this.timer.init();
    this.renderer.init();
    this.theme.init();
    
    console.log('✅ Timer initialisé:', !!this.timer);
    console.log('✅ Renderer initialisé avec timer:', !!this.renderer.timerManager);
    
    this.home.render(this.weekNumber, this.dayName);
    
    // ✅ Ne pas afficher les exercices au démarrage
    if (this.dayName) {
      this.renderWorkout();
    }
    
    this.attachEvents();
  }

  renderWorkout() {
    // ✅ Vérification si un jour est sélectionné
    if (!this.dayName) {
      this.renderer.renderEmpty('Sélectionnez un jour');
      return;
    }
    
    const week = ProgramData.getWeek(this.weekNumber);
    const workoutDay = ProgramData.getWorkout(this.weekNumber, this.dayName);
    
    if (!workoutDay || !workoutDay.exercises || workoutDay.exercises.length === 0) {
      this.renderer.renderEmpty(this.dayName);
      return;
    }
    
    workoutDay.name = this.capitalize(this.dayName);
    workoutDay.muscles = this.extractMuscles(workoutDay.exercises);
    
    this.renderer.render(workoutDay, week);
    this.renderer.renderSupersets(this.weekNumber, this.dayName);
    
    const label = document.getElementById('current-week-label');
    if (label) label.textContent = `Semaine ${this.weekNumber}`;
  }

  attachEvents() {
    document.getElementById('nav-prev-week')?.addEventListener('click', () => {
      if (this.weekNumber > 1) {
        this.weekNumber--;
        this.home.render(this.weekNumber, this.dayName);
        if (this.dayName) {
          this.renderWorkout();
        }
      }
    });
    
    document.getElementById('nav-next-week')?.addEventListener('click', () => {
      if (this.weekNumber < 26) {
        this.weekNumber++;
        this.home.render(this.weekNumber, this.dayName);
        if (this.dayName) {
          this.renderWorkout();
        }
      }
    });
  }

  findExerciseById(id) {
    const workout = ProgramData.getWorkout(this.weekNumber, this.dayName);
    return workout?.exercises?.find(ex => ex.id === id || ex.name === id);
  }

  extractMuscles(exercises) {
    const muscles = new Set();
    exercises.forEach(ex => {
      if (Array.isArray(ex.muscle)) ex.muscle.forEach(m => muscles.add(m));
    });
    return Array.from(muscles);
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM chargé, démarrage de l\'app...');
  const app = new App();
  app.init();
});
