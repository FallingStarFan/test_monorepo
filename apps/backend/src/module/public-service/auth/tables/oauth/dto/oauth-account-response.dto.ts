import { ApiProperty } from '@nestjs/swagger';

export class OAuthAccountDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  provider!: string;
  providerAccountId!: string;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}
