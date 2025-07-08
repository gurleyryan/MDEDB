import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Org } from '@/models/org';
import { OrgWithScore } from '@/models/orgWithScore';

export function useOrganizations() {
  const [orgs, setOrgs] = useState<OrgWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch organizations from Supabase
  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('org_with_score') // Use the view that includes calculated alignment_score
        .select('*')
        .order('org_name');

      if (error) {
        setError(error.message);
      } else {
        setOrgs(data || []);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  // Update organization approval status
  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('org')
        .update({ approval_status: status })
        .eq('id', id);

      if (error) {
        setError(error.message);
      } else {
        // Update local state optimistically
        setOrgs(prevOrgs =>
          prevOrgs.map(org =>
            org.id === id ? { ...org, approval_status: status } : org
          )
        );
        setError(null);
      }
    } catch (err) {
      setError('Failed to update organization status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Add new organization
  const addOrganization = async (orgData: Partial<Org>) => {
    if (!orgData.org_name || !orgData.country_code) {
      setError('Organization name and country are required');
      return false;
    }

    setUpdatingId('new');
    try {
      const { data, error } = await supabase
        .from('org')
        .insert([{ ...orgData, approval_status: 'pending' }])
        .select()
        .single();

      if (error) {
        setError('Error adding organization: ' + error.message);
        return false;
      } else {
        // Add to local state
        setOrgs(prevOrgs => [{ ...data, alignment_score: null }, ...prevOrgs]);
        setError(null);
        return true;
      }
    } catch (err) {
      setError('Failed to add organization');
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  // Update organization details
  const updateOrganization = async (id: string, updates: Partial<Org>) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('org')
        .update(updates)
        .eq('id', id);

      if (error) {
        setError('Error updating organization: ' + error.message);
        return false;
      } else {
        // Update local state optimistically
        setOrgs(prevOrgs =>
          prevOrgs.map(org =>
            org.id === id ? { ...org, ...updates } : org
          )
        );
        setError(null);
        return true;
      }
    } catch (err) {
      setError('Failed to update organization');
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete organization
  const deleteOrganization = async (id: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('org')
        .delete()
        .eq('id', id);

      if (error) {
        setError('Error deleting organization: ' + error.message);
        return false;
      } else {
        // Remove from local state
        setOrgs(prevOrgs => prevOrgs.filter(org => org.id !== id));
        setError(null);
        return true;
      }
    } catch (err) {
      setError('Failed to delete organization');
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter organizations by status and visibility
  const getFilteredOrgs = (
    filter: 'all' | 'pending' | 'approved' | 'rejected',
    showRejected: boolean
  ) => {
    let filtered = orgs;
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(org => org.approval_status === filter);
    }
    
    // Hide rejected orgs unless specifically showing them
    if (!showRejected && filter !== 'rejected') {
      filtered = filtered.filter(org => org.approval_status !== 'rejected');
    }
    
    return filtered;
  };

  // Get organization counts by status
  const getOrgCounts = () => {
    return {
      all: orgs.length,
      pending: orgs.filter(org => org.approval_status === 'pending').length,
      approved: orgs.filter(org => org.approval_status === 'approved').length,
      rejected: orgs.filter(org => org.approval_status === 'rejected').length,
    };
  };

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrgs();
  }, []);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Clear error after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // State
    orgs,
    loading,
    error,
    updatingId,
    
    // Actions
    fetchOrgs,
    updateStatus,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    
    // Utilities
    getFilteredOrgs,
    getOrgCounts,
    
    // Error handling
    setError,
  };
}