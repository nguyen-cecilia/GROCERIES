import { Injectable, signal } from '@angular/core';
import { Article } from './article.model';
import { supabase } from '../../core/supabase';
import { MESSAGES } from '../../core/messages';

export type ArticleInput = { label: string; aisle_id: string | null; price: number | null };

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
        return supabase.from('sg_article').insert({
            label: input.label.trim(),
            aisle_id: input.aisle_id,
            price: input.price,
        });
    }

    async update(id: string, input: ArticleInput) {
        return supabase
            .from('sg_article')
            .update({
                label: input.label.trim(),
                aisle_id: input.aisle_id,
                price: input.price,
            })
            .eq('id', id);
    }

    async remove(id: string) {
        return supabase.from('sg_article').delete().eq('id', id);
    }
}
