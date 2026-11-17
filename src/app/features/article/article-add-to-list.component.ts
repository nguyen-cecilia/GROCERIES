import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideListPlus } from '@lucide/angular';
import { SelectComponent, SelectOption } from '../../components/select/select.component';
import { MessageComponent } from '../../components/message/message.component';
import { ModalService } from '../../components/modal/modal.service';
import { GroceriesListService } from '../groceries-list/groceries-list.service';
import { Article } from './article.model';
import { MESSAGES } from '../../core/messages';
import { BadgeAisleComponent } from '../../components/badge-aisle/badge-aisle.component';
import { AisleService } from '../aisle/aisle.service';

@Component({
    selector: 'app-article-add-to-list',
    imports: [
        ButtonComponent,
        LucideListPlus,
        SelectComponent,
        MessageComponent,
        BadgeAisleComponent,
    ],
    templateUrl: './article-add-to-list.component.html',
})
export class ArticleAddToListComponent {
    readonly editing = input<Article | null>(null);

    private readonly modalService = inject(ModalService);
    private readonly aisleService = inject(AisleService);
    protected readonly groceriesListService = inject(GroceriesListService);

    protected readonly selectedListId = signal<string | null>(null);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);
    protected readonly messages = MESSAGES;

    protected readonly options = computed<SelectOption[]>(() => {
        const articleId = this.editing()?.id;
        if (!articleId) return [];

        const present = new Set(
            this.groceriesListService
                .items()
                .filter((item) => item.article_id === articleId)
                .map((item) => item.list_id),
        );

        return this.groceriesListService
            .lists()
            .filter((list) => !present.has(list.id))
            .sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' }))
            .map((list) => ({ value: list.id, label: list.label }));
    });

    protected readonly aisle = computed(() => {
        const aisleId = this.editing()?.aisle_id;
        if (!aisleId) return null;

        return this.aisleService.aisles().find((aisle) => aisle.id === aisleId) ?? null;
    });

    constructor() {
        effect(() => {
            if (this.modalService.articleToList.isOpen()) {
                this.selectedListId.set(null);
                this.error.set(null);
            }
        });
    }

    async onSubmit(event: Event): Promise<void> {
        event.preventDefault();

        const article = this.editing();
        const listId = this.selectedListId();
        if (!article || !listId || this.loading()) return;

        this.loading.set(true);
        this.error.set(null);

        const { error } = await this.groceriesListService.addArticleToList(listId, article.id);

        this.loading.set(false);

        if (error) {
            this.error.set(error);
            return;
        }

        this.modalService.articleToList.close();
    }
}
