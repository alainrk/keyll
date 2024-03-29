# [WIP] Keyll

Simple touch typing trainer written in [p5](https://p5js.org/).

Still a work in progress, but if you like it [try it out](https://alainrk.github.io/keyll/) or [contribute](https://github.com/alainrk/keyll/pulls).

<p align="center">
  <img src='src/lib/images/demo.gif' width='600'>
</p>

## Dev

```bash
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
```

## TODO

- [x] Add reload/reset.
- [x] Add some UI element for hit/missed chars.
- [x] Improve basic UI, center window, etc.
- [x] Implement basic score system.
- [ ] [In progress] Wrapping in SvelteKit to learn it.
- [ ] Add settings in UI and inject in game constructor.
- [ ] Better structure code and bundle it.
- [ ] Deploy on GitHub Pages.
- [ ] Implement timer.
- [ ] Implement stats system.
