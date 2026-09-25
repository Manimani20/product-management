import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService, Product } from './products.service';

// ── Mock the entire 'fs' module ────────────────────────────────────────────
// This keeps tests fast and isolated — no actual disk I/O.
jest.mock('fs');
import * as fs from 'fs';

// ── Sample data ────────────────────────────────────────────────────────────
const SAMPLE_PRODUCTS: Product[] = [
  { id: 1, name: 'iPhone 17',       price: 79999, category: 'Electronics', description: 'Apple smartphone' },
  { id: 2, name: 'Nike Air Max',    price: 5999,  category: 'Footwear',    description: 'Running shoes' },
  { id: 3, name: 'Kindle Paperwhite', price: 12999, category: 'Electronics', description: 'E-reader' },
];

// ── Helper: configure fs mocks for a given list ────────────────────────────
function mockFsWithProducts(products: Product[]) {
  (fs.existsSync as jest.Mock).mockReturnValue(true);
  (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(products));
  (fs.writeFileSync as jest.Mock).mockImplementation(() => undefined);
  (fs.mkdirSync as jest.Mock).mockImplementation(() => undefined);
}

// ══════════════════════════════════════════════════════════════════════════
describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
  });

  // ── findAll ──────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('returns all products from the JSON file', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      const result = service.findAll();
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('iPhone 17');
      expect(result[1].name).toBe('Nike Air Max');
    });

    it('returns empty array when JSON file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = service.findAll();
      expect(result).toEqual([]);
    });

    it('returns empty array when JSON file is corrupt', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('not valid json {{');
      const result = service.findAll();
      expect(result).toEqual([]);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('returns the correct product by id', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      const product = service.findOne(2);
      expect(product.id).toBe(2);
      expect(product.name).toBe('Nike Air Max');
    });

    it('throws NotFoundException when product id does not exist', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      expect(() => service.findOne(999)).toThrow(NotFoundException);
      expect(() => service.findOne(999)).toThrow('Product with id 999 not found');
    });
  });

  // ── create ───────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('creates a product with auto-incremented id', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      const newProduct = service.create({
        name: 'MacBook Pro',
        price: 150000,
        category: 'Electronics',
        description: 'Apple laptop',
      });
      expect(newProduct.id).toBe(4); // max(1,2,3) + 1
      expect(newProduct.name).toBe('MacBook Pro');
      expect(newProduct.price).toBe(150000);
      expect(newProduct.category).toBe('Electronics');
      expect(newProduct.description).toBe('Apple laptop');
    });

    it('uses id 1 when the list is empty', () => {
      mockFsWithProducts([]);
      const newProduct = service.create({
        name: 'First Product',
        price: 100,
        category: 'Other',
      });
      expect(newProduct.id).toBe(1);
    });

    it('stores empty string when description is not provided', () => {
      mockFsWithProducts([]);
      const newProduct = service.create({
        name: 'No Description',
        price: 100,
        category: 'Other',
      });
      expect(newProduct.description).toBe('');
    });

    it('writes the updated products array to the JSON file', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      service.create({ name: 'Test', price: 99, category: 'Other' });
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      const written = JSON.parse((fs.writeFileSync as jest.Mock).mock.calls[0][1]);
      expect(written).toHaveLength(4);
      expect(written[3].name).toBe('Test');
    });
  });

  // ── update ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('updates the specified fields of a product', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      const updated = service.update(1, { price: 89999, description: 'Updated desc' });
      expect(updated.id).toBe(1);
      expect(updated.name).toBe('iPhone 17');      // unchanged
      expect(updated.price).toBe(89999);            // updated
      expect(updated.description).toBe('Updated desc'); // updated
    });

    it('preserves fields that are not included in the update payload', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      const updated = service.update(2, { price: 4999 });
      expect(updated.name).toBe('Nike Air Max');   // unchanged
      expect(updated.category).toBe('Footwear');   // unchanged
    });

    it('throws NotFoundException when product id does not exist', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      expect(() => service.update(999, { price: 100 })).toThrow(NotFoundException);
      expect(() => service.update(999, { price: 100 })).toThrow('Product with id 999 not found');
    });

    it('writes the updated products array to the JSON file', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      service.update(1, { price: 89999 });
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('removes the product and returns a success message', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      const result = service.remove(2);
      expect(result.message).toBe('Product with id 2 deleted successfully');
    });

    it('removes the correct product from the array', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      service.remove(2);
      const written = JSON.parse((fs.writeFileSync as jest.Mock).mock.calls[0][1]);
      expect(written).toHaveLength(2);
      expect(written.find((p: Product) => p.id === 2)).toBeUndefined();
    });

    it('throws NotFoundException when product id does not exist', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      expect(() => service.remove(999)).toThrow(NotFoundException);
      expect(() => service.remove(999)).toThrow('Product with id 999 not found');
    });

    it('writes the updated products array to the JSON file', () => {
      mockFsWithProducts(SAMPLE_PRODUCTS);
      service.remove(1);
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });
  });
});
