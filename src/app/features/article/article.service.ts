import { Injectable, signal } from '@angular/core';
import { Article } from './article.model';
import { supabase } from '../../core/supabase';
import { MESSAGES } from '../../core/messages';

export type ArticleInput = {
    label: string;
    aisle_id: string | null;
    price: number | null;
    quantity_unit_id: string | null;
};

@Injectable({ providedIn: 'root' })
export class ArticleService {
    private readonly articlesState = signal<Article[]>([]);

    readonly articles = this.articlesState.asReadonly();
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    async load() {
        this.loading.set(true);
        this.error.set(null);
        const { data, error } = await supabase.from('sg_article').select('*').order('label');
        this.loading.set(false);
        if (error) {
            this.error.set(MESSAGES.article.loadFailed);
            return;
        }
        this.articlesState.set(data ?? []);
    }

    async create(input: ArticleInput) {
        return supabase
            .from('sg_article')
            .insert({
                label: input.label.trim(),
                aisle_id: input.aisle_id,
                price: input.price,
                quantity_unit_id: input.quantity_unit_id,
            })
            .select()
            .single();
    }

    async update(id: string, input: ArticleInput) {
        return supabase
            .from('sg_article')
            .update({
                label: input.label.trim(),
                aisle_id: input.aisle_id,
                price: input.price,
                quantity_unit_id: input.quantity_unit_id,
            })
            .eq('id', id);
    }

    async remove(id: string) {
        const { error: itemsError } = await supabase
            .from('sg_groceries_list_item')
            .delete()
            .eq('article_id', id);

        if (itemsError) return { error: itemsError };

        return supabase.from('sg_article').delete().eq('id', id);
    }
}
