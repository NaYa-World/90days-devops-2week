import React, { useState, useRef, useEffect, useCallback } from 'react';
import { dailyTasks } from '../data/dailyTasks';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TerminalLine {
  type: 'prompt' | 'output' | 'error' | 'success' | 'info' | 'separator';
  text: string;
  cmd?: string;
}

interface QuickScenario {
  label: string;
  icon: string;
  commands: string[];
}

// ─────────────────────────────────────────────
// In-memory Virtual File System
// ─────────────────────────────────────────────
type VFSNode = { type: 'file'; content: string } | { type: 'dir'; children: Record<string, VFSNode> };

function createInitialVFS(): VFSNode & { type: 'dir' } {
  return {
    type: 'dir',
    children: {
      home: {
        type: 'dir',
        children: {
          thor: {
            type: 'dir',
            children: {
              'notes.txt': { type: 'file', content: 'Welcome to the DevOps 90-day practice terminal!\nKeep learning every day.' },
              ansible: { type: 'dir', children: {
                'inventory': { type: 'file', content: '[stratos_dc]\nstapp01 ansible_host=172.16.238.10 ansible_user=tony\nstapp02 ansible_host=172.16.238.11 ansible_user=steve\nstapp03 ansible_host=172.16.238.12 ansible_user=banner' }
              }},
              playbooks: { type: 'dir', children: {} },
              scripts: { type: 'dir', children: {} },
            }
          }
        }
      },
      etc: {
        type: 'dir',
        children: {
          'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nthor:x:1000:1000:Thor:/home/thor:/bin/bash' },
          'hosts': { type: 'file', content: '127.0.0.1   localhost\n::1         localhost\n172.16.238.10  stapp01.stratos.xfusioncorp.com  stapp01\n172.16.238.11  stapp02.stratos.xfusioncorp.com  stapp02\n172.16.238.12  stapp03.stratos.xfusioncorp.com  stapp03' },
          'hostname': { type: 'file', content: 'jump-server' },
          'os-release': { type: 'file', content: 'NAME="CentOS Linux"\nVERSION="7 (Core)"\nID=centos\nID_LIKE=rhel\nPRETTY_NAME="CentOS Linux 7 (Core)"' },
          ssh: { type: 'dir', children: {
            'sshd_config': { type: 'file', content: '# Port 22\nPort 22\n#PermitRootLogin yes\nPermitRootLogin yes\n#PubkeyAuthentication yes\nPubkeyAuthentication yes\n#PasswordAuthentication yes\nPasswordAuthentication yes' }
          }},
          'crontab': { type: 'file', content: '# System crontab\n# .---------------- minute (0 - 59)\n# |  .------------- hour (0 - 23)\nCRON_TZ=UTC' },
        }
      },
      var: {
        type: 'dir',
        children: {
          log: { type: 'dir', children: {
            'messages': { type: 'file', content: 'Jan  1 00:00:01 jump-server systemd[1]: Started System Logging Service.\nJan  1 00:00:02 jump-server sshd[1001]: Server listening on 0.0.0.0 port 22.' },
          }},
          lib: { type: 'dir', children: {
            jenkins: { type: 'dir', children: {
              secrets: { type: 'dir', children: {
                'initialAdminPassword': { type: 'file', content: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6' }
              }}
            }}
          }}
        }
      },
      tmp: { type: 'dir', children: {} },
      opt: { type: 'dir', children: {
        'apps': { type: 'dir', children: {} },
      }},
    }
  };
}

// ─────────────────────────────────────────────
// Command Engine
// ─────────────────────────────────────────────
class CommandEngine {
  private vfs: VFSNode & { type: 'dir' };
  private cwd: string[];
  private env: Record<string, string>;
  private cmdHistory: string[];
  private dockerContainers: Array<{ id: string; name: string; image: string; status: string; ports: string }>;
  private dockerImages: Array<{ repo: string; tag: string; id: string; size: string }>;
  private k8sPods: Array<{ name: string; ready: string; status: string; restarts: number; age: string }>;
  private k8sDeployments: Array<{ name: string; ready: string; upToDate: number; available: number; age: string }>;
  private k8sServices: Array<{ name: string; type: string; clusterIP: string; ports: string; age: string }>;
  private gitInitialized: boolean;
  private gitBranch: string;
  private gitCommits: Array<{ hash: string; msg: string }>;

  constructor() {
    this.vfs = createInitialVFS();
    this.cwd = ['home', 'thor'];
    this.env = {
      USER: 'thor',
      HOME: '/home/thor',
      SHELL: '/bin/bash',
      PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
      TERM: 'xterm-256color',
      HOSTNAME: 'jump-server',
      LANG: 'en_US.UTF-8',
    };
    this.cmdHistory = [];
    this.dockerContainers = [];
    this.dockerImages = [
      { repo: 'nginx', tag: 'latest', id: 'a1b2c3d4e5f6', size: '142MB' },
      { repo: 'centos', tag: '7', id: 'b2c3d4e5f6a7', size: '204MB' },
    ];
    this.k8sPods = [];
    this.k8sDeployments = [];
    this.k8sServices = [
      { name: 'kubernetes', type: 'ClusterIP', clusterIP: '10.96.0.1', ports: '443/TCP', age: '5d' }
    ];
    this.gitInitialized = false;
    this.gitBranch = 'main';
    this.gitCommits = [];
  }

  private getNode(pathParts: string[]): VFSNode | null {
    let node: VFSNode = this.vfs;
    for (const part of pathParts) {
      if (node.type !== 'dir') return null;
      if (!node.children[part]) return null;
      node = node.children[part];
    }
    return node;
  }

  private resolvePath(path: string): string[] {
    if (path.startsWith('/')) {
      return path.split('/').filter(Boolean);
    }
    const result = [...this.cwd];
    for (const part of path.split('/').filter(Boolean)) {
      if (part === '..') result.pop();
      else if (part !== '.') result.push(part);
    }
    return result;
  }

  private cwdString(): string {
    const p = '/' + this.cwd.join('/');
    const home = '/home/thor';
    return p.startsWith(home) ? '~' + p.slice(home.length) : p;
  }

  getPrompt(): string {
    return `[thor@jump-server ${this.cwdString()}]$`;
  }

