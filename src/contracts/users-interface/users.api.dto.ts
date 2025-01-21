import { IsDate, IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDTO {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  dob: Date;
};
