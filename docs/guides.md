# Guides

## Migration from Blessed

This library wraps blessed to provide a simpler API while maintaining full access to blessed internals.

### Before (blessed directly)

```typescript
const blessed = require('blessed');
const screen = blessed.screen();
const box = blessed.box({...});
```

### After (@flowterm/term)

```typescript
import { createTerminal } from '@flowterm/term';

const term = createTerminal();
// Use term.screen for raw blessed access
```

## Combining with Existing blessed Code

You can use blessed elements alongside this library:

```typescript
import { createTerminal, createSplitLayout } from '@flowterm/term';

const term = createTerminal();
const split = createSplitLayout(term.screen);

// Add custom blessed element alongside split
const customBox = require('blessed').box({
    parent: term.screen,
    top: '50%',
    left: '50%',
    width: 10,
    height: 5
});
```

## Multi-Agent Setup

For AI agents running multiple subagents:

```typescript
import { createTerminal, createPageContainer } from '@flowterm/term';

const term = createTerminal();
const pages = term.pages;

function spawnAgent(name: string, command: string) {
    pages.createPage(name);
    
    term.inline.spawn({
        command,
        name,
        env: { AGENT_NAME: name }
    });
}

// Create a page per agent
spawnAgent('agent-1', 'node agent.js');
spawnAgent('agent-2', 'python agent.py');

// Switch between agents with C-n/C-p
term.screen.key(['C-n'], () => {
    const all = pages.listPages();
    const current = pages.getCurrentPage();
    const idx = all.indexOf(current.name);
    pages.showPage(all[(idx + 1) % all.length]);
});
```

## Error Handling

```typescript
import { createTerminal } from '@flowterm/term';

const term = createTerminal();

term.inline.on('exit', ({ sectionId, exitCode }) => {
    if (exitCode !== 0) {
        console.error(`Process ${sectionId} failed: ${exitCode}`);
    }
});

// Handle Ctrl+C gracefully
term.screen.key(['C-c'], () => {
    term.destroy();
    process.exit(0);
});
```

## Color Themes

```typescript
const term = createTerminal({
    titleFg: 'cyan',
    borderFg: 'cyan'
});

// Or customize per-component
term.inline.spawn({
    command: 'build',
    name: 'build'
});
```

Available colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `redBright`, `greenBright`, etc.