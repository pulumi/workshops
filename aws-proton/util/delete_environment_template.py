import boto3
import argparse

parser = argparse.ArgumentParser(
    prog='delete_environment_template',
    description='Unconditionally deletes an environment template: all versions'
)

parser.add_argument(
    '-n',
    '--name',
    help="The name of the environment template.",
    required=True
)

args = parser.parse_args()

proton = boto3.client('proton')

response = proton.list_environment_template_versions(
    maxResults=100,
    templateName=args.name
)

error_deleting_template_version = False

for template_version in response['templateVersions']:
    major_version = template_version['majorVersion']
    minor_version = template_version['minorVersion']

    print(f"Deleting version {major_version}.{minor_version}")

    try:
        proton.delete_environment_template_version(
            majorVersion=major_version,
            minorVersion=minor_version,
            templateName=args.name
        )
    except:
        print(
            f"Unable to delete template '{args.name}' v{major_version}.{minor_version}.")
        error_deleting_template_version = True

if not error_deleting_template_version:
    proton.delete_environment_template(
        name=args.name
    )
