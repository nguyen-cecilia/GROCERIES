import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideSave, LucideTrash } from '@lucide/angular';
import { InputPriceComponent } from '../../components/input-price/input-price.component';
import { SelectComponent, SelectOption } from '../../components/select/select.component';
import { Article } from './article.model';
import { ModalService } from '../../components/modal/modal.service';
import { ArticleService } from './article.service';
import { AISLE_COLOR_FALLBACK, aisleColorHex } from '../../core/aisle-colors';
import { form, FormField } from '@angular/forms/signals';
import { MESSAGES } from '../../core/messages';
import { AisleService } from '../aisle/aisle.service';
import { MessageComponent } from '../../components/message/message.component';
import { CurrencyPipe } from '@angular/common';

type ArticleFormModel = {
    label: Article['label'];
    aisle_id: Article['aisle_id'];
    price: Article['price'];
};

@Component({
    selector: 'app-article-update',
    imports: [
        ButtonComponent,
        LucideSave,
        LucideTrash,
        InputPriceComponent,
        SelectComponent,
        FormField,
        MessageComponent,
        CurrencyPipe,
    ],
    templateUrl: './article-update.component.html',
})
export class ArticleUpdateComponent {
    readonly editing = input<Article | null>(null);

    private readonly articleService = inject(ArticleService);
    private readonly aisleService = inject(AisleService);
    private readonly modalService = inject(ModalService);

    protected readonly lastPrice = computed(() => this.editing()?.last_price ?? null);
    protected readonly aisleOptions = computed<SelectOption[]>(() => [
        { value: '', label: 'Aucun rayon', color: AISLE_COLOR_FALLBACK },
        ...this.aisleService.aisles().map((aisle) => ({
            value: aisle.id,
            label: aisle.label,
            color: aisleColorHex(aisle.color),
        })),
    ]);
    protected readonly model = signal<ArticleFormModel>({
        label: '',
        aisle_id: null,
        price: 0,
    });
    protected readonly form = form(this.model);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    constructor() {
        effect(() => {
            if (this.modalService.article.isOpen() && this.aisleService.aisles().length === 0) {
                void this.aisleService.load();
            }
        });

        effect(() => {
            const article = this.editing();
            if (this.modalService.article.isOpen()) {
                this.model.set({
                    label: article?.label ?? '',
                    aisle_id: article?.aisle_id ?? '',
                    price: article?.price ?? null,
                });
                this.error.set(null);
            }
        });
    }

    protected readonly canSubmit = computed(
        () => this.model().label.trim() !== '' && this.model().price !== undefined,
    );

    protected applyLastPrice(): void {
        const lastPrice = this.editing()?.last_price ?? null;
        if (lastPrice === null) return;

        this.model.update((m) => ({ ...m, price: lastPrice }));
    }

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this.loading()) return;
        this.loading.set(true);
        this.error.set(null);

        const { label, aisle_id, price } = this.model();
        const input = {
            label: label.trim(),
            aisle_id: aisle_id === '' ? null : aisle_id,
            price,
        };
        const article = this.editing();
        const { error: err } = article
            ? await this.articleService.update(article.id, input)
            : await this.articleService.create(input);

        this.loading.set(false);
        if (err) {
            this.error.set(MESSAGES.article.saveFailed);
            return;
        }
        this.modalService.article.close();
        await this.articleService.load();
    }

    async onDelete() {
        const article = this.editing();
        if (!article || this.loading()) return;
        this.loading.set(true);
        const { error } = await this.articleService.remove(article.id);
        this.loading.set(false);
        if (!error) {
            this.modalService.article.close();
            await this.articleService.load();
        } else {
            this.error.set(MESSAGES.article.deleteFailed);
        }
    }
}
