let Bg_Img;
let nodeImages = [];
let nodeHoverImages = [];
let nodeGraphics = [];
let currentHoveredNode = -1;
const stageCount = 7; // Change the number of stages
const stages = [];
const nodeRadius = 65;
let marginX;
let score = 350;

let returnButtonImage;
let returnButtonSize = 80;
let returnButtonX = 20;
let returnButtonY = 20;

let firstNodeSound;
let lockedNodeSound;
let homeButtonSound;
let lighton;
let suddenAppearance;
let clickSecret; 
let correctCodeSound;
let incorrectCodeSound;
let lightGlitch;

let codeEntryCounter;
let CodeCheckc = false;

let backgroundMusic;

// Array to store links for each node
const nodeLinks = [
  'https://magicarchie.github.io/Stage_1/',
  'https://magicarchie.github.io/Stage_2/',
  'https://magicarchie.github.io/Stage_3/',
  'https://magicarchie.github.io/Stage_4/',
  'https://magicarchie.github.io/Stage_5/',
  'https://magicarchie.github.io/Stage_6/',
  'https://magicarchie.github.io/Stage_7/'
];

let secretButton;
let secretButtonSize = nodeRadius * 2;
let secretButtonX;
let secretButtonY;

let input;
let isEnteringCode = false;

function preload() {
  //loadFont('Granesta.otf');
  loadImage('materials/images/Stg_Secret.png');
  loadImage('materials/images/Stg_Secret2.png');

  firstNodeSound = loadSound('materials/sounds/notification.mp3');
  lockedNodeSound = loadSound('materials/sounds/chain.mp3');
  homeButtonSound = loadSound('materials/sounds/interface.mp3');
  suddenAppearance = loadSound('materials/sounds/sudden-appearance.mp3');
  clickSecret = loadSound('materials/sounds/click.mp3');
  correctCodeSound = loadSound('materials/sounds/correct.mp3');
  incorrectCodeSound = loadSound('materials/sounds/wrong.mp3');
  lightGlitch = loadSound('materials/sounds/lightGlitch.wav');
  backgroundMusic = loadSound('materials/sounds/Mid-Page 1.2.mp3');

  for (let i = 0; i < stageCount; i++) {
    const imagePath = `materials/images/Stg_${i + 1}H.png`;
    try {
      nodeImages.push(loadImage(imagePath));
      nodeHoverImages.push(loadImage(imagePath));
      console.log(`Image loaded successfully: ${imagePath}`);
    } catch (error) {
      console.error(`Error loading image: ${imagePath}`);
      console.error(error);
    }
  }

  try {
    returnButtonImage = loadImage('materials/images/Rt_Button.png');
    console.log('Return button image loaded successfully');
  } catch (error) {
    console.error('Error loading return button image');
    console.error(error);
  }

  try {
    secretButton = createImg('materials/images/Stg_Secret_Lc.png', 'Secret Button');
    secretButton.size(secretButtonSize, secretButtonSize);
    console.log('Secret button loaded successfully');
  } catch (error) {
    console.error('Error loading secret button');
    console.error(error);
  }

  try {
    Bg_Img = loadImage('materials/images/Background_Md.jpg');
    console.log('Background image loaded successfully');
  } catch (error) {
    console.error('Error loading background image');
    console.error(error);
  }
}

function setup() {
  createCanvas(1400, 800);
  textSize(24);
  textAlign(CENTER, CENTER);
  marginX = width / (stageCount + 1);
  
  suddenAppearance.setVolume(0.09);
  suddenAppearance.play();
  
  backgroundMusic.loop();
  backgroundMusic.setVolume(0.7);

  // Initialize stages with adjusted random heights
  for (let i = 0; i < stageCount; i++) {
    let nodeGraphic = createGraphics(nodeRadius * 2, nodeRadius * 2);
    nodeGraphic.image(nodeImages[i], 0, 0, nodeRadius * 2, nodeRadius * 2);
    nodeGraphics.push(nodeGraphic);

    stages.push({
      label: i + 1,
      link: nodeLinks[i],
      y: random(height * 0.4, height * 0.8),
      x: marginX * (i + 1),
      interactive: true
    });
  }

  // Position the secret button
  secretButtonX = random(secretButtonSize, width - secretButtonSize);
  secretButtonY = random(secretButtonSize, height - secretButtonSize);

  // Create the input field
  input = createInput();
  input.size(80, 30);

  // Center the input field horizontally
  const inputX = (width - input.width) / 2;
  input.position(inputX, height - 40);

  // Center the text inside the input field
  input.style('text-align', 'center');

  input.hide(); // Hide the input initially

  noLoop();
}

