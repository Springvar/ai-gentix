# API Reference

## Main Exports

### `createTerminal(options?)`

Main entry point - creates a complete terminal manager.

```typescript
import { createTerminal, type TerminalOptions, type TerminalManager } from '@flowterm/term';

const term = createTerminal({
    title: 'My Terminal',
    infoHeight: 15,
    smartCSR: true,
    titleFg: 'blue',
    borderFg: 'gray'
});
```

#### TerminalOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `'Terminal'` | Terminal window title |
| `infoHeight` | `number` | `10` | Default info section height |
| `smartCSR` | `boolean` | `true` | Enable smart cursor positioning |
| `titleFg` | `string` | `'blue'` | Title foreground color |
| `borderFg` | `string` | `'gray'` | Border color |

#### TerminalManager

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `screen` | `blessed.Screen` | blessed screen instance |
| `inline` | `InlineCapture` | Inline subprocess manager |
| `pages` | `PageContainer` | Page manager |
| `print(content)` | `(content: string) => void` | Print to line buffer |
| `printLine(content)` | `(content: string) => void` | Print and flush |
| `clear()` | `() => void` | Clear line buffer |
| `focus()` | `() => void` | Focus screen |
| `destroy()` | `() => void` | Clean up terminal |

---

## Inline Subprocess Capture

### `createInlineCapture(screen, options?)`

Creates an inline capture manager for subprocess output.

```typescript
import { createInlineCapture } from '@flowterm/term';

const inline = createInlineCapture(screen, {
    titleFg: 'cyan',
    borderFg: 'blue',
    maxLines: 500
});
```

#### InlineCaptureOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `titleFg` | `string` | `'blue'` | Section title color |
| `borderFg` | `string` | `'gray'` | Border color |
| `collapsed` | `boolean` | `false` | Start sections collapsed |
| `maxLines` | `number` | `100` | Maximum output lines |

#### InlineCapture Methods

| Method | Description |
|--------|-------------|
| `spawn(options)` | Spawn a new subprocess |
| `collapse(id)` | Collapse a section |
| `expand(id?)` | Expand section(s) |
| `remove(id)` | Remove a section |
| `getSection(id)` | Get section by ID |
| `getSections()` | Get all sections |
| `destroy()` | Clean up all sections |

#### CaptureOptions

```typescript
interface CaptureOptions {
    command: string;           // Command to run
    args?: string[];          // Arguments
    name?: string;            // Display name
    env?: Record<string, string>; // Environment
    cwd?: string;            // Working directory
}
```

---

## Page Container

### `createPageContainer(screen)`

Creates a multi-page manager.

```typescript
import { createPageContainer } from '@flowterm/term';

const pages = createPageContainer(screen);
```

#### PageContainer Methods

| Method | Description |
|--------|-------------|
| `createPage(name, content?)` | Create a new page |
| `showPage(name)` | Show a page |
| `hidePage(name)` | Hide a page |
| `getCurrentPage()` | Get current page |
| `listPages()` | List all pages |
| `getPage(name)` | Get page by name |
| `removePage(name)` | Remove a page |
| `destroy()` | Clean up |

#### Page Interface

```typescript
interface Page {
    name: string;
    box: any;
    content: string;
}
```

---

## Split Layout

### `createSplitLayout(screen, options?)`

Creates a split view with info + terminal sections.

```typescript
import { createSplitLayout } from '@flowterm/term';

const split = createSplitLayout(screen, {
    direction: 'vertical',
    infoHeight: 15,
    titleFg: 'green',
    borderFg: 'gray'
});
```

#### SplitOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `direction` | `'vertical'` \| `'horizontal'` | `'vertical'` | Layout direction |
| `infoHeight` | `number` | `10` | Info section size |
| `titleFg` | `string` | `'blue'` | Title color |
| `borderFg` | `string` | `'gray'` | Border color |

#### SplitLayout Interface

```typescript
interface SplitLayout {
    info: any;
    terminal: any;
    container: any;
    setInfoContent(content: string): void;
    getInfoContent(): string;
    setTerminalContent(content: string): void;
    getTerminalContent(): string;
    focusInfo(): void;
    focusTerminal(): void;
    destroy(): void;
}
```

### SplitDirection

```typescript
type SplitDirection = 'vertical' | 'horizontal';
```

---

## Keyboard Shortcuts

Default keyboard shortcuts (can be overridden):

- `Escape`, `q`, `Ctrl+C` - Exit terminal
- `Ctrl+P` - Focus page switcher (when using PageContainer)