# Demo Code for the `Golden Paths: Infrastructure Components and Templates workshop

1. Create a new directory for the workshop:
   ```bash
   mkdir golden-paths-infrastructure-components-and-templates
   cd golden-paths-infrastructure-components-and-templates
   ```

2. Create the boilerplate files in the folder `go-microservice-boilerplate` and inside we create a folder `microservice`
   which contains the boilerplate code for a Go microservice:
   ```bash
   mkdir go-microservice-boilerplate
   ```

3. We already have some code we want to use for any future microservice developement for our fictional company
   `Acme Corp`.


4. Now we create the Pulumi template for this, so we can publish the Golden Path to the Pulumi registry. For this we use
   the `pulumi new` command with the `aws-yaml` template as a base. We will later templateize this code.
    ```bash
    pulumi new aws-yaml -g --force
    ```
   > Note: We use the `-g` flag to generate only the code, without creating a stack in Pulumi cloud.

5. Now we add the Pulumi component to our `go-microservice-boilerplate` directory:
   ```bash
   pulumi package add https://github.com/smithrobs/component-microservice[@v1.0.0]
   ```
   This command will download the component from the GitHub repository and add it to your project.
    ```
   Downloading provider: github.com_smithrobs_component-microservice.git
   Added package "component-microservice" to Pulumi.yaml   
   ``

6. Now we can use the component in our `Pulumi.yaml` file. We will add the following code to the file:
    ```yaml
    resources:
      microserviceComponent:
        type: component-microservice:MicroserviceComponent
        properties:
          appPath: ./microservice
          port: 8080
          containerName: go-microservice-boilerplate
      ecsTarget:
        type: aws:appautoscaling:Target
        name: ecs_target
        properties:
          maxCapacity: 4
          minCapacity: 1
          resourceId: service/${microserviceComponent.clusterName}/${microserviceComponent.serviceName}
          scalableDimension: ecs:service:DesiredCount
          serviceNamespace: ecs
      ecsPolicyUP:
        type: aws:appautoscaling:Policy
        name: ecs_policy_up
        properties:
          name: ecs_policy_up
          policyType: StepScaling
          resourceId: ${ecsTarget.resourceId}
          scalableDimension: ${ecsTarget.scalableDimension}
          serviceNamespace: ${ecsTarget.serviceNamespace}
          stepScalingPolicyConfiguration:
            adjustmentType: ChangeInCapacity
            cooldown: 60
            metricAggregationType: Maximum
            stepAdjustments:
            - metricIntervalUpperBound: 0
              scalingAdjustment: 1
      ecsPolicyDown:
        type: aws:appautoscaling:Policy
        name: ecs_policy_down
        properties:
          name: ecs_policy_down
          policyType: StepScaling
          resourceId: ${ecsTarget.resourceId}
          scalableDimension: ${ecsTarget.scalableDimension}
          serviceNamespace: ${ecsTarget.serviceNamespace}
          stepScalingPolicyConfiguration:
            adjustmentType: ChangeInCapacity
            cooldown: 60
            metricAggregationType: Maximum
            stepAdjustments:
            - metricIntervalLowerBound: 0
              scalingAdjustment: -1
      serviceCPUHighUtilization:
        type: aws:cloudwatch:MetricAlarm
        name: service_cpu_high_utilization
        properties:
          name: service_cpu_high_utilization
          comparisonOperator: GreaterThanOrEqualToThreshold
          evaluationPeriods: 2
          metricName: CPUUtilization
          namespace: AWS/ECS
          period: 60
          statistic: Average
          threshold: 80
          alarmActions:
          - ${ecsPolicyUP.arn}
          dimensions:
            ClusterName: ${microserviceComponent.clusterName}
            ServiceName: ${microserviceComponent.serviceName}
      serviceCPULowUtilization:
        type: aws:cloudwatch:MetricAlarm
        name: service_cpu_low_utilization
        properties:
          name: service_cpu_low_utilization
          comparisonOperator: LessThanOrEqualToThreshold
          evaluationPeriods: 2
          metricName: CPUUtilization
          namespace: AWS/ECS
          period: 60
          statistic: Average
          threshold: 10
          alarmActions:
          - ${ecsPolicyDown.arn}
          dimensions:
            ClusterName: ${microserviceComponent.clusterName}
            ServiceName: ${microserviceComponent.serviceName}
    
    outputs:
      publicUrl: ${microserviceComponent.publicUrl}
    ```
   
