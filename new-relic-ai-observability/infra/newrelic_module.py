"""_summary_
"""
import json

import pulumi
import pulumi_newrelic as newrelic


def declare_new_relic_resources():
    """_summary_
    """
    # Load the JSON configuration
    dash = ""
    with open('../dashboard.json', encoding="utf-8") as f:
        dash_obj = json.load(f)
        # Update the New Relic Account ID
        account_id = pulumi.Config('newrelic').require_int('accountId')
        # Update the accountIds field to [account_id]
        for page in dash_obj.get("pages", []):
            for widget in page.get("widgets", []):
                nrql_queries = widget.get("rawConfiguration", {}) .get("nrqlQueries", [])
                for query in nrql_queries:
                    query["accountIds"] = [account_id]
        dash = json.dumps(dash_obj)

    # Create the New Relic dashboard
    newrelic.OneDashboardJson(
        resource_name='ai_demo_dashboard',
        json=dash,
    )
