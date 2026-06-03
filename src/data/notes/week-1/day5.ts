import { BootcampDay } from '../types';

export const day5: BootcampDay = {
  day: 5,
  title: "IAM DEPTH + S3",
  subtitle: "Policies · Roles · Least Privilege · S3 Buckets · Bucket Policies · Static Site",
  color: "#e040fb",
  trainerNote: "IAM is where most beginners get overconfident. They see AdministratorAccess and think 'that's easy, I'll just use that.' That thinking gets people fired in production. Spend time on least-privilege today.",
  engineerNote: "I've seen breach post-mortems where storing AWS access keys in ~/.aws/credentials was the root cause. IAM roles on EC2. Always.",
  goal: {
    icon: "🎯",
    title: "Day 5 Goal",
    description: "By end of Day 5 you understand IAM at the level interviews test. You can write a custom IAM policy from scratch, attach a role to your EC2, and use S3 for real storage from the terminal — not the console. You will host a static website on S3. Expected output: An EC2 with an IAM role that has read-only S3 access. A static website hosted on S3. IAM policy JSON you wrote yourself committed to GitHub."
  },
  schedule: [
    {
      time: "09:00–09:20",
      phase: "RECALL",
      activity: "Day 4.1 cold review",
      why: "Write a 10-line bash script from memory with a function, a loop, and error handling. If you can't, re-read Day 4.1 before starting IAM."
    },
    {
      time: "09:20–10:45",
      phase: "THEORY",
      activity: "IAM deep-dive: Users, Groups, Roles, Policies",
      why: "These are four different things. Most beginners confuse Roles and Users. Today you will understand the difference cold. Read actual AWS IAM JSON policies — not abstractions."
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
      activity: "Write IAM policies from JSON, attach to EC2 via role",
      why: "No AWS console for this. CLI only. Create a role, write a custom policy, attach it to your EC2. Verify the permissions work. Then deliberately exceed them and read the AccessDenied error."
    },
    {
      time: "12:30–13:15",
      phase: "BREAK",
      activity: "Lunch",
      why: ""
    },
    {
      time: "13:15–14:45",
      phase: "HANDS-ON",
      activity: "S3: buckets, versioning, lifecycle, static website",
      why: "Create a bucket, upload files, configure versioning, understand bucket policies vs IAM policies, and host a static website."
    },
    {
      time: "14:45–15:45",
      phase: "PROJECT",
      activity: "Mini Project: EC2 reads from S3 via IAM Role",
      why: "Your EC2 should pull files from S3 using an attached IAM role — no access keys stored on the server. This is the production-safe way to give EC2 access to AWS services."
    },
    {
      time: "15:45–16:00",
      phase: "BREAK",
      activity: "Break",
      why: ""
    },
    {
      time: "16:00–17:00",
      phase: "DOCUMENT",
      activity: "Day 5 notes + quiz + commit IAM policy JSON to repo",
      why: ""
    }
  ],
  concepts: [
    {
      icon: "👤",
      title: "IAM User vs Role",
      description: "User: a person. Has long-term access keys. Use for humans and CLI tools. Role: an identity assumed by a service (EC2, Lambda, etc.). No long-term keys — uses temporary credentials. Never put access keys on an EC2 server; attach a role.",
      analogy: "Interview: 'Why would you use a role instead of access keys on EC2?' This answer will come up in every AWS interview you ever have."
    },
    {
      icon: "📋",
      title: "IAM Policy = JSON Permission Document",
      description: "A policy is a JSON document that says: Effect (Allow/Deny), Action (what operation), Resource (what AWS resource the ARN). Attach policies to users, groups, or roles. Every AWS operation is controlled by a policy somewhere.",
      analogy: "Write policies yourself. Don't just use AWS managed policies — you won't understand what you're allowing."
    },
    {
      icon: "🔒",
      title: "Least Privilege Principle",
      description: "Grant only the permissions needed for the specific job — nothing more. An EC2 that only needs to read from one S3 bucket should have a policy that allows exactly s3:GetObject on exactly that bucket ARN. Not s3:* on *.",
      analogy: "The Head of DevOps tests this. In interviews: 'The principle of least privilege means...' then describe a concrete example from your lab work."
    },
    {
      icon: "🪣",
      title: "S3 Bucket vs IAM Policy",
      description: "IAM policy: attached to an identity (user/role). Controls what that identity can do to any resource. Bucket policy: attached to the S3 bucket. Controls who can access that bucket. Both can grant or deny. When both exist, most permissive wins — unless there's an explicit Deny.",
      analogy: "This confuses everyone. Draw a diagram. Two separate JSON documents. Two separate attachment points."
    },
    {
      icon: "📦",
      title: "S3 Versioning",
      description: "Versioning keeps every version of every object. Delete doesn't actually delete — it creates a 'delete marker'. This protects against accidental deletion and is the foundation of S3-based backup strategies.",
      analogy: "Enable versioning on any bucket that holds important data. Costs slightly more. Worth it every single time."
    },
    {
      icon: "🌐",
      title: "S3 Static Website Hosting",
      description: "S3 can serve HTML/CSS/JS files directly as a website. No server needed. No nginx. Objects are public via a bucket policy, and S3 gives you a URL like bucket.s3-website-region.amazonaws.com. Used for documentation, landing pages, single-page apps.",
      analogy: "This is real infrastructure skill — S3 static hosting is used in production by hundreds of thousands of companies."
    }
  ],
  commands: [
    {
      sessionNumber: 1,
      totalSessions: 2,
      sessionTitle: "IAM Role + Custom Policy for EC2",
      sections: [
        {
          label: "Step 1: Create a custom IAM policy (read-only S3 for one bucket)",
          lines: [
            { type: "cmd", prompt: "$", text: "BUCKET_NAME=\"devops-learning-$(date +%s)\"" },
            { type: "cmd", prompt: "$", text: "echo $BUCKET_NAME" },
            { type: "ok", text: "devops-learning-1748956801" },
            { type: "cmd", prompt: "$", text: "cat > /tmp/s3-read-policy.json << EOF\n{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Sid\": \"ReadMyBucketOnly\",\n      \"Effect\": \"Allow\",\n      \"Action\": [\n        \"s3:GetObject\",\n        \"s3:ListBucket\"\n      ],\n      \"Resource\": [\n        \"arn:aws:s3:::${BUCKET_NAME}\",\n        \"arn:aws:s3:::${BUCKET_NAME}/*\"\n      ]\n    }\n  ]\n}\nEOF" },
            { type: "comment", text: "This policy: Allow reading from ONE specific bucket. Nothing else." },
            { type: "cmd", prompt: "$", text: "aws iam create-policy \\\n  --policy-name DevOpsLearningS3ReadPolicy \\\n  --policy-document file:///tmp/s3-read-policy.json" },
            { type: "ok", text: "{\n  \"Policy\": {\n    \"PolicyName\": \"DevOpsLearningS3ReadPolicy\",\n    \"Arn\": \"arn:aws:iam::123456789:policy/DevOpsLearningS3ReadPolicy\",\n    ...\n  }\n}" },
            { type: "comment", text: "Save the Arn — you'll need it shortly" }
          ]
        },
        {
          label: "Step 2: Create an IAM Role that EC2 can assume",
          lines: [
            { type: "cmd", prompt: "$", text: "cat > /tmp/ec2-trust-policy.json << EOF\n{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Principal\": { \"Service\": \"ec2.amazonaws.com\" },\n    \"Action\": \"sts:AssumeRole\"\n  }]\n}\nEOF" },
            { type: "comment", text: "Trust policy: 'EC2 instances are allowed to assume this role'" },
            { type: "cmd", prompt: "$", text: "aws iam create-role \\\n  --role-name EC2-S3-ReadOnly-Role \\\n  --assume-role-policy-document file:///tmp/ec2-trust-policy.json" },
            { type: "cmd", prompt: "$", text: "aws iam attach-role-policy \\\n  --role-name EC2-S3-ReadOnly-Role \\\n  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/DevOpsLearningS3ReadPolicy" },
            { type: "cmd", prompt: "$", text: "aws iam create-instance-profile --instance-profile-name EC2-S3-ReadOnly-Profile" },
            { type: "cmd", prompt: "$", text: "aws iam add-role-to-instance-profile \\\n  --instance-profile-name EC2-S3-ReadOnly-Profile \\\n  --role-name EC2-S3-ReadOnly-Role" },
            { type: "cmd", prompt: "$", text: "aws ec2 associate-iam-instance-profile \\\n  --instance-id i-YOUR_INSTANCE_ID \\\n  --iam-instance-profile Name=EC2-S3-ReadOnly-Profile" }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      totalSessions: 2,
      sessionTitle: "S3 Buckets + Static Website",
      sections: [
        {
          label: "Create and Configure S3 Bucket",
          lines: [
            { type: "cmd", prompt: "$", text: "aws s3 mb s3://$BUCKET_NAME --region eu-west-1" },
            { type: "ok", text: "make_bucket: devops-learning-1748956801" },
            { type: "cmd", prompt: "$", text: "aws s3 ls" },
            { type: "cmd", prompt: "$", text: "echo \"Hello from S3\" > /tmp/test.txt" },
            { type: "cmd", prompt: "$", text: "aws s3 cp /tmp/test.txt s3://$BUCKET_NAME/" },
            { type: "ok", text: "upload: /tmp/test.txt to s3://devops-learning-1748956801/test.txt" },
            { type: "cmd", prompt: "$", text: "aws s3 ls s3://$BUCKET_NAME/" },
            { type: "output", text: "2026-06-05 14:30:00 16 test.txt" },
            { type: "cmd", prompt: "$", text: "aws s3 cp s3://$BUCKET_NAME/test.txt /tmp/downloaded.txt" },
            { type: "cmd", prompt: "$", text: "cat /tmp/downloaded.txt" },
            { type: "ok", text: "Hello from S3" }
          ]
        },
        {
          label: "Enable Versioning",
          lines: [
            { type: "cmd", prompt: "$", text: "aws s3api put-bucket-versioning \\\n  --bucket $BUCKET_NAME \\\n  --versioning-configuration Status=Enabled" },
            { type: "cmd", prompt: "$", text: "echo \"Updated content\" > /tmp/test.txt" },
            { type: "cmd", prompt: "$", text: "aws s3 cp /tmp/test.txt s3://$BUCKET_NAME/" },
            { type: "cmd", prompt: "$", text: "aws s3api list-object-versions --bucket $BUCKET_NAME" },
            { type: "comment", text: "Shows two versions of test.txt — original and updated" }
          ]
        },
        {
          label: "Static Website Hosting",
          lines: [
            { type: "cmd", prompt: "$", text: "SITE_BUCKET=\"devops-static-site-$(date +%s)\"" },
            { type: "cmd", prompt: "$", text: "aws s3 mb s3://$SITE_BUCKET --region eu-west-1" },
            { type: "cmd", prompt: "$", text: "aws s3 website s3://$SITE_BUCKET/ --index-document index.html" },
            { type: "cmd", prompt: "$", text: "cat > /tmp/index.html << EOF\n<html><body style=\"background:#050509;color:#40d4f0;font-family:monospace;padding:40px\">\n<h1>Week 1, Day 5 — Hosted on S3</h1>\n<p>No server. No nginx. Just S3 + a bucket policy.</p>\n</body></html>\nEOF" },
            { type: "cmd", prompt: "$", text: "aws s3 cp /tmp/index.html s3://$SITE_BUCKET/" },
            { type: "cmd", prompt: "$", text: "cat > /tmp/site-policy.json << EOF\n{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Sid\": \"PublicReadGetObject\",\n    \"Effect\": \"Allow\",\n    \"Principal\": \"*\",\n    \"Action\": \"s3:GetObject\",\n    \"Resource\": \"arn:aws:s3:::${SITE_BUCKET}/*\"\n  }]\n}\nEOF" },
            { type: "cmd", prompt: "$", text: "aws s3api put-public-access-block \\\n  --bucket $SITE_BUCKET \\\n  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" },
            { type: "cmd", prompt: "$", text: "aws s3api put-bucket-policy --bucket $SITE_BUCKET --policy file:///tmp/site-policy.json" },
            { type: "ok", text: "Access in browser: http://SITE_BUCKET.s3-website-eu-west-1.amazonaws.com" }
          ]
        }
      ]
    }
  ],
  debugTrees: [
    {
      title: "⚡ AccessDenied — The Most Common Day 5 Error",
      steps: [
        {
          num: 1,
          title: "Read the full error message — it tells you exactly what was denied",
          description: "AWS error messages include: the Action that was denied, the Resource ARN it was on, and the identity that was trying. Every piece is diagnostic."
        },
        {
          num: 2,
          title: "Check which identity is making the call",
          description: "Are you calling as the IAM user you think? Or as the EC2 role? This tells you which policy to look at.",
          cmd: "aws sts get-caller-identity"
        },
        {
          num: 3,
          title: "Check the specific policy attached to that identity",
          cmd: "aws iam list-attached-user-policies --user-name YOUR_USER"
        },
        {
          num: 4,
          title: "Use IAM Policy Simulator",
          description: "AWS console → IAM → Policy Simulator. Lets you test 'would this identity be allowed to do X on resource Y?' without actually doing it."
        }
      ]
    }
  ],
  mistakes: [
    {
      mistake: "Using \"Resource\": \"*\" in every policy",
      description: "Wildcard resource on s3:PutObject means your EC2 can write to ANY bucket in your account — including backups and other projects. This is not least privilege.",
      fix: "Fix: Always specify the exact bucket ARN: \"arn:aws:s3:::EXACT-BUCKET-NAME/*\""
    },
    {
      mistake: "Storing AWS access keys inside an EC2 instance with ~/.aws/credentials",
      description: "If your EC2 is ever compromised, those long-term keys are exfiltrated and used immediately. Keys on EC2 are a serious security incident waiting to happen.",
      fix: "Fix: Attach an IAM Role to EC2. The AWS SDK and CLI automatically use temporary role credentials from the EC2 metadata service — no key file needed."
    },
    {
      mistake: "Not understanding S3 global name uniqueness",
      description: "S3 bucket names are globally unique across all AWS accounts in all regions. \"mybucket\" is almost certainly taken. This causes confusing creation errors.",
      fix: "Fix: Add a timestamp, account ID, or random suffix: my-devops-bucket-$(date +%s)"
    },
    {
      mistake: "Confusing a bucket policy with an IAM policy",
      description: "They are separate JSON documents attached to different things. An IAM policy on a user controls what that user can do. A bucket policy on an S3 bucket controls who can access that bucket. Both must allow the action for cross-account access to work.",
      fix: "Fix: Draw it. IAM policy = attached to identity. Bucket policy = attached to resource. Both are evaluated on every S3 request."
    }
  ],
  project: {
    tag: "📁 Day 5 Mini Project",
    title: "IAM Role → EC2 Reads Config From S3 — No Keys on Server",
    timeEstimate: "⏱ ~70 min",
    goal: "Create an S3 bucket that holds a configuration file. Give your EC2 an IAM role that allows reading only that bucket. SSH into EC2 and pull the config file using aws s3 cp — no access keys on the server. Verify that trying to write to S3 is denied. This is the production pattern used by virtually every cloud-native application.",
    checklist: [
      "Create an S3 bucket: devops-config-YOURNAME",
      "Upload a file: app.conf containing some key=value config",
      "Create IAM policy: allow s3:GetObject and s3:ListBucket on that bucket only",
      "Create IAM Role with EC2 trust relationship, attach the policy",
      "Attach the role to your running EC2 instance",
      "SSH into EC2 — run aws s3 cp s3://devops-config-YOURNAME/app.conf /tmp/ — it must work WITHOUT any credentials configured",
      "Try to upload a file: aws s3 cp /tmp/test.txt s3://devops-config-YOURNAME/ — it must fail with AccessDenied (your policy doesn't allow writes)",
      "Commit the policy JSON file to GitHub under /iam-policies/ec2-s3-readonly.json"
    ],
    expectedOutput: "# From EC2 (no keys configured):\n$ aws s3 cp s3://devops-config-YOURNAME/app.conf /tmp/\ndownload: s3://devops-config.../app.conf to /tmp/app.conf ← success\n\n$ aws s3 cp /tmp/test.txt s3://devops-config-YOURNAME/\nAn error occurred (AccessDenied)... ← correct! Your policy works."
  },
  interview: [
    {
      question: "What is the difference between an IAM User, a Group, and a Role?",
      answer: "A User is an identity for a specific person or application that needs long-term credentials — access key ID and secret. A Group is a collection of users — you attach policies to the group and all users in it inherit those permissions, which makes permission management scalable. A Role is fundamentally different: it has no password or access key. Instead, it can be assumed by a trusted entity — like an EC2 instance, a Lambda function, or a user from another account. When EC2 assumes a role, it gets temporary credentials that rotate automatically every few hours. This is why you should never put static access keys on an EC2 — roles are more secure because the credentials are short-lived and automatically managed by AWS."
    },
    {
      question: "Explain the principle of least privilege. Give me a real example from work you've done.",
      answer: "Least privilege means granting only the exact permissions required to do a specific job and nothing more. In practice this week: I created an EC2 instance that needs to read configuration files from one S3 bucket. I wrote an IAM policy that allows only s3:GetObject and s3:ListBucket on exactly that bucket's ARN. It cannot write, delete, or access any other bucket. I verified this by attempting to upload a file from the EC2 — it was correctly denied with AccessDenied. The reason this matters: if that EC2 were ever compromised, the attacker can only read that config bucket. They can't write malicious files to S3, can't spin up EC2 instances, can't touch IAM. The blast radius is minimised."
    }
  ],
  quiz: [
    {
      num: 1,
      question: "Why should you never store AWS access keys in ~/.aws/credentials on an EC2 instance?",
      options: [
        { text: "A) EC2 can't read that directory", isCorrect: false },
        { text: "B) If the instance is compromised, those long-term keys are stolen and can be used indefinitely", isCorrect: true },
        { text: "C) Access keys don't work on Ubuntu", isCorrect: false },
        { text: "D) It only matters for production instances", isCorrect: false }
      ],
      explanation: "IAM roles give EC2 temporary credentials that auto-rotate via the metadata service. Static keys in a file are permanent until manually rotated. A compromised instance with static keys is a far worse security event than one using a role with temporary credentials."
    },
    {
      num: 2,
      question: "What is the \"Principal\" field in an IAM trust policy?",
      options: [
        { text: "A) The action being allowed", isCorrect: false },
        { text: "B) Who (which entity) is allowed to assume the role", isCorrect: true },
        { text: "C) The resource the policy applies to", isCorrect: false },
        { text: "D) The owner of the policy", isCorrect: false }
      ],
      explanation: "A trust policy on a role defines who can assume it. Principal: \"Service\": \"ec2.amazonaws.com\" means EC2 instances can assume this role. Principal: \"AWS\": \"arn:aws:iam::123:user/bob\" means only that specific IAM user can assume it. Without a correct Principal, nobody can use the role."
    },
    {
      num: 3,
      question: "Your S3 bucket website returns 403. You have a bucket policy allowing s3:GetObject. What is missing?",
      options: [
        { text: "A) The bucket name is wrong", isCorrect: false },
        { text: "B) Block Public Access is still enabled on the bucket, overriding the policy", isCorrect: true },
        { text: "C) You need to enable HTTPS", isCorrect: false },
        { text: "D) S3 websites require Route53", isCorrect: false }
      ],
      explanation: "AWS S3 has a setting called Block Public Access that overrides bucket policies. New buckets have it on by default. You must explicitly disable it before a public bucket policy takes effect. This trips everyone on their first static site deployment."
    },
    {
      num: 4,
      question: "What does S3 versioning do when you delete an object?",
      options: [
        { text: "A) Permanently deletes all versions immediately", isCorrect: false },
        { text: "B) Creates a delete marker — object appears deleted but all versions are still recoverable", isCorrect: true },
        { text: "C) Moves it to a trash folder", isCorrect: false },
        { text: "D) Disables versioning on that object", isCorrect: false }
      ],
      explanation: "A delete marker is a zero-byte placeholder. The object appears deleted to normal operations but all previous versions remain. You recover by deleting the delete marker. To truly permanently delete with versioning on, you must delete each version ID explicitly."
    },
    {
      num: 5,
      question: "You need your Lambda to read from DynamoDB. What is the correct approach?",
      options: [
        { text: "A) Hardcode access keys in the Lambda environment variables", isCorrect: false },
        { text: "B) Use your personal IAM user's keys", isCorrect: false },
        { text: "C) Create an IAM Role with a DynamoDB read policy, attach it as the Lambda execution role", isCorrect: true },
        { text: "D) Give Lambda full admin access so it definitely has permission", isCorrect: false }
      ],
      explanation: "Lambda execution roles are the same pattern as EC2 instance profiles — temporary credentials, no stored keys, specific permissions. This is the AWS-recommended approach for all service-to-service interactions. Hardcoded keys in Lambda are a security and operational failure."
    }
  ],
  github: {
    filename: "devops-90days/day-05/README.md",
    commitMessage: "docs: Add Day 05 — IAM roles, least privilege, S3 versioning and static hosting",
    template: `# Day 05 — IAM Deep-Dive + S3
**Date:** YYYY-MM-DD | **Difficulty:** Hard | **Status:** ✅ Complete

---

## 🎯 What I Built Today
- Custom IAM policy (least privilege, not AdministratorAccess)
- IAM Role with EC2 trust relationship
- EC2 reading S3 config via role — no credentials file on server
- S3 bucket with versioning enabled
- Static website hosted on S3 with bucket policy

## 🔑 IAM Policy Anatomy

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "HumanReadableID",          // optional label
    "Effect": "Allow",                  // Allow or Deny
    "Action": ["s3:GetObject"],         // what operation
    "Resource": "arn:aws:s3:::BUCKET/*" // on which resource (specific ARN, not *)
  }]
}
\`\`\`

## ⌨️ Key Commands

\`\`\`bash
aws iam create-policy --policy-name NAME --policy-document file://policy.json
aws iam create-role --role-name NAME --assume-role-policy-document file://trust.json
aws iam attach-role-policy --role-name NAME --policy-arn ARN
aws iam create-instance-profile --instance-profile-name NAME
aws iam add-role-to-instance-profile --instance-profile-name NAME --role-name NAME
aws ec2 associate-iam-instance-profile --instance-id ID --iam-instance-profile Name=NAME

aws s3 mb s3://bucket-name --region eu-west-1
aws s3 cp file.txt s3://bucket-name/
aws s3api put-bucket-versioning --bucket NAME --versioning-configuration Status=Enabled
aws s3 website s3://bucket/ --index-document index.html
aws sts get-caller-identity   # always verify who you're authenticated as
\`\`\`

## 💡 Key Mental Models
- IAM User = person. Has permanent keys. For humans/CLI.
- IAM Role = identity for a service. Temporary keys. For EC2/Lambda/etc.
- IAM Policy = JSON document granting/denying actions on resources.
- Trust policy = "who can wear this role's hat"
- Least privilege = only the exact actions on the exact resources needed. Nothing else.
- Bucket policy ≠ IAM policy. Same JSON structure, different attachment point.

## 📈 Tomorrow — Day 6
VPC: subnets, route tables, internet gateways, NAT gateways. Building a proper 2-tier VPC from scratch via CLI.`
  }
};
