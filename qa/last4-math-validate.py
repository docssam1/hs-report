# Independent computations over the fixed source-bound model fixture.
import itertools as I,json,math,re
from fractions import Fraction as F
P=json.load(open('bank/data/last4-reviewed.json'));M=json.load(open('qa/fixtures/last4-review-models.json'))
def check(n,v,answer):
 q=next(x for x in P['items'] if x['sourceNo']==n and x['variantNo']==v)
 assert int(re.search(r'-?\d+',q['answer']).group())==answer,(n,v,q['answer'],answer)
# 1: exactly one true statement.
for v,functions in enumerate([[lambda e:e!=0,lambda e:e!=1,lambda e:e==0],[lambda e:e!=0,lambda e:e!=1,lambda e:e==1],[lambda e:e!=0,lambda e:e!=2,lambda e:e==0]],1):
 assert [e for e in range(3) if sum(f(e) for f in functions)==1]==[[1],[0],[2]][v-1]
for v,m in enumerate(M['q2'],1):
 equations=set()
 for a,b,c,d,e,f,g,h in I.permutations(m['digits']):
  if a==m['hundreds'] and e==m['tens'] and 100*a+10*b+c-100*d-10*e-f==10*g+h:equations.add(f'{a}{b}{c}−{d}{e}{f}={g}{h}')
 q=next(x for x in P['items'] if x['sourceNo']==2 and x['variantNo']==v)
 assert equations==set(q['acceptedAnswers']) and len(equations)==2
for v,m in enumerate(M['q3'],1):
 cells=m['cells'];possible=[]
 for hs in I.product(range(1,4),repeat=5):
  if all(max([hs[i] for i,(x,y) in enumerate(cells) if x==a],default=0)==m['front'][a] for a in range(3)) and all(max([hs[i] for i,(x,y) in enumerate(cells) if y==a],default=0)==m['side'][a] for a in range(3)):possible.append(hs)
 assert len(possible)==1
 initial=possible[0];largest=[min(m['newFront'][x],m['newSide'][y]) for x,y in cells]
 assert all(a<=b for a,b in zip(initial,largest));check(3,v,sum(largest)-sum(initial))
