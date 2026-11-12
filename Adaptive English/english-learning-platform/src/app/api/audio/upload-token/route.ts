import { NextResponse } from 'next/server';
import { cloudflareAudioReady } from '@/lib/privateAudio';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getCurrentUser } from '@/lib/auth';
import { audioStorageReady,parseAudioPath,authorizeAudioUpload,MAX_AUDIO_SIZE,AUDIO_TYPES } from '@/lib/audioStorage';
export async function POST(request: Request) {try {
 if(cloudflareAudioReady())return NextResponse.json({error:'Vui lòng tải lại trang để dùng kho ghi âm mới.'},{status:409});
 if(!audioStorageReady())return NextResponse.json({error:'Kho ghi âm chưa được cấu hình.'},{status:503});
 const body=await request.json() as HandleUploadBody;
 const result=await handleUpload({request,body,onBeforeGenerateToken:async pathname=>{
 const user=await getCurrentUser();if(!user)throw Object.assign(new Error('Chưa đăng nhập'),{status:401});
 const scope=parseAudioPath(pathname);if(scope.ownerId!==user.id)throw Object.assign(new Error('Bản ghi không thuộc bạn.'),{status:403});
 await authorizeAudioUpload(user,scope.assignmentId);
 return {allowedContentTypes:AUDIO_TYPES,maximumSizeInBytes:MAX_AUDIO_SIZE,addRandomSuffix:false,allowOverwrite:false,validUntil:Date.now()+10*60*1000};
 }});return NextResponse.json(result);
 }catch(error:any){return NextResponse.json({error:error.message||'Không cấp được quyền tải ghi âm.'},{status:error.status||400});}}
