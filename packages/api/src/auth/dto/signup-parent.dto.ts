import { IsEmail, IsString } from 'class-validator';

export class SignupParentDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;
}