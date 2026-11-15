import {
    afterNextRender,
    Component,
    DOCUMENT,
    ElementRef,
    inject,
    Injector,
    Input,
    input,
    model,
    signal,
    viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { FloatingPanel, hiddenPanelStyle } from '../floating-panel/floating-panel';

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

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly document = inject(DOCUMENT);
    private readonly injector = inject(Injector);

    private readonly floating = new FloatingPanel(
        this.document.defaultView!,
        () => this.trigger()?.nativeElement ?? null,
        () => this.listbox()?.nativeElement ?? null,
        (style) => this.panelStyle.set({ ...style, visibility: 'visible' }),
    );

    protected readonly uid = `select-${SelectComponent.seq++}`;
    protected readonly optionId = (i: number) => `${this.uid}-opt-${i}`;

    readonly value = model<string | null>(null);

    @Input({ required: true }) options: SelectOption[] = [];
    @Input() label = '';
    @Input() placeholder = 'Sélectionner...';

    readonly disabled = input(false);

    readonly isOpen = signal(false);
    readonly activeIndex = signal(-1);
    protected readonly panelStyle = signal(hiddenPanelStyle());

    private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
    private readonly listbox = viewChild<ElementRef<HTMLElement>>('listbox');

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

        afterNextRender(
            () => {
                if (!this.isOpen()) return;
                this.floating.attach();
            },
            { injector: this.injector },
        );
    }

    private close(restoreFocus = true): void {
        if (!this.isOpen()) return;
        this.isOpen.set(false);
        this.activeIndex.set(-1);
        this.floating.detach();
        this.panelStyle.set(hiddenPanelStyle());
        if (restoreFocus) this.trigger()?.nativeElement.focus();
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
