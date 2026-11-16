import { Component, Input, computed, model, output, signal } from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';

@Component({
    selector: 'app-input-price',
    template: `
        <label [attr.for]="id">
            @if (label) {
                <p>{{ label }}</p>
            }
            <div class="relative">
                <input
                    type="text"
                    [id]="id"
                    inputmode="decimal"
                    placeholder="0.00"
                    autocomplete="off"
                    class="font-bold text-right pr-6"
                    [class]="fld[size]"
                    [value]="display()"
                    (input)="onInput($event)"
                    (change)="commit()"
                />
                <span
                    class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none font-bold text-muted"
                >
                    {{ symbol }}</span
                >
            </div>
        </label>
    `,
    host: {
        class: 'block',
    },
})
export class InputPriceComponent implements FormValueControl<number | null> {
    readonly value = model<number | null>(null);

    readonly committed = output<number | null>();

    @Input() id = 'price';
    @Input() symbol = '€';
    @Input() label = '';
    @Input() size: 'sm' | 'md' = 'md';
    protected readonly fld = { sm: 'max-md:py-1!', md: '' };

    private readonly draft = signal<string | null>(null);
    protected readonly display = computed(() => this.draft() ?? this.format(this.value()));

    protected onInput(event: Event): void {
        const raw = (event.target as HTMLInputElement).value;
        this.draft.set(raw);
        this.value.set(this.parse(raw));
    }

    protected commit(): void {
        this.draft.set(null);
        this.committed.emit(this.value());
    }

    private parse(raw: string): number | null {
        const cleaned = raw.trim().replace(/\s/g, '').replace(/,/g, '.');
        if (cleaned === '') return null;

        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
    }

    private format(n: number | null): string {
        return n === null ? '' : String(n);
    }
}
