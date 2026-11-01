import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-input-price',
    imports: [],
    template: `
        <label for="{{ this.id }}">
            @if (this.label) {
                <p>{{ label }}</p>
            }
            <div class="relative">
                <input
                    type="number"
                    id="{{ this.id }}"
                    inputmode="decimal"
                    placeholder="0.00"
                    min="0"
                    class="font-bold text-right pr-6"
                />
                <span
                    class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none font-bold text-muted"
                    >{{ this.symbol }}</span
                >
            </div>
        </label>
    `,
    host: {
        class: 'block',
    },
})
export class InputPriceComponent {
    @Input() id = 'price';
    @Input() symbol = '€';
    @Input() label = '';
}
