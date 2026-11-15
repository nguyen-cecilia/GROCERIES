export interface FloatingPanelOptions {
    gap?: number;
    maxHeight?: number;
}

const HIDDEN: Record<string, string> = {
    position: 'fixed',
    top: '0px',
    left: '0px',
    width: '0px',
    maxHeight: '0px',
    visibility: 'hidden',
};

export function hiddenPanelStyle(): Record<string, string> {
    return { ...HIDDEN };
}

export class FloatingPanel {
    private stopWatching?: () => void;

    constructor(
        private readonly view: Window,
        private readonly anchor: () => HTMLElement | null,
        private readonly panel: () => HTMLElement | null,
        private readonly apply: (style: Record<string, string>) => void,
        private readonly options: FloatingPanelOptions = {},
    ) {}

    attach(): void {
        this.detach();
        this.place();

        const reposition = () => this.place();
        this.view.addEventListener('scroll', reposition, true);
        this.view.addEventListener('resize', reposition);

        this.stopWatching = () => {
            this.view.removeEventListener('scroll', reposition, true);
            this.view.removeEventListener('resize', reposition);
        };
    }

    detach(): void {
        this.stopWatching?.();
        this.stopWatching = undefined;
    }

    private place(): void {
        const anchor = this.anchor();
        const panel = this.panel();
        if (!anchor || !panel) return;

        const gap = this.options.gap ?? 4;
        const maxHeight = this.options.maxHeight ?? 240;

        const rect = anchor.getBoundingClientRect();
        const spaceBelow = this.view.innerHeight - rect.bottom - gap;
        const spaceAbove = rect.top - gap;
        const contentHeight = panel.scrollHeight;

        const openUp = spaceBelow < Math.min(maxHeight, contentHeight) && spaceAbove > spaceBelow;
        const available = Math.max(0, openUp ? spaceAbove : spaceBelow);

        this.apply({
            position: 'fixed',
            left: `${Math.round(rect.left)}px`,
            width: `${Math.round(rect.width)}px`,
            maxHeight: `${Math.round(Math.min(maxHeight, available))}px`,
            ...(openUp
                ? { bottom: `${Math.round(this.view.innerHeight - rect.top + gap)}px`, top: 'auto' }
                : { top: `${Math.round(rect.bottom + gap)}px`, bottom: 'auto' }),
        });
    }
}
