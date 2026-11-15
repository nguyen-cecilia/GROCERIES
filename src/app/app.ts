import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideRotateCcw, LucideScrollText, LucideSettings } from '@lucide/angular';
import { ButtonComponent } from './components/button/button.component';
import { AuthService } from './core/auth.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        RouterLink,
        LucideSettings,
        ButtonComponent,
        LucideScrollText,
        RouterLinkActive,
        LucideRotateCcw,
    ],
    templateUrl: './app.html',
})
export class App {
    private update = inject(SwUpdate);
    protected readonly authService = inject(AuthService);

    hasUpdate = signal(false);

    constructor() {
        this.update.versionUpdates.subscribe((event) => {
            if (event.type === 'VERSION_READY') {
                this.hasUpdate.set(true);
            }
        });

        setInterval(() => {
            void this.update.checkForUpdate();
        }, 60000);
    }

    applyUpdate() {
        this.update.activateUpdate().then(() => location.reload());
    }
}
