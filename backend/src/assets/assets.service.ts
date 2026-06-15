import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AssetDto, UploadUrlDto } from '@g-hub/shared';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import type { CreateAssetDto } from './dto/create-asset.dto';
import type { QueryAssetsDto } from './dto/query-assets.dto';

type AssetRow = Prisma.AssetGetPayload<object>;

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /** Presigned PUT-URL + Objekt-Schlüssel für den direkten Browser-Upload. */
  async requestUploadUrl(userId: string, dto: RequestUploadUrlDto): Promise<UploadUrlDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const storageKey = this.storage.buildKey(workspaceId, dto.filename);
    const uploadUrl = await this.storage.presignUpload(storageKey, dto.mime);
    return { storageKey, uploadUrl };
  }

  async list(userId: string, query: QueryAssetsDto): Promise<AssetDto[]> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const where: Prisma.AssetWhereInput = { workspaceId };
    if (query.kind) where.kind = query.kind;
    const assets = await this.prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(assets.map((a) => this.toDto(a)));
  }

  async get(userId: string, id: string): Promise<AssetDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const asset = await this.prisma.asset.findFirst({ where: { id, workspaceId } });
    if (!asset) throw new NotFoundException('Asset nicht gefunden.');
    return this.toDto(asset);
  }

  async create(userId: string, dto: CreateAssetDto): Promise<AssetDto> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    // Sicherheit: der vom Client gelieferte Key muss im Workspace-Präfix liegen.
    if (!dto.storageKey.startsWith(`${workspaceId}/`)) {
      throw new BadRequestException('Ungültiger storageKey für diesen Workspace.');
    }
    const asset = await this.prisma.asset.create({
      data: {
        workspaceId,
        uploadedById: userId,
        tag: dto.tag,
        kind: dto.kind,
        mime: dto.mime,
        size: dto.size,
        storageKey: dto.storageKey,
        channel: dto.channel ?? null,
      },
    });
    return this.toDto(asset);
  }

  async remove(userId: string, id: string): Promise<{ status: string }> {
    const workspaceId = await this.resolveWorkspaceId(userId);
    const asset = await this.prisma.asset.findFirst({ where: { id, workspaceId } });
    if (!asset) throw new NotFoundException('Asset nicht gefunden.');
    await this.storage.deleteObject(asset.storageKey);
    await this.prisma.asset.delete({ where: { id: asset.id } });
    return { status: 'deleted' };
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

  private async toDto(a: AssetRow): Promise<AssetDto> {
    return {
      id: a.id,
      tag: a.tag,
      kind: a.kind,
      mime: a.mime,
      size: a.size,
      channel: a.channel,
      uploadedById: a.uploadedById,
      createdAt: a.createdAt.toISOString(),
      url: await this.storage.presignDownload(a.storageKey),
    };
  }
}
