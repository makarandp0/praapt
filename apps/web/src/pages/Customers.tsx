import { Contracts, type Customer, type UpdateCustomerBody } from '@praapt/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { callContract } from '../lib/contractClient';

type Props = { apiBase: string };

export function Customers({ apiBase }: Props) {
  const { getIdToken } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPin, setEditPin] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const customerById = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer]));
  }, [customers]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await callContract(apiBase, Contracts.listCustomers, { token });
      if (!response.ok) {
        setError(response.error);
        return;
      }

      setCustomers(response.customers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [apiBase, getIdToken]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setEditName(customer.name);
    setEditPin(customer.pin);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPin('');
  };

  const handleSave = async () => {
    if (!editingId) return;
    const existing = customerById.get(editingId);
    if (!existing) return;

    const body: UpdateCustomerBody = {};
    const trimmedName = editName.trim();

    if (trimmedName !== existing.name) {
      body.name = trimmedName;
    }
    if (editPin !== existing.pin) {
      body.pin = editPin;
    }

    if (!body.name && !body.pin) {
      cancelEdit();
      return;
    }

    setSavingId(editingId);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await callContract(apiBase, Contracts.updateCustomer, {
        token,
        params: { id: editingId },
        body,
      });

      if (!response.ok) {
        setError(response.error);
        return;
      }

      setCustomers((prev) =>
        prev.map((item) => (item.id === editingId ? response.customer : item)),
      );
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Delete ${customer.name}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(customer.id);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await callContract(apiBase, Contracts.deleteCustomer, {
        token,
        params: { id: customer.id },
      });

      if (!response.ok) {
        setError(response.error);
        return;
      }

      setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Customers</h2>
        <Button variant="outline" onClick={fetchCustomers}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No customers yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">PIN</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Faces</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Created</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Updated</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {customers.map((customer) => {
                const isEditing = editingId === customer.id;
                const isSaving = savingId === customer.id;
                const isDeleting = deletingId === customer.id;

                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          className="w-48 rounded border border-gray-300 px-2 py-1"
                          disabled={isSaving}
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editPin}
                          onChange={(event) => setEditPin(event.target.value)}
                          className="w-24 rounded border border-gray-300 px-2 py-1 font-mono"
                          inputMode="numeric"
                          maxLength={4}
                          pattern="\\d{4}"
                          disabled={isSaving}
                        />
                      ) : (
                        <span className="font-mono">{customer.pin}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{customer.faceCount}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.updatedAt
                        ? new Date(customer.updatedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={isSaving}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(customer)}
                              disabled={isDeleting}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDelete(customer)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
