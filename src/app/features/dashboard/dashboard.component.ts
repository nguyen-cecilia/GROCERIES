import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideArrowRight, LucideCopy, LucidePlus, LucideTrash } from '@lucide/angular';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../components/modal/modal.component';
import { GroceriesListUpdateComponent } from '../groceries-list/groceries-list-update.component';
import { ModalService } from '../../components/modal/modal.service';

@Component({
    selector: 'app-dashboard',
    imports: [
        ButtonComponent,
        LucidePlus,
        LucideArrowRight,
        LucideCopy,
        LucideTrash,
        RouterLink,
        ModalComponent,
        GroceriesListUpdateComponent,
    ],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    protected modalService = inject(ModalService);
}
