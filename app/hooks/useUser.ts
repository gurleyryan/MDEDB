import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';

type Role = 'admin' | 'artist' | 'org' | undefined;

interface User {
  id: string;
  email: string;
  name?: string;
}

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(undefined);

  useEffect(() => {
    const getUserAndRole = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          name: data.user.user_metadata?.name ?? '',
        });

        // Query the user_roles table for this user's role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleData?.role) {
          setRole(roleData.role as Role);
        } else {
          setRole(undefined);
        }
      } else {
        setUser(null);
        setRole(undefined);
      }
    };

    getUserAndRole();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? '',
        });
        // Fetch role again on login
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: roleData }) => {
            setRole(roleData?.role as Role || undefined);
          });
      } else {
        setUser(null);
        setRole(undefined);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(undefined);
  };

  return { user, role, logout };
}