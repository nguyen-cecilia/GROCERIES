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
        | 'ghostPrimary'
        | 'link'
        | 'invalid'
        | 'tab'
        | 'tabActive' = 'primary';
    @Input() shape: 'pill' | 'bigPill' | 'round' | 'roundSmall' = 'pill';

    classes(): string {
        const base =
            'flex items-center gap-2 leading-4 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 hover:-translate-y-0.5';

        const variants = {
            primary: 'bg-ink text-canvas hover:bg-ink/80 font-medium justify-center shadow-xl',
            secondary:
                'bg-secondary text-canvas hover:bg-secondary/80 font-medium justify-center shadow-xl',
            tertiary:
                'bg-tertiary text-canvas hover:bg-tertiary/80 font-medium justify-center shadow-xl',
            outline:
                'bg-transparent border border-ink/50 font-medium justify-center hover:border-primary hover:bg-primary/50',
            ghost: 'font-medium hover:bg-deep hover:shadow-lg',
            ghostPrimary: 'font-medium hover:bg-primary hover:shadow-xl',
            link: 'underline underline-offset-3 font-semibold',
            invalid:
                'text-secondary font-medium hover:bg-secondary hover:text-canvas hover:shadow-xl',
            tab: 'font-semibold hover:bg-deep',
            tabActive: 'font-semibold bg-ink text-canvas shadow-lg hover:bg-ink',
        };

        const shapes = {
            pill: 'rounded-full py-2.5 px-3.5',
            bigPill: 'rounded-full py-4 px-5 text-md',
            round: 'rounded-full p-2.5',
            roundSmall: 'rounded-full p-1',
        };

        const shape = this.variant === 'link' ? '' : shapes[this.shape];

        return `${base} ${variants[this.variant]} ${shape}`.trim();
    }
}
