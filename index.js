// Game state
let roundNumber = 1;
let score1 = 0;
let score2 = 0;
let rolling = false; // lock to prevent multiple rolls

// Initialize display
updateRoundDisplay();
updateScoreDisplay();

function rollDice() {
    // Prevent rolling while animation is running or game is over
    if (rolling) return;
    if (roundNumber > 5) return;
    rolling = true;

    var image1 = document.getElementById("dice1");
    var image2 = document.getElementById("dice2");

    // Add rolling animation class
    image1.classList.add("dice-rolling");
    image2.classList.add("dice-rolling");
    // disable roll button while rolling
    var rollBtn = document.querySelector('.btn');
    if (rollBtn) { rollBtn.disabled = true; rollBtn.style.opacity = '0.7'; }

    // Generate random dice numbers
    var randomNumber1 = Math.floor(Math.random()*6) + 1;
    var randomNumber2 = Math.floor(Math.random()*6) + 1;

    // Update dice images during animation (will show random faces while rolling)
    var rollInterval = setInterval(function() {
        var tempNum1 = Math.floor(Math.random()*6) + 1;
        var tempNum2 = Math.floor(Math.random()*6) + 1;
        image1.setAttribute("src", "images/dice" + tempNum1 + ".png");
        image2.setAttribute("src", "images/dice" + tempNum2 + ".png");
    }, 100);

    // After animation completes, set final dice values
    setTimeout(function() {
        clearInterval(rollInterval);
        
        // Set final dice images
        var randomImage1 = "images/dice" + randomNumber1 + ".png";
        var randomImage2 = "images/dice" + randomNumber2 + ".png";
        image1.setAttribute("src", randomImage1);
        image2.setAttribute("src", randomImage2);

        // Remove animation class
        image1.classList.remove("dice-rolling");
        image2.classList.remove("dice-rolling");

        document.getElementById("roll1").textContent = randomNumber1;
        document.getElementById("roll2").textContent = randomNumber2;
        var r1 = document.getElementById("roll1");
        var r2 = document.getElementById("roll2");
        if (r1) { r1.classList.remove("score-pulse"); void r1.offsetWidth; r1.classList.add("score-pulse"); }
        if (r2) { r2.classList.remove("score-pulse"); void r2.offsetWidth; r2.classList.add("score-pulse"); }

        // Update scores
        score1 += randomNumber1;
        score2 += randomNumber2;

        // Update score display
        updateScoreDisplay();

        var p1Cell = document.getElementById("p1r" + roundNumber);
        var p2Cell = document.getElementById("p2r" + roundNumber);
        if (p1Cell) p1Cell.textContent = randomNumber1;
        if (p2Cell) p2Cell.textContent = randomNumber2;
        updateScoreDisplay();

        // Removed: legacy append of per-round rows (now using fixed scoreboard cells)

        // Check if this was the 5th round
        if (roundNumber === 5) {
            var winnerText = "";
            var p1Card = document.querySelector(".player-card.player1");
            var p2Card = document.querySelector(".player-card.player2");
            if (score1 > score2) {
                winnerText = "Player 1 Wins!";
                if (p1Card && p2Card) { p1Card.classList.add("winner"); p2Card.classList.remove("winner"); }
            } else if (score2 > score1) {
                winnerText = "Player 2 Wins!";
                if (p1Card && p2Card) { p2Card.classList.add("winner"); p1Card.classList.remove("winner"); }
            } else {
                winnerText = "It's a Draw!";
                if (p1Card && p2Card) { p1Card.classList.remove("winner"); p2Card.classList.remove("winner"); }
            }
            var modal = document.getElementById("gameOverModal");
            var winnerEl = document.getElementById("gameOverWinner");
            if (winnerEl) winnerEl.textContent = winnerText;
            if (modal) modal.style.display = "flex";
            // celebration
            triggerConfetti();
            // keep roll disabled until player chooses Play Again
            if (rollBtn) { rollBtn.disabled = true; rollBtn.style.opacity = '0.6'; }
        } else {
            // Increment round only if not at round 5
            roundNumber++;
            updateRoundDisplay();
            updateRoundHighlight();
            // re-enable roll button after short cooldown
            setTimeout(function(){ rolling = false; if (rollBtn) { rollBtn.disabled = false; rollBtn.style.opacity = '1'; } }, 250);
        }
    }, 800);
}

