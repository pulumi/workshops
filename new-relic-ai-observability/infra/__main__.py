"""
    _summary_
"""
from aws_module import declare_aws_resources
from newrelic_module import declare_new_relic_resources
from pinecone_module import declare_pinecone_resources

if __name__ == "__main__":
    declare_pinecone_resources()
    declare_new_relic_resources()
    declare_aws_resources()
