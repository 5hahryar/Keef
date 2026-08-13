export function parseRfc3339(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function toRfc3339Utc(date: Date): string {
  return date.toISOString();
}

export const sqliteDateTransformer = {
  to(value: Date | null | undefined): string | null {
    if (!value) {
      return null;
    }
    return value.toISOString();
  },
  from(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  },
};

export const sqliteBoolTransformer = {
  to(value: boolean): number {
    return value ? 1 : 0;
  },
  from(value: unknown): boolean {
    return value === 1 || value === true || value === '1';
  },
};
