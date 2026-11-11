import { Component, ElementRef, Input, model, viewChild } from '@angular/core';
import { LucideSearch, LucideX } from '@lucide/angular';

@Component({
    selector: 'app-input-search',
    imports: [LucideSearch, LucideX],
    template: `
        <label [attr.for]="id" class="relative block">
            <div class="relative">
                <input
                    #field
                    type="text"
                    [id]="id"
                    [placeholder]="placeholder"
                    [value]="value()"
                    [attr.aria-label]="placeholder"
                    class="pl-8 pr-8"
                    (input)="onInput($event)"
                    (keydown.escape)="clear()"
                />
                <svg
                    lucideSearch
                    [size]="16"
                    class="absolute top-1/2 -translate-y-1/2 left-2 pointer-events-none"
                ></svg>

                @if (value()) {
                    <button
                        type="button"
                        (click)="clear()"
                        aria-label="Effacer la recherche"
                        class="absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer text-muted transition-colors hover:text-ink"
                    >
                        <svg lucideX [size]="14"></svg>
                    </button>
                }
            </div>
        </label>
    `,
    host: {
        class: 'block',
    },
})
export class InputSearchComponent {
    private static seq = 0;

    readonly value = model<string>('');

    @Input() id = `search-${InputSearchComponent.seq++}`;
    @Input() placeholder = 'Rechercher…';

    private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

    protected onInput(event: Event): void {
        this.value.set((event.target as HTMLInputElement).value);
    }

    protected clear(): void {
        this.value.set('');
        this.field()?.nativeElement.focus();
    }
}
