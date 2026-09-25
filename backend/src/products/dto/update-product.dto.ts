import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// PartialType makes all CreateProductDto fields optional
// while preserving their validation decorators when a value IS provided.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
