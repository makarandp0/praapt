import fs from 'fs';

import { Contracts } from '@praapt/shared';
import { Router } from 'express';

import { db } from '../db.js';
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

export default router;
