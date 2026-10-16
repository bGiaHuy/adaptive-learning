from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import math,json,textwrap
root=Path('outputs/evidence-review/updated');fig=root/'figures'
font=lambda n:ImageFont.truetype('C:/Windows/Fonts/arial.ttf',n)
colors=['#007f82','#d55438','#4a61a8','#80952a']
def chart(name,title,series,xmin,xmax,ymin,ymax,xlabel,ylabel):
 im=Image.new('RGB',(1800,1050),'white');d=ImageDraw.Draw(im);d.text((105,30),title,font=font(38),fill='#142333')
 x0,y0,x1,y1=170,140,1710,790
 def pos(x,y):return (x0+(x-xmin)/(xmax-xmin)*(x1-x0),y1-(y-ymin)/(ymax-ymin)*(y1-y0))
 for i in range(6):
  y=ymin+(ymax-ymin)*i/5; yy=pos(xmin,y)[1];d.line((x0,yy,x1,yy),fill='#d9dfe3',width=2);d.text((35,yy-14),f'{y:.2f}',font=font(24),fill='#334155')
 for i in range(9):
  x=xmin+(xmax-xmin)*i/8;xx=pos(x,ymin)[0];d.text((xx-20,y1+18),f'{x:g}',font=font(24),fill='#334155')
 d.line((x0,y0,x0,y1,x1,y1),fill='#334155',width=3)
 d.text((700,850),xlabel,font=font(28),fill='#334155');d.text((170,95),ylabel,font=font(25),fill='#334155')
 for k,(label,xs,ys) in enumerate(series):
  pts=[pos(x,y) for x,y in zip(xs,ys)];d.line(pts,fill=colors[k],width=5)
  d.line((170+k%2*780,925+k//2*50,230+k%2*780,925+k//2*50),fill=colors[k],width=6)
  d.text((245+k%2*780,907+k//2*50),label,font=font(25),fill='#172333')
 im.save(fig/name)
xs=[-4+i*.04 for i in range(201)]
ps=[];infos=[]
for b,label in zip([-1.5,-.5,.5,1.5],['Nhận biết','Thông hiểu','Vận dụng','Vận dụng cao']):
 p=[.25+.75/(1+math.exp(-1.2*(x-b))) for x in xs]
 info=[1.2**2*(1-v)*(v-.25)**2/(.75**2*v) for v in p]
 ps.append((f'{label}  b={b}',xs,p));infos.append((f'{label}  b={b}',xs,info))
chart('irt.png','Đường cong đặc trưng câu hỏi 3PL · a = 1,2 · c = 0,25',ps,-4,4,0,1,'Năng lực θ','Xác suất trả lời đúng')
chart('fisher.png','Hàm thông tin Fisher theo bốn mức nhận thức',infos,-4,4,0,.25,'Năng lực θ','Lượng thông tin')
sim=json.loads((root/'simulation.json').read_text())
series=[('Đúng liên tiếp',list(range(9)),sim['bkt'][0]['values']),('Chuỗi đúng sai hỗn hợp',list(range(9)),sim['bkt'][1]['values']),('Khởi tạo 0,45',list(range(9)),sim['bkt'][2]['values']),('Ngưỡng tham khảo 0,85',[0,8],[.85,.85])]
chart('bkt.png','Quỹ đạo BKT từ hàm updateKnowledge trong repo',series,0,8,0,1,'Số lượt trả lời','Xác suất nắm vững')
labels={'staircase_map':'Bậc thang + MAP (repo)','staircase_mle':'Bậc thang + MLE (đối chiếu)','fisher_map':'Fisher + MAP (đối chiếu)'}
for key,title,axis,maximum in [('rmse','Sai số ước lượng · mô phỏng mới ngày 16/10/2026','RMSE',4),('boundaryPercent','Tỷ lệ ước lượng chạm biên ±4 · mô phỏng mới','Tỷ lệ (%)',100)]:
 ss=[(labels[k],[m['questions'] for m in ms],[m[key] for m in ms]) for k,ms in sim['metrics'].items()]
 chart(key+'.png',title,ss,0,24,0,maximum,'Số lượt chẩn đoán',axis)
def diagram(name,title,boxes):
 im=Image.new('RGB',(1800,1100),'white');d=ImageDraw.Draw(im);d.text((70,35),title,font=font(38),fill='#142333')
 for i,(heading,body) in enumerate(boxes):
  y=130+i*225;d.rounded_rectangle((130,y,1670,y+165),radius=15,fill=['#e9f6f3','#eef3fb','#fff4e6','#f3f1f8'][i%4],outline='#607784',width=3)
  d.text((165,y+18),heading,font=font(30),fill='#172333')
  for j,line in enumerate(textwrap.wrap(body,95)):d.text((165,y+65+j*35),line,font=font(26),fill='#334155')
  if i<len(boxes)-1:
   d.line((900,y+170,900,y+215),fill='#607784',width=5);d.polygon([(886,y+200),(914,y+200),(900,y+219)],fill='#607784')
 im.save(fig/name)
diagram('architecture.png','Kiến trúc AdaptiveMath trong repo hiện tại',[
 ('Giao diện React + Vite + KaTeX','Trình duyệt → chẩn đoán, hồ sơ năng lực, lộ trình, luyện tập và không gian giáo viên.'),
 ('API NestJS','Xác thực bằng session cookie HttpOnly; kiểm tra vai trò tại API; thuật toán và trạng thái học do máy chủ quản lý.'),
 ('Dữ liệu PostgreSQL + Prisma','Câu hỏi, phiên chẩn đoán, mức thành thạo, lịch ôn và lớp học. FSRS quản lý lịch ôn giãn cách.'),
 ('Triển khai và khả năng phục hồi','Frontend Vercel, API Render. localStorage giữ đáp án luyện tập chưa gửi; không đồng nghĩa học hoàn toàn offline.')])
diagram('cat-flow.png','Luồng CAT đối chiếu selectStaircase và estimateAbility',[
 ('Khởi tạo phiên và chọn kỹ năng','Ước lượng θ bằng MAP; ưu tiên kỹ năng có ít lượt trả lời; bắt đầu từ mức thấp nhất sẵn có.'),
 ('Chọn câu chưa làm ở mức hiện tại','Xếp theo thông tin Fisher; phá hòa bằng seed để giữ lựa chọn ổn định khi tiếp tục phiên.'),
 ('Cập nhật sau câu trả lời','Đúng → lên mức kế tiếp. Sai lần đầu → câu xác minh cùng mức. Sai lần hai → dừng kỹ năng.'),
 ('Ước lượng lại và tiếp tục','Cập nhật MAP có prior, chặn bước ±0,75 và θ trong ±4; dừng khi không còn câu đủ điều kiện.')])
print('Created',len(list(fig.glob('*.png'))),'figures')

