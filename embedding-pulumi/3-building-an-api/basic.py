"""A Python Pulumi program"""
import json
import os.path
import subprocess
import sys
from pulumi import log
from pulumi import automation as auto


def set_context(org, project, stackd, dirname, req):
    config_obj = {
        'org': org,
        'project': project,
        'stack': stackd,
        'stack_name': auto.fully_qualified_stack_name(org, project, stackd),
        'dirname': dirname,
        'request': req
    }
    return config_obj


def find_local(dirname):
    return os.path.join(os.path.dirname(__file__), dirname)


def spin_venv(dirname):
    work_dir = find_local(dirname)
    try:
        log.info("Preparing a virtual environment...")
        subprocess.run(
            ["python3", "-m", "venv", "venv"],
            check=True,
            cwd=work_dir,
            capture_output=True
        )
        subprocess.run(
            [os.path.join("venv", "bin", "python3"), "-m", "pip", "install", "--upgrade", "pip"],
            check=True,
            cwd=work_dir,
            capture_output=True
        )
        subprocess.run(
            [os.path.join("venv", "bin", "pip"), "install", "-r", "requirements.txt"],
            check=True,
            cwd=work_dir,
            capture_output=True
        )
        log.info("Successfully prepared virtual environment")
    except Exception as e:
        log.error("Failure while preparing a virtual environment:")
        raise e


def set_stack(context_var):
    try:
        log.info("Initializing stack...")
        stackd = auto.create_or_select_stack(
            stack_name=context_var['stack_name'],
            project_name=context_var['project'],
            work_dir=find_local(context_var['dirname'])
        )
        log.info("Successfully initialized stack")
        return stackd
    except Exception as e:
        log.error("Failure when trying to initialize the stack:")
        raise e


def configure_project(stackd, context_var):
    try:
        log.info("Setting project config...")
        stackd.set_config("request", auto.ConfigValue(value=f"{context_var['request']}"))
        log.info("Successfully set project config")
    except Exception as e:
        log.error("Failure when trying to set project configuration:")
        raise e


def refresh_stack(stackd):
    try:
        log.info("Refreshing stack...")
        stackd.refresh(on_output=print)
        log.info("Successfully refreshed stack")
    except Exception as e:
        log.error("Failure when trying to refresh stack:")
        raise e


def destroy_stack(stackd, destroy=False):
    if destroy:
        try:
            log.info("Destroying stack...")
            stackd.destroy(on_output=print)
            log.info("Successfully destroyed stack")
            return
        except Exception as e:
            log.error("Failure when trying to destroy stack:")
            raise e
    else:
        log.info("You need to set destroy to true. Stack still up.")
        return


def update_stack(stackd):
    try:
        log.info("Updating stack...")
        up_res = stackd.up(on_output=print)
        log.info("Successfully updated stack")
        log.info(f"Summary: \n{json.dumps(up_res.summary.resource_changes, indent=4)}")
        for output in up_res.outputs:
            val_out = up_res.outputs[f'{output}'].value
            log.info(f"Output: {val_out}")
        return up_res.outputs
    except Exception as e:
        log.error("Failure when trying to update stack:")
        raise e


if __name__ == "__main__":
    args = sys.argv[1:]
    context = set_context(
        org="<org>",
        project="burner-program-2",
        stackd="dev",
        dirname="api",
        request="timezone"
    )
    spin_venv(context["dirname"])
    stack = set_stack(context_var=context)
    configure_project(stackd=stack, context_var=context)
    refresh_stack(stackd=stack)
    if len(args) > 0:
        if args[0] == "destroy":
            destroy_stack(stackd=stack, destroy=True)
    update_stack(stackd=stack)
