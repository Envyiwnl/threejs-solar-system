Three.js Solar System

A mobile‑responsive single‑page 3D simulation of the Solar System built with Three.js and vanilla JavaScript.

Features of the project:

- Orbit the eight planets around the Sun  
- Click a planet to zoom in and see its name & rotation  
- Adjust each planet’s orbital speed via a dropdown‑driven slider  
- Apply global speed presets (Normal / 2× / 4×)  
- Hover over any planet to see a tooltip label  
- Toggle between dark and light themes  

Prerequisites

- [Node.js & npm](https://nodejs.org/) (v14+ recommended)  
- A modern browser with WebGL support (Chrome, Firefox, Edge, Safari)

Folder Structure

solarsystemassignment/
├── assets/
│ └── textures/ #all planet, starfield & ring images
├── src/
│ ├── main.js #application entry point
│ └── planets.js #planet configuration data
├── styles.css #all UI and theme styles
├── index.html #HTML file loading canvas and scripts
├── package.json #npm scripts & dependencies
└── README.md #Instructions to run or Clone!

Installation & Running

Clone the Repo

git clone https://github.com/Envyiwnl/threejs-solar-system.git

cd three.js-solar-system

Install Dependencies

npm install

Starting dev server

npm start

This will automatically open index.html in your browser at http://127.0.0.1:8080.

Troubleshooting

WebGL errors: if you see “WebGL context could not be created,” try disabling antialias in the renderer or updating your GPU drivers.

Module import errors: ensure you’re running via a local server (npm start), not file://.

Textures not loading: confirm all images live under assets/textures/ and your paths in planets.js match exactly.