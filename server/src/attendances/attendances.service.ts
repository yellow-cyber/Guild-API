import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendancesRepository } from './attendances.repository';
import { Attendance } from './attendances.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Activity } from '../activities/activities.entity';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance_User } from '../attendance-user/attendance_user.entity';
import { Guild } from 'src/guild/guild.entity';
import { ActivityCategory } from 'src/activities/activities.categories';
import { AttendancesStatus } from './attendances.categories';
import { GetAttendanceFilterDto } from './dto/get-attendance-filter.dto';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(AttendancesRepository)
    private attendancesRepository: AttendancesRepository,
  ) {}
  async getAttendances(
    filterDto: GetAttendanceFilterDto,
  ): Promise<Attendance[]> {
    return await this.attendancesRepository.getAttendances(filterDto);
  }
  async getOne(id: number): Promise<Attendance> {
    const found = await this.attendancesRepository.findOne(id, {
      relations: ['participants', 'items', 'activityPoint'],
    });
    if (!found) throw new NotFoundException('Attendance Not Found');
    return found;
  }
  async getParticipants(id: number): Promise<any> {
    const records = Attendance_User.find({
      where: { attendanceId: id },
      relations: ['user'],
    });
    let participants = (await records).map(record => {
      return record.user.IGN;
    });
    return participants;
  }
  async createAttendance(
    author: string,
    createAttendanceDto: CreateAttendanceDto,
  ): Promise<any> {
    const {
      activityId,
      remarks,
      result,
      activityPointId,
    } = createAttendanceDto;
    const activity = await Activity.findOne(activityId);
    if (!activity) throw new NotFoundException('Activity Not Found');
    const { name, category } = activity;
    try {
      const guild = await Guild.findOne({ name: 'Bank' }); //issue - ??
      const attendance: Attendance = await this.attendancesRepository.save({
        name,
        remarks,
        result,
        author,
        activity,
        guild,
        category,
        activityPointId,
      });
      return attendance;
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
  async updateAttendance(
    attendanceId: number,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    try {
      const attendance = await this.attendancesRepository.findOne(attendanceId);
      if (!attendance) throw new NotFoundException('Attendance does not exist');
      if (attendance.status === AttendancesStatus.PAID)
        throw new BadRequestException('Attendance is already paid!');
      const updatedAttendance = { ...attendance, ...updateAttendanceDto };

      return await this.attendancesRepository.save(updatedAttendance);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async deleteAttendance(id: number): Promise<any> {
    //issue =
    const result = await this.attendancesRepository.delete(id);
    if (result.affected && result.affected <= 0) {
      throw new NotFoundException('Attendance does not exist');
    }
  }
  async defaultPay(author: string, id: number): Promise<any> {
    /**issue Double check this nigga */
    /** Maybe add paid to AU record */

    /** Check if attendance exists */
    const attendance = await this.attendancesRepository.findOne(id);
    if (attendance) {
      /** Check if attendance is of type DEFAULT */
      if (attendance.category === ActivityCategory.PAYDAY) {
        Logger.error(
          `${author} failed to activate an ${attendance.name} of type ${attendance.category}`,
          '',
          'AttendancePayment',
        );
        throw new UnauthorizedException(
          'Attendance is not set to default type',
        );
      }

      /** Check if attendance is already PAID*/
      if (attendance.status === AttendancesStatus.PAID) {
        Logger.error(
          `${author} failed to activate a PAID ${attendance.name}`,
          '',
          'AttendancePayment',
        );
        throw new UnauthorizedException('Attendance is already PAID!');
      }

      const { gp_total } = attendance;
      /** FIND ALL Attendance & User Records */
      const [AURecords, AURecordsCount] = await Attendance_User.findAndCount({
        where: { attendance },
        relations: ['user'],
      });
      /** Compute how much gp will each players receive */
      const totalGPToBeObtained: number = gp_total / AURecordsCount;

      if (AURecords && AURecordsCount > 0) {
        /** Distribute the GP */
        AURecords.map(async AURecord => {
          AURecord.user.gp += totalGPToBeObtained;
          await Attendance_User.save(AURecord);
          Logger.log(
            `${AURecord.user.IGN} received ${totalGPToBeObtained} GP from ${attendance.name}`,
          );
        });

        /**issue Delete the AU Record ?? Maybe don't delete? Just add paid? */
        // await Attendance_User.delete({ attendance });

        /** Mark the attendance as paid */
        attendance.status = AttendancesStatus.PAID;

        /** Return the saved attendance */

        const newAttendance = await this.attendancesRepository.save(attendance);
        Logger.log(
          `${author} successfully activated ${newAttendance.name} payment!`,
          'AttendancePayment',
        );
        return newAttendance;
      } else {
        Logger.error(
          `${author} failed to activate ${attendance.name} payment with 0 participants!`,
          '',
          'AttendancePayment',
        );
        throw new NotFoundException('Participant(s) not found');
      }
    } else {
      Logger.error(
        `${author} failed to activate an attendance that does not exist!`,
        '',
        'AttendancePayment',
      );
      throw new NotFoundException('Attendance does not exist');
    }
  }
}
