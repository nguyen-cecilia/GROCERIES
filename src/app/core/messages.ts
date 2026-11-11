export const MESSAGES = {
    common: {
        loading: 'Chargement…',
        saveFailed: 'Enregistrement impossible, réessaie.',
        deleteFailed: 'Suppression impossible, réessaie.',
        noResults: 'Aucun résultat pour cette recherche.',
    },
    auth: {
        signInFailed: 'Connexion impossible, réessaie.',
        invalidCredentials: 'Email ou mot de passe incorrect.',
        emailNotConfirmed: 'Vérifie ta boîte mail pour confirmer ton compte.',
        emailExists: 'Un compte existe déjà avec cet email.',
        weakPassword: 'Le mot de passe doit contenir au moins 6 caractères.',
    },
    account: {
        saved: 'Profil mis à jour.',
        saveFailed: 'Mise à jour du profil impossible, réessaie.',
        passwordMismatch: 'Les mots de passe ne correspondent pas.',
    },
    aisle: {
        loadFailed: 'Impossible de charger les rayons.',
        saveFailed: "Impossible d'enregistrer le rayon, réessaie.",
        deleteFailed: 'Impossible de supprimer le rayon, réessaie.',
        empty: "Aucun rayon pour l'instant. Ajoute le premier.",
        duplicateLabel: 'Un rayon porte déjà ce nom.',
        reorderFailed: 'Impossible de réordonner les rayons, réessaie.',
    },
    article: {
        loadFailed: 'Impossible de charger les articles.',
        saveFailed: "Impossible d'enregistrer l'article, réessaie.",
        deleteFailed: "Impossible de supprimer l'article, réessaie.",
        empty: "Aucun article pour l'instant. Ajoute le premier.",
        duplicateLabel: 'Un article porte déjà ce nom.',
    },
    quantityUnit: {
        loadFailed: 'Impossible de charger les unités de quantité.',
        saveFailed: "Impossible d'enregistrer l\'unité de quantité, réessaie.",
        deleteFailed: "Impossible de supprimer l'unité de quantité, réessaie.",
        empty: "Aucune unité pour l'instant. Ajoute la première.",
        duplicateLabel: 'Une unité porte déjà ce nom.',
        reorderFailed: 'Impossible de réordonner les unités, réessaie.',
    },
} as const;

const SUPABASE_ERRORS: Record<string, string> = {
    invalid_credentials: MESSAGES.auth.invalidCredentials,
    email_not_confirmed: MESSAGES.auth.emailNotConfirmed,
    email_exists: MESSAGES.auth.emailExists,
    user_already_exists: MESSAGES.auth.emailExists,
    weak_password: MESSAGES.auth.weakPassword,
    '23505': MESSAGES.aisle.duplicateLabel,
};

export function supabaseMessage(code: string | undefined, fallback: string): string {
    return (code && SUPABASE_ERRORS[code]) || fallback;
}