function playAgain() {
    // Reset game state
    roundNumber = 1;
    score1 = 0;
    score2 = 0;
    
    // Reset dice images
    var image1 = document.getElementById("dice1");
    var image2 = document.getElementById("dice2");
    image1.setAttribute("src", "images/dice6.png");
    image2.setAttribute("src", "images/dice6.png");
    
    // Reset roll numbers
    document.getElementById("roll1").textContent = "-";
    document.getElementById("roll2").textContent = "-";
    
    // Reset displays
    updateRoundDisplay();
    updateScoreDisplay();
    updateRoundHighlight();
    
    // Reset title
    document.querySelector("h1").textContent = "Roll The Dice";
    var p1Card = document.querySelector(".player-card.player1");
    var p2Card = document.querySelector(".player-card.player2");
    if (p1Card && p2Card) { p1Card.classList.remove("winner"); p2Card.classList.remove("winner"); }
    
    // Reset Roll button
    var btn = document.querySelector(".btn");
    btn.disabled = false;
    btn.textContent = "Roll!";
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
    
    var modal = document.getElementById("gameOverModal");
    if (modal) modal.style.display = "none";

    // Do not remove the scoreboard rows; just reset their values

    // Reset scoreboard cells
    [1,2,3,4,5].forEach(function(r){
        var p1 = document.getElementById("p1r"+r);
        var p2 = document.getElementById("p2r"+r);
        if (p1) p1.textContent = "-";
        if (p2) p2.textContent = "-";
    });
    var p1TotalCell = document.getElementById("p1Total");
    var p2TotalCell = document.getElementById("p2Total");
    if (p1TotalCell) p1TotalCell.textContent = 0;
    if (p2TotalCell) p2TotalCell.textContent = 0;
}

function playAgainFromModal() {
    playAgain();
}

// Modal interactions: backdrop click closes; Enter triggers Play Again; Escape closes
(function setupModalInteractions(){
    var modal = document.getElementById("gameOverModal");
    var content = document.getElementById("modalGameOverContent");
    if (!modal) return;
    modal.addEventListener("click", function(e){
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
    document.addEventListener("keydown", function(e){
        if (!modal || modal.style.display !== "flex") return;
        if (e.key === "Enter") {
            playAgainFromModal();
        } else if (e.key === "Escape") {
            modal.style.display = "none";
        }
    });
})();

function updateRoundDisplay() {
    var roundLabel = document.getElementById("roundLabelText");
    
    if (roundNumber === 1) {
        roundLabel.textContent = "1st round";
    } else if (roundNumber === 2) {
        roundLabel.textContent = "2nd round";
    } else if (roundNumber === 3) {
        roundLabel.textContent = "3rd round";
    } else {
        roundLabel.textContent = roundNumber + "th round";
    }
}

function updateRoundHighlight() {
    [1,2,3,4,5].forEach(function(r){
        var h = document.getElementById("hdr"+r);
        var p1 = document.getElementById("p1r"+r);
        var p2 = document.getElementById("p2r"+r);
        if (h) h.classList.toggle("active-round", r === roundNumber);
        if (p1) p1.classList.toggle("active-round", r === roundNumber);
        if (p2) p2.classList.toggle("active-round", r === roundNumber);
    });
}

function updateScoreDisplay() {
    var p1TotalCell = document.getElementById("p1Total");
    var p2TotalCell = document.getElementById("p2Total");
    if (p1TotalCell) p1TotalCell.textContent = score1;
    if (p2TotalCell) p2TotalCell.textContent = score2;
}

// Keyboard shortcuts: Space or Enter to roll, Escape to close modal
document.addEventListener('keydown', function(e){
    if (e.code === 'Space' || e.key === ' ') {
        // prevent page scroll
        e.preventDefault();
        rollDice();
    } else if (e.key === 'Enter') {
        // if modal visible, trigger Play Again, otherwise roll
        var modal = document.getElementById('gameOverModal');
        if (modal && modal.style.display === 'flex') {
            playAgainFromModal();
        } else {
            rollDice();
        }
    } else if (e.key === 'Escape') {
        var modal = document.getElementById('gameOverModal');
        if (modal) modal.style.display = 'none';
    }
});

// Simple confetti (creates small divs with randomized animation)
function triggerConfetti() {
    var colors = ['#07f0c3','#93eaff','#ffd36a','#ff7fa3','#7de6ff'];
    var count = 40;
    for (var i=0;i<count;i++){
        (function(){
            var el = document.createElement('div');
            el.className = 'confetti-piece';
            el.style.background = colors[Math.floor(Math.random()*colors.length)];
            var startX = Math.random()*window.innerWidth;
            el.style.left = startX + 'px';
            el.style.top = (Math.random()*0.2*window.innerHeight) + 'px';
            el.style.opacity = '1';
            document.body.appendChild(el);
            var duration = 1600 + Math.random()*1200;
            var rotate = Math.random()*720;
            el.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: 'translateY('+(window.innerHeight*0.9 + (Math.random()*200))+'px) rotate('+rotate+'deg)', opacity: 0 }
            ], { duration: duration, easing: 'cubic-bezier(.22,.9,.39,1)' });
            setTimeout(function(){ if (el && el.parentNode) el.parentNode.removeChild(el); }, duration+200);
        })();
    }
}

function exitToStart() {
    window.location.href = "index.html";
}
