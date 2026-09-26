import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
  IsEnum,
  IsDateString
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentStatus } from '@prisma/client';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Tiêu đề đề thi / bài tập', example: 'Kiểm tra 15 phút - Căn bậc hai' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả / Hướng dẫn làm bài', example: 'Làm bài trong 15 phút, không sử dụng tài liệu' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Thời lượng làm bài tính bằng phút (0 = không giới hạn thời gian)', example: 15 })
  @IsInt({ message: 'Thời lượng phải là số nguyên' })
  @Min(0, { message: 'Thời lượng tối thiểu là 0 (không giới hạn)' })
  @Max(360, { message: 'Thời lượng tối đa là 360 phút' })
  durationMinutes: number;

  @ApiPropertyOptional({ description: 'Hạn nộp bài (ISO 8601 string)', example: '2026-10-15T23:59:59.000Z' })
  @IsDateString({}, { message: 'Hạn nộp phải là định dạng ngày giờ ISO 8601 hợp lệ' })
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ description: 'Danh sách ID các câu hỏi trong đề thi', type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsArray({ message: 'Danh sách câu hỏi phải là một mảng' })
  @ArrayMinSize(1, { message: 'Đề thi phải có ít nhất 1 câu hỏi' })
  @IsString({ each: true })
  questionIds: string[];

  @ApiPropertyOptional({ description: 'Trạng thái phát hành đề thi', enum: AssignmentStatus, default: AssignmentStatus.PUBLISHED })
  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;
}
