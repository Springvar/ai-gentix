import blessed from 'blessed';
import * as pty from 'node-pty';
import { EventEmitter } from 'events';

export interface InlineCaptureOptions {
    titleFg?: string;
    borderFg?: string;
    collapsed?: boolean;
    maxLines?: number;
}

export interface CaptureOptions {
    command: string;
    args?: string[];
    name?: string;
    env?: Record<string, string>;
    cwd?: string;
}

type BlessedElement = any;
type BlessedScreen = any;

export class InlineCapture extends EventEmitter {
    private container: BlessedElement;
    private sections: Map<string, Section> = new Map();
    private nextSectionId = 0;
    private options: Required<InlineCaptureOptions>;
    private screenObject: BlessedScreen;

    constructor(screenObject: unknown, options: InlineCaptureOptions = {}) {
        super();
        this.screenObject = screenObject as BlessedScreen;
        this.options = {
            titleFg: options.titleFg ?? 'blue',
            borderFg: options.borderFg ?? 'gray',
            collapsed: options.collapsed ?? false,
            maxLines: options.maxLines ?? 100,
        };

        this.container = blessed.box({
            parent: this.screenObject,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            keys: true,
            scrollable: true,
            alwaysScroll: true,
        });
    }

    spawn(options: CaptureOptions): pty.IPty {
        const sectionId = String(this.nextSectionId++);
        const name = options.name ?? `Process ${sectionId}`;
        const shell = options.command;
        const args = options.args ?? [];

        const ptyProcess = pty.spawn(shell, args, {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: options.cwd ?? process.cwd(),
            env: { ...process.env, ...options.env },
        });

        const section = this.createSection(sectionId, name, ptyProcess);
        this.sections.set(sectionId, section);

        ptyProcess.onData((data: string) => {
            section.output.append(data);
            this.trimOutput(section);
            this.screenObject.render();
        });

        ptyProcess.onExit(({ exitCode }) => {
            section.header.setContent(`${name} [Exit: ${exitCode}]`);
            section.status = 'done';
            this.emit('exit', { sectionId, exitCode });
            this.screenObject.render();
        });

        this.screenObject.render();
        return ptyProcess;
    }

    private createSection(id: string, name: string, ptyProcess: pty.IPty): Section {
        const header = blessed.box({
            parent: this.container as any,
            top: 0 as any,
            left: 0 as any,
            width: '100%',
            height: 3,
            border: { type: 'line', fg: this.options.borderFg } as any,
            style: {
                fg: this.options.titleFg,
                bold: true,
            },
            content: name,
        });

        const output = blessed.box({
            parent: this.container as any,
            top: 3 as any,
            left: 0 as any,
            width: '100%',
            height: '100%-3' as any,
            scrollable: true,
            alwaysScroll: true,
            style: {
                fg: 'white',
                bg: 'black',
            },
            content: '',
        });

        return {
            id,
            name,
            header,
            output,
            pty: ptyProcess,
            status: 'running',
            collapsed: this.options.collapsed,
        };
    }

    private trimOutput(section: Section): void {
        const outputContent = section.output.getContent() as string;
        const lines = outputContent.split('\n');
        if (lines.length > this.options.maxLines) {
            section.output.setContent(lines.slice(-this.options.maxLines).join('\n'));
        }
    }

    collapse(id: string): void {
        const section = this.sections.get(id);
        if (section && !section.collapsed) {
            section.output.hide();
            section.header.setContent(`${section.name} [collapsed]`);
            section.collapsed = true;
            this.screenObject.render();
        }
    }

    expand(id?: string): void {
        if (id) {
            const section = this.sections.get(id);
            if (section && section.collapsed) {
                section.output.show();
                section.header.setContent(section.name);
                section.collapsed = false;
                this.screenObject.render();
            }
        } else {
            for (const section of this.sections.values()) {
                if (section.collapsed) {
                    section.output.show();
                    section.header.setContent(section.name);
                    section.collapsed = false;
                }
            }
            this.screenObject.render();
        }
    }

    remove(id: string): void {
        const section = this.sections.get(id);
        if (section) {
            section.header.destroy();
            section.output.destroy();
            this.sections.delete(id);
            this.screenObject.render();
        }
    }

    getSection(id: string): Section | undefined {
        return this.sections.get(id);
    }

    getSections(): Section[] {
        return Array.from(this.sections.values());
    }

    getScreen(): BlessedScreen {
        return this.screenObject;
    }

    destroy(): void {
        for (const section of this.sections.values()) {
            section.pty.kill();
            section.header.destroy();
            section.output.destroy();
        }
        this.sections.clear();
        this.container.destroy();
    }
}

interface Section {
    id: string;
    name: string;
    header: BlessedElement;
    output: BlessedElement;
    pty: pty.IPty;
    status: 'running' | 'done';
    collapsed: boolean;
}

export function createInlineCapture(
    screenObject: unknown,
    options: InlineCaptureOptions = {}
): InlineCapture {
    return new InlineCapture(screenObject, options);
}