import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideSettings } from '@lucide/angular';
import { ButtonComponent } from './components/button/button.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, LucideSettings, ButtonComponent],
    templateUrl: './app.html',
})
export class App {
    protected readonly title = signal('groceries');
}
