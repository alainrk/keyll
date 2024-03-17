<script lang="ts">
	import P5, { type Sketch } from 'p5-svelte';

	let game: Game;
	let gameCanvasParent: HTMLDivElement;

	const CHARSET_LOWERCASE = `abcdefghijklmnopqrstuvwxyz`;
	const CHARSET_UPPERCASE = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
	const CHARSET_NUMBERS = `0123456789`;
	const CHARSET_SPECIAL = `!@#$%^&*()_+~-=\`{}[]|:;'"<>,.?/\\`;

	const CHARSET = new Set(
		`${CHARSET_LOWERCASE}${CHARSET_UPPERCASE}${CHARSET_NUMBERS}${CHARSET_SPECIAL}`.split('')
	);

	type CharsQueueItem = {
		char: string;
		hit: boolean;
		upcoming: boolean;
		current: boolean;
	};

	type P5Color = [number, number, number, number?];
	type TextChunk = [string, P5Color];

	// CharsQueue just stores a fixed amount of typed characters
	class CharsQueue {
		queue: Array<CharsQueueItem>;
		maxLength: number;

		constructor(maxLength = 10) {
			this.queue = [];
			this.maxLength = maxLength;
		}

		updateCurrent(hit: boolean) {
			if (this.queue.length > 0) {
				this.queue[this.queue.length - 1].hit = hit;
			}
		}

		addChar(char: string, hit: boolean, upcoming = false): CharsQueueItem | undefined {
			let popped;

			if (this.queue.length > 0) {
				this.queue[this.queue.length - 1].current = false;
			}

			this.queue.push({
				char,
				hit,
				upcoming,
				current: true
			});

			if (this.queue.length > this.maxLength) {
				popped = this.queue.shift();
			}

			return popped;
		}

		getString() {
			return this.queue.map((char) => char.char).join('');
		}

		getLastChar() {
			return this.queue[this.queue.length - 1];
		}
	}

	class Game {
		hitCount: number = 0;
		totCount: number = 0;
		missedChar: boolean = false;
		enableLowerCase: boolean = true;
		enableUpperCase: boolean = false;
		enableNumbers: boolean = false;
		enableSpecial: boolean = false;
		availableChars: string;
		charset: Set<string>;
		typedCharsQueue: CharsQueue;
		promptedCharsQueue: CharsQueue;
		upcomingCharsQueue: CharsQueue;

		constructor() {
			// TODO: Add a proper options object param
			this.availableChars = this.createAvailableChars();
			this.charset = new Set(this.availableChars.split(''));
			this.typedCharsQueue = new CharsQueue(45);
			this.promptedCharsQueue = new CharsQueue(11);
			this.upcomingCharsQueue = new CharsQueue(10);

			// Preallocate upcoming chars
			for (let i = 0; i < 10; i++) {
				this.upcomingCharsQueue.addChar(this.getRandomCharFromCharSet(), false, true);
			}
			this.updateChar();
		}

		get currentChar() {
			return this.promptedCharsQueue.getLastChar().char;
		}

		get currentCharIsHit() {
			return this.promptedCharsQueue.getLastChar().hit;
		}

		updateChar() {
			const popped = this.upcomingCharsQueue.addChar(this.getRandomCharFromCharSet(), false, true);
			if (popped) {
				this.promptedCharsQueue.addChar(popped.char, true);
				this.totCount++;
			}
		}

		handleTypedChar(char: string) {
			if (char === game.currentChar) {
				if (this.currentCharIsHit) {
					this.hitCount++;
				}
				this.missedChar = false;
				this.updateChar();
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
			let availableChars = '';
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

	const sketch: Sketch = (p5) => {
		p5.setup = () => {
			const canvas = p5.createCanvas(gameCanvasParent.clientWidth, p5.windowHeight / 2);
			console.log(
				`Created canvas with size: ${canvas.width}x${canvas.height} in element ${gameCanvasParent.id}.`
			);

			p5.noStroke();
			p5.background(0);
			p5.textFont('Courier New');
			// Reduce framerate
			p5.frameRate(10);
			game = new Game();
		};

		p5.draw = () => {
			let textChunks: Array<TextChunk> = [];

			const drawMulticolorText = (
				x: number,
				y: number,
				textChunks: Array<TextChunk>,
				align: string = p5.LEFT
			) => {
				if (align === p5.RIGHT) {
					textChunks = textChunks.slice().reverse();
				}
				var posx = x;
				for (let i = 0; i < textChunks.length; ++i) {
					const chunk = textChunks[i];
					const t = chunk[0];
					const color = chunk[1];
					const w = p5.textWidth(t);
					p5.fill(...color);
					p5.text(t, posx, y);
					if (align === p5.LEFT) {
						posx += w;
					} else {
						posx -= w;
					}
				}
			};

			// Clear the screen
			p5.background(0);

			// Write the hitCount at the top left
			p5.fill(255);
			p5.textSize(25);
			p5.text(`Score: ${game.hitCount}/${game.totCount}`, 20, 40);

			// Write the already typed chars
			p5.textSize(50);
			textChunks = [];
			for (const chunk of game.promptedCharsQueue.queue) {
				// Skip the current
				if (chunk.current) {
					continue;
				}
				const color: P5Color = chunk.hit ? [0, 200, 0, 100] : [200, 0, 0, 100];
				textChunks.push([chunk.char, color]);
			}
			drawMulticolorText(p5.width / 2 - 65, p5.height / 2 + 20, textChunks, p5.RIGHT);

			// Write the current char in the middle
			if (game.missedChar) {
				p5.fill(255, 0, 0);
			} else {
				p5.fill(255, 255, 255);
			}

			p5.textSize(100);
			p5.textStyle(p5.BOLD);
			p5.text(
				game.currentChar,
				p5.width / 2 - p5.textWidth(game.currentChar) / 2,
				p5.height / 2 + p5.textWidth(game.currentChar) / 3
			);
			p5.textStyle(p5.NORMAL);

			// Write the upcoming chars
			p5.textSize(50);
			textChunks = [];
			for (const chunk of game.upcomingCharsQueue.queue) {
				const color: P5Color = chunk.hit ? [250, 250, 250, 100] : [250, 250, 250, 100];
				textChunks.push([chunk.char, color]);
			}
			drawMulticolorText(p5.width / 2 + 35, p5.height / 2 + 20, textChunks);

			// Write the typedCharsQueue at the bottom
			p5.textSize(25);
			textChunks = [];
			for (const chunk of game.typedCharsQueue.queue) {
				const color: P5Color = chunk.hit ? [0, 200, 0] : [200, 0, 0];
				textChunks.push([chunk.char, color]);
			}
			drawMulticolorText(20, p5.height - 20, textChunks);
		};

		p5.keyPressed = () => {
			game.handleTypedChar(p5.key);
		};
	};
</script>

<div id="game-canvas-parent" bind:this={gameCanvasParent}>
	Hello world
	<P5 {sketch} />
</div>
