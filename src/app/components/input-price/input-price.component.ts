import { Component, Input, model, output } from '@angular/core';
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
                    type="number"
                    [id]="id"
                    inputmode="decimal"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    class="font-bold text-right pr-6"
                    [class]="fld[size]"
                    [value]="value() ?? ''"
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
    protected readonly fld = { sm: 'max-md:py-1!', md: ''};

    protected onInput(event: Event): void {
        const parsed = (event.target as HTMLInputElement).valueAsNumber;
        this.value.set(Number.isFinite(parsed) ? parsed : null);
    }

    protected commit(): void {
        this.committed.emit(this.value());
    }
}
