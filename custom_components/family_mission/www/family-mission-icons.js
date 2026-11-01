/**
 * FamilyMission icon set and brand helper.
 *
 * 1. Registers the custom icon set "fm" (use `fm:rocket`, `fm:rocket-ring`, `fm:moon-buddy`,
 *    `fm:parents`) through the standard `window.customIcons` mechanism of Home Assistant.
 * 2. Exports `window.FamilyMissionBrand` with inline SVG helpers (app icon and logo with lettering)
 *    that the other FamilyMission cards use when present.
 *
 * The file is loaded as a Lovelace resource and as an extra JS module (so the icons also work in the
 * sidebar and in dialogs). Loading it twice is harmless: the guard below makes it a no-op.
 */
(() => {
  if (window.FamilyMissionBrand && window.customIcons && window.customIcons.fm) return;

  // 24 x 24 paths (nonzero fill rule)
  const ICONS = {
    "rocket": "M10.86 2.80 L11.59 1.92 L12.00 1.50 L12.41 1.92 L13.14 2.80 L13.46 3.27 L14.02 4.23 L14.65 5.76 L15.08 7.36 L15.24 8.47 L15.33 9.60 L15.32 11.48 L17.80 16.20 L14.70 14.80 L14.71 14.20 L9.29 14.20 L9.30 14.80 L6.20 16.20 L8.68 11.48 L8.65 10.17 L8.70 9.03 L8.83 7.91 L9.04 6.82 L9.35 5.76 L9.75 4.73 L10.25 3.74 Z M13.68 8.65 L13.70 8.32 L13.65 7.99 L13.54 7.67 L13.37 7.39 L13.14 7.14 L12.87 6.94 L12.57 6.80 L12.25 6.72 L11.92 6.70 L11.59 6.75 L11.27 6.86 L10.99 7.03 L10.74 7.26 L10.54 7.53 L10.40 7.83 L10.32 8.15 L10.30 8.48 L10.35 8.81 L10.46 9.13 L10.63 9.41 L10.86 9.66 L11.13 9.86 L11.43 10.00 L11.75 10.08 L12.08 10.10 L12.41 10.05 L12.73 9.94 L13.01 9.77 L13.26 9.54 L13.46 9.27 L13.60 8.97 Z M10.64 16.90 L10.30 15.60 L13.70 15.60 L13.36 16.90 L12.85 18.30 L12.51 18.88 L12.17 19.16 L12.00 19.20 L11.83 19.16 L11.49 18.88 L11.15 18.30 Z",
    "rocket-ring": "M17.79 3.01 L19.10 2.91 L19.60 1.70 L20.10 2.91 L21.41 3.01 L20.41 3.86 L20.72 5.14 L19.60 4.46 L18.48 5.14 L18.79 3.86 Z M10.91 6.58 L11.51 5.72 L12.00 5.19 L12.49 5.72 L13.09 6.58 L13.53 7.51 L13.75 8.16 L13.91 8.82 L14.07 10.21 L14.06 11.38 L15.60 14.30 L13.67 13.44 L13.68 13.06 L10.32 13.06 L10.33 13.44 L8.40 14.30 L9.94 11.38 L9.93 10.21 L10.09 8.82 L10.25 8.16 L10.47 7.51 Z M13.02 9.72 L13.04 9.31 L12.90 8.93 L12.63 8.62 L12.26 8.45 L11.85 8.43 L11.46 8.56 L11.15 8.84 L10.98 9.21 L10.96 9.62 L11.10 10.01 L11.37 10.31 L11.74 10.49 L12.15 10.51 L12.54 10.37 L12.85 10.10 Z M21.98 7.87 L22.33 8.86 L22.59 9.89 L22.75 10.94 L22.80 12.00 L22.75 13.06 L22.59 14.11 L22.33 15.14 L21.98 16.13 L21.52 17.09 L20.98 18.00 L20.35 18.85 L19.64 19.64 L18.85 20.35 L18.00 20.98 L17.09 21.52 L16.13 21.98 L15.14 22.33 L14.11 22.59 L13.06 22.75 L12.00 22.80 L10.94 22.75 L9.89 22.59 L8.86 22.33 L7.87 21.98 L6.93 21.53 L7.87 19.77 L8.83 20.21 L9.65 20.48 L10.50 20.67 L11.35 20.78 L12.43 20.79 L13.29 20.70 L14.14 20.54 L14.96 20.29 L16.15 19.76 L17.24 19.07 L18.22 18.22 L19.07 17.24 L19.43 16.71 L19.86 15.96 L20.21 15.17 L20.42 14.55 L20.59 13.93 L20.73 13.08 L20.79 12.43 L20.79 11.57 L20.70 10.71 L20.59 10.07 L20.36 9.24 L20.05 8.43 L19.66 7.66 L19.32 7.11 L18.94 6.59 L18.37 5.93 L17.41 5.06 L16.52 4.45 L15.57 3.95 L14.35 3.52 L13.29 3.30 L12.00 3.20 L10.71 3.30 L9.65 3.52 L8.43 3.95 L7.29 4.57 L6.25 5.34 L5.34 6.25 L4.57 7.29 L3.95 8.43 L3.52 9.65 L3.29 10.78 L1.32 10.50 L1.41 9.89 L1.67 8.86 L2.02 7.87 L2.48 6.91 L3.02 6.00 L3.65 5.15 L4.36 4.36 L5.15 3.65 L6.00 3.02 L6.91 2.48 L7.87 2.02 L8.86 1.67 L9.89 1.41 L10.94 1.25 L12.00 1.20 L13.06 1.25 L14.11 1.41 L15.14 1.67 L16.13 2.02 L17.09 2.48 L17.34 2.62 L17.20 2.94 L17.20 3.12 L17.29 3.34 L18.12 4.08 L17.88 5.11 L17.92 5.35 L18.04 5.54 L18.34 5.72 L18.63 5.72 L19.60 5.16 L20.46 5.68 L20.78 5.73 L21.52 6.91 Z M11.37 15.36 L10.95 13.93 L13.05 13.93 L12.63 15.36 L12.42 15.81 L12.21 16.07 L12.00 16.16 L11.79 16.07 L11.58 15.81 Z",
    "moon-buddy": "M21.68 2.78 L21.69 3.15 L21.59 3.57 L21.36 3.95 L21.09 4.20 L20.71 4.41 L20.35 4.49 L19.91 4.47 L19.51 4.33 L19.20 7.60 L18.95 7.55 L18.80 7.22 L18.67 7.12 L18.47 7.05 L16.54 7.04 L15.43 6.92 L14.79 6.89 L13.49 6.96 L14.37 7.20 L12.63 7.50 L11.44 7.82 L9.79 8.45 L8.74 9.00 L7.73 9.67 L6.80 10.43 L5.94 11.30 L5.16 12.27 L5.07 12.46 L5.08 12.78 L5.27 13.04 L5.57 13.15 L5.88 13.08 L7.15 11.62 L7.96 10.88 L9.29 9.96 L10.74 9.24 L11.77 8.87 L13.43 8.46 L14.60 8.28 L16.20 8.15 L16.84 8.67 L17.33 9.16 L17.78 9.71 L18.18 10.30 L18.51 10.92 L18.78 11.57 L18.98 12.25 L19.15 13.12 L19.20 13.82 L19.18 14.53 L19.06 15.40 L18.89 16.09 L18.65 16.76 L18.35 17.39 L17.89 18.15 L17.45 18.70 L16.96 19.21 L16.43 19.68 L15.85 20.08 L15.24 20.43 L14.59 20.72 L13.92 20.94 L13.23 21.09 L12.53 21.18 L11.82 21.20 L11.12 21.15 L10.42 21.03 L9.74 20.84 L9.08 20.58 L8.45 20.26 L7.85 19.89 L7.30 19.45 L6.67 18.84 L6.11 18.15 L5.65 17.39 L5.28 16.59 L4.97 15.58 L4.82 14.53 L4.82 13.47 L5.01 12.29 L4.60 12.20 L4.80 10.77 L5.21 9.47 L5.80 8.32 L6.57 7.32 L7.50 6.47 L8.59 5.78 L9.81 5.24 L11.16 4.88 L12.63 4.69 L14.20 4.68 L15.86 4.85 L17.60 5.20 L19.02 3.92 L18.84 3.64 L18.73 3.29 L18.70 2.93 L18.76 2.56 L18.91 2.23 L19.14 1.94 L19.43 1.71 L19.76 1.56 L20.13 1.50 L20.42 1.52 L20.97 1.71 L21.26 1.94 L21.45 2.17 L21.61 2.49 Z M8.13 14.81 L8.56 15.17 L9.05 15.41 L9.45 15.49 L9.93 15.47 L10.44 15.28 L10.93 14.94 L11.29 14.55 L11.35 14.35 L11.34 14.18 L11.25 13.99 L11.10 13.84 L10.95 13.77 L10.74 13.75 L10.49 13.85 L9.94 14.30 L9.72 14.39 L9.54 14.40 L9.18 14.25 L8.67 13.82 L8.52 13.76 L8.30 13.76 L8.02 13.91 L7.86 14.18 L7.89 14.50 Z M12.95 14.83 L13.40 15.19 L13.85 15.41 L14.25 15.49 L14.73 15.47 L15.24 15.28 L15.73 14.94 L16.09 14.55 L16.14 14.40 L16.14 14.18 L16.05 13.99 L15.90 13.84 L15.75 13.77 L15.54 13.75 L15.29 13.85 L14.74 14.30 L14.52 14.39 L14.34 14.40 L13.98 14.25 L13.47 13.82 L13.32 13.76 L13.10 13.76 L12.95 13.81 L12.78 13.95 L12.65 14.24 L12.71 14.55 Z M10.48 18.12 L10.98 18.39 L11.49 18.55 L12.02 18.60 L12.51 18.55 L13.19 18.31 L13.72 17.98 L13.86 17.79 L13.89 17.50 L13.75 17.24 L13.45 17.10 L13.21 17.14 L12.53 17.50 L12.00 17.60 L11.47 17.50 L10.79 17.14 L10.51 17.11 L10.22 17.28 L10.10 17.60 L10.18 17.87 Z",
    "parents": "M11.06 5.70 L11.10 6.30 L11.02 6.90 L10.82 7.48 L10.52 8.01 L10.12 8.46 L9.64 8.83 L9.09 9.10 L8.50 9.26 L7.90 9.30 L7.30 9.22 L6.72 9.02 L6.19 8.72 L5.74 8.32 L5.37 7.84 L5.10 7.29 L4.94 6.70 L4.90 6.10 L4.98 5.50 L5.18 4.92 L5.48 4.39 L5.88 3.94 L6.36 3.57 L6.91 3.30 L7.50 3.14 L8.10 3.10 L8.70 3.18 L9.28 3.38 L9.81 3.68 L10.26 4.08 L10.63 4.56 L10.90 5.11 Z M19.03 6.59 L19.10 7.11 L19.06 7.64 L18.93 8.15 L18.69 8.63 L18.37 9.05 L17.97 9.39 L17.51 9.66 L17.01 9.83 L16.49 9.90 L15.96 9.86 L15.45 9.73 L14.97 9.49 L14.55 9.17 L14.21 8.77 L13.94 8.31 L13.77 7.81 L13.70 7.29 L13.74 6.76 L13.87 6.25 L14.11 5.77 L14.43 5.35 L14.83 5.01 L15.29 4.74 L15.79 4.57 L16.31 4.50 L16.84 4.54 L17.35 4.67 L17.83 4.91 L18.25 5.23 L18.59 5.63 L18.86 6.09 Z M12.67 13.12 L12.58 13.25 L12.98 12.70 L13.32 12.32 L13.83 11.87 L14.25 11.58 L14.70 11.34 L15.33 11.08 L16.32 10.84 L17.34 10.81 L17.85 10.87 L18.51 11.02 L19.45 11.41 L19.89 11.68 L20.40 12.07 L19.91 12.09 L19.70 12.17 L19.42 12.36 L15.55 16.72 L14.13 15.31 L13.84 15.14 L13.51 15.06 L13.07 15.10 L12.86 15.19 L12.59 15.39 L12.39 15.66 L12.30 15.87 L12.26 16.31 L12.34 16.64 L12.51 16.93 L14.87 19.29 L15.05 19.41 L15.36 19.52 L15.69 19.55 L16.01 19.47 L16.30 19.31 L16.46 19.16 L21.06 13.96 L21.29 13.57 L21.35 13.15 L21.74 13.85 L21.98 14.49 L22.13 15.15 L22.20 15.83 L22.17 16.51 L22.06 17.18 L21.87 17.83 L21.60 18.42 L21.60 21.00 L18.43 21.00 L18.51 20.98 L17.51 21.17 L16.49 21.17 L15.57 21.00 L15.10 21.00 L15.10 20.84 L14.55 20.59 L14.11 20.32 L14.20 20.38 L14.20 21.00 L1.80 21.00 L1.81 16.90 L1.92 15.99 L2.07 15.40 L2.40 14.55 L2.84 13.76 L3.41 13.04 L4.31 12.22 L5.35 11.60 L6.49 11.19 L7.70 11.01 L8.61 11.03 L9.80 11.27 L10.92 11.73 L11.93 12.41 Z"
};

  const KEYWORDS = {
    rocket: ['rocket', 'launch', 'mission', 'family', 'kids', 'rakete', 'start'],
    'rocket-ring': ['rocket', 'ring', 'progress', 'goal', 'family goal', 'rakete', 'ziel'],
    'moon-buddy': ['moon', 'sleep', 'night', 'bedtime', 'mond', 'schlafen', 'nacht'],
    parents: ['parents', 'adults', 'family', 'eltern', 'erwachsene'],
  };

  window.customIcons = window.customIcons || {};
  window.customIcons.fm = {
    getIcon: async (name) => ({ path: ICONS[name] || '', viewBox: '0 0 24 24' }),
    getIconList: async () => Object.keys(ICONS).map((name) => ({ name, keywords: KEYWORDS[name] || [] })),
  };

  // Inline SVG parts of the app icon (512 x 512 viewBox) and of the lettering (light / dark theme).
  const ICON_BODY = "<defs><linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1e88e5\"/><stop offset=\"1\" stop-color=\"#26c6a6\"/></linearGradient></defs><rect x=\"16\" y=\"16\" width=\"480\" height=\"480\" rx=\"112\" fill=\"url(#bg)\"/><circle cx=\"256\" cy=\"272\" r=\"150\" fill=\"none\" stroke=\"#ffffff\" stroke-opacity=\".25\" stroke-width=\"34\"/><path d=\"M256 122 A150 150 0 1 1 116 330\" fill=\"none\" stroke=\"#ffca28\" stroke-width=\"34\" stroke-linecap=\"round\"/><g transform=\"translate(256 262)\"><path d=\"M0 -118 C40 -70 44 0 34 64 L-34 64 C-44 0 -40 -70 0 -118Z\" fill=\"#fff\"/><path d=\"M0 -118 C17 -98 27 -78 32 -54 L-32 -54 C-27 -78 -17 -98 0 -118Z\" fill=\"#ff5252\"/><circle cx=\"0\" cy=\"-12\" r=\"17\" fill=\"#1e88e5\" stroke=\"#cfd8dc\" stroke-width=\"6\"/><path d=\"M-34 20 L-62 76 L-30 62Z M34 20 L62 76 L30 62Z\" fill=\"#ff5252\"/><path d=\"M-20 68 Q0 140 20 68Z\" fill=\"#ffca28\"/><path d=\"M-10 68 Q0 110 10 68Z\" fill=\"#fff3b0\"/></g><g fill=\"#ffca28\"><path d=\"M402 104 l9 20 21 3 -15 15 4 21 -19 -10 -19 10 4 -21 -15 -15 21 -3z\"/></g>";
  const TEXT_LIGHT = "<text x=\"404\" y=\"196\" font-family=\"Inter, 'Segoe UI', Roboto, Arial, sans-serif\" font-size=\"118\" font-weight=\"800\" fill=\"#1f2a44\" letter-spacing=\"-2\">Family<tspan fill=\"#1e88e5\">Mission</tspan></text><text x=\"410\" y=\"268\" font-family=\"Inter, 'Segoe UI', Roboto, Arial, sans-serif\" font-size=\"46\" font-weight=\"500\" fill=\"#4a5a75\">Family missions for kids &amp; parents</text>";
  const TEXT_DARK = "<text x=\"404\" y=\"196\" font-family=\"Inter, 'Segoe UI', Roboto, Arial, sans-serif\" font-size=\"118\" font-weight=\"800\" fill=\"#f1f3f5\" letter-spacing=\"-2\">Family<tspan fill=\"#1e88e5\">Mission</tspan></text><text x=\"410\" y=\"268\" font-family=\"Inter, 'Segoe UI', Roboto, Arial, sans-serif\" font-size=\"46\" font-weight=\"500\" fill=\"#9fb3c8\">Family missions for kids &amp; parents</text>";
  let counter = 0;

  /** The gradient id is unique per call: several SVGs may live side by side in different shadow roots. */
  const iconBody = () => {
    const id = 'fmbg' + (++counter) + '_' + Math.random().toString(36).slice(2, 7);
    return ICON_BODY.replace(/id="bg"/g, 'id="' + id + '"').replace(/url\(#bg\)/g, 'url(#' + id + ')');
  };

  window.FamilyMissionBrand = {
    /** App icon as an inline SVG string, `size` in px (default 24). */
    iconSvg(size) {
      const s = Number(size) > 0 ? Number(size) : 24;
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="' + s + '" height="' + s
        + '" role="img" aria-label="FamilyMission" style="display:block;flex:none">' + iconBody() + '</svg>';
    },
    /** Logo with lettering as an inline SVG string, `width` in px (default 320), `dark` for dark themes. */
    logoSvg(width, dark) {
      const w = Number(width) > 0 ? Number(width) : 320;
      const h = Math.round(w * 384 / 1280);
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 384" width="' + w + '" height="' + h
        + '" role="img" aria-label="FamilyMission" style="display:block;max-width:100%;height:auto">'
        + '<svg x="0" y="0" width="384" height="384" viewBox="0 0 512 512">' + iconBody() + '</svg>'
        + (dark ? TEXT_DARK : TEXT_LIGHT) + '</svg>';
    },
  };
})();
