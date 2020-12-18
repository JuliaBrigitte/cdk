import "@aws-cdk/assert/jest";
import { SynthUtils } from "@aws-cdk/assert";
import { simpleGuStackForTesting } from "../../test/utils/simple-gu-stack";
import { GuGetS3ObjectPolicy } from "../constructs/iam";
import { InstanceRole } from "./instance-role";

describe("The InstanceRole construct", () => {
  it("should create the correct resources with minimal config", () => {
    const stack = simpleGuStackForTesting();
    new InstanceRole(stack, { bucketName: "test" });

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    expect(stack).toCountResources("AWS::IAM::Role", 1);
    expect(stack).toCountResources("AWS::IAM::Policy", 4);
  });

  it("should create an additional logging policy if logging stream is specified", () => {
    const stack = simpleGuStackForTesting();
    new InstanceRole(stack, { bucketName: "test", loggingStreamName: "my-logging-stream" });

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    expect(stack).toCountResources("AWS::IAM::Role", 1);
    expect(stack).toCountResources("AWS::IAM::Policy", 5);
  });

  it("should allow additional policies to be specified", () => {
    const stack = simpleGuStackForTesting();

    new InstanceRole(stack, {
      bucketName: "test",
      additionalPolicies: [new GuGetS3ObjectPolicy(stack, "GetConfigPolicy", { bucketName: "config" })],
    });

    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    expect(stack).toCountResources("AWS::IAM::Role", 1);
    expect(stack).toCountResources("AWS::IAM::Policy", 5);
  });
});
