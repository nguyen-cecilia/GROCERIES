import { Injectable, signal } from '@angular/core';
import { supabase } from '../../core/supabase';
import { Aisle } from './aisle.model';

export type AisleInput = { label: string; color: string };
export const AISLE_COLORS = [
    '#9b84b5',
    '#6087be',
    '#4bbcc0',
    '#4f937f',
    '#547951',
    '#c5e397',
    '#d5a332',
    '#d57b32',
    '#c94b32',
    '#c47a86',
    '#8a5a3b',
    '#8b99a8',
];

@Injectable({ providedIn: 'root' })
export class AisleService {
    private readonly aislesState = signal<Aisle[]>([]);

    readonly aisles = this.aislesState.asReadonly();
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly reordering = signal(false);

    async load() {
        this.loading.set(true);
        this.error.set(null);
        const { data, error } = await supabase
            .from('sg_aisle')
            .select('*')
            .order('position')
            .order('label');
        this.loading.set(false);
        if (error) {
            this.error.set('Impossible de charger les rayons.');
            return;
        }
        this.aislesState.set(data ?? []);
    }

    async create(input: AisleInput) {
        const nextPosition = this.aislesState()
            .reduce((max, a) => Math.max(max, a.position), -1) + 1;
        return supabase.from('sg_aisle').insert({
            label: input.label.trim(),
            color: input.color,
            position: nextPosition,
        });
    }

    update(id: string, input: AisleInput) {
        return supabase.from('sg_aisle').update({
            label: input.label.trim(),
            color: input.color,
        }).eq('id', id);
    }

    remove(id: string) {
        return supabase.from('sg_aisle').delete().eq('id', id);
    }

    async move(id: string, direction: 'up' | 'down') {
        if (this.reordering()) return;

        const ordered = [...this.aislesState()];
        const index = ordered.findIndex((a) => a.id === id);
        const target = direction === 'up' ? index - 1 : index + 1;
        if (index === -1 || target < 0 || target >= ordered.length) return;

        [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

        this.reordering.set(true);
        this.aislesState.set(ordered.map((a, position) => ({ ...a, position })));

        const ok = await this.persistOrder(ordered);
        this.reordering.set(false);
        if (!ok) {
            await this.load();
        }
    }

    private async persistOrder(ordered: Aisle[]): Promise<boolean> {
        const updates = ordered
            .map((a, position) => ({ id: a.id, position, current: a.position }))
            .filter(({ position, current }) => position !== current);

        const results = await Promise.all(
            updates.map(({ id, position }) =>
                supabase.from('sg_aisle').update({ position }).eq('id', id),
            ),
        );

        return results.every(({ error }) => !error);
    }
}
