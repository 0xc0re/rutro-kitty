document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const catImage = new Image();
    catImage.src = "/images/cat1.png"; // Placeholder for the cat image URL

    const laserImage = new Image();
    laserImage.src = "/images/laserz.png";

    const lasers = [];

    class Cat {
        constructor() {
            this.size = 64;
            this.minSize = 32; // Minimum size for the cat
            this.maxSize = 512; // Maximum size for the cat
            this.shrinkFactor = 0.1; // 10% shrink factor
            this.growFactor = 0.2; // 20% growth factor
            this.x = canvas.width / 2 - this.size / 2;
            this.y = canvas.height / 2 - this.size / 2;
            this.speed = 4;
            this.catImage = "/images/cat1.png"; // Placeholder for the cat image URL
            this.loadCatImages(); // Call the method to load cat images
        }
    
        // Method to load cat images from a JSON file
        loadCatImages() {
            fetch("/kitties.json")
                .then(response => response.json())
                .then(data => {
                    const randomCat = data[Math.floor(Math.random() * data.length)]; // Select a random cat from the list
                    this.catImage = randomCat.url; // Assign the URL to the catImage property
                    catImage.src = this.catImage; // Load the image
                });
        }
    
        shrink() {
            this.size = Math.max(this.size * (1 - this.shrinkFactor), this.minSize);
        }
    
        grow() {
            this.size = Math.min(this.size * (1 + this.growFactor), this.maxSize);
        }
    
        move(keys) {
            if (keys['ArrowUp']) this.y -= this.speed;
            if (keys['ArrowDown']) this.y += this.speed;
            if (keys['ArrowLeft']) this.x -= this.speed;
            if (keys['ArrowRight']) this.x += this.speed;
    
            this.x = Math.min(Math.max(this.x, 0), canvas.width - this.size);
            this.y = Math.min(Math.max(this.y, 0), canvas.height - this.size);
        }
    
        draw() {
            ctx.drawImage(catImage, this.x, this.y, this.size, this.size);
        }
    
        fireLaser() {
            lasers.push(new Laser(this));
        }
    }    

    class Laser {
        constructor(cat) {
            this.x = cat.x + cat.size; // Starting position of the laser
            this.y = cat.y + cat.size / 2; // Centered on the cat's height
            this.width = 80; // Customize laser width
            this.height = 40; // Customize laser height
            this.speed = 5; // Speed of the laser
        }
    
        // Move the laser horizontally across the canvas
        move() {
            this.x += this.speed;
        }
    
        // Draw the laser on the canvas
        draw() {
            ctx.drawImage(laserImage, this.x, this.y, this.width, this.height);
        }
    
        // Check if the laser is out of bounds
        isOutOfBounds() {
            return this.x > canvas.width;
        }
    }    

    class Bubble {
        constructor(cat) {
            this.cat = cat;
            this.size = 32; // Bubble size
            this.x = Math.random() * (canvas.width - this.size);
            this.y = Math.random() * (canvas.height - this.size);
            this.direction = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
            this.color = randomColor();
            this.randomDisappear();
        }
    
        move() {
            this.x += this.direction.x;
            this.y += this.direction.y;
    
            // Bounce off the walls
            if (this.x < 0 || this.x + this.size > canvas.width) {
                this.direction.x = -this.direction.x;
            }
            if (this.y < 0 || this.y + this.size > canvas.height) {
                this.direction.y = -this.direction.y;
            }
        }
    
        draw() {
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    
        randomDisappear() {
            const randomDisappearTime = Math.random() * 20000 + 1000;
            setTimeout(() => {
                this.disappearing = true;
                this.cat.shrink(); // Call the shrink method on the cat
            }, randomDisappearTime);
        }
    
        isDisappearing() {
            return this.disappearing;
        }
    }
    
    function randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
   

    class Game {
        constructor() {
            this.minBubbles = 20;
            this.score = 0;
            this.cat = new Cat();
            this.keys = {};
            this.bubbles = [];
            this.createBubblesIfNeeded();
            setInterval(this.createBubblesIfNeeded.bind(this), this.getBubbleCreationInterval());

            // Adding event listeners for keydown and keyup
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
            window.addEventListener('keyup', this.handleKeyUp.bind(this));
            // Adding event listeners for joystick controls
            document.getElementById('up-btn').addEventListener('mousedown', () => this.handleControl('ArrowUp', true));
            document.getElementById('down-btn').addEventListener('mousedown', () => this.handleControl('ArrowDown', true));
            document.getElementById('left-btn').addEventListener('mousedown', () => this.handleControl('ArrowLeft', true));
            document.getElementById('right-btn').addEventListener('mousedown', () => this.handleControl('ArrowRight', true));

            // Adding event listeners for action controls
            document.getElementById('space-btn').addEventListener('mousedown', () => this.handleControl('Space', true));
            document.getElementById('ctrl-btn').addEventListener('mousedown', () => this.handleControl('Control', true));

            // Adding event listeners for mouseup to reset the control state
            document.querySelectorAll('.arrow-btn, .action-btn').forEach(btn => {
                btn.addEventListener('mouseup', () => this.resetControls());
                btn.addEventListener('mouseleave', () => this.resetControls());
            });
        }

        // Handling keydown event
        handleKeyDown(e) {
            this.keys[e.code] = true;

            // Firing laser on Ctrl key press
            if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
                this.cat.fireLaser();
            }
        }
        
        // Handling control events
        handleControl(key, value) {
            this.keys[key] = value;
            if (key === 'Control') this.cat.fireLaser();
        }

        // Resetting control state on mouseup
        resetControls() {
            this.keys = {};
        }

        // Handling keyup event
        handleKeyUp(e) {
            this.keys[e.code] = false;
        }
    
        updateScore() {
            document.getElementById('score-board').textContent = 'Score: ' + this.score;
        }
    
        createBubblesIfNeeded() {
            const maxBubbles = Math.min(this.minBubbles + Math.floor(this.score / this.minBubbles), 200);
            while (this.bubbles.length < maxBubbles) {
                this.bubbles.push(new Bubble(this.cat)); // Pass the cat object to the Bubble constructor
            }
        }
    
        getBubbleCreationInterval() {
            return Math.max(2000 - (this.score * 100), 500);
        }
    
        update() {
            this.cat.move(this.keys);
    
            // Move lasers
            lasers.forEach(laser => laser.move());
    
            // Move bubbles
            this.bubbles.forEach(bubble => bubble.move());
    
            // Check for intersections
            this.bubbles = this.bubbles.filter(bubble => {
                // Check for intersection with cat
                if (this.cat.x < bubble.x + bubble.size && this.cat.x + this.cat.size > bubble.x &&
                    this.cat.y < bubble.y + bubble.size && this.cat.y + this.cat.size > bubble.y) {
    
                    this.cat.grow(); // Grow the cat
                    this.score++; // Increment the score
                    this.updateScore(); // Update the score display
                    return false; // Remove the bubble
                }
    
                // Check for intersection with lasers
                for (const laser of lasers) {
                    if (laser.x < bubble.x + bubble.size && laser.x + laser.width > bubble.x &&
                        laser.y < bubble.y + bubble.size && laser.y + laser.height > bubble.y) {
    
                        this.cat.grow();
                        this.score++;
                        this.updateScore();
                        return false; // Remove the bubble
                    }
                }
    
                return !bubble.isDisappearing(); // Keep the bubble if it's not disappearing
            });
        }
    
        draw() {
            this.cat.draw();
            this.bubbles.forEach(bubble => bubble.draw());
            lasers.forEach(laser => laser.draw());
        }
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.draw();
        requestAnimationFrame(update);
    }

    const game = new Game();
    update();
});
