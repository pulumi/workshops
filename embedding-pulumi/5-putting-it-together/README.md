# Part 5: Putting it all together

Now we'll run it!

But first, we need to pass in the following configuration values:
* `aws:profile` (if you're using sso)
* `aws:region`
<!-- * `burner-program2:request` () -->

<details>
<summary><b>Question:</b> Where do you think we should pass those config values: To the local program (<code>api/burner.py</code>) or to the wrapper (<code>infra/basic.py</code>)?</summary>

<br/>
<b>Answer:</b> You want to pass it to the local program.
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
<summary><b>Question:</b> Where are you finding the logs?</summary>

<br/>
<b>Answer:</b> You'll find all of the info logs appearing in the terminal with your API.
</details>

This program automatically destroys all resources after a successful run, so you shouldn't need to spin anything down.

<details>
<summary><b>Question:</b> How would you destroy the stack manually?</summary>

<br/>
<b>Answer:</b> You can change into the <code>api</code> directory and run Pulumi commands as normal, including <code>pulumi destroy</code> because we updated <code>api/__main__.py</code> to point to and run the same <code>burner.pulumi_program()</code> call that the Automation API is running.
</details>