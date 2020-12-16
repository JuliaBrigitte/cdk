import type {
  ApplicationListenerProps,
  ApplicationLoadBalancerProps,
  ApplicationTargetGroupProps,
  CfnListener,
  CfnLoadBalancer,
  CfnTargetGroup,
} from "@aws-cdk/aws-elasticloadbalancingv2";
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
} from "@aws-cdk/aws-elasticloadbalancingv2";
import type { GuStack } from "../core";

// TODO: By default, an application load balancer has deletion protection set to false.
//  We probably want to protect this load balancer as much as possible
//  should we set it to true instead?

interface GuApplicationLoadBalancerProps extends ApplicationLoadBalancerProps {
  overrideId?: boolean;
}

export class GuApplicationLoadBalancer extends ApplicationLoadBalancer {
  constructor(scope: GuStack, id: string, props: GuApplicationLoadBalancerProps) {
    super(scope, id, props);

    const cfnLb = this.node.defaultChild as CfnLoadBalancer;

    if (props.overrideId) cfnLb.overrideLogicalId(id);

    cfnLb.addPropertyDeletionOverride("Type");
  }
}

export interface GuApplicationTargetGroupProps extends ApplicationTargetGroupProps {
  overrideId?: boolean;
}

export class GuApplicationTargetGroup extends ApplicationTargetGroup {
  constructor(scope: GuStack, id: string, props: GuApplicationTargetGroupProps) {
    super(scope, id, props);

    if (props.overrideId) (this.node.defaultChild as CfnTargetGroup).overrideLogicalId(id);
  }
}

export interface GuApplicationListenerProps extends ApplicationListenerProps {
  overrideId?: boolean;
}

export class GuApplicationListener extends ApplicationListener {
  static defaultProps: Partial<GuApplicationListenerProps> = {
    port: 443,
    protocol: ApplicationProtocol.HTTPS,
  };

  constructor(scope: GuStack, id: string, props: GuApplicationListenerProps) {
    super(scope, id, { ...GuApplicationListener.defaultProps, ...props });

    if (props.overrideId) (this.node.defaultChild as CfnListener).overrideLogicalId(id);
  }
}
