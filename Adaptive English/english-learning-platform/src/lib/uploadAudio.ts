export async function uploadAudio(blob: Blob,assignmentId?: string) {
 const mimeType=blob.type.split(';')[0];
 const response=await fetch('/api/audio/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mimeType,size:blob.size,assignmentId})});
 const prepared=await response.json();if(!response.ok)throw new Error(prepared.error||'Không chuẩn bị được bản ghi.');
 if(prepared.uploadMode==='cloudflare') {
  const form=new FormData();form.set('audio',blob,'recording');if(assignmentId)form.set('assignmentId',assignmentId);
  const uploaded=await fetch('/api/audio/upload',{method:'POST',body:form});const result=await uploaded.json();
  if(!uploaded.ok)throw new Error(result.error||'Không tải được bản ghi.');
  return {url:result.url,size:result.size};
 }
 const {upload}=await import('@vercel/blob/client');
 const stored=await upload(prepared.pathname,blob,{access:'private',handleUploadUrl:'/api/audio/upload-token',contentType:mimeType,multipart:blob.size>4*1024*1024});
 return {url:'/api/audio/play?pathname='+encodeURIComponent(stored.pathname),size:blob.size};
}
