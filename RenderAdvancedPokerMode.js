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
        const heroLabel = player.isHero ? '<span class="text-blue-400 font-bold ml-0.5">(H)</span>' : '';

        playersHtml += `
          <div class="player-seat seat-${player.position} ${isTurnClass} ${isActiveClass}">
            ${dealerButtonHtml}
            <div class="font-bold text-slate-300">${player.position}${heroLabel}</div>
            <div class="text-[10px] text-slate-400 tracking-tighter">${player.stackSize}</div>
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
        communityCardsHtml = `<span class="text-slate-500/50 font-mono text-xs sm:text-sm font-bold tracking-widest border border-slate-700/40 px-4 py-1.5 bg-slate-900/30 rounded-md">PREFLOP RUNTIME</span>`;
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
          <div draggable="true" data-target="${c.targetCategory}" id="poker-item-${i}" class="cursor-grab active:cursor-grabbing px-4 py-2.5 bg-slate-700 text-white font-mono font-extrabold text-sm sm:text-base rounded-lg shadow-xl border border-slate-500 text-center select-none flex items-center justify-center tracking-wide min-w-[70px]" ondragstart="dragStart(event)">
            ${formattedHand}
          </div>
        `;
      }).join('');

      let dropzonesHtml = categories.map(cat => `
        <div class="flex-1 flex flex-col bg-slate-900/20 border border-slate-700/50 p-2.5 rounded-xl">
          <h3 class="text-center text-[11px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">${cat}</h3>
          <div data-cat="${cat}" class="dropzone flex-1 bg-slate-900/40 border border-dashed border-slate-700/80 rounded-lg p-2 flex flex-col gap-1.5 min-h-[85px]" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="dropToMatch(event)"></div>
        </div>
      `).join('');

      container.innerHTML = `
        <style>
          /* Base/Standard Community Card Framework styling */
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
          /* Resizes the card white footprint blocks perfectly to wrap tight text margins */
          .poker-table-area.compact .community-cards > * {
            font-size: 0.9rem !important;
            padding: 0.15rem 0.3rem !important;
            min-width: 28px !important;
            height: 38px !important;
            border-radius: 4px !important;
            box-shadow: 0 2px 4px -1px rgba(0,0,0,0.15) !important;
          }

          /* Ensure player hole-cards scale smoothly in compact layouts too */
          .poker-table-area.compact .hole-cards > * {
            font-size: 0.75rem !important;
            padding: 0.1rem 0.2rem !important;
            min-width: 22px !important;
            height: 30px !important;
            border-radius: 3px !important;
          }
        </style>

        <div class="flex flex-col justify-between h-full flex-grow">
          <div>
            <div class="flex justify-between items-start border-b border-slate-700/50 pb-2 mb-3">
              <div>
                <span class="text-[10px] uppercase tracking-widest font-mono bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 px-2 py-0.5 rounded">Poker Matrix Engine</span>
                <h2 class="text-sm font-bold text-white mt-1.5">${card.title || 'Game Matrix Checkpoint'}</h2>
              </div>
              
              <div class="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 border border-slate-700/80 rounded-lg shadow-inner text-[11px]">
                <input type="checkbox" id="compact-toggle" ${isCompactMode ? 'checked' : ''} class="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-800 border-slate-600 cursor-pointer">
                <label for="compact-toggle" class="text-slate-300 font-medium cursor-pointer select-none">Compact Engine Table</label>
              </div>
            </div>
            
            <p class="text-xs text-slate-300 mb-3 leading-relaxed bg-slate-900/30 p-2.5 border border-slate-700/30 rounded-lg">${card.displayText}</p>
            
            <div class="poker-table-area ${isCompactMode ? 'compact' : ''}">
              
              <div class="flex flex-col items-center gap-2 z-10">
                <div class="community-cards gap-1.5">${communityCardsHtml}</div>
                
                <div class="flex items-center justify-center gap-2 bg-slate-950/80 text-[11px] sm:text-xs border border-slate-800/80 font-bold text-yellow-400 px-2.5 py-0.5 rounded-md shadow-md mt-0.5">
                  ${generateChipStackHtml(card.pot)}
                  <span>Pot: ${card.pot}</span>
                </div>
              </div>

              ${playersHtml}
              ${betsHtml}
            </div>

            <div id="source-zone" class="flex justify-center flex-wrap gap-3 my-4 min-h-[60px] items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-700/40">
              ${draggablesHtml}
            </div>

            <div class="flex gap-3 w-full">${dropzonesHtml}</div>
          </div>
          
          <button id="dd-next" class="hidden mt-5 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold shadow-lg transition-colors">Confirm Strategic Configuration</button>
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
