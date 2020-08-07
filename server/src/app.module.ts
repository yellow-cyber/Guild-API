import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UserHttpModule } from './users/users-http.module';
import { AuthHttpModule } from './auth/auth-http.module';
import { ActivityHttpModule } from './activities/activities-http.module';
import { ActivityPointsHttpModule } from './activity-points/activities-http.module';
import { AttendancesHttpModule } from './attendances/attendances-http.module';
import { ItemsHttpModule } from './items/items-http.module';
import { AttendanceItemHttpModule } from './attendance-item/attendance_item-http.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserHttpModule,
    AuthHttpModule,
    ActivityHttpModule,
    ActivityPointsHttpModule,
    AttendancesHttpModule,
    ItemsHttpModule,
    AttendanceItemHttpModule,
  ],
})
export class AppModule {
  constructor(private connection: Connection) {}
}