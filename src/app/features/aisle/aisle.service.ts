import { Injectable, signal } from '@angular/core';
import { supabase } from '../../core/supabase';
import { Aisle } from './aisle.model';
import { AisleColorKey, normalizeAisleColor } from '../../core/aisle-colors';

export type AisleInput = { label: string; color: AisleColorKey };

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
        this.aislesState.set(
            (data ?? []).map((aisle) => ({ ...aisle, color: normalizeAisleColor(aisle.color) })),
        );
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
