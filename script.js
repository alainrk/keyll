let rectWidth;
let game;

const CHARSET_LOWERCASE = `abcdefghijklmnopqrstuvwxyz`;
const CHARSET_UPPERCASE = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
const CHARSET_NUMBERS = `0123456789`;
const CHARSET_SPECIAL = `!@#$%^&*()_+~-=\`{}[]|:;'"<>,.?/\\`;

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
    this.charSet = this.createCharSet();

    this.updateChar();
    this.resetTimeout();
  }

  updateChar() {
    this.currentChar = this.getRandomCharFromCharSet();
  }

  resetTimeout() {
    this.expire = Date.now() + this.timeout * 1000;
  }

  hitChar() {
    this.score++;
    this.missedChar = false;
    this.updateChar();
    this.resetTimeout();
  }

  missChar() {
    this.missedChar = true;
  }

  createCharSet() {
    let charSet = "";
    if (this.enableLowerCase) {
      charSet += CHARSET_LOWERCASE;
    }
    if (this.enableUpperCase) {
      charSet += CHARSET_UPPERCASE;
    }
    if (this.enableNumbers) {
      charSet += CHARSET_NUMBERS;
    }
    if (this.enableSpecial) {
      charSet += CHARSET_SPECIAL;
    }
    return charSet;
  }

  getRandomCharFromCharSet() {
    return this.charSet[Math.floor(Math.random() * this.charSet.length)];
  }
}

/*******************************************
 * P5 functions
 ******************************************/

function setup() {
  createCanvas(720, 400);
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
    fill(150, 50, 255);
  }

  textSize(100);

  // Write the letter in the middle of the rect
  text(game.currentChar, width / 2, height / 2);
}

function keyPressed() {
  console.log("keyPressed", key, game.currentChar);
  if (key === game.currentChar) {
    // keyIndex = key.charCodeAt(0) - "a".charCodeAt(0);
    game.hitChar();
  } else {
    game.missChar();
  }
}
