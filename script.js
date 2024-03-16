let rectWidth;
let game;

// const CHARSET_LOWERCASE = `abc`;
const CHARSET_LOWERCASE = `abcdefghijklmnopqrstuvwxyz`;
const CHARSET_UPPERCASE = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
const CHARSET_NUMBERS = `0123456789`;
const CHARSET_SPECIAL = `!@#$%^&*()_+~-=\`{}[]|:;'"<>,.?/\\`;

const CHARSET = new Set(
  `${CHARSET_LOWERCASE}${CHARSET_UPPERCASE}${CHARSET_NUMBERS}${CHARSET_SPECIAL}`.split(
    ""
  )
);

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

  addChar(char, hit, upcoming = false) {
    let popped;

    if (this.queue.length > 0) {
      this.queue[this.queue.length - 1].current = false;
    }

    this.queue.push({
      char,
      hit,
      upcoming,
      current: true,
    });

    if (this.queue.length > this.maxLength) {
      popped = this.queue.shift();
    }

    return popped;
  }

  getString() {
    return this.queue.map((char) => char.char).join("");
  }

  getLastChar() {
    return this.queue[this.queue.length - 1];
  }
}

class Game {
  constructor() {
    // TODO: Add a proper options object param
    this.hitCount = 0;
    this.totCount = 0;
    this.timeout = 5;
    this.missedChar = false;
    this.expire = 0;
    this.enableLowerCase = true;
    this.enableUpperCase = false;
    this.enableNumbers = false;
    this.enableSpecial = false;
    this.availableChars = this.createAvailableChars();
    this.charset = new Set(this.availableChars.split(""));
    this.typedCharsQueue = new CharsQueue(45);
    this.promptedCharsQueue = new CharsQueue(11);
    this.upcomingCharsQueue = new CharsQueue(10);

    // Preallocate upcoming chars
    for (let i = 0; i < 10; i++) {
      this.upcomingCharsQueue.addChar(
        this.getRandomCharFromCharSet(),
        false,
        true
      );
    }
    this.updateChar();
    this.resetTimeout();
  }

  get currentChar() {
    return this.promptedCharsQueue.getLastChar().char;
  }

  get currentCharIsHit() {
    return this.promptedCharsQueue.getLastChar().hit;
  }

  updateChar() {
    const popped = this.upcomingCharsQueue.addChar(
      this.getRandomCharFromCharSet(),
      false,
      true
    );
    this.promptedCharsQueue.addChar(popped.char, true);
    this.totCount++;
  }

  resetTimeout() {
    this.expire = Date.now() + this.timeout * 1000;
  }

  handleTypedChar(char) {
    if (key === game.currentChar) {
      if (this.currentCharIsHit) {
        this.hitCount++;
      }
      this.missedChar = false;
      this.updateChar();
      this.resetTimeout();
      this.typedCharsQueue.addChar(char, true);
      this.promptedCharsQueue.updateCurrent(true);
      return;
    }

    this.missedChar = true;
    this.promptedCharsQueue.updateCurrent(false);

    // TODO: Maybe just limiting this to the entire possible charset?
    // Skip printing chars not in the charset
    if (!CHARSET.has(char)) {
      return;
    }

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
    return this.availableChars[
      Math.floor(Math.random() * this.availableChars.length)
    ];
  }
}

// Draw text with different width / 2lors
function drawMulticolorText(x, y, textChunks, align = LEFT) {
  if (align === RIGHT) {
    textChunks = textChunks.slice().reverse();
  }
  var posx = x;
  for (let i = 0; i < textChunks.length; ++i) {
    const chunk = textChunks[i];
    const t = chunk[0];
    const color = chunk[1];
    const w = textWidth(t);
    fill(color);
    text(t, posx, y);
    if (align === LEFT) {
      posx += w;
    } else {
      posx -= w;
    }
  }
}

function startGame() {
  game = new Game();
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
  textFont("Courier New");
  // Reduce framerate
  frameRate(10);
  rectWidth = width / 4;
  game = new Game();
}

function draw() {
  let textChunks = [];

  // Clear the screen
  background(0);

  // Write the hitCount at the top left
  fill(255);
  textSize(25);
  text(`Score: ${game.hitCount}/${game.totCount}`, 20, 40);

  // Write the already typed chars
  textSize(50);
  textChunks = [];
  for (const chunk of game.promptedCharsQueue.queue) {
    // Skip the current
    if (chunk.current) {
      continue;
    }
    const color = chunk.hit ? [0, 200, 0, 100] : [200, 0, 0, 100];
    textChunks.push([chunk.char, color]);
  }
  drawMulticolorText(width / 2 - 65, height / 2 + 20, textChunks, RIGHT);

  // Write the current char in the middle
  if (game.missedChar) {
    fill(255, 0, 0);
  } else {
    fill(255, 255, 255);
  }

  textSize(100);
  textStyle(BOLD);
  text(
    game.currentChar,
    width / 2 - textWidth(game.currentChar) / 2,
    height / 2 + textWidth(game.currentChar) / 3
  );
  textStyle(NORMAL);

  // Write the upcoming chars
  textSize(50);
  textChunks = [];
  for (const chunk of game.upcomingCharsQueue.queue) {
    const color = chunk.hit ? [250, 250, 250, 100] : [250, 250, 250, 100];
    textChunks.push([chunk.char, color]);
  }
  drawMulticolorText(width / 2 + 35, height / 2 + 20, textChunks);

  // Write the typedCharsQueue at the bottom
  textSize(25);
  textChunks = [];
  for (const chunk of game.typedCharsQueue.queue) {
    const color = chunk.hit ? [0, 200, 0] : [200, 0, 0];
    textChunks.push([chunk.char, color]);
  }
  text(20, height - 20, textChunks);
  drawMulticolorText(20, height - 20, textChunks);
}

function keyPressed() {
  console.log(keyCode, key);
  game.handleTypedChar(key);
}
