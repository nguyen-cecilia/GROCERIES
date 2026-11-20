import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
    id: number;
    message: string;
    variant: ToastVariant;
};

const DURATION = 5000;
const MAX_VISIBLE = 4;

@Injectable({ providedIn: 'root' })
export class ToastService {
    private readonly toastsState = signal<Toast[]>([]);
    private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
    private nextId = 1;

    readonly toasts = this.toastsState.asReadonly();

    success(message: string): void {
        this.show(message, 'success');
    }

    error(message: string): void {
        this.show(message, 'error', 5000);
    }

    show(message: string, variant: ToastVariant = 'success', duration = DURATION): void {
        const text = message.trim();
        if (!text) return;

        const current = this.toastsState();

        const duplicate = current.find((t) => t.message === text && t.variant === variant);
        if (duplicate) {
            this.restartTimer(duplicate.id, duration);
            return;
        }

        if (current.length >= MAX_VISIBLE) {
            this.dismiss(current[0].id);
        }

        const toast: Toast = { id: this.nextId++, message: text, variant };
        this.toastsState.update((toasts) => [...toasts, toast]);
        this.timers.set(
            toast.id,
            setTimeout(() => this.dismiss(toast.id), duration),
        );
    }

    dismiss(id: number): void {
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(id);
        }
        this.toastsState.update((toasts) => toasts.filter((toast) => toast.id !== id));
    }

    private restartTimer(id: number, duration: number): void {
        const timer = this.timers.get(id);
        if (timer) clearTimeout(timer);
        this.timers.set(
            id,
            setTimeout(() => this.dismiss(id), duration),
        );
    }
}
