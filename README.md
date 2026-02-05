# Walang Basagan ng Thrift

React + TypeScript + Tailwind CSS using Vite.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.

## Windows helper scripts

In the project folder you will find two batch files to make setup easy:

- `install-node.bat`  
  - Uses the `node-installer.msi` file in the project root.  
  - Double-click this once to install Node.js.  
  - Follow the on-screen installer steps, then close the window when finished.

- `run.bat`  
  - Double-click this to start the site.  
  - If Node.js is missing, it will tell you to run `install-node.bat` first.  
  - On the first run it will automatically install NPM packages.  
  - It then starts the dev server (`npm run dev`) and keeps the window open.

## Tailwind CSS

Tailwind is configured in `tailwind.config.js`. Global styles and Tailwind layers are in `src/index.css`.
