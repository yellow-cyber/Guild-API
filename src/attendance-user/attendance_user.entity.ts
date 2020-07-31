import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  Column,
} from 'typeorm';
import { User } from 'src/users/users.entity';
import { Attendance } from 'src/attendances/attendances.entity';
import { Mark } from './marks.categories';

@Entity()
export class Attendance_User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(
    () => User,
    user => user.records,
    { cascade: true, onDelete: 'CASCADE' },
  )
  public user: User;

  @Column('uuid')
  userId: number;

  @Column('uuid')
  attendanceId: number;

  @ManyToOne(
    () => Attendance,
    attendance => attendance.participants,
    { cascade: true, onDelete: 'CASCADE' },
  )
  public attendance: Attendance;

  @Column()
  mark: string;

  @Column('double precision')
  percentage: number;
}