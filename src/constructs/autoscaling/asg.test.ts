import "@aws-cdk/assert/jest";
import { SynthUtils } from "@aws-cdk/assert/lib/synth-utils";
import { Vpc } from "@aws-cdk/aws-ec2";
import { ApplicationProtocol } from "@aws-cdk/aws-elasticloadbalancingv2";
import { Stack } from "@aws-cdk/core";
import { simpleGuStackForTesting } from "../../../test/utils/simple-gu-stack";
import type { SynthedStack } from "../../../test/utils/synthed-stack";
import { GuSecurityGroup } from "../ec2";
import { GuApplicationTargetGroup } from "../loadbalancing";
import type { GuAutoScalingGroupProps } from "./asg";
import { GuAutoScalingGroup } from "./asg";

describe("The GuAutoScalingGroup", () => {
  const vpc = Vpc.fromVpcAttributes(new Stack(), "VPC", {
    vpcId: "test",
    availabilityZones: [""],
    publicSubnetIds: [""],
  });
  const defaultProps: GuAutoScalingGroupProps = {
    vpc,
    userData: "user data",
  };

  test("adds the AMI parameter", () => {
    const stack = simpleGuStackForTesting();

    new GuAutoScalingGroup(stack, "AutoscalingGroup", { ...defaultProps, osType: 1 });

    const json = SynthUtils.toCloudFormation(stack) as SynthedStack;

    expect(json.Parameters.AMI).toEqual({
      Description: "AMI ID",
      Type: "String",
    });

    expect(stack).toHaveResource("AWS::AutoScaling::LaunchConfiguration", {
      ImageId: {
        Ref: "AMI",
      },
    });
  });

  test("adds the instanceType parameter", () => {
    const stack = simpleGuStackForTesting();

    new GuAutoScalingGroup(stack, "AutoscalingGroup", defaultProps);

    const json = SynthUtils.toCloudFormation(stack) as SynthedStack;

    expect(json.Parameters.InstanceType).toEqual({
      Type: "String",
      Description: "EC2 Instance Type",
      Default: "t3.small",
    });

    expect(stack).toHaveResource("AWS::AutoScaling::LaunchConfiguration", {
      InstanceType: {
        Ref: "InstanceType",
      },
    });
  });

  test("correctly sets the user data using prop", () => {
    const stack = simpleGuStackForTesting();

    new GuAutoScalingGroup(stack, "AutoscalingGroup", defaultProps);

    expect(stack).toHaveResource("AWS::AutoScaling::LaunchConfiguration", {
      UserData: {
        "Fn::Base64": "user data",
      },
    });
  });

  test("adds any target groups passed through props", () => {
    const stack = simpleGuStackForTesting();

    const targetGroup = new GuApplicationTargetGroup(stack, "TargetGroup", {
      vpc: vpc,
      protocol: ApplicationProtocol.HTTP,
      overrideId: true,
    });

    new GuAutoScalingGroup(stack, "AutoscalingGroup", {
      ...defaultProps,
      targetGroup: targetGroup,
    });

    expect(stack).toHaveResource("AWS::AutoScaling::AutoScalingGroup", {
      TargetGroupARNs: [
        {
          Ref: "TargetGroup",
        },
      ],
    });
  });

  test("adds any security groups passed through props", () => {
    const stack = simpleGuStackForTesting();

    const securityGroup = new GuSecurityGroup(stack, "SecurityGroup", { vpc, overrideId: true });
    const securityGroup1 = new GuSecurityGroup(stack, "SecurityGroup1", { vpc, overrideId: true });
    const securityGroup2 = new GuSecurityGroup(stack, "SecurityGroup2", { vpc, overrideId: true });

    new GuAutoScalingGroup(stack, "AutoscalingGroup", {
      ...defaultProps,
      securityGroup,
      securityGroups: [securityGroup1, securityGroup2],
    });

    expect(stack).toHaveResource("AWS::AutoScaling::LaunchConfiguration", {
      SecurityGroups: [
        {
          "Fn::GetAtt": ["SecurityGroup", "GroupId"],
        },
        {
          "Fn::GetAtt": ["SecurityGroup1", "GroupId"],
        },
        {
          "Fn::GetAtt": ["SecurityGroup2", "GroupId"],
        },
      ],
    });
  });

  test("does not include the UpdatePolicy property", () => {
    const stack = simpleGuStackForTesting();
    new GuAutoScalingGroup(stack, "AutoscalingGroup", { ...defaultProps, overrideId: true });

    const json = SynthUtils.toCloudFormation(stack) as SynthedStack;
    expect(Object.keys(json.Resources.AutoscalingGroup)).not.toContain("UpdatePolicy");
  });

  test("overrides the id with the overrideId prop set to true", () => {
    const stack = simpleGuStackForTesting();
    new GuAutoScalingGroup(stack, "AutoscalingGroup", { ...defaultProps, overrideId: true });

    const json = SynthUtils.toCloudFormation(stack) as SynthedStack;

    expect(Object.keys(json.Resources)).toContain("AutoscalingGroup");
  });

  test("does not override the id by default", () => {
    const stack = simpleGuStackForTesting();
    new GuAutoScalingGroup(stack, "AutoscalingGroup", defaultProps);

    const json = SynthUtils.toCloudFormation(stack) as SynthedStack;

    expect(Object.keys(json.Resources)).not.toContain("AutoscalingGroup");
  });
});
