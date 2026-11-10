import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import {
    LucideCalculator,
    LucideChevronDown,
    LucideChevronsUpDown,
    LucideChevronUp,
    LucideLogOut,
    LucidePlus,
    LucideSave,
    LucideScale,
    LucideSlidersHorizontal,
    LucideStar,
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
import { MESSAGES, supabaseMessage } from '../../core/messages';
import { MessageComponent } from '../../components/message/message.component';
import { QuantityUnitService } from '../quantity-unit/quantity-unit.service';

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
        LucideStar,
        LucideCalculator,
        LucideScale,
        MessageComponent,
    ],
    templateUrl: './settings.component.html',
})
export class SettingsComponent {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    protected readonly aisleService = inject(AisleService);
    protected readonly quantityUnitService = inject(QuantityUnitService);
    protected modalService = inject(ModalService);

    readonly activePanel = signal<accountTabs>('account');

    protected readonly accountModel = signal({
        firstName: this.auth.user()?.user_metadata['firstName'] ?? '',
        email: this.auth.user()?.email ?? '',
        password: '',
        confirmPassword: '',
    });
    protected readonly accountForm = form(this.accountModel);

    protected readonly messages = MESSAGES;
    protected readonly loading = signal(false);
    protected readonly success = signal<string | null>(null);
    protected readonly error = signal<string | null>(null);
    protected readonly passwordMismatch = computed(() => {
        const { password, confirmPassword } = this.accountModel();
        return password !== '' && password !== confirmPassword
            ? MESSAGES.account.passwordMismatch
            : null;
    });

    protected readonly canSubmit = computed(() => {
        const { firstName, email, password, confirmPassword } = this.accountModel();
        const passwordOk =
            password === '' || (password.length >= 6 && password === confirmPassword);
        return firstName.trim() !== '' && email.trim() !== '' && passwordOk;
    });

    constructor() {
        void this.aisleService.load();
        void this.quantityUnitService.load();
    }

    select(key: accountTabs): void {
        this.activePanel.set(key);
    }

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this.loading()) return;

        this.loading.set(true);
        this.error.set(null);
        this.success.set(null);

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
            this.error.set(supabaseMessage(error.code, MESSAGES.account.saveFailed));
        } else {
            this.success.set(MESSAGES.account.saved);
            this.accountModel.update((m) => ({ ...m, password: '', confirmPassword: '' }));
        }
    }

    async signOut() {
        await this.auth.signOut();
        await this.router.navigate(['/connexion']);
    }
}
