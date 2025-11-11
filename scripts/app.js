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
    this.dayName = 'dimanche';
    // ✅ onDaySelected branché directement
    this.home = new HomeRenderer('homeRoot', (day, week) => {
      this.dayName = day;
      this.weekNumber = week;
      this.renderWorkout();
    });
    this.theme = new ThemeSwitcher();
  }

  async init() {
    this.renderer.init();
    this.timer.init();
    this.renderer.setTimerManager(this.timer); // ✅ utiliser le setter prévu

    this.theme.init();
    this.home.render(this.weekNumber, this.dayName);
    this.renderWorkout();
    this.attachEvents();
  }

  renderWorkout() {
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
        this.renderWorkout();
      }
    });

    document.getElementById('nav-next-week')?.addEventListener('click', () => {
      if (this.weekNumber < 26) {
        this.weekNumber++;
        this.home.render(this.weekNumber, this.dayName);
        this.renderWorkout();
      }
    });

    // ✅ déclenche uniquement quand on clique sur la petite case .serie-check
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.serie-check');
      if (!btn) return;

      const exerciseId = btn.dataset.exerciseId;
      const setNumber = parseInt(btn.dataset.setNumber, 10);
      const serieItem = btn.closest('.serie-item');
      if (serieItem) serieItem.classList.add('completed');

      // met visuellement la coche
      const iconEl = btn.querySelector('.check-icon');
      if (iconEl) iconEl.textContent = '✓';
      btn.disabled = true;

      const exercise = this.findExerciseById(exerciseId);
      if (exercise) {
        const restTime = exercise.rest || 90;
        const totalSets = typeof exercise.sets === 'number'
          ? exercise.sets
          : Array.isArray(exercise.sets) ? exercise.sets.length : 0;

        this.timer.start(restTime, exercise.name || exerciseId, setNumber, totalSets);
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
  const app = new App();
  app.init();
});
