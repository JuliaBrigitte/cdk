import type { Schedule } from "@aws-cdk/aws-events";
import type { LambdaErrorPercentageMonitoring } from "../constructs/cloudwatch/lambda-alarms";
import type { NoMonitoring } from "../constructs/cloudwatch/no-monitoring";
import type { GuStack } from "../constructs/core";
import { GuLambdaFunction } from "../constructs/lambda";
import type { GuFunctionProps } from "../constructs/lambda";

interface GuScheduledLambdaProps extends Omit<GuFunctionProps, "rules" | "apis"> {
  schedule: Schedule;
  monitoringConfiguration: NoMonitoring | LambdaErrorPercentageMonitoring;
}

export class GuScheduledLambda extends GuLambdaFunction {
  constructor(scope: GuStack, id: string, props: GuScheduledLambdaProps) {
    const lambdaProps: GuFunctionProps = {
      ...props,
      rules: [{ schedule: props.schedule }],
      errorPercentageMonitoring: props.monitoringConfiguration.noMonitoring ? undefined : props.monitoringConfiguration,
    };
    super(scope, id, lambdaProps);
  }
}
