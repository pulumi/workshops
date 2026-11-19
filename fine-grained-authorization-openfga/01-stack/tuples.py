# Relationship tuples written to the OpenFGA store: (user, relation, object).
# 02-checks/grant-deployer.sh uncomments the deployer line below for step 6.
# 02-checks/reset-grant.sh puts it back.

TUPLES = [
    {"user": "user:alice", "relation": "owner", "object": "stack:production"},
    {"user": "agent:deploy-bot", "relation": "viewer", "object": "stack:production"},
    # GRANT {"user": "agent:deploy-bot", "relation": "deployer", "object": "stack:production"},
]
