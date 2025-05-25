# SteerX: High-Speed Highway

A browser-based car racing game where you steer to avoid traffic and go as far as possible.

## Game Features

- Control a car using a virtual steering wheel (mobile) or keyboard (desktop)
- Realistic car physics with acceleration and turning
- Animated road with scrolling background
- Enemy cars to avoid
- Score tracking based on distance traveled
- Sound effects and background music

## How to Play

1. Open `index.html` in a web browser
2. On desktop: Use arrow keys or A/D keys to steer
3. On mobile: Use the virtual steering wheel at the bottom of the screen
4. Avoid crashing into other cars to achieve the highest score

## Development

This game is built using HTML5 Canvas and JavaScript, making it accessible across devices without requiring installation.

### Project Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── assets/             # Game assets (images, sounds)
│   └── steering-wheel.svg  # Steering wheel image
└── js/                 # JavaScript files
    ├── main.js         # Entry point
    ├── game.js         # Main game logic
    ├── car.js          # Car class for player and enemies
    ├── road.js         # Road rendering and animation
    ├── input.js        # Input handling (keyboard, touch)
    └── utils.js        # Utility functions
```

## Future Enhancements

- Multiple vehicle options
- Power-ups and special abilities
- Different track environments
- Leaderboard functionality
- More advanced visual effects
