import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import {
    LucideBrushCleaning,
    LucideChevronLeft,
    LucideChevronUp,
    LucidePencil,
    LucidePlus,
    LucideRotateCcw,
    LucideSlidersHorizontal, LucideX,
} from '@lucide/angular';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BadgeAisleComponent } from '../../components/badge-aisle/badge-aisle.component';
import { InputPriceComponent } from '../../components/input-price/input-price.component';
import { InputQuantityComponent } from '../../components/input-quantity/input-quantity.component';
import { SelectComponent, SelectOption } from '../../components/select/select.component';
import { GroceriesListUpdateComponent } from './groceries-list-update.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalService } from '../../components/modal/modal.service';
import { QuantityUnitService } from '../quantity-unit/quantity-unit.service';
import { GroceriesListService } from './groceries-list.service';
import { ArticleService } from '../article/article.service';
import { AisleService } from '../aisle/aisle.service';
import { MESSAGES } from '../../core/messages';
import { GroceriesListItemView, GroceriesListWithItems } from './groceries-list.model';
import { aisleColorHex, AisleColorKey } from '../../core/aisle-colors';
import { MessageComponent } from '../../components/message/message.component';
import { ToastService } from '../../components/toast/toast.service';
import { formatDate } from '../../core/utils';
import { CurrencyPipe } from '@angular/common';
import { AutocompleteOption, InputAutocompleteComponent } from '../../components/input-autocomplete/input-autocomplete.component';
import { GroceriesListItemUpdateComponent } from './groceries-list-item-update.component';

type ItemGroup = {
    key: string;
    label: string;
    color: AisleColorKey | null;
    items: GroceriesListItemView[];
    checked: number;
    total: number;
};

type AddItemModel = {
    label: string;
    aisle_id: string;
    quantity: number;
    quantity_unit_id: string;
};

type AisleChoice = {
    id: string;
    label: string;
    color: AisleColorKey | null;
};

