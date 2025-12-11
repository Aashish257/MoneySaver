# MoneySaver

MoneySaver is a focused, lightweight savings tracker built with plain HTML, CSS, and JavaScript. It helps users visualize a savings goal as a grid of cells, each representing an amount that can be toggled as saved. The project showcases a clean UI, basic state management using localStorage, a responsive layout, export/import support, and a light/dark theme toggle.

**Why it matters:** This project is ideal for showcasing front-end fundamentals (DOM manipulation, event handling, accessible UI controls, and responsive design) and a pragmatic approach to building a useful personal productivity tool.

**Live preview:** Open [index.html](index.html) in your browser or serve the repository with a simple HTTP server (examples below).

**Highlights & Skills Demonstrated:**
- Clean, accessible UI using semantic HTML and CSS
- Realtime interactions and state persistence with `localStorage`
- Export/Import JSON and image export (SVG)
- Responsive grid layout and small utility scripts
- Theme support with a dark/light toggle

**Features**
- Randomized, configurable board with a target savings goal
- Click a cell to mark it saved — progress updates dynamically
- Save state across sessions (browser `localStorage`)
- Export/Import JSON backups for portability
- Download a snapshot of the board as an SVG image
- Configurable columns, days (cells), and goal
- Light/Dark theme toggle

**Tech Stack**
- HTML, CSS, JavaScript (no build tools required)

**Get Started**
1. Clone the repo:

```bash
git clone https://github.com/Aashish257/MoneySaver.git
cd MoneySaver
```

2. Open the app in a browser by double-clicking [index.html](index.html), or serve it locally:

Using Python (3.x):
```bash
python3 -m http.server 8000
# then visit http://localhost:8000 in your browser
```

Using Node (http-server):
```bash
npx http-server
# then visit http://localhost:8080 in your browser
```

**How to Use**
- Set a savings goal and number of days (cells).
- Adjust the board width (`columns`) with the slider.
- Click "Generate board" to create randomized values per cell.
- Click any cell to toggle it as saved — progress updates instantly.
- Use "Export JSON" / "Import JSON" to backup and restore your board configuration.
- Click "Download SVG" to download an image snapshot of the board.
- Toggle the theme using the moon/sun button in the top-right corner.

**Development Notes**
- The app stores state in browser `localStorage` under the key `moneySaverBoard`.
- Theme preference is stored under `moneySaverTheme` and respects the user's `prefers-color-scheme` when not set.
- Main files:
	- [index.html](index.html)
	- [style.css](style.css)
	- [script.js](script.js)

**Contributing**
- Contributions are welcome. For small improvements (styling, UX, small bug fixes), open a PR with a short description of your change. For larger contributions, open an issue to discuss.

**Licence & Attribution**
- MIT License — feel free to use and adapt this project for your portfolio or learning purposes. Add a LICENSE file if you want a different license.

**Contact**
- GitHub: https://github.com/Aashish257
- Reach out on GitHub if you want this feature-packed into a full web app or need a demo video for your hiring portfolio.

---
_This project is intentionally small, well-documented, and approachable to demonstrate front-end engineering skills for recruiters and hiring managers._
