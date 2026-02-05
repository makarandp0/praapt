import fs from 'fs';
import path from 'path';

import { db, customers, customerFaces } from '../db.js';
import { embedBase64 } from '../faceClient.js';
import { ValidationError } from '../lib/errors.js';
import { IMAGES_DIR, parseImageToBuffer, sanitizeName, stripDataUrlPrefix } from '../lib/imageUtils.js';

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbClient = typeof db | TransactionClient;

export async function createCustomerRecord(
  tx: DbClient,
  input: { name: string; pin: string },
) {
  const [customer] = await tx
    .insert(customers)
    .values({ name: input.name, pin: input.pin })
    .returning();
  return customer;
}

export async function addCustomerFaceCapture(
  tx: DbClient,
  input: {
    customerId: string;
    capture: string;
    name: string;
    index: number;
    timestamp: number;
  },
) {
  const safeName = sanitizeName(input.name || 'customer');
  const { buffer, ext } = parseImageToBuffer(input.capture);
  const fileName = `customer-${safeName}-${input.customerId}-${input.index + 1}-${input.timestamp}.${ext}`;
  const filePath = path.join(IMAGES_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  let embedding: number[];
  try {
    const b64 = stripDataUrlPrefix(input.capture);
    const result = await embedBase64(b64);
    embedding = result.vector;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    throw new ValidationError(`Failed to extract face - ${msg}`);
  }

  const [face] = await tx
    .insert(customerFaces)
    .values({
      customerId: input.customerId,
      faceEmbedding: embedding,
      imagePath: fileName,
    })
    .returning();

  return { face, filePath };
}
