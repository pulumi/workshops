from pulumi import AssetArchive, Config, export, FileArchive, ResourceOptions
from pulumi_aws import iam, lambda_


def pulumi_program():
    config = Config()
    request = config.require('request')
    if request == 'timezone':
        # Spin up a serverless function infra with the time function in the requested zone with the right permissions
        lambda_role = iam.Role(
            "laura-role-2",
            assume_role_policy="""{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "sts:AssumeRole",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Effect": "Allow",
                "Sid": ""
            }
        ]
    }"""
        )

        lambda_policy = iam.RolePolicyAttachment(
            "laura-role-policy",
            role=lambda_role.id,
            policy_arn=iam.ManagedPolicy.AWS_LAMBDA_BASIC_EXECUTION_ROLE
        )

        time_fn = lambda_.Function(
            "laura-timezone-finder",
            runtime='python3.9',
            role=lambda_role.arn,
            handler="time_me.timezone",
            code=AssetArchive({
                ".": FileArchive("./time")
            }),
            opts=ResourceOptions(depends_on=lambda_role)
        )
        invoke_me = lambda_.Invocation(
            "laura-test-invoke",
            function_name=time_fn.name,
            input="""{"request": "timezone"}"""
        )
        export(f'{request}', invoke_me.result)
    elif request == 'location':
        # Spin up a serverless function infra with the location function in the requested region with the right permissions
        lambda_role = iam.Role(
            "laura-role-2",
            assume_role_policy="""{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "sts:AssumeRole",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Effect": "Allow",
                "Sid": ""
            }
        ]
    }"""
        )

        lambda_policy = iam.RolePolicyAttachment(
            "laura-role-policy",
            role=lambda_role.id,
            policy_arn=iam.ManagedPolicy.AWS_LAMBDA_BASIC_EXECUTION_ROLE
        )

        location_fn = lambda_.Function(
            "laura-location-finder",
            runtime='python3.9',
            role=lambda_role.arn,
            handler="time_me.location",
            code=AssetArchive({
                ".": FileArchive("./time")
            }),
            opts=ResourceOptions(depends_on=lambda_role)
        )
        invoke_me = lambda_.Invocation(
            "laura-test-invoke",
            function_name=location_fn.name,
            input="""{"request": "location"}"""
        )
        export(f'{request}', invoke_me.result)
    else:
        print("Please send me something real")
