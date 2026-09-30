import { Component } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideSave } from '@lucide/angular';

@Component({
    selector: 'app-groceries-list-update',
    imports: [ButtonComponent, LucideSave],
    templateUrl: './groceries-list-update.component.html',
})
export class GroceriesListUpdateComponent {}
