import { Component, Input } from '@angular/core';
import { aisleColorHex, AisleColorKey } from '../../core/aisle-colors';

const DOT_SIZE = {
    sm: 'size-2.5',
    md: 'size-3.5',
    lg: 'size-5',
} as const;

export type DotSize = keyof typeof DOT_SIZE;

@Component({
    selector: 'app-badge-aisle',
    imports: [],
    template: `
        <div class="flex items-center gap-2">
            <div [class]="dotClass" [style.background-color]="hex"></div>
            <p class="whitespace-nowrap truncate" [class.text-muted]="!color && !inverted">
                {{ label }}
            </p>
        </div>
    `,
    host: {
        class: 'block',
    },
})
export class BadgeAisleComponent {
    @Input() color: AisleColorKey | null = null;
    @Input() label = 'Aucun rayon';
    @Input() size: DotSize = 'md';
    @Input() inverted = false;
    protected readonly dotSize = DOT_SIZE;

    protected get hex(): string {
        return aisleColorHex(this.color);
    }

    protected get dotClass(): string {
        const border = this.inverted ? 'border-canvas' : 'border-ink/50';
        return `${DOT_SIZE[this.size]} rounded-full border ${border}`;
    }
}
