import {
    Component,
    DOCUMENT,
    ElementRef,
    inject,
    Input,
    input,
    model,
    signal,
    viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

export interface SelectOption {
    value: string;
    label: string;
    color?: string;
}

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    imports: [LucideChevronDown, LucideCheck],
    host: {
        class: 'block',
        '(document:click)': 'onDocumentClick($event)',
    },
})
export class SelectComponent implements FormValueControl<string | null> {
    private static seq = 0;
    private static readonly PANEL_GAP = 4;
    private static readonly PANEL_MAX_HEIGHT = 240;

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly document = inject(DOCUMENT);

    protected readonly uid = `select-${SelectComponent.seq++}`;
    protected readonly optionId = (i: number) => `${this.uid}-opt-${i}`;

    readonly value = model<string | null>(null);

    @Input({ required: true }) options: SelectOption[] = [];
    @Input() label = '';
    @Input() placeholder = 'Sélectionner...';

    readonly disabled = input(false);

    readonly isOpen = signal(false);
    readonly activeIndex = signal(-1);

    protected readonly panelStyle = signal<Record<string, string>>({
        position: 'fixed',
        top: '0px',
        left: '0px',
        width: '0px',
        maxHeight: '0px',
        visibility: 'hidden',
    });

    private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
    private readonly listbox = viewChild<ElementRef<HTMLElement>>('listbox');
    private stopWatchingViewport?: () => void;

    get selected(): SelectOption | null {
        return this.options.find((o) => o.value === this.value()) ?? null;
    }

    toggle(): void {
        if (this.disabled()) return;
        this.isOpen() ? this.close() : this.openPanel();
    }

    choose(option: SelectOption): void {
        this.value.set(option.value);
        this.close();
    }

    onDocumentClick(event: MouseEvent): void {
        if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
            this.close(false);
        }
    }

    onKeydown(event: KeyboardEvent): void {
        const count = this.options.length;
        if (!count) return;

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();
                if (!this.isOpen()) return this.openPanel();
                const dir = event.key === 'ArrowDown' ? 1 : -1;
                this.activeIndex.set((this.activeIndex() + dir + count) % count);
                this.scrollActiveIntoView();
                break;
            }
            case 'Home':
            case 'End':
                if (!this.isOpen()) return;
                event.preventDefault();
                this.activeIndex.set(event.key === 'Home' ? 0 : count - 1);
                this.scrollActiveIntoView();
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (!this.isOpen()) {
                    this.openPanel();
                } else {
                    const option = this.options[this.activeIndex()];
                    if (option) this.choose(option);
                }
                break;
            case 'Escape':
                if (this.isOpen()) {
                    event.preventDefault();
                    this.close();
                }
                break;
            case 'Tab':
                this.close(false);
                break;
        }
    }

    private openPanel(): void {
        const index = this.options.findIndex((o) => o.value === this.value());
        this.activeIndex.set(index >= 0 ? index : 0);
        this.isOpen.set(true);

        setTimeout(() => {
            this.positionPanel();
            this.scrollActiveIntoView();
        });

        this.watchViewport();
    }

    private close(restoreFocus = true): void {
        if (!this.isOpen()) return;
        this.isOpen.set(false);
        this.activeIndex.set(-1);
        this.stopWatchingViewport?.();
        this.stopWatchingViewport = undefined;
        if (restoreFocus) this.trigger()?.nativeElement.focus();
    }

    private positionPanel(): void {
        const trigger = this.trigger()?.nativeElement;
        const panel = this.listbox()?.nativeElement;
        const view = this.document.defaultView;
        if (!trigger || !panel || !view) return;

        const rect = trigger.getBoundingClientRect();
        const gap = SelectComponent.PANEL_GAP;
        const spaceBelow = view.innerHeight - rect.bottom - gap;
        const spaceAbove = rect.top - gap;
        const contentHeight = panel.scrollHeight;

        const openUp =
            spaceBelow < Math.min(SelectComponent.PANEL_MAX_HEIGHT, contentHeight) &&
            spaceAbove > spaceBelow;

        const available = Math.max(0, openUp ? spaceAbove : spaceBelow);
        const maxHeight = Math.min(SelectComponent.PANEL_MAX_HEIGHT, available);

        this.panelStyle.set({
            position: 'fixed',
            left: `${Math.round(rect.left)}px`,
            width: `${Math.round(rect.width)}px`,
            maxHeight: `${Math.round(maxHeight)}px`,
            ...(openUp
                ? {
                    bottom: `${Math.round(view.innerHeight - rect.top + gap)}px`,
                    top: 'auto',
                }
                : {
                    top: `${Math.round(rect.bottom + gap)}px`,
                    bottom: 'auto',
                }),
        });
    }

    /** Repositionne le panneau si la modale (ou la page) défile. */
    private watchViewport(): void {
        this.stopWatchingViewport?.();
        const view = this.document.defaultView;
        if (!view) return;

        const reposition = () => this.positionPanel();
        view.addEventListener('scroll', reposition, true);
        view.addEventListener('resize', reposition);

        this.stopWatchingViewport = () => {
            view.removeEventListener('scroll', reposition, true);
            view.removeEventListener('resize', reposition);
        };
    }

    private scrollActiveIntoView(): void {
        const listbox = this.listbox()?.nativeElement;
        const item = listbox?.children[this.activeIndex()] as HTMLElement | undefined;
        if (!listbox || !item) return;

        const top = item.offsetTop;
        const bottom = top + item.offsetHeight;

        if (top < listbox.scrollTop) {
            listbox.scrollTop = top;
        } else if (bottom > listbox.scrollTop + listbox.clientHeight) {
            listbox.scrollTop = bottom - listbox.clientHeight;
        }
    }
}
