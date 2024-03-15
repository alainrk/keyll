let rectWidth;
let game;

const CHARSET_LOWERCASE = `abcdefghijklmnopqrstuvwxyz`;
const CHARSET_UPPERCASE = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
const CHARSET_NUMBERS = `0123456789`;
const CHARSET_SPECIAL = `!@#$%^&*()_+~-=\`{}[]|:;'"<>,.?/\\`;

// CharsQueue just stores a fixed amount of typed characters
class CharsQueue {
  constructor(maxLength = 10) {
    this.queue = [];
    this.maxLength = maxLength;
  }

  updateCurrent(hit) {
    if (this.queue.length > 0) {
      this.queue[this.queue.length - 1].hit = hit;
    }
  }

  addChar(char, hit) {
    if (this.queue.length > 0) {
      this.queue[this.queue.length - 1].current = false;
    }

    this.queue.push({
      char,
      hit,
      current: true
    });

    if (this.queue.length > this.maxLength) {
      this.queue.shift();
    }

    console.log(this.queue.length, this.queue);
  }

  getString() {
    return this.queue.map((char) => char.char).join("");
  }

  getLastChar() {
    return this.queue[this.queue.length - 1].char;
  }
}

class Game {
  constructor() {
    // TODO: Add a proper options object param
    this.score = 0;
    this.timeout = 5;
    this.missedChar = false;
    this.expire = 0;
    this.enableLowerCase = true;
    this.enableUpperCase = false;
    this.enableNumbers = false;
    this.enableSpecial = false;
    this.availableChars = this.createAvailableChars();
    this.charset = new Set(this.availableChars.split(''));
    this.typedCharsQueue = new CharsQueue(45);
    this.promptedCharsQueue = new CharsQueue(10);

    this.updateChar();
    this.resetTimeout();
  }

  get currentChar() {
    return this.promptedCharsQueue.getLastChar();
  }

  updateChar() {
    this.promptedCharsQueue.addChar(this.getRandomCharFromCharSet(), false);
  }

  resetTimeout() {
    this.expire = Date.now() + this.timeout * 1000;
  }

  addTypedChar(char) {
    // TODO: Should we include the non-allowed chars for the session in the skip/print?
    if (!this.charset.has(char)) {
      return;
    }
    if (key === game.currentChar) {
      this.score++;
      this.missedChar = false;
      this.updateChar();
      this.resetTimeout();
      this.typedCharsQueue.addChar(char, true);
      return
    }

    this.missedChar = true;
    this.typedCharsQueue.addChar(char, false);
  }


  createAvailableChars() {
    let availableChars = "";
    if (this.enableLowerCase) {
      availableChars += CHARSET_LOWERCASE;
    }
    if (this.enableUpperCase) {
      availableChars += CHARSET_UPPERCASE;
    }
    if (this.enableNumbers) {
      availableChars += CHARSET_NUMBERS;
    }
    if (this.enableSpecial) {
      availableChars += CHARSET_SPECIAL;
    }
    return availableChars;
  }

  getRandomCharFromCharSet() {
    return this.availableChars[Math.floor(Math.random() * this.availableChars.length)];
  }
}

// Draw text with different colors
function drawMulticolorText(x, y, textChunks) {
  var posx = x;
  for (let i = 0; i < textChunks.length; ++ i) {
      const chunk = textChunks[i];
      const t = chunk[0];
      const color = chunk[1];
      const w = textWidth(t);
      fill(color);
      text(t, posx, y);
      posx += w;
  }
}


/*******************************************
 * P5 functions
 ******************************************/

function setup() {
  // Create the canvas under the class #game in the HTML
  const canvas = createCanvas(720, 400);
  canvas.parent("canvas-game");
  noStroke();
  background(0);
  // A mono is better
  textFont('Courier New');
  // Reduce framerate
  frameRate(10);
  rectWidth = width / 4;
  game = new Game();
}

function draw() {
  // Clear the screen
  background(0);

  // Write the score at the top left
  fill(255);
  textSize(32);
  text("Score: " + game.score, 20, 40);

  // Write a random letter to the screen
  if (game.missedChar) {
    fill(255, 0, 0);
  } else {
    fill(50, 50, 255);
  }

  textSize(100);

  // Write the letter in the middle of the rect
  textStyle(BOLD);
  text(game.currentChar, width / 2 - textWidth(game.currentChar) / 2, height / 2 + textWidth(game.currentChar) / 3);
  textStyle(NORMAL);

  // Write the typedCharsQueue at the bottom
  textSize(25);
  const textChunks = []
  for (const chunk of game.typedCharsQueue.queue) {
      const color = chunk.hit ? [0, 200, 0] : [200, 0, 0];
      textChunks.push([chunk.char, color]);
  }
  text(20, height - 20, textChunks);
  drawMulticolorText(20, height - 20, textChunks);
}

function keyPressed() {
  game.addTypedChar(key);
}

