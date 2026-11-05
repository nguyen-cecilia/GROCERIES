import { Component, input, output } from '@angular/core';

export type ColorOption = { value: string; color: string; label?: string };

@Component({
    selector: 'app-color-picker',
    template: `
        <div class="space-y-3">
            <p class="uppercase font-bold text-muted text-sm">{{ label() }}</p>
            <div class="flex flex-wrap gap-3" role="radiogroup" [attr.aria-label]="label()">
                @for (option of options(); track option.value) {
                    <button
                        type="button"
                        class="size-9 rounded-full transition-all hover:scale-110 cursor-pointer"
                        [class]="value() === option.value ? 'ring-2 ring-ink' : 'ring-line'"
                        [style.background-color]="option.color"
                        [attr.aria-label]="option.label ?? option.value"
                        [attr.title]="option.label ?? option.value"
                        role="radio"
                        [attr.aria-checked]="value() === option.value"
                        (click)="valueChange.emit(option.value)"
                    ></button>
                }
            </div>
        </div>
    `,
    host: {
        'class': 'block',
    },
})
export class ColorPickerComponent {
    readonly options = input.required<readonly ColorOption[]>();
    readonly value = input<string | null>(null);
    readonly label = input('Couleur');
    readonly valueChange = output<string>();
}
