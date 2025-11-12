/**
 * HYBRID MASTER 51 - APPLICATION PRINCIPALE
 */

// ✅ IMPORTS CORRIGÉS selon la structure réelle
import { PROGRAM_DATA } from './scripts/program-data.js';  // Dans scripts/
import WorkoutRenderer from './ui/workout-renderer.js';  // Dans scripts/ui/
import TimerManager from './modules/timer-manager.js';  // Dans scripts/modules/
import { NavigationUI } from './ui/navigation-ui.js';  // Dans scripts/ui/
import ThemeSwitcher from './ui/theme-switcher.js';  // Dans scripts/ui/
import { HomeRenderer } from './modules/home-renderer.js';  // Dans scripts/modules/

class App {
  constructor() {
    console.log('🚀 Initialisation de Hybrid Master 51...');
    
    // 1️⃣ CRÉER LE TIMER EN PREMIER
    this.timer = new TimerManager();
    
    // 2️⃣ CRÉER LE RENDERER AVEC LE TIMER
    this.renderer = new WorkoutRenderer();
    this.renderer.setTimerManager(this.timer); // ✅ CONNECTER IMMÉDIATEMENT
    
    // 3️⃣ CRÉER LES AUTRES COMPOSANTS
    this.navigation = new NavigationUI();
    this.themeSwitcher = new ThemeSwitcher();
    this.home = new HomeRenderer();
    this.programData = PROGRAM_DATA;
    
    console.log('✅ Timer connecté au renderer');
  }

  async init() {
    try {
      console.log('🔧 Initialisation des composants...');
      
      // Initialiser le timer EN PREMIER
      this.timer.init();
      console.log('✅ Timer initialisé');
      
      // Initialiser le renderer
      this.renderer.init();
      console.log('✅ Renderer initialisé');
      
      // Initialiser la navigation
      this.navigation.init();
      console.log('✅ Navigation initialisée');
      
      // Initialiser le theme switcher
      this.themeSwitcher.init();
      console.log('✅ Theme switcher initialisé');
      
      // Setup les callbacks de navigation
      this.setupNavigationCallbacks();
      
      // Afficher la page d'accueil
      this.showHome();
      
      console.log('✅ Application initialisée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }

  setupNavigationCallbacks() {
    // Callback quand on change de semaine
    this.navigation.onWeekChange = (week, day) => {
      console.log(`📅 Navigation: Semaine ${week}, ${day}`);
      this.showWorkout(week, day);
    };

    // Callback quand on change de jour
    this.navigation.onDayChange = (week, day) => {
      console.log(`📅 Changement de jour: ${day}`);
      this.showWorkout(week, day);
    };
  }

  showHome() {
    const container = document.getElementById('workout-container');
    if (!container) {
      console.error('❌ Container workout-container introuvable');
      return;
    }

    // 🔍 DEBUG : Vérifier la structure des données
    console.log('🔍 DEBUG programData:', this.programData);
    console.log('🔍 DEBUG weeks:', this.programData?.weeks);
    console.log('🔍 DEBUG firstWeek:', this.programData?.weeks?.[0]);

    // Callback quand on sélectionne un jour depuis l'accueil
    this.home.onDaySelect = (day) => {
      const state = this.navigation.getState();
      this.navigation.selectDay(day);
      this.showWorkout(state.week, day);
    };

    // Afficher l'accueil
    console.log('🏠 Appel de home.render...');
    this.home.render(container, this.programData);
    console.log('✅ home.render terminé');
  }

  showWorkout(week, day) {
    console.log(`💪 Affichage workout: Semaine ${week}, ${day}`);
    
    const container = document.getElementById('workout-container');
    if (!container) {
      console.error('❌ Container introuvable');
      return;
    }

    // Trouver les données de la semaine
    const weekData = this.programData.weeks.find(w => w.week === week);
    if (!weekData) {
      console.error(`❌ Données introuvables pour semaine ${week}`);
      container.innerHTML = '<p>Données de la semaine introuvables.</p>';
      return;
    }

    // Trouver les données du jour
    const dayData = weekData.days.find(d => d.day === day);
    if (!dayData) {
      console.error(`❌ Données introuvables pour ${day}`);
      container.innerHTML = '<p>Aucun entraînement prévu ce jour.</p>';
      return;
    }

    // Afficher le workout avec le timer connecté
    console.log('✅ Rendu du workout avec timer connecté');
    this.renderer.renderWorkout(container, dayData, week, day);
  }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM chargé, démarrage de l\'application...');
  const app = new App();
  app.init();
});
