import {
  Controller,
  Get,
  Body,
  Query,
  Param,
  Put,
  ParseUUIDPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UserUpdateValidationPipe } from './pipes/user-update-validation.pipe';
import { RolesGuard } from './guards/roles.guard';
import { ApprovedGuard } from './guards/approved.guard';
import { Roles } from './decorators/roles.decorator';
import { ManageUserPointsDto } from './dto/manage-user-points.dto copy';

@Controller('users')
@UseGuards(new JwtAuthGuard(), new ApprovedGuard())
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'OFFICER')
  @UseGuards(RolesGuard)
  getUsers(@Query() filterDto: GetUsersFilterDto): Promise<User[]> {
    return this.usersService.getUsers(filterDto);
  }

  @Get('profile')
  getProfile(@GetUser() user: User): Promise<User> {
    return this.usersService.getCurrentUser(user.id);
  }

  @Get(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getOne(@Param('id', ParseUUIDPipe) id: number): Promise<User> {
    return this.usersService.getOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  updateUser(
    @Param('id', ParseUUIDPipe) id: number,
    @Body(UserUpdateValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }
  @Put(':id/update-points')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  updatePoints(
    @Param('id', ParseUUIDPipe) id: number,
    @Body() manageUserPointsDto: ManageUserPointsDto,
  ): Promise<User> {
    return this.usersService.updatePoints(id, manageUserPointsDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  deleteUser(@Param('id', ParseUUIDPipe) id: number): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
