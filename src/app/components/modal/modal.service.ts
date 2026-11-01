import { Injectable } from '@angular/core';
import { ModalController } from './modal.controller';
import { GroceriesList, QuantityUnit } from '../../features/groceries-list/groceries-list.model';
import { Aisle } from '../../features/aisle/aisle.model';
import { Article } from '../../features/article/article.model';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    readonly groceriesList = new ModalController<GroceriesList>();
    readonly aisle = new ModalController<Aisle>();
    readonly article = new ModalController<Article>();
    readonly quantityUnit = new ModalController<QuantityUnit>();
}
