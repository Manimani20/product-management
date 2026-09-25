import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

// ── Path helpers ───────────────────────────────────────────────────────────
const DATA_DIR  = path.resolve(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');
const BACKUP_FILE = path.join(DATA_DIR, 'products.backup.json');

// ── Seed data used for e2e tests ──────────────────────────────────────────
const SEED_PRODUCTS = [
  { id: 1, name: 'iPhone 17',    price: 79999, category: 'Electronics', description: 'Apple smartphone' },
  { id: 2, name: 'Nike Air Max', price: 5999,  category: 'Footwear',    description: 'Running shoes' },
];

// ══════════════════════════════════════════════════════════════════════════
describe('Products API (e2e)', () => {
  let app: INestApplication;

  // Backup the real products.json before the suite runs, replace with seed data.
  beforeAll(async () => {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    // Back up live data so tests don't destroy it
    if (fs.existsSync(DATA_FILE)) {
      fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    }

    // Write seed data for tests
    fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf-8');

    // Bootstrap the NestJS app with the same pipes as production
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  // Restore the original products.json after all tests finish.
  afterAll(async () => {
    await app.close();
    if (fs.existsSync(BACKUP_FILE)) {
      fs.copyFileSync(BACKUP_FILE, DATA_FILE);
      fs.unlinkSync(BACKUP_FILE);
    } else {
      // No backup means there was no original file — restore seed
      fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf-8');
    }
  });

  // ── GET /products ─────────────────────────────────────────────────────
  describe('GET /products', () => {
    it('returns 200 with all products as an array', async () => {
      const res = await request(app.getHttpServer()).get('/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('each product has required fields', async () => {
      const res = await request(app.getHttpServer()).get('/products');
      const product = res.body[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('description');
    });
  });

  // ── GET /products/:id ─────────────────────────────────────────────────
  describe('GET /products/:id', () => {
    it('returns 200 with the correct product', async () => {
      const res = await request(app.getHttpServer()).get('/products/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe('iPhone 17');
    });

    it('returns 404 when product does not exist', async () => {
      const res = await request(app.getHttpServer()).get('/products/9999');
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/9999/);
    });

    it('returns 400 for a non-numeric id', async () => {
      const res = await request(app.getHttpServer()).get('/products/abc');
      expect(res.status).toBe(400);
    });
  });

  // ── POST /products ────────────────────────────────────────────────────
  describe('POST /products', () => {
    it('creates a product and returns 201 with the new product', async () => {
      const payload = {
        name: 'MacBook Pro',
        price: 150000,
        category: 'Electronics',
        description: 'Apple laptop',
      };
      const res = await request(app.getHttpServer())
        .post('/products')
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('MacBook Pro');
      expect(res.body.price).toBe(150000);
    });

    it('creates a product without description (description defaults to empty string)', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'No Desc', price: 100, category: 'Other' });
      expect(res.status).toBe(201);
      expect(res.body.description).toBe('');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ price: 100 }); // missing name and category
      expect(res.status).toBe(400);
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('returns 400 for a negative price', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Bad', price: -50, category: 'Other' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for unknown fields (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'X', price: 10, category: 'Other', unknownField: true });
      expect(res.status).toBe(400);
      expect(res.body.message[0]).toMatch(/should not exist/);
    });
  });

  // ── PUT /products/:id ─────────────────────────────────────────────────
  describe('PUT /products/:id', () => {
    it('updates a product and returns 200', async () => {
      const res = await request(app.getHttpServer())
        .put('/products/1')
        .send({ price: 89999 });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.price).toBe(89999);
      expect(res.body.name).toBe('iPhone 17'); // unchanged
    });

    it('returns 404 when product does not exist', async () => {
      const res = await request(app.getHttpServer())
        .put('/products/9999')
        .send({ price: 100 });
      expect(res.status).toBe(404);
    });

    it('returns 400 for a negative price in update', async () => {
      const res = await request(app.getHttpServer())
        .put('/products/1')
        .send({ price: -1 });
      expect(res.status).toBe(400);
    });
  });

  // ── DELETE /products/:id ──────────────────────────────────────────────
  describe('DELETE /products/:id', () => {
    it('deletes a product and returns 200 with a success message', async () => {
      // First create a throwaway product
      const created = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Throwaway', price: 1, category: 'Other' });
      const id = created.body.id;

      const res = await request(app.getHttpServer()).delete(`/products/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/);
    });

    it('returns 404 when product does not exist', async () => {
      const res = await request(app.getHttpServer()).delete('/products/9999');
      expect(res.status).toBe(404);
    });

    it('product is truly gone after deletion', async () => {
      // Create then delete
      const created = await request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Delete Me', price: 1, category: 'Other' });
      const id = created.body.id;
      await request(app.getHttpServer()).delete(`/products/${id}`);

      const check = await request(app.getHttpServer()).get(`/products/${id}`);
      expect(check.status).toBe(404);
    });
  });
});
