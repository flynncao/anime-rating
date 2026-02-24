# Bangumi Plugin Boilerplate

A modern userscript boilerplate for building extensions for Bangumi.tv (bgm.tv, chii.in, bangumi.tv).

## Project Overview

This is a template project for creating userscripts that extend Bangumi functionality. It uses modern ES6+ modules, Rollup for bundling, and follows a component-based architecture.

## Tech Stack

- **JavaScript**: ES6+ modules
- **Build Tool**: Rollup
- **Styling**: CSS with dark theme support
- **Package Manager**: npm

## Directory Structure

```
anime-rating/
├── src/
│   ├── components/layouts/    # UI component factories
│   │   ├── button.js         # Button component
│   │   ├── checkbox.js       # Checkbox component
│   │   └── badge.js          # Badge component (example)
│   ├── constants/            # Configuration constants
│   │   └── index.js         # Regex patterns, namespaces
│   ├── static/              # Static assets
│   │   ├── css/             # Stylesheets
│   │   ├── js/              # Third-party libraries
│   │   └── svg/             # Icon assets
│   ├── storage/             # LocalStorage utilities
│   │   └── index.js         # Storage wrapper
│   ├── utils/               # Utility functions
│   ├── data/                # Data files (mock data, etc.)
│   ├── main.js              # Entry point
│   └── metadata.json        # Userscript metadata
├── dist/                    # Built output (generated)
│   └── index.user.js        # Compiled userscript
├── rollup.config.js         # Rollup configuration
├── package.json            # Dependencies and scripts
└── PROJECT.md              # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Production build
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

### Development Workflow

1. Edit files in `src/`
2. Run `npm run dev` for auto-rebuild
3. Install `dist/index.user.js` as a userscript
4. Test on Bangumi.tv

## Component Pattern

All UI components follow a factory pattern:

```javascript
// src/components/layouts/myComponent.js
export function createMyComponent(
  { id, text, className, onClick, ... },
  userSettings = {}
) {
  // Create DOM element using VanillaJS
  const element = document.createElement('div')
  element.className = `bct-my-component ${className}`

  // Add functionality
  element.addEventListener('click', onClick)

  return element
}
```

### Usage in main.js:

```javascript
import { createMyComponent } from './components/layouts/myComponent'

// In your IIFE
const target = document.querySelector('.target-selector')
target.append(createMyComponent({
  text: 'Hello',
  className: 'my-class',
  onClick: () => console.log('Clicked')
}, userSettings))
```

## Styling Guidelines

- Use `bct-` prefix for all CSS classes
- Support dark theme with `[data-theme="dark"]` selectors
- Import CSS in `main.js` using:
  ```javascript
  import styles from './static/css/styles.css'
  injectStyles(styles)
  ```

### Example:

```css
.bct-my-component {
  color: #000;
}

[data-theme="dark"] .bct-my-component {
  color: #fff;
}
```

## Storage

Use the `Storage` utility for persistent settings:

```javascript
import Storage from './storage/index'

Storage.init({
  mySetting: false,
  anotherSetting: true
})

const value = Storage.get('mySetting')
Storage.set('mySetting', newValue)
```

## Page Matching

Use regex patterns to match Bangumi pages:

```javascript
import { BGM_SUBJECT_REGEX, BGM_EP_REGEX } from './constants'

if (BGM_SUBJECT_REGEX.test(location.href)) {
  // Code for subject pages
}
```

Available regex patterns:
- `BGM_SUBJECT_REGEX` - Matches subject pages (`/subject/\d+`)
- `BGM_EP_REGEX` - Matches episode pages (`/ep/\d+`)
- `BGM_GROUP_REGEX` - Matches group topic pages (`/group/topic/\d+`)

## Build Configuration

The Rollup config:
- **Input**: `src/main.js`
- **Output**: `dist/index.user.js`
- **Plugins**:
  - `rollup-plugin-userscript-metadata`: Injects metadata from `src/metadata.json`
  - `rollup-plugin-import-css`: Bundles CSS imports
  - `@rollup/plugin-strip`: Removes console.log in production builds

## Adding New Features

1. **Create Component**: Add to `src/components/layouts/`
2. **Add Styles**: Add to `src/static/css/styles.css`
3. **Import in main.js**: Import and initialize
4. **Test**: Build and test on Bangumi.tv

## Target Websites

- bgm.tv
- fast.bgm.tv
- chii.in
- bangumi.tv

## Current Features

- **Copy Title Button**: Copies anime titles to clipboard
- **Title Toggle**: Switch between Chinese and Japanese titles
- **Toast Notifications**: User feedback via butterup.js

## Best Practices

1. **VanillaJS Priority**: Prefer native DOM APIs over jQuery
   - Use `document.querySelector()` instead of `$()`
   - Use `element.addEventListener()` instead of `.on()`
   - Use `createElement()` instead of `$('<div>')`

2. **Component Structure**:
   - Export factory functions that return DOM elements
   - Accept configuration object as first parameter
   - Accept userSettings as second parameter for consistency

3. **CSS Organization**:
   - Group related styles together
   - Add dark theme variants immediately after light theme
   - Use descriptive class names with `bct-` prefix

4. **Code Style**:
   - Use ES6+ features (const, arrow functions, template literals)
   - Add meaningful console logs for debugging
   - Follow existing code patterns

## License

MIT
