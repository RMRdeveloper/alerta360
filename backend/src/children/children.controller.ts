import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';

import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('children')
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) { }

  @Post()
  @ApiOperation({ summary: 'Register a new child' })
  @ApiBody({ type: CreateChildDto })
  @ApiResponse({ status: 201, description: 'The child has been successfully registered.' })
  create(@Body() createChildDto: CreateChildDto) {
    return this.childrenService.create(createChildDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all children' })
  @ApiResponse({ status: 200, description: 'List of all children.' })
  findAll() {
    return this.childrenService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a child by ID' })
  @ApiResponse({ status: 200, description: 'The child details.' })
  @ApiResponse({ status: 404, description: 'Child not found.' })
  findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }
}
