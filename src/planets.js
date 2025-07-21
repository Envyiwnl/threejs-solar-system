// Define each planet's parameters

export const PLANETS = [
  {
    name: 'Mercury',
    size: 0.6,
    distance: 10,
    speed: 0.04,
    texture: 'src/textures/mercury.jpg'
  },
  {
    name: 'Venus',
    size: 1.3,
    distance: 14,
    speed: 0.015,
    texture: 'src/textures/venus.jpg'
  },
  {
    name: 'Earth',
    size: 1.4,
    distance: 18,
    speed: 0.01,
    // we’ll load day/night separately in main.js
    textureDay:   'src/textures/earth_day.jpg',
    textureNight:'src/textures/earth_night.jpg'
  },
  {
    name: 'Mars',
    size: 1.0,
    distance: 22,
    speed: 0.008,
    texture: 'src/textures/mars.jpg'
  },
  {
    name: 'Jupiter',
    size: 2.6,
    distance: 29,
    speed: 0.005,
    texture: 'src/textures/jupiter.jpg'
  },
  {
    name: 'Saturn',
    size: 2.3,
    distance: 36,
    speed: 0.004,
    texture: 'src/textures/saturn.jpg',
    ringTexture: 'src/textures/saturn_ring.png'
  },
  {
    name: 'Uranus',
    size: 1.9,
    distance: 44,
    speed: 0.003,
    texture: 'src/textures/uranus.jpg'
  },
  {
    name: 'Neptune',
    size: 1.8,
    distance: 52,
    speed: 0.002,
    texture: 'src/textures/neptune.jpg'
  }
];