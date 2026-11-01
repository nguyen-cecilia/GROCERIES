import { Component } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucideSave, LucideTrash } from '@lucide/angular';
import { InputPriceComponent } from '../../components/input-price/input-price.component';
import { SelectComponent } from '../../components/select/select.component';

@Component({
    selector: 'app-article-update',
    imports: [ButtonComponent, LucideSave, LucideTrash, InputPriceComponent, SelectComponent],
    templateUrl: './article-update.component.html',
})
export class ArticleUpdateComponent {}
