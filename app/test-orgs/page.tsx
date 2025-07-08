'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { OrgWithScore } from '@/models/orgWithScore';

export default function TestOrgs() {
    const [orgs, setOrgs] = useState<OrgWithScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const { data, error } = await supabase
                    .from('org_with_score') // replace with your actual table name
                    .select('*')
                    .limit(10);

                if (error) {
                    setError(error.message);
                    console.error('Supabase error:', error);
                } else {
                    setOrgs(data || []);
                }
            } catch (err) {
                setError('Failed to fetch organizations');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrgs();
    }, []);

    if (loading) return <div className="p-4">Loading organizations...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Climate Organizations Test</h1>
            {orgs.length === 0 ? (
                <p>No organizations found.</p>
            ) : (
                <div className="grid gap-4">
                    {orgs.map((org) => (
                        <div key={org.id} className="border p-4 rounded-lg">
                            <h2 className="text-xl font-semibold">{org.org_name}</h2>
                            <p className="text-gray-600">{org.country_code}</p>
                            <p className="text-sm">{org.type_of_work}</p>
                            <p className="text-xs text-gray-500">Status: {org.approval_status}</p>
                            {org.alignment_score !== undefined && (
                                <p className="text-sm">Alignment Score: {org.alignment_score}</p>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}