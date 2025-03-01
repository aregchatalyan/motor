import { IsUUID } from 'class-validator';

export class ConfirmDto {
  @IsUUID()
  secret: string;
}
