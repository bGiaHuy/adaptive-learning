import { NextResponse } from 'next/server';
import { readPrivateAudio } from '@/lib/privateAudio';
import { getCurrentUser } from '@/lib/auth';
import { authorizeAudioRead } from '@/lib/audioStorage';
export const dynamic='force-dynamic';
export async function GET(request: Request) {try {
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Chưa đăng nhập'},{status:401});
 const pathname=new URL(request.url).searchParams.get('pathname')||'';await authorizeAudioRead(user,pathname);
 const range=request.headers.get('range');if(range&&!/^bytes=\d*-\d*$/.test(range))return new Response(null,{status:416});
 const result=await readPrivateAudio(pathname,range,request.signal);
 if(![200,206].includes(result.status))return new Response(null,{status:[404,416].includes(result.status)?result.status:502,headers:{'cache-control':'private, no-store'}});
 const headers=new Headers({'Content-Type':result.headers.get('content-type')||'application/octet-stream','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'});
 for(const key of ['content-length','content-range']){const value=result.headers.get(key);if(value)headers.set(key,value);}
 return new Response(result.body,{status:result.status,headers});
 }catch(error:any){return NextResponse.json({error:error.status?'Không có quyền truy cập bản ghi.':'Không tải được bản ghi.'},{status:error.status||502});}}
