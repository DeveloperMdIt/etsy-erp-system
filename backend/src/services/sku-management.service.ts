import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SKUManagementService {
    /**
     * Generate next SKU for a user
     * Format: {prefix}{number} e.g., "10001", "10002"
     */
    async generateSKU(userId: string): Promise<string> {
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        if (!settings) {
            throw new Error('User settings not found');
        }

        const prefix = settings.skuPrefix;
        const nextId = settings.nextProductId;

        // Generate SKU
        const sku = `${prefix}${nextId.toString().padStart(3, '0')}`;

        // Increment counter
        await prisma.$executeRawUnsafe(
            `UPDATE user_settings SET nextProductId = nextProductId + 1 WHERE userId = ?`,
            userId
        );

        return sku;
    }

    /**
     * Validate SKU and suggest next if it exists
     */
    async validateSKU(sku: string, userId: string): Promise<{ valid: boolean; suggestedSKU?: string }> {
        // Check if SKU exists
        const existing = await prisma.product.findFirst({
            where: {
                sku,
                tenantId: (await prisma.user.findUnique({ where: { id: userId } }))?.tenantId || '',
            },
        });

        if (!existing) {
            return { valid: true };
        }

        // SKU exists, generate next one
        const suggestedSKU = await this.generateSKU(userId);

        return {
            valid: false,
            suggestedSKU,
        };
    }

    /**
     * Get next product ID without incrementing
     */
    async getNextProductId(userId: string): Promise<number> {
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        if (!settings) {
            throw new Error('User settings not found');
        }

        return settings.nextProductId;
    }

    /**
     * Preview what the next SKU will look like
     */
    async previewNextSKU(userId: string): Promise<string> {
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        if (!settings) {
            throw new Error('User settings not found');
        }

        const prefix = settings.skuPrefix;
        const nextId = settings.nextProductId;

        return `${prefix}${nextId.toString().padStart(3, '0')}`;
    }
}

export default new SKUManagementService();
