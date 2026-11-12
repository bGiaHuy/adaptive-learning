import { NextResponse } from 'next/server';
import { cloudflareAudioReady, putPrivateAudio } from '@/lib/privateAudio';
import { getCurrentUser } from '@/lib/auth';
import { audioStorageReady, authorizeAudioUpload, validateAudio, newAudioPath, audioPlaybackUrl, MAX_AUDIO_SIZE } from '@/lib/audioStorage';
export async function POST(request: Request) {try {
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Chưa đăng nhập'},{status:401});
 if(!audioStorageReady())return NextResponse.json({error:'Kho ghi âm chưa được cấu hình.'},{status:503});
 if(request.headers.get('content-type')?.includes('application/json')) {
 const body=await request.json();const mime=validateAudio(String(body.mimeType||''),Number(body.size));const assignmentId=body.assignmentId||null;
 await authorizeAudioUpload(user,assignmentId);return NextResponse.json({pathname:newAudioPath(user.id,mime,assignmentId),uploadMode:cloudflareAudioReady()?'cloudflare':'vercel'});
 }
 if(Number(request.headers.get('content-length'))>(cloudflareAudioReady()?MAX_AUDIO_SIZE+1024*1024:4*1024*1024))return NextResponse.json({error:'Tệp ghi âm quá lớn.'},{status:413});
 const form=await request.formData();const file=form.get('audio');
 if(!file||typeof file==='string')return NextResponse.json({error:'Thiếu bản ghi.'},{status:400});
 const mime=validateAudio(file.type,file.size);if(!cloudflareAudioReady()&&file.size>3*1024*1024)return NextResponse.json({error:'Tệp lớn cần tải trực tiếp vào kho.'},{status:413});
 const assignmentId=String(form.get('assignmentId')||'')||null;await authorizeAudioUpload(user,assignmentId);
 const blob=await putPrivateAudio(newAudioPath(user.id,mime,assignmentId),file,mime);
 return NextResponse.json({success:true,url:audioPlaybackUrl(blob.pathname),size:file.size,mimeType:mime});
 }catch(error:any){return NextResponse.json({error:error.message||'Tải ghi âm thất bại.'},{status:error.status||500});}}
