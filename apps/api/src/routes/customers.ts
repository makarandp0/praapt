import fs from 'fs';
import path from 'path';

import { Contracts } from '@praapt/shared';
import { desc, eq, sql } from 'drizzle-orm';
import { Router } from 'express';

import { db, customerFaces, customers } from '../db.js';
import { NotFoundError } from '../lib/errors.js';
import { IMAGES_DIR } from '../lib/imageUtils.js';
import { logger } from '../lib/logger.js';
import { createRouteBuilder } from '../lib/routeBuilder.js';
import { addCustomerFaceCapture, createCustomerRecord } from '../services/customerRegistration.js';

const router = Router();
const routes = createRouteBuilder(router);

/**
 * POST /customers
 * Register a customer and their face captures
 */
routes.fromContract(Contracts.registerCustomer, async (req, res) => {
  const { name, pin, captures } = req.body;
  const createdFiles: string[] = [];

  try {
    const result = await db.transaction(async (tx) => {
      const newCustomer = await createCustomerRecord(tx, { name, pin });
      const faces = [];
      const timestamp = Date.now();

      for (let index = 0; index < captures.length; index += 1) {
        const { face, filePath } = await addCustomerFaceCapture(tx, {
          customerId: newCustomer.id,
          capture: captures[index],
          name,
          index,
          timestamp,
        });

        createdFiles.push(filePath);
        faces.push(face);
      }

      return { customer: newCustomer, faces };
    });

    logger.info(
      { customerId: result.customer.id, faceCount: result.faces.length },
      'Customer registration created',
    );

    res.status(201);
    return {
      ok: true as const,
      customerId: result.customer.id,
      faceCount: result.faces.length,
      imagePaths: result.faces.map((face) => face.imagePath),
    };
  } catch (err) {
    if (createdFiles.length > 0) {
      createdFiles.forEach((filePath) => {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // best-effort cleanup
        }
      });
    }
    throw err;
  }
});

/**
 * GET /customers
 * List customers with face capture counts
 */
routes.fromContract(Contracts.listCustomers, async () => {
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      pin: customers.pin,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      faceCount: sql<number>`count(${customerFaces.id})`.mapWith(Number),
    })
    .from(customers)
    .leftJoin(customerFaces, eq(customerFaces.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt));

  const payload = rows.map((row) => ({
    id: row.id,
    name: row.name,
    pin: row.pin,
    faceCount: row.faceCount ?? 0,
    createdAt: row.createdAt?.toISOString() ?? null,
    updatedAt: row.updatedAt?.toISOString() ?? null,
  }));

  return {
    ok: true as const,
    customers: payload,
    count: payload.length,
  };
});

/**
 * PATCH /customers/:id
 * Update customer name and/or pin
 */
routes.fromContract(Contracts.updateCustomer, async (req) => {
  const { id } = req.params;
  const updates: Partial<typeof customers.$inferInsert> = {};

  if (req.body.name !== undefined) {
    updates.name = req.body.name;
  }
  if (req.body.pin !== undefined) {
    updates.pin = req.body.pin;
  }

  const [customer] = await db
    .update(customers)
    .set(updates)
    .where(eq(customers.id, id))
    .returning();

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  const [{ faceCount }] = await db
    .select({ faceCount: sql<number>`count(*)`.mapWith(Number) })
    .from(customerFaces)
    .where(eq(customerFaces.customerId, customer.id));

  return {
    ok: true as const,
    customer: {
      id: customer.id,
      name: customer.name,
      pin: customer.pin,
      faceCount: faceCount ?? 0,
      createdAt: customer.createdAt?.toISOString() ?? null,
      updatedAt: customer.updatedAt?.toISOString() ?? null,
    },
  };
});

/**
 * DELETE /customers/:id
 * Remove customer and their face captures
 */
routes.fromContract(Contracts.deleteCustomer, async (req) => {
  const { id } = req.params;

  const faces = await db.transaction(async (tx) => {
    const faceRows = await tx
      .select({ imagePath: customerFaces.imagePath })
      .from(customerFaces)
      .where(eq(customerFaces.customerId, id));

    await tx.delete(customerFaces).where(eq(customerFaces.customerId, id));

    const [deleted] = await tx.delete(customers).where(eq(customers.id, id)).returning();

    if (!deleted) {
      throw new NotFoundError('Customer not found');
    }

    return faceRows;
  });

  await Promise.all(
    faces.map(async ({ imagePath }) => {
      const filePath = path.join(IMAGES_DIR, imagePath);
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        logger.warn(
          { err: error, customerId: id, filePath },
          'Failed to delete customer face image file',
        );
      }
    }),
  );

  logger.info({ customerId: id }, 'Customer deleted');

  return { ok: true as const, customerId: id };
});

export default router;
