import { BootcampDay } from '../types';

export const day6: BootcampDay = {
  day: 6,
  title: "VPC NETWORKING",
  subtitle: "Subnets · Route Tables · Internet Gateway · NAT · Security Groups · NACLs",
  color: "#30a0ff",
  trainerNote: "Build a VPC with a public and private subnet — I ask this in every phone screen for junior DevOps roles. Not because I expect perfection. Because how you answer tells me if you understand why networking works, not just what buttons to click.",
  engineerNote: "Go slow today. Draw every component on paper before building it.",
  goal: {
    icon: "🎯",
    title: "Day 6 Goal",
    description: "By end of Day 6 you can build a VPC with a public subnet and a private subnet from scratch using the CLI. You understand why traffic flows the way it does, and you can explain it in an interview. A second EC2 in the private subnet is NOT reachable from the internet — and you know exactly why and how to change that if needed."
  },
  schedule: [
    {
      time: "09:00–09:20",
      phase: "RECALL",
      activity: "IAM cold review",
      why: "From memory: what's the difference between a role and a user? What's in a trust policy? If you need notes, re-read Day 5 concepts before networking."
    },
    {
      time: "09:20–10:45",
      phase: "THEORY",
      activity: "VPC mental model — draw before you build",
      why: "VPC, CIDR, subnets (public vs private), route tables, internet gateway, NAT gateway. Before touching the CLI, draw this on paper. This is the picture you describe in interviews."
    },
    {
      time: "10:45–11:00",
      phase: "BREAK",
      activity: "Break",
      why: ""
    },
    {
      time: "11:00–12:30",
      phase: "HANDS-ON",
      activity: "Build the VPC: CLI steps 1–6",
      why: "Create VPC, subnets, IGW, route tables. Each command creates one piece. After each step, describe what you just built aloud."
    },
    {
      time: "12:30–13:15",
      phase: "BREAK",
      activity: "Lunch",
      why: ""
    },
    {
      time: "13:15–14:30",
      phase: "HANDS-ON",
      activity: "Launch EC2 in each subnet + verify connectivity",
      why: "Launch EC2 in public subnet — verify reachable from internet. Launch EC2 in private subnet — verify NOT reachable. This is the practical test that confirms you built it correctly."
    },
    {
      time: "14:30–15:30",
      phase: "HANDS-ON",
      activity: "Security Groups vs NACLs — difference and demo",
      why: "These are two different firewall layers. Most beginners know only Security Groups. Understanding NACLs as the second layer puts you ahead of 70% of junior candidates."
    },
    {
      time: "15:30–15:45",
      phase: "BREAK",
      activity: "Break",
      why: ""
    },
    {
      time: "15:45–16:45",
      phase: "PROJECT",
      activity: "Mini Project: Fully networked 2-tier VPC",
      why: ""
    },
    {
      time: "16:45–17:00",
      phase: "COMMIT",
      activity: "Day 6 notes, architecture diagram description, commit",
      why: ""
    }
  ],
  concepts: [
    {
      icon: "🏘",
      title: "VPC + CIDR Block",
      description: "A VPC is your private, isolated network inside AWS. The CIDR block (e.g. 10.0.0.0/16) defines its IP address range. /16 gives you 65,536 IP addresses to distribute among subnets.",
      analogy: "Use 10.0.0.0/16 for your VPC. Don't use 192.168.0.0/16 — it conflicts with most home routers if you ever need VPN connectivity."
    },
    {
      icon: "🔵",
      title: "Public vs Private Subnet",
      description: "Public subnet: has a route to the Internet Gateway. Resources can have public IPs and talk to the internet directly. Private subnet: no route to internet. Resources can't be reached from outside — only from within the VPC.",
      analogy: "Web servers go in public. Databases and backend services go in private. This is the fundamental security architecture of every production cloud app."
    },
    {
      icon: "🌐",
      title: "Internet Gateway (IGW)",
      description: "The door between your VPC and the public internet. Without it, nothing inside the VPC can reach or be reached from the internet. One IGW per VPC. Attached to the VPC, not to a subnet.",
      analogy: "Making a subnet 'public' means: create a route table that sends 0.0.0.0/0 to the IGW, then associate that route table with the subnet. That's it."
    },
    {
      icon: "🔄",
      title: "Route Table",
      description: "A routing rule table. Each subnet has exactly one route table. Routes say 'traffic to X goes to Y.' The local route (10.0.0.0/16 → local) is always there. You add 0.0.0.0/0 → igw-xxx to make a subnet public.",
      analogy: "The most common VPC mistake is building an IGW but forgetting to add the route. Build the IGW. Then add the route. Two separate steps."
    },
    {
      icon: "🔀",
      title: "NAT Gateway",
      description: "Lets private subnet resources access the internet (for updates, API calls) without exposing them with a public IP. Traffic goes: Private EC2 → NAT Gateway (in public subnet) → IGW → internet. Return traffic reverses.",
      analogy: "NAT Gateway costs money (~$32/month). For learning, skip it. For production, it's mandatory for any private subnet that needs outbound internet. We skip it in today's build but understand it conceptually."
    },
    {
      icon: "🧱",
      title: "Security Group vs NACL",
      description: "Security Group: stateful, attached to EC2. If inbound is allowed, response is automatically allowed. NACL: stateless, attached to subnet. You must explicitly allow both inbound AND outbound for each flow. NACLs are evaluated first, SGs second.",
      analogy: "Security groups are your primary tool. NACLs are the subnet-level guardrail. Most teams manage SGs; some add NACLs for extra security layers."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 1,
      sessionTitle: "VPC Build — Steps 1 to 8 (CLI only, no console)",
      sections: [
        {
          label: "Step 1: Create the VPC",
          lines: [
            { type: "cmd", prompt: "$", text: "VPC_ID=$(aws ec2 create-vpc \\\n  --cidr-block 10.0.0.0/16 \\\n  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=devops-learning-vpc}]' \\\n  --query 'Vpc.VpcId' --output text)" },
            { type: "cmd", prompt: "$", text: "echo \"VPC ID: $VPC_ID\"" },
            { type: "ok", text: "VPC ID: vpc-0a1234567890abcde" },
            { type: "comment", text: "We captured the ID into a variable — reuse it in every step below" }
          ]
        },
        {
          label: "Step 2: Create Public and Private Subnets",
          lines: [
            { type: "cmd", prompt: "$", text: "PUBLIC_SUBNET=$(aws ec2 create-subnet \\\n  --vpc-id $VPC_ID \\\n  --cidr-block 10.0.1.0/24 \\\n  --availability-zone eu-west-1a \\\n  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet}]' \\\n  --query 'Subnet.SubnetId' --output text)" },
            { type: "comment", text: "10.0.1.0/24 = 256 IPs in this subnet (AWS reserves 5, so 251 usable)" },
            { type: "cmd", prompt: "$", text: "PRIVATE_SUBNET=$(aws ec2 create-subnet \\\n  --vpc-id $VPC_ID \\\n  --cidr-block 10.0.2.0/24 \\\n  --availability-zone eu-west-1a \\\n  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet}]' \\\n  --query 'Subnet.SubnetId' --output text)" },
            { type: "cmd", prompt: "$", text: "echo \"Public: $PUBLIC_SUBNET | Private: $PRIVATE_SUBNET\"" }
          ]
        },
        {
          label: "Step 3: Create and Attach Internet Gateway",
          lines: [
            { type: "cmd", prompt: "$", text: "IGW_ID=$(aws ec2 create-internet-gateway \\\n  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=devops-igw}]' \\\n  --query 'InternetGateway.InternetGatewayId' --output text)" },
            { type: "cmd", prompt: "$", text: "aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID" },
            { type: "comment", text: "CRITICAL: Creating the IGW alone does nothing. Must attach it to the VPC.\nThen ALSO create a route pointing to it. IGW without a route = useless." }
          ]
        },
        {
          label: "Step 4: Create Route Table for Public Subnet",
          lines: [
            { type: "cmd", prompt: "$", text: "PUBLIC_RT=$(aws ec2 create-route-table \\\n  --vpc-id $VPC_ID \\\n  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]' \\\n  --query 'RouteTable.RouteTableId' --output text)" },
            { type: "cmd", prompt: "$", text: "aws ec2 create-route \\\n  --route-table-id $PUBLIC_RT \\\n  --destination-cidr-block 0.0.0.0/0 \\\n  --gateway-id $IGW_ID" },
            { type: "comment", text: "0.0.0.0/0 = \"all traffic not matching a specific route\" → send to IGW\nThis is THE line that makes a subnet public. Without it, it's private." },
            { type: "cmd", prompt: "$", text: "aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET --route-table-id $PUBLIC_RT" },
            { type: "comment", text: "Link the public route table to the public subnet" }
          ]
        },
        {
          label: "Step 5: Enable Auto-assign Public IP in Public Subnet",
          lines: [
            { type: "cmd", prompt: "$", text: "aws ec2 modify-subnet-attribute \\\n  --subnet-id $PUBLIC_SUBNET \\\n  --map-public-ip-on-launch" },
            { type: "comment", text: "EC2 instances launched here automatically get a public IP" }
          ]
        },
        {
          label: "Step 6: Create Security Group for Public EC2",
          lines: [
            { type: "cmd", prompt: "$", text: "PUBLIC_SG=$(aws ec2 create-security-group \\\n  --group-name public-sg \\\n  --description \"Public subnet SG\" \\\n  --vpc-id $VPC_ID \\\n  --query 'GroupId' --output text)" },
            { type: "cmd", prompt: "$", text: "aws ec2 authorize-security-group-ingress --group-id $PUBLIC_SG --protocol tcp --port 22 --cidr 0.0.0.0/0" },
            { type: "cmd", prompt: "$", text: "aws ec2 authorize-security-group-ingress --group-id $PUBLIC_SG --protocol tcp --port 80 --cidr 0.0.0.0/0" }
          ]
        },
        {
          label: "Step 7: Launch EC2 in Public Subnet",
          lines: [
            { type: "cmd", prompt: "$", text: "aws ec2 run-instances \\\n  --image-id ami-YOUR_UBUNTU_AMI \\\n  --instance-type t2.micro \\\n  --key-name YOUR_KEY_NAME \\\n  --subnet-id $PUBLIC_SUBNET \\\n  --security-group-ids $PUBLIC_SG \\\n  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=public-ec2}]'" }
          ]
        },
        {
          label: "Step 8: Verify — What Can and Cannot Reach the Internet",
          lines: [
            { type: "comment", text: "Public EC2: can SSH in from laptop ✓, can ping 8.8.8.8 from inside ✓\nPrivate subnet EC2 (if launched): cannot be SSHed from laptop ✓\nPrivate subnet EC2: cannot reach internet (no NAT) ✓" },
            { type: "cmd", prompt: "$", text: "aws ec2 describe-instances \\\n  --filters \"Name=tag:Name,Values=public-ec2\" \\\n  --query 'Reservations[0].Instances[0].[PublicIpAddress,SubnetId,VpcId]' \\\n  --output text" },
            { type: "ok", text: "3.250.xxx.xxx subnet-0pub... vpc-0abc..." }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "⚡ EC2 in VPC Not Reachable — Full Diagnostic",
      steps: [
        {
          num: 1,
          title: "Is the instance in the right subnet?",
          description: "Confirm it's in the public subnet, not the private one.",
          cmd: "aws ec2 describe-instances --instance-ids i-xxx --query 'Reservations[0].Instances[0].SubnetId'"
        },
        {
          num: 2,
          title: "Does the instance have a public IP?",
          description: "Launched in public subnet without auto-assign public IP, or forgot --associate-public-ip-address.",
          cmd: "aws ec2 describe-instances --query 'Reservations[0].Instances[0].PublicIpAddress'"
        },
        {
          num: 3,
          title: "Does the subnet's route table have a route to the IGW?",
          description: "The most common VPC mistake. IGW attached but route missing. Look for a route: 0.0.0.0/0 → igw-xxx. If it's not there, traffic has nowhere to go.",
          cmd: "aws ec2 describe-route-tables --filters \"Name=association.subnet-id,Values=$SUBNET_ID\""
        },
        {
          num: 4,
          title: "Does the security group allow inbound on the port you're trying?",
          description: "Port 22 for SSH, port 80 for HTTP.",
          cmd: "aws ec2 describe-security-groups --group-ids $SG_ID"
        },
        {
          num: 5,
          title: "Is the IGW attached to the VPC?",
          description: "State should be \"attached\". If it's \"detached\", you created but forgot to attach.",
          cmd: "aws ec2 describe-internet-gateways --filters \"Name=attachment.vpc-id,Values=$VPC_ID\""
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Forgetting to add the 0.0.0.0/0 route to the IGW",
      description: "Creating an IGW and attaching it to a VPC does NOT automatically make any subnet public. You must create a route table with a 0.0.0.0/0 → igw-xxx route AND associate it with the subnet. Two separate steps. Most people forget step 2.",
      fix: "Fix: After creating the route, always verify: aws ec2 describe-route-tables --route-table-id RT_ID | grep 0.0.0.0"
    },
    {
      mistake: "Launching EC2 in default VPC instead of custom VPC",
      description: "If you omit --subnet-id, AWS puts it in the default VPC. Your custom VPC work was pointless — you're not even using it.",
      fix: "Fix: Always specify --subnet-id explicitly. Verify instance VPC after launch with describe-instances."
    },
    {
      mistake: "Confusing Security Groups (stateful) with NACLs (stateless)",
      description: "On NACLs, allowing inbound port 80 does NOT automatically allow the response. You must also add an outbound rule for ephemeral ports (1024-65535) that the response uses. Forgetting this breaks outbound traffic silently.",
      fix: "Fix: For learning, stick to Security Groups. Only add NACLs when you specifically need subnet-level controls. Remember: NACLs are stateless — both inbound AND outbound rules are required."
    }
  ],
  project: {
    tag: "📁 Day 6 Mini Project",
    title: "Build a 2-Tier VPC — Public Web Tier, Private Data Tier",
    timeEstimate: "⏱ ~80 min",
    goal: "Build a complete 2-tier VPC from scratch using only CLI. Public subnet has an EC2 running nginx (accessible from internet). Private subnet has an EC2 that can only be accessed from the public subnet via SSH jump (not directly from internet). Write an architecture description in your README using text — this trains you to describe infrastructure verbally, which is what interviews require.",
    checklist: [
      "VPC: 10.0.0.0/16, tagged \"devops-week1-vpc\"",
      "Public subnet: 10.0.1.0/24, has auto-assign public IP enabled",
      "Private subnet: 10.0.2.0/24, no public IP assignment",
      "IGW created, attached to VPC",
      "Public route table: 0.0.0.0/0 → IGW, associated with public subnet",
      "Private route table: local route only (no internet), associated with private subnet",
      "Public SG: allows port 22 and 80 from 0.0.0.0/0",
      "Private SG: allows port 22 ONLY from the public subnet CIDR (10.0.1.0/24)",
      "EC2 in public subnet: install nginx, verify accessible from browser",
      "EC2 in private subnet: verify you CANNOT SSH directly from your laptop",
      "From public EC2, SSH into private EC2 (jump host pattern) — this should work",
      "Write architecture diagram as ASCII art in your GitHub README"
    ],
    expectedOutput: "laptop → Public EC2 port 22: ✓ SUCCESS\nlaptop → Public EC2 port 80: ✓ SUCCESS (nginx)\nlaptop → Private EC2 port 22: ✗ CONNECTION TIMEOUT (no route to internet)\nPublic EC2 → Private EC2 port 22: ✓ SUCCESS (same VPC, SG allows from 10.0.1.0/24)\nPrivate EC2 → internet (ping 8.8.8.8): ✗ TIMEOUT (no NAT gateway)"
  },
  interview: [
    {
      question: "What is a VPC and why would you build a custom one instead of using the default?",
      answer: "A VPC — Virtual Private Cloud — is an isolated network section within AWS where you control the IP address range, subnets, routing, and security. The default VPC is convenient for learning but it's configured for simplicity, not security — all subnets can talk to each other and to the internet by default, there's no subnet segregation. A custom VPC lets you implement proper architecture: public subnets for internet-facing resources like load balancers and web servers, private subnets for databases and application servers that should never be directly internet-accessible. You control every routing decision and security layer. In production, you always use a custom VPC — the default VPC is never used beyond testing."
    },
    {
      question: "What makes a subnet public in AWS?",
      answer: "Three things must all be true for a subnet to be effectively public. One: the VPC must have an Internet Gateway attached. Two: the subnet's route table must have a route entry for 0.0.0.0/0 pointing to that Internet Gateway — this is the line that makes internet traffic possible. Three: the resource inside the subnet must have a public IP address and the security group must allow the relevant inbound traffic. If any of these three are missing, the subnet effectively behaves as private. I verified this in my lab by building a subnet with an IGW but deliberately leaving out the route — SSH connections timed out immediately, confirming the route is the critical piece."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "You created an Internet Gateway and attached it to your VPC, but EC2 in the public subnet is still unreachable. What is the most likely missing step?",
      options: [
        { text: "A) The EC2 doesn't have enough RAM", isCorrect: false },
        { text: "B) The subnet's route table doesn't have a route for 0.0.0.0/0 pointing to the IGW", isCorrect: true },
        { text: "C) The VPC needs a second IGW for redundancy", isCorrect: false },
        { text: "D) IGW requires a NAT Gateway to function", isCorrect: false }
      ],
      explanation: "Creating and attaching an IGW doesn't automatically route anything to it. You must explicitly create a route: destination 0.0.0.0/0, target igw-xxx, in the route table associated with the subnet. This is the most common VPC mistake made by beginners."
    },
    {
      num: 2,
      question: "What CIDR block would give you 256 IP addresses in a subnet?",
      options: [
        { text: "A) /16", isCorrect: false },
        { text: "B) /20", isCorrect: false },
        { text: "C) /24", isCorrect: true },
        { text: "D) /32", isCorrect: false }
      ],
      explanation: "/24 = 256 IPs (2^8). AWS reserves 5 in each subnet, so 251 usable. /16 = 65,536. /20 = 4,096. /32 = single IP. You need to know /16 for VPCs and /24 for subnets for any AWS interview."
    },
    {
      num: 3,
      question: "What is the key difference between a Security Group and a NACL?",
      options: [
        { text: "A) Security Groups are for VPCs, NACLs are for EC2", isCorrect: false },
        { text: "B) Security Groups are stateful (return traffic automatic); NACLs are stateless (return traffic must be explicitly allowed)", isCorrect: true },
        { text: "C) NACLs are cheaper than Security Groups", isCorrect: false },
        { text: "D) Security Groups apply to subnets, NACLs apply to instances", isCorrect: false }
      ],
      explanation: "It's the opposite: Security Groups apply to instances (or ENIs), NACLs apply to subnets. Stateful vs stateless is the critical distinction — on NACLs, you must allow both inbound request AND outbound response explicitly. Security groups handle the response automatically."
    },
    {
      num: 4,
      question: "A private subnet EC2 needs to download software updates from the internet. It has no public IP. What AWS resource enables this?",
      options: [
        { text: "A) Internet Gateway directly", isCorrect: false },
        { text: "B) Security Group with outbound rule", isCorrect: false },
        { text: "C) NAT Gateway in the public subnet", isCorrect: true },
        { text: "D) VPC Peering", isCorrect: false }
      ],
      explanation: "NAT Gateway sits in the public subnet, has a public IP itself. Private instances route their outbound internet traffic to the NAT Gateway, which performs network address translation on their behalf. Replies come back through the NAT, forwarded to the private instance. The instance never has a public IP but can reach the internet outbound."
    },
    {
      num: 5,
      question: "How many Internet Gateways can be attached to a single VPC?",
      options: [
        { text: "A) One", isCorrect: true },
        { text: "B) One per subnet", isCorrect: false },
        { text: "C) Unlimited", isCorrect: false },
        { text: "D) Two (primary and backup)", isCorrect: false }
      ],
      explanation: "One IGW per VPC — always. It's a one-to-one relationship. The IGW is highly available and scales automatically — AWS handles the redundancy. You don't need two. If you need multiple VPCs to connect, use VPC Peering or Transit Gateway, not multiple IGWs."
    }
  ],
  github: {
    filename: "devops-90days/day-06/README.md",
    commitMessage: "docs: Add Day 06 notes — VPC build from scratch with 2-tier architecture",
    template: `# Day 06 — VPC Networking + 2-Tier Architecture
**Date:** YYYY-MM-DD | **Difficulty:** Hard | **Status:** ✅ Complete

---

## 🏗 Architecture I Built Today

\`\`\`
Internet
    |
[Internet Gateway]  ← attached to VPC
    |
[VPC: 10.0.0.0/16]
    ├─ [Public Subnet: 10.0.1.0/24]
    │    ├─ Route Table: 0.0.0.0/0 → IGW, local → local
    │    └─ [EC2: nginx web server] ← has public IP, reachable from internet
    │
    └─ [Private Subnet: 10.0.2.0/24]
         ├─ Route Table: local → local ONLY (no internet route)
         └─ [EC2: backend] ← NO public IP, only reachable from public subnet
\`\`\`

## ⌨️ VPC Build Command Reference

\`\`\`bash
# Full VPC build — use variables to chain IDs
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query 'Vpc.VpcId' --output text)
PUBLIC_SUBNET=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 ...)
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
PUBLIC_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $PUBLIC_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET --route-table-id $PUBLIC_RT
\`\`\`

## 🔑 Key Rules I Know Cold

- **What makes a subnet public**: route table has 0.0.0.0/0 → IGW. That single route is it.
- **Security Group**: stateful, attached to instance. Inbound allow = response automatic.
- **NACL**: stateless, attached to subnet. Must explicitly allow inbound AND outbound.
- **NAT Gateway**: lets private instances reach internet outbound. Costs ~$32/month.
- **IGW limit**: exactly 1 per VPC, always.

## 📈 Tomorrow — Day 7
Week 1 Capstone: Full automated deployment pipeline combining Bash + IAM + S3 + VPC.`
  }
};
