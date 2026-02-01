import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { ChildResponseDto } from './dto/child-response.dto';

import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { childrenSwaggerDescriptions } from './children.constants';

@ApiTags('children')
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new child' })
  @ApiBody({ type: CreateChildDto })
  @ApiResponse({
    status: 201,
    description: 'The child has been successfully registered.',
  })
  create(@Body() createChildDto: CreateChildDto) {
    return this.childrenService.create(createChildDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all children' })
  @ApiResponse({
    status: 200,
    description: childrenSwaggerDescriptions.listAll,
    type: [ChildResponseDto],
  })
  findAll() {
    return this.childrenService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a child by ID' })
  @ApiResponse({
    status: 200,
    description: childrenSwaggerDescriptions.details,
    type: ChildResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: childrenSwaggerDescriptions.notFound,
  })
  findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }
}
