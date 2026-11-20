import { Component, inject } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { ToastService } from './toast.service';

@Component({
    selector: 'app-toast',
    imports: [MessageComponent],
    templateUrl: './toast.component.html',
    host: {
        class: 'pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:top-6 lg:items-end',
    },
})
export class ToastComponent {
    protected readonly toastService = inject(ToastService);
}
