# Rutro Kitty

## Overview

Rutro Kitty is an interactive web game where the player controls a cat moving around the screen, interacting with bubbles, growing in size, and firing lasers.

### Features

1. **Control the Cat**: Use the arrow keys to move the cat around the screen.
2. **Bubbles**: Bubbles appear and move around the screen. If the cat or a laser intersects a bubble, it explodes, and the cat grows in size.
3. **Lasers**: Press the CTRL key to fire a laser from the cat.
4. **Score**: Keep track of the score as the cat grows in size.

## How to Play

1. Move the cat using the arrow keys.
2. Try to intersect bubbles to make the cat grow.
3. Press the CTRL key to fire a laser.
4. Watch out for bubble collisions and keep growing!

## Implementation

The game is implemented using HTML, CSS, and JavaScript with jQuery. Bootstrap is used for styling.

### Main Components

- **index.html**: The game area, cat, bubbles, styling, and score are all defined within HTML.

### Scripts

- **script.js**: External JavaScript file containing the main logic for the game.

### Assets

- **cat.png**: Image of the pixelated cat.
- **laserz.png**: Image of the laser fired by the cat.

### Running the Game

To run the game, you will need to have acess to a webserver. An easy way is to use `http-server`. If you don't have it installed, you can install it using the following command:

\`\`\`bash
npm install -g http-server
\`\`\`

Once you have `http-server` installed, follow these steps:

  1. Navigate to the directory containing the game files.
  2. Run the command `http-server` in the command line.
  3. Open your web browser and navigate to `http://localhost:8080` to play the game.

Note: The port number may vary based on your configuration. Please refer to the command line output of `http-server` for the exact URL.
