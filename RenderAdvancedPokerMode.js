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
        <div class="player-position-label">${player.position}${heroLabel}</div>
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
    communityCardsHtml = `<span class="preflop-badge">PREFLOP RUNTIME</span>`;
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
      
      let suitClass = 'suit-spade';
      if (s === 'h') suitClass = 'suit-heart';
      if (s === 'd') suitClass = 'suit-diamond';
      if (s === 'c') suitClass = 'suit-club';
      
      return `${val}<span class="card-suit ${suitClass}">${suitSymbols[s] || s}</span>`;
    });

    return `
      <div draggable="true" data-target="${c.targetCategory}" id="poker-item-${i}" class="draggable-token" ondragstart="dragStart(event)">
        ${formattedHand}
      </div>
    `;
  }).join('');

  let dropzonesHtml = categories.map(cat => `
    <div class="dropzone-container">
      <h3 class="dropzone-title">${cat}</h3>
      <div data-cat="${cat}" class="dropzone" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="dropToMatch(event)"></div>
    </div>
  `).join('');

  container.innerHTML = `
    <style>
      /* --- Layout Framework & Container --- */
      .matrix-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        flex-grow: 1;
        font-family: system-ui, -apple-system, sans-serif;
      }

      /* Header Styling */
      .matrix-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        border-bottom: 1px solid rgba(51, 65, 85, 0.5);
        padding-bottom: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .engine-badge {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-family: monospace;
        background-color: rgba(6, 78, 59, 0.6);
        border: 1px solid rgba(4, 120, 87, 0.4);
        color: #6ee7b7;
        padding: 0.125rem 0.5rem;
        border-radius: 4px;
      }
      .matrix-title {
        font-size: 0.875rem;
        font-weight: bold;
        color: #ffffff;
        margin-top: 0.375rem;
        margin-bottom: 0;
      }

      /* Compact Toggle Controls */
      .toggle-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background-color: rgba(15, 23, 42, 0.8);
        padding: 0.375rem 0.625rem;
        border: 1px solid rgba(51, 65, 85, 0.8);
        border-radius: 8px;
        font-size: 11px;
        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
      }
      .toggle-checkbox {
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 4px;
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

      /* Info Box */
      .matrix-description {
        font-size: 0.75rem;
        color: #cbd5e1;
        margin-bottom: 0.75rem;
        line-height: 1.625;
        background-color: rgba(15, 23, 42, 0.3);
        padding: 0.625rem;
        border: 1px solid rgba(51, 65, 85, 0.3);
        border-radius: 8px;
      }

      /* Poker Table Area Layout */
      .table-center-elements {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        z-index: 10;
      }
      .preflop-badge {
        color: rgba(148, 163, 184, 0.5);
        font-family: monospace;
        font-size: 0.75rem;
        font-weight: bold;
        letter-spacing: 0.05em;
        border: 1px solid rgba(51, 65, 85, 0.4);
        padding: 0.375rem 1rem;
        background-color: rgba(15, 23, 42, 0.3);
        border-radius: 6px;
      }
      .pot-display {
        display: flex;
        items-center: center;
        justify-content: center;
        gap: 0.5rem;
        background-color: rgba(2, 6, 23, 0.8);
        font-size: 11px;
        border: 1px solid rgba(30, 41, 59, 0.8);
        font-weight: bold;
        color: #facc15;
        padding: 0.125rem 0.625rem;
        border-radius: 6px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-top: 0.125rem;
      }

      /* Player Elements */
      .hero-label {
        color: #60a5fa;
        font-weight: bold;
        margin-left: 0.125rem;
      }
      .player-position-label {
        font-weight: bold;
        color: #cbd5e1;
      }
      .player-stack {
        font-size: 10px;
        color: #94a3b8;
        letter-spacing: -0.05em;
      }

      /* Draggable Card Tokens */
      .draggable-token {
        cursor: grab;
        padding: 0.625rem 1rem;
        background-color: #334155;
        color: #ffffff;
        font-family: monospace;
        font-weight: 900;
        font-size: 0.875rem;
        border-radius: 8px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid #64748b;
        text-align: center;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 0.025em;
        min-width: 70px;
      }
      .draggable-token:active {
        cursor: grabbing;
      }
      .card-suit {
        font-family: system-ui, sans-serif;
        margin-left: 2px;
        margin-right: 2px;
        font-size: 1.1em;
      }

      /* Token 4-Color Deck Defaults */
      .suit-spade { color: #f1f5f9; }
      .suit-heart { color: #ef4444; }
      .suit-diamond { color: #60a5fa; }
      .suit-club { color: #4ade80; }

      /* Zones Layout */
      .source-zone-wrapper {
        display: flex;
        justify-content: center;
        flex-wrap: flex-wrap;
        gap: 0.75rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
        min-height: 60px;
        align-items: center;
        background-color: rgba(15, 23, 42, 0.4);
        padding: 0.625rem;
        border-radius: 12px;
        border: 1px solid rgba(51, 65, 85, 0.4);
      }
      .dropzones-wrapper {
        display: flex;
        gap: 0.75rem;
        width: 100%;
      }
      .dropzone-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: rgba(15, 23, 42, 0.2);
        border: 1px solid rgba(51, 65, 85, 0.5);
        padding: 0.625rem;
        border-radius: 12px;
      }
      .dropzone-title {
        text-align: center;
        font-size: 11px;
        font-weight: bold;
        color: #94a3b8;
        letter-spacing: 0.025em;
        text-transform: uppercase;
        margin-top: 0;
        margin-bottom: 0.375rem;
      }
      .dropzone {
        flex: 1;
        background-color: rgba(15, 23, 42, 0.4);
        border: 1px dashed rgba(51, 65, 85, 0.8);
        border-radius: 8px;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        min-height: 85px;
      }

      /* Confirm Button */
      .confirm-btn {
        display: none;
        margin-top: 1.25rem;
        width: 100%;
        padding: 0.75rem 0;
        background-color: #2563eb;
        border: none;
        border-radius: 8px;
        color: #ffffff;
        font-size: 0.875rem;
        font-weight: bold;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transition: background-color 0.2s;
        cursor: pointer;
      }
      .confirm-btn:hover {
        background-color: #3b82f6;
      }

      /* Responsive Adjustments for Tokens */
      @media (min-width: 640px) {
        .preflop-badge { font-size: 0.875rem; }
        .pot-display { font-size: 0.875rem; }
        .draggable-token { font-size: 1rem; }
      }

      /* --- Base/Standard Community Card Framework styling --- */
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

    <div class="matrix-wrapper">
      <div>
        <div class="matrix-header">
          <div>
            <span class="engine-badge">Poker Matrix Engine</span>
            <h2 class="matrix-title">${card.title || 'Game Matrix Checkpoint'}</h2>
          </div>
          
          <div class="toggle-container">
            <input type="checkbox" id="compact-toggle" ${isCompactMode ? 'checked' : ''} class="toggle-checkbox">
            <label for="compact-toggle" class="toggle-label">Compact Engine Table</label>
          </div>
        </div>
        
        <p class="matrix-description">${card.displayText}</p>
        
        <div class="poker-table-area ${isCompactMode ? 'compact' : ''}">
          
          <div class="table-center-elements">
            <div class="community-cards" style="display: flex; gap: 0.375rem;">${communityCardsHtml}</div>
            
            <div class="pot-display">
              ${generateChipStackHtml(card.pot)}
              <span>Pot: ${card.pot}</span>
            </div>
          </div>

          ${playersHtml}
          ${betsHtml}
        </div>

        <div id="source-zone" class="source-zone-wrapper">
          ${draggablesHtml}
        </div>

        <div class="dropzones-wrapper">${dropzonesHtml}</div>
      </div>
      
      <button id="dd-next" class="confirm-btn">Confirm Strategic Configuration</button>
    </div>
  `;

  // 3. POST-RENDER PROCESSOR: Enforce 4-Color Logic on Board & Player Hole Cards via Native CSS Engine Colors
  container.querySelectorAll('.community-cards > *, .hole-cards > *').forEach(cardEl => {
    const structuralText = cardEl.textContent || cardEl.innerHTML;
    
    let targetColor = '#1e293b'; // Spades -> Slate/Dark Gray Default
    if (structuralText.includes('♦') || structuralText.includes('d')) {
      targetColor = '#2563eb'; // Diamonds -> Blue
    } else if (structuralText.includes('♣') || structuralText.includes('c')) {
      targetColor = '#16a34a'; // Clubs -> Green
    } else if (structuralText.includes('♥') || structuralText.includes('h')) {
      targetColor = '#dc2626'; // Hearts -> Red
    }

    cardEl.style.setProperty('color', targetColor, 'important');
    cardEl.querySelectorAll('*').forEach(c => c.style.setProperty('color', targetColor, 'important'));
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
