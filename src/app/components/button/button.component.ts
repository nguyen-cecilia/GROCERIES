import { Component, Input } from '@angular/core';

@Component({
    selector: 'button[app-button], a[app-button]',
    template: ` <ng-content /> `,
    host: {
        '[class]': 'classes()',
        '[attr.type]': 'type',
        '[attr.disabled]': 'disabled ? "" : null',
    },
})
export class ButtonComponent {
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() disabled = false;
    @Input() variant:
        | 'primary'
        | 'secondary'
        | 'tertiary'
        | 'outline'
        | 'ghost'
        | 'link'
        | 'invalid'
        | 'tab'
        | 'tabActive'
        | 'sortTable' = 'primary';
    @Input() shape: 'pill' | 'bigPill' | 'round' | 'roundSmall' | 'rounded' = 'pill';

    classes(): string {
        const base =
            'flex items-center gap-2 leading-4 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 hover:-translate-y-0.5';

        const variants = {
            primary:
                'bg-primary text-canvas hover:bg-primary-2 font-semibold justify-center shadow-xl',
            secondary:
                'bg-secondary text-canvas hover:bg-secondary/80 font-semibold justify-center shadow-xl',
            tertiary: '',
            outline:
                'bg-surface border border-line font-semibold justify-center hover:border-ink/50 hover:bg-deep',
            ghost: 'font-semibold text-muted hover:bg-deep hover:text-ink',
            link: 'underline underline-offset-3 font-semibold',
            invalid: 'bg-surface text-invalid font-semibold border border-invalid/50 hover:bg-invalid hover:text-canvas hover:shadow-xl',
            tab: 'font-medium text-md hover:bg-deep',
            tabActive: 'font-semibold text-md bg-ink text-canvas shadow-lg hover:bg-ink',
            sortTable: 'p-0! uppercase hover:text-ink',
        };

        const shapes = {
            pill: 'rounded-full text-sm py-2 px-2.5',
            bigPill: 'rounded-full py-2.5 px-3.5',
            round: 'rounded-full text-sm p-2.5',
            roundSmall: 'rounded-full p-1',
            rounded: 'rounded-sm p-2',
        };

        const shape = this.variant === 'link' ? '' : shapes[this.shape];

        return `${base} ${variants[this.variant]} ${shape}`.trim();
    }
}
