FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}
COPY dist/services ./services
CMD ["services/webhook/src/lambda.handler"]