  execute(rawCmd: string): { output: string; isError: boolean; isSuccess?: boolean } {
    const cmd = rawCmd.trim();
    if (!cmd) return { output: '', isError: false };

    this.cmdHistory.push(cmd);

    // Handle pipes simply — take the first command's simulated output
    if (cmd.includes('|')) {
      return this.handlePipe(cmd);
    }

    // Handle output redirection
    if (cmd.includes('>')) {
      return this.handleRedirect(cmd);
    }

    // Handle command chaining with &&
    if (cmd.includes(' && ')) {
      const parts = cmd.split(' && ');
      let last = { output: '', isError: false };
      for (const part of parts) {
        last = this.execute(part.trim());
        if (last.isError) return last;
      }
      return last;
    }

    const parts = cmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const base = parts[0];
    const args = parts.slice(1);

    switch (base) {
      // ── Navigation & File Ops ──────────────────
      case 'pwd': return { output: '/' + this.cwd.join('/'), isError: false };

      case 'cd': {
        const target = args[0] || '/home/thor';
        const resolved = target === '~' || target === '' ? ['home', 'thor'] : this.resolvePath(target);
        const node = this.getNode(resolved);
        if (!node) return { output: `bash: cd: ${target}: No such file or directory`, isError: true };
        if (node.type !== 'dir') return { output: `bash: cd: ${target}: Not a directory`, isError: true };
        this.cwd = resolved;
        return { output: '', isError: false };
      }

      case 'ls': {
        const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const longFmt = args.includes('-l') || args.includes('-la') || args.includes('-al');
        const pathArg = args.find(a => !a.startsWith('-'));
        const resolved = pathArg ? this.resolvePath(pathArg) : this.cwd;
        const node = this.getNode(resolved);
        if (!node) return { output: `ls: cannot access '${pathArg}': No such file or directory`, isError: true };
        if (node.type === 'file') return { output: pathArg || '', isError: false };
        const entries = Object.entries(node.children);
        const visible = showHidden
          ? ['.', '..', ...entries.map(([n]) => n)]
          : entries.map(([n]) => n);
        if (!longFmt) return { output: visible.join('  '), isError: false };
        const header = `total ${entries.length * 4}`;
        const rows = visible.filter(n => n !== '.' && n !== '..').map(name => {
          const child = node.children[name];
          const isDir = !child || child.type === 'dir';
          const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
          const size = child?.type === 'file' ? child.content.length.toString().padStart(6) : '  4096';
          return `${perm}  1 thor thor ${size} Jan  1 00:00 ${name}`;
        });
        return { output: [header, ...rows].join('\n'), isError: false };
      }

      case 'mkdir': {
        const target = args.find(a => !a.startsWith('-'));
        if (!target) return { output: 'mkdir: missing operand', isError: true };
        const resolved = this.resolvePath(target);
        const parent = this.getNode(resolved.slice(0, -1));
        if (!parent || parent.type !== 'dir') return { output: `mkdir: cannot create directory '${target}': No such file or directory`, isError: true };
        const name = resolved[resolved.length - 1];
        if (parent.children[name]) return { output: `mkdir: cannot create directory '${target}': File exists`, isError: true };
        parent.children[name] = { type: 'dir', children: {} };
        return { output: '', isError: false };
      }

      case 'touch': {
        const target = args[0];
        if (!target) return { output: 'touch: missing file operand', isError: true };
        const resolved = this.resolvePath(target);
        const parent = this.getNode(resolved.slice(0, -1));
        if (!parent || parent.type !== 'dir') return { output: `touch: cannot touch '${target}': No such file or directory`, isError: true };
        const name = resolved[resolved.length - 1];
        if (!parent.children[name]) parent.children[name] = { type: 'file', content: '' };
        return { output: '', isError: false };
      }

      case 'rm': {
        const target = args.find(a => !a.startsWith('-'));
        if (!target) return { output: 'rm: missing operand', isError: true };
        const resolved = this.resolvePath(target);
        const parent = this.getNode(resolved.slice(0, -1));
        if (!parent || parent.type !== 'dir') return { output: `rm: cannot remove '${target}': No such file or directory`, isError: true };
        const name = resolved[resolved.length - 1];
        if (!parent.children[name]) return { output: `rm: cannot remove '${target}': No such file or directory`, isError: true };
        const node = parent.children[name];
        if (node.type === 'dir' && !args.includes('-r') && !args.includes('-rf') && !args.includes('-r')) {
          return { output: `rm: cannot remove '${target}': Is a directory`, isError: true };
        }
        delete parent.children[name];
        return { output: '', isError: false };
      }

      case 'cp': {
        const src = args.find(a => !a.startsWith('-'));
        const dst = args[args.lastIndexOf(src as string) + 1];
        if (!src || !dst) return { output: 'cp: missing file operand', isError: true };
        const srcNode = this.getNode(this.resolvePath(src));
        if (!srcNode) return { output: `cp: cannot stat '${src}': No such file or directory`, isError: true };
        if (srcNode.type !== 'file') return { output: `cp: omitting directory '${src}'`, isError: true };
        const dstResolved = this.resolvePath(dst);
        const dstParent = this.getNode(dstResolved.slice(0, -1));
        if (!dstParent || dstParent.type !== 'dir') return { output: `cp: cannot create regular file '${dst}': No such file or directory`, isError: true };
        dstParent.children[dstResolved[dstResolved.length - 1]] = { type: 'file', content: srcNode.content };
        return { output: '', isError: false };
      }

      case 'mv': {
        const src = args.find(a => !a.startsWith('-'));
        const dst = src ? args[args.indexOf(src) + 1] : undefined;
        if (!src || !dst) return { output: 'mv: missing file operand', isError: true };
        const srcResolved = this.resolvePath(src);
        const srcParent = this.getNode(srcResolved.slice(0, -1));
        if (!srcParent || srcParent.type !== 'dir') return { output: `mv: cannot stat '${src}': No such file or directory`, isError: true };
        const srcName = srcResolved[srcResolved.length - 1];
        const srcNode = (srcParent as any).children[srcName];
        if (!srcNode) return { output: `mv: cannot stat '${src}': No such file or directory`, isError: true };
        const dstResolved = this.resolvePath(dst);
        const dstParent = this.getNode(dstResolved.slice(0, -1));
        if (!dstParent || dstParent.type !== 'dir') return { output: `mv: cannot move '${src}' to '${dst}': No such file or directory`, isError: true };
        (dstParent as any).children[dstResolved[dstResolved.length - 1]] = srcNode;
        delete (srcParent as any).children[srcName];
        return { output: '', isError: false };
      }

      case 'cat': {
        const target = args.find(a => !a.startsWith('-'));
        if (!target) return { output: 'cat: no file specified', isError: true };
        const node = this.getNode(this.resolvePath(target));
        if (!node) return { output: `cat: ${target}: No such file or directory`, isError: true };
        if (node.type === 'dir') return { output: `cat: ${target}: Is a directory`, isError: true };
        return { output: node.content, isError: false };
      }

      case 'echo': {
        const joined = args.join(' ').replace(/^["']|["']$/g, '');
        return { output: joined, isError: false };
      }

      case 'chmod': {
        return { output: '', isError: false };
      }

      case 'chown': {
        return { output: '', isError: false };
      }

      case 'find': {
        const _pathArg = args.find(a => !a.startsWith('-')) || '.';
        const _nameArg = args.includes('-name') ? args[args.indexOf('-name') + 1] : null;
        const _typeArg = args.includes('-type') ? args[args.indexOf('-type') + 1] : null;
        void _pathArg; void _nameArg; void _typeArg;
        return {
          output: `/home/thor\n/home/thor/notes.txt\n/home/thor/ansible\n/home/thor/ansible/inventory\n/home/thor/playbooks\n/home/thor/scripts`,
          isError: false
        };
      }

      case 'grep': {
        const pattern = args.find(a => !a.startsWith('-'));
        const fileArg = args[args.length - 1];
        if (!pattern) return { output: 'grep: missing pattern', isError: true };
        const node = fileArg && !fileArg.startsWith('-') ? this.getNode(this.resolvePath(fileArg)) : null;
        const content = node?.type === 'file' ? node.content : '/etc/passwd /etc/hosts';
        const lines = content.split('\n').filter(l => l.toLowerCase().includes(pattern.toLowerCase().replace(/['"]/g, '')));
        if (!lines.length) return { output: '', isError: false };
        return { output: lines.join('\n'), isError: false };
      }

      case 'tail': {
        const fileArg = args.find(a => !a.startsWith('-'));
        if (!fileArg) return { output: 'tail: missing file', isError: true };
        const node = this.getNode(this.resolvePath(fileArg));
        if (!node || node.type !== 'file') return { output: `tail: ${fileArg}: No such file or directory`, isError: true };
        const lines = node.content.split('\n').slice(-10);
        return { output: lines.join('\n'), isError: false };
      }

      case 'head': {
        const fileArg = args.find(a => !a.startsWith('-'));
        if (!fileArg) return { output: 'head: missing file', isError: true };
        const node = this.getNode(this.resolvePath(fileArg));
        if (!node || node.type !== 'file') return { output: `head: ${fileArg}: No such file or directory`, isError: true };
        const n = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
        return { output: node.content.split('\n').slice(0, n).join('\n'), isError: false };
      }

      case 'wc': {
        const fileArg = args.find(a => !a.startsWith('-'));
        const node = fileArg ? this.getNode(this.resolvePath(fileArg)) : null;
        const content = node?.type === 'file' ? node.content : 'sample text for counting';
        if (args.includes('-l')) return { output: `${content.split('\n').length} ${fileArg || ''}`, isError: false };
        if (args.includes('-w')) return { output: `${content.split(/\s+/).length} ${fileArg || ''}`, isError: false };
        if (args.includes('-c')) return { output: `${content.length} ${fileArg || ''}`, isError: false };
        return { output: `${content.split('\n').length}  ${content.split(/\s+/).length}  ${content.length} ${fileArg || ''}`, isError: false };
      }

      case 'awk': return { output: 'root\ndaemon\nbin\nthor', isError: false };
      case 'sed': return { output: args.join(' ').includes('s/') ? '(substitution applied)' : '', isError: false };
      case 'sort': return { output: 'bin\ndaemon\nroot\nthor', isError: false };
      case 'uniq': return { output: 'unique output line 1\nunique output line 2', isError: false };
      case 'cut': return { output: 'root\ndaemon\nbin\nthor', isError: false };
      case 'tr': return { output: '(transformed output)', isError: false };
      case 'xargs': return { output: '(xargs processed)', isError: false };

      // ── System Info ───────────────────────────
      case 'whoami': return { output: 'thor', isError: false };
      case 'id': return { output: 'uid=1000(thor) gid=1000(thor) groups=1000(thor),10(wheel),190(systemd-journal)', isError: false };
      case 'uname': {
        if (args.includes('-a')) return { output: 'Linux jump-server 5.14.0-284.30.1.el9_2.x86_64 #1 SMP x86_64 GNU/Linux', isError: false };
        if (args.includes('-r')) return { output: '5.14.0-284.30.1.el9_2.x86_64', isError: false };
        return { output: 'Linux', isError: false };
      }
      case 'hostname': return { output: args.includes('-I') ? '172.16.238.5 10.0.0.5' : 'jump-server', isError: false };
      case 'uptime': return { output: ' 10:30:15 up 3 days,  5:22,  2 users,  load average: 0.08, 0.03, 0.05', isError: false };
      case 'date': return { output: new Date().toString(), isError: false };
      case 'env': {
        return { output: Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n'), isError: false };
      }
      case 'export': {
        if (args[0]?.includes('=')) {
          const [k, v] = args[0].split('=');
          this.env[k] = v;
        }
        return { output: '', isError: false };
      }

      case 'ps': {
        if (args.includes('aux') || args.some(a => a.includes('u'))) {
          return { output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  18508  2844 ?        Ss   00:00   0:01 /sbin/init\nroot       432  0.0  0.0  72268  1524 ?        Ss   00:00   0:00 /usr/sbin/sshd\nthor      1001  0.0  0.2  23456  4096 pts/0    Ss   10:00   0:00 bash\nthor      1042  0.0  0.1  12536  2048 pts/0    R+   10:30   0:00 ps aux`, isError: false };
        }
        return { output: `  PID TTY          TIME CMD\n 1001 pts/0    00:00:00 bash\n 1042 pts/0    00:00:00 ps`, isError: false };
      }

      case 'top': return { output: `top - 10:30:00 up 3 days,  5:22,  2 users\nTasks: 120 total,   1 running, 119 sleeping\n%Cpu(s):  0.3 us,  0.1 sy,  0.0 ni, 99.5 id\nMiB Mem :   3906.0 total,   1456.0 free,   1234.0 used\n\nInteractive mode disabled in simulator. Press q to quit.`, isError: false };
      case 'kill': return { output: '', isError: false };
      case 'pkill': return { output: '', isError: false };
      case 'nohup': return { output: 'nohup: ignoring input and appending output to nohup.out', isError: false };

      case 'df': return { output: `Filesystem      Size  Used Avail Use% Mounted on\ndevtmpfs        1.9G     0  1.9G   0% /dev\ntmpfs           1.9G     0  1.9G   0% /dev/shm\n/dev/sda1        50G  8.2G   39G  18% /\n/dev/sdb1       100G   21G   74G  23% /data`, isError: false };
      case 'du': return { output: `4\t./scripts\n8\t./ansible\n24\t./playbooks\n40\t.`, isError: false };
      case 'free': return { output: `              total        used        free      shared  buff/cache   available\nMem:        3997728     1264312     1432100      128456     1301316     2392808\nSwap:       2097148           0     2097148`, isError: false };
      case 'lscpu': return { output: `Architecture:        x86_64\nCPU(s):              4\nThread(s) per core:  2\nCore(s) per socket:  2\nVendorID:            GenuineIntel\nModel name:          Intel(R) Xeon(R) CPU E5-2676 v3 @ 2.40GHz\nCPU MHz:             2400.000`, isError: false };

      // ── Network ──────────────────────────────
      case 'ip': {
        if (args.join(' ').includes('addr')) return { output: `1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n    inet 172.16.238.5/24 brd 172.16.238.255 scope global eth0`, isError: false };
        if (args.join(' ').includes('route')) return { output: `default via 172.16.238.1 dev eth0\n172.16.238.0/24 dev eth0 proto kernel scope link src 172.16.238.5`, isError: false };
        return { output: `Usage: ip [OPTIONS] OBJECT COMMAND`, isError: false };
      }
      case 'ifconfig': return { output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 172.16.238.5  netmask 255.255.255.0  broadcast 172.16.238.255\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0`, isError: false };
      case 'ping': {
        const host = args.find(a => !a.startsWith('-')) || 'localhost';
        const c = args.includes('-c') ? parseInt(args[args.indexOf('-c') + 1]) || 4 : 4;
        const rows = Array.from({ length: c }, (_, i) => `64 bytes from ${host} (192.168.1.1): icmp_seq=${i + 1} ttl=64 time=${(10 + Math.random() * 5).toFixed(1)} ms`).join('\n');
        return { output: `PING ${host} (192.168.1.1) 56(84) bytes of data.\n${rows}\n--- ${host} ping statistics ---\n${c} packets transmitted, ${c} received, 0% packet loss`, isError: false };
      }
      case 'curl': {
        const url = args.find(a => !a.startsWith('-'));
        if (!url) return { output: 'curl: no URL specified', isError: true };
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          return { output: `<!DOCTYPE html><html><head><title>Welcome to nginx!</title></head><body><h1>Welcome to nginx!</h1></body></html>`, isError: false };
        }
        return { output: `curl: (6) Could not resolve host: ${url} (simulated — no real network in practice mode)`, isError: true };
      }
      case 'wget': return { output: `Simulated: wget would download the file. (No real network in practice mode)`, isError: false };
      case 'ss': return { output: `State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port\nLISTEN 0      128         0.0.0.0:22       0.0.0.0:*\nLISTEN 0      128         0.0.0.0:80       0.0.0.0:*\nLISTEN 0      128       127.0.0.1:5432    0.0.0.0:*`, isError: false };
      case 'netstat': return { output: `Active Internet connections\nProto Recv-Q Send-Q Local Address    Foreign Address  State\ntcp        0      0 0.0.0.0:22       0.0.0.0:*        LISTEN\ntcp        0      0 0.0.0.0:80       0.0.0.0:*        LISTEN`, isError: false };
      case 'nslookup': case 'dig': return { output: `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nName:\t${args[0] || 'example.com'}\nAddress: 93.184.216.34`, isError: false };
      case 'telnet': return { output: `Trying ${args[0] || '127.0.0.1'}...\nConnected to ${args[0] || '127.0.0.1'}.\n(Simulated connection)`, isError: false };
      case 'nc': return { output: `(netcat simulated — no real network)`, isError: false };

      // ── User Management ───────────────────────
      case 'useradd': {
        const username = args.find(a => !a.startsWith('-'));
        if (!username) return { output: 'useradd: missing username', isError: true };
        const shell = args.includes('-s') ? args[args.indexOf('-s') + 1] : '/bin/bash';
        const homeDir = this.getNode(['home']) as any;
        if (homeDir && homeDir.children) homeDir.children[username] = { type: 'dir', children: {} };
        return { output: `(User '${username}' created with shell: ${shell})`, isError: false };
      }
      case 'userdel': return { output: '', isError: false };
      case 'usermod': return { output: '', isError: false };
      case 'passwd': return { output: `Changing password for user ${args[0] || 'thor'}.\npasswd: all authentication tokens updated successfully.`, isError: false };
      case 'groupadd': return { output: '', isError: false };
      case 'groups': return { output: `thor wheel systemd-journal docker`, isError: false };
      case 'su': return { output: `(Switching users is simulated. In a real system, enter password for ${args[0] || 'root'})`, isError: false };
      case 'sudo': {
        const subCmd = args.join(' ');
        return this.execute(subCmd);
      }
      case 'chage': return { output: `Last password change\t\t\t: Jan 01, 2024\nPassword expires\t\t\t: never\nAccount expires\t\t\t\t: never`, isError: false };

      // ── Package Management ────────────────────
      case 'yum': case 'dnf': {
        const action = args[0];
        const pkg = args.find((a, i) => i > 0 && !a.startsWith('-'));
        if (action === 'install') return { output: `Resolving Dependencies...\nDependencies Resolved\n\nInstalling:\n ${pkg}  x86_64\n\nInstall  1 Package\n\nTotal download size: 2.4 M\nInstalled size: 5.6 M\nDownloading packages:\n${pkg}: [============================] 100%\nRunning transaction\n  Installing : ${pkg}                                  1/1\nVerifying  : ${pkg}                                  1/1\nInstalled:\n  ${pkg}.x86_64\n\nComplete!`, isError: false };
        if (action === 'remove') return { output: `Removed:\n  ${pkg}.x86_64\n\nComplete!`, isError: false };
        if (action === 'update') return { output: `No packages marked for update.`, isError: false };
        if (action === 'list') return { output: `Installed Packages\nbash.x86_64  5.1.8\ngit.x86_64   2.39.3\ndocker.x86_64 24.0.5\nopenssh.x86_64 8.7p1`, isError: false };
        return { output: `yum: available commands: install, remove, update, list`, isError: false };
      }
      case 'apt': case 'apt-get': {
        const action = args[0];
        const pkg = args.find((a, i) => i > 0 && !a.startsWith('-'));
        if (action === 'install') return { output: `Reading package lists...\nBuilding dependency tree...\nThe following NEW packages will be installed:\n  ${pkg}\n0 upgraded, 1 newly installed.\nGet:1 http://archive.ubuntu.com ${pkg} ...\nFetched 1,234 kB\nSelecting previously unselected package ${pkg}.\nSetting up ${pkg}...\nProcessing triggers for man-db...`, isError: false };
        if (action === 'update') return { output: `Hit:1 http://archive.ubuntu.com focal InRelease\nReading package lists... Done`, isError: false };
        return { output: `apt-get: available commands: install, remove, update, upgrade`, isError: false };
      }
      case 'pip': case 'pip3': {
        const pkg = args[1];
        if (args[0] === 'install') return { output: `Collecting ${pkg}\n  Downloading ${pkg}-1.0.0.tar.gz\nInstalling collected packages: ${pkg}\nSuccessfully installed ${pkg}-1.0.0`, isError: false };
        return { output: `pip: available commands: install, uninstall, list, show`, isError: false };
      }

      // ── Service Management ────────────────────
      case 'systemctl': {
        const action = args[0];
        const svc = args[1] || 'unknown';
        if (action === 'status') return { output: `● ${svc}.service - ${svc} Service\n   Loaded: loaded (/usr/lib/systemd/system/${svc}.service; enabled)\n   Active: active (running) since Mon 2024-01-01 00:00:00 UTC; 3 days ago\n Main PID: 1234 (${svc})\n   CGroup: /system.slice/${svc}.service\n           └─1234 /usr/sbin/${svc}`, isError: false };
        if (action === 'start') return { output: `(${svc} started)`, isError: false };
        if (action === 'stop') return { output: `(${svc} stopped)`, isError: false };
        if (action === 'restart') return { output: `(${svc} restarted)`, isError: false };
        if (action === 'enable') return { output: `Created symlink /etc/systemd/system/multi-user.target.wants/${svc}.service → /usr/lib/systemd/system/${svc}.service.`, isError: false };
        if (action === 'disable') return { output: `Removed /etc/systemd/system/multi-user.target.wants/${svc}.service.`, isError: false };
        if (action === 'is-active') return { output: `active`, isError: false };
        if (action === 'list-units') return { output: `UNIT                        LOAD   ACTIVE SUB     DESCRIPTION\nsshd.service                loaded active running SSH server\nnginx.service               loaded active running nginx web server\ndocker.service              loaded active running Docker Application Container Engine\n\n3 loaded units listed.`, isError: false };
        return { output: `systemctl: action '${action}' applied to ${svc}`, isError: false };
      }
      case 'service': {
        const svc = args[0];
        const action = args[1];
        return { output: `(${svc} ${action}ed in init.d style)`, isError: false };
      }

      // ── SSH ───────────────────────────────────
      case 'ssh': {
        const target = args.find(a => !a.startsWith('-'));
        return { output: `(SSH to ${target || 'target'} simulated — real SSH not available in browser)\nIn real environments: ssh tony@stapp01`, isError: false };
      }
      case 'ssh-keygen': return { output: `Generating public/private rsa key pair.\nEnter file: /home/thor/.ssh/id_rsa\nYour identification has been saved in /home/thor/.ssh/id_rsa\nYour public key has been saved in /home/thor/.ssh/id_rsa.pub\nThe key fingerprint is: SHA256:abc123def456 thor@jump-server`, isError: false };
      case 'ssh-copy-id': return { output: `/usr/bin/ssh-copy-id: INFO: attempting to log in with key\nNumber of key(s) added: 1\nNow try logging into the machine with: ssh '${args[args.length - 1]}'`, isError: false };
      case 'scp': return { output: `(SCP file transfer simulated — no real network in practice mode)`, isError: false };

      // ── Git ───────────────────────────────────
      case 'git': {
        const sub = args[0];
        if (sub === 'init') {
          this.gitInitialized = true;
          return { output: `Initialized empty Git repository in ${'/' + this.cwd.join('/')}/.git/`, isError: false };
        }
        if (!this.gitInitialized && !['clone', 'version', '--version'].includes(sub)) {
          return { output: `fatal: not a git repository (or any of the parent directories): .git`, isError: true };
        }
        if (sub === 'clone') {
          const url = args[1] || 'https://github.com/repo/project.git';
          const dir = args[2] || url.split('/').pop()?.replace('.git', '') || 'project';
          this.gitInitialized = true;
          return { output: `Cloning into '${dir}'...\nremote: Enumerating objects: 42, done.\nremote: Counting objects: 100% (42/42), done.\nReceiving objects: 100% (42/42), 15.34 KiB | 3.07 MiB/s, done.`, isError: false };
        }
        if (sub === 'config') return { output: '', isError: false };
        if (sub === 'add') return { output: '', isError: false };
        if (sub === 'commit') {
          const msgIdx = args.indexOf('-m');
          const msg = msgIdx >= 0 ? args[msgIdx + 1]?.replace(/^['"]|['"]$/g, '') : 'update';
          const hash = Math.random().toString(36).slice(2, 9);
          this.gitCommits.unshift({ hash, msg });
          return { output: `[${this.gitBranch} (root-commit) ${hash}] ${msg}\n 1 file changed, 1 insertion(+)\n create mode 100644 README.md`, isError: false };
        }
        if (sub === 'log') {
          if (!this.gitCommits.length) return { output: `fatal: your current branch '${this.gitBranch}' does not have any commits yet`, isError: true };
          const flags = args.includes('--oneline');
          return { output: this.gitCommits.map(c => flags ? `${c.hash} ${c.msg}` : `commit ${c.hash}\nAuthor: thor <thor@xfusioncorp.com>\nDate:   ${new Date().toDateString()}\n\n    ${c.msg}`).join('\n\n'), isError: false };
        }
        if (sub === 'status') return { output: `On branch ${this.gitBranch}\nYour branch is up to date with 'origin/${this.gitBranch}'.\n\nnothing to commit, working tree clean`, isError: false };
        if (sub === 'branch') {
          if (args[1] && !args[1].startsWith('-')) {
            return { output: '', isError: false };
          }
          return { output: `* ${this.gitBranch}\n  develop\n  feature/ansible-tasks`, isError: false };
        }
        if (sub === 'checkout') {
          const branch = args.find(a => !a.startsWith('-'));
          if (branch) this.gitBranch = branch;
          return { output: `Switched to branch '${branch || this.gitBranch}'`, isError: false };
        }
        if (sub === 'merge') return { output: `Updating abc1234..def5678\nFast-forward\n README.md | 2 ++\n 1 file changed, 2 insertions(+)`, isError: false };
        if (sub === 'push') return { output: `Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nTo origin\n   abc1234..def5678  ${this.gitBranch} -> ${this.gitBranch}`, isError: false };
        if (sub === 'pull') return { output: `Already up to date.`, isError: false };
        if (sub === 'remote') {
          if (args[1] === '-v') return { output: `origin\thttps://github.com/xfusioncorp/project.git (fetch)\norigin\thttps://github.com/xfusioncorp/project.git (push)`, isError: false };
          if (args[1] === 'add') return { output: '', isError: false };
          return { output: `origin`, isError: false };
        }
        if (sub === 'rebase') return { output: `Successfully rebased and updated refs/heads/${this.gitBranch}.`, isError: false };
        if (sub === 'stash') return { output: `Saved working directory and index state WIP on ${this.gitBranch}: abc1234 WIP`, isError: false };
        if (sub === 'revert') return { output: `[${this.gitBranch} xyz9876] Revert "last commit"\n 1 file changed, 1 deletion(-)`, isError: false };
        if (sub === 'reset') return { output: `HEAD is now at abc1234 previous commit`, isError: false };
        if (sub === 'cherry-pick') return { output: `[${this.gitBranch} abc1234] Cherry-picked commit\n Date: ${new Date().toDateString()}\n 1 file changed, 1 insertion(+)`, isError: false };
        if (sub === '--version' || sub === 'version') return { output: `git version 2.39.3`, isError: false };
        return { output: `git: '${sub}' is not a git command. Try 'git --help'.`, isError: true };
      }

      // ── Docker ────────────────────────────────
      case 'docker': {
        const sub = args[0];
        if (sub === 'pull') {
          const img = args[1] || 'ubuntu:latest';
          this.dockerImages.push({ repo: img.split(':')[0], tag: img.split(':')[1] || 'latest', id: Math.random().toString(36).slice(2, 14), size: '72MB' });
          return { output: `Using default tag: ${img.split(':')[1] || 'latest'}\nlatest: Pulling from library/${img.split(':')[0]}\nStatus: Downloaded newer image for ${img}`, isError: false };
        }
        if (sub === 'run') {
          const name = args.includes('--name') ? args[args.indexOf('--name') + 1] : `container_${Math.random().toString(36).slice(2, 6)}`;
          const image = args.find((a, i) => i > 0 && !a.startsWith('-') && !['--name', '-p', '-d', '-e', '-v', '-it', '--network', '--rm'].includes(args[i - 1]) && !a.startsWith('-'));
          const id = Math.random().toString(36).slice(2, 14);
          this.dockerContainers.push({ id, name, image: image || 'ubuntu', status: 'Up 2 seconds', ports: args.includes('-p') ? args[args.indexOf('-p') + 1] : '' });
          return { output: args.includes('-d') ? id : `(Container ${name} running interactively — simulated)`, isError: false };
        }
        if (sub === 'ps') {
          if (!this.dockerContainers.length) return { output: `CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES`, isError: false };
          const header = `CONTAINER ID   IMAGE          COMMAND   CREATED          STATUS          PORTS     NAMES`;
          const rows = this.dockerContainers.map(c => `${c.id.slice(0, 12)}   ${c.image.padEnd(14)} "/docker…"  2 minutes ago    ${c.status.padEnd(15)} ${c.ports.padEnd(9)} ${c.name}`);
          return { output: [header, ...rows].join('\n'), isError: false };
        }
        if (sub === 'images') {
          const header = `REPOSITORY   TAG       IMAGE ID       CREATED       SIZE`;
          const rows = this.dockerImages.map(i => `${i.repo.padEnd(12)} ${i.tag.padEnd(9)} ${i.id.slice(0, 12)}   2 weeks ago   ${i.size}`);
          return { output: [header, ...rows].join('\n'), isError: false };
        }
        if (sub === 'stop' || sub === 'start' || sub === 'rm' || sub === 'restart') {
          const target = args.find(a => !a.startsWith('-'));
          if (sub === 'rm') this.dockerContainers = this.dockerContainers.filter(c => c.name !== target && c.id.slice(0, 12) !== target);
          return { output: target || 'container', isError: false };
        }
        if (sub === 'exec') {
          const cmdPart = args.slice(args.findIndex(a => !a.startsWith('-') && a !== 'exec') + 1).join(' ');
          return { output: `(Executing '${cmdPart}' in container — simulated)`, isError: false };
        }
        if (sub === 'logs') return { output: `172.17.0.1 - - [${new Date().toUTCString()}] "GET / HTTP/1.1" 200 615`, isError: false };
        if (sub === 'build') return { output: `[+] Building 12.3s (5/5) FINISHED\n => [1/4] FROM ubuntu:20.04\n => [2/4] RUN apt-get update\n => [3/4] RUN apt-get install -y nginx\n => [4/4] EXPOSE 80\n => exporting to image\nSuccessfully built abc123def456\nSuccessfully tagged myapp:v1`, isError: false };
        if (sub === 'commit') return { output: `sha256:abc123def456ghi789`, isError: false };
        if (sub === 'inspect') return { output: `[\n  {\n    "Id": "abc123def456",\n    "State": { "Status": "running" },\n    "NetworkSettings": { "IPAddress": "172.17.0.2" }\n  }\n]`, isError: false };
        if (sub === 'network') {
          if (args[1] === 'ls') return { output: `NETWORK ID     NAME      DRIVER    SCOPE\nabc123def456   bridge    bridge    local\ndef456abc123   host      host      local\nghi789jkl012   none      null      local`, isError: false };
          if (args[1] === 'create') return { output: `mno345pqr678`, isError: false };
          return { output: `docker network: subcommands: ls, create, rm, inspect`, isError: false };
        }
        if (sub === 'volume') {
          if (args[1] === 'ls') return { output: `DRIVER    VOLUME NAME\nlocal     my-vol\nlocal     data-vol`, isError: false };
          if (args[1] === 'create') return { output: args[2] || 'new-volume', isError: false };
          return { output: `docker volume: subcommands: ls, create, rm, inspect`, isError: false };
        }
        if (sub === 'info') return { output: `Client: Docker Engine - Community\nServer Version: 24.0.5\nContainers: ${this.dockerContainers.length} Running\nImages: ${this.dockerImages.length}`, isError: false };
        if (sub === '--version' || sub === 'version') return { output: `Docker version 24.0.5, build ced0996`, isError: false };
        return { output: `docker: '${sub}' is not a docker command. Try 'docker --help'.`, isError: true };
      }

      case 'docker-compose':
      case 'docker compose': {
        const sub = args[0] === 'compose' ? args[1] : args[0];
        if (sub === 'up') return { output: `[+] Running 2/2\n ✔ Container app-web-1    Started\n ✔ Container app-db-1     Started`, isError: false };
        if (sub === 'down') return { output: `[+] Running 3/3\n ✔ Container app-web-1    Removed\n ✔ Container app-db-1     Removed\n ✔ Network app_default    Removed`, isError: false };
        if (sub === 'ps') return { output: `NAME        IMAGE          STATUS         PORTS\napp-web-1   nginx:alpine   Up 5 seconds   0.0.0.0:80->80/tcp\napp-db-1    mysql:5.7      Up 5 seconds   3306/tcp`, isError: false };
        if (sub === 'logs') return { output: `web-1  | 172.17.0.1 - - [${new Date().toUTCString()}] "GET / HTTP/1.1" 200\ndb-1   | [System] [MY-011323] Plugin mysqlx reported...`, isError: false };
        return { output: `docker compose: subcommands: up, down, ps, logs, build, pull`, isError: false };
      }

      // ── Kubernetes ────────────────────────────
      case 'kubectl': {
        const sub = args[0];
        if (sub === 'get') {
          const resource = args[1];
          if (resource === 'pods' || resource === 'pod') {
            if (!this.k8sPods.length) return { output: `No resources found in default namespace.`, isError: false };
            const header = `NAME                          READY   STATUS    RESTARTS   AGE`;
            const rows = this.k8sPods.map(p => `${p.name.padEnd(30)} ${p.ready.padEnd(7)} ${p.status.padEnd(9)} ${p.restarts.toString().padEnd(10)} ${p.age}`);
            return { output: [header, ...rows].join('\n'), isError: false };
          }
          if (resource === 'deployments' || resource === 'deployment') {
            if (!this.k8sDeployments.length) return { output: `No resources found in default namespace.`, isError: false };
            const header = `NAME                READY   UP-TO-DATE   AVAILABLE   AGE`;
            const rows = this.k8sDeployments.map(d => `${d.name.padEnd(20)} ${d.ready.padEnd(7)} ${d.upToDate.toString().padEnd(12)} ${d.available.toString().padEnd(11)} ${d.age}`);
            return { output: [header, ...rows].join('\n'), isError: false };
          }
          if (resource === 'services' || resource === 'svc') {
            const header = `NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE`;
            const rows = this.k8sServices.map(s => `${s.name.padEnd(13)} ${s.type.padEnd(11)} ${s.clusterIP.padEnd(15)} <none>        ${s.ports.padEnd(9)} ${s.age}`);
            return { output: [header, ...rows].join('\n'), isError: false };
          }
          if (resource === 'nodes' || resource === 'node') {
            return { output: `NAME          STATUS   ROLES           AGE   VERSION\ncontrolplane  Ready    control-plane   5d    v1.28.0\nnode01        Ready    <none>          5d    v1.28.0`, isError: false };
          }
          if (resource === 'namespaces' || resource === 'ns') {
            return { output: `NAME              STATUS   AGE\ndefault           Active   5d\nkube-system       Active   5d\nkube-public       Active   5d\nmonitoring        Active   2d`, isError: false };
          }
          if (resource === 'all') {
            return { output: `NAME                      READY   STATUS    RESTARTS   AGE\npod/nginx-pod             1/1     Running   0          2m\n\nNAME                 TYPE        CLUSTER-IP    PORT(S)   AGE\nservice/kubernetes   ClusterIP   10.96.0.1     443/TCP   5d`, isError: false };
          }
          return { output: `No resources found for '${resource}'.`, isError: false };
        }
        if (sub === 'apply') {
          const file = args.find(a => !a.startsWith('-') && a !== 'apply');
          const name = file ? file.replace('.yaml', '').replace('.yml', '') : 'resource';
          const isDeployment = file?.toLowerCase().includes('deploy');
          if (isDeployment) {
            this.k8sDeployments.push({ name, ready: '3/3', upToDate: 3, available: 3, age: '0s' });
            for (let i = 0; i < 3; i++) this.k8sPods.push({ name: `${name}-${Math.random().toString(36).slice(2, 9)}`, ready: '1/1', status: 'Running', restarts: 0, age: '0s' });
          } else {
            this.k8sPods.push({ name, ready: '1/1', status: 'Running', restarts: 0, age: '0s' });
          }
          return { output: `${isDeployment ? 'deployment' : 'pod'}.apps/${name} created`, isError: false };
        }
        if (sub === 'create') {
          const type = args[1];
          const name = args.find(a => !a.startsWith('-') && !['create', type].includes(a));
          if (type === 'deployment') {
            this.k8sDeployments.push({ name: name || 'my-deploy', ready: '1/1', upToDate: 1, available: 1, age: '0s' });
            this.k8sPods.push({ name: `${name || 'my-deploy'}-abc123`, ready: '1/1', status: 'Running', restarts: 0, age: '0s' });
            return { output: `deployment.apps/${name || 'my-deploy'} created`, isError: false };
          }
          if (type === 'namespace' || type === 'ns') return { output: `namespace/${name} created`, isError: false };
          if (type === 'secret') return { output: `secret/${name} created`, isError: false };
          if (type === 'configmap' || type === 'cm') return { output: `configmap/${name} created`, isError: false };
          if (type === 'service' || type === 'svc') return { output: `service/${name} created`, isError: false };
          return { output: `${type}/${name} created`, isError: false };
        }
        if (sub === 'delete') {
          const type = args[1];
          const name = args[2];
          if (type === 'pod' || type === 'pods') this.k8sPods = this.k8sPods.filter(p => p.name !== name);
          if (type === 'deployment') this.k8sDeployments = this.k8sDeployments.filter(d => d.name !== name);
          return { output: `${type}/${name} deleted`, isError: false };
        }
        if (sub === 'describe') return { output: `Name:         ${args[2] || 'resource'}\nNamespace:    default\nLabels:       app=${args[2] || 'myapp'}\nStatus:       Running\nIP:           10.244.0.5\nEvents:\n  Normal  Scheduled  1s  default-scheduler  Successfully assigned\n  Normal  Pulled     1s  kubelet            Container image pulled\n  Normal  Started    0s  kubelet            Started container`, isError: false };
        if (sub === 'logs') return { output: `172.17.0.1 - - [${new Date().toUTCString()}] "GET / HTTP/1.1" 200 615 "-" "curl/7.68"`, isError: false };
        if (sub === 'exec') return { output: `(kubectl exec simulated — interactive shell would open here)`, isError: false };
        if (sub === 'rollout') {
          if (args[1] === 'status') return { output: `deployment "${args[2]}" successfully rolled out`, isError: false };
          if (args[1] === 'history') return { output: `REVISION  CHANGE-CAUSE\n1         kubectl apply --record\n2         kubectl set image`, isError: false };
          if (args[1] === 'undo') return { output: `deployment.apps/${args[2]} rolled back`, isError: false };
          return { output: `kubectl rollout: subcommands: status, history, undo, pause, resume`, isError: false };
        }
        if (sub === 'set') {
          if (args[1] === 'image') return { output: `deployment.apps/${args[2]} image updated`, isError: false };
          return { output: `kubectl set: subcommands: image, resources, env`, isError: false };
        }
        if (sub === 'scale') return { output: `deployment.apps/${args.find(a => a.includes('deployment/'))?.split('/')[1] || 'myapp'} scaled`, isError: false };
        if (sub === 'expose') return { output: `service/${args.find(a => !a.startsWith('-') && a !== 'expose') || 'myapp'} exposed`, isError: false };
        if (sub === 'run') {
          const name = args[1];
          this.k8sPods.push({ name: name || 'pod', ready: '1/1', status: 'Running', restarts: 0, age: '0s' });
          return { output: `pod/${name || 'pod'} created`, isError: false };
        }
        if (sub === 'version') return { output: `Client Version: v1.28.0\nKustomize Version: v5.0.4\nServer Version: v1.28.0`, isError: false };
        if (sub === 'cluster-info') return { output: `Kubernetes control plane is running at https://10.96.0.1:6443\nCoreDNS is running at https://10.96.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy`, isError: false };
        return { output: `kubectl: '${sub}' is not a kubectl command. Try 'kubectl --help'.`, isError: true };
      }

      // ── Ansible ───────────────────────────────
      case 'ansible': {
        const pattern = args[0];
        const modFlag = args.indexOf('-m');
        const mod = modFlag >= 0 ? args[modFlag + 1] : 'command';
        const aFlag = args.indexOf('-a');
        const modArgs = aFlag >= 0 ? args[aFlag + 1] : '';
        if (mod === 'ping') {
          return { output: `stapp01 | SUCCESS => {\n    "ping": "pong"\n}\nstapp02 | SUCCESS => {\n    "ping": "pong"\n}\nstapp03 | SUCCESS => {\n    "ping": "pong"\n}`, isError: false };
        }
        if (mod === 'command' || mod === 'shell') {
          return { output: `stapp01 | CHANGED | rc=0 >>\n${modArgs || 'command output'}\n\nstapp02 | CHANGED | rc=0 >>\n${modArgs || 'command output'}\n\nstapp03 | CHANGED | rc=0 >>\n${modArgs || 'command output'}`, isError: false };
        }
        if (mod === 'copy') return { output: `stapp01 | CHANGED => { "changed": true, "dest": "/tmp/file.txt" }\nstapp02 | CHANGED => { "changed": true, "dest": "/tmp/file.txt" }\nstapp03 | CHANGED => { "changed": true, "dest": "/tmp/file.txt" }`, isError: false };
        if (mod === 'setup') return { output: `stapp01 | SUCCESS => {\n  "ansible_facts": {\n    "ansible_hostname": "stapp01",\n    "ansible_os_family": "RedHat",\n    "ansible_distribution": "CentOS",\n    "ansible_distribution_version": "7"\n  }\n}`, isError: false };
        return { output: `${pattern} | CHANGED | rc=0 >>\n(ansible ad-hoc executed with module: ${mod})`, isError: false };
      }

      case 'ansible-playbook': {
        const _playbookFile = args.find(a => !a.startsWith('-') && a !== 'ansible-playbook');
        void _playbookFile;
        return { output: `\nPLAY [all] *********************************************************************\n\nTASK [Gathering Facts] *********************************************************\nok: [stapp01]\nok: [stapp02]\nok: [stapp03]\n\nTASK [main task] ***************************************************************\nchanged: [stapp01]\nchanged: [stapp02]\nchanged: [stapp03]\n\nPLAY RECAP *********************************************************************\nstapp01  : ok=2  changed=1  unreachable=0  failed=0  skipped=0\nstapp02  : ok=2  changed=1  unreachable=0  failed=0  skipped=0\nstapp03  : ok=2  changed=1  unreachable=0  failed=0  skipped=0`, isError: false };
      }

      case 'ansible-galaxy': {
        const sub = args[0];
        if (sub === 'install') return { output: `- downloading role '${args[1]}', owned by geerlingguy\n- ${args[1]} (1.0.0) was installed successfully`, isError: false };
        if (sub === 'collection') return { output: `Process install dependency map\nStarting collection install process\nInstalling 'ansible.posix:1.5.4': Successful`, isError: false };
        return { output: `ansible-galaxy: subcommands: install, list, remove, init`, isError: false };
      }

      case 'ansible-vault': return { output: `Vault password:\n(ansible-vault operation simulated)`, isError: false };

      // ── Terraform ─────────────────────────────
      case 'terraform': {
        const sub = args[0];
        if (sub === 'init') return { output: `Initializing the backend...\nInitializing provider plugins...\n- Finding hashicorp/aws versions matching "~> 5.0"...\n- Installing hashicorp/aws v5.12.0...\n\nTerraform has been successfully initialized!\nYou may now begin working with Terraform.`, isError: false };
        if (sub === 'plan') return { output: `Terraform used the selected providers to generate the following execution plan:\n\nPlan: 3 to add, 0 to change, 0 to destroy.\n\n  # aws_vpc.main will be created\n  + resource "aws_vpc" "main" {\n      + cidr_block           = "10.0.0.0/16"\n      + enable_dns_hostnames = true\n      + id                   = (known after apply)\n    }\n\nNote: You didn't use the -out option.`, isError: false };
        if (sub === 'apply') return { output: `aws_vpc.main: Creating...\naws_vpc.main: Creation complete after 2s [id=vpc-0abc123def456]\naws_security_group.main: Creating...\naws_security_group.main: Creation complete after 1s [id=sg-0def456abc789]\n\nApply complete! Resources: 2 added, 0 changed, 0 destroyed.`, isError: false };
        if (sub === 'destroy') return { output: `aws_vpc.main: Destroying... [id=vpc-0abc123def456]\naws_vpc.main: Destruction complete after 1s\n\nDestroy complete! Resources: 1 destroyed.`, isError: false };
        if (sub === 'validate') return { output: `Success! The configuration is valid.`, isError: false };
        if (sub === 'fmt') return { output: `main.tf`, isError: false };
        if (sub === 'show') return { output: `# aws_vpc.main:\nresource "aws_vpc" "main" {\n    cidr_block           = "10.0.0.0/16"\n    id                   = "vpc-0abc123def456"\n}`, isError: false };
        if (sub === 'output') return { output: `vpc_id = "vpc-0abc123def456"\ninstance_public_ip = "54.123.45.67"`, isError: false };
        if (sub === 'state') {
          if (args[1] === 'list') return { output: `aws_vpc.main\naws_security_group.main\naws_instance.app`, isError: false };
          return { output: `terraform state: subcommands: list, show, mv, rm`, isError: false };
        }
        if (sub === 'workspace') return { output: `default`, isError: false };
        if (sub === '--version' || sub === 'version') return { output: `Terraform v1.6.3\non linux_amd64`, isError: false };
        return { output: `terraform: '${sub}' is not a terraform command. Try 'terraform --help'.`, isError: true };
      }

      // ── Jenkins CLI ───────────────────────────
      case 'java': {
        if (args.includes('-jar') && args.some(a => a.includes('jenkins-cli'))) {
          const jCmd = args[args.indexOf('-jar') + 2];
          return { output: `Jenkins CLI: executed '${jCmd || 'help'}' on jenkins server.`, isError: false };
        }
        return { output: `openjdk 17.0.9 2023-10-17\nOpenJDK Runtime Environment (build 17.0.9+9)`, isError: false };
      }

      // ── Misc Utilities ────────────────────────
      case 'which': return { output: `/usr/bin/${args[0] || 'bash'}`, isError: false };
      case 'man': return { output: `(Man pages not available in simulation. Use '--help' flag with commands.)`, isError: false };
      case 'history': return { output: this.cmdHistory.map((c, i) => `  ${(i + 1).toString().padStart(4)}  ${c}`).join('\n'), isError: false };
      case 'alias': return { output: `alias ll='ls -la'\nalias la='ls -A'\nalias k='kubectl'`, isError: false };
      case 'type': return { output: `${args[0]} is /usr/bin/${args[0]}`, isError: false };
      case 'tree': return { output: `.\n├── ansible\n│   └── inventory\n├── notes.txt\n├── playbooks\n└── scripts\n\n3 directories, 2 files`, isError: false };
      case 'clear': return { output: '\x1b[CLEAR]', isError: false };
      case 'help': return { output: `Available command categories:\n  Files:    ls, cd, pwd, mkdir, touch, rm, cp, mv, cat, echo, find, grep, tail, head, wc\n  System:   ps, top, df, du, free, id, whoami, uname, uptime, date, env, export\n  Network:  ip, ping, curl, ss, netstat, dig, ssh, scp, ssh-keygen\n  Packages: yum, dnf, apt, pip, pip3\n  Services: systemctl, service\n  Git:      git init/clone/add/commit/push/pull/branch/checkout/log/status\n  Docker:   docker run/ps/images/pull/build/exec/logs/stop/rm/network\n  K8s:      kubectl get/apply/create/delete/describe/logs/exec/rollout\n  Ansible:  ansible, ansible-playbook, ansible-galaxy, ansible-vault\n  Terraform:terraform init/plan/apply/destroy/validate/output/state\n  Users:    useradd, userdel, usermod, passwd, groupadd, sudo, su\n  Type 'help <category>' for more details.`, isError: false };

      // Special handling for docker compose as two words
      default: {
        if (base === 'docker' && args[0] === 'compose') {
          return this.execute(['docker-compose', ...args.slice(1)].join(' '));
        }
        // Variable assignment
        if (rawCmd.includes('=') && !rawCmd.startsWith('if') && !rawCmd.includes('==')) {
          const match = rawCmd.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)/);
          if (match) {
            this.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
            return { output: '', isError: false };
          }
        }
        // Variable expansion
        if (rawCmd.startsWith('$')) {
          const varName = rawCmd.slice(1);
          return { output: this.env[varName] || '', isError: false };
        }
        return { output: `bash: ${base}: command not found\nType 'help' for a list of available commands.`, isError: true };
      }
    }
  }

  private handlePipe(cmd: string): { output: string; isError: boolean } {
    const parts = cmd.split('|').map(p => p.trim());
    let result = this.execute(parts[0]);
    return result;
  }

  private handleRedirect(cmd: string): { output: string; isError: boolean } {
    const appendMode = cmd.includes('>>');
    const parts = cmd.split(appendMode ? '>>' : '>').map(p => p.trim());
    const srcCmd = parts[0];
    const destFile = parts[1]?.trim();
    const result = this.execute(srcCmd);
    if (destFile) {
      const resolved = this.resolvePath(destFile);
      const parent = this.getNode(resolved.slice(0, -1));
      if (parent && parent.type === 'dir') {
        const name = resolved[resolved.length - 1];
        const existing = parent.children[name];
        const content = appendMode && existing?.type === 'file' ? existing.content + '\n' + result.output : result.output;
        parent.children[name] = { type: 'file', content };
      }
    }
    return { output: '', isError: false };
  }
}

// ─────────────────────────────────────────────
// Quick Scenarios
// ─────────────────────────────────────────────
const QUICK_SCENARIOS: QuickScenario[] = [
  { label: 'Linux Basics', icon: '🐧', commands: ['whoami', 'pwd', 'ls -la', 'id', 'uname -a', 'df -h', 'free -m'] },
  { label: 'User Mgmt', icon: '👤', commands: ['useradd -s /sbin/nologin john', 'id john', 'passwd john', 'usermod -aG docker thor', 'chage -l john'] },
  { label: 'SSH & Keys', icon: '🔑', commands: ['ssh-keygen -t rsa -b 4096', 'cat /etc/ssh/sshd_config', 'ssh-copy-id tony@stapp01', 'ssh tony@stapp01'] },
  { label: 'Git Workflow', icon: '🌿', commands: ['git init', 'git config user.name "Thor"', 'touch README.md', 'git add README.md', 'git commit -m "initial commit"', 'git log --oneline', 'git branch feature-xyz', 'git checkout feature-xyz'] },
  { label: 'Docker', icon: '🐳', commands: ['docker pull nginx:latest', 'docker images', 'docker run -d --name nginx1 -p 8080:80 nginx:latest', 'docker ps', 'docker logs nginx1', 'docker stop nginx1', 'docker rm nginx1'] },
  { label: 'Kubernetes', icon: '☸️', commands: ['kubectl cluster-info', 'kubectl get nodes', 'kubectl get pods', 'kubectl create deployment nginx --image=nginx', 'kubectl get deployments', 'kubectl expose deployment nginx --port=80 --type=NodePort', 'kubectl get svc', 'kubectl rollout status deployment/nginx'] },
  { label: 'Ansible', icon: '⚙️', commands: ['cat /home/thor/ansible/inventory', 'ansible all -m ping -i /home/thor/ansible/inventory', 'ansible all -m command -a "uptime" -i /home/thor/ansible/inventory', 'ansible-playbook -i /home/thor/ansible/inventory playbook.yml'] },
  { label: 'Terraform', icon: '🏗️', commands: ['terraform --version', 'terraform init', 'terraform validate', 'terraform plan', 'terraform apply', 'terraform output', 'terraform state list', 'terraform destroy'] },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const PracticeTerminalView: React.FC<{ switchView?: (v: string) => void }> = ({ switchView }) => {
  const engineRef = useRef(new CommandEngine());
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: '╔══════════════════════════════════════════════════════════════╗' },
    { type: 'info', text: '║     🖥️  DevOps 90 — Practice Terminal  (Simulated Shell)     ║' },
    { type: 'info', text: '╚══════════════════════════════════════════════════════════════╝' },
    { type: 'output', text: 'Simulated Linux environment — 100+ commands available.' },
    { type: 'output', text: 'Type  help  to see all commands, or pick a scenario on the right.' },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<QuickScenario | null>(null);
  const [taskDay, setTaskDay] = useState<number | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  const runCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const engine = engineRef.current;
    const prompt = engine.getPrompt();

    if (trimmed === 'clear') {
      setLines([{ type: 'info', text: '(Terminal cleared)' }]);
      setInput('');
      return;
    }

    setCmdHistory(prev => [trimmed, ...prev]);
    setHistIdx(-1);

    const result = engine.execute(trimmed);

    setLines(prev => {
      const next: TerminalLine[] = [
        ...prev,
        { type: 'prompt', text: prompt, cmd: trimmed },
      ];
      if (result.output) {
        next.push({
          type: result.isError ? 'error' : 'output',
          text: result.output,
        });
      }
      return next;
    });
    setInput('');
  }, []);

  const runScenario = (scenario: QuickScenario) => {
    setSelectedScenario(scenario);
    setLines(prev => [
      ...prev,
      { type: 'separator', text: `─── Scenario: ${scenario.label} ──────────────────────────────────────` },
    ]);
  };

  const runScenarioStep = (cmd: string) => {
    runCommand(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx >= 0 ? cmdHistory[idx] : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab-completion for known commands
      const cmds = ['ls', 'cd', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'echo', 'grep', 'find', 'git', 'docker', 'kubectl', 'ansible', 'ansible-playbook', 'terraform', 'systemctl', 'useradd', 'chmod', 'ssh', 'ping', 'curl', 'help'];
      const match = cmds.find(c => c.startsWith(input));
      if (match) setInput(match);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const prompt = engineRef.current.getPrompt();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: '16px', color: '#eeeef5', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>Practice</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>🖥️ Linux Practice Terminal</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#8f9bb3' }}>
            Simulated shell — 100+ commands across Linux, Git, Docker, K8s, Ansible &amp; Terraform
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {taskDay !== null && (
            <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', fontSize: '13px', color: '#38bdf8', fontWeight: 600 }}>
              📅 Day {taskDay} context loaded
            </span>
          )}
          {switchView && (
            <button onClick={() => switchView('daily-tasks')} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--s2, #1a1d2d)', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              ← Back to Tasks
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* ─── Terminal Panel ────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d1117', border: '1px solid #222d42', borderRadius: '12px', overflow: 'hidden', minWidth: 0 }}>
          {/* Title Bar */}
          <div style={{ background: '#161b22', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #222d42', flexShrink: 0 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: '#7d8fa8', marginLeft: '8px', fontFamily: 'monospace' }}>
              thor@jump-server:~  —  bash
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#4a5568', background: '#0d1117', padding: '2px 8px', borderRadius: '4px', border: '1px solid #222d42' }}>
              simulated
            </span>
            <button
              onClick={() => { setLines([]); setSelectedScenario(null); engineRef.current = new CommandEngine(); }}
              style={{ marginLeft: '8px', fontSize: '11px', color: '#8f9bb3', background: 'transparent', border: '1px solid #222d42', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
              title="Reset terminal"
            >
              ⟳ Reset
            </button>
          </div>

          {/* Output */}
          <div
            ref={outputRef}
            onClick={() => inputRef.current?.focus()}
            style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: '13px', lineHeight: '1.75', cursor: 'text' }}
          >
            {lines.map((line, i) => {
              if (line.type === 'prompt') {
                const promptParts = line.text.split(']$');
                return (
                  <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: '0px' }}>
                    <span style={{ color: '#28c840' }}>{promptParts[0]}</span>
                    <span style={{ color: '#7d8fa8' }}>]$</span>
                    <span style={{ color: '#e6edf3', marginLeft: '6px' }}>{line.cmd}</span>
                  </div>
                );
              }
              if (line.type === 'error') return (
                <div key={i} style={{ color: '#ff5f5f', whiteSpace: 'pre-wrap' }}>{line.text}</div>
              );
              if (line.type === 'success') return (
                <div key={i} style={{ color: '#28c840', background: 'rgba(40,200,64,0.08)', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>{line.text}</div>
              );
              if (line.type === 'info') return (
                <div key={i} style={{ color: '#38bdf8', whiteSpace: 'pre-wrap' }}>{line.text}</div>
              );
              if (line.type === 'separator') return (
                <div key={i} style={{ color: '#4a5568', fontSize: '11px', marginTop: '8px', marginBottom: '4px' }}>{line.text}</div>
              );
              return (
                <div key={i} style={{ color: '#a8b8cc', whiteSpace: 'pre-wrap' }}>{line.text}</div>
              );
            })}
            {/* Live input line */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ color: '#28c840', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {prompt.split(']$')[0]}
              </span>
              <span style={{ color: '#7d8fa8' }}>]$</span>
              <span style={{ marginLeft: '6px', color: '#e6edf3', whiteSpace: 'pre' }}>{input}</span>
              <span style={{ animation: 'cursorBlink 1s step-end infinite', color: '#28c840', marginLeft: '1px' }}>▋</span>
            </div>
          </div>

          {/* Input Bar */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid #222d42', background: '#0d1117', gap: '8px', flexShrink: 0 }}>
            <span style={{ color: '#28c840', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'nowrap' }}>
              {prompt}
            </span>
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setHistIdx(-1); }}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontFamily: "'Fira Code', 'Courier New', monospace",
                fontSize: '13px', color: '#e6edf3', caretColor: '#28c840',
              }}
              placeholder="type a command and press Enter…"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
            />
            <button
              onClick={() => runCommand(input)}
              style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#28c840', color: '#0d1117', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Run ↵
            </button>
          </div>
        </div>

        {/* ─── Sidebar ───────────────────────────── */}
        <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {/* Keyboard shortcuts */}
          <div style={{ background: 'var(--s1, #131520)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              ⌨ Shortcuts
            </div>
            {[['↑ / ↓', 'Command history'], ['Tab', 'Autocomplete'], ['Ctrl+L', 'Clear terminal'], ['Enter', 'Run command']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <kbd style={{ background: '#1a1d2d', border: '1px solid #333', borderRadius: '3px', padding: '1px 6px', color: '#e6edf3', fontFamily: 'monospace' }}>{k}</kbd>
                <span style={{ color: '#8f9bb3', fontSize: '11px' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Scenarios */}
          <div style={{ background: 'var(--s1, #131520)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              🚀 Quick Scenarios
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {QUICK_SCENARIOS.map(s => (
                <button
                  key={s.label}
                  onClick={() => runScenario(s)}
                  style={{
                    background: selectedScenario?.label === s.label ? 'rgba(56,189,248,0.1)' : 'var(--s2, #1a1d2d)',
                    border: `1px solid ${selectedScenario?.label === s.label ? 'rgba(56,189,248,0.4)' : 'var(--border)'}`,
                    borderRadius: '6px', padding: '8px 10px', cursor: 'pointer',
                    textAlign: 'left', color: selectedScenario?.label === s.label ? '#38bdf8' : '#e6edf3',
                    fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                  }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {selectedScenario && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: '#8f9bb3', fontWeight: 600, marginBottom: '8px' }}>
                  Click to run commands step-by-step:
                </div>
                {selectedScenario.commands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => runScenarioStep(cmd)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid #222d42',
                      borderRadius: '4px', padding: '4px 8px', marginBottom: '4px',
                      cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px',
                      color: '#28c840', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(40,200,64,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                  >
                    $ {cmd}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Day Tasks quick reference */}
          <div style={{ background: 'var(--s1, #131520)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              📅 Load Day Context
            </div>
            <select
              value={taskDay ?? ''}
              onChange={e => {
                const day = Number(e.target.value);
                setTaskDay(day);
                const task = dailyTasks.find(t => t.day === day);
                if (task) {
                  setLines(prev => [
                    ...prev,
                    { type: 'separator', text: `─── Day ${day}: ${task.title} ─────────────────────────────────` },
                    { type: 'info', text: task.description || task.title },
                    { type: 'separator', text: '──────────────────────────────────────────────────────────' },
                  ]);
                }
              }}
              style={{ width: '100%', padding: '8px', background: '#0d1117', border: '1px solid #222d42', borderRadius: '6px', color: '#e6edf3', fontSize: '12px', cursor: 'pointer' }}
            >
              <option value="">Select a day…</option>
              {dailyTasks.map(t => (
                <option key={t.day} value={t.day}>Day {t.day}: {t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
