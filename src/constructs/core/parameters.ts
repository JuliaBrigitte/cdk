import type { CfnParameterProps } from "@aws-cdk/core";
import { CfnParameter } from "@aws-cdk/core";
import { Stage, Stages } from "../../constants";
import type { GuStack } from "./stack";

export type GuParameterProps = CfnParameterProps;

export type GuNoTypeParameterProps = Omit<GuParameterProps, "type">;

export class GuParameter extends CfnParameter {
  constructor(scope: GuStack, id: string, props: GuParameterProps) {
    super(scope, id, props);
  }
}

export class GuStringParameter extends GuParameter {
  constructor(scope: GuStack, id: string, props: GuNoTypeParameterProps) {
    super(scope, id, { ...props, type: "String" });
  }
}

export class GuStageParameter extends GuParameter {
  constructor(scope: GuStack) {
    super(scope, "Stage", {
      type: "String",
      description: "Stage name",
      allowedValues: Stages,
      default: Stage.CODE,
    });
  }
}

export class GuStackParameter extends GuParameter {
  constructor(scope: GuStack) {
    super(scope, "Stack", {
      type: "String",
      description: "Name of this stack",
      default: "deploy",
    });
  }
}

export class GuInstanceTypeParameter extends GuParameter {
  constructor(scope: GuStack, id: string = "InstanceType", props: GuParameterProps = {}) {
    super(scope, id, {
      type: "String",
      description: "EC2 Instance Type",
      default: "t3.small",
      ...props,
    });
  }
}

export class GuSSMParameter extends GuParameter {
  constructor(scope: GuStack, id: string, props: GuNoTypeParameterProps) {
    super(scope, id, {
      noEcho: true,
      ...props,
      type: "AWS::SSM::Parameter::Value<String>",
    });
  }
}

export class GuSubnetListParameter extends GuParameter {
  constructor(scope: GuStack, id: string, props: GuNoTypeParameterProps) {
    super(scope, id, { ...props, type: "List<AWS::EC2::Subnet::Id>" });
  }
}

export class GuVpcParameter extends GuParameter {
  constructor(scope: GuStack, id: string, props: GuNoTypeParameterProps) {
    super(scope, id, {
      ...props,
      type: "AWS::EC2::VPC::Id",
    });
  }
}

export class GuAmiParameter extends GuParameter {
  constructor(scope: GuStack, id: string, props: GuNoTypeParameterProps) {
    super(scope, id, {
      ...props,
      type: "AWS::EC2::Image::Id",
    });
  }
}

export const arnRegex = "arn:aws:[a-z0-9]*:[a-z0-9\\-]*:[0-9]{12}:.*";

export class GuArnParameter extends GuStringParameter {
  constructor(scope: GuStack, id: string, props: GuNoTypeParameterProps) {
    super(scope, id, {
      ...props,
      allowedPattern: arnRegex,
      constraintDescription: "Must be a valid ARN, eg: arn:partition:service:region:account-id:resource-id",
    });
  }
}

const s3BucketRegex = "(?!^(\\d{1,3}\\.){3}\\d{1,3}$)(^[a-z0-9]([a-z0-9-]*(\\.[a-z0-9])?)*$(?<!\\-))";
export const s3ArnRegex = `arn:aws:s3:::${s3BucketRegex}*`;

export class GuS3ObjectArnParameter extends GuStringParameter {
  constructor(scope: GuStack, id: string, props: GuNoTypeParameterProps) {
    super(scope, id, {
      ...props,
      allowedPattern: s3ArnRegex,
      constraintDescription:
        "Must be a valid S3 ARN, see https://docs.aws.amazon.com/AmazonS3/latest/dev/BucketRestrictions.html",
    });
  }
}
