// ==================================================================
// HOME RENDERER - Affichage de la page d'accueil
// ==================================================================

export class HomeRenderer {
  constructor(containerId, onDaySelected) {
    this.containerId = containerId;
    this.onDaySelected = onDaySelected;
    console.log('🏠 HomeRenderer créé');
  }

  render(container, weekData) {
    console.log('📝 HomeRenderer.render() appelé avec:', weekData);
    
    if (!weekData || !weekData.days) {
      console.error('❌ weekData invalide:', weekData);
      return '<div style="padding: 20px; color: #ff4444;">Erreur: données de semaine invalides</div>';
    }

    const { weekNumber, block, technique, isDeload, days } = weekData;

    // Génération des cartes pour chaque jour
    const cardsHtml = days.map(dayObj => {
      const { day, data } = dayObj;
      
      if (!data) {
        return `
          <div class="workout-card" data-day="${day.toLowerCase()}">
            <h3>${day}</h3>
            <p style="color: #888;">Aucun workout</p>
          </div>
        `;
      }

      const { name, duration, exercises } = data;
      const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
      const emoji = this.getDayEmoji(day.toLowerCase());

      return `
        <div class="workout-card" data-day="${day.toLowerCase()}">
          <div class="workout-card-header">
            <span class="workout-emoji">${emoji}</span>
            <h3 class="workout-day">${day}</h3>
          </div>
          
          <h4 class="workout-name">${name}</h4>
          
          <div class="workout-stats">
            <div class="workout-stat">
              <span class="stat-icon">⏱️</span>
              <span class="stat-value">${duration}</span>
              <span class="stat-label">min</span>
            </div>
            
            <div class="workout-stat">
              <span class="stat-icon">💪</span>
              <span class="stat-value">${totalSets}</span>
              <span class="stat-label">séries</span>
            </div>
            
            <div class="workout-stat">
              <span class="stat-icon">🏋️</span>
              <span class="stat-value">${exercises.length}</span>
              <span class="stat-label">exercices</span>
            </div>
          </div>
          
          <button class="workout-card-start btn-primary" data-day="${day.toLowerCase()}">
            COMMENCER →
          </button>
        </div>
      `;
    }).join('');

    // Génération de l'info de semaine
    const weekInfoHtml = `
      <div class="week-info-banner">
        <div class="week-info-content">
          <span class="week-block">Bloc ${block}</span>
          <span class="week-technique">${technique}</span>
          ${isDeload ? '<span class="week-deload">🔄 Deload</span>' : ''}
        </div>
      </div>
    `;

    // HTML complet de la page d'accueil
    const html = `
      ${weekInfoHtml}
      <div class="workouts-grid">
        ${cardsHtml}
      </div>
    `;

    console.log('✅ HTML généré, longueur:', html.length);
    return html;
  }

  getDayEmoji(day) {
    const emojis = {
      'dimanche': '🏋️',
      'mardi': '💪',
      'vendredi': '🔥',
      'maison': '🏠'
    };
    return emojis[day] || '💪';
  }
}
