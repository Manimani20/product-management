import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 17',
    description: 'Name of the product',
  })
  @IsString()
  @IsNotEmpty({ message: 'name should not be empty' })
  name: string;

  @ApiProperty({
    example: 79999,
    description: 'Price of the product (must be a positive number)',
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'price must be a number' })
  @IsPositive({ message: 'price must be a positive number' })
  @Min(0.01)
  price: number;

  @ApiProperty({
    example: 'Electronics',
    description: 'Category of the product',
  })
  @IsString()
  @IsNotEmpty({ message: 'category should not be empty' })
  category: string;

  @ApiPropertyOptional({
    example: 'Apple smartphone with A18 chip',
    description: 'Optional description of the product',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
