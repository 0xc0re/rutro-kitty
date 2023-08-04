$(document).ready(function () {
    class Cat {
        constructor() {
            this.lastFired = 0;
            this.size = 24;
            this.minSize = 4; // Minimum size for the cat
            this.maxSize = 32; // Maximum size for the cat
            this.shrinkFactor = 0.01;
            this.growFactor = 0.01;
            this.x = $('#game-container').width() / 2 - this.size / 2;
            this.y = $('#game-container').height() / 2 - this.size / 2;
            this.speed = 4;
            this.catImage = "images/cat1.png"; // Placeholder for the cat image URL
            this.loadCatImages(); // Call the method to load cat images
            this.targetX = null; // Target x-coordinate for movement
            this.targetY = null; // Target y-coordinate for movement
        }

        moveTo(targetX, targetY) {
            this.targetX = targetX;
            this.targetY = targetY;
        }

        updateMovement() {
            if (this.targetX === null || this.targetY === null) return; // Return if no target

            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.speed) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.targetX = null; // Reset target
                this.targetY = null; // Reset target
            } else {
                const directionX = dx / distance;
                const directionY = dy / distance;
                this.x += directionX * this.speed;
                this.y += directionY * this.speed;
            }

            $('#cat').css({ left: this.x, top: this.y });
        }


        // Method to load cat images from a JSON file
        loadCatImages() {
            $.getJSON("/kitties.json", (data) => {
                const randomCat = data[Math.floor(Math.random() * data.length)]; // Select a random cat from the list
                this.catImage = randomCat.url; // Assign the URL to the catImage property
                this.setCss(); // Call the setCss method to update the cat's appearance
            });
        }

        setCss() {
            $('#cat').css({ left: this.x, top: this.y, width: this.size, height: this.size });
            $('#cat').attr('src', this.catImage); // Change the src attribute to the new cat image
        }

        shrink() {
            this.size = Math.max(this.size * (1 - this.shrinkFactor), this.minSize);
            this.setCss();

            // If the cat's size is the minimum, game over
            if (this.size === this.minSize) {
                game.gameOver();
            }
        }

        grow() {
            this.size = Math.min(this.size * (1 + this.growFactor), this.maxSize);
            this.setCss();
        }

        move(keys) {
            if (keys['ArrowUp']) this.y -= this.speed;
            if (keys['ArrowDown']) this.y += this.speed;
            if (keys['ArrowLeft']) this.x -= this.speed;
            if (keys['ArrowRight']) this.x += this.speed;

            this.x = Math.min(Math.max(this.x, 0), $('#game-container').width() - this.size);
            this.y = Math.min(Math.max(this.y, 0), $('#game-container').height() - this.size);

            $('#cat').css({ left: this.x, top: this.y }); // Use .css() instead of .animate()
        }

        getCooldownTime() {
            // Cooldown time increases linearly with the cat's size
            return 1 + (this.size - this.minSize); // Minimum cooldown is 500ms, increases with size
        }

        fireLaser() {
            const now = Date.now();
            if (now - this.lastFired < this.getCooldownTime()) return;

            this.lastFired = now;
            const $laser = $('<img src="/images/laserz.png" class="laser">');
            $laser.css({
                left: this.x + this.size,
                top: this.y + this.size / 2,
                width: 60, // Adjust laser width relative to cat's size
                height: this.size / 2, // Adjust laser height relative to cat's size
                position: 'absolute',
            });
            $('#game-container').append($laser);

            $laser.animate({ left: $('#game-container').width() }, 1000, function () {
                $laser.remove();
            });
        }

    }

    class Bubble {
        constructor(cat) {
            this.cat = cat;
            this.minSize = Math.floor(Math.random() * (16 - 8 + 1)) + 8;
            this.$element = $('<div class="bubble"></div>');
            this.direction = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
            this.setCss();
            $('#game-container').append(this.$element);
            this.randomDisappear();
        }
        
        setCss() {
            this.$element.css({
                left: Math.random() * ($('#game-container').width() - 32),
                top: Math.random() * ($('#game-container').height() - 32),
                backgroundColor: randomColor(),
                opacity: Math.random() * 0.5 + 0.5,
                width: this.minSize,
                height: this.minSize,
            });
        }

        move() {
            const attractionFactor = 0.01; // You can adjust this value
        
            // Calculate the direction towards the cat
            const dx = this.cat.x + this.cat.size / 2 - (this.$element.position().left + 16);
            const dy = this.cat.y + this.cat.size / 2 - (this.$element.position().top + 16);
            const distance = Math.sqrt(dx * dx + dy * dy);
        
            // Calculate attraction effect
            const attractionX = dx / distance * attractionFactor;
            const attractionY = dy / distance * attractionFactor;
        
            // Add attraction effect to existing direction
            this.direction.x += attractionX;
            this.direction.y += attractionY;
        
            // Update the direction for movement
            let x = this.$element.position().left + this.direction.x;
            let y = this.$element.position().top + this.direction.y;
        
            // Check if bubble is at the edge of the container
            // Reverse direction if bubble is at the edge
            const containerWidth = $('#game-container').width() - this.minSize;
            const containerHeight = $('#game-container').height() - this.minSize;
            if (x <= 0 || x >= containerWidth) {
                this.direction.x = -this.direction.x;
                x = Math.max(0, Math.min(x, containerWidth)); // Bound x within the container
            }
            if (y <= 0 || y >= containerHeight) {
                this.direction.y = -this.direction.y;
                y = Math.max(0, Math.min(y, containerHeight)); // Bound y within the container
            }
        
            // Update bubble position
            this.$element.css({ left: x, top: y });
        }

        randomDisappear() {
            const randomDisappearTime = Math.random() * 20000 + 1000;
            setTimeout(() => {
                this.$element.animate({ width: 0, height: 0, opacity: 0 }, 500, () => {
                    this.$element.remove();
                });
            }, randomDisappearTime);
        }

    }

    class Game {
        constructor() {
            this.minBubbles = 20;
            this.score = 0;
            this.cat = new Cat();
            this.keys = {};
            this.createBubblesIfNeeded();
            this.updateScore();
            setInterval(this.createBubblesIfNeeded.bind(this), this.getBubbleCreationInterval());
            this.animateGame = this.animateGame.bind(this);
            requestAnimationFrame(this.animateGame);

            // Handle double click event for desktop
            $('#game-container').on('dblclick', () => {
                this.cat.fireLaser();
            });

            // Handle double tap event for touch devices
            let lastTapTime = 0;
            $('#game-container').on('touchend', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTapTime;
                lastTapTime = currentTime;
                if (tapLength < 500 && tapLength > 0) { // Adjust time threshold as needed
                    e.preventDefault();
                    this.cat.fireLaser();
                }
            });

            // Adding event listeners for action controls
            this.addControlEvents('space-btn', 'Space');
            this.addControlEvents('ctrl-btn', 'Control');

            // Handle touchstart or mousedown event
            $('#game-container').on('touchstart mousedown', (e) => {
                this.updateTargetPosition(e);
            });
            // Handle touchmove event to update target position
            $('#game-container').on('touchmove', (e) => {
                this.updateTargetPosition(e);
            });

            // Handle touchend or mouseup event to stop movement
            $('#game-container').on('touchend mouseup', () => {
                this.cat.targetX = null; // Reset target
                this.cat.targetY = null; // Reset target
            });
        }
        // Method to update target position based on event
        updateTargetPosition(e) {
            let targetX, targetY;
            if (e.type === 'touchstart' || e.type === 'touchmove') {
                const touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                targetX = touch.clientX - $('#game-container').offset().left;
                targetY = touch.clientY - $('#game-container').offset().top;
            } else { // Handle mouse events
                targetX = e.clientX - $('#game-container').offset().left;
                targetY = e.clientY - $('#game-container').offset().top;
            }
            this.cat.moveTo(targetX, targetY); // Move the cat to the touched position
        }

        animateGame() {
            this.cat.updateMovement(); // Update the cat's movement
            this.moveBubbles(); // Move the bubbles
            this.updatePosition(); // Check for intersections and update positions
            requestAnimationFrame(this.animateGame); // Continue the game loop
        }

        gameOver() {
            // Stop all animations
            $('.bubble').stop();
            $('.laser').stop();

            // Remove all bubbles and lasers
            $('.bubble').remove();
            $('.laser').remove();

            // Stop the game loop
            cancelAnimationFrame(this.animateGame);

            // Show the game over modal
            $('#game-over-modal').fadeIn();
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

        addControlEvents(elementId, key) {
            const element = document.getElementById(elementId);
            element.addEventListener('mousedown', (e) => { e.preventDefault(); this.handleControl(key, true); });
            element.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleControl(key, true); });
            element.addEventListener('mouseup', (e) => { e.preventDefault(); this.resetControls(); });
            element.addEventListener('touchend', (e) => { e.preventDefault(); this.resetControls(); });
            element.addEventListener('mouseleave', (e) => { e.preventDefault(); this.resetControls(); });
            element.addEventListener('touchcancel', (e) => { e.preventDefault(); this.resetControls(); });
        }

        updateScore() {
            $('#score-board').text('Score: ' + this.score);
        }

        createBubblesIfNeeded() {
            const maxBubbles = Math.min(this.minBubbles + Math.floor(this.score / this.minBubbles), 200);
            while ($('.bubble').length < maxBubbles) {
                const bubble = new Bubble(this.cat);
                $(bubble.$element).data('instance', bubble); // Store the Bubble instance
            }
        }

        moveBubbles() {
            $('.bubble').each((_, bubbleElement) => {
                const bubbleInstance = $(bubbleElement).data('instance'); // Retrieve the Bubble instance
                if (bubbleInstance) bubbleInstance.move(); // Call the move method
            });
        }

        getBubbleCreationInterval() {
            return Math.max(2000 - (this.score * 100), 500);
        }

        updatePosition() {
            this.cat.move(this.keys);

            $('.bubble').each((_, bubbleElement) => {
                const $bubble = $(bubbleElement);
                const bubbleX = $bubble.position().left;
                const bubbleY = $bubble.position().top;

                // Check for intersection with cat
                if (this.cat.x < bubbleX + 32 && this.cat.x + this.cat.size > bubbleX &&
                    this.cat.y < bubbleY + 32 && this.cat.y + this.cat.size > bubbleY) {
                    this.popBubble($bubble); // Call the separated popBubble method
                    this.cat.shrink(); // Shrink the cat
                }

                // Check for intersection with lasers
                $('.laser').toArray().some((laser) => {
                    const $laser = $(laser);
                    const laserX = $laser.position().left;
                    const laserY = $laser.position().top;
                    if (laserX < bubbleX + 32 && laserX + $laser.width() > bubbleX &&
                        laserY < bubbleY + 32 && laserY + $laser.height() > bubbleY) {
                        this.popBubble($bubble); // Call the separated popBubble method
                        this.cat.grow(); // Grow the cat
                        return true; // Stops further processing if a laser intersects
                    }
                    return false;
                });
            });
        }

        popBubble($bubble) {
            // Define an array of effects
            const effects = ["explode", "puff", "clip", "shake", "bounce", "slide"];

            // Choose a random effect from the array
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];

            // Apply the chosen effect
            $bubble.effect(randomEffect, { pieces: 8 }, 250, () => {
                // Remove bubble after animation
                $bubble.remove();
                this.score++; // Increment the score
                this.updateScore(); // Update the score display
            });
        }


    }

    function randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    const game = new Game();

    $(document).keydown(function (event) {
        game.keys[event.key] = true;

        if (event.key === ' ') {
            $('#cat').animate({ top: game.cat.y - game.cat.size }, 300, function () {
                $('#cat').animate({ top: game.cat.y }, 300);
            });
        }

        if (event.ctrlKey) {
            game.cat.fireLaser();
        }
    });

    $(document).keyup(function (event) {
        game.keys[event.key] = false;
    });

    // Touch control for space button (jump)
    $('#space-btn').on('touchstart mousedown', function () {
        $('#cat').animate({ top: game.cat.y - game.cat.size }, 300, function () {
            $('#cat').animate({ top: game.cat.y }, 300);
        });
    });

    // Touch control for CTRL button (fire laser)
    $('#ctrl-btn').on('touchstart mousedown', function () {
        game.cat.fireLaser();
    });

    $('#restart-btn').click(function () {
        location.reload(); // Reload the page to restart the game
    });

});
