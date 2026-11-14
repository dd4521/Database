# Employee Database Viewer PWA

## Files
- `index.html`: original Employee Database Viewer with localStorage-based Excel loading and PWA registration.
- `manifest.json`: installable app metadata.
- `service-worker.js`: app-shell and runtime caching for offline use.
- `icons/`: app icons.

## Publish on GitHub Pages
1. Upload all files and the `icons` folder to the same repository location.
2. Keep the HTML file named `index.html`.
3. Enable GitHub Pages for the repository.
4. Open the published HTTPS URL while online once.
5. Install from the browser menu:
   - Android/Chrome: Install app or Add to Home screen.
   - iPhone/Safari: Share > Add to Home Screen.
6. Upload the Excel file inside the app once. Its records are saved in that browser's localStorage.

## Important
The Excel file itself is not included in this repository. Employee records are stored locally in the browser on each device. Do not publish the employee Excel database in a public repository.

To force a service-worker cache refresh after changing the PWA shell, increment `CACHE_NAME` in `service-worker.js` (for example, from `v1` to `v2`).
