# Part 3: Setting up for API calls and Building an API

Having a set of commands that we can invoke programmatically is a nice touch, but it may not seem like much of an improvement. After all, we can just run these commands via the CLI and get the same result. We still need to write up Pulumi code for each system we want to build. However, what if I told you we could take this code and start building it out to make a self-service web portal for others to provision infrastructure? Or we could define commands to spin up happy-path infrastructure that other engineers could call from their own programs (or from a chatbot)? We could even call these commands as part of a pipeline (if we weren’t using a supported runner) or as part of a program that is triggered by an incident page—such as if you need to spin up more capacity automatically in response to a spike in traffic.

In our case, we're running a tiny little program as a placeholder for all of these use cases.

## Creating functions

We're going to now work in the `infra` directory. Drop the `basic.py` file from this directory into your `infra` directory. Change the `<org>` value on line 122 to your personal org on Pulumi (should be your username).

Delete everything in `infra/__main__.py`. It's only there as a placeholder for the module in Python now.

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
        basic.py
        Pulumi.yaml
        requirements.txt
```

**Question: Let's go explore the `basic.py` file. What do you think is happening in this file?**

## Creating the API itself

Finally, let's make our API! In the root of the repo, add the `infra_api.py` file. Change the `<org>` value on line 13 to your personal org on Pulumi (should be your username).

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
        basic.py
        Pulumi.yaml
        requirements.txt
    infra_api.py
```

Lines 28 on in `infra_api.py` is all Falcon, a lightweight WSGI framework for REST APIs. But the part that we're really interested in from a Pulumi standpoint is on lines 11 to 25. Each endpoint that returns data from our "datacenter" calls that function and returns the data to the endpoint.

**Question: Can you follow what's happening? Where's the virtual environment coming from?**