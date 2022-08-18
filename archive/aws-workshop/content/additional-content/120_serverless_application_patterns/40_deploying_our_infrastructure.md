+++
title = "Deploying Our Infrastructure"
chapter = false
weight = 40
+++

To provision our infrastructure, run:

```bash
pulumi up
```

After confirming, you will see output like the following:

```
Updating (dev):
     Type                             Name                 Status
 +   pulumi:pulumi:Stack              serverless-demo-dev  created
 +   ├─ aws:apigateway:x:API          site                 created
 +   │  ├─ aws:apigateway:RestApi     site                 created
 +   │  ├─ aws:apigateway:Deployment  site                 created
 +   │  ├─ aws:lambda:Permission      site-fa520765        created
 +   │  └─ aws:apigateway:Stage       site                 created
 +   ├─ aws:dynamodb:Table            hits                 created
 +   ├─ aws:iam:Role                  handler-role         created
 +   ├─ aws:iam:RolePolicy            handler-policy       created
 +   └─ aws:lambda:Function           get-handler          created

Outputs:
    url: "https://02fpixl9jf.execute-api.us-west-2.amazonaws.com/stage/"

Resources:
    + 10 created

Duration: 45s
```

After provisioning, you can access your new site at the resulting URL. For fun, curl it a few times:

```bash
for i in {1..5}; do curl $(pulumi stack output url); done
```

Notice that the counter increases:

```bash
<h1>Welcome to ACMECorp!</h1>
<p>1 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>2 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>3 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>4 hits.</p>
<h1>Welcome to ACMECorp!</h1>
<p>5 hits.</p>
```
