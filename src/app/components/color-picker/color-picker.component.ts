import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    host: {
        'class': 'block',
    }
})
export class ColorPickerComponent {
    readonly colors = input.required<readonly string[]>();
    readonly value = input<string | null>(null);
    readonly label = input('Couleur');
    readonly valueChange = output<string>();
}
