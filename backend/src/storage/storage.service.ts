import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Dünner Wrapper um einen S3-kompatiblen Object-Storage (lokal: MinIO,
 * produktiv: Cloudflare R2 / AWS S3 — nur Env-Werte unterscheiden sich).
 *
 * Presigned URLs werden gegen `STORAGE_PUBLIC_ENDPOINT` signiert, damit der
 * Browser sie direkt aufrufen kann (Upload via PUT, Download/Vorschau via GET).
 */
@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint =
      this.config.get<string>('STORAGE_PUBLIC_ENDPOINT') ??
      this.config.get<string>('STORAGE_ENDPOINT');
    this.bucket = this.config.get<string>('STORAGE_BUCKET') ?? 'g-hub-assets';
    this.client = new S3Client({
      region: this.config.get<string>('STORAGE_REGION') ?? 'us-east-1',
      endpoint,
      // MinIO/R2 brauchen Path-Style-Adressierung (Bucket im Pfad statt Host).
      forcePathStyle:
        (this.config.get<string>('STORAGE_FORCE_PATH_STYLE') ?? 'true') === 'true',
      credentials: {
        accessKeyId: this.config.get<string>('STORAGE_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.config.get<string>('STORAGE_SECRET_ACCESS_KEY') ?? '',
      },
    });
  }

  /** Eindeutiger, workspace-gescopter Objekt-Key (verhindert Kollisionen). */
  buildKey(workspaceId: string, filename: string): string {
    const safe = filename.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-100);
    return `${workspaceId}/${randomUUID()}-${safe}`;
  }

  /** Presigned PUT-URL für den direkten Browser-Upload (Standard: 5 Min gültig). */
  presignUpload(key: string, contentType: string, expiresIn = 300): Promise<string> {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, cmd, { expiresIn });
  }

  /** Presigned GET-URL für Download/Vorschau (Standard: 1 Std gültig). */
  presignDownload(key: string, expiresIn = 3600): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, cmd, { expiresIn });
  }

  /** Objekt aus dem Bucket entfernen (beim Löschen eines Assets). */
  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
