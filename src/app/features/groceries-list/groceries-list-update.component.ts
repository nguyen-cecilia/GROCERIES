import { Component } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideSave, LucideTrash } from '@lucide/angular';

@Component({
    selector: 'app-groceries-list-update',
    imports: [ButtonComponent, LucideSave, LucideTrash],
    templateUrl: './groceries-list-update.component.html',
})
export class GroceriesListUpdateComponent {}
