export function formatDate(iso: string): string {
    const date = new Date(iso);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        const time = new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        })
            .format(date)
            .replace(':', 'h');
        return `Aujourd'hui, ${time}`;
    }

    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
    }).format(date);
}
