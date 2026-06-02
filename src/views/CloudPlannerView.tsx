import React, { useState, useMemo } from 'react';

interface CloudResource {
  id: string;
  name: string;
  icon: string;
  category: 'compute' | 'database' | 'storage' | 'network';
  description: string;
  options: ResourceOption[];
}

interface ResourceOption {
  label: string;
  value: string;
  monthlyPrice: number;
  specs: string;
}

interface SelectedResource {
  resourceId: string;
  optionValue: string;
  quantity: number;
}

const CLOUD_RESOURCES: CloudResource[] = [
  {
    id: 'ec2',
    name: 'EC2 Instance',
    icon: '💻',
    category: 'compute',
    description: 'Virtual servers for running applications',
    options: [
      { label: 't3.micro', value: 't3.micro', monthlyPrice: 7.59, specs: '2 vCPU, 1 GiB RAM' },
      { label: 't3.small', value: 't3.small', monthlyPrice: 15.18, specs: '2 vCPU, 2 GiB RAM' },
      { label: 't3.medium', value: 't3.medium', monthlyPrice: 30.37, specs: '2 vCPU, 4 GiB RAM' },
      { label: 't3.large', value: 't3.large', monthlyPrice: 60.74, specs: '2 vCPU, 8 GiB RAM' },
      { label: 'm5.large', value: 'm5.large', monthlyPrice: 69.12, specs: '2 vCPU, 8 GiB RAM (compute)' },
      { label: 'm5.xlarge', value: 'm5.xlarge', monthlyPrice: 138.24, specs: '4 vCPU, 16 GiB RAM' },
      { label: 'c5.2xlarge', value: 'c5.2xlarge', monthlyPrice: 244.80, specs: '8 vCPU, 16 GiB RAM (CPU opt)' }
    ]
  },
  {
    id: 'rds',
    name: 'RDS Database',
    icon: '🗄️',
    category: 'database',
    description: 'Managed relational databases (PostgreSQL, MySQL)',
    options: [
      { label: 'db.t3.micro', value: 'db.t3.micro', monthlyPrice: 12.41, specs: '2 vCPU, 1 GiB RAM, 20GB' },
      { label: 'db.t3.small', value: 'db.t3.small', monthlyPrice: 24.82, specs: '2 vCPU, 2 GiB RAM, 20GB' },
      { label: 'db.t3.medium', value: 'db.t3.medium', monthlyPrice: 49.64, specs: '2 vCPU, 4 GiB RAM, 50GB' },
      { label: 'db.r5.large', value: 'db.r5.large', monthlyPrice: 172.80, specs: '2 vCPU, 16 GiB RAM, 100GB' },
      { label: 'db.r5.xlarge', value: 'db.r5.xlarge', monthlyPrice: 345.60, specs: '4 vCPU, 32 GiB RAM, 200GB' }
    ]
  },
  {
    id: 's3',
    name: 'S3 Bucket',
    icon: '🪣',
    category: 'storage',
    description: 'Object storage for static assets, backups, logs',
    options: [
      { label: 'Standard 50GB', value: 's3-50', monthlyPrice: 1.15, specs: '50 GB Standard tier' },
      { label: 'Standard 250GB', value: 's3-250', monthlyPrice: 5.75, specs: '250 GB Standard tier' },
      { label: 'Standard 1TB', value: 's3-1tb', monthlyPrice: 23.00, specs: '1 TB Standard tier' },
      { label: 'Glacier 1TB', value: 's3-glacier-1tb', monthlyPrice: 4.00, specs: '1 TB Glacier (archive)' }
    ]
  },
  {
    id: 'vpc',
    name: 'VPC + NAT Gateway',
    icon: '🌐',
    category: 'network',
    description: 'Virtual private network with NAT for private subnets',
    options: [
      { label: 'VPC Only', value: 'vpc-only', monthlyPrice: 0, specs: 'VPC with subnets (free)' },
      { label: 'VPC + NAT', value: 'vpc-nat', monthlyPrice: 32.40, specs: 'VPC + 1 NAT Gateway' },
      { label: 'VPC + 2 NAT (HA)', value: 'vpc-nat-ha', monthlyPrice: 64.80, specs: 'VPC + 2 NAT Gateways (HA)' }
    ]
  },
  {
    id: 'elb',
    name: 'Load Balancer (ALB)',
    icon: '⚖️',
    category: 'network',
    description: 'Application load balancer for distributing traffic',
    options: [
      { label: 'ALB Basic', value: 'alb-basic', monthlyPrice: 16.20, specs: 'Application LB, up to 25 LCU' },
      { label: 'ALB High Traffic', value: 'alb-high', monthlyPrice: 32.40, specs: 'Application LB, up to 100 LCU' },
      { label: 'NLB (Network)', value: 'nlb', monthlyPrice: 16.20, specs: 'Network LB, TCP/UDP' }
    ]
  },
  {
    id: 'elasticache',
    name: 'ElastiCache (Redis)',
    icon: '⚡',
    category: 'database',
    description: 'Managed Redis for caching and session storage',
    options: [
      { label: 'cache.t3.micro', value: 'cache.t3.micro', monthlyPrice: 12.24, specs: '2 vCPU, 0.5 GiB' },
      { label: 'cache.t3.small', value: 'cache.t3.small', monthlyPrice: 24.48, specs: '2 vCPU, 1.37 GiB' },
      { label: 'cache.r5.large', value: 'cache.r5.large', monthlyPrice: 131.40, specs: '2 vCPU, 13.07 GiB' }
    ]
  },
  {
    id: 'cloudfront',
    name: 'CloudFront CDN',
    icon: '🚀',
    category: 'network',
    description: 'Content delivery network for global distribution',
    options: [
      { label: '100 GB/mo', value: 'cf-100', monthlyPrice: 8.50, specs: '100 GB transfer out' },
      { label: '1 TB/mo', value: 'cf-1tb', monthlyPrice: 85.00, specs: '1 TB transfer out' },
      { label: '10 TB/mo', value: 'cf-10tb', monthlyPrice: 800.00, specs: '10 TB transfer out' }
    ]
  },
  {
    id: 'ecs',
    name: 'ECS Fargate',
    icon: '🐳',
    category: 'compute',
    description: 'Serverless container orchestration',
    options: [
      { label: '0.25 vCPU, 0.5GB', value: 'ecs-micro', monthlyPrice: 9.34, specs: '0.25 vCPU, 0.5 GiB (per task)' },
      { label: '0.5 vCPU, 1GB', value: 'ecs-small', monthlyPrice: 18.67, specs: '0.5 vCPU, 1 GiB (per task)' },
      { label: '1 vCPU, 2GB', value: 'ecs-medium', monthlyPrice: 37.34, specs: '1 vCPU, 2 GiB (per task)' },
      { label: '2 vCPU, 4GB', value: 'ecs-large', monthlyPrice: 74.69, specs: '2 vCPU, 4 GiB (per task)' }
    ]
  }
];

