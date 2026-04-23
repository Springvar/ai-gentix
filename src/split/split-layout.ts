import blessed from 'blessed';

export type SplitDirection = 'vertical' | 'horizontal';

export interface SplitOptions {
    direction?: SplitDirection;
    infoHeight?: number;
    titleFg?: string;
    borderFg?: string;
}

export interface SplitLayout {
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

type BlessedElement = any;

export class SplitLayoutImpl implements SplitLayout {
    public container: BlessedElement;
    public info: BlessedElement;
    public terminal: BlessedElement;

    constructor(
        screenObject: unknown,
        options: SplitOptions = {}
    ) {
        const direction = options.direction ?? 'vertical';
        const infoHeight = options.infoHeight ?? 10;
        const titleFg = options.titleFg ?? 'blue';
        const borderFg = options.borderFg ?? 'gray';

        this.container = blessed.box({
            parent: screenObject as any,
            top: 0 as any,
            left: 0 as any,
            width: '100%',
            height: '100%',
        });

        this.info = blessed.box({
            parent: this.container as any,
            top: 0 as any,
            left: 0 as any,
            width: direction === 'vertical' ? '100%' : '50%',
            height: direction === 'vertical' ? infoHeight : '100%',
            border: { type: 'line', fg: borderFg } as any,
            style: {
                fg: titleFg,
                border: { fg: borderFg },
            },
            content: '',
        });

        const terminalTop = direction === 'vertical' ? infoHeight : 0;
        const terminalLeft = direction === 'horizontal' ? 1 : 0;
        const terminalHeight = direction === 'vertical' ? `100%-${infoHeight + 1}` : '100%';
        const terminalWidth = direction === 'vertical' ? '100%' : '100%-1';

        this.terminal = blessed.box({
            parent: this.container as any,
            top: terminalTop as any,
            left: terminalLeft as any,
            width: terminalWidth as any,
            height: terminalHeight as any,
            border: { type: 'line', fg: borderFg } as any,
            style: {
                fg: 'white',
                border: { fg: borderFg },
            },
            keys: true,
            scrollable: true,
            content: '',
        });
    }

    setInfoContent(content: string): void {
        this.info.setContent(content);
    }

    getInfoContent(): string {
        return this.info.getContent() as string;
    }

    setTerminalContent(content: string): void {
        this.terminal.setContent(content);
    }

    getTerminalContent(): string {
        return this.terminal.getContent() as string;
    }

    focusInfo(): void {
        this.info.focus();
    }

    focusTerminal(): void {
        this.terminal.focus();
    }

    destroy(): void {
        this.terminal.destroy();
        this.info.destroy();
        this.container.destroy();
    }
}

export function createSplitLayout(
    screenObject: unknown,
    options: SplitOptions = {}
): SplitLayout {
    return new SplitLayoutImpl(screenObject, options);
}