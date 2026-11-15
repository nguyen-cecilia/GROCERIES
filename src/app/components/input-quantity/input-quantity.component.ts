import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { LucideMinus, LucidePlus } from '@lucide/angular';

@Component({
    selector: 'app-input-quantity',
    imports: [LucideMinus, LucidePlus],
    template: `
        <div class="space-y-1.5">
            @if (label) {
                <p class="uppercase font-bold text-muted text-sm tracking-wider">{{ label }}</p>
            }

            <div
                role="group"
                [attr.aria-label]="label || 'Quantité'"
                class="inline-flex items-center overflow-hidden border border-line bg-surface has-focus:border-muted/75 has-focus:ring-3 has-focus:ring-primary/40"
                [class]="rds[radius]"
            >
                <button
                    type="button"
                    aria-label="Diminuer la quantité"
                    class="grid place-items-center cursor-pointer text-ink transition-colors hover:bg-deep disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    [class]="btn[size]"
                    [disabled]="disabled || value <= buttonMin"
                    (click)="decrement()"
                >
                    <svg lucideMinus [size]="ico[size]"></svg>
                </button>

                <input
                    #field
                    [id]="id"
                    type="text"
                    inputmode="decimal"
                    autocomplete="off"
                    [attr.aria-label]="label || 'Quantité'"
                    class="border-0 bg-transparent p-0 text-center font-semibold tabular-nums text-ink focus:outline-none focus:ring-0"
                    [class]="fld[size]"
                    [value]="format(value)"
                    [disabled]="disabled"
                    (change)="commit($event)"
                    (blur)="commit($event)"
                    (keydown)="onKeydown($event)"
                />

                <button
                    type="button"
                    aria-label="Augmenter la quantité"
                    class="grid place-items-center cursor-pointer text-ink transition-colors hover:bg-deep disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    [class]="btn[size]"
                    [disabled]="disabled || value >= max"
                    (click)="increment()"
                >
                    <svg lucidePlus [size]="ico[size]"></svg>
                </button>
            </div>
        </div>
    `,
    host: {
        class: 'block',
    },
})
export class InputQuantityComponent {
    @Input() value = 1;
    @Input() min = 0.01;
    @Input() buttonMin = 1;
    @Input() max = 9999;
    @Input() step = 1;
    @Input() precision = 3;
    @Input() label = '';
    @Input() id = 'quantity';
    @Input() disabled = false;
    @Input() size: 'sm' | 'md' = 'md';
    @Input() radius: 'sm' | 'full' = 'full';
    protected readonly btn = { sm: 'size-7', md: 'size-9' };
    protected readonly fld = { sm: 'h-7.5 w-8 lg:w-10', md: 'h-10 w-12' };
    protected readonly ico = { sm: '12', md: '16' };
    protected readonly rds = { sm: 'rounded-sm', full: 'rounded-full' };

    @Output() readonly valueChange = new EventEmitter<number>();

    @ViewChild('field') private field?: ElementRef<HTMLInputElement>;

    decrement(): void {
        this.stepBy(-1);
    }

    increment(): void {
        this.stepBy(1);
    }

    commit(event: Event): void {
        const input = event.target as HTMLInputElement;
        const next = this.readValue(input);
        input.value = this.format(next);
        this.emit(next);
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.increment();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.decrement();
        } else if (event.key === 'Enter') {
            (event.target as HTMLInputElement).blur();
        }
    }

    /** Affiche avec un point : 0.15 → "0.15" */
    format(n: number): string {
        return String(n);
    }

    private stepBy(direction: 1 | -1): void {
        const input = this.field?.nativeElement;
        const base = input ? this.readValue(input) : this.value;

        const next =
            direction < 0
                ? base <= this.buttonMin
                    ? base
                    : Math.max(this.buttonMin, this.round(base - this.step))
                : this.normalize(base + this.step);

        if (input) input.value = this.format(next);
        this.emit(next);
    }

    private readValue(input: HTMLInputElement): number {
        const raw = input.value.trim().replace(/\s/g, '').replace(',', '.');
        const parsed = raw === '' ? NaN : Number(raw);

        if (!Number.isFinite(parsed) || parsed <= 0) return this.normalize(this.value);
        return this.normalize(parsed);
    }

    private normalize(n: number): number {
        return Math.min(this.max, Math.max(this.min, this.round(n)));
    }

    private round(n: number): number {
        const factor = 10 ** this.precision;
        return Math.round(n * factor) / factor;
    }

    private emit(next: number): void {
        if (next !== this.value) this.valueChange.emit(next);
    }
}
