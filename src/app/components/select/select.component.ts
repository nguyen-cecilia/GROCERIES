import {
    Component,
    ElementRef,
    inject,
    signal,
    viewChild,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
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
export class SelectComponent {
    private static seq = 0;
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly uid = `select-${SelectComponent.seq++}`;
    protected readonly optionId = (i: number) => `${this.uid}-opt-${i}`;

    @Input({ required: true }) options: SelectOption[] = [];
    @Input() value: string | null = null;
    @Input() label = '';
    @Input() placeholder = 'Sélectionner...';
    @Input() disabled = false;

    @Output() readonly valueChange = new EventEmitter<string>();

    readonly isOpen = signal(false);
    readonly activeIndex = signal(-1);

    private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
    private readonly listbox = viewChild<ElementRef<HTMLElement>>('listbox');

    get selected(): SelectOption | null {
        return this.options.find((o) => o.value === this.value) ?? null;
    }

    toggle(): void {
        if (this.disabled) return;
        this.isOpen() ? this.close() : this.openPanel();
    }

    choose(option: SelectOption): void {
        this.valueChange.emit(option.value);
        this.close();
    }

    onDocumentClick(event: MouseEvent): void {
        if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
            this.isOpen.set(false);
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
                this.isOpen.set(false);
                break;
        }
    }

    private openPanel(): void {
        const index = this.options.findIndex((o) => o.value === this.value);
        this.activeIndex.set(index >= 0 ? index : 0);
        this.isOpen.set(true);
        this.scrollActiveIntoView();
    }

    private close(): void {
        this.isOpen.set(false);
        this.activeIndex.set(-1);
        this.trigger()?.nativeElement.focus();
    }

    private scrollActiveIntoView(): void {
        setTimeout(() => {
            const item = this.listbox()?.nativeElement.children[this.activeIndex()] as
                HTMLElement | undefined;
            item?.scrollIntoView({ block: 'nearest' });
        });
    }
}
