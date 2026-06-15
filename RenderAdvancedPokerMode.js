// --- 4. MODE: ADVANCED POKER STRATEGY MATRIX (4-COLOR DECK + COMPACT AUTO-RESIZE) ---
function renderAdvancedPokerMode(card, container) {
  let playersHtml = '';
  let betsHtml = '';

  card.players.forEach(player => {
    let holeCardsHtml = '';
    if (player.isActive) {
      if (player.holeCards && player.holeCards.length > 0) {
        holeCardsHtml = player.holeCards.map(parseCardHtml).join('');
      } else {
        holeCardsHtml = parseCardHtml('??') + parseCardHtml('??');
      }
    }

    const isTurnClass = player.isTurn ? 'active-turn' : '';
    const isActiveClass = player.isActive ? '' : 'inactive';
    const dealerButtonHtml = player.position === 'BTN' ? '<div class="dealer-button">D</div>' : '';
    const heroLabel = player.isHero ? '<span class="hero-label">(H)</span>' : '';

    playersHtml += `
      <div class="player-seat seat-${player.position} ${isTurnClass} ${isActiveClass}">
        ${dealerButtonHtml}
        <div class="player-position">${player.position}${heroLabel}</div>
        <div class="player-stack">${player.stackSize}</div>
        <div class="hole-cards">${holeCardsHtml}</div>
      </div>
    `;

    if (parseFloat(player.currentBet) > 0) {
      betsHtml += `
        <div class="bet-indicator bet-${player.position}">
          ${generateChipStackHtml(player.currentBet)}
          <span>${player.currentBet}</span>
        </div>
      `;
    }
  });

  let communityCardsHtml = '';
  if (!card.communityCards || card.communityCards.length === 0) {
    communityCardsHtml = `<span class="preflop-runtime-badge">PREFLOP RUNTIME</span>`;
  } else {
    communityCardsHtml = card.communityCards.map(parseCardHtml).join('');
  }

  const categories = [...new Set(card.choices.map(c => c.targetCategory))];

  // 1. RANDOMIZE HAND ORDER
  const randomizedChoices = [...card.choices]
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  // 2. APPLY 4-COLOR DECK TO DRAGGABLE CARD TOKENS
  let draggablesHtml = randomizedChoices.map((c, i) => {
    const formattedHand = c.hand.replace(/([2-9TJQKA10]+)([hdcs])/gi, (match, val, suit) => {
      const s = suit.toLowerCase();
      const suitSymbols = { 'h': '♥', 'd': '♦', 'c': '♣', 's': '♠' };
      
      // 4-Color system colors calibrated for high contrast over dark slate tokens
      let color = '#f1f5f9';            // Spades = White/Slate
      if (s === 'h') color = '#ef4444'; // Hearts = Red
      if (s === 'd') color = '#60a5fa'; // Diamonds = Blue
      if (s === 'c') color = '#4ade80'; // Clubs = Green
      
      return `${val}<span style="color: ${color}; font-family: system-ui, sans-serif; margin-left: 2px; margin-right: 2px; font-size: 1.1em;">${suitSymbols[s] || s}</span>`;
    });

    return `
      <div draggable="true" data-target="${c.targetCategory}" id="poker-item-${i}" class="draggable-token" ondragstart="dragStart(event)">
        ${formattedHand}
      </div>
    `;
  }).join('');

  let dropzonesHtml = categories.map(cat => `
    <div class="dropzone-container">
      <h3 class="dropzone-header">${cat}</h3>
      <div data-cat="${cat}" class="dropzone" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="dropToMatch(event)"></div>
    </div>
  `).join('');

  container.innerHTML = `
    <style>
      /* --- EXTRACTED TAILWIND STYLES --- */
      .poker-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        flex-grow: 1;
      }
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: start;
        border-bottom: 1px solid rgba(51, 65, 85, 0.5);
        padding-bottom: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .badge-engine {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-family: monospace;
        background-color: rgba(6, 78, 59, 0.6);
        border: 1px solid rgba(4, 120, 87, 0.4);
        color: #10b981;
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
      }
      .header-title {
        font-size: 0.875rem;
        font-weight: 700;
        color: #ffffff;
        margin-top: 0.375rem;
      }
      .toggle-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background-color: rgba(15, 23, 42, 0.8);
        padding: 0.375rem 0.625rem;
        border: 1px solid rgba(51, 65, 85, 0.8);
        border-radius: 0.5rem;
        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        font-size: 11px;
      }
      .toggle-input {
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 0.25rem;
        color: #2563eb;
        background-color: #1e293b;
        border-color: #475569;
        cursor: pointer;
      }
      .toggle-label {
        color: #cbd5e1;
        font-weight: 500;
        cursor: pointer;
        user-select: none;
      }
      .display-text {
        font-size: 0.75rem;
        color: #cbd5e1;
        margin-bottom: 0.75rem;
        line-height: 1.625;
        background-color: rgba(15, 23, 42, 0.3);
        padding: 0.625rem;
        border: 1px solid rgba(51, 65, 85, 0.3);
        border-radius: 0.5rem;
      }
      .center-board {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        z-index: 10;
      }
      .community-cards {
        display: flex;
        gap: 0.375rem;
      }
      .preflop-runtime-badge {
        color: rgba(148, 163, 184, 0.5);
        font-family: monospace;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        border: 1px solid rgba(51, 65, 85, 0.4);
        padding: 0.375rem 1rem;
        background-color: rgba(15, 23, 42, 0.3);
        border-radius: 0.375rem;
      }
      @media (min-width: 640px) {
        .preflop-runtime-badge {
          font-size: 0.875rem;
        }
      }
      .pot-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background-color: rgba(2, 6, 23, 0.8);
        font-size: 11px;
        border: 1px solid rgba(30, 41, 59, 0.8);
        font-weight: 700;
        color: #eab308;
        padding: 0.125rem 0.625rem;
        border-radius: 0.375rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        margin-top: 0.125rem;
      }
      @media (min-width: 640px) {
        .pot-display {
          font-size: 0.75rem;
        }
      }
      .player-position {
        font-weight: 700;
        color: #cbd5e1;
      }
      .hero-label {
        color: #60a5fa;
        font-weight: 700;
        margin-left: 0.125rem;
      }
      .player-stack {
        font-size: 10px;
        color: #94a6b8;
        letter-spacing: -0.05em;
      }
      .source-zone-container {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
        min-height: 60px;
        align-items: center;
        background-color: rgba(15, 23, 42, 0.4);
        padding: 0.625rem;
        border-radius: 0.75rem;
        border: 1px solid rgba(51, 65, 85, 0.4);
      }
      .draggable-token {
        cursor: grab;
        padding: 0.625rem 1rem;
        background-color: #334155;
        color: #ffffff;
        font-family: monospace;
        font-weight: 800;
        font-size: 0.875rem;
        border-radius: 0.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid #64748b;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        display: flex;
        items-center: center;
        justify-content: center;
        letter-spacing: 0.025em;
        min-width: 70px;
      }
      .draggable-token:active {
        cursor: grabbing;
      }
      @media (min-width: 640px) {
        .draggable-token {
          font-size: 1rem;
        }
      }
      .dropzones-wrapper {
        display: flex;
        gap: 0.75rem;
        width: 100%;
      }
      .dropzone-container {
        flex: 1 1 0%;
        display: flex;
        flex-direction: column;
        background-color: rgba(15, 23, 42, 0.2);
        border: 1px solid rgba(51, 65, 85, 0.5);
        padding: 0.625rem;
        border-radius: 0.75rem;
      }
      .dropzone-header {
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: #94a6b8;
        letter-spacing: 0.025em;
        text-transform: uppercase;
        margin-bottom: 0.375rem;
      }
      .dropzone {
        flex: 1 1 0%;
        background-color: rgba(15, 23, 42, 0.4);
        border: 1px dashed rgba(51, 65, 85, 0.8);
        border-radius: 0.5rem;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        min-height: 85px;
      }
      .btn-confirm {
        display: none;
        margin-top: 1.25rem;
        width: 100%;
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
        background-color: #2563eb;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 700;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
      }
      .btn-confirm:hover {
        background-color: #3b82f6;
      }

      /* --- BASE/STANDARD CORE STYLES --- */
      .community-cards > * {
        font-size: 1.25rem !important;
        font-weight: 800 !important;
        padding: 0.35rem 0.55rem !important;
        min-width: 42px !important;
        height: 58px !important;
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        background-color: #ffffff !important;
        border-radius: 6px !important;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2) !important;
        line-height: 1.1 !important;
      }

      /* --- COMPACT ENGINE MODE OVERRIDES --- */
      .poker-table-area.compact .community-cards > * {
        font-size: 0.9rem !important;
        padding: 0.15rem 0.3rem !important;
        min-width: 28px !important;
        height: 38px !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 4px -1px rgba(0,0,0,0.15) !important;
      }

      .poker-table-area.compact .hole-cards > * {
        font-size: 0.75rem !important;
        padding: 0.1rem 0.2rem !important;
        min-width: 22px !important;
        height: 30px !important;
        border-radius: 3px !important;
      }
    </style>

    <div class="poker-wrapper">
      <div>
        <div class="header-container">
          <div>
            <span class="badge-engine">Poker Matrix Engine</span>
            <h2 class="header-title">${card.title || 'Game Matrix Checkpoint'}</h2>
          </div>
          
          <div class="toggle-container">
            <input type="checkbox" id="compact-toggle" ${isCompactMode ? 'checked' : ''} class="toggle-input">
            <label for="compact-toggle" class="toggle-label">Compact Engine Table</label>
          </div>
        </div>
        
        <p class="display-text">${card.displayText}</p>
        
        <div class="poker-table-area ${isCompactMode ? 'compact' : ''}">
          
          <div class="center-board">
            <div class="community-cards">${communityCardsHtml}</div>
            
            <div class="pot-display">
              ${generateChipStackHtml(card.pot)}
              <span>Pot: ${card.pot}</span>
            </div>
          </div>

          ${playersHtml}
          ${betsHtml}
        </div>

        <div id="source-zone" class="source-zone-container">
          ${draggablesHtml}
        </div>

        <div class="dropzones-wrapper">${dropzonesHtml}</div>
      </div>
      
      <button id="dd-next" class="btn-confirm">Confirm Strategic Configuration</button>
    </div>
  `;

  // 3. POST-RENDER PROCESSOR: Enforce 4-Color Logic on Board & Player Hole Cards
  container.querySelectorAll('.community-cards > *, .hole-cards > *').forEach(cardEl => {
    const structuralText = cardEl.textContent || cardEl.innerHTML;
    
    // Diamonds -> Blue
    if (structuralText.includes('♦') || structuralText.includes('d')) {
      cardEl.style.setProperty('color', '#2563eb', 'important');
      cardEl.querySelectorAll('*').forEach(c => c.style.setProperty('color', '#2563eb', 'important'));
    }
    // Clubs -> Green
    else if (structuralText.includes('♣') || structuralText.includes('c')) {
      cardEl.style.setProperty('color', '#16a34a', 'important');
      cardEl.querySelectorAll('*').forEach(c => c.style.setProperty('color', '#16a34a', 'important'));
    }
    // Hearts -> Red
    else if (structuralText.includes('♥') || structuralText.includes('h')) {
      cardEl.style.setProperty('color', '#dc2626', 'important');
      cardEl.querySelectorAll('*').forEach(c => c.style.setProperty('color', '#dc2626', 'important'));
    }
    // Spades -> Black
    else if (structuralText.includes('♠') || structuralText.includes('s')) {
      cardEl.style.setProperty('color', '#1e293b', 'important');
      cardEl.querySelectorAll('*').forEach(c => c.style.setProperty('color', '#1e293b', 'important'));
    }
  });

  // Toggle Listener Controls
  document.getElementById('compact-toggle').addEventListener('change', (e) => {
    isCompactMode = e.target.checked;
    const tableObj = container.querySelector('.poker-table-area');
    if (tableObj) {
      if (isCompactMode) tableObj.classList.add('compact');
      else tableObj.classList.remove('compact');
    }
  });

  container.dataset.totalItems = card.choices.length;
}
