import { PrismaClient, AutomationRule, Order, Customer } from '@prisma/client';

const prisma = new PrismaClient();

export enum AutomationTrigger {
    ORDER_IMPORTED = 'ORDER_IMPORTED',
    ORDER_PAID = 'ORDER_PAID',
    ORDER_SHIPPED = 'ORDER_SHIPPED',
    ORDER_CREATED = 'ORDER_CREATED'
}

export enum AutomationActionType {
    SEND_EMAIL = 'SEND_EMAIL',
    GENERATE_INVOICE = 'GENERATE_INVOICE',
    ADD_TAG = 'ADD_TAG',
    SET_STATUS = 'SET_STATUS'
}

interface AutomationCondition {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'defined';
    value: any;
}

interface AutomationAction {
    type: AutomationActionType;
    params: any;
}

export class AutomationService {

    /**
     * Evaluate and execute rules for a specific trigger
     */
    static async evaluateRules(userId: string, tenantId: string, trigger: AutomationTrigger, context: any) {
        console.log(`[Automation] Evaluating rules for ${trigger} (User: ${userId})`);

        // Fetch active rules for this trigger
        const rules = await prisma.automationRule.findMany({
            where: {
                userId,
                tenantId,
                trigger: trigger,
                isActive: true
            },
            orderBy: {
                priority: 'desc'
            }
        });

        if (rules.length === 0) {
            console.log(`[Automation] No active rules found for ${trigger}`);
            return;
        }

        console.log(`[Automation] Found ${rules.length} potential rules.`);

        for (const rule of rules) {
            try {
                const conditions = JSON.parse(rule.conditions) as AutomationCondition[];
                const actions = JSON.parse(rule.actions) as AutomationAction[];

                if (this.checkConditions(conditions, context)) {
                    console.log(`[Automation] Rule "${rule.name}" matches! Executing actions...`);
                    await this.executeActions(actions, context, userId, tenantId);
                } else {
                    console.log(`[Automation] Rule "${rule.name}" does NOT match conditions.`);
                }
            } catch (err) {
                console.error(`[Automation] Error processing rule ${rule.id}:`, err);
            }
        }
    }

    /**
     * Check if all conditions match the context
     */
    private static checkConditions(conditions: AutomationCondition[], context: any): boolean {
        if (!conditions || conditions.length === 0) return true;

        return conditions.every(condition => {
            const contextValue = this.getValueFromPath(context, condition.field);

            switch (condition.operator) {
                case 'equals':
                    return contextValue == condition.value; // Loose equality for numbers/strings
                case 'contains':
                    return String(contextValue).includes(String(condition.value));
                case 'gt':
                    return Number(contextValue) > Number(condition.value);
                case 'lt':
                    return Number(contextValue) < Number(condition.value);
                case 'defined':
                    return contextValue !== undefined && contextValue !== null;
                default:
                    return false;
            }
        });
    }

    /**
     * Execute a list of actions
     */
    private static async executeActions(actions: AutomationAction[], context: any, userId: string, tenantId: string) {
        for (const action of actions) {
            try {
                switch (action.type) {
                    case AutomationActionType.SEND_EMAIL:
                        await this.actionSendEmail(action.params, context);
                        break;
                    case AutomationActionType.GENERATE_INVOICE:
                        // Call Invoice Service (TODO)
                        console.log('[Automation] ACTION: Generating Invoice for Order', context.id);
                        break;
                    case AutomationActionType.SET_STATUS:
                        // Update Order Status (TODO)
                        console.log('[Automation] ACTION: Setting Status', action.params);
                        break;
                    default:
                        console.warn('[Automation] Unknown action type:', action.type);
                }
            } catch (err) {
                console.error(`[Automation] Action execution failed:`, err);
            }
        }
    }

    // --- Action Implementations ---

    private static async actionSendEmail(params: any, context: any) {
        console.log(`[Automation] ACTION: Send Email to ${context.customer?.email || 'unknown'}`, params);
        // TODO: Implement actual email sending logic via Nodemailer/SMTP
    }


    // --- Helpers ---

    private static getValueFromPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}
