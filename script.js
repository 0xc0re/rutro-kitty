
$(document).ready(function () {
    const $cat = $('#cat');
    let x = $('#game-container').width() / 2 - 32;
    let y = $('#game-container').height() / 2 - 32;
    let catSize = 64;
    let speed = 4;
    let keys = {};
    let score = 0; // Initialize the score

    // Time for bubbles to disappear (in milliseconds)
    const bubbleDisappearTime = 4000; // 4 seconds
    
    // Function to update the score display
    function updateScore() {
        $('#score-board').text('Score: ' + score);
    }

    // Function to generate a random color
    function randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    // Function to create bubbles
    function createBubble() {
        const $bubble = $('<div class="bubble"></div>');
        const direction = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // Random direction
        $bubble.data('direction', direction); // Store direction data in the bubble
        $bubble.css({
            left: Math.random() * ($('#game-container').width() - 32),
            top: Math.random() * ($('#game-container').height() - 32),
            backgroundColor: randomColor(),
            opacity: Math.random() * 0.5 + 0.5,
            width: 32,
            height: 32,
        });
        $('#game-container').append($bubble);

        // Generate a random time for the bubble to disappear (between 1 and 5 seconds)
        const randomDisappearTime = Math.random() * 10000 + 1000;

        // Make the bubble disappear after the random amount of time
        setTimeout(function () {
            $bubble.fadeOut(500, function () {
                $bubble.remove();
                createBubblesIfNeeded();
            });
        }, randomDisappearTime);
    }
    
    // Function to move and bounce bubbles
    function moveBubbles() {
        $('.bubble').each(function () {
            const $bubble = $(this);
            let direction = $bubble.data('direction');
            let x = $bubble.position().left + direction.x;
            let y = $bubble.position().top + direction.y;

            // Check for intersections with other bubbles
            $('.bubble').not($bubble).each(function () {
                const $otherBubble = $(this);
                const otherX = $otherBubble.position().left;
                const otherY = $otherBubble.position().top;
                const otherDirection = $otherBubble.data('direction');

                if (x < otherX + 32 && x + 32 > otherX && y < otherY + 32 && y + 32 > otherY) {
                    // Reverse directions if bubbles intersect
                    direction.x = -direction.x;
                    direction.y = -direction.y;
                    otherDirection.x = -otherDirection.x;
                    otherDirection.y = -otherDirection.y;
                    $bubble.data('direction', direction);
                    $otherBubble.data('direction', otherDirection);
                }
            });

            // Update bubble position
            $bubble.css({ left: x, top: y });
        });
    }


    // Function to get bubble creation interval based on score
     function getBubbleCreationInterval() {
        return Math.max(2000 - (score * 100), 500); // Decrease interval as score increases, with a minimum of 500ms
    }

    // Function to create bubbles if needed
    function createBubblesIfNeeded() {
        const maxBubbles = Math.min(20 + Math.floor(score / 20), 200); // Increase total bubbles based on score
        while ($('.bubble').length < maxBubbles) {
            createBubble();
        }
    }

    // Create initial bubbles
    setInterval(createBubblesIfNeeded, getBubbleCreationInterval());
    setInterval(moveBubbles, 16); // Move bubbles at 60 FPS

    // Set initial cat position and size
    $cat.css({ left: x, top: y, width: catSize, height: catSize });

    function growCat() {
        catSize += 2; // Increment cat size
        $cat.css({ width: catSize, height: catSize }); // Update cat size
        score++; // Increment the score
        updateScore(); // Update the score display
        createBubbleIfNeeded(); // Create new bubbles if needed
    }

    function fireLaser() {
        const $laser = $('<img src="laserz.png" class="laser">');
        $laser.css({
            left: x + catSize, // Starting position from the cat's right edge
            top: y + catSize / 2, // Centered vertically on the cat
            position: 'absolute',
        });
        $('#game-container').append($laser);

        // Animate the laser moving horizontally across the screen
        $laser.animate({ left: $('#game-container').width() }, 1000, function () {
            $laser.remove(); // Remove the laser when it's off-screen
        });
    }

    function updatePosition() {
        if (keys['ArrowUp']) y -= speed;
        if (keys['ArrowDown']) y += speed;
        if (keys['ArrowLeft']) x -= speed;
        if (keys['ArrowRight']) x += speed;

        x = Math.min(Math.max(x, 0), $('#game-container').width() - catSize);
        y = Math.min(Math.max(y, 0), $('#game-container').height() - catSize);

        $cat.css({ left: x, top: y });

        // Check for intersections with bubbles inside the updatePosition function
        $('.bubble').each(function () {
            const $bubble = $(this);
            const bubbleX = $bubble.position().left;
            const bubbleY = $bubble.position().top;

            // Check for intersection with cat or lasers
            if ((x < bubbleX + 32 && x + catSize > bubbleX && y < bubbleY + 32 && y + catSize > bubbleY) ||
                $('.laser').toArray().some(function (laser) {
                    const $laser = $(laser);
                    const laserX = $laser.position().left;
                    const laserY = $laser.position().top;
                    return laserX < bubbleX + 32 && laserX + $laser.width() > bubbleX && laserY < bubbleY + 32 && laserY + $laser.height() > bubbleY;
                })) {
                
                // Explosion animation sequence
                $bubble.animate({ width: 40, height: 40, opacity: 1 }, 100) // Expand slightly
                    .animate({ width: 0, height: 0, opacity: 0 }, 200, function () { // Shrink to zero
                        $bubble.remove(); // Remove bubble after animation
                        growCat(); // Grow the cat and increment the score
                    });
            }
        });
    }

    $(document).keydown(function (event) {
        keys[event.key] = true;

        if (event.key === ' ') {
            $cat.animate({ top: y - 64 }, 300, function () {
                $cat.animate({ top: y }, 300);
            });
        }

        if (event.ctrlKey) {
            fireLaser(); // Fire the laser when the CTRL key is pressed
        }
    });

    $(document).keyup(function (event) {
        keys[event.key] = false;
    });

    setInterval(updatePosition, 16); // Update position at 60 FPS

});
