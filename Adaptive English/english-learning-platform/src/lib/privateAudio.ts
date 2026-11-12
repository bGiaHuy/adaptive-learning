import { get, head, put } from '@vercel/blob';

export function cloudflareAudioReady() {
  return Boolean(process.env.CLOUDFLARE_MEDIA_URL && process.env.CLOUDFLARE_DATA_TOKEN);
}
export function privateAudioReady() {
  return cloudflareAudioReady() || Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN));
}
async function cloudflareRequest(pathname: string, method: string, options: {body?: Blob;contentType?: string;range?: string|null;signal?: AbortSignal} = {}) {
  const url=new URL(process.env.CLOUDFLARE_MEDIA_URL!);
  if(url.protocol!=='https:' && !(url.protocol==='http:' && ['localhost','127.0.0.1'].includes(url.hostname))) throw new Error('Private media transport requires HTTPS');
  url.searchParams.set('pathname',pathname);
  const headers=new Headers({authorization:'Bearer '+process.env.CLOUDFLARE_DATA_TOKEN});
  if(options.contentType)headers.set('content-type',options.contentType);
  if(options.range)headers.set('range',options.range);
  return fetch(url,{method,headers,body:options.body,signal:options.signal||AbortSignal.timeout(60000),redirect:'error'});
}
export async function putPrivateAudio(pathname: string,file: Blob,contentType: string) {
  if(!cloudflareAudioReady())return put(pathname,file,{access:'private',contentType,addRandomSuffix:false,allowOverwrite:false});
  const response=await cloudflareRequest(pathname,'PUT',{body:file,contentType});
  if(response.status!==201)throw Object.assign(new Error('Không lưu được bản ghi âm.'),{status:response.status===409?409:502});
  return {pathname};
}
export async function headPrivateAudio(pathname: string) {
  if(!cloudflareAudioReady())return head(pathname);
  const response=await cloudflareRequest(pathname,'HEAD');
  if(!response.ok)throw Object.assign(new Error('Không tìm thấy bản ghi âm.'),{status:response.status===404?404:502});
  return {contentType:response.headers.get('content-type')||'',size:Number(response.headers.get('content-length'))};
}
export async function readPrivateAudio(pathname: string,range: string|null,signal: AbortSignal) {
  if(cloudflareAudioReady())return cloudflareRequest(pathname,'GET',{range,signal});
  const result=await get(pathname,{access:'private',headers:range?{Range:range}:undefined,abortSignal:signal});
  if(!result||result.statusCode!==200)return new Response(null,{status:404});
  const headers=new Headers({'content-type':result.blob.contentType});
  for(const name of ['content-length','content-range']){const value=result.headers.get(name);if(value)headers.set(name,value);}
  return new Response(result.stream,{status:headers.has('content-range')?206:200,headers});
}
