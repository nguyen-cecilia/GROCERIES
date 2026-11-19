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
import { Article } from '../article/article.model';
import { normalizeLabel } from '../../core/utils';

export type ListInput = { label: string; budget: number; note: string };

export type AddItemInput = {
    label: string;
    aisleId: string | null;
    quantity: number;
    quantityUnitId: string | null;
};

export type UpdateItemInput = {
    label: string;
    aisleId: string | null;
    price: number | null;
    quantity: number;
    quantityUnitId: string | null;
};

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
                quantityUnit: article?.quantity_unit_id
                    ? (units.get(article.quantity_unit_id) ?? null)
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
            note: input.note.trim(),
        });
    }

    async update(id: string, input: ListInput) {
        return supabase
            .from('sg_groceries_list')
            .update({
                label: input.label.trim(),
                budget: input.budget,
                note: input.note.trim(),
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

    async addItem(listId: string, input: AddItemInput): Promise<{ error: string | null }> {
        const label = input.label.trim();
        if (!label) return { error: null };

        const existing = this.findArticle(label);
        let articleId: string;

        if (existing) {
            articleId = existing.id;

            if (
                existing.aisle_id !== input.aisleId ||
                existing.quantity_unit_id !== input.quantityUnitId
            ) {
                await this.articleService.update(existing.id, {
                    label: existing.label,
                    aisle_id: input.aisleId,
                    price: existing.price,
                    quantity_unit_id: input.quantityUnitId,
                });
            }
        } else {
            const { data, error } = await this.articleService.create({
                label,
                aisle_id: input.aisleId,
                price: null,
                quantity_unit_id: input.quantityUnitId,
            });
            if (error || !data) return { error: MESSAGES.groceriesList.addFailed };
            articleId = data.id;
        }

        const inList = this.itemsState().find(
            (item) => item.list_id === listId && item.article_id === articleId,
        );

        const { error } = inList
            ? await supabase
                .from('sg_groceries_list_item')
                .update({
                    quantity: Math.round((inList.quantity + input.quantity) * 1000) / 1000,
                })
                .eq('id', inList.id)
            : await supabase.from('sg_groceries_list_item').insert({
                list_id: listId,
                article_id: articleId,
                quantity: input.quantity,
            });

        if (error) return { error: MESSAGES.groceriesList.addFailed };

        await Promise.all([this.articleService.load(), this.load()]);
        return { error: null };
    }

    async addArticleToList(
        listId: string,
        articleId: string,
    ): Promise<{ error: string | null }> {
        const exists = this.itemsState().some(
            (item) => item.list_id === listId && item.article_id === articleId,
        );
        if (exists) return { error: null };

        const { error } = await supabase.from('sg_groceries_list_item').insert({
            list_id: listId,
            article_id: articleId,
            quantity: 1,
        });

        if (error) return { error: MESSAGES.groceriesList.addFailed };

        await this.load();
        return { error: null };
    }

    async updateItem(itemId: string, input: UpdateItemInput): Promise<{ error: string | null }> {
        const item = this.itemsState().find((i) => i.id === itemId);
        if (!item) return { error: MESSAGES.groceriesList.saveItemFailed };

        const label = input.label.trim();
        if (!label) return { error: null };

        let articleId = item.article_id;

        if (articleId) {
            const { error } = await this.articleService.update(articleId, {
                label,
                aisle_id: input.aisleId,
                price: input.price,
                quantity_unit_id: input.quantityUnitId,
            });
            if (error) return { error: MESSAGES.article.saveFailed };
        } else {
            const { data, error } = await this.articleService.create({
                label,
                aisle_id: input.aisleId,
                price: input.price,
                quantity_unit_id: input.quantityUnitId,
            });
            if (error || !data) return { error: MESSAGES.article.saveFailed };
            articleId = data.id;
        }

        const { error } = await supabase
            .from('sg_groceries_list_item')
            .update({
                article_id: articleId,
                quantity: input.quantity,
            })
            .eq('id', itemId);

        if (error) return { error: MESSAGES.groceriesList.saveItemFailed };

        await Promise.all([this.articleService.load(), this.load()]);
        return { error: null };
    }

    async removeItem(itemId: string): Promise<{ error: string | null }> {
        const { error } = await supabase
            .from('sg_groceries_list_item')
            .delete()
            .eq('id', itemId);

        if (error) return { error: MESSAGES.groceriesList.deleteItemFailed };

        await this.load();
        return { error: null };
    }

    async setItemChecked(itemId: string, checked: boolean): Promise<{ error: string | null }> {
        this.itemsState.update((items) =>
            items.map((item) => (item.id === itemId ? { ...item, checked } : item)),
        );

        const { error } = await supabase
            .from('sg_groceries_list_item')
            .update({ checked })
            .eq('id', itemId);

        if (error) {
            await this.load();
            return { error: MESSAGES.groceriesList.saveItemFailed };
        }

        return { error: null };
    }

    async setItemQuantity(itemId: string, quantity: number): Promise<{ error: string | null }> {
        this.itemsState.update((items) =>
            items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        );

        const { error } = await supabase
            .from('sg_groceries_list_item')
            .update({ quantity })
            .eq('id', itemId);

        if (error) {
            await this.load();
            return { error: MESSAGES.groceriesList.saveItemFailed };
        }

        return { error: null };
    }

    async setArticlePrice(articleId: string, price: number | null): Promise<{ error: string | null }> {
        const article = this.articleService.articles().find((a) => a.id === articleId);
        if (!article) return { error: MESSAGES.article.saveFailed };

        const { error } = await this.articleService.update(articleId, {
            label: article.label,
            aisle_id: article.aisle_id,
            price,
            quantity_unit_id: article.quantity_unit_id,
        });

        if (error) return { error: MESSAGES.article.saveFailed };

        await this.articleService.load();
        return { error: null };
    }

    findArticle(label: string): Article | null {
        const key = normalizeLabel(label);
        if (!key) return null;
        return this.articleService.articles().find((a) => normalizeLabel(a.label) === key) ?? null;
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
