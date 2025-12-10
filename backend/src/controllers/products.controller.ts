
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductsController {

    // Create Product (Manual)
    static async createProduct(req: Request, res: Response) {
        try {
            const {
                tenantId,
                type = 'SIMPLE',
                sku,
                name,
                price,
                description,
                stockQuantity,
                variations,
                components
            } = req.body;

            // Basic Validation
            if (!tenantId || !sku || !name) {
                return res.status(400).json({ error: 'Missing required fields: tenantId, sku, name' });
            }

            // 1. Create Base Product
            const product = await prisma.product.create({
                data: {
                    tenantId,
                    userId: tenantId,
                    type,
                    sku,
                    name,
                    price: parseFloat(price) || 0,
                    description,
                    stockQuantity: parseInt(stockQuantity) || 0,
                    isActive: true,
                    weight: 0
                }
            });

            // 2. Handle Variations (if type === VARIATION)
            if (type === 'VARIATION' && variations && Array.isArray(variations)) {
                for (const v of variations) {
                    await prisma.product_variations.create({
                        data: {
                            id: `${product.id}-${v.sku}`,
                            productId: product.id,
                            sku: v.sku,
                            price: parseFloat(v.price) || product.price,
                            stockQuantity: parseInt(v.stockQuantity) || 0,
                            name1: v.name1,
                            value1: v.value1,
                            name2: v.name2,
                            value2: v.value2,
                            updatedAt: new Date()
                        }
                    });
                }
            }

            // 3. Handle Components (if type === BUNDLE)
            if (type === 'BUNDLE' && components && Array.isArray(components)) {
                for (const c of components) {
                    if (c.childProductId) {
                        await prisma.product_components.create({
                            data: {
                                id: `${product.id}-${c.childProductId}`,
                                parentProductId: product.id,
                                childProductId: c.childProductId,
                                quantity: parseInt(c.quantity) || 1,
                                updatedAt: new Date()
                            }
                        });
                    }
                }
            }

            res.status(201).json(product);
        } catch (error: any) {
            console.error('Create Product Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Get Product with Details
    static async getProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await prisma.product.findUnique({
                where: { id },
                include: {
                    variations: true,
                    components: {
                        include: {
                            childProduct: true // Components need the detailed product info
                        }
                    }
                }
            });

            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update Product
    static async updateProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const {
                name, price, stockQuantity, description,
                variations, components, type
            } = req.body;

            // Update Basic Fields
            const product = await prisma.product.update({
                where: { id },
                data: {
                    name,
                    price: parseFloat(price),
                    stockQuantity: parseInt(stockQuantity),
                    description,
                    type // Allow type change? Maybe restricted.
                }
            });

            // Update Variations (Replace logic for simplicity)
            // Ideally diffing, but for MVP replace is safer for "Manual" edits
            if (variations) {
                // Logic to update/create variations would go here.
                // For now, let's focus on Bundles as requested.
            }

            // Update Components (Bundle)
            if (type === 'BUNDLE' && components) {
                // Delete existing
                await prisma.product_components.deleteMany({ where: { parentProductId: id } });

                // Re-create
                for (const c of components) {
                    if (c.childProductId) {
                        await prisma.product_components.create({
                            data: {
                                id: `${id}-${c.childProductId}`,
                                parentProductId: id,
                                childProductId: c.childProductId,
                                quantity: parseInt(c.quantity) || 1,
                                updatedAt: new Date()
                            }
                        });
                    }
                }
            }

            res.json(product);

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
