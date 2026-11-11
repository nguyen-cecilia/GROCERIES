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
    LucideTrendingDown,
    LucideTrendingUp,
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
import { ArticleService } from '../article/article.service';
import { CurrencyPipe } from '@angular/common';
import { Article } from '../article/article.model';
import { Aisle } from '../aisle/aisle.model';

type AccountTabs = 'account' | 'aisles' | 'articles' | 'quantityUnits';
type SortKey = 'label' | 'aisle' | 'price';
type SortDir = 'asc' | 'desc';
type ArticleWithAisle = Article & { aisle: Aisle | null };

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
        CurrencyPipe,
        LucideTrendingDown,
        LucideTrendingUp,
    ],
    templateUrl: './settings.component.html',
})
export class SettingsComponent {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    protected readonly aisleService = inject(AisleService);
    protected readonly quantityUnitService = inject(QuantityUnitService);
    protected readonly articleService = inject(ArticleService);
    protected modalService = inject(ModalService);

    readonly activePanel = signal<AccountTabs>('account');

    protected readonly accountModel = signal({
        firstName: this.auth.user()?.user_metadata['firstName'] ?? '',
        email: this.auth.user()?.email ?? '',
        password: '',
        confirmPassword: '',
    });
    protected readonly accountForm = form(this.accountModel);

    protected readonly messages = MESSAGES;
    protected readonly search = signal('');
    protected readonly loading = signal(false);
    protected readonly success = signal<string | null>(null);
    protected readonly error = signal<string | null>(null);
    protected readonly passwordMismatch = computed(() => {
        const { password, confirmPassword } = this.accountModel();
        return password !== '' && password !== confirmPassword
            ? MESSAGES.account.passwordMismatch
            : null;
    });
    protected readonly sort = signal<{ key: SortKey; dir: SortDir }>({
        key: 'label',
        dir: 'asc',
    });

    protected readonly canSubmit = computed(() => {
        const { firstName, email, password, confirmPassword } = this.accountModel();
        const passwordOk =
            password === '' || (password.length >= 6 && password === confirmPassword);
        return firstName.trim() !== '' && email.trim() !== '' && passwordOk;
    });

    protected toggleSort(key: SortKey): void {
        const current = this.sort();
        this.sort.set(
            current.key === key
                ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
                : { key, dir: 'asc' },
        );
    }

    protected ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
        const { key: active, dir } = this.sort();
        if (active !== key) return 'none';
        return dir === 'asc' ? 'ascending' : 'descending';
    }

    protected readonly articles = computed(() => {
        const byId = new Map(this.aisleService.aisles().map((a) => [a.id, a]));
        return this.articleService.articles().map((article) => ({
            ...article,
            aisle: article.aisle_id ? (byId.get(article.aisle_id) ?? null) : null,
        }));
    });

    protected readonly filteredArticles = computed(() => {
        const raw = this.search().trim();
        const query = this.normalizeSearch(raw);
        const price = this.parsePrice(raw);
        const { key, dir } = this.sort();

        const visible = this.articles().filter((article) => {
            if (!query) return true;

            const matchesText =
                this.normalizeSearch(article.label).includes(query) ||
                this.normalizeSearch(article.aisle?.label ?? '').includes(query);

            if (matchesText) return true;
            if (price === null || article.price === null) return false;

            return Math.round(article.price * 100) === Math.round(price * 100);
        });

        return [...visible].sort((a, b) => this.compareArticles(a, b, key, dir));
    });

    constructor() {
        void this.aisleService.load();
        void this.articleService.load();
        void this.quantityUnitService.load();
    }

    select(key: AccountTabs): void {
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

    private normalizeSearch(value: string): string {
        return value
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase();
    }

    private parsePrice(raw: string): number | null {
        const cleaned = raw.replace(/[\s€]/g, '').replace(',', '.');
        if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;

        const value = Number(cleaned);
        return Number.isFinite(value) ? value : null;
    }

    private compareArticles(
        a: ArticleWithAisle,
        b: ArticleWithAisle,
        key: SortKey,
        dir: SortDir,
    ): number {
        const factor = dir === 'asc' ? 1 : -1;

        switch (key) {
            case 'label':
                return factor * a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' });

            case 'aisle': {
                const left = a.aisle?.label ?? null;
                const right = b.aisle?.label ?? null;
                if (left === null || right === null) return this.nullsLast(left, right);
                return factor * left.localeCompare(right, 'fr', { sensitivity: 'base' });
            }

            case 'price': {
                if (a.price === null || b.price === null) return this.nullsLast(a.price, b.price);
                return factor * (a.price - b.price);
            }
        }
    }

    private nullsLast(a: unknown, b: unknown): number {
        if (a === null && b === null) return 0;
        return a === null ? 1 : -1;
    }
}
