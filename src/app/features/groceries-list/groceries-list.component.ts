import { Component } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import {
    LucideBrushCleaning,
    LucideChevronDown,
    LucideChevronLeft,
    LucidePencil,
    LucidePlus,
    LucideRotateCcw,
    LucideSettings,
} from '@lucide/angular';
import { RouterLink } from '@angular/router';

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
        LucideSettings,
    ],
    templateUrl: './groceries-list.component.html',
})
export class GroceriesListComponent {}
