import { Injectable } from '@angular/core';
import { ModalController } from './modal.controller';
import {
    GroceriesList,
    GroceriesListItemView,
    QuantityUnit,
} from '../../features/groceries-list/groceries-list.model';
import { Aisle } from '../../features/aisle/aisle.model';
import { Article } from '../../features/article/article.model';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    readonly groceriesList = new ModalController<GroceriesList>();
    readonly listItem = new ModalController<GroceriesListItemView>();
    readonly aisle = new ModalController<Aisle>();
    readonly article = new ModalController<Article>();
    readonly articleToList = new ModalController<Article>();
    readonly quantityUnit = new ModalController<QuantityUnit>();
}
