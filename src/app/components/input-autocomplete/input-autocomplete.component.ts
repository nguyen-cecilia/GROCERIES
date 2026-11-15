import {
    afterNextRender,
    Component,
    computed,
    DOCUMENT,
    ElementRef,
    inject,
    Injector,
    input,
    model,
    output,
    signal,
    viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { normalizeLabel } from '../../core/utils';
import { FloatingPanel, hiddenPanelStyle } from '../floating-panel/floating-panel';
import { LucideX } from '@lucide/angular';

export interface AutocompleteOption {
    value: string;
    hint?: string;
    hintColor?: string;
    create?: boolean;
}

@Component({
    selector: 'app-input-autocomplete',
    templateUrl: './input-autocomplete.component.html',
    imports: [LucideX],
    host: {
        class: 'block',
        '(document:click)': 'onDocumentClick($event)',
    },
})
export class InputAutocompleteComponent implements FormValueControl<string> {
    private static seq = 0;

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly document = inject(DOCUMENT);
    private readonly injector = inject(Injector);

    protected readonly uid = `autocomplete-${InputAutocompleteComponent.seq++}`;
    protected readonly optionId = (index: number) => `${this.uid}-opt-${index}`;

    readonly value = model('');
    readonly creatable = input(false);
    readonly disabled = input(false);
    readonly options = input.required<AutocompleteOption[]>();
    readonly label = input('');
    readonly placeholder = input('');
    readonly id = input('');
    readonly maxResults = input(8);
    readonly emptyLabel = input('Aucun résultat');
    readonly cleared = output<void>();

    readonly isOpen = signal(false);
    readonly activeIndex = signal(-1);

    protected readonly fieldId = computed(() => this.id() || this.uid);

    protected readonly filtered = computed(() => {
        const query = normalizeLabel(this.value());
        const matches = query
            ? this.options().filter((option) => normalizeLabel(option.value).includes(query))
            : this.options();
        return matches.slice(0, this.maxResults());
    });

    protected readonly canCreate = computed(() => {
        const label = this.value().trim();
        if (!this.creatable() || !label) return false;
        const key = normalizeLabel(label);
        return !this.options().some((option) => normalizeLabel(option.value) === key);
    });

    protected readonly rows = computed<AutocompleteOption[]>(() => {
        const options = this.filtered();
        if (!this.canCreate()) return options;
        return [...options, { value: this.value().trim(), hint: 'nouvel article', create: true }];
    });

    protected readonly showClear = computed(() => this.value() !== '' && !this.disabled());

    protected readonly panelStyle = signal(hiddenPanelStyle());

    private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
    private readonly listbox = viewChild<ElementRef<HTMLElement>>('listbox');

    private readonly floating = new FloatingPanel(
        this.document.defaultView!,
        () => this.field()?.nativeElement ?? null,
        () => this.listbox()?.nativeElement ?? null,
        (style) => this.panelStyle.set({ ...style, visibility: 'visible' }),
    );

    protected onFocus(): void {
        if (this.disabled() || this.isOpen()) return;
        this.open();
    }

    protected onInput(event: Event): void {
        this.value.set((event.target as HTMLInputElement).value);
        this.activeIndex.set(this.rows().length ? 0 : -1);
        if (this.isOpen()) this.floating.attach();
        else this.open();
    }

    protected choose(option: AutocompleteOption): void {
        this.value.set(option.value);
        this.close();
    }

    protected onDocumentClick(event: MouseEvent): void {
        if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
            this.close();
        }
    }

    protected onKeydown(event: KeyboardEvent): void {
        const count = this.rows().length;

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();
                if (!this.isOpen()) return this.open();
                if (!count) return;
                const dir = event.key === 'ArrowDown' ? 1 : -1;
                this.activeIndex.set((this.activeIndex() + dir + count) % count);
                this.scrollActiveIntoView();
                break;
            }
            case 'Enter': {
                if (!this.isOpen()) return;
                const option = this.rows()[this.activeIndex()];
                if (!option) return;
                event.preventDefault();
                this.choose(option);
                break;
            }
            case 'Escape':
                if (this.isOpen()) {
                    event.preventDefault();
                    this.close();
                }
                break;
            case 'Tab':
                this.close();
                break;
        }
    }

    protected clear(): void {
        this.value.set('');
        this.activeIndex.set(-1);
        this.field()?.nativeElement.focus();
        this.cleared.emit();
        this.open();
    }

    private open(): void {
        this.isOpen.set(true);
        this.activeIndex.set(this.rows().length ? 0 : -1);

        afterNextRender(
            () => {
                if (!this.isOpen()) return;
                this.floating.attach();
            },
            { injector: this.injector },
        );
    }

    private close(): void {
        if (!this.isOpen()) return;
        this.isOpen.set(false);
        this.activeIndex.set(-1);
        this.floating.detach();
        this.panelStyle.set(hiddenPanelStyle());
    }

    private scrollActiveIntoView(): void {
        const listbox = this.listbox()?.nativeElement;
        const index = this.activeIndex();
        if (!listbox || index < 0) return;

        const item = listbox.children[index] as HTMLElement | undefined;
        if (!item) return;

        const top = item.offsetTop;
        const bottom = top + item.offsetHeight;

        if (top < listbox.scrollTop) {
            listbox.scrollTop = top;
        } else if (bottom > listbox.scrollTop + listbox.clientHeight) {
            listbox.scrollTop = bottom - listbox.clientHeight;
        }
    }
}
