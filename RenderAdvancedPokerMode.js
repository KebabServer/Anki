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
      
      <button id="dd-next" class="btn-confirm hidden">Confirm Strategic Configuration</button>
    </div>
  `;

  // 3. POST-RENDER PROCESSOR: Enforce 4-Color Logic on Board & Player Hole Cards
  container.querySelectorAll('.community-cards > *, .hole-cards > *').forEach(cardEl => {
    const structuralText = cardEl.textContent || cardEl.innerHTML;
    
    if (structuralText.includes('♦') || structuralText.includes('d')) {
      cardEl.style.setProperty('color', '#2563eb', 'important');
      cardEl.querySelectorAll('*').forEach(c => c.style.setProperty('color', '#2563eb', 'important'));
    }
    else if (structuralText.includes('♣') || structuralText.includes('c')) {
      cardEl.style.setProperty('color', '#16a34a', 'important');
      cardEl.querySelectorAll('*').forEach(c => c.style.setProperty('color', '#16a34a', 'important'));
    }
    else if (structuralText.includes('♥') || structuralText.includes('h')) {
      cardEl.style.setProperty('color', '#dc2626', 'important');
      cardEl.querySelectorAll('*').forEach(c => c.style.setProperty('color', '#dc2626', 'important'));
    }
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
