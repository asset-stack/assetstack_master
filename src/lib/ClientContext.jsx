import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const ClientContext = createContext();

export function ClientProvider({ children }) {
  const { user } = useAuth();
  const [currentClient, setCurrentClient] = useState(null);

  // If the app was opened via a /demo/<slug> link, lock the whole session
  // to that demo's ClientAccount for total data isolation.
  const demoSlug = typeof window !== 'undefined' ? sessionStorage.getItem('demo_slug') : null;

  const { data: rawClients = [], isLoading, refetch } = useQuery({
    queryKey: ['adminClients'],
    queryFn: () => base44.entities.ClientAccount.list('-created_date', 100),
  });

  // Safe provisioning: a signed-in user with no account of their own gets a fresh,
  // fully isolated ClientAccount instead of hitting a "no membership" wall or
  // bleeding into an existing tenant. Runs once, never for super_admins.
  const [provisioning, setProvisioning] = useState(false);
  useEffect(() => {
    if (demoSlug) return;
    if (isLoading || !user?.email || provisioning) return;
    if (user.role === 'super_admin') return;
    const hasOwn = rawClients.some(
      (c) => Array.isArray(c.allowed_users) && c.allowed_users.includes(user.email)
    );
    if (rawClients.length === 0 || !hasOwn) {
      setProvisioning(true);
      base44.functions
        .invoke('provisionClientAccount', {})
        .then(() => refetch())
        .finally(() => setProvisioning(false));
    }
  }, [isLoading, user?.email, user?.role, rawClients, provisioning, refetch]);

  const clients = rawClients.filter(c => !c.allowed_users?.length || c.allowed_users.includes(user?.email));

  const isDemoClient = (client) => /demo|council|bunbury/i.test(client?.business_name || '');

  useEffect(() => {
    if (demoSlug) {
      const demo = rawClients.find(c => c.demo_slug === demoSlug);
      if (demo && currentClient?.id !== demo.id) {
        setCurrentClient(demo);
        // Propagate the demo's account id to the data layer (secureEntities &
        // backend functions read this) so the whole session is scoped to the demo.
        try { localStorage.setItem('assetstack_client_id', demo.id); } catch { /* ignore */ }
      }
      return;
    }
    if (clients.length > 0 && !currentClient) {
      const saved = localStorage.getItem('assetstack_client_id');
      const found = saved ? clients.find(c => c.id === saved && !isDemoClient(c)) : null;
      const mainAccount = clients.find(c => !isDemoClient(c));
      setCurrentClient(found || mainAccount || clients[0]);
    }
  }, [clients, currentClient, rawClients, demoSlug]);

  const setClient = (client) => {
    setCurrentClient(client);
    if (client) localStorage.setItem('assetstack_client_id', client.id);
  };

  return (
    <ClientContext.Provider value={{ currentClient, clients, setClient, isLoading }}>
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => useContext(ClientContext);