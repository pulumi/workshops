"""Preventative policies that block deployments before infrastructure is created."""

from typing import Any, Callable
from pulumi_policy import (
    EnforcementLevel,
    PolicyPack,
    ReportViolation,
    ResourceValidationArgs,
    ResourceValidationPolicy,
    StackValidationArgs,
    StackValidationPolicy,
)

# Policy 1: Restrict dangerous ports (including port 23 from Pulumi.yaml)
def restrict_ports_validation(args: ResourceValidationArgs, report_violation: ReportViolation) -> Any:
    """Restrict dangerous ports by checking Load Balancer Target Groups."""
    # Target the AWS load balancer target group that the component creates
    if args.resource_type != "aws:lb/targetGroup:TargetGroup":
        return
    
    port = args.props.get('port', 80)
    
    if port in [22, 23, 3389, 1433, 5432, 3306]:  # Include port 23 (telnet) as dangerous
        report_violation(
            f"Load Balancer Target Group '{args.name}' uses dangerous port {port}. "
            f"Avoid using well-known service ports (22=SSH, 23=Telnet, 3389=RDP, 1433=SQL Server, 5432=PostgreSQL, 3306=MySQL). "
            f"This suggests your microservice component is configured with an unsafe port."
        )

restrict_dangerous_ports = ResourceValidationPolicy(
    name="restrict-dangerous-ports",
    description="Microservice components must not use dangerous ports like 22, 23, 3389, or 1433",
    validate=restrict_ports_validation,
    enforcement_level=EnforcementLevel.MANDATORY,  # Changed to advisory to allow all policies to run
)

# Policy 2: Limit memory usage - read from ECS TaskDefinition tags
def limit_memory_validation(args: ResourceValidationArgs, report_violation: ReportViolation) -> Any:
    """Limit memory usage by reading tags from ECS TaskDefinitions created by microservice components."""
    # Target AWS ECS task definitions that are created by microservice components
    if args.resource_type != "aws:ecs/taskDefinition:TaskDefinition":
        return
    
    # Check if this task definition is from a microservice component (based on URN pattern)
    if "component-microservice" not in args.urn:
        return
    
    # Get the tags from the task definition
    tags = args.props.get('tags', {})
    tagsAll = args.props.get('tagsAll', {})
    
    # Handle Pulumi proxy objects - try to access memory tag
    memory_str = None
    try:
        if hasattr(tags, 'get'):
            memory_str = tags.get('microservice:memory')
        elif hasattr(tags, '__getitem__'):
            memory_str = tags['microservice:memory']
    except:
        pass
    
    if not memory_str:
        try:
            if hasattr(tagsAll, 'get'):
                memory_str = tagsAll.get('microservice:memory')
            elif hasattr(tagsAll, '__getitem__'):
                memory_str = tagsAll['microservice:memory']  
        except:
            pass
            
    if memory_str:
        try:
            memory_val = int(str(memory_str))  # Convert to string first, then int
            if memory_val > 1024:
                report_violation(
                    f"ECS TaskDefinition '{args.name}' configured with {memory_val}MB memory. "
                    f"This exceeds the recommended 1024MB limit for development environments. "
                    f"Consider reducing memory allocation to control costs."
                )
        except (ValueError, TypeError):
            pass

limit_memory_usage = ResourceValidationPolicy(
    name="limit-memory-usage",
    description="Microservice components should not exceed 1GB memory in development",
    validate=limit_memory_validation,
    enforcement_level=EnforcementLevel.ADVISORY,
)

