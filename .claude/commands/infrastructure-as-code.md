---
name: infrastructure-as-code
description:
  Terraform and Pulumi template generator with state management and multi-cloud
  support. Use when provisioning cloud infrastructure, managing IaC, setting up
  Terraform, or deploying to AWS/Azure/GCP.
triggers:
  - 'infrastructure'
  - 'Terraform'
  - 'IaC'
  - 'cloud provisioning'
  - 'AWS'
  - 'GCP'
---

# Infrastructure as Code

Generate and manage cloud infrastructure with Terraform and Pulumi templates.

## Capabilities

- **Multi-Cloud**: AWS, Azure, GCP templates
- **State Management**: Remote state with locking
- **Modules**: Reusable components
- **Drift Detection**: Identify changes
- **Cost Estimation**: Preview costs

## Usage

```markdown
@skill infrastructure-as-code

Generate Terraform for:

- Provider: AWS
- Resources: VPC, ECS, RDS
- Environment: Production
- Region: us-east-1
```

## Terraform Template

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "my-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

module "vpc" {
  source = "./modules/vpc"

  name = "${var.project}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
}
```

## Pulumi Template

```typescript
// index.ts
import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

const vpc = new aws.ec2.Vpc('main', {
  cidrBlock: '10.0.0.0/16',
  tags: {
    Name: 'production-vpc',
  },
})

const subnet = new aws.ec2.Subnet('public', {
  vpcId: vpc.id,
  cidrBlock: '10.0.1.0/24',
  availabilityZone: 'us-east-1a',
})

export const vpcId = vpc.id
export const subnetId = subnet.id
```

## Modules

- **VPC**: Network infrastructure
- **ECS**: Container orchestration
- **RDS**: Managed databases
- **Lambda**: Serverless functions
- **S3**: Object storage
- **CloudFront**: CDN

## Best Practices

1. **Remote State**: Use S3 + DynamoDB
2. **Workspaces**: Per-environment isolation
3. **Modules**: DRY infrastructure
4. **Variables**: Externalize configuration
5. **Outputs**: Share resource IDs

## Security

- **State Encryption**: AES-256
- **IAM Roles**: Least privilege
- **Secrets**: AWS Secrets Manager
- **Audit**: CloudTrail logging
