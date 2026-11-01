import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideArrowRight, LucideCopy, LucidePlus } from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../components/modal/modal.component';
import { GroceriesListUpdateComponent } from '../groceries-list/groceries-list-update.component';
import { ModalService } from '../../components/modal/modal.service';
import { BadgeAisleComponent } from '../../components/badge-aisle/badge-aisle.component';

@Component({
    selector: 'app-dashboard',
    imports: [
        ButtonComponent,
        LucidePlus,
        LucideArrowRight,
        LucideCopy,
        RouterLink,
        ModalComponent,
        GroceriesListUpdateComponent,
        BadgeAisleComponent,
    ],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    protected modalService = inject(ModalService);
}
