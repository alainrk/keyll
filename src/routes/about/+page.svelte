<script>
	import demoGif from '$lib/images/demo.gif';
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<h1>About Keyll</h1>

	<p>
		Simple touch typing trainer developed using <a href="https://p5js.org/">p5</a>.
	</p>

	<img alt="Game demo GIF" src={demoGif} />

	<pre class="command-line">
# Install dependencies
npm i

# Start the server
npm run dev

# Or start and open the app in a new browser tab
npm run dev -- --open

# Build for production
npm run build

# Preview the production build
npm run preview
	</pre>
</div>
