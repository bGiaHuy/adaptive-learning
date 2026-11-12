import prisma from './prisma';
import { headPrivateAudio, privateAudioReady } from './privateAudio';
import { randomUUID } from 'crypto';
export const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
export const AUDIO_TYPES = ['audio/webm','audio/mp4','audio/ogg','audio/wav','audio/x-wav','audio/mpeg'];
type Actor = { id: string; role: string };
const idPattern = /^[a-zA-Z0-9_-]{1,100}$/;
export function validateAudio(type: string, size: number) {
 const mime = type.split(';')[0].toLowerCase();
 if (!AUDIO_TYPES.includes(mime) || !Number.isInteger(size) || size < 500 || size > MAX_AUDIO_SIZE) throw Object.assign(new Error('Chọn bản ghi âm hợp lệ, từ 500 bytes đến 20 MB.'),{status:400});
 return mime;
}
export function audioStorageReady() { return privateAudioReady(); }
export function parseAudioPath(pathname: string) {
 const parts=pathname.split('/');
 const assignment=parts.length===5 && parts[2]==='assignments';
 const practice=parts.length===4 && parts[2]==='practice';
 if(parts[0]!=='audio'||!idPattern.test(parts[1]||'')||(!assignment&&!practice)|| (assignment&&!idPattern.test(parts[3]))||!/^[a-f0-9-]{36}\.(webm|mp4|ogg|wav|mp3)$/.test(parts[parts.length-1])) throw Object.assign(new Error('Đường dẫn ghi âm không hợp lệ.'),{status:400});
 return {ownerId:parts[1],assignmentId:assignment?parts[3]:null};
}
export async function authorizeAudioUpload(user: Actor, assignmentId?: string|null) {
 if(!['student','admin'].includes(user.role)) throw Object.assign(new Error('Chỉ học sinh được gửi bản ghi.'),{status:403});
 if(!assignmentId)return;
 if(!idPattern.test(assignmentId))throw Object.assign(new Error('Mã bài tập không hợp lệ.'),{status:400});
 const assignment=await prisma.assignment.findUnique({where:{id:assignmentId},include:{classroom:{include:{members:{select:{studentId:true}}}}}});
 if(!assignment)throw Object.assign(new Error('Không tìm thấy bài tập.'),{status:404});
 if(user.role!=='admin'&&!assignment.classroom.members.some(m=>m.studentId===user.id))throw Object.assign(new Error('Bạn không thuộc lớp này.'),{status:403});
 if(assignment.skill!=='speaking'||assignment.status==='closed')throw Object.assign(new Error('Bài không nhận bản ghi Speaking hoặc đã thu bài.'),{status:409});
 const submission=await prisma.submission.findFirst({where:{assignmentId,studentId:user.id},select:{status:true}});
 if(submission&&!['draft','in_progress'].includes(submission.status))throw Object.assign(new Error('Bài đã nộp, không thể ghi đè.'),{status:409});
}
export function newAudioPath(userId: string,mime: string,assignmentId?: string|null) {
 if(!idPattern.test(userId))throw new Error('Mã người dùng không hợp lệ.');
 const ext=mime==='audio/mp4'?'mp4':mime==='audio/ogg'?'ogg':mime.includes('wav')?'wav':mime==='audio/mpeg'?'mp3':'webm';
 return 'audio/'+userId+'/'+(assignmentId?'assignments/'+assignmentId:'practice')+'/'+randomUUID()+'.'+ext;
}
export function audioPlaybackUrl(pathname: string) { return '/api/audio/play?pathname='+encodeURIComponent(pathname); }
export function audioPathFromUrl(url: unknown) {
 if(typeof url!=='string'||!url.startsWith('/api/audio/play?'))throw Object.assign(new Error('Bản ghi phải được tải vào kho riêng của hệ thống.'),{status:400});
 const pathname=new URL(url,'https://local.invalid').searchParams.get('pathname')||'';parseAudioPath(pathname);
 if(audioPlaybackUrl(pathname)!==url)throw Object.assign(new Error('Link ghi âm không hợp lệ.'),{status:400});
 return pathname;
}
export async function validateSubmissionAudio(url: unknown,user: Actor,assignmentId: string) {
 const pathname=audioPathFromUrl(url);const scope=parseAudioPath(pathname);
 if(scope.ownerId!==user.id||scope.assignmentId!==assignmentId)throw Object.assign(new Error('Bản ghi không thuộc học sinh hoặc bài tập này.'),{status:403});
 const blob=await headPrivateAudio(pathname);validateAudio(blob.contentType,blob.size);return audioPlaybackUrl(pathname);
}
export async function authorizeAudioRead(user: Actor,pathname: string) {
 const scope=parseAudioPath(pathname);
 if(scope.ownerId===user.id||user.role==='admin')return;
 if(user.role!=='teacher'||!scope.assignmentId)throw Object.assign(new Error('Không có quyền nghe bản ghi.'),{status:403});
 const submission=await prisma.submission.findFirst({where:{assignmentId:scope.assignmentId,studentId:scope.ownerId,audioUrl:audioPlaybackUrl(pathname),assignment:{classroom:{teacherId:user.id}}},select:{id:true}});
 if(!submission)throw Object.assign(new Error('Không có quyền nghe bản ghi.'),{status:403});
}
