'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Org } from '@/models/org';

export default function AdminOrgs() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // 🔐 Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
      }
    };

    checkUser();
  }, [router]);

  // 🗂️ Fetch orgs
  useEffect(() => {
    fetchOrgs();
  }, []);

  // 🚪 Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError('Error logging out: ' + error.message);
    } else {
      router.push('/login');
    }
  };

  async function fetchOrgs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('org')
      .select('*')
      .order('org_name');

    if (error) setError(error.message);
    else setOrgs(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    setUpdatingId(id);
    const { error } = await supabase
      .from('org')
      .update({ approval_status: status })
      .eq('id', id);

    setUpdatingId(null);
    if (error) {
      setError(error.message);
    } else {
      setOrgs(prevOrgs =>
        prevOrgs.map(org =>
          org.id === id ? { ...org, approval_status: status } : org
        )
      );
    }
  }

  const filteredOrgs = filter === 'all'
    ? orgs
    : orgs.filter(org => org.approval_status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) return <div className="p-4">Loading orgs…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header with logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin: Manage Organizations</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Filter buttons */}
      <div className="mb-6 flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status} (
              {status === 'all'
                ? orgs.length
                : orgs.filter(org => org.approval_status === status).length}
              )
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Org Name</th>
              <th className="border border-gray-300 p-2 text-left">Country</th>
              <th className="border border-gray-300 p-2 text-left">Type of Work</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 font-medium">{org.org_name}</td>
                <td className="border border-gray-300 p-2">{org.country_code}</td>
                <td className="border border-gray-300 p-2 text-sm">{org.type_of_work}</td>
                <td className="border border-gray-300 p-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(org.approval_status)}`}>
                    {org.approval_status}
                  </span>
                </td>
                <td className="border border-gray-300 p-2 space-x-2 text-center">
                  <button
                    disabled={updatingId === org.id || org.approval_status === 'approved'}
                    onClick={() => updateStatus(org.id, 'approved')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                  >
                    {updatingId === org.id ? '...' : 'Approve'}
                  </button>
                  <button
                    disabled={updatingId === org.id || org.approval_status === 'rejected'}
                    onClick={() => updateStatus(org.id, 'rejected')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
                  >
                    {updatingId === org.id ? '...' : 'Reject'}
                  </button>
                  <button
                    disabled={updatingId === org.id || org.approval_status === 'pending'}
                    onClick={() => updateStatus(org.id, 'pending')}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    {updatingId === org.id ? '...' : 'Pending'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrgs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No organizations found for the selected filter.
        </div>
      )}
    </div>
  );
}
