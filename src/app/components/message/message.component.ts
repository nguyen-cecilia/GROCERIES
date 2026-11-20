import { Component, input, output } from '@angular/core';
import {
    LucideCircleCheck,
    LucideCircleExclamationPoint,
    LucideInfo,
    LucideTriangleExclamationPoint,
    LucideX,
} from '@lucide/angular';

export type MessageVariant = 'error' | 'success' | 'warning' | 'info' | 'loading';

const MESSAGE_STYLES: Record<MessageVariant, { box: string; solid: string; icon: string }> = {
    error: {
        box: 'py-3 bg-invalid/20 border-invalid/40 text-invalid',
        solid: 'py-3 bg-invalid-2 border-invalid/40 text-invalid',
        icon: 'text-invalid',
    },
    success: {
        box: 'py-3 bg-valid/20 border-valid/40 text-valid',
        solid: 'py-3 bg-valid-2 border-valid/40 text-valid',
        icon: 'text-valid',
    },
    warning: {
        box: 'py-3 bg-secondary/15 border-secondary/40',
        solid: 'py-3 bg-secondary-2 border-secondary/40',
        icon: 'text-secondary',
    },
    info: {
        box: 'py-3 bg-primary/10 border-primary/30',
        solid: 'py-3 bg-primary-3 border-primary/30',
        icon: 'text-primary',
    },
    loading: {
        box: 'py-1 border-transparent justify-center',
        solid: 'py-1 border-transparent justify-center',
        icon: '',
    },
};

@Component({
    selector: 'app-message',
    imports: [
        LucideCircleCheck,
        LucideInfo,
        LucideX,
        LucideCircleExclamationPoint,
        LucideTriangleExclamationPoint,
    ],
    template: `
        @if (message()) {
            <div
                [attr.role]="variant() === 'error' ? 'alert' : 'status'"
                [attr.aria-live]="variant() === 'error' ? 'assertive' : 'polite'"
                [attr.aria-busy]="variant() === 'loading' ? 'true' : null"
                class="flex items-center gap-3 rounded-sm border px-4"
                [class]="solid() ? styles[variant()].solid : styles[variant()].box"
            >
                @switch (variant()) {
                    @case ('error') {
                        <svg
                            lucideCircleExclamationPoint
                            [size]="18"
                            class="shrink-0"
                            [class]="styles[variant()].icon"
                        />
                    }
                    @case ('success') {
                        <svg
                            lucideCircleCheck
                            [size]="18"
                            class="shrink-0"
                            [class]="styles[variant()].icon"
                        />
                    }
                    @case ('warning') {
                        <svg
                            lucideTriangleExclamationPoint
                            [size]="18"
                            class="shrink-0"
                            [class]="styles[variant()].icon"
                        />
                    }
                    @case ('loading') {
                        <span class="flex shrink-0 items-center gap-1 pt-1" aria-hidden="true">
                            <span class="size-1.5 rounded-full bg-current animate-dot"></span>
                            <span
                                class="size-1.5 rounded-full bg-current animate-dot [animation-delay:150ms]"
                            ></span>
                            <span
                                class="size-1.5 rounded-full bg-current animate-dot [animation-delay:300ms]"
                            ></span>
                        </span>
                    }
                    @default {
                        <svg
                            lucideInfo
                            [size]="18"
                            class="shrink-0"
                            [class]="styles[variant()].icon"
                        />
                    }
                }

                <p class="text-sm" [class.flex-1]="variant() !== 'loading'">
                    {{ message() }}
                </p>

                @if (dismissible()) {
                    <button
                        type="button"
                        aria-label="Fermer le message"
                        class="shrink-0 cursor-pointer rounded-sm p-0.5 text-muted transition-colors hover:text-ink"
                        (click)="closed.emit()"
                    >
                        <svg lucideX [size]="16" />
                    </button>
                }
            </div>
        }
    `,
    host: {
        '[class]': 'message() ? "block" : "hidden"',
    },
})
export class MessageComponent {
    readonly variant = input<MessageVariant>('info');
    readonly message = input<string | null>(null);
    readonly dismissible = input(false);
    readonly solid = input(false);
    readonly closed = output<void>();

    protected readonly styles = MESSAGE_STYLES;
}
