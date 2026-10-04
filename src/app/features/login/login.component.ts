import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { form, FormField } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormField, ButtonComponent],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    private readonly loginModel = signal({ email: '', password: '' });
    protected readonly loginForm = form(this.loginModel);

    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    protected readonly canSubmit = computed(
        () => this.loginForm.email().value().trim() !== '' && this.loginForm.password().value() !== '',
    );

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this.loading()) return;

        this.loading.set(true);
        this.error.set(null);

        const { email, password } = this.loginModel();
        const { error } = await this.auth.signIn(email, password);

        this.loading.set(false);
        if (error) {
            this.error.set(this.messageFor(error.code));
        } else {
            await this.router.navigate(['/']);
        }
    }

    // TODO: Refactoriser les messages d'erreur et de validation
    private messageFor(code: string | undefined): string {
        switch (code) {
            case 'invalid_credentials':
                return 'Email ou mot de passe incorrect.';
            case 'email_not_confirmed':
                return 'Vérifie ta boîte mail pour confirmer ton compte.';
            default:
                return 'Connexion impossible, réessaie.';
        }
    }
}
