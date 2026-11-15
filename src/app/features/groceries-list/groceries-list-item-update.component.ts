import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideCircleX, LucideSave } from '@lucide/angular';
import { InputPriceComponent } from '../../components/input-price/input-price.component';
import { SelectComponent, SelectOption } from '../../components/select/select.component';
import { form, FormField } from '@angular/forms/signals';
import { MessageComponent } from '../../components/message/message.component';
import { CurrencyPipe } from '@angular/common';
import { GroceriesListItemView } from './groceries-list.model';
import { AisleService } from '../aisle/aisle.service';
import { ModalService } from '../../components/modal/modal.service';
import { GroceriesListService } from './groceries-list.service';
import { AISLE_COLOR_FALLBACK, aisleColorHex } from '../../core/aisle-colors';
import { InputQuantityComponent } from '../../components/input-quantity/input-quantity.component';
import { QuantityUnitService } from '../quantity-unit/quantity-unit.service';

type ItemFormModel = {
    label: string;
    aisle_id: string;
    price: number | null;
    quantity: number;
    quantity_unit_id: string;
};

@Component({
    selector: 'app-groceries-list-item-update',
    imports: [
        ButtonComponent,
        LucideSave,
        InputPriceComponent,
        SelectComponent,
        FormField,
        MessageComponent,
        CurrencyPipe,
        InputQuantityComponent,
        LucideCircleX,
    ],
    templateUrl: './groceries-list-item-update.component.html',
})
export class GroceriesListItemUpdateComponent {
    readonly editing = input<GroceriesListItemView | null>(null);

    private readonly groceriesListService = inject(GroceriesListService);
    private readonly aisleService = inject(AisleService);
    private readonly quantityUnitService = inject(QuantityUnitService);
    private readonly modalService = inject(ModalService);

    protected readonly model = signal<ItemFormModel>({
        label: '',
        aisle_id: '',
        price: null,
        quantity: 1,
        quantity_unit_id: '',
    });
    protected readonly form = form(this.model);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    protected readonly lastPrice = computed(() => this.editing()?.article?.last_price ?? null);
    protected readonly aisleOptions = computed<SelectOption[]>(() => [
        { value: '', label: 'Aucun rayon', color: AISLE_COLOR_FALLBACK },
        ...this.aisleService.aisles().map((aisle) => ({
            value: aisle.id,
            label: aisle.label,
            color: aisleColorHex(aisle.color),
        })),
    ]);
    protected readonly unitOptions = computed<SelectOption[]>(() => [
        { value: '', label: 'Aucune unité' },
        ...this.quantityUnitService.quantityUnits().map((u) => ({ value: u.id, label: u.label })),
    ]);

    constructor() {
        effect(() => {
            if (!this.modalService.listItem.isOpen()) return;
            if (this.aisleService.aisles().length === 0) void this.aisleService.load();
            if (this.quantityUnitService.quantityUnits().length === 0) {
                void this.quantityUnitService.load();
            }
        });

        effect(() => {
            if (!this.modalService.listItem.isOpen()) return;
            const item = this.editing();
            this.model.set({
                label: item?.article?.label ?? '',
                aisle_id: item?.article?.aisle_id ?? '',
                price: item?.article?.price ?? null,
                quantity: item?.quantity ?? 1,
                quantity_unit_id: item?.quantity_unit_id ?? '',
            });
            this.error.set(null);
        });
    }

    protected readonly canSubmit = computed(
        () => this.model().label.trim() !== '' && this.model().quantity >= 1,
    );

    protected applyLastPrice(): void {
        const lastPrice = this.editing()?.article?.last_price ?? null;
        if (lastPrice === null) return;
        this.model.update((m) => ({ ...m, price: lastPrice }));
    }

    async onSubmit(event: Event): Promise<void> {
        event.preventDefault();
        const item = this.editing();
        if (!item || this.loading()) return;

        this.loading.set(true);
        this.error.set(null);

        const { label, aisle_id, price, quantity, quantity_unit_id } = this.model();
        const { error } = await this.groceriesListService.updateItem(item.id, {
            label,
            aisleId: aisle_id === '' ? null : aisle_id,
            price,
            quantity,
            quantityUnitId: quantity_unit_id === '' ? null : quantity_unit_id,
        });

        this.loading.set(false);
        if (error) {
            this.error.set(error);
            return;
        }

        this.modalService.listItem.close();
    }

    async onDelete(): Promise<void> {
        const item = this.editing();
        if (!item || this.loading()) return;

        this.loading.set(true);
        this.error.set(null);

        const { error } = await this.groceriesListService.removeItem(item.id);

        this.loading.set(false);
        if (error) {
            this.error.set(error);
            return;
        }

        this.modalService.listItem.close();
    }
}
