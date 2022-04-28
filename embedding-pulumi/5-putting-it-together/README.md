# Part 5: Putting it all together

Now we'll run it!

But first, we need to pass in the following configuration values:
* `aws:profile` (if you're using sso)
* `aws:region`
<!-- * `burner-program2:request` () -->



<details>
<summary>**Question: Where do you think we should pass those config values: To the local program (`api/burner.py`) or to the wrapper (`infra/basic.py`)?**</summary>

Answer: You want to pass it to the local program.
</details>

From the root of the repo in a terminal, run `python infra_api.py`. Notice that we're not running a `pulumi up`!

```bash
Serving on port 8000...
```

Open a new terminal window and CURL the `location` endpoint. It might take a moment, but you'll get the following response:

```bash
$ curl localhost:8000/location
{"response": "{'location': '\"us-west-2\"'}"}
```

While the CURL command is running, switch back to the terminal window running your API.

<details>
<summary>**Question: Where are you finding the logs?</summary>

You'll find all of the info logs appearing in the terminal with your API.
</details>

This program automatically destroys all resources after a successful run, so you shouldn't need to spin anything down.

<details>
<summary>**Question: How would you destroy the stack manually?</summary>

You can change into the `api` directory and run Pulumi commands as normal, including `pulumi destroy` because we updated `api/__main__.py` to point to and run the same `burner.pulumi_program()` call that the Automation API is running.
</details>