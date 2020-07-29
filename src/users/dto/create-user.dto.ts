import { IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'IGN is required' })
  @Length(3, 30, {
    message: 'The IGN must be at least 3 but not longer than 30 characters',
  })
  IGN: string;

  @IsNotEmpty({ message: 'username is required' })
  @Length(3, 30, {
    message:
      'The username must be at least 3 but not longer than 30 characters',
  })
  username: string;

  @IsNotEmpty({ message: 'password is required' })
  @Length(6, 30, {
    message:
      'The password must be at least 6 but not longer than 30 characters',
  })
  password: string;
  ap: number;
  gp: number;
}
