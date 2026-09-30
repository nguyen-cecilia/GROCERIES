import { Injectable } from '@angular/core';
import { ModalController } from './modal.controller';
import { GroceriesList } from '../../features/groceries-list/groceries-list.model';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    readonly groceriesList = new ModalController<GroceriesList>();
}
