import { Injectable } from '@angular/core';
import { ModalController } from './modal.controller';
import { GroceriesList } from '../../features/groceries-list/groceries-list.model';
import { Aisle } from '../../features/aisle/aisle.model';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    readonly groceriesList = new ModalController<GroceriesList>();
    readonly aisle = new ModalController<Aisle>();
}
