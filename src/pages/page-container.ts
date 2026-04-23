import blessed from 'blessed';

export interface Page {
    name: string;
    box: any;
    content: string;
}

export interface PageContainerOptions {
    defaultPage?: string;
}

type BlessedElement = any;
type BlessedScreen = any;

export class PageContainer {
    private screenObject: BlessedScreen;
    private pages: Map<string, Page> = new Map();
    private pageList: BlessedElement;
    private container: BlessedElement;
    private currentPage: string | null = null;

    constructor(screenObject: unknown) {
        this.screenObject = screenObject as BlessedScreen;

        this.container = blessed.box({
            parent: screenObject as any,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            keys: true,
        });

        this.pageList = blessed.list({
            parent: this.container,
            top: 0,
            right: 0,
            width: 15,
            height: '100%',
            tags: true,
            style: {
                selected: { bg: 'blue' },
            },
            items: [],
        });

        this.pageList.on('select', (item: any) => {
            if (item.content) {
                this.showPage(item.content);
            }
        });

        this.screenObject.key(['C-p'], () => {
            this.pageList.focus();
        });
    }

    createPage(name: string, content = ''): Page {
        const box = blessed.box({
            parent: this.container,
            top: 0,
            left: 0,
            width: '100%-15',
            height: '100%',
            scrollable: true,
            content,
        });

        const page: Page = { name, box, content };
        this.pages.set(name, page);
        this.pageList.add({ content: name });

        if (!this.currentPage) {
            this.showPage(name);
        }

        return page;
    }

    showPage(name: string): void {
        const page = this.pages.get(name);
        if (!page) return;

        if (this.currentPage) {
            const current = this.pages.get(this.currentPage);
            if (current) {
                current.box.hide();
            }
        }

        page.box.show();
        this.currentPage = name;
        this.screenObject.render();
    }

    hidePage(name: string): void {
        const page = this.pages.get(name);
        if (page) {
            page.box.hide();
        }
    }

    getCurrentPage(): Page | null {
        return this.currentPage ? this.pages.get(this.currentPage) ?? null : null;
    }

    listPages(): string[] {
        return Array.from(this.pages.keys());
    }

    getPage(name: string): Page | undefined {
        return this.pages.get(name);
    }

    getScreen(): BlessedScreen {
        return this.screenObject;
    }

    removePage(name: string): void {
        const page = this.pages.get(name);
        if (page) {
            page.box.destroy();
            this.pages.delete(name);
            this.pageList.removeItem(name);

            if (this.currentPage === name) {
                const first = this.pages.keys().next().value;
                if (first) {
                    this.showPage(first);
                } else {
                    this.currentPage = null;
                }
            }
        }
    }

    destroy(): void {
        for (const page of this.pages.values()) {
            page.box.destroy();
        }
        this.pages.clear();
        this.pageList.destroy();
        this.container.destroy();
    }
}

export function createPageContainer(screenObject: unknown): PageContainer {
    return new PageContainer(screenObject);
}