import{r as f,j as e,s as R,L as w}from"./index-Ba5hCIa5.js";const T=({dk:x,lab:g,isLabDone:a,markLabDone:h,onExercisePassed:d})=>{const[i,S]=f.useState([]),[n,u]=f.useState(-1),[p,k]=f.useState([{text:"gk@devops-lab:~$ _  // Type a command below",isCommand:!1}]),[v,o]=f.useState(""),l=f.useRef(null);f.useEffect(()=>{l.current&&(l.current.scrollTop=l.current.scrollHeight)},[p]);const c=s=>{const r=s.trim();if(!r)return;S(t=>[r,...t]),u(-1);const m=E(r);k(t=>[...t,{text:"gk@devops-lab:~$",cmdText:r,isCommand:!0},...m.output?[{text:m.output,isError:m.isError}]:[]]),g.exercises.forEach(t=>{a(t.id)||t.check(m.output,r)&&(h(t.id),setTimeout(()=>{k(j=>[...j,{text:t.ok,isSuccess:!0}]),R(`✓ Exercise passed! +${t.xp} XP`,"rgba(0,217,160,.12)"),d()},300))}),o("")},y=s=>{if(s.key==="Enter")c(v);else if(s.key==="ArrowUp"){if(s.preventDefault(),n<i.length-1){const r=n+1;u(r),o(i[r])}}else if(s.key==="ArrowDown")if(s.preventDefault(),n>0){const r=n-1;u(r),o(i[r])}else u(-1),o("")},E=s=>{const r=s.trim(),m=r.split(/\s+/),t=m[0];if(t==="pwd")return{output:"/home/gk",isError:!1};if(t==="ls")return r.includes("/etc")?{output:`total 1.2M
drwxr-xr-x 1 root root 4096 Jan 1 00:00 .
drwxr-xr-x 1 root root 4096 Jan 1 00:00 ..
-rw-r--r-- 1 root root 2.2K Jan 1 00:00 passwd
-rw-r--r-- 1 root root 1.5K Jan 1 00:00 hosts
-rw-r--r-- 1 root root 400  Jan 1 00:00 hostname
-rw-r----- 1 root shadow 1.2K Jan 1 00:00 shadow`,isError:!1}:{output:`total 24
drwxr-xr-x 1 gk gk 4096 Jan 1 00:00 .
drwxr-xr-x 1 root root 4096 Jan 1 00:00 ..
-rw-r--r-- 1 gk gk   33 Jan 1 00:00 notes.txt
drwxr-xr-x 1 gk gk 4096 Jan 1 00:00 devops-lab`,isError:!1};if(t==="mkdir")return{output:"",isError:!1};if(t==="touch")return{output:"",isError:!1};if(t==="echo"){const b=r.match(/echo\s+"?([^">]+)"?\s*(?:>.*)?$/);return r.includes(">")?{output:"",isError:!1}:{output:b?b[1].replace(/"/g,""):"",isError:!1}}if(t==="cat")return r.includes("/etc/passwd")?{output:`root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
gk:x:1000:1000:GK DevOps:/home/gk:/bin/bash`,isError:!1}:r.includes("notes.txt")?{output:"DevOps is culture",isError:!1}:{output:"cat: file not found",isError:!0};if(t==="id")return{output:"uid=1000(gk) gid=1000(gk) groups=1000(gk),4(adm),24(cdrom),27(sudo),46(plugdev)",isError:!1};if(t==="chmod")return{output:"",isError:!1};if(t==="find")return r.includes("-user root")?{output:`/etc/passwd
/etc/shadow
/etc/hosts
/etc/hostname
/etc/resolv.conf`,isError:!1}:{output:`/home/gk/notes.txt
/home/gk/devops-lab`,isError:!1};if(t==="grep")return r.includes("/etc/passwd")&&r.includes("root")?{output:`root:x:0:0:root:/root:/bin/bash
operator:x:11:0:operator:/root:/sbin/nologin`,isError:!1}:r.includes("-c")&&r.includes("bash")?{output:"2",isError:!1}:r.includes("bash")?{output:`/bin/bash
/usr/bin/bash`,isError:!1}:{output:"",isError:!1};if(t==="awk")return r.includes("'{print $1}'")||r.includes("print $1")?{output:`root
daemon
bin
gk`,isError:!1}:r.includes("NR>=3")||r.includes("NR>=")?{output:`bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync`,isError:!1}:{output:`root
daemon
bin
gk`,isError:!1};if(t==="sed")return{output:`root:x:0:0:root:/root:/bin/sh
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
gk:x:1000:1000:GK DevOps:/home/gk:/bin/sh`,isError:!1};if(t==="ps")return{output:`USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  18508  2844 ?        Ss   00:00   0:01 /sbin/init
root       100  0.0  0.0  14432  1524 ?        Ss   00:00   0:00 sshd
gk        1001  0.1  0.2  23456  4096 pts/0    Ss   00:00   0:00 bash`,isError:!1};if(t==="df")return{output:`Filesystem      Size  Used Avail Use% Mounted on
overlay          50G  8.2G   39G  18% /
tmpfs            64M     0   64M   0% /dev
/dev/sda1        50G  8.2G   39G  18% /`,isError:!1};if(t==="free")return{output:`              total        used        free      shared  buff/cache   available
Mem:           3906        1234        1456         128        1215        2340
Swap:          2048           0        2048`,isError:!1};if(t==="pgrep")return{output:`1001 bash
1042 bash`,isError:!1};if(t==="ip"){if(r.includes("addr"))return{output:`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0`,isError:!1};if(r.includes("route"))return{output:`default via 172.17.0.1 dev eth0
172.17.0.0/16 dev eth0 proto kernel scope link src 172.17.0.2`,isError:!1}}if(t==="ss"||t==="netstat")return{output:`State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
LISTEN 0      128    0.0.0.0:22         0.0.0.0:*
LISTEN 0      128    0.0.0.0:80         0.0.0.0:*
LISTEN 0      5      127.0.0.1:5432    0.0.0.0:*`,isError:!1};if(t==="ping")return{output:`PING google.com (142.250.182.46) 56(84) bytes of data.
64 bytes from 142.250.182.46: icmp_seq=1 ttl=116 time=12.3 ms
64 bytes from 142.250.182.46: icmp_seq=2 ttl=116 time=11.8 ms
64 bytes from 142.250.182.46: icmp_seq=3 ttl=116 time=12.1 ms
--- google.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`,isError:!1};if(t==="nslookup"||t==="dig")return{output:`Server: 8.8.8.8
Address: 8.8.8.8#53
Non-authoritative answer:
Name: kubernetes.io
Address: 147.75.40.148`,isError:!1};if(t==="git")return r.includes("init")?{output:"Initialized empty Git repository in /home/gk/myapp/.git/",isError:!1}:r.includes("config")?{output:"",isError:!1}:r.includes("add")?{output:"",isError:!1}:r.includes("commit")?{output:`[main (root-commit) a1b2c3d] initial commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md`,isError:!1}:r.includes("log")?{output:"a1b2c3d initial commit",isError:!1}:r.includes("status")?{output:`On branch main
nothing to commit, working tree clean`,isError:!1}:{output:"usage: git [command]",isError:!1};if(t==="docker")return r.includes("pull")?{output:`Using default tag: latest
latest: Pulling from library/nginx
Pull complete
Status: Downloaded newer image for nginx:alpine`,isError:!1}:r.includes("run")?{output:"a3f2c1d4e5b6c7d8e9f0a1b2c3d4e5f6",isError:!1}:r.includes("ps")?{output:`CONTAINER ID   IMAGE          COMMAND                  CREATED        STATUS        PORTS                  NAMES
a3f2c1d4e5b6   nginx:alpine   "/docker-entrypoint…"   2 seconds ago  Up 2 seconds  0.0.0.0:8080->80/tcp   my-nginx`,isError:!1}:r.includes("images")?{output:`REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
nginx        alpine    abc123def456   2 weeks ago   23.4MB
myapp        v1        def456abc123   1 minute ago  142MB`,isError:!1}:r.includes("stop")?{output:"my-nginx",isError:!1}:r.includes("rm")?{output:"my-nginx",isError:!1}:r.includes("logs")?{output:'172.17.0.1 - - [01/Jan/2024:00:00:01 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.68.0"',isError:!1}:r.includes("history")?{output:`IMAGE          CREATED BY                                      SIZE
abc123def456   CMD ["nginx" "-g" "daemon off;"]                 0B
               EXPOSE map[80/tcp:{}]                            0B
               COPY file:xxx in /                              23.4MB`,isError:!1}:r.includes("build")?{output:`[+] Building 12.3s
 => [1/5] FROM node:18-alpine
 => [2/5] WORKDIR /app
 => [3/5] COPY package*.json ./
 => [4/5] RUN npm install
 => [5/5] COPY . .
Successfully built def456abc123
Successfully tagged myapp:v1`,isError:!1}:{output:"docker: command options",isError:!1};if(r.startsWith("docker compose")||r.startsWith("docker-compose"))return r.includes("up")?{output:`[+] Running 2/2
 ✔ Container devops-lab-web-1    Started
 ✔ Container devops-lab-cache-1  Started`,isError:!1}:r.includes("ps")?{output:`NAME                    IMAGE          STATUS         PORTS
devops-lab-web-1        nginx:alpine   Up 2 seconds   0.0.0.0:8080->80/tcp
devops-lab-cache-1      redis:alpine   Up 2 seconds   6379/tcp`,isError:!1}:r.includes("logs")?{output:'web  | 172.17.0.1 - - [01/Jan/2024:00:00:01] "GET / HTTP/1.1" 200',isError:!1}:r.includes("down")?{output:`[+] Running 3/3
 ✔ Container devops-lab-web-1    Removed
 ✔ Container devops-lab-cache-1  Removed
 ✔ Network devops-lab_default    Removed`,isError:!1}:{output:"",isError:!1};if(r.startsWith("for ")||r.startsWith("while ")||r.startsWith("if "))return r.includes("{1..5}")?{output:`1
2
3
4
5`,isError:!1}:r.includes("{1..3}")?{output:`1
2
3`,isError:!1}:r.includes("tick")?{output:`tick
tick
tick`,isError:!1}:{output:"",isError:!1};if(r.includes("=")&&!r.includes("==")&&!r.includes("if")){if(r.includes("echo $")){const b=r.match(/([A-Z_]+)="([^"]+)"/);if(b)return{output:b[2],isError:!1}}return{output:"",isError:!1}}return r.includes("echo $?")?{output:"0",isError:!1}:t==="echo"?{output:m.slice(1).join(" ").replace(/['"]/g,""),isError:!1}:r.includes("[")&&r.includes("-f")&&r.includes("echo")?{output:"exists",isError:!1}:t==="trivy"?{output:`2024-01-01T00:00:00.000Z INFO  Detected OS: alpine 3.18
2024-01-01T00:00:00.000Z INFO  Number of language-specific files: 1

Total: 0 (CRITICAL: 0, HIGH: 0, MEDIUM: 0)`,isError:!1}:{output:`${t}: command not found
Hint: try the suggested command above each exercise`,isError:!0}};return e.jsxs("div",{className:"terminal-wrap",style:{background:"#0d1117",border:"1px solid #222d42",borderRadius:"var(--r12)",overflow:"hidden",marginBottom:"12px",fontFamily:"var(--mono)"},children:[e.jsxs("div",{style:{background:"#1c2436",padding:"8px 14px",display:"flex",alignItems:"center",gap:"8px",borderBottom:"1px solid #222d42"},children:[e.jsx("span",{style:{width:"10px",height:"10px",borderRadius:"50%",background:"#ff5f57",display:"inline-block"}}),e.jsx("span",{style:{width:"10px",height:"10px",borderRadius:"50%",background:"#ffbd2e",display:"inline-block"}}),e.jsx("span",{style:{width:"10px",height:"10px",borderRadius:"50%",background:"#28c840",display:"inline-block"}}),e.jsx("span",{style:{fontSize:"11px",color:"#7d8fa8",marginLeft:"8px"},children:"gk@devops-lab: ~"}),e.jsx("span",{style:{marginLeft:"auto",fontSize:"10px",color:"#4a5568"},children:"simulated terminal"})]}),e.jsx("div",{ref:l,style:{padding:"12px 14px",minHeight:"120px",maxHeight:"280px",overflowY:"auto",fontSize:"12px",lineHeight:"1.8",color:"#e6edf3"},children:p.map((s,r)=>e.jsx("div",{children:s.isCommand?e.jsxs("div",{children:[e.jsx("span",{style:{color:"#00d9a0"},children:"gk@devops-lab"}),e.jsx("span",{style:{color:"#7d8fa8"},children:":~$"})," ",e.jsx("span",{style:{color:"#e6edf3"},children:s.cmdText})]}):s.isSuccess?e.jsx("div",{style:{color:"#00d9a0",background:"rgba(0,217,160,.07)",padding:"4px 8px",borderRadius:"4px",margin:"4px 0",fontSize:"11px"},children:s.text}):e.jsx("div",{style:{color:s.isError?"#ff5f5f":"#a8b8cc",whiteSpace:"pre-wrap"},children:s.text})},r))}),e.jsxs("div",{style:{display:"flex",alignItems:"center",padding:"8px 14px",borderTop:"1px solid #222d42",background:"#0d1117"},children:[e.jsx("span",{style:{color:"#00d9a0",fontSize:"12px",marginRight:"8px",whiteSpace:"nowrap"},children:"gk@devops-lab:~$"}),e.jsx("input",{type:"text",value:v,onChange:s=>o(s.target.value),onKeyDown:y,style:{flex:1,background:"none",border:"none",outline:"none",fontFamily:"var(--mono)",fontSize:"12px",color:"#e6edf3",caretColor:"#00d9a0"},placeholder:"type command and press Enter…"}),e.jsx("button",{onClick:()=>c(v),style:{background:"rgba(0,217,160,.1)",border:"1px solid rgba(0,217,160,.3)",color:"#00d9a0",fontFamily:"var(--mono)",fontSize:"10px",padding:"4px 10px",borderRadius:"4px",cursor:"pointer",marginLeft:"8px"},children:"Run ↵"})]})]})},A=({appState:x})=>{const{isLabDone:g,markLabDone:a,labDayDone:h}=x,d=Object.keys(w),[i,S]=f.useState(d[0]||""),n=w[i],u=n?h(i):0,p=n?n.exercises.length:0,k=p?Math.round(u/p*100):0,v=o=>o<60?o+"s":Math.floor(o/60)+"m "+o%60+"s";return e.jsxs("div",{className:"wrap",children:[e.jsxs("div",{style:{marginBottom:"16px"},children:[e.jsx("div",{className:"eyebrow",children:"Hands-on practice"}),e.jsx("h2",{className:"page-title",children:"Interactive Labs"}),e.jsx("p",{className:"page-sub",children:"Simulated terminal · Auto-graded · Days 1–10"})]}),e.jsxs("div",{style:{background:"rgba(255,200,80,.06)",border:"1px solid rgba(255,200,80,.2)",borderRadius:"var(--r12)",padding:"11px 13px",marginBottom:"16px",fontSize:"13px",color:"var(--sub)"},children:[e.jsx("strong",{style:{color:"var(--amber)"},children:"Note:"})," For Docker/K8s days, open KillerCoda in a new tab, run commands there, then enter them here to auto-verify."]}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"18px"},children:d.map(o=>{const l=w[o],c=h(o),y=l.exercises.length,E=c===y&&y>0,s=o===i;return e.jsxs("button",{className:`lab-day-btn ${E?"lab-day-done":""}`,style:{background:s?"var(--s2)":"var(--s1)",borderColor:E?"var(--green)":"var(--border)",color:E?"var(--green)":"var(--sub)",fontFamily:"var(--mono)",fontSize:"11px",padding:"5px 11px",borderRadius:"var(--r8)",cursor:"pointer",transition:"all .2s",borderStyle:"solid",borderWidth:"1px"},onClick:()=>S(o),children:[l.day," ",c>0?`(${c}/${y})`:""]},o)})}),n&&e.jsxs("div",{id:"lab-exercises-area",children:[e.jsxs("div",{style:{background:"var(--s1)",border:"1px solid var(--border)",borderRadius:"var(--r12)",padding:"16px 18px",marginBottom:"12px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{fontFamily:"var(--mono)",fontSize:"11px",color:"var(--green)",marginBottom:"3px"},children:[n.day," · ",n.type.toUpperCase()," LAB"]}),e.jsx("div",{style:{fontSize:"16px",fontWeight:700},children:n.title})]}),e.jsxs("div",{style:{fontFamily:"var(--mono)",fontSize:"13px",color:u===p&&p>0?"var(--green)":"var(--sub)"},children:[u,"/",p," done"]})]}),e.jsx("div",{style:{fontSize:"13px",color:"var(--sub)",marginBottom:"10px"},children:n.intro}),e.jsx("div",{style:{height:"4px",background:"var(--s3)",borderRadius:"2px"},children:e.jsx("div",{style:{height:"100%",background:"var(--green)",borderRadius:"2px",width:`${k}%`,transition:"width .4s"}})}),(n.type==="docker"||n.type==="k8s")&&e.jsxs("div",{style:{display:"flex",gap:"8px",marginTop:"10px",flexWrap:"wrap"},children:[n.killercoda&&e.jsx("a",{href:n.killercoda,target:"_blank",rel:"noopener noreferrer",style:{display:"inline-flex",alignItems:"center",gap:"5px",fontFamily:"var(--mono)",fontSize:"11px",color:"var(--amber)",decoration:"none",padding:"5px 11px",border:"1px solid rgba(255,200,80,.3)",borderRadius:"var(--r8)",background:"rgba(255,200,80,.06)",textDecoration:"none"},children:"🚀 Open KillerCoda Lab →"}),n.playdocker&&e.jsx("a",{href:n.playdocker,target:"_blank",rel:"noopener noreferrer",style:{display:"inline-flex",alignItems:"center",gap:"5px",fontFamily:"var(--mono)",fontSize:"11px",color:"var(--blue)",decoration:"none",padding:"5px 11px",border:"1px solid rgba(79,168,255,.3)",borderRadius:"var(--r8)",background:"rgba(79,168,255,.06)",textDecoration:"none"},children:"🐳 Play With Docker →"})]})]}),n.type==="terminal"&&e.jsx(T,{dk:i,lab:n,isLabDone:o=>g(i,o),markLabDone:o=>a(i,o),onExercisePassed:()=>{}}),n.exercises.map((o,l)=>{const c=g(i,o.id);return e.jsx(I,{ex:o,idx:l,isDone:c,formatTime:v},o.id)})]})]})},I=({ex:x,idx:g,isDone:a,formatTime:h})=>{const[d,i]=f.useState(!1);return e.jsx("div",{style:{background:"var(--s1)",border:`1px solid ${a?"rgba(0,217,160,.35)":"var(--border)"}`,borderRadius:"var(--r12)",padding:"14px 16px",marginBottom:"8px",transition:"border-color .2s"},children:e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",gap:"10px"},children:[e.jsx("div",{style:{width:"22px",height:"22px",borderRadius:"50%",background:a?"var(--green)":"var(--s3)",border:`1.5px solid ${a?"var(--green)":"var(--border)"}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:"11px",marginTop:"1px"},children:a?e.jsx("span",{style:{color:"#000",fontWeight:700},children:"✓"}):e.jsx("span",{style:{color:"var(--sub)"},children:g+1})}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontSize:"13.5px",fontWeight:600,marginBottom:"5px",color:a?"var(--sub)":"var(--text)",textDecoration:a?"line-through":"none"},children:x.prompt}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"},children:[e.jsx("button",{onClick:()=>i(!d),style:{background:"none",border:"1px solid var(--border)",color:"var(--sub)",fontFamily:"var(--mono)",fontSize:"10px",padding:"3px 9px",borderRadius:"4px",cursor:"pointer"},children:d?"🙈 Hide hint":"💡 Hint"}),e.jsxs("span",{style:{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--amber)"},children:["+",x.xp," XP"]}),a&&e.jsx("span",{style:{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--green)"},children:x.ok})]}),d&&e.jsx("div",{style:{marginTop:"8px",background:"var(--s3)",borderRadius:"var(--r8)",padding:"8px 11px",fontFamily:"var(--mono)",fontSize:"11px",color:"var(--amber)",whiteSpace:"pre-wrap"},children:x.hint})]})]})})};export{A as LabsView};
