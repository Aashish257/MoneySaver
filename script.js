
(function () {
    const DENOMS = [50, 100, 200, 500];
    const key = 'moneySaverBoard';
    const THEME_KEY = 'moneySaverTheme';

    // Elements
    const goalEl = document.getElementById('goal');
    const daysEl = document.getElementById('days');
    const columnsEl = document.getElementById('columns');
    const colCountEl = document.getElementById('colCount');
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const boardEl = document.getElementById('board');
    const savedAmountEl = document.getElementById('savedAmount');
    const goalLabelEl = document.getElementById('goalLabel');
    const percentLabel = document.getElementById('percentLabel');
    const progressInner = document.getElementById('progressInner');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const downloadSvgBtn = document.getElementById('downloadSvg');
    const themeToggle = document.getElementById('themeToggle');

    let state = {
        goal: Number(goalEl.value),
        days: Number(daysEl.value),
        columns: Number(columnsEl.value),
        cells: [] // { index, value, saved }
    };

    // Utils
    function saveState() { localStorage.setItem(key, JSON.stringify(state)); }
    function loadState() {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            state = Object.assign(state, parsed);
            // ensure numeric types
            state.goal = Number(state.goal) || 0;
            state.days = Number(state.days) || 0;
            state.columns = Number(state.columns) || 10;
        } catch (e) { }
    }
    function format(n) { return n.toLocaleString(); }
    function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    // Generate randomized board
// Generate randomized board: every cell ∈ {50,100,200,500}, exactly `days` cells, sum == goal
function generateBoard() {
    const n = Math.max(1, Math.floor(Number(state.days)));
    const G = Number(state.goal);

    // validity checks
    if (!Number.isFinite(G) || G <= 0) {
        alert('Enter a valid positive goal.');
        return;
    }
    if (G % 50 !== 0) {
        alert('Goal must be a multiple of 50 to use available denominations (50,100,200,500).');
        return;
    }

    const totalUnits = G / 50;     // all measured as 50-rupee units
    const minUnits = n * 1;        // each cell at least 1 unit (50)
    const maxUnits = n * 10;       // each cell at most 10 units (500)

    if (totalUnits < minUnits || totalUnits > maxUnits) {
        alert(
            `Goal of ₹${G.toLocaleString()} cannot be covered in ${n} days with each cell ≤ ₹500.\n` +
            `You need a goal between ₹${(minUnits * 50).toLocaleString()} and ₹${(maxUnits * 50).toLocaleString()} for ${n} days.`
        );
        return;
    }

    // unit-choices corresponding to denominations [50,100,200,500]
    const ks = [1, 2, 4, 10];

    // DP table: dp[i][u] = k used to reach sum u with i cells, or -1 if unreachable
    const target = totalUnits;
    const dp = Array.from({ length: n + 1 }, () => Array(target + 1).fill(-1));
    dp[0][0] = 0;

    for (let i = 0; i < n; i++) {
        for (let u = 0; u <= target; u++) {
            if (dp[i][u] !== -1) {
                for (const k of ks) {
                    const nu = u + k;
                    if (nu <= target && dp[i + 1][nu] === -1) {
                        dp[i + 1][nu] = k;
                    }
                }
            }
        }
    }

    if (dp[n][target] === -1) {
        alert('Unable to distribute the target into the given number of days using available denominations.');
        return;
    }

    // Backtrack to retrieve k-values per cell
    const resKs = [];
    let curU = target;
    for (let i = n; i > 0; i--) {
        const k = dp[i][curU];
        resKs.push(k);
        curU -= k;
    }
    resKs.reverse(); // length === n, each k ∈ {1,2,4,10}

    // Convert to cells (value = k * 50)
    let temp = resKs.map((k, idx) => ({ index: idx, value: k * 50, saved: false }));

    // Optional: shuffle so the denominations are not always in the same order
    // (keeps distribution random-looking but still exact)
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    shuffle(temp);

    // reassign indexes after shuffle
    temp.forEach((c, i) => (c.index = i));

    // store + render
    state.cells = temp;
    saveState();
    render();
}


    // Toggle a cell saved
    function toggleCell(i) {
        if (!state.cells[i]) return;
        state.cells[i].saved = !state.cells[i].saved;
        saveState();
        render();
    }

    function getSavedAmount() {
        return state.cells.reduce((acc, c) => acc + (c.saved ? Number(c.value) : 0), 0);
    }

    function resetBoard(confirmReset = true) {
        if (confirmReset) {
            if (!confirm('Reset all progress?')) return;
        }
        state.cells = state.cells.map(c => ({ ...c, saved: false }));
        saveState();
        render();
    }

    function render() {
        // sync inputs
        goalEl.value = state.goal;
        daysEl.value = state.days;
        columnsEl.value = state.columns;
        colCountEl.textContent = state.columns + ' columns';
        goalLabelEl.textContent = '₹' + format(state.goal);

        // compute saved summary
        const saved = getSavedAmount();
        savedAmountEl.textContent = '₹' + format(saved);
        const percent = state.goal > 0 ? Math.min(100, Math.round((saved / state.goal) * 100)) : 0;
        percentLabel.textContent = percent + '% reached';
        progressInner.style.width = percent + '%';

        // render grid
        boardEl.innerHTML = '';
        const cols = Math.max(1, Number(state.columns));
        boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        state.cells.forEach((c, i) => {
            const btn = document.createElement('button');
            btn.className = 'cell' + (c.saved ? ' saved' : '');
            btn.type = 'button';
            btn.onclick = () => toggleCell(i);

            const value = document.createElement('div');
            value.className = 'value';
            value.textContent = '₹' + format(Number(c.value || 0));

            const idx = document.createElement('div');
            idx.className = 'index';
            idx.textContent = String(i + 1).padStart(3, '0');

            btn.appendChild(value);
            btn.appendChild(idx);
            boardEl.appendChild(btn);
        });
    }

    // export
    function exportJSON() {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'money-saver-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function importJSONFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed.goal) state.goal = Number(parsed.goal) || state.goal;
                if (parsed.days) state.days = Number(parsed.days) || state.days;
                if (parsed.columns) state.columns = Number(parsed.columns) || state.columns;
                if (parsed.cells && Array.isArray(parsed.cells)) state.cells = parsed.cells.map(c => ({
                    index: c.index,
                    value: Number(c.value) || 0,
                    saved: !!c.saved
                }));
                saveState();
                render();
                alert('Imported backup successfully');
            } catch (err) {
                alert('Invalid file');
            }
        };
        reader.readAsText(file);
    }

    // Download SVG snapshot
    function downloadSVG() {
        const cellSize = 72;
        const gap = 8;
        const cols = Math.max(1, Number(state.columns));
        const rows = Math.ceil(state.cells.length / cols);
        const svgWidth = cols * (cellSize + gap) + gap;
        const svgHeight = rows * (cellSize + gap) + gap + 100;

        let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        svg += `<svg xmlns='http://www.w3.org/2000/svg' width='${svgWidth}' height='${svgHeight}'>\n`;
        svg += `<rect width='100%' height='100%' fill='${getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#f7f3ef'}' rx='10'/>\n`;

        state.cells.forEach((c, i) => {
            const r = Math.floor(i / cols);
            const col = i % cols;
            const x = gap + col * (cellSize + gap);
            const y = gap + r * (cellSize + gap);
            const fill = c.saved ? '#bbf7d0' : '#ffffff';
            const stroke = '#444';
            svg += `<rect x='${x}' y='${y}' width='${cellSize}' height='${cellSize}' rx='8' fill='${fill}' stroke='${stroke}' stroke-width='1'/>\n`;
            const label = `₹${Number(c.value || 0).toLocaleString()}`;
            svg += `<text x='${x + cellSize / 2}' y='${y + cellSize / 2 - 4}' font-family='sans-serif' font-size='14' fill='#111' text-anchor='middle'>${label}</text>\n`;
            svg += `<text x='${x + cellSize / 2}' y='${y + cellSize / 2 + 16}' font-family='sans-serif' font-size='11' fill='#666' text-anchor='middle'>${String(i + 1).padStart(3, '0')}</text>\n`;
        });

        const savedAmount = getSavedAmount();
        const percent = state.goal > 0 ? Math.round((savedAmount / state.goal) * 100) : 0;
        svg += `<text x='${svgWidth / 2}' y='${svgHeight - 48}' font-family='sans-serif' font-size='16' fill='#111' text-anchor='middle'>Goal: ₹${Number(state.goal).toLocaleString()}</text>\n`;
        svg += `<text x='${svgWidth / 2}' y='${svgHeight - 24}' font-family='sans-serif' font-size='16' fill='#111' text-anchor='middle'>Saved: ₹${savedAmount.toLocaleString()} (${percent}%)</text>\n`;

        svg += `</svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `savings-board-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Theme helpers
    function getStoredTheme() {
        const t = localStorage.getItem(THEME_KEY);
        if (t) return t;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    }

    function applyTheme(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
        localStorage.setItem(THEME_KEY, theme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = getStoredTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
        });
    }

    // events
    generateBtn.addEventListener('click', () => {
        state.goal = Number(goalEl.value) || state.goal;
        state.days = Math.max(1, Number(daysEl.value) || 1);
        state.columns = Math.max(1, Number(columnsEl.value) || 10);
        generateBoard();
    });

    resetBtn.addEventListener('click', () => resetBoard(true));
    exportBtn.addEventListener('click', exportJSON);
    importFile.addEventListener('change', (ev) => {
        const file = ev.target.files?.[0];
        if (file) importJSONFile(file);
        ev.target.value = '';
    });
    downloadSvgBtn.addEventListener('click', downloadSVG);

    columnsEl.addEventListener('input', () => {
        state.columns = Number(columnsEl.value);
        colCountEl.textContent = state.columns + ' columns';
        saveState();
        render();
    });

    goalEl.addEventListener('change', () => {
        state.goal = Number(goalEl.value) || state.goal;
        saveState();
        render();
    });
    daysEl.addEventListener('change', () => {
        state.days = Math.max(1, Number(daysEl.value) || 1);
        saveState();
        render();
    });

    // initial load
    loadState();
    // apply theme from storage or preferences
    applyTheme(getStoredTheme());
    // if no cells exist yet, generate a default board
    if (!Array.isArray(state.cells) || state.cells.length === 0) {
        // keep defaults from inputs if present
        state.goal = Number(goalEl.value) || state.goal;
        state.days = Number(daysEl.value) || state.days;
        state.columns = Number(columnsEl.value) || state.columns;
        generateBoard();
    } else {
        render();
    }
})();
