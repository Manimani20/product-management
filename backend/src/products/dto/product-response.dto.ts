import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Typed response schema for a single product.
 * Used by Swagger @ApiResponse to generate accurate response docs.
 */
export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'Auto-generated numeric product ID' })
  id: number;

  @ApiProperty({ example: 'iPhone 17', description: 'Name of the product' })
  name: string;

  @ApiProperty({ example: 79999, description: 'Price of the product' })
  price: number;

  @ApiProperty({ example: 'Electronics', description: 'Category of the product' })
  category: string;

  @ApiPropertyOptional({
    example: 'Apple smartphone with A18 chip',
    description: 'Description of the product',
  })
  description: string;
}

/**
 * Typed response schema for a successful delete.
 */
export class DeleteResponseDto {
  @ApiProperty({ example: 'Product with id 1 deleted successfully' })
  message: string;
}

/**
 * Typed response schema for 400 / 404 error responses from NestJS.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Product with id 1 not found' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['name should not be empty', 'price must be a positive number'],
      },
    ],
    description: 'Error message(s) — string for 404, array of strings for 400',
  })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
