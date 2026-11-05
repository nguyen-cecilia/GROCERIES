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
            <div
                class="rounded-full border border-ink/50"
                [class]="dotSize[size]"
                [style.background-color]="hex"
            ></div>
            <p>{{ this.label }}</p>
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
    protected readonly dotSize = DOT_SIZE;

    protected get hex(): string {
        return aisleColorHex(this.color);
    }
}
