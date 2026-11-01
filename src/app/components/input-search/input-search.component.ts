import { Component } from '@angular/core';
import { LucideSearch } from '@lucide/angular';

@Component({
    selector: 'app-input-search',
    imports: [LucideSearch],
    template: `
        <label for="search" class="relative">
            <div class="relative">
                <input type="text" id="search" placeholder="Rechercher..." class="pl-8" />
                <svg
                    lucideSearch
                    [size]="16"
                    class="absolute top-1/2 -translate-y-1/2 left-2 pointer-events-none"
                ></svg>
            </div>
        </label>
    `,
    host: {
        class: 'block',
    },
})
export class InputSearchComponent {}
