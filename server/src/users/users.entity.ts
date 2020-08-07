import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserStatus, UserRole } from './users.categories';
import { Transaction } from './transactions.entity';
import { Attendance_User } from '../attendance-user/attendance_user.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ unique: true })
  IGN: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column('double precision', { default: () => 0 })
  ap: number;

  @Column('double precision', { default: () => 0 })
  gp: number;

  @Column('timestamp', { default: () => 'LOCALTIMESTAMP' })
  createdAt: Date;

  @Column()
  salt: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: string;

  @OneToMany(
    () => Transaction,
    transaction => transaction.user,
  )
  public transactions!: Transaction[];

  @OneToMany(
    () => Attendance_User,
    attendanceUser => attendanceUser.user,
  )
  public records!: Attendance_User[];

  //issue you're about to make a donations table user-item
  //issue and a redemption table user-item
}