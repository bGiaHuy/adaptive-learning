import {Body,Controller,Get,Param,Post,Req,UseGuards} from '@nestjs/common';
import {UserRole} from '@prisma/client';
import {AuthGuard} from '../auth/guards/auth.guard';import {RolesGuard} from '../auth/guards/roles.guard';import {Roles} from '../auth/decorators/roles.decorator';import {CurrentUser} from '../auth/decorators/current-user.decorator';import {MathReviewService} from './math-review.service';
@Controller('student/review') @UseGuards(AuthGuard,RolesGuard) @Roles(UserRole.STUDENT)
export class MathReviewController {
 constructor(private readonly review:MathReviewService){}
 @Get('summary') summary(@CurrentUser('id') id:string){return this.review.summary(id);}
 @Get('conversations') conversations(@CurrentUser('id') id:string){return this.review.conversations(id);}
 @Get('queue') queue(@CurrentUser('id') id:string){return this.review.queue(id);}
 @Post('enroll/:questionId') enroll(@CurrentUser('id') id:string,@Param('questionId') q:string){return this.review.enroll(id,q);}
 @Post('cards/:cardId/reveal') reveal(@CurrentUser('id') id:string,@Param('cardId') c:string,@Body() b:unknown){return this.review.reveal(id,c,b);}
 @Post('logs/:reviewId') rate(@CurrentUser('id') id:string,@Param('reviewId') r:string,@Body() b:unknown){return this.review.review(id,r,b);}
 @Post('feedback') feedback(@CurrentUser('id') id:string,@Body() b:unknown,@Req() req:any){return this.review.feedback(id,b,req.ip||'unknown');}
 @Get('chat/:reviewId') history(@CurrentUser('id') id:string,@Param('reviewId') reviewId:string){return this.review.chatHistory(id,reviewId);}
 @Post('chat') chat(@CurrentUser('id') id:string,@Body() b:unknown,@Req() req:any){return this.review.feedback(id,b,req.ip||'unknown',true);}
 @Post('chat/:reviewId/clear') clear(@CurrentUser('id') id:string,@Param('reviewId') reviewId:string){return this.review.clearChat(id,reviewId);}
}
