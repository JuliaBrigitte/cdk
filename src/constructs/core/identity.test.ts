import "@aws-cdk/assert/jest";
import { Topic } from "@aws-cdk/aws-sns";
import { Stack } from "@aws-cdk/core";
import { AppIdentity } from "./identity";

describe("AppIdentity.suffixText", () => {
  it("should title case the app before suffixing it", () => {
    const actual = AppIdentity.suffixText({ app: "myapp" }, "InstanceType");
    const expected = "InstanceTypeMyapp";
    expect(actual).toEqual(expected);
  });

  it("should work with title case input", () => {
    const actual = AppIdentity.suffixText({ app: "MyApp" }, "InstanceType");
    const expected = "InstanceTypeMyApp";
    expect(actual).toEqual(expected);
  });

  it("should work with uppercase input", () => {
    const actual = AppIdentity.suffixText({ app: "MYAPP" }, "InstanceType");
    const expected = "InstanceTypeMYAPP";
    expect(actual).toEqual(expected);
  });

  it("should handle non-alphanumeric characters (e.g. hyphens)", () => {
    const actual = AppIdentity.suffixText({ app: "my-app" }, "InstanceType");
    const expected = "InstanceTypeMyapp";
    expect(actual).toEqual(expected);
  });
});

describe("AppIdentity.taggedConstruct", () => {
  it("should apply a tag to a resource", () => {
    // not using any Gu constructs to purely test the impact of AppIdentity.taggedConstruct
    const stack = new Stack();

    const snsTopic = new Topic(stack, "myTopic");
    const appIdentity: AppIdentity = { app: "testing" };

    AppIdentity.taggedConstruct(appIdentity, snsTopic);

    expect(stack).toHaveResource("AWS::SNS::Topic", {
      Tags: [
        {
          Key: "App",
          Value: "testing",
        },
      ],
    });
  });
});
