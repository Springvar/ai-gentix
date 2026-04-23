# @flowterm/term

Advanced terminal layout management for Node.js AI CLI agents. Provides inline subprocess capture, page switching, and split layouts built on top of [blessed](https://github.com/chjj/blessed).

## Features

- **Inline Subprocess Capture**: Spawn PTY processes with output displayed inline in your terminal
- **Page Switching**: Multiple terminal pages with quick switching
- **Split Layouts**: Info section + terminal splitting (vertical/horizontal)
- **blessed Integration**: Full access to blessed underlying elements for custom layouts

## Installation

```bash
npm install @flowterm/term
```

## Quick Start

```typescript
import { createTerminal } from '@flowterm/term';

const terminal = createTerminal();

// Spawn a subprocess - output appears inline
const pty = terminal.inline.spawn({
    command: 'npm',
    args: ['run', 'build'],
    name: 'build-task'
});

// Create multiple pages
terminal.pages.createPage('logs', 'Initial log content...');
terminal.pages.showPage('logs');

// Use split layout
const split = createSplitLayout(terminal.screen, {
    direction: 'vertical',
    infoHeight: 10
});
split.setInfoContent('Agent context info here...');
split.setTerminalContent('Interactive terminal area');

terminal.focus();
```

## API

### `createTerminal(options?)`

Creates a full terminal manager with inline, pages, and screen.

```typescript
interface TerminalOptions {
    title?: string;        // Terminal title
    infoHeight?: number;   // Default info section height
    smartCSR?: boolean;    // Enable smart CSR
    titleFg?: string;    // Title foreground color
    borderFg?: string;   // Border color
}
```

Returns `TerminalManager`:
- `screen` - blessed Screen
- `inline` - InlineCapture instance
- `pages` - PageContainer instance
- `print(content)` - Print to line buffer
- `printLine(content)` - Print and flush line buffer
- `clear()` - Clear line buffer
- `focus()` - Focus screen
- `destroy()` - Clean up

### InlineCapture

Manages inline subprocess capture sections.

```typescript
const inline = createInlineCapture(screen);

// Spawn a subprocess
const pty = inline.spawn({
    command: 'npm',
    args: ['install'],
    name: 'Install task',
    env: { FORTE_COLOR: '1' },
    cwd: '/project'
});

// Control sections
inline.collapse('0');           // Collapse a section
inline.expand();                  // Expand all
inline.remove('0');              // Remove a section

// Events
inline.on('exit', ({ sectionId, exitCode }) => {
    console.log(`Process ${sectionId} exited with ${exitCode}`);
});
```

Options:
```typescript
interface InlineCaptureOptions {
    titleFg?: string;    // Title color
    borderFg?: string;  // Border color
    collapsed?: boolean;// Start collapsed
    maxLines?: number;  // Max output lines
}
```

### PageContainer

Multi-page terminal management.

```typescript
const pages = createPageContainer(screen);

// Create pages
pages.createPage('main', 'Initial content');
pages.createPage('logs');

// Switch pages
pages.showPage('logs');

// Query pages
pages.listPages();           // ['main', 'logs']
pages.getCurrentPage();     // Current page
pages.getPage('logs');     // Specific page

// Remove pages
pages.removePage('old-page');
```

### SplitLayout

Split screen into info + terminal sections.

```typescript
const split = createSplitLayout(screen, {
    direction: 'vertical',    // 'vertical' | 'horizontal'
    infoHeight: 10,          // Info section height (rows or %)
    titleFg: 'blue',
    borderFg: 'gray'
});

// Control
split.setInfoContent('Context info');
split.setTerminalContent('Terminal output');
split.focusInfo();
split.focusTerminal();
split.destroy();
```

## Examples

### AI Agent with Inline Tool Output

```typescript
import { createTerminal } from '@flowterm/term';

const term = createTerminal({ title: 'AI Terminal' });

term.screen.key(['C-t'], () => {
    term.pages.showPage('terminal');
});

term.screen.key(['C-l'], () => {
    term.pages.showPage('logs');
});

async function runAgent(prompt: string) {
    term.inline.spawn({
        command: 'ai-agent',
        args: ['execute', prompt],
        name: 'ai-agent'
    });
    
    term.inline.expand(); // Show all output
}
```

### Page Switcher UI

```typescript
import { createTerminal, createPageContainer } from '@flowterm/term';

const term = createTerminal();

// Create pages
term.pages.createPage('terminal', '');
term.pages.createPage('logs', '');

// Page switcher with keys
term.screen.key(['C-p'], () => {
    const current = term.pages.getCurrentPage();
    const pages = term.pages.listPages();
    const idx = pages.indexOf(current.name);
    const next = pages[(idx + 1) % pages.length];
    term.pages.showPage(next);
});

term.focus();
```

### Split View with Status

```typescript
import { createTerminal, createSplitLayout } from '@flowterm/term';

const term = createTerminal();
const split = createSplitLayout(term.screen, {
    direction: 'vertical',
    infoHeight: 15
});

setInterval(() => {
    split.setInfoContent(`
    Agent Status: Running
    Tasks: 3 completed
    Memory: 128MB
    `);
    term.screen.render();
}, 1000);

split.setTerminalContent('Interactive terminal...\n');
```

## Requirements

- Node.js 20+
- blessed (TTY-compatible environment)
- node-pty (for subprocess capture)

## License

MIT