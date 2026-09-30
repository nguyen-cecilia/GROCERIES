import { Component, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { LucidePencil, LucidePlus, LucideSave, LucideTrash } from '@lucide/angular';

type accountTabs = 'account' | 'aisles' | 'articles';

@Component({
    selector: 'app-settings',
    imports: [ButtonComponent, LucideSave, LucidePlus, LucidePencil, LucideTrash],
    templateUrl: './settings.component.html',
})
export class SettingsComponent {
    readonly activePanel = signal<accountTabs>('account');

    select(key: accountTabs): void {
        this.activePanel.set(key);
    }
}
