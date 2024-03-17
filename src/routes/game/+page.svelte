<script lang="ts">
	import P5, { type Sketch } from 'p5-svelte';

	const sketch: Sketch = (p5) => {
		p5.setup = () => {
			p5.createCanvas(p5.windowWidth, p5.windowHeight);
		};
		p5.draw = () => {
			p5.ellipse(p5.width / 2, p5.height / 2, p5.width, p5.height);
		};
	};
</script>

<P5 {sketch} />
