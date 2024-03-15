let rectWidth;
let game;

const CHARSET_LOWERCASE = `abcdefghijklmnopqrstuvwxyz`;
const CHARSET_UPPERCASE = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
const CHARSET_NUMBERS = `0123456789`;
const CHARSET_SPECIAL = `!@#$%^&*()_+~-=\`{}[]|:;'"<>,.?/\\`;

// CharsQueue just stores a fixed amount of typed characters
class CharsQueue {
  constructor(maxLength = 70) {
    this.queue = [];
    this.maxLength = maxLength;
  }

  addChar(char, hit) {
    this.queue.push({
      char,
      hit
    });

    if (this.queue.length > this.maxLength) {
      this.queue.shift();
    }

    console.log(this.queue.length, this.queue);
  }

  getString() {
    return this.queue.map((char) => char.char).join("");
  }
}

class Game {
  constructor() {
    // TODO: Add a proper options object param
    this.score = 0;
    this.timeout = 5;
    this.currentChar = "";
    this.missedChar = false;
    this.expire = 0;
    this.enableLowerCase = true;
    this.enableUpperCase = false;
    this.enableNumbers = false;
    this.enableSpecial = false;
    this.availableChars = this.createAvailableChars();
    this.charset = new Set(this.availableChars.split(''));
    this.charsQueue = new CharsQueue();

    this.updateChar();
    this.resetTimeout();
  }

  updateChar() {
    this.currentChar = this.getRandomCharFromCharSet();
  }

  resetTimeout() {
    this.expire = Date.now() + this.timeout * 1000;
  }

  pushChar(char) {
    // TODO: Should we include the non-allowed chars for the session in the skip/print?
    if (!this.charset.has(char)) {
      return;
    }
    if (key === game.currentChar) {
      this.score++;
      this.missedChar = false;
      this.updateChar();
      this.resetTimeout();
      this.charsQueue.addChar(char, true);
      return
    }

    this.missedChar = true;
    this.charsQueue.addChar(char, false);
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

/*******************************************
 * P5 functions
 ******************************************/

function setup() {
  // Create the canvas under the class #game in the HTML
  const canvas = createCanvas(720, 400);
  canvas.parent("canvas-game");
  noStroke();
  background(0);
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
  text(game.currentChar, width / 2, height / 2);

  // Write the charsQueue at the bottom
  textSize(25);
  const textChunks = []
  for (const chunk of game.charsQueue.queue) {
      const color = chunk.hit ? [0, 200, 0] : [200, 0, 0];
      textChunks.push([chunk.char, color]);
  }
  text(20, height - 20, textChunks);
  drawMulticolorText(20, height - 20, textChunks);
}

function keyPressed() {
  game.pushChar(key);
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
