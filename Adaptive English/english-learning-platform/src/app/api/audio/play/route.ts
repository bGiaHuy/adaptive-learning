import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';
import { authorizeAudioRead } from '@/lib/audioStorage';
export const dynamic='force-dynamic';
export async function GET(request: Request) {try {
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Chưa đăng nhập'},{status:401});
 const pathname=new URL(request.url).searchParams.get('pathname')||'';await authorizeAudioRead(user,pathname);
 const range=request.headers.get('range');if(range&&!/^bytes=\d*-\d*$/.test(range))return new Response(null,{status:416});
 const result=await get(pathname,{access:'private',headers:range?{Range:range}:undefined,abortSignal:request.signal});
 if(!result||result.statusCode!==200)return new Response(null,{status:404});
 const headers=new Headers({'Content-Type':result.blob.contentType,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'});
 for(const key of ['content-length','content-range']){const value=result.headers.get(key);if(value)headers.set(key,value);}
 return new Response(result.stream,{status:result.headers.has('content-range')?206:200,headers});
 }catch(error:any){return NextResponse.json({error:error.status?'Không có quyền truy cập bản ghi.':'Không tải được bản ghi.'},{status:error.status||502});}}
