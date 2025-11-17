import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const rows = [
    { email: 'alice@example.com', name: 'Alice' },
    { email: 'bob@example.com', name: 'Bob' },
    { email: 'carol@example.com', name: 'Carol' }
  ];

  await knex('users')
    .insert(rows)
    .onConflict('email')
    .ignore();
}

