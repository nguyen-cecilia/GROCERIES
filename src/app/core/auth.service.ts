import { computed, Injectable, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly session = signal<Session | null>(null);
    readonly user = computed(() => this.session()?.user ?? null);
    readonly isAuthenticated = computed(() => this.session() !== null);

    readonly displayName = computed(() => {
        const user = this.user();
        if (!user) return '';

        const firstName = user.user_metadata['firstName'];
        if (typeof firstName === 'string' && firstName.trim() !== '') {
            return firstName.trim();
        }

        return user.email?.split('@')[0] ?? '';
    });

    readonly initials = computed(() => {
        const name = this.displayName();
        return name === '' ? '?' : name.charAt(0).toUpperCase();
    });

    constructor() {
        supabase.auth.onAuthStateChange((_, s) => this.session.set(s));
    }

    async initialize(): Promise<void> {
        const { data } = await supabase.auth.getSession();
        this.session.set(data.session);
    }

    signIn(email: string, password: string) {
        return supabase.auth.signInWithPassword({ email, password });
    }

    signUp(email: string, password: string) {
        return supabase.auth.signUp({ email, password });
    }

    signOut() {
        return supabase.auth.signOut();
    }

    updateAccount(attributes: { firstName?: string; email?: string; password?: string }) {
        return supabase.auth.updateUser({
            ...(attributes.firstName !== undefined
                ? { data: { firstName: attributes.firstName } }
                : {}),
            ...(attributes.email !== undefined ? { email: attributes.email } : {}),
            ...(attributes.password !== undefined ? { password: attributes.password } : {}),
        });
    }
}
