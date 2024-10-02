import { Injectable } from '@nestjs/common';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET, AWS_SECRET_KEY } from '../../config/config';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string = AWS_S3_BUCKET!;

  constructor() {
    this.s3Client = new S3Client({
      region: AWS_REGION!,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY!,
        secretAccessKey: AWS_SECRET_KEY!,
      },
    });
  }

  async getPresignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    return url;
  }
}
