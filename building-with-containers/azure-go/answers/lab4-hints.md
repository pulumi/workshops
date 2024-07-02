# Hints

<details>
<summary><b>Where have you searched for the secret?</b></summary>

If you tried `pulumi config` or checked the stack config file, you won't find it there. The CLI only shows `[secret]` and the config file shows an encrypted value with a `secure` tag.

</details>
<details>
<summary><b>Could you export it somehow?</b></summary>

Nope! Exporting it as a stack output and then trying to call `pulumi stack output <key>` doesn't work, either. You get `[secret]` as a result.

</details>
<details>
<summary><b>What about printing it from the Pulumi program?</b></summary>

If you're going to directly print it out by forcing Pulumi to dump it, we can't stop you. That's up to you not to expose your secret, just like you shouldn't hardcode your database password into your code.

Pulumi decrypts secrets and makes them available to programs at runtime for `pulumi up`, and then locks them back up again at the end. As such, it is technically an output, so you'll need to use the various Output functions to call it. But please don't just print it or dump it!

</details>
<details>
<summary><b>Could you get the app to dump it out?</b></summary>

If you're going to directly print it out by forcing Pulumi to dump it, we can't stop you. That's up to you not to expose your secret, just like you shouldn't hardcode your database password into your code.

Pulumi decrypts secrets and makes them available to programs at runtime for `pulumi up`, and then locks them back up again at the end. As such, it is technically an output, so you'll need to use the various Output functions to call it. But please don't just print it or dump it!

</details>
<details>
<summary><b>Maybe there's a flag to get it to appear...</b></summary>

This is the only good, sensible answer. Head back to the labs to read more on how to get it to show up.

</details>
