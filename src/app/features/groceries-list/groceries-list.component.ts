import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import {
    LucideBrushCleaning,
    LucideChevronDown,
    LucideChevronLeft,
    LucidePencil,
    LucidePlus,
    LucideRotateCcw,
    LucideSlidersHorizontal,
} from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { BadgeAisleComponent } from '../../components/badge-aisle/badge-aisle.component';
import { InputPriceComponent } from '../../components/input-price/input-price.component';
import { InputQuantityComponent } from '../../components/input-quantity/input-quantity.component';
import { SelectComponent } from '../../components/select/select.component';
import { GroceriesListUpdateComponent } from './groceries-list-update.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalService } from '../../components/modal/modal.service';
import { ArticleUpdateComponent } from '../article/article-update.component';

@Component({
    selector: 'app-groceries-list',
    imports: [
        ButtonComponent,
        LucideChevronLeft,
        RouterLink,
        LucideRotateCcw,
        LucidePlus,
        LucideChevronDown,
        LucidePencil,
        LucideBrushCleaning,
        BadgeAisleComponent,
        InputPriceComponent,
        LucideSlidersHorizontal,
        InputQuantityComponent,
        SelectComponent,
        GroceriesListUpdateComponent,
        ModalComponent,
        ArticleUpdateComponent,
    ],
    templateUrl: './groceries-list.component.html',
})
export class GroceriesListComponent {
    protected modalService = inject(ModalService);
}
