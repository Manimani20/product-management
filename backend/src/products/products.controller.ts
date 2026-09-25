import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService, Product } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductResponseDto,
  DeleteResponseDto,
  ErrorResponseDto,
} from './dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── GET /products ──────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Returns the full list of products from the local JSON store.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all products.',
    type: ProductResponseDto,
    isArray: true,
  })
  findAll(): Product[] {
    return this.productsService.findAll();
  }

  // ── GET /products/:id ─────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by ID',
    description: 'Returns a single product. Throws 404 if not found.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'The requested product.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Product {
    return this.productsService.findOne(id);
  }

  // ── POST /products ────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Creates a product and persists it to products.json. ' +
      'ID is auto-generated. description is optional.',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation failed — missing required fields, negative price, or unknown properties.',
    type: ErrorResponseDto,
  })
  create(@Body() createProductDto: CreateProductDto): Product {
    return this.productsService.create(createProductDto);
  }

  // ── PUT /products/:id ─────────────────────────────────────────────────
  @Put(':id')
  @ApiOperation({
    summary: 'Update a product by ID',
    description:
      'Partially updates a product — send only the fields you want to change.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Product {
    return this.productsService.update(id, updateProductDto);
  }

  // ── DELETE /products/:id ──────────────────────────────────────────────
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a product by ID',
    description: 'Removes a product from the JSON store.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully.',
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): { message: string } {
    return this.productsService.remove(id);
  }
}