# Policy 3: Stack policy - S3 + Microservice security alignment (preview-compatible)
def stack_resource_alignment_validation(args: StackValidationArgs, report_violation: ReportViolation) -> Any:
    """Validate stack composition: When microservices and S3 exist together, require encrypted storage."""
    try:
        # Find microservice components and S3 buckets in the stack
        microservice_components = [r for r in args.resources if r.resource_type == "component-microservice:index:MicroserviceComponent"]
        s3_buckets = [r for r in args.resources if r.resource_type == "aws:s3/bucket:Bucket"]
        
        
        # Stack policy: Only apply when both microservice AND S3 buckets exist together
        if microservice_components and s3_buckets:
            # Check if S3 buckets have encryption when microservices are present
            # Look for either bucket-level encryption or separate encryption resources
            encryption_resources = [r for r in args.resources if r.resource_type == "aws:s3/bucketServerSideEncryptionConfiguration:BucketServerSideEncryptionConfiguration"]
            
            # Simple check: if we have encryption resources, consider stack compliant
            # For a more complex policy, you'd match buckets to encryption resources specifically
            if len(encryption_resources) == 0:
                # No separate encryption resources, check bucket-level encryption
                unencrypted_buckets = []
                for bucket in s3_buckets:
                    try:
                        encryption_config = bucket.props.get('serverSideEncryptionConfiguration')
                        if encryption_config is None:
                            unencrypted_buckets.append(bucket.name)
                    except:
                        unencrypted_buckets.append(bucket.name)
                
                # Report violation if any buckets lack encryption
                if unencrypted_buckets:
                    report_violation(
                        f"STACK POLICY VIOLATION: This stack contains {len(microservice_components)} microservice component(s) "
                        f"and {len(s3_buckets)} S3 bucket(s), but {len(unencrypted_buckets)} bucket(s) lack encryption: {', '.join(unencrypted_buckets)}. "
                        f"When microservices and S3 storage are deployed together, "
                        f"all S3 buckets must have encryption enabled for security compliance. "
                        f"Add serverSideEncryptionConfiguration to your S3 buckets."
                    )
            
    except Exception:
        # During preview, some values may not be available - skip validation gracefully
        pass

stack_resource_alignment = StackValidationPolicy(
    name="stack-resource-alignment", 
    description="S3 buckets must have encryption when deployed with microservice components",
    validate=stack_resource_alignment_validation,
    enforcement_level=EnforcementLevel.ADVISORY,  # Advisory to be preview-friendly
)

# Policy 4: Simple preview-compatible stack policy that always fires
def preview_friendly_stack_validation(args: StackValidationArgs, report_violation: ReportViolation) -> Any:
    """A stack policy that always works in preview - validates basic resource composition."""
    try:
        # Count resources by type - this information is always available in preview
        resource_types = {}
        total_resources = 0
        for resource in args.resources:
            resource_type = resource.resource_type
            resource_types[resource_type] = resource_types.get(resource_type, 0) + 1
            total_resources += 1
        
        # Always report for demo purposes - this will show the policy runs during preview
        report_violation(
            f"PREVIEW DEMO: Stack analysis shows {total_resources} total resources across {len(resource_types)} different types. "
            f"This demonstrates that policies can analyze stack composition during preview. "
            f"Resource types found: {', '.join(sorted(resource_types.keys())[:5])}..."
        )
        
        # Check for S3 buckets without encryption
        s3_count = resource_types.get("aws:s3/bucket:Bucket", 0)
        if s3_count > 0:
            report_violation(
                f"PREVIEW S3 CHECK: Found {s3_count} S3 bucket(s) in stack. "
                f"Verify all buckets have encryption configured for security compliance."
            )
            
    except Exception as e:
        # Report any issues for debugging
        report_violation(f"PREVIEW ERROR: {str(e)}")

preview_friendly_stack = StackValidationPolicy(
    name="preview-friendly-stack",
    description="Basic stack validation that works reliably in preview mode",
    validate=preview_friendly_stack_validation,
    enforcement_level=EnforcementLevel.ADVISORY,
)


# Create the policy pack
policy_pack = PolicyPack(
    name="demo-policies",
    enforcement_level=EnforcementLevel.ADVISORY,
    policies=[
        restrict_dangerous_ports,      # Will trigger on port 22
        # limit_memory_usage,           # Will trigger on 2048MB memory  
        # stack_resource_alignment,     # Will trigger on unencrypted S3 bucket
        # preview_friendly_stack,       # Will trigger on missing load balancer
        # debug_stack_resources,        # Debug what resources are in stack
    ],
)