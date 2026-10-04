import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideSettings } from '@lucide/angular';
import { ButtonComponent } from './components/button/button.component';
import { AuthService } from './core/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, LucideSettings, ButtonComponent],
    templateUrl: './app.html',
})
export class App {
    protected readonly authService = inject(AuthService);
}
