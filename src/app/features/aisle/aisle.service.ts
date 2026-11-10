import { Injectable, signal } from '@angular/core';
import { supabase } from '../../core/supabase';
import { Aisle } from './aisle.model';
import { AisleColorKey, normalizeAisleColor } from '../../core/aisle-colors';
import { MESSAGES } from '../../core/messages';

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
            this.error.set(MESSAGES.aisle.loadFailed);
            return;
        }
        this.aislesState.set(
            (data ?? []).map((aisle) => ({ ...aisle, color: normalizeAisleColor(aisle.color) })),
        );
    }

    async create(input: AisleInput) {
        return supabase.from('sg_aisle').insert({
            label: input.label.trim(),
            color: input.color,
        });
    }

    async update(id: string, input: AisleInput) {
        return supabase
            .from('sg_aisle')
            .update({
                label: input.label.trim(),
                color: input.color,
            })
            .eq('id', id);
    }

    async remove(id: string) {
        return supabase.from('sg_aisle').delete().eq('id', id);
    }

    async move(id: string, direction: 'up' | 'down') {
        if (this.reordering() || this.loading()) return;

        const ordered = [...this.aislesState()];
        const index = ordered.findIndex((a) => a.id === id);
        const target = direction === 'up' ? index - 1 : index + 1;
        if (index === -1 || target < 0 || target >= ordered.length) return;

        const previous = this.aislesState();
        [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

        this.reordering.set(true);
        this.aislesState.set(ordered.map((a, position) => ({ ...a, position })));

        const { error } = await supabase.rpc('sg_reorder_aisles', {
            p_ids: ordered.map((a) => a.id),
        });

        this.reordering.set(false);
        if (error) {
            this.aislesState.set(previous);
            this.error.set(MESSAGES.aisle.reorderFailed);
        }
    }
}
