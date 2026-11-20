import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideSave, LucideTrash } from '@lucide/angular';
import { QuantityUnit } from '../groceries-list/groceries-list.model';
import { ModalService } from '../../components/modal/modal.service';
import { QuantityUnitService } from './quantity-unit.service';
import { form, FormField } from '@angular/forms/signals';
import { MESSAGES } from '../../core/messages';
import { MessageComponent } from '../../components/message/message.component';
import { ToastService } from '../../components/toast/toast.service';

@Component({
    selector: 'app-quantity-unit-update',
    imports: [ButtonComponent, LucideSave, LucideTrash, FormField, MessageComponent],
    templateUrl: './quantity-unit-update.component.html',
})
export class QuantityUnitUpdateComponent {
    readonly editing = input<QuantityUnit | null>(null);

    private readonly quantityUnitService = inject(QuantityUnitService);
    private readonly modalService = inject(ModalService);
    private readonly toast = inject(ToastService);

    protected readonly model = signal({ label: '' });
    protected readonly form = form(this.model);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    constructor() {
        effect(() => {
            const quantityUnit = this.editing();
            if (this.modalService.quantityUnit.isOpen()) {
                this.model.set({
                    label: quantityUnit?.label ?? '',
                });
                this.error.set(null);
            }
        });
    }

    protected readonly canSubmit = computed(() => this.model().label.trim() !== '');

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this.loading()) return;
        this.loading.set(true);
        this.error.set(null);

        const input = { label: this.model().label };
        const quantityUnit = this.editing();
        const { error: err } = quantityUnit
            ? await this.quantityUnitService.update(quantityUnit.id, input)
            : await this.quantityUnitService.create(input);

        this.loading.set(false);
        if (err) {
            this.error.set(MESSAGES.quantityUnit.saveFailed);
            return;
        }
        this.toast.success(
            quantityUnit ? MESSAGES.quantityUnit.updated : MESSAGES.quantityUnit.created,
        );
        this.modalService.quantityUnit.close();
        await this.quantityUnitService.load();
    }

    async onDelete() {
        const quantityUnit = this.editing();
        if (!quantityUnit || this.loading()) return;
        this.loading.set(true);
        const { error } = await this.quantityUnitService.remove(quantityUnit.id);
        this.loading.set(false);
        if (!error) {
            this.toast.success(MESSAGES.quantityUnit.deleted);
            this.modalService.quantityUnit.close();
            await this.quantityUnitService.load();
        } else {
            this.error.set(MESSAGES.quantityUnit.deleteFailed);
        }
    }
}
