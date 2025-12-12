import { transactionCategories } from './TransactionCategories';

export interface CategoryConfig {
  name: string;
  persianName: string;
  color: string;
  icon: string;
}

export const categoryConfigs: Record<string, CategoryConfig> = {
  Home: {
    name: 'Home',
    persianName: 'خانه',
    color: '#F59E0B', // Orange
    icon: '🏠',
  },
  Debt: {
    name: 'Debt',
    persianName: 'بدهی',
    color: '#F59EB5', // Pink
    icon: '💳',
  },
  Food: {
    name: 'Food',
    persianName: 'غذا',
    color: '#60A5FA', // Blue
    icon: '🍔',
  },
  Medical: {
    name: 'Medical',
    persianName: 'پزشکی',
    color: '#10B981', // Green
    icon: '🏥',
  },
  Transportation: {
    name: 'Transportation',
    persianName: 'برو بیا',
    color: '#8B5CF6', // Purple
    icon: '🚗',
  },
  Entertainment: {
    name: 'Entertainment',
    persianName: 'تفریحات',
    color: '#EC4899', // Pink
    icon: '🎬',
  },
  Investment: {
    name: 'Investment',
    persianName: 'ذخیره',
    color: '#6366F1', // Indigo
    icon: '💰',
  },
  Clothes: {
    name: 'Clothes',
    persianName: 'پوشاک',
    color: '#F97316', // Orange
    icon: '👕',
  },
  Other: {
    name: 'Other',
    persianName: 'متفرقه',
    color: '#6B7280', // Gray
    icon: '📦',
  },
};

export function getCategoryConfig(categoryName: string): CategoryConfig {
  return categoryConfigs[categoryName] || {
    name: categoryName,
    persianName: transactionCategories[categoryName as keyof typeof transactionCategories] || categoryName,
    color: '#6B7280',
    icon: '📦',
  };
}

