import blessed from 'blessed';
import { createInlineCapture } from './inline/inline-capture.js';
import type { InlineCapture, InlineCaptureOptions } from './inline/inline-capture.js';
import { createPageContainer } from './pages/page-container.js';
import type { Page, PageContainer } from './pages/page-container.js';
import { createSplitLayout, SplitLayoutImpl } from './split/split-layout.js';
import type { SplitLayout, SplitOptions, SplitDirection } from './split/split-layout.js';

export interface TerminalOptions {
    title?: string;
    infoHeight?: number;
    smartCSR?: boolean;
    titleFg?: string;
    borderFg?: string;
}

export interface TerminalManager {
    screen: any;
    inline: InlineCapture;
    pages: PageContainer;
    print(content: string): void;
    printLine(content: string): void;
    clear(): void;
    focus(): void;
    destroy(): void;
}

export function createTerminal(options: TerminalOptions = {}): TerminalManager {
    const screenObject = blessed.screen({
        smartCSR: options.smartCSR ?? true,
        title: options.title ?? 'Terminal',
        dockBorders: true,
    });

    const inline = createInlineCapture(screenObject, {
        titleFg: options.titleFg ?? 'blue',
        borderFg: options.borderFg ?? 'gray',
    });

    const pages = createPageContainer(screenObject);

    let _lineBuffer = '';

    const manager: TerminalManager = {
        screen: screenObject,
        inline,
        pages,

        print(content: string): void {
            _lineBuffer += content;
            screenObject.render();
        },

        printLine(content: string): void {
            _lineBuffer += content;
            inline.expand();
            screenObject.render();
            _lineBuffer = '';
        },

        clear(): void {
            _lineBuffer = '';
            screenObject.render();
        },

        focus(): void {
            screenObject.emit('focus');
        },

        destroy(): void {
            inline.destroy();
            screenObject.destroy();
        },
    };

    screenObject.key(['escape', 'q', 'C-c'], () => {
        manager.destroy();
        process.exit(0);
    });

    return manager;
}

export { createInlineCapture };
export type { InlineCapture, InlineCaptureOptions };
export { createPageContainer };
export type { Page, PageContainer };
export { createSplitLayout, SplitLayoutImpl };
export type { SplitLayout, SplitOptions, SplitDirection };