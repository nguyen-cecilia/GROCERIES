function formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    })
        .format(date)
        .replace(':', 'h');
}

export function formatDate(iso: string, withTime = false): string {
    const date = new Date(iso);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return `Aujourd'hui, ${formatTime(date)}`;
    }

    const day = new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
    }).format(date);

    return withTime ? `${day} à ${formatTime(date)}` : day;
}