@Component({
    selector: 'app-groceries-list',
    imports: [
        ButtonComponent,
        LucideChevronLeft,
        RouterLink,
        LucideRotateCcw,
        LucidePlus,
        LucidePencil,
        LucideBrushCleaning,
        BadgeAisleComponent,
        InputPriceComponent,
        LucideSlidersHorizontal,
        InputQuantityComponent,
        SelectComponent,
        GroceriesListUpdateComponent,
        ModalComponent,
        MessageComponent,
        CurrencyPipe,
        LucideX,
        InputAutocompleteComponent,
        GroceriesListItemUpdateComponent,
        LucideChevronUp,
    ],
    templateUrl: './groceries-list.component.html',
})
export class GroceriesListComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly articleService = inject(ArticleService);
    private readonly aisleService = inject(AisleService);
    private readonly quantityUnitService = inject(QuantityUnitService);
    private readonly toast = inject(ToastService);

    protected groceriesListService = inject(GroceriesListService);
    protected modalService = inject(ModalService);
    protected readonly messages = MESSAGES;
    protected readonly formatDate = formatDate;

    protected readonly model = signal<AddItemModel>({
        label: '',
        aisle_id: '',
        quantity: 1,
        quantity_unit_id: '',
    });
    protected readonly adding = signal(false);
    protected readonly resetting = signal(false);
    protected readonly clearing = signal(false);
    protected readonly openingTotals = signal(false);
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

    protected readonly articleOptions = computed<AutocompleteOption[]>(() => {
        const aisles = new Map(this.aisleService.aisles().map((a) => [a.id, a]));

        return this.articleService.articles().map((article) => {
            const aisle = article.aisle_id ? aisles.get(article.aisle_id) : undefined;

            return {
                value: article.label,
                hint: aisle?.label,
                hintColor: aisle ? aisleColorHex(aisle.color) : undefined,
            };
        });
    });

    protected readonly unitOptions = computed<SelectOption[]>(() => [
        { value: '', label: 'Aucune unité' },
        ...this.quantityUnitService.quantityUnits().map((u) => ({
            value: u.id,
            label: u.label,
        })),
    ]);

    protected readonly aisleChoices = computed<AisleChoice[]>(() => [
        { id: '', label: 'Aucun rayon', color: null },
        ...this.aisleService.aisles().map((aisle) => ({
            id: aisle.id,
            label: aisle.label,
            color: aisle.color,
        })),
    ]);

    protected readonly canSubmit = computed(() => this.model().label.trim() !== '');

    protected readonly totals = computed(() => {
        const list = this.list();
        const items = list?.items ?? [];
        const checked = items.filter((item) => item.checked);
        const remaining = items.filter((item) => !item.checked);

        const priceOf = (item: GroceriesListItemView) =>
            (item.article?.price ?? 0) * item.quantity;

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

        this.toast.success(MESSAGES.groceriesList.itemsReset);
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

        this.toast.success(MESSAGES.groceriesList.itemsCleared);
        await this.groceriesListService.load();
    }

    protected setLabel(label: string): void {
        const match = this.groceriesListService.findArticle(label);
        this.model.update((m) => ({
            ...m,
            label,
            aisle_id: match ? (match.aisle_id ?? '') : label.trim() ? m.aisle_id : '',
            quantity_unit_id: match
                ? (match.quantity_unit_id ?? '')
                : label.trim()
                  ? m.quantity_unit_id
                  : '',
        }));
    }

    protected setUnit(unitId: string | null): void {
        this.model.update((m) => ({ ...m, quantity_unit_id: unitId ?? '' }));
    }

    protected setQuantity(quantity: number): void {
        this.model.update((m) => ({ ...m, quantity }));
    }

    protected toggleAisle(aisleId: string): void {
        this.model.update((m) => ({ ...m, aisle_id: m.aisle_id === aisleId ? '' : aisleId }));
    }

    protected badgeAisleClass(choice: AisleChoice): string {
        const base =
            'rounded-full cursor-pointer px-2.5 lg:px-4 py-1.5 lg:py-2 border flex items-center gap-2 transition-all';
        return this.model().aisle_id === choice.id
            ? `${base} border-ink bg-ink text-canvas`
            : `${base} border-line bg-surface hover:border-ink`;
    }

    protected async addItem(event: Event): Promise<void> {
        event.preventDefault();
        const list = this.list();
        if (!list || this.adding()) return;

        this.adding.set(true);
        this.error.set(null);

        const { label, aisle_id, quantity, quantity_unit_id } = this.model();
        const { error } = await this.groceriesListService.addItem(list.id, {
            label,
            aisleId: aisle_id === '' ? null : aisle_id,
            quantity,
            quantityUnitId: quantity_unit_id === '' ? null : quantity_unit_id,
        });

        this.adding.set(false);

        if (error) {
            this.error.set(error);
            return;
        }

        this.toast.success(MESSAGES.groceriesList.itemAdded);
        this.model.set({
            label: '',
            aisle_id: '',
            quantity: 1,
            quantity_unit_id: '',
        });
    }

    protected resetItemForm(): void {
        this.model.set({
            label: '',
            aisle_id: '',
            quantity: 1,
            quantity_unit_id: '',
        });
    }

    protected toggleTotals(): void {
        this.openingTotals.update((open) => !open);
    }

    protected async toggleChecked(item: GroceriesListItemView, event: Event): Promise<void> {
        const checked = (event.target as HTMLInputElement).checked;
        const { error } = await this.groceriesListService.setItemChecked(item.id, checked);
        if (error) this.error.set(error);
    }

    protected async setItemQuantity(item: GroceriesListItemView, quantity: number): Promise<void> {
        if (quantity === item.quantity) return;
        const { error } = await this.groceriesListService.setItemQuantity(item.id, quantity);
        if (error) this.error.set(error);
        this.toast.success(MESSAGES.groceriesList.quantityUpdated);
    }

    protected async setItemPrice(item: GroceriesListItemView, price: number | null): Promise<void> {
        const article = item.article;
        if (!article || price === article.price) return;
        const { error } = await this.groceriesListService.setArticlePrice(article.id, price);
        if (error) this.error.set(error);
        this.toast.success(MESSAGES.groceriesList.priceUpdated);
    }

    protected async applyLastPrice(item: GroceriesListItemView): Promise<void> {
        const lastPrice = item.article?.last_price ?? null;
        if (lastPrice === null) return;
        await this.setItemPrice(item, lastPrice);
    }

    private sortItems(items: GroceriesListItemView[]): GroceriesListItemView[] {
        return [...items].sort((a, b) =>
            (a.article?.label ?? '').localeCompare(b.article?.label ?? '', 'fr', {
                sensitivity: 'base',
            }),
        );
    }
}
