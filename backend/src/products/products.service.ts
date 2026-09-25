import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// ── Product interface ──────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string; // always stored; empty string when not provided
}

// Input types used by service methods — decoupled from the Product interface
// so that optional DTO fields map cleanly without TypeScript complaints.
export interface CreateProductInput {
  name: string;
  price: number;
  category: string;
  description?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

// ── Path to the local JSON data store ─────────────────────────────────────
// Resolves to <project-root>/data/products.json regardless of where Node
// is invoked from, using the compiled output location as the anchor.
const DATA_FILE = path.resolve(__dirname, '..', '..', 'data', 'products.json');

@Injectable()
export class ProductsService {
  // ── Private JSON helpers ─────────────────────────────────────────────────

  /**
   * Reads and parses products.json.
   * Returns an empty array if the file does not exist (first run) or is corrupt.
   */
  private readJson(): Product[] {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        return [];
      }
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Serialises the products array back to products.json with 2-space indent.
   * Creates the data/ directory automatically if it doesn't exist.
   */
  private writeJson(products: Product[]): void {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
  }

  /**
   * Auto-increment: max(existing ids) + 1, or 1 when the list is empty.
   */
  private nextId(products: Product[]): number {
    if (products.length === 0) return 1;
    return Math.max(...products.map((p) => p.id)) + 1;
  }

  // ── Public CRUD methods ──────────────────────────────────────────────────

  findAll(): Product[] {
    return this.readJson();
  }

  findOne(id: number): Product {
    const products = this.readJson();
    const product = products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  create(data: CreateProductInput): Product {
    const products = this.readJson();
    const newProduct: Product = {
      id: this.nextId(products),
      name: data.name,
      price: data.price,
      category: data.category,
      description: data.description ?? '',
    };
    products.push(newProduct);
    this.writeJson(products);
    return newProduct;
  }

  update(id: number, data: UpdateProductInput): Product {
    const products = this.readJson();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    products[index] = { ...products[index], ...data };
    this.writeJson(products);
    return products[index];
  }

  remove(id: number): { message: string } {
    const products = this.readJson();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    products.splice(index, 1);
    this.writeJson(products);
    return { message: `Product with id ${id} deleted successfully` };
  }
}
