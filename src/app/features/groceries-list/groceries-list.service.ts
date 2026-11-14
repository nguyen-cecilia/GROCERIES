import { computed, inject, Injectable, signal } from '@angular/core';
import {
    GroceriesList,
    GroceriesListItem,
    GroceriesListItemView,
    GroceriesListWithItems,
} from './groceries-list.model';
import { supabase } from '../../core/supabase';
import { MESSAGES } from '../../core/messages';
import { ArticleService } from '../article/article.service';
import { AisleService } from '../aisle/aisle.service';
import { QuantityUnitService } from '../quantity-unit/quantity-unit.service';

export type ListInput = { label: string; budget: number };

@Injectable({ providedIn: 'root' })
export class GroceriesListService {
    private readonly articleService = inject(ArticleService);
    private readonly aisleService = inject(AisleService);
    private readonly quantityUnitService = inject(QuantityUnitService);

    private readonly listsState = signal<GroceriesList[]>([]);
    private readonly itemsState = signal<GroceriesListItem[]>([]);

    readonly lists = this.listsState.asReadonly();
    readonly items = this.itemsState.asReadonly();
    readonly loading = signal(false);
    readonly duplicating = signal<string | null>(null);
    readonly error = signal<string | null>(null);

    readonly listsWithItems = computed<GroceriesListWithItems[]>(() => {
        const articles = new Map(this.articleService.articles().map((a) => [a.id, a]));
        const aisles = new Map(this.aisleService.aisles().map((a) => [a.id, a]));
        const units = new Map(this.quantityUnitService.quantityUnits().map((u) => [u.id, u]));

        const byList = new Map<string, GroceriesListItemView[]>();

        for (const item of this.itemsState()) {
            const article = item.article_id ? (articles.get(item.article_id) ?? null) : null;
            const view: GroceriesListItemView = {
                ...item,
                article,
                aisle: article?.aisle_id ? (aisles.get(article.aisle_id) ?? null) : null,
                quantityUnit: item.quantity_unit_id
                    ? (units.get(item.quantity_unit_id) ?? null)
                    : null,
            };

            const bucket = byList.get(item.list_id) ?? [];
            bucket.push(view);
            byList.set(item.list_id, bucket);
        }

        return this.listsState().map((list) => ({
            ...list,
            items: byList.get(list.id) ?? [],
        }));
    });

    async load() {
        this.loading.set(true);
        this.error.set(null);

        const [lists, items] = await Promise.all([
            supabase
                .from('sg_groceries_list')
                .select('*')
                .order('updated_at', { ascending: false }),
            supabase.from('sg_groceries_list_item').select('*'),
        ]);

        this.loading.set(false);

        if (lists.error || items.error) {
            this.error.set(MESSAGES.groceriesList.loadFailed);
            return;
        }

        this.listsState.set(lists.data ?? []);
        this.itemsState.set(items.data ?? []);
    }

    async duplicate(id: string): Promise<string | null> {
        if (this.duplicating()) return null;

        this.duplicating.set(id);
        this.error.set(null);

        const { data, error } = await supabase.rpc('sg_duplicate_groceries_list', {
            p_list_id: id,
        });

        this.duplicating.set(null);

        if (error || !data) {
            this.error.set(MESSAGES.groceriesList.duplicateFailed);
            return null;
        }

        await this.load();
        return data;
    }

    async create(input: ListInput) {
        return supabase.from('sg_groceries_list').insert({
            label: input.label.trim(),
            budget: input.budget,
        });
    }

    async update(id: string, input: ListInput) {
        return supabase
            .from('sg_groceries_list')
            .update({
                label: input.label.trim(),
                budget: input.budget,
            })
            .eq('id', id);
    }

    async remove(id: string) {
        return supabase.from('sg_groceries_list').delete().eq('id', id);
    }

    async resetItems(listId: string) {
        return supabase
            .from('sg_groceries_list_item')
            .update({ checked: false })
            .eq('list_id', listId);
    }

    async clearItems(listId: string) {
        return supabase.from('sg_groceries_list_item').delete().eq('list_id', listId);
    }

    checkedCount(list: GroceriesListWithItems): number {
        return list.items.filter((item) => item.checked).length;
    }

    listProgress(list: GroceriesListWithItems): number {
        return list.items.length === 0 ? 0 : this.checkedCount(list) / list.items.length;
    }

    listSpent(list: GroceriesListWithItems): number {
        return list.items
            .filter((item) => item.checked)
            .reduce((sum, item) => sum + (item.article?.price ?? 0) * item.quantity, 0);
    }

    listRemaining(list: GroceriesListWithItems): number {
        return list.budget - this.listSpent(list);
    }
}
