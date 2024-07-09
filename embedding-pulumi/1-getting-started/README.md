# Getting set up

We first need a small application and infrastructure to deploy. If you've ever deployed your systems across multiple datacenters, regions, or zones, you've likely wanted to keep track of various bits of data like timezones, time drift, and more. So let's make a small monitoring function that reports the timezone, location, and other data on deployment as a sample that will run quickly and take up only a little bit of space.

Set up your project as follows using `pulumi new python` in each directory (call the api project `burner-program-2`):

```bash
time-auto-api/
    api/
        time/
        venv/
        .gitignore
        __main__.py
        Pulumi.yaml
        requirements.txt
    infra/
        venv/
        .gitignore
        __main__.py
        Pulumi.yaml
        requirements.txt
```

The `time/` directory will hold our Lambda code. Drop the `time_me.py` file from the `app` subdirectory here into the `api/time` directory.

Update the requirements.txt file in `api` to include the following libraries:
* falcon
* pulumi-aws

In the virtual environment from `api/venv/bin/python`, run `pip install -r requirements.txt`.

Here's your current directory structure:

```bash
time-auto-api/
    api/
        time/
            time_me.py
        venv/
            ...
        .gitignore
        __main__.py
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