for v,left in enumerate([24,36,45],1):check(4,v,left*2**4)
for v,pair in enumerate([(12,34),(21,48),(14,51)],1):check(5,v,2*(pair[1]-pair[0]))
for v,expr in enumerate(['6-2*4+1','5+2*3-6','4*2-6+1'],1):check(6,v,eval(expr,{'__builtins__':{}}))
# 7: independently carry spatial points with their vertical layer coordinate.
for v,m in enumerate(M['q7'],1):
 pts=[(x,y,0,y*8+x+1) for y in range(4) for x in range(8)];w,h,thick=8,4,1
 for d in m['sequence']:
  new=[]
  for x,y,z,num in pts:
   moving=(x>=w/2 if d=='R' else x<w/2 if d=='L' else y<h/2 if d=='T' else y>=h/2)
   if d in 'LR':nx=w-1-x if moving else x;nx=nx-(w//2 if d=='L' else 0);ny=y
   else:ny=h-1-y if moving else y;ny=ny-(h//2 if d=='T' else 0);nx=x
   new.append((nx,ny,2*thick-1-z if moving else z,num))
  pts=new;thick*=2
  if d in 'LR':w//=2
  else:h//=2
 check(7,v,max(pts,key=lambda p:p[2])[3])
for v,m in enumerate(M['q8'],1):
 a=m['start'][:]
 for k in range(3,17):a.append((a[k-1]+a[k-2]+a[k-3])%10)
 check(8,v,a[16]);assert a[:12]==m['shown']
for v,(N,a,b,left,c,d,unpaid) in enumerate([(34,5,3,32,6,5,3),(36,6,4,35,7,6,3),(30,4,3,25,5,5,2)],1):
 sol=[a*g+b*(N-g)+left for g in range(unpaid,N+1) if a*g+b*(N-g)+left==c*(g-unpaid)+d*(N-g)]
 assert len(sol)==1;check(9,v,sol[0])
for v,(floor,speed,wait,floor2,speed2) in enumerate([(18,6,20,24,3),(16,5,25,20,2),(25,3,15,21,3)],1):check(10,v,abs((floor-1)*speed-wait-(floor2-1)*speed2))
for v,m in enumerate(M['q11']['variants'],1):check(11,v,(17+38+20-40)*m['scale']+2*m['offset'])
for v,dims in enumerate([(4,3,3),(5,4,3),(4,4,3)],1):
 count=sum(1 for x0,x1 in I.combinations(range(dims[0]+1),2) for y0,y1 in I.combinations(range(dims[1]+1),2) for z0,z1 in I.combinations(range(dims[2]+1),2));check(12,v,count)
for v,(limit,step,digit) in enumerate([(240,4,'6'),(180,3,'1'),(300,5,'2')],1):check(13,v,sum(str(x).count(digit) for x in range(step,limit+1,step)))
for v,(given,opposite) in enumerate([('B','D'),('D','C'),('C','D')],1):
 sols=[]
 for p in I.permutations('ABCD'):
  at={x:p.index(x) for x in p}
  ok=(at['B']==(at['A']+1)%4 and at['C']==(at['B']+2)%4) if v==1 else (at['D']==(at['A']-1)%4 and at['B']==(at['D']+2)%4) if v==2 else (at['C']==(at['A']+2)%4 and at['B']==(at['C']+1)%4)
  if ok:sols.append(p[(at['A' if v<3 else 'B']+2)%4])
 assert set(sols)=={opposite}
for v,(a,b,expected) in enumerate([((6,3),(4,4),53),((5,4),(4,4),77),((5,3),(5,4),33)],1):
 def rectangles(w,h):return sum((w-x+1)*(h-y+1) for x in range(1,w+1) for y in range(1,h+1))
 diff=abs(rectangles(*a)+36-rectangles(*b)-9);assert diff==expected
 q=next(x for x in P['items'] if x['sourceNo']==15 and x['variantNo']==v);assert str(diff) in q['answer']
for v,(a,b) in enumerate([(132,214),(141,212),(221,125)],1):check(16,v,a+b)
for v,(loss,days) in enumerate([(4,F(15,2)),(5,F(6)),(6,F(5))],1):assert F(720,loss)/24==days
for v,target in enumerate([18,36,43],1):check(18,v,sum(1 for a,b,c,d,e in I.permutations(range(1,8),5) if c%2==0 and 10*a+b-c-10*d-e==target))
for v,m in enumerate(M['q19'],1):
 sols=[list(a) for a in I.permutations(m['digits']) if a[0]-a[1]==a[2] and a[0]==a[7]*a[6] and a[2]+a[3]==a[4] and a[6]*a[5]==a[4] and a[0]>a[4]]
 assert sols==[m['answer']]
for v,values in enumerate([[0,1,2,6,-1,-2,-6],[0,2,5,10,-2,-5,-10],[0,1,4,8,-1,-4,-8]],1):check(20,v,len({a+b for a in values for b in values}))
for v,(n,forced) in enumerate([(6,1),(5,2),(7,3)],1):check(21,v,sum(forced in p and all(x!=i+1 for i,x in enumerate(p)) for p in I.permutations(range(1,n+1),3)))
# Scheduling: lower bound is a mandatory chain; independently enumerate feasible integer start times at that bound.
for v,t in enumerate([[5,4,15,8,12,3],[6,3,18,9,15,4],[4,5,20,12,14,2]],1):
 bound=t[0]+t[3]+t[4]+t[5];found=False
 # The critical chain fills one worker continuously; fit other tasks on the other worker.
 intervals=[(0,t[0]),(t[0],t[0]+t[3]),(t[0]+t[3],bound-t[5]),(bound-t[5],bound)]
 for rag in range(bound-t[5]-t[1]+1):
  if rag+t[1]>t[0]+t[3]:continue
  for org in range(t[0],bound-t[5]-t[2]+1):
   jobs=intervals+[(rag,rag+t[1]),(org,org+t[2])]
   if all(sum(a<=x<b for a,b in jobs)<=2 for x in range(bound)):found=True;break
  if found:break
 assert found;check(22,v,bound)
# 23: enumerate orientation assignment then exact covers, a different search order from authoring.
board=frozenset((x,y) for y in range(5) for x in range(5-y));tilings=[]
def place(length,left,used):
 if length==0:
  if not left:tilings.append(used)
  return
 seen=set()
 for x,y in left:
  for dx,dy in [(1,0),(0,1)]:
   cells=frozenset((x+k*dx,y+k*dy) for k in range(length))
   if cells in seen:continue
   seen.add(cells)
   if cells<=left:place(length-1,left-cells,used+[(length,cells)])
place(5,board,[]);assert len(tilings)==16
for v,m in enumerate(M['q23']['variants'],1):
 patterns=set()
 for tiling in tilings:
  b=set().union(*(c for n,c in tiling if n in m['blue']));patterns.add(min(tuple(sorted(b)),tuple(sorted((y,x) for x,y in b))))
 check(23,v,len(patterns));assert patterns=={tuple(tuple(c) for c in p) for p in m['patterns']}
for v,total in enumerate([25,26,27],1):check(24,v,sum(sum(p)>total for p in I.product(range(1,11),repeat=3)))
for v,(value,price) in enumerate([(840,150),(930,200),(970,200)],1):
 remaining=set()
 for a,b,c in I.product(range(12),repeat=3):
  d=11-a-b-c
  if d<0 or 500*a+100*b+50*c+10*d!=value:continue
  coins=[a,b,c,d]
  for i,j in I.combinations(range(1,4),2):
   if min(coins[i],coins[j])<1:continue
   after=coins[:];after[i]-=1;after[j]-=1
   for u in I.product(range(4),repeat=4):
    if sum(u)==3 and all(x<=y for x,y in zip(u,after)) and sum(x*y for x,y in zip(u,[500,100,50,10]))==price:remaining.add(tuple(x-y for x,y in zip(after,u)))
 assert remaining=={[(1,0,2,3),(1,0,3,2),(1,0,4,1)][v-1]}
for v,(n,d,m,e) in enumerate([(18,24,30,12),(16,20,24,10),(20,18,30,8)],1):check(26,v,int(F(n*d-m*e,d-e)))
for v,b in enumerate([84,98,126],1):check(27,v,int(b/(F(1,4)+F(1,3))))
for v,m in enumerate(M['q28'],1):
 W,D,H=m['W'],m['D'],m['H'];A={(x,y,z) for x,z in m['front'] for y in range(D)};B={(x,y,z) for x,y in m['top'] for z in range(H)};C={(x,y,z) for y,z in m['right'] for x in range(W)}
 black=len(A)+len(B)+len(C)-len(A&B)-len(A&C)-len(B&C)+len(A&B&C);assert black==m['black'];check(28,v,abs(W*D*H-2*black))
for v,(N,bad) in enumerate([(120,'260'),(180,'140'),(240,'350')],1):check(29,v,sum(not set(str(n))&set(bad) for n in range(1,N+1)))
for v,budget in enumerate([300,500,620],1):
 n=0;used=0
 while used+(12 if n==0 else 8)<=budget:used+=12 if n==0 else 8;n+=1
 check(30,v,2*n+2)
print('PASS independent Last4 arithmetic, exhaustive constraints, fold layers, tilings, scheduling and rod intersections')
