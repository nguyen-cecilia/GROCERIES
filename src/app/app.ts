import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideScrollText, LucideSettings } from '@lucide/angular';
import { ButtonComponent } from './components/button/button.component';
import { AuthService } from './core/auth.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        RouterLink,
        LucideSettings,
        ButtonComponent,
        LucideScrollText,
        RouterLinkActive,
    ],
    templateUrl: './app.html',
})
export class App {
    protected readonly authService = inject(AuthService);
}
