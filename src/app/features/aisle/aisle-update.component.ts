import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { ColorPickerComponent } from '../../components/color-picker/color-picker.component';
import { LucideSave, LucideTrash } from '@lucide/angular';
import { Aisle } from './aisle.model';
import { AISLE_COLORS, AisleService } from './aisle.service';
import { ModalService } from '../../components/modal/modal.service';
import { form, FormField } from '@angular/forms/signals';

@Component({
    selector: 'app-aisle-update',
    imports: [ButtonComponent, ColorPickerComponent, LucideSave, LucideTrash, FormField],
    templateUrl: './aisle-update.component.html',
})
export class AisleUpdateComponent {
    readonly editing = input<Aisle | null>(null);

    protected readonly colors = AISLE_COLORS;
    private readonly aisleService = inject(AisleService);
    private readonly modalService = inject(ModalService);

    protected readonly model = signal({ label: '', color: AISLE_COLORS[0] });
    protected readonly form = form(this.model);
    protected readonly loading = signal(false);
    protected readonly savingError = signal<string | null>(null);

    constructor() {
        effect(() => {
            const aisle = this.editing();
            if (this.modalService.aisle.isOpen()) {
                this.model.set({
                    label: aisle?.label ?? '',
                    color: aisle?.color ?? AISLE_COLORS[0],
                });
                this.savingError.set(null);
            }
        });
    }

    protected readonly canSubmit = computed(
        () => this.model().label.trim() !== '' && this.model().color !== '',
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

    // TODO: Vérifier si des articles ont ce rayon
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
