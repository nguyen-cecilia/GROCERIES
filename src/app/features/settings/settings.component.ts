import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import {
    LucideChevronDown,
    LucideChevronsUpDown,
    LucideChevronUp,
    LucideLogOut,
    LucidePlus,
    LucideSave,
    LucideSlidersHorizontal,
} from '@lucide/angular';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { form, FormField } from '@angular/forms/signals';
import { ModalService } from '../../components/modal/modal.service';
import { ModalComponent } from '../../components/modal/modal.component';
import { AisleUpdateComponent } from '../aisle/aisle-update.component';
import { AisleService } from '../aisle/aisle.service';
import { InputSearchComponent } from '../../components/input-search/input-search.component';
import { ArticleUpdateComponent } from '../article/article-update.component';
import { BadgeAisleComponent } from '../../components/badge-aisle/badge-aisle.component';
import { QuantityUnitUpdateComponent } from '../quantity-unit/quantity-unit-update.component';

type accountTabs = 'account' | 'aisles' | 'articles' | 'quantityUnits';

@Component({
    selector: 'app-settings',
    imports: [
        ButtonComponent,
        LucideSave,
        LucidePlus,
        LucideLogOut,
        LucideChevronUp,
        LucideChevronDown,
        FormField,
        ModalComponent,
        AisleUpdateComponent,
        LucideSlidersHorizontal,
        LucideChevronsUpDown,
        InputSearchComponent,
        ArticleUpdateComponent,
        BadgeAisleComponent,
        QuantityUnitUpdateComponent,
    ],
    templateUrl: './settings.component.html',
})
export class SettingsComponent {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    protected readonly aislesService = inject(AisleService);
    protected modalService = inject(ModalService);

    readonly activePanel = signal<accountTabs>('account');

    protected readonly accountModel = signal({
        firstName: this.auth.user()?.user_metadata['firstName'] ?? '',
        email: this.auth.user()?.email ?? '',
        password: '',
        confirmPassword: '',
    });
    protected readonly accountForm = form(this.accountModel);

    protected readonly loading = signal(false);
    protected readonly savedMessage = signal<string | null>(null);
    protected readonly error = signal<string | null>(null);

    protected readonly canSubmit = computed(() => {
        const { firstName, email, password, confirmPassword } = this.accountModel();
        const passwordOk =
            password === '' || (password.length >= 6 && password === confirmPassword);
        return firstName.trim() !== '' && email.trim() !== '' && passwordOk;
    });

    constructor() {
        this.aislesService.load();
    }

    select(key: accountTabs): void {
        this.activePanel.set(key);
    }

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this.loading()) return;

        this.loading.set(true);
        this.error.set(null);
        this.savedMessage.set(null);

        const user = this.auth.user();
        const firstName = this.accountModel().firstName.trim();
        const email = this.accountModel().email.trim();
        const password = this.accountModel().password;

        const { error } = await this.auth.updateAccount({
            firstName: firstName !== user?.user_metadata['firstName'] ? firstName : undefined,
            email: email !== user?.email ? email : undefined,
            password: password || undefined,
        });

        this.loading.set(false);
        if (error) {
            // this.error.set(this.messageFor(error.code, error.message));
        } else {
            this.savedMessage.set('Profil mis à jour.');
            this.accountModel.update((m) => ({ ...m, password: '', confirmPassword: '' }));
        }
    }

    async signOut() {
        await this.auth.signOut();
        await this.router.navigate(['/connexion']);
    }
}
