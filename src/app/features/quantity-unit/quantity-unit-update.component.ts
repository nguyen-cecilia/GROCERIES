import { Component } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideSave, LucideTrash } from '@lucide/angular';

@Component({
    selector: 'app-quantity-unit-update',
    imports: [ButtonComponent, LucideSave, LucideTrash],
    templateUrl: './quantity-unit-update.component.html',
})
export class QuantityUnitUpdateComponent {}
