import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideCopy, LucideSave, LucideTrash } from '@lucide/angular';
import { GroceriesList } from './groceries-list.model';
import { ModalService } from '../../components/modal/modal.service';
import { GroceriesListService } from './groceries-list.service';
import { form, FormField } from '@angular/forms/signals';
import { MESSAGES } from '../../core/messages';
import { MessageComponent } from '../../components/message/message.component';
import { InputPriceComponent } from '../../components/input-price/input-price.component';
import { Router } from '@angular/router';
import { ToastService } from '../../components/toast/toast.service';

@Component({
    selector: 'app-groceries-list-update',
    imports: [
        ButtonComponent,
        LucideSave,
        LucideTrash,
        MessageComponent,
        FormField,
        InputPriceComponent,
        LucideCopy,
    ],
    templateUrl: './groceries-list-update.component.html',
})
export class GroceriesListUpdateComponent {
    readonly editing = input<GroceriesList | null>(null);

    private readonly modalService = inject(ModalService);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    protected readonly groceriesListService = inject(GroceriesListService);

    protected readonly model = signal({ label: '', budget: 0, note: '' });
    protected readonly form = form(this.model);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    constructor() {
        effect(() => {
            const list = this.editing();
            if (this.modalService.groceriesList.isOpen()) {
                this.model.set({
                    label: list?.label ?? '',
                    budget: list?.budget ?? 0,
                    note: list?.note ?? '',
                });
                this.error.set(null);
            }
        });
    }

    protected readonly canSubmit = computed(
        () => this.model().label.trim() !== '' && this.model().budget >= 0,
    );

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this.loading()) return;
        this.loading.set(true);
        this.error.set(null);

        const input = {
            label: this.model().label,
            budget: this.model().budget,
            note: this.model().note,
        };
        const list = this.editing();
        const { error: err } = list
            ? await this.groceriesListService.update(list.id, input)
            : await this.groceriesListService.create(input);

        this.loading.set(false);
        if (err) {
            this.error.set(MESSAGES.groceriesList.saveFailed);
            return;
        }
        this.toast.success(list ? MESSAGES.groceriesList.updated : MESSAGES.groceriesList.created);
        this.modalService.groceriesList.close();
        await this.groceriesListService.load();
    }

    protected async onDuplicate(): Promise<void> {
        const list = this.editing();
        if (!list) return;

        const newId = await this.groceriesListService.duplicate(list.id);
        if (!newId) return;

        this.toast.success(MESSAGES.groceriesList.duplicated);
        await this.router.navigate(['/liste-de-course', newId]);
    }

    async onDelete() {
        const list = this.editing();
        if (!list || this.loading()) return;
        this.loading.set(true);
        const { error } = await this.groceriesListService.remove(list.id);
        this.loading.set(false);
        if (!error) {
            this.toast.success(MESSAGES.groceriesList.deleted);
            this.modalService.groceriesList.close();
            await this.groceriesListService.load();
            await this.router.navigateByUrl('/');
        } else {
            this.error.set(MESSAGES.groceriesList.deleteFailed);
        }
    }
}
