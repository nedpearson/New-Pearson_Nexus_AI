import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PlanFeatures {
  [key: string]: boolean;
}

interface PlanLimits {
  [key: string]: number;
}

interface Usage {
  [key: string]: number;
}

export function useFeatureGating() {
  const { user, organization } = useAuth();
  const [features, setFeatures] = useState<PlanFeatures>({});
  const [limits, setLimits] = useState<PlanLimits>({});
  const [usage, setUsage] = useState<Usage>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatureGating();
  }, [user, organization]);

  const loadFeatureGating = async () => {
    try {
      if (!organization) {
        setFeatures({});
        setLimits({});
        setUsage({});
        return;
      }

      const planFeatures: PlanFeatures = {};
      const planLimits: PlanLimits = {};

      if (organization.plan === 'business') {
        planFeatures.documents = true;
        planFeatures.legal = true;
        planFeatures.reports = true;
        planFeatures.financial = true;
        planFeatures.tasks = true;
        planFeatures.calendar = true;
        planFeatures.templates = true;
        planFeatures.quickbooks = true;
        planFeatures.funding = true;
        planFeatures.packets = true;
        planFeatures.tax_attorney = true;
        planFeatures.financial_advisor = true;
        planFeatures.entity_builder = true;
        planLimits.documents = -1;
        planLimits.tasks = -1;
        planLimits.users = -1;
      } else if (organization.plan === 'professional') {
        planFeatures.documents = true;
        planFeatures.legal = true;
        planFeatures.reports = true;
        planFeatures.financial = true;
        planFeatures.tasks = true;
        planFeatures.calendar = true;
        planFeatures.templates = true;
        planFeatures.quickbooks = true;
        planFeatures.funding = true;
        planLimits.documents = 1000;
        planLimits.tasks = 500;
        planLimits.users = 10;
      } else {
        planFeatures.documents = true;
        planFeatures.financial = true;
        planFeatures.tasks = true;
        planFeatures.calendar = true;
        planLimits.documents = 100;
        planLimits.tasks = 50;
        planLimits.users = 3;
      }

      setFeatures(planFeatures);
      setLimits(planLimits);
      setUsage({
        documents: 0,
        tasks: 0,
        users: 1,
      });
    } catch (error) {
      console.error('Error loading feature gating:', error);
      setFeatures({});
      setLimits({});
      setUsage({});
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    return features[featureKey] === true;
  };

  const getLimits = (): PlanLimits => {
    return limits;
  };

  const getUsage = (): Usage => {
    return usage;
  };

  const checkLimit = (limitKey: string, delta: number = 1): boolean => {
    const limit = limits[limitKey];
    const currentUsage = usage[limitKey] || 0;

    if (limit === -1) return true;
    if (limit === undefined) return true;

    return currentUsage + delta <= limit;
  };

  return {
    hasFeature,
    getLimits,
    getUsage,
    checkLimit,
    loading,
    features,
    limits,
    usage,
  };
}
