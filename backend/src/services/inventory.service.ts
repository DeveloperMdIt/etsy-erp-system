import { PrismaClient } from '@prisma/client';
import { ActivityLogService, LogType, LogAction } from './activity-log.service';

const prisma = new PrismaClient();

export class InventoryService {

    /**
     * Get total stock for a product across all locations
     */
    static async getProductStock(tenantId: string, productId: string) {
        const items = await prisma.inventoryItem.findMany({
            where: { tenantId, productId },
            include: { storageLocation: true }
        });

        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            productId,
            totalQuantity,
            locations: items.map(item => ({
                locationId: item.storageLocationId,
                locationName: item.storageLocation.name,
                quantity: item.quantity,
                type: item.storageLocation.type
            }))
        };
    }

    /**
     * Add stock to a specific location (Goods In)
     */
    static async addStock(tenantId: string, userId: string, productId: string, locationName: string, quantity: number) {
        if (quantity <= 0) throw new Error('Quantity must be positive');

        // 1. Find or Create Location
        let location = await prisma.storageLocation.findUnique({
            where: { tenantId_name: { tenantId, name: locationName } }
        });

        if (!location) {
            location = await prisma.storageLocation.create({
                data: {
                    tenantId,
                    name: locationName,
                    type: 'SHELF' // Default
                }
            });
        }

        // 2. Update Inventory Item
        const item = await prisma.inventoryItem.upsert({
            where: {
                productId_storageLocationId: {
                    productId,
                    storageLocationId: location.id
                }
            },
            create: {
                tenantId,
                productId,
                storageLocationId: location.id,
                quantity
            },
            update: {
                quantity: { increment: quantity }
            }
        });

        // 3. Update Global Product Stock (Cache)
        await this.syncProductStock(tenantId, productId);

        // 4. Log
        await ActivityLogService.log(
            LogType.INFO,
            LogAction.UPDATE_PRODUCT, // Or specific INVENTORY_ADD
            `Added ${quantity} to ${locationName}`,
            userId,
            tenantId,
            { productId, locationName, quantity }
        );

        return item;
    }

    /**
     * Remove stock from a location (Pick)
     */
    static async removeStock(tenantId: string, userId: string, productId: string, locationName: string, quantity: number) {
        if (quantity <= 0) throw new Error('Quantity must be positive');

        const location = await prisma.storageLocation.findUnique({
            where: { tenantId_name: { tenantId, name: locationName } }
        });

        if (!location) throw new Error(`Location ${locationName} not found`);

        const item = await prisma.inventoryItem.findUnique({
            where: {
                productId_storageLocationId: {
                    productId,
                    storageLocationId: location.id
                }
            }
        });

        if (!item || item.quantity < quantity) {
            throw new Error(`Insufficient stock in ${locationName}. Available: ${item?.quantity || 0}`);
        }

        const updated = await prisma.inventoryItem.update({
            where: { id: item.id },
            data: { quantity: { decrement: quantity } }
        });

        // Cleanup empty if policy says so? Or keep 0? Keep 0 is safer for history.
        // But if 0, maybe delete to keep table clean?
        // Let's keep 0 for now.

        await this.syncProductStock(tenantId, productId);

        await ActivityLogService.log(
            LogType.INFO,
            LogAction.UPDATE_PRODUCT,
            `Removed ${quantity} from ${locationName}`,
            userId,
            tenantId,
            { productId, locationName, quantity }
        );

        return updated;
    }

    /**
     * Move stock between locations
     */
    static async moveStock(tenantId: string, userId: string, productId: string, fromLocation: string, toLocation: string, quantity: number) {
        await this.removeStock(tenantId, userId, productId, fromLocation, quantity);
        await this.addStock(tenantId, userId, productId, toLocation, quantity);
    }

    /**
     * Syncs the cached 'stockQuantity' in the Product model from the InventoryItems
     */
    public static async syncProductStock(tenantId: string, productId: string) {
        const { totalQuantity } = await this.getProductStock(tenantId, productId);

        await prisma.product.update({
            where: { id: productId },
            data: { stockQuantity: totalQuantity }
        });
    }

    /**
     * Suggest picking locations for an order (FIFO or optimized)
     * Returns a list of picks: [{ location, quantity }, ...]
     */
    static async suggestPicks(tenantId: string, productId: string, requiredQuantity: number) {
        const items = await prisma.inventoryItem.findMany({
            where: { tenantId, productId, quantity: { gt: 0 } },
            include: { storageLocation: true },
            orderBy: { quantity: 'desc' } // Simple heuristic: Pick from largest pile first to minimize split? Or Asc for clearing bins?
            // Let's use DESC (Empty largest bin first? No.)
            // Let's use FIFO logic if we had dates.
            // For now: Just take from the one with enough stock if possible.
        });

        let remaining = requiredQuantity;
        const picks = [];

        for (const item of items) {
            if (remaining <= 0) break;

            const take = Math.min(remaining, item.quantity);
            picks.push({
                locationName: item.storageLocation.name,
                locationId: item.storageLocation.id,
                quantity: take
            });
            remaining -= take;
        }

        if (remaining > 0) {
            // Not enough stock!
            return { fullyAvailable: false, missing: remaining, picks };
        }

        return { fullyAvailable: true, missing: 0, picks };
    }
}
