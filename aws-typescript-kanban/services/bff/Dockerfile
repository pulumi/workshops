FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}
COPY dist/packages ./packages
COPY dist/services ./services
CMD ["services/bff/src/lambda.handler"]

