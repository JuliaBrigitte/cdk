import type { ApplicationTargetGroupProps, CfnTargetGroup } from "@aws-cdk/aws-elasticloadbalancingv2";
import { ApplicationTargetGroup, Protocol } from "@aws-cdk/aws-elasticloadbalancingv2";
import { Duration } from "@aws-cdk/core";
import type { GuStack } from "../../core";
import { AppIdentity } from "../../core/identity";

export interface GuApplicationTargetGroupProps extends ApplicationTargetGroupProps, AppIdentity {
  overrideId?: boolean;
}

export class GuApplicationTargetGroup extends ApplicationTargetGroup {
  static DefaultHealthCheck = {
    path: "/healthcheck",
    protocol: Protocol.HTTP,
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 5,
    interval: Duration.seconds(30),
    timeout: Duration.seconds(10),
  };

  constructor(scope: GuStack, id: string, props: GuApplicationTargetGroupProps) {
    const { app } = props;

    const mergedProps = {
      ...props,
      healthCheck: { ...GuApplicationTargetGroup.DefaultHealthCheck, ...props.healthCheck },
    };

    super(scope, AppIdentity.suffixText({ app }, id), mergedProps);

    if (mergedProps.overrideId || (scope.migratedFromCloudFormation && mergedProps.overrideId !== false))
      (this.node.defaultChild as CfnTargetGroup).overrideLogicalId(id);

    AppIdentity.taggedConstruct({ app }, this);
  }
}
