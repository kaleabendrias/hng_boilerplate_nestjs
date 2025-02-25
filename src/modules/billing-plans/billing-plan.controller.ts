import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { BillingPlanService } from './billing-plan.service';
import { skipAuth } from '../../helpers/skipAuth';
import { BillingPlanDto } from './dto/billing-plan.dto';

@ApiTags('Billing Plans')
@Controller('billing-plans')
export class BillingPlanController {
  constructor(private readonly billingPlanService: BillingPlanService) {}

  @Post('/')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create billing plans' })
  @ApiBody({ type: BillingPlanDto })
  @ApiResponse({ status: 201, description: 'Billing plan created successfully.', type: BillingPlanDto })
  @ApiResponse({ status: 200, description: 'Billing plan already exists in the database.', type: [BillingPlanDto] })
  async createBillingPlan(@Body() createBillingPlanDto: BillingPlanDto) {
    return this.billingPlanService.createBillingPlan(createBillingPlanDto);
  }

  @skipAuth()
  @Get('/')
  @ApiOperation({ summary: 'Get all billing plans' })
  @ApiResponse({ status: 200, description: 'Billing plans retrieved successfully.', type: [BillingPlanDto] })
  @ApiResponse({ status: 404, description: 'No billing plans found.' })
  async getAllBillingPlans() {
    return this.billingPlanService.getAllBillingPlans();
  }

  @skipAuth()
  @Get('/:id')
  @ApiOperation({ summary: 'Get single billing plan by ID' })
  @ApiResponse({ status: 200, description: 'Billing plan retrieved successfully', type: BillingPlanDto })
  @ApiResponse({ status: 400, description: 'Invalid billing plan ID' })
  @ApiResponse({ status: 404, description: 'Billing plan not found' })
  async getSingleBillingPlan(@Param('id') id: string) {
    return this.billingPlanService.getSingleBillingPlan(id);
  }
}
