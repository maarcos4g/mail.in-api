import { rules } from "./rules";

type RuleFunction = (userId: string, ...args: any[]) => Promise<boolean>;

export function getUserPermissions(userId: string) {
  return {
    can: async <T extends keyof typeof rules>(
      action: T,
      entity: keyof typeof rules[T],
      ...args: Parameters<RuleFunction>
    ) => {
      const checkPermission = rules[action]?.[entity] as RuleFunction | undefined;
      return checkPermission ? await checkPermission(userId, ...args) : false;
    },
    cannot: async <T extends keyof typeof rules>(
      action: T,
      entity: keyof typeof rules[T],
      ...args: Parameters<RuleFunction>
    ) => {
      const checkPermission = rules[action]?.[entity] as RuleFunction | undefined;
      return checkPermission ? !(await checkPermission(userId, ...args)) : true;
    },
  };
}
