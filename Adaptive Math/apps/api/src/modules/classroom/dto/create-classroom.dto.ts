import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassroomDto {
  @ApiProperty({ description: 'Tên lớp học', example: 'Toán 9A2 - Luyện thi vào 10' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Khối lớp', example: 9, default: 9 })
  @IsInt()
  @Min(6)
  @Max(9)
  @IsOptional()
  grade?: number;

  @ApiProperty({ description: 'Năm học', example: '2026-2027', default: '2026-2027' })
  @IsString()
  @IsOptional()
  academicYear?: string;
}
