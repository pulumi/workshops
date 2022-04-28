# Part 2: Setting up the automation

Now that we have a basic structure, we're going to create a Pulumi program that can be invoked via the Automation API. The Automation API can invoke programs by having them passed inline or via a local program (local as in local to the system running the Automation API, not necessarily local to your machine). We'll be doing a local program today as that's likely the most common case you'll run into. However, inline programs can be great for running tests, for example, so don't miss them!

The local program is in `burner.py` in this directory.

**Question: Does anything about the file seem different to you?**

To set up a local program, we create a standard Pulumi program, and then we wrap it in a function call so the Automation API can interact with it. Here, we're creating an AWS Lambda function with the requisite roles and policies and an invocation. The exports will get fed up to our API program.

Drop `burner.py` into the `api` directory.

In `api/__main__.py`, replace all contents with the following code:

```python
import burner

burner.pulumi_program()

```

**Question: Why would we be doing that?**

Here's what the directory structure is now:

```bash
time-auto-api/
    api/
        time/
            time_me.py
        venv/
            ...
        .gitignore
        __main__.py
        burner.py
        Pulumi.yaml
        requirements.txt
    infra/
        venv/
            ...
        .gitignore
        __main__.py
        Pulumi.yaml
        requirements.txt
```