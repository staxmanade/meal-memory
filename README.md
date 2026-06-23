# Meal Memory

A local-first, mobile-friendly PWA for remembering restaurant meals, dishes, ratings, photos, notes, and the people who were there.

## Run Locally

This app is dependency-free and can run from any static file server:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy To GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, enable GitHub Pages using GitHub Actions.
3. Push to `main` or run the `Deploy to GitHub Pages` workflow manually.

The app is fully static. User-created data is stored locally in the browser's IndexedDB.

## Project Design

See [PROJECT_DESIGN.md](./PROJECT_DESIGN.md) for the product and technical specification.
