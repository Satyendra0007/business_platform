/**
 * useSupplierOnboarding.js
 *
 * Dynamically computes the Supplier onboarding status from existing data:
 *   - user.companyId  → has company?
 *   - GET /api/products/manage (limit 1) → has at least 1 product?
 *
 * Returns a stable object describing the current onboarding state.
 * Non-supplier roles always return { onboardingComplete: true }.
 *
 * No new backend endpoints, no new DB flags.
 */
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { hasRole } from '../lib/userRole';
import { getManagedProducts } from '../lib/productManagementService';

export function useSupplierOnboarding() {
  const { user } = useAuth();

  const isSupplier = hasRole(user, 'supplier');
  const hasCompany = Boolean(user?.companyId);

  const [productCount, setProductCount] = useState(null); // null = not yet loaded
  const [loading, setLoading] = useState(false);

  // Fetch product count only for suppliers who already have a company
  useEffect(() => {
    if (!isSupplier || !hasCompany) {
      setProductCount(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getManagedProducts({ limit: 1 })
      .then((result) => {
        if (!cancelled) setProductCount(result?.total ?? 0);
      })
      .catch(() => {
        if (!cancelled) setProductCount(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSupplier, hasCompany]);

  return useMemo(() => {
    // Non-suppliers: always complete — zero interference
    if (!isSupplier) {
      return {
        isSupplier: false,
        loading: false,
        onboardingComplete: true,
        currentStep: 'complete',
        hasCompany: true,
        hasProduct: true,
        productCount: 0,
      };
    }

    const hasProduct = productCount !== null && productCount > 0;
    const stillLoading = hasCompany && productCount === null;

    let currentStep = 'company';
    if (hasCompany && !hasProduct) currentStep = 'product';
    if (hasCompany && hasProduct) currentStep = 'complete';

    return {
      isSupplier: true,
      loading: loading || stillLoading,
      onboardingComplete: hasCompany && hasProduct,
      currentStep,
      hasCompany,
      hasProduct,
      productCount: productCount ?? 0,
    };
  }, [isSupplier, hasCompany, productCount, loading]);
}