const CATEGORY_COLORS: Record<string, string> = {
  compute: '#4fa8ff',
  database: '#c084fc',
  storage: '#ffc850',
  network: '#00d9a0'
};

const CATEGORY_LABELS: Record<string, string> = {
  compute: '💻 Compute',
  database: '🗄️ Database',
  storage: '🪣 Storage',
  network: '🌐 Network'
};

function generateTerraform(selected: SelectedResource[]): string {
  const blocks: string[] = [];

  blocks.push(`terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}`);

  selected.forEach(sel => {
    const resource = CLOUD_RESOURCES.find(r => r.id === sel.resourceId);
    if (!resource) return;
    const option = resource.options.find(o => o.value === sel.optionValue);
    if (!option) return;

    for (let i = 0; i < sel.quantity; i++) {
      const suffix = sel.quantity > 1 ? `_${i + 1}` : '';

      switch (resource.id) {
        case 'ec2':
          blocks.push(`\nresource "aws_instance" "app_server${suffix}" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2023
  instance_type = "${option.value}"

  tags = {
    Name = "devops-app-server${suffix}"
  }
}`);
          break;
        case 'rds':
          blocks.push(`\nresource "aws_db_instance" "database${suffix}" {
  identifier     = "devops-db${suffix}"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "${option.value}"
  allocated_storage = 20
  
  db_name  = "devops_app"
  username = "dbadmin"
  password = var.db_password

  skip_final_snapshot = true

  tags = {
    Name = "devops-database${suffix}"
  }
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}`);
          break;
        case 's3':
          blocks.push(`\nresource "aws_s3_bucket" "storage${suffix}" {
  bucket = "devops-storage-\${random_id.suffix.hex}${suffix}"

  tags = {
    Name = "devops-storage${suffix}"
  }
}

resource "aws_s3_bucket_versioning" "storage_versioning${suffix}" {
  bucket = aws_s3_bucket.storage${suffix}.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}`);
          break;
        case 'vpc':
          blocks.push(`\nresource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "devops-vpc"
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = { Name = "devops-public-a" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "us-east-1a"

  tags = { Name = "devops-private-a" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "devops-igw" }
}${option.value.includes('nat') ? `

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id
  tags          = { Name = "devops-nat" }
}

resource "aws_eip" "nat" {
  domain = "vpc"
}` : ''}`);
          break;
        case 'elb':
          blocks.push(`\nresource "aws_lb" "app_lb${suffix}" {
  name               = "devops-alb${suffix}"
  internal           = false
  load_balancer_type = "${option.value.startsWith('nlb') ? 'network' : 'application'}"
  subnets            = [aws_subnet.public_a.id]

  tags = {
    Name = "devops-alb${suffix}"
  }
}`);
          break;
        case 'elasticache':
          blocks.push(`\nresource "aws_elasticache_cluster" "redis${suffix}" {
  cluster_id           = "devops-redis${suffix}"
  engine               = "redis"
  node_type            = "${option.value}"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  tags = {
    Name = "devops-redis${suffix}"
  }
}`);
          break;
        case 'cloudfront':
          blocks.push(`\nresource "aws_cloudfront_distribution" "cdn${suffix}" {
  enabled = true
  comment = "DevOps CDN${suffix}"

  origin {
    domain_name = aws_lb.app_lb.dns_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}`);
          break;
        case 'ecs':
          blocks.push(`\nresource "aws_ecs_cluster" "main" {
  name = "devops-cluster"
}

resource "aws_ecs_task_definition" "app${suffix}" {
  family                   = "devops-app${suffix}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "${option.specs.split(' ')[0]}"
  memory                   = "${option.specs.split(' ')[2]}"

  container_definitions = jsonencode([{
    name  = "app"
    image = "nginx:latest"
    portMappings = [{
      containerPort = 80
      hostPort      = 80
    }]
  }])
}

resource "aws_ecs_service" "app${suffix}" {
  name            = "devops-service${suffix}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app${suffix}.arn
  desired_count   = ${sel.quantity}
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_a.id]
    security_groups = []
  }
}`);
          break;
      }
    }
  });

  return blocks.join('\n');
}

