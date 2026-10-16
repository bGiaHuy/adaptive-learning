export async function encodeTeacherFiles(files: File[]) {
 if(files.length>5||files.reduce((n,f)=>n+f.size,0)>2*1024*1024) throw new Error('Chọn tối đa 5 tệp, tổng dung lượng 2 MB.');
 return Promise.all(files.map(file=>new Promise<{name:string;base64:string}>((resolve,reject)=>{const reader=new FileReader(); reader.onerror=()=>reject(new Error('Không đọc được tệp'));reader.onload=()=>resolve({name:file.name,base64:String(reader.result).split(',')[1]});reader.readAsDataURL(file);}))); }
