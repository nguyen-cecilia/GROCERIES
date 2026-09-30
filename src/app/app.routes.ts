import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { GroceriesListComponent } from './features/groceries-list/groceries-list.component';
import { LoginComponent } from './features/login/login.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
    {
        path: 'connexion',
        component: LoginComponent,
    },
    {
        path: '',
        children: [
            {
                path: '',
                component: DashboardComponent,
            },
            {
                path: 'liste-de-course/:id',
                component: GroceriesListComponent,
            },
            {
                path: 'parametres',
                component: SettingsComponent,
            },
        ],
    },
];
