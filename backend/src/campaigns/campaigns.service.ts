import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  CampaignDetailDto,
  CampaignSummaryDto,
  DiscountDto,
  MeasureDto,
} from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import type { CreateMeasureDto, UpdateMeasureDto } from './dto/measure.dto';
import type { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';

const DETAIL_INCLUDE = {
  measures: {
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    include: { discounts: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
  },
} satisfies Prisma.CampaignInclude;

type CampaignDetail = Prisma.CampaignGetPayload<{ include: typeof DETAIL_INCLUDE }>;
type MeasureWithDiscounts = CampaignDetail['measures'][number];
type DiscountRow = MeasureWithDiscounts['discounts'][number];

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Kampagnen ──────────────────────────────────────────────
  async list(userId: string): Promise<CampaignSummaryDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const campaigns = await this.prisma.campaign.findMany({
      where: { workspaceId },
      include: DETAIL_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return campaigns.map((c) => this.summaryDto(c));
  }

  async get(userId: string, id: string): Promise<CampaignDetailDto> {
    const campaign = await this.ensureCampaign(userId, id);
    return this.detailDto(campaign);
  }

  async create(userId: string, dto: CreateCampaignDto): Promise<CampaignDetailDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const campaign = await this.prisma.campaign.create({
      data: {
        workspaceId,
        createdById: userId,
        name: dto.name,
        status: dto.status ?? 'draft',
        channels: dto.channels ?? [],
        budget: dto.budget ?? 0,
        spent: dto.spent ?? 0,
        reach: dto.reach ?? 0,
        kpiText: dto.kpiText ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        zeitraum: dto.zeitraum ?? null,
        dueLabel: dto.dueLabel ?? null,
        color: dto.color ?? null,
      },
      include: DETAIL_INCLUDE,
    });
    return this.detailDto(campaign);
  }

  async update(userId: string, id: string, dto: UpdateCampaignDto): Promise<CampaignDetailDto> {
    await this.ensureCampaign(userId, id);

    const data: Prisma.CampaignUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.channels !== undefined) data.channels = dto.channels;
    if (dto.budget !== undefined) data.budget = dto.budget;
    if (dto.spent !== undefined) data.spent = dto.spent;
    if (dto.reach !== undefined) data.reach = dto.reach;
    if (dto.kpiText !== undefined) data.kpiText = dto.kpiText;
    if (dto.startDate !== undefined) data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.zeitraum !== undefined) data.zeitraum = dto.zeitraum;
    if (dto.dueLabel !== undefined) data.dueLabel = dto.dueLabel;
    if (dto.color !== undefined) data.color = dto.color;

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data,
      include: DETAIL_INCLUDE,
    });
    return this.detailDto(campaign);
  }

  async remove(userId: string, id: string): Promise<{ status: string }> {
    await this.ensureCampaign(userId, id);
    await this.prisma.campaign.delete({ where: { id } });
    return { status: 'ok' };
  }

  // ── Maßnahmen ──────────────────────────────────────────────
  async createMeasure(
    userId: string,
    campaignId: string,
    dto: CreateMeasureDto,
  ): Promise<CampaignDetailDto> {
    await this.ensureCampaign(userId, campaignId);
    const order = await this.prisma.measure.count({ where: { campaignId } });
    await this.prisma.measure.create({
      data: {
        campaignId,
        name: dto.name,
        type: dto.type ?? 'organisch',
        status: dto.status ?? 'draft',
        progress: dto.progress ?? 0,
        postsCount: dto.postsCount ?? 0,
        order,
      },
    });
    return this.get(userId, campaignId);
  }

  async updateMeasure(userId: string, measureId: string, dto: UpdateMeasureDto): Promise<MeasureDto> {
    const measure = await this.ensureMeasure(userId, measureId);

    const data: Prisma.MeasureUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.progress !== undefined) data.progress = dto.progress;
    if (dto.postsCount !== undefined) data.postsCount = dto.postsCount;

    const updated = await this.prisma.measure.update({
      where: { id: measure.id },
      data,
      include: { discounts: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
    });
    return this.measureDto(updated);
  }

  async removeMeasure(userId: string, measureId: string): Promise<{ status: string }> {
    const measure = await this.ensureMeasure(userId, measureId);
    await this.prisma.measure.delete({ where: { id: measure.id } });
    return { status: 'ok' };
  }

  // ── Rabattaktionen ─────────────────────────────────────────
  async createDiscount(
    userId: string,
    measureId: string,
    dto: CreateDiscountDto,
  ): Promise<MeasureDto> {
    const measure = await this.ensureMeasure(userId, measureId);
    const order = await this.prisma.discount.count({ where: { measureId } });
    await this.prisma.discount.create({
      data: {
        measureId,
        name: dto.name,
        type: dto.type ?? 'prozent',
        value: dto.value ?? null,
        code: dto.code ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        zeitraum: dto.zeitraum ?? null,
        redeemed: dto.redeemed ?? 0,
        limit: dto.limit ?? 0,
        order,
      },
    });
    const updated = await this.prisma.measure.findUniqueOrThrow({
      where: { id: measure.id },
      include: { discounts: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
    });
    return this.measureDto(updated);
  }

  async updateDiscount(userId: string, discountId: string, dto: UpdateDiscountDto): Promise<DiscountDto> {
    const discount = await this.ensureDiscount(userId, discountId);

    const data: Prisma.DiscountUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.value !== undefined) data.value = dto.value;
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.startDate !== undefined) data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.zeitraum !== undefined) data.zeitraum = dto.zeitraum;
    if (dto.redeemed !== undefined) data.redeemed = dto.redeemed;
    if (dto.limit !== undefined) data.limit = dto.limit;

    const updated = await this.prisma.discount.update({ where: { id: discount.id }, data });
    return this.discountDto(updated);
  }

  async removeDiscount(userId: string, discountId: string): Promise<{ status: string }> {
    const discount = await this.ensureDiscount(userId, discountId);
    await this.prisma.discount.delete({ where: { id: discount.id } });
    return { status: 'ok' };
  }

  // ── Helfer ─────────────────────────────────────────────────
  private async resolveWorkspaceId(userId: string): Promise<string> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) throw new ForbiddenException('Kein Workspace für diesen Nutzer.');
    return membership.workspaceId;
  }

  private async ensureCampaign(userId: string, id: string): Promise<CampaignDetail> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, workspaceId },
      include: DETAIL_INCLUDE,
    });
    if (!campaign) throw new NotFoundException('Kampagne nicht gefunden.');
    return campaign;
  }

  private async ensureMeasure(userId: string, measureId: string): Promise<{ id: string; campaignId: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const measure = await this.prisma.measure.findFirst({
      where: { id: measureId, campaign: { workspaceId } },
      select: { id: true, campaignId: true },
    });
    if (!measure) throw new NotFoundException('Maßnahme nicht gefunden.');
    return measure;
  }

  private async ensureDiscount(userId: string, discountId: string): Promise<{ id: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const discount = await this.prisma.discount.findFirst({
      where: { id: discountId, measure: { campaign: { workspaceId } } },
      select: { id: true },
    });
    if (!discount) throw new NotFoundException('Rabattaktion nicht gefunden.');
    return discount;
  }

  // ── Mapper ─────────────────────────────────────────────────
  private discountDto(d: DiscountRow): DiscountDto {
    return {
      id: d.id,
      measureId: d.measureId,
      name: d.name,
      type: d.type,
      value: d.value,
      code: d.code,
      zeitraum: d.zeitraum,
      redeemed: d.redeemed,
      limit: d.limit,
      order: d.order,
    };
  }

  private measureDto(m: MeasureWithDiscounts): MeasureDto {
    return {
      id: m.id,
      campaignId: m.campaignId,
      name: m.name,
      type: m.type,
      status: m.status,
      progress: m.progress,
      postsCount: m.postsCount,
      order: m.order,
      discounts: m.discounts.map((d) => this.discountDto(d)),
    };
  }

  private summaryDto(c: CampaignDetail): CampaignSummaryDto {
    const discountCount = c.measures.reduce((s, m) => s + m.discounts.length, 0);
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      channels: c.channels,
      budget: c.budget,
      spent: c.spent,
      reach: c.reach,
      kpiText: c.kpiText,
      zeitraum: c.zeitraum,
      dueLabel: c.dueLabel,
      color: c.color,
      measureCount: c.measures.length,
      discountCount,
    };
  }

  private detailDto(c: CampaignDetail): CampaignDetailDto {
    return {
      ...this.summaryDto(c),
      measures: c.measures.map((m) => this.measureDto(m)),
    };
  }
}
