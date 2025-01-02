import { rules } from "./rules";

type RuleFunction = (userId: string, ...args: any[]) => Promise<boolean>;

export function getUserPermissions(userId: string) {
  return {
    can: async (action: keyof typeof rules, entity: keyof typeof rules[typeof action], ...args: Parameters<RuleFunction>) => {
      const checkPermission = rules[action]?.[entity] as RuleFunction | undefined;
      return checkPermission ? await checkPermission(userId, ...args) : false;
    },
    cannot: async (action: keyof typeof rules, entity: keyof typeof rules[typeof action], ...args: Parameters<RuleFunction>) => {
      const checkPermission = rules[action]?.[entity] as RuleFunction | undefined;
      return checkPermission ? !(await checkPermission(userId, ...args)) : true;
    },
  };
}
