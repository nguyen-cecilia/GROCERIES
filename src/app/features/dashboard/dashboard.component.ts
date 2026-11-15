import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideArrowRight, LucideCopy, LucidePlus } from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../components/modal/modal.component';
import { GroceriesListUpdateComponent } from '../groceries-list/groceries-list-update.component';
import { ModalService } from '../../components/modal/modal.service';
import { BadgeAisleComponent } from '../../components/badge-aisle/badge-aisle.component';
import { GroceriesListService } from '../groceries-list/groceries-list.service';
import {
    GroceriesListItemView,
    GroceriesListWithItems,
} from '../groceries-list/groceries-list.model';
import { ArticleService } from '../article/article.service';
import { AisleService } from '../aisle/aisle.service';
import { formatDate } from '../../core/utils';
import { MESSAGES } from '../../core/messages';
import { MessageComponent } from '../../components/message/message.component';
import { CurrencyPipe } from '@angular/common';

type ListView = GroceriesListWithItems & {
    checked: number;
    total: number;
    progress: number;
    spent: number;
    remaining: number;
    lastUpdate: string;
};

@Component({
    selector: 'app-dashboard',
    imports: [
        ButtonComponent,
        LucidePlus,
        LucideArrowRight,
        LucideCopy,
        RouterLink,
        ModalComponent,
        GroceriesListUpdateComponent,
        BadgeAisleComponent,
        MessageComponent,
        CurrencyPipe,
    ],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    private readonly articleService = inject(ArticleService);
    private readonly aisleService = inject(AisleService);

    protected groceriesListService = inject(GroceriesListService);
    protected modalService = inject(ModalService);

    protected readonly messages = MESSAGES;

    protected readonly views = computed<ListView[]>(() =>
        this.groceriesListService.listsWithItems().map((list) => ({
            ...list,
            checked: this.groceriesListService.checkedCount(list),
            total: list.items.length,
            progress: this.groceriesListService.listProgress(list),
            spent: this.groceriesListService.listSpent(list),
            remaining: this.groceriesListService.listRemaining(list),
            lastUpdate: formatDate(list.updated_at),
        })),
    );

    protected readonly lastList = computed(() => this.views()[0] ?? null);
    protected readonly history = computed(() => this.views().slice(1));

    protected readonly stats = computed(() => {
        const lists = this.groceriesListService.listsWithItems();
        const remainingItems = lists.flatMap((list) => list.items).filter((item) => !item.checked);

        const byAisle = new Map<string, { aisle: GroceriesListItemView['aisle']; count: number }>();

        for (const item of remainingItems) {
            if (!item.aisle) continue;
            const entry = byAisle.get(item.aisle.id) ?? { aisle: item.aisle, count: 0 };
            entry.count += 1;
            byAisle.set(item.aisle.id, entry);
        }

        const heaviestAisle =
            [...byAisle.values()].sort((a, b) => b.count - a.count)[0]?.aisle ?? null;

        return {
            activeLists: lists.filter((list) => list.items.some((item) => !item.checked)).length,
            totalItems: lists.reduce((sum, list) => sum + list.items.length, 0),
            remainingItems: remainingItems.length,
            heaviestAisle,
        };
    });

    constructor() {
        void this.groceriesListService.load();
        void this.articleService.load();
        void this.aisleService.load();
    }
}
