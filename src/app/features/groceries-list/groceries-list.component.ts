import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import {
    LucideBrushCleaning,
    LucideChevronDown,
    LucideChevronLeft,
    LucidePencil,
    LucidePlus,
    LucideRotateCcw,
    LucideSlidersHorizontal, LucideX,
} from '@lucide/angular';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BadgeAisleComponent } from '../../components/badge-aisle/badge-aisle.component';
import { InputPriceComponent } from '../../components/input-price/input-price.component';
import { InputQuantityComponent } from '../../components/input-quantity/input-quantity.component';
import { SelectComponent } from '../../components/select/select.component';
import { GroceriesListUpdateComponent } from './groceries-list-update.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalService } from '../../components/modal/modal.service';
import { ArticleUpdateComponent } from '../article/article-update.component';
import { QuantityUnitService } from '../quantity-unit/quantity-unit.service';
import { GroceriesListService } from './groceries-list.service';
import { ArticleService } from '../article/article.service';
import { AisleService } from '../aisle/aisle.service';
import { MESSAGES } from '../../core/messages';
import { GroceriesListItemView, GroceriesListWithItems } from './groceries-list.model';
import { AisleColorKey } from '../../core/aisle-colors';
import { MessageComponent } from '../../components/message/message.component';
import { formatDate } from '../../core/date';
import { CurrencyPipe } from '@angular/common';

type ItemGroup = {
    key: string;
    label: string;
    color: AisleColorKey | null;
    items: GroceriesListItemView[];
    checked: number;
    total: number;
};

@Component({
    selector: 'app-groceries-list',
    imports: [
        ButtonComponent,
        LucideChevronLeft,
        RouterLink,
        LucideRotateCcw,
        LucidePlus,
        LucideChevronDown,
        LucidePencil,
        LucideBrushCleaning,
        BadgeAisleComponent,
        InputPriceComponent,
        LucideSlidersHorizontal,
        InputQuantityComponent,
        SelectComponent,
        GroceriesListUpdateComponent,
        ModalComponent,
        ArticleUpdateComponent,
        MessageComponent,
        CurrencyPipe,
        LucideX,
    ],
    templateUrl: './groceries-list.component.html',
})
export class GroceriesListComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly articleService = inject(ArticleService);
    private readonly aisleService = inject(AisleService);
    private readonly quantityUnitService = inject(QuantityUnitService);

    protected groceriesListService = inject(GroceriesListService);
    protected modalService = inject(ModalService);
    protected readonly messages = MESSAGES;
    protected readonly formatDate = formatDate;

    protected readonly resetting = signal(false);
    protected readonly clearing = signal(false);
    protected readonly confirmingClear = signal(false);
    protected readonly error = signal<string | null>(null);

    protected readonly listId = this.route.snapshot.paramMap.get('id') ?? '';

    protected readonly list = computed<GroceriesListWithItems | null>(
        () => this.groceriesListService.listsWithItems().find((l) => l.id === this.listId) ?? null,
    );

    protected readonly groups = computed<ItemGroup[]>(() => {
        const list = this.list();
        if (!list) return [];

        const byAisle = new Map<string, GroceriesListItemView[]>();

        for (const item of list.items) {
            const key = item.aisle?.id ?? '';
            const bucket = byAisle.get(key) ?? [];
            bucket.push(item);
            byAisle.set(key, bucket);
        }

        const groups: ItemGroup[] = [];

        for (const aisle of this.aisleService.aisles()) {
            const items = byAisle.get(aisle.id);
            if (!items?.length) continue;

            groups.push({
                key: aisle.id,
                label: aisle.label,
                color: aisle.color,
                items: this.sortItems(items),
                checked: items.filter((item) => item.checked).length,
                total: items.length,
            });
        }

        const orphans = byAisle.get('');
        if (orphans?.length) {
            groups.push({
                key: 'none',
                label: 'Aucun rayon',
                color: null,
                items: this.sortItems(orphans),
                checked: orphans.filter((item) => item.checked).length,
                total: orphans.length,
            });
        }

        return groups;
    });

    protected readonly totals = computed(() => {
        const list = this.list();
        const items = list?.items ?? [];
        const checked = items.filter((item) => item.checked);
        const remaining = items.filter((item) => !item.checked);

        const priceOf = (item: GroceriesListItemView) => (item.article?.price ?? 0) * item.quantity;

        const spent = checked.reduce((sum, item) => sum + priceOf(item), 0);
        const planned = remaining.reduce((sum, item) => sum + priceOf(item), 0);
        const budget = list?.budget ?? 0;

        return {
            spent,
            planned,
            budget,
            checked: checked.length,
            remaining: remaining.length,
            total: items.length,
            progress: items.length === 0 ? 0 : checked.length / items.length,
        };
    });

    protected readonly hasChecked = computed(() => this.totals().checked > 0);
    protected readonly hasItems = computed(() => this.totals().total > 0);

    constructor() {
        void this.groceriesListService.load();
        void this.articleService.load();
        void this.aisleService.load();
        void this.quantityUnitService.load();
    }

    protected async resetItems(): Promise<void> {
        const list = this.list();
        if (!list || this.resetting()) return;

        this.resetting.set(true);
        this.error.set(null);

        const { error: err } = await this.groceriesListService.resetItems(list.id);

        this.resetting.set(false);

        if (err) {
            this.error.set(MESSAGES.groceriesList.resetFailed);
            return;
        }

        await this.groceriesListService.load();
    }

    protected async clearItems(): Promise<void> {
        const list = this.list();
        if (!list || this.clearing()) return;

        this.clearing.set(true);
        this.error.set(null);

        const { error: err } = await this.groceriesListService.clearItems(list.id);

        this.clearing.set(false);
        this.confirmingClear.set(false);

        if (err) {
            this.error.set(MESSAGES.groceriesList.clearFailed);
            return;
        }

        await this.groceriesListService.load();
    }

    private sortItems(items: GroceriesListItemView[]): GroceriesListItemView[] {
        return [...items].sort((a, b) =>
            (a.article?.label ?? '').localeCompare(b.article?.label ?? '', 'fr', {
                sensitivity: 'base',
            }),
        );
    }
}
