# Foreign Students in Korea (1999–2026) — D3.js Interactive Visualization

An interactive geographic point accumulation map visualizing the growth and geographic distribution of international university students in South Korea across 17 provinces from 1999 to 2026.

## 📁 Project Structure

```text
├── index.html       # Primary HTML entry point for GitHub Pages & web servers
├── style.css        # Independent stylesheet (typography, layout, map styling & cards)
├── data.json        # Unified dataset (GeoJSON boundaries, historical student data & coordinates)
├── app.js           # D3.js logic (projection, chronological swarm animation & controls)
└── README.md        # Documentation and deployment instructions
```

---

## 🚀 How to Visualize on GitHub (GitHub Pages)

When you upload HTML/JS to a GitHub repository, GitHub displays the **source code** by default. To make it render as a live interactive website:

1. **Push the repository** to GitHub (including `index.html`, `style.css`, `data.json`, and `app.js`).
2. Go to your repository on **GitHub.com**.
3. Click on **Settings** (top right gear icon).
4. In the left sidebar, click on **Pages**.
5. Under **Build and deployment** > **Branch**:
   - Select `main` (or `master`) branch.
   - Select `/ (root)` folder.
   - Click **Save**.
6. Wait 30–60 seconds. GitHub will provide a link like:
   `https://<your-username>.github.io/<your-repository-name>/`
7. Open that link to explore the live interactive visualization!

---

## 💻 How to Run Locally

Because `app.js` fetches `data.json`, browsers require a local web server (to comply with CORS security rules):

### Option 1: Python (Built-in)
```bash
# Python 3
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

### Option 3: Node / npx
```bash
npx serve .
```

---

## 📊 Data Source
- Higher Education in Korea / Ministry of Education Republic of Korea (1999–2026)