interface Props {
  appState: ReturnType<typeof import('../hooks/useAppState').useAppState>;
}

export const CloudPlannerView: React.FC<Props> = () => {
  const [selected, setSelected] = useState<SelectedResource[]>([]);
  const [showTerraform, setShowTerraform] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const totalMonthly = useMemo(() => {
    return selected.reduce((sum, sel) => {
      const resource = CLOUD_RESOURCES.find(r => r.id === sel.resourceId);
      const option = resource?.options.find(o => o.value === sel.optionValue);
      return sum + (option?.monthlyPrice || 0) * sel.quantity;
    }, 0);
  }, [selected]);

  const totalYearly = totalMonthly * 12;
  const terraformCode = useMemo(() => generateTerraform(selected), [selected]);

  const addResource = (resourceId: string) => {
    const resource = CLOUD_RESOURCES.find(r => r.id === resourceId);
    if (!resource) return;
    setSelected(prev => [...prev, {
      resourceId,
      optionValue: resource.options[0].value,
      quantity: 1
    }]);
  };

  const removeResource = (index: number) => {
    setSelected(prev => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, optionValue: string) => {
    setSelected(prev => prev.map((s, i) => i === index ? { ...s, optionValue } : s));
  };

  const updateQuantity = (index: number, quantity: number) => {
    setSelected(prev => prev.map((s, i) => i === index ? { ...s, quantity: Math.max(1, Math.min(20, quantity)) } : s));
  };

  const copyTerraform = async () => {
    try {
      await navigator.clipboard.writeText(terraformCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = terraformCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categories = ['compute', 'database', 'storage', 'network'];
  const filteredResources = filterCat
    ? CLOUD_RESOURCES.filter(r => r.category === filterCat)
    : CLOUD_RESOURCES;

  return (
    <div className="wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(135deg, #ffc850, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ☁️ Cloud Resource Cost Estimator
        </h1>
        <p style={{ color: 'var(--sub)', fontSize: '13px', maxWidth: '520px', margin: '0 auto' }}>
          Design your AWS infrastructure, estimate monthly costs, and generate production-ready Terraform code.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
        {/* Left: Resource picker */}
        <div>
          {/* Category filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterCat(null)}
              style={{
                background: !filterCat ? 'rgba(0,217,160,.12)' : 'var(--s2)',
                border: `1px solid ${!filterCat ? 'rgba(0,217,160,.4)' : 'var(--border)'}`,
                color: !filterCat ? 'var(--green)' : 'var(--sub)',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '11px',
                fontFamily: 'var(--mono)',
                cursor: 'pointer'
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat === filterCat ? null : cat)}
                style={{
                  background: filterCat === cat ? `${CATEGORY_COLORS[cat]}15` : 'var(--s2)',
                  border: `1px solid ${filterCat === cat ? `${CATEGORY_COLORS[cat]}60` : 'var(--border)'}`,
                  color: filterCat === cat ? CATEGORY_COLORS[cat] : 'var(--sub)',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontFamily: 'var(--mono)',
                  cursor: 'pointer'
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Resource grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {filteredResources.map(res => {
              const isAdded = selected.some(s => s.resourceId === res.id);
              return (
                <div
                  key={res.id}
                  onClick={() => addResource(res.id)}
                  style={{
                    background: 'var(--s1)',
                    border: `1px solid ${isAdded ? CATEGORY_COLORS[res.category] + '40' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all .2s ease'
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = CATEGORY_COLORS[res.category];
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = isAdded ? CATEGORY_COLORS[res.category] + '40' : 'var(--border)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '22px' }}>{res.icon}</span>
                    <span style={{
                      fontSize: '9px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: CATEGORY_COLORS[res.category] + '15',
                      color: CATEGORY_COLORS[res.category],
                      fontFamily: 'var(--mono)',
                      textTransform: 'uppercase'
                    }}>
                      {res.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                    {res.name}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--sub)', lineHeight: '1.4' }}>
                    {res.description}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '8px', fontFamily: 'var(--mono)' }}>
                    From ${res.options[0].monthlyPrice.toFixed(2)}/mo
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cost panel */}
        <div style={{ position: 'sticky', top: '80px' }}>
          {/* Summary card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--s1), var(--s2))',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Estimated Monthly Cost
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: 800,
              fontFamily: 'var(--mono)',
              color: totalMonthly === 0 ? 'var(--muted)' : totalMonthly > 500 ? '#f97316' : 'var(--green)',
              marginBottom: '4px'
            }}>
              ${totalMonthly.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sub)' }}>
              ~${totalYearly.toFixed(0)}/year • {selected.length} resource{selected.length !== 1 ? 's' : ''}
            </div>

            {/* Cost breakdown meter */}
            {selected.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', height: '8px' }}>
                  {categories.map(cat => {
                    const catCost = selected.reduce((sum, sel) => {
                      const res = CLOUD_RESOURCES.find(r => r.id === sel.resourceId);
                      if (res?.category !== cat) return sum;
                      const opt = res?.options.find(o => o.value === sel.optionValue);
                      return sum + (opt?.monthlyPrice || 0) * sel.quantity;
                    }, 0);
                    const pct = totalMonthly > 0 ? (catCost / totalMonthly) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={cat}
                        style={{
                          width: `${pct}%`,
                          background: CATEGORY_COLORS[cat],
                          transition: 'width .3s ease'
                        }}
                        title={`${CATEGORY_LABELS[cat]}: $${catCost.toFixed(2)}`}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {categories.map(cat => {
                    const catCost = selected.reduce((sum, sel) => {
                      const res = CLOUD_RESOURCES.find(r => r.id === sel.resourceId);
                      if (res?.category !== cat) return sum;
                      const opt = res?.options.find(o => o.value === sel.optionValue);
                      return sum + (opt?.monthlyPrice || 0) * sel.quantity;
                    }, 0);
                    if (catCost === 0) return null;
                    return (
                      <div key={cat} style={{ fontSize: '9px', color: CATEGORY_COLORS[cat], fontFamily: 'var(--mono)' }}>
                        ● {cat}: ${catCost.toFixed(0)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected resources list */}
          <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {selected.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: '12px' }}>
                Click resources on the left to add them to your stack.
              </div>
            )}
            {selected.map((sel, idx) => {
              const resource = CLOUD_RESOURCES.find(r => r.id === sel.resourceId)!;
              const option = resource.options.find(o => o.value === sel.optionValue)!;
              return (
                <div key={idx} style={{
                  background: 'var(--s1)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                      {resource.icon} {resource.name}
                    </span>
                    <button
                      onClick={() => removeResource(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--red, #ff5f5f)', cursor: 'pointer', fontSize: '14px', padding: '0' }}
                    >
                      ✕
                    </button>
                  </div>
                  <select
                    value={sel.optionValue}
                    onChange={e => updateOption(idx, e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--s2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: 'var(--mono)',
                      marginBottom: '6px',
                      outline: 'none'
                    }}
                  >
                    {resource.options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — ${opt.monthlyPrice}/mo ({opt.specs})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => updateQuantity(idx, sel.quantity - 1)}
                        style={{
                          background: 'var(--s2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >−</button>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--text)', minWidth: '16px', textAlign: 'center' }}>
                        {sel.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, sel.quantity + 1)}
                        style={{
                          background: 'var(--s2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >+</button>
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 600 }}>
                      ${(option.monthlyPrice * sel.quantity).toFixed(2)}/mo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terraform button */}
          {selected.length > 0 && (
            <button
              onClick={() => setShowTerraform(!showTerraform)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(192,132,252,.12), rgba(79,168,255,.12))',
                border: '1px solid rgba(192,132,252,.4)',
                color: '#c084fc',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '12px',
                fontFamily: 'var(--mono)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all .2s ease'
              }}
            >
              {showTerraform ? '📋 Hide Terraform' : '⚡ Generate Terraform'}
            </button>
          )}
        </div>
      </div>

      {/* Terraform output panel */}
      {showTerraform && selected.length > 0 && (
        <div style={{
          marginTop: '24px',
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            background: 'rgba(255,255,255,.04)',
            borderBottom: '1px solid rgba(255,255,255,.06)'
          }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', fontFamily: 'var(--mono)' }}>
              main.tf
            </span>
            <button
              onClick={copyTerraform}
              style={{
                background: copied ? 'rgba(0,217,160,.15)' : 'rgba(255,255,255,.06)',
                border: `1px solid ${copied ? 'rgba(0,217,160,.4)' : 'rgba(255,255,255,.1)'}`,
                color: copied ? '#00d9a0' : 'rgba(255,255,255,.6)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'var(--mono)',
                cursor: 'pointer'
              }}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <pre style={{
            padding: '16px',
            margin: 0,
            color: '#c9d1d9',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            lineHeight: '1.6',
            overflowX: 'auto',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            {terraformCode}
          </pre>
        </div>
      )}

      {/* Responsive override for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .wrap > div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
