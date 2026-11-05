import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { ColorPickerComponent } from '../../components/color-picker/color-picker.component';
import { LucideSave, LucideTrash } from '@lucide/angular';
import { Aisle } from './aisle.model';
import { AisleService } from './aisle.service';
import { ModalService } from '../../components/modal/modal.service';
import { form, FormField } from '@angular/forms/signals';
import {
    AISLE_COLOR_OPTIONS,
    DEFAULT_AISLE_COLOR,
    isAisleColorKey,
    normalizeAisleColor,
} from '../../core/aisle-colors';

@Component({
    selector: 'app-aisle-update',
    imports: [ButtonComponent, ColorPickerComponent, LucideSave, LucideTrash, FormField],
    templateUrl: './aisle-update.component.html',
})
export class AisleUpdateComponent {
    readonly editing = input<Aisle | null>(null);

    private readonly aisleService = inject(AisleService);
    private readonly modalService = inject(ModalService);

    protected readonly colorOptions = AISLE_COLOR_OPTIONS;
    protected readonly model = signal({ label: '', color: DEFAULT_AISLE_COLOR });
    protected readonly form = form(this.model);
    protected readonly loading = signal(false);
    protected readonly savingError = signal<string | null>(null);

    constructor() {
        effect(() => {
            const aisle = this.editing();
            if (this.modalService.aisle.isOpen()) {
                this.model.set({
                    label: aisle?.label ?? '',
                    color: normalizeAisleColor(aisle?.color),
                });
                this.savingError.set(null);
            }
        });
    }

    protected setColor(color: string): void {
        if (isAisleColorKey(color)) {
            this.model.update((m) => ({ ...m, color }));
        }
    }

    protected readonly canSubmit = computed(
        () => this.model().label.trim() !== '' && this.model().color !== undefined,
    );

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this.loading()) return;
        this.loading.set(true);
        this.savingError.set(null);

        const input = { label: this.model().label, color: this.model().color };
        const aisle = this.editing();
        const { error } = aisle
            ? await this.aisleService.update(aisle.id, input)
            : await this.aisleService.create(input);

        this.loading.set(false);
        if (error) {
            this.savingError.set('Enregistrement impossible, réessaie.');
            return;
        }
        this.modalService.aisle.close();
        await this.aisleService.load();
    }

    async onDelete() {
        const aisle = this.editing();
        if (!aisle || this.loading()) return;
        this.loading.set(true);
        const { error } = await this.aisleService.remove(aisle.id);
        this.loading.set(false);
        if (!error) {
            this.modalService.aisle.close();
            await this.aisleService.load();
        }
    }
}
