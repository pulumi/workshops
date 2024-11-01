"""
_summary_
"""

import pinecone_pulumi as pinecone
import pulumi_aws as aws


def declare_pinecone_resources():
    """_summary_"""
    # Create the Pinecone index
    pinecone.PineconeIndex(
        "ai_demo_index",
        name="games",
        metric=pinecone.IndexMetric.COSINE,
        spec=pinecone.PineconeSpecArgs(
            serverless=pinecone.PineconeServerlessSpecArgs(
                # Starter Plan only supports this cloud
                cloud=pinecone.ServerlessSpecCloud.AWS,
                # Starter Plan only supports this region
                region=aws.Region.US_EAST1,
            ),
        ),
    )