function drawSkillTree() {
  // Draw skill tree nodes and connections
  for (let i = 0; i < stages.length - 1; i++) {
    const x = stages[i].x;
    const y = stages[i].y;

    const isMouseOver = dist(mouseX, mouseY, x, y) < nodeRadius;

    // Change the appearance based on mouse hover and interactivity
    if (isMouseOver && stages[i].interactive) {
      currentHoveredNode = i;
      image(nodeGraphics[i], x - nodeRadius, y - nodeRadius);
    } else {
      currentHoveredNode = -1;
      image(nodeGraphics[i], x - nodeRadius, y - nodeRadius);
    }

    const nextX = stages[i + 1].x;
    const nextY = stages[i + 1].y;

    if (i <= 5) {
      // Make the first line a different color
      stroke(255); // White color
    } else {
      stroke(0); // Black color for all other lines
    }

    const lineStartX = x + nodeRadius * cos(atan2(nextY - y, nextX - x));
    const lineStartY = y + nodeRadius * sin(atan2(nextY - y, nextX - x));
    const lineEndX = nextX - nodeRadius * cos(atan2(nextY - y, nextX - x));
    const lineEndY = nextY - nodeRadius * sin(atan2(nextY - y, nextX - x));

    strokeWeight(5);
    line(lineStartX, lineStartY, lineEndX, lineEndY);
    strokeWeight(1);
  }

  // Draw the last node
  const lastNode = stages[stages.length - 1];
  const lastX = lastNode.x;
  const lastY = lastNode.y;
  image(nodeGraphics[stages.length - 1], lastX - nodeRadius, lastY - nodeRadius);
}

function draw() {
  // Draw background
  background(Bg_Img);

  // Draw return button
  image(returnButtonImage, returnButtonX, returnButtonY, returnButtonSize, returnButtonSize);

  // Draw a rectangle behind the score text
  fill(255, 150);
  strokeWeight(3);
  rectMode(CENTER);
  rect(width / 2, 60, 300, 70, 130);

  // Draw score text
  fill(0);
  textSize(35);
  textStyle(BOLD);
  text(`Score: ${score}`, width / 2, 60);

  // Draw the skill tree
  drawSkillTree();

  // Attempt to place the secret button without overlap
  placeSecretButton();

  // Check if the secret button is clicked
  const distanceToSecretButton = dist(mouseX, mouseY, secretButtonX + secretButtonSize / 2, secretButtonY + secretButtonSize / 2);

  if (isEnteringCode) {
    // Draw the "Code" label above the input window when the code window is open
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('Code', input.x + input.width / 2, input.y - 50);
  }

  if (distanceToSecretButton < secretButtonSize / 2) {
    // Show the input field
    input.show();
    isEnteringCode = true;
    clickSecret.play();
  } else {
    // Hide the input field and "Code" text if not clicking the secret button
    input.hide();
    isEnteringCode = false;
  }
}

function placeSecretButton() {
  let isOverlapping = true;

  while (isOverlapping) {
    isOverlapping = false;

    // Move the secret button to a new random position
    secretButtonX = random(secretButtonSize + 50, width - secretButtonSize - 50);
    secretButtonY = random(secretButtonSize + 50, height - secretButtonSize - 50);

    // Check for collisions with nodes
    for (let i = 0; i < stages.length; i++) {
      const x = stages[i].x;
      const y = stages[i].y;
      const distance = dist(secretButtonX, secretButtonY, x, y);

      // Ensure a larger minimum distance to avoid touching nodes
      if (distance < nodeRadius + secretButtonSize / 2 + 100) {
        isOverlapping = true;
        break; // Break out of the loop if overlap is found
      }
    }

    // Check for collisions with the return button
    const returnButtonDistance = dist(secretButtonX, secretButtonY, returnButtonX + returnButtonSize / 2, returnButtonY + returnButtonSize / 2);
    if (returnButtonDistance < returnButtonSize / 2 + secretButtonSize / 2 + 50) {
      isOverlapping = true;
    }

    // Check the distance from the secret button to each node and ensure it's not too close
    for (let i = 0; i < stages.length; i++) {
      const x = stages[i].x;
      const y = stages[i].y;
      const distanceToNode = dist(secretButtonX, secretButtonY, x, y);

      // Ensure a larger minimum distance to avoid touching nodes
      if (distanceToNode < nodeRadius + secretButtonSize / 2 + 100) {
        isOverlapping = true;
        break;
      }
    }
  }

  // Draw the secret button at the final position
  secretButton.position(secretButtonX, secretButtonY);
}

function mouseClicked() {
  if (
    mouseX > returnButtonX &&
    mouseX < returnButtonX + returnButtonSize &&
    mouseY > returnButtonY &&
    mouseY < returnButtonY + returnButtonSize
  ) {
    homeButtonSound.play();

    setTimeout(function () {
      window.location.href = 'https://magicarchie.github.io/Art-Puzzles/';
    }, 500);
  } else {
    if (CodeCheckc == false) {
      // Check if the secret button is clicked
      const distanceToSecretButton = dist(mouseX, mouseY, secretButtonX + secretButtonSize / 2, secretButtonY + secretButtonSize / 2);
      if (distanceToSecretButton < secretButtonSize / 2) {
        // Show the input field
        input.show();
        isEnteringCode = true;
        clickSecret.setVolume(0.1);
        clickSecret.play();
      } else {
        // Check if the click is outside the input field
        const isClickOutsideInput = mouseX < input.x || mouseX > input.x + input.width || mouseY < input.y || mouseY > input.y + input.height;

        // Hide the input field if not clicking the secret button and outside the input field
        if (isClickOutsideInput) {
          input.hide();
          isEnteringCode = false;
        }
      }
    } else {
      // Check if the secret button is clicked after the correct code is entered
      const distanceToSecretButton = dist(mouseX, mouseY, secretButtonX + secretButtonSize / 2, secretButtonY + secretButtonSize / 2);
      if (distanceToSecretButton < secretButtonSize / 2) {
        lightGlitch.play();

        setTimeout(function () {
          secretButton.elt.src = 'materials/images/Stg_Secret2.png';
        }, 50);
        setTimeout(function () {
          secretButton.elt.src = 'materials/images/Stg_Secret.png';
        }, 200);
        setTimeout(function () {
          secretButton.elt.src = 'materials/images/Stg_Secret2.png';
        }, 350);
        setTimeout(function () {
          secretButton.elt.src = 'materials/images/Stg_Secret.png';
        }, 500);
        setTimeout(function () {
          secretButton.elt.src = 'materials/images/Stg_Secret2.png';
        }, 700);
        setTimeout(function () {
          secretButton.elt.src = 'materials/images/Stg_Secret.png';
        }, 800);

        setTimeout(function () {
          window.location.href = 'https://example.com/another-page';
        }, 1100);
      }
    }

    // Check if any skill node is clicked
    for (let i = 0; i < stages.length; i++) {
      const x = stages[i].x;
      const y = stages[i].y;
      const distance = dist(mouseX, mouseY, x, y);

      if (distance < nodeRadius && stages[i].interactive) {
        console.log(`Clicked Node ${i + 1}: ${stages[i].link}`);

        if (i < 7) {
          firstNodeSound.setVolume(0.1);
          firstNodeSound.play();
        }

        setTimeout(function () {
          window.location.href = stages[i].link;
        }, 1100);
      }
    }
  }
}

function keyPressed() {
  // Check if the Enter key is pressed
  if (isEnteringCode && keyCode === ENTER) {
    const event = arguments[0] || window.event;
    if (event) {
      event.preventDefault();
    }

    if (input.value() === '7259') {
      console.log('Code is correct!');
      correctCodeEntered = true;
      codeEntryCounter++;

      secretButton.elt.src = 'materials/images/Stg_Secret.png';
      CodeCheckc = true;

      correctCodeSound.setVolume(0.1);
      correctCodeSound.play();

      if (codeEntryCounter === 1) {
        console.log('First time the correct code is entered!');
      } else {
        console.log(`Correct code entered ${codeEntryCounter} times!`);
      }
    } else {
      console.log('Code is incorrect!');

      incorrectCodeSound.setVolume(0.06);
      incorrectCodeSound.play();
    }

    input.hide();
    isEnteringCode = false;
    input.value('');
  }
  
  // Check for the "`" key
  if (key === '`') {
    console.log("Backtick key pressed!");

    // Ask the user for a code
    const userCode = prompt("Enter a code:");

    // Check the entered code and redirect the user
    if (userCode === "+Stg-1") {
      console.log("Code +Stg-1 entered. Redirecting to StageSelection 1");
      window.location.href = "https://magicarchie.github.io/Stage_Selection_1/";
    } else if (userCode === "+Stg-2") {
      console.log("Code +Stg-2 entered. Redirecting to StageSelection 2");
      window.location.href = "https://magicarchie.github.io/Stage_Selection_2/";
    } else if (userCode === "+Stg-3") {
      console.log("Code +Stg-3 entered. Redirecting to StageSelection 3");
      window.location.href = "https://magicarchie.github.io/Stage_Selection_3/";
    } else if (userCode === "+Stg-4") {
      console.log("Code +Stg-4 entered. Redirecting to StageSelection 4");
      window.location.href = "https://magicarchie.github.io/Stage_Selection_4/";
    } else if (userCode === "+Stg-5") {
      console.log("Code +Stg-5 entered. Redirecting to StageSelection 5");
      window.location.href = "https://magicarchie.github.io/Stage_Selection_5/";
    } else if (userCode === "+Stg-6") {
      console.log("Code +Stg-6 entered. Redirecting to StageSelection 6");
      window.location.href = "https://magicarchie.github.io/Stage_Selection_6/";
    } else if (userCode === "+Stg-7") {
      console.log("Code +Stg-7 entered. Redirecting to StageSelection 7");
      window.location.href = "https://magicarchie.github.io/Stage_Selection_7/";
    } else if (userCode === "+Stg-S") {
      console.log("Code +Stg-S entered. Redirecting to StageSelection S");
      window.location.href = "https://magicarchie.github.io/Stage_Selection_Secret/";
    } else {
      console.log("Invalid code. No redirection.");
    }
  }
}

// Function to toggle interactivity of nodes
function toggleNodeInteractivity(nodeIndex, interactive) {
  if (nodeIndex >= 0 && nodeIndex < stages.length) {
    stages[nodeIndex].interactive = interactive;
  }
}

// Activate all nodes
for (let i = 0; i < stages.length; i++) {
  toggleNodeInteractivity(i, true);
}

