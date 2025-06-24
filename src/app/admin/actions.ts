'use server';

import { createClient as createServiceRoleClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { type AdminUser, type AdminInviteCode } from '@/lib/types';

async function verifyAdmin(): Promise<{user: any}> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (error || !profile || profile.role !== 'admin') {
        throw new Error('Not authorized');
    }
    return { user };
}

export async function getAdminDashboardData(): Promise<{ users: AdminUser[], inviteCodes: AdminInviteCode[] }> {
    await verifyAdmin();

    const supabaseService = createServiceRoleClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const [usersRes, codesRes] = await Promise.all([
        supabaseService.from('profiles').select('id, email, role, created_at'),
        supabaseService.from('invite_codes').select('*').order('created_at', { ascending: false })
    ]);

    if (usersRes.error) throw usersRes.error;
    if (codesRes.error) throw codesRes.error;
    
    return { users: usersRes.data as AdminUser[], inviteCodes: codesRes.data as AdminInviteCode[] };
}

export async function createInviteCode(formData: FormData) {
    try {
        await verifyAdmin();
        
        const code = formData.get('code') as string;
        if (!code || code.trim().length < 4) {
            return { error: 'Code must be at least 4 characters long.' };
        }

        const supabaseService = createServiceRoleClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabaseService.from('invite_codes').insert({ code: code.trim() });
        
        if (error) {
            if (error.code === '23505') { // unique constraint violation
                return { error: `Code "${code}" already exists.` };
            }
            console.error("Error creating invite code:", error);
            return { error: 'Failed to create invite code due to a database error.' };
        }
        
        revalidatePath('/profile');
        return { success: true, message: `Invite code "${code}" created successfully.` };

    } catch (e: any) {
        return { error: e.message };
    }
}
