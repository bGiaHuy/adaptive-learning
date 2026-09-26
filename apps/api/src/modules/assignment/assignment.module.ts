import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService]
})
export class AssignmentModule {}
