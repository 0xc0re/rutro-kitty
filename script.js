$(document).ready(function () {
    class Cat {
        constructor() {
            this.size = 64;
            this.x = $('#game-container').width() / 2 - this.size / 2;
            this.y = $('#game-container').height() / 2 - this.size / 2;
            this.speed = 4;
            this.catImage = ""; // Placeholder for the cat image URL
            this.loadCatImages(); // Call the method to load cat images
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
        

        grow() {
            this.size += 2;
            this.setCss();
        }

        move(keys) {
            if (keys['ArrowUp']) this.y -= this.speed;
            if (keys['ArrowDown']) this.y += this.speed;
            if (keys['ArrowLeft']) this.x -= this.speed;
            if (keys['ArrowRight']) this.x += this.speed;

            this.x = Math.min(Math.max(this.x, 0), $('#game-container').width() - this.size);
            this.y = Math.min(Math.max(this.y, 0), $('#game-container').height() - this.size);

            this.setCss();
        }

        fireLaser() {
            const $laser = $('<img src="/images/laserz.png" class="laser">');
            $laser.css({
                left: this.x + this.size,
                top: this.y + this.size / 2,
                position: 'absolute',
            });
            $('#game-container').append($laser);

            $laser.animate({ left: $('#game-container').width() }, 1000, function () {
                $laser.remove();
            });
        }
    }

    class Bubble {
        constructor() {
            this.$element = $('<div class="bubble"></div>');
            this.direction = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
            this.$element.data('direction', this.direction); // Store direction data in the bubble
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
                width: 32,
                height: 32,
            });
        }

        move() {
            let x = this.$element.position().left + this.direction.x;
            let y = this.$element.position().top + this.direction.y;
            this.$element.css({ left: x, top: y });
        }

        randomDisappear() {
            const randomDisappearTime = Math.random() * 10000 + 1000;
            setTimeout(() => {
                this.$element.fadeOut(500, () => {
                    this.$element.remove();
                });
            }, randomDisappearTime);
        }
    }

    class Game {
        constructor() {
            this.score = 0;
            this.cat = new Cat();
            this.keys = {};
            this.createBubblesIfNeeded();
            this.updateScore();
            setInterval(this.createBubblesIfNeeded.bind(this), this.getBubbleCreationInterval());
            setInterval(this.moveBubbles.bind(this), 16);
            setInterval(this.updatePosition.bind(this), 16);
        }

        updateScore() {
            $('#score-board').text('Score: ' + this.score);
        }

        createBubblesIfNeeded() {
            const maxBubbles = Math.min(20 + Math.floor(this.score / 20), 200);
            while ($('.bubble').length < maxBubbles) {
                new Bubble();
            }
        }

        moveBubbles() {
            $('.bubble').each(function() {
                const $bubble = $(this);
                let direction = $bubble.data('direction');
                if (!direction) return; // Skip this iteration if direction data is missing
        
                let x = $bubble.position().left + direction.x;
                let y = $bubble.position().top + direction.y;
        
                // Check for intersections with other bubbles
                $('.bubble').not($bubble).each(function() {
                    const $otherBubble = $(this);
                    const otherX = $otherBubble.position().left;
                    const otherY = $otherBubble.position().top;
                    let otherDirection = $otherBubble.data('direction');
                    if (!otherDirection) return; // Skip this iteration if direction data is missing
        
                    if (x < otherX + 32 && x + 32 > otherX && y < otherY + 32 && y + 32 > otherY) {
                        // Reverse directions if bubbles intersect
                        direction.x = -direction.x;
                        direction.y = -direction.y;
                        otherDirection.x = -otherDirection.x;
                        otherDirection.y = -otherDirection.y;
                        $bubble.data('direction', direction); // Set updated direction data
                        $otherBubble.data('direction', otherDirection); // Set updated direction data
                    }
                });
        
                // Update bubble position
                $bubble.css({ left: x, top: y });
            });
        }
        
        getBubbleCreationInterval() {
            return Math.max(2000 - (this.score * 100), 500);
        }

        updatePosition() {
            this.cat.move(this.keys);
        
            // Check for intersections with bubbles inside the updatePosition function
            $('.bubble').each((_, bubbleElement) => {
                const $bubble = $(bubbleElement);
                const bubbleX = $bubble.position().left;
                const bubbleY = $bubble.position().top;
        
                // Check for intersection with cat
                if (this.cat.x < bubbleX + 32 && this.cat.x + this.cat.size > bubbleX &&
                    this.cat.y < bubbleY + 32 && this.cat.y + this.cat.size > bubbleY) {
        
                    // Explosion animation sequence
                    $bubble.animate({ width: 40, height: 40, opacity: 1 }, 100) // Expand slightly
                        .animate({ width: 0, height: 0, opacity: 0 }, 200, () => { // Shrink to zero
                            $bubble.remove(); // Remove bubble after animation
                            this.cat.grow(); // Grow the cat
                            this.score++; // Increment the score
                            this.updateScore(); // Update the score display
                        });
                }
        
                // Check for intersection with lasers
                $('.laser').toArray().some((laser) => {
                    const $laser = $(laser);
                    const laserX = $laser.position().left;
                    const laserY = $laser.position().top;
                    if (laserX < bubbleX + 32 && laserX + $laser.width() > bubbleX &&
                        laserY < bubbleY + 32 && laserY + $laser.height() > bubbleY) {
        
                        // Similar explosion animation sequence as above
                        $bubble.animate({ width: 40, height: 40, opacity: 1 }, 100)
                            .animate({ width: 0, height: 0, opacity: 0 }, 200, () => {
                                $bubble.remove();
                                this.cat.grow();
                                this.score++;
                                this.updateScore();
                            });
                        return true; // Stops further processing if a laser intersects
                    }
                    return false;
                });
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
            $('#cat').animate({ top: game.cat.y - 64 }, 300, function () {
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
    $('#space-btn').on('touchstart mousedown', function() {
        $('#cat').animate({ top: game.cat.y - 64 }, 300, function () {
            $('#cat').animate({ top: game.cat.y }, 300);
        });
    });

    // Touch control for CTRL button (fire laser)
    $('#ctrl-btn').on('touchstart mousedown', function() {
        game.cat.fireLaser();
    });

    // Touch controls for arrow buttons (movement)
    $('#up-btn').on('touchstart mousedown', function() { game.keys['ArrowUp'] = true; });
    $('#up-btn').on('touchend mouseup', function() { game.keys['ArrowUp'] = false; });
    $('#down-btn').on('touchstart mousedown', function() { game.keys['ArrowDown'] = true; });
    $('#down-btn').on('touchend mouseup', function() { game.keys['ArrowDown'] = false; });
    $('#left-btn').on('touchstart mousedown', function() { game.keys['ArrowLeft'] = true; });
    $('#left-btn').on('touchend mouseup', function() { game.keys['ArrowLeft'] = false; });
    $('#right-btn').on('touchstart mousedown', function() { game.keys['ArrowRight'] = true; });
    $('#right-btn').on('touchend mouseup', function() { game.keys['ArrowRight'] = false; });

});
