import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';

export class OnlineZooStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Shared environment variables for all Lambdas
    const lambdaEnvironment = {
      JWT_SECRET: process.env.JWT_SECRET || 'online-zoo-secret-key-2026',
      JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
      TEST_ERROR_PROBABILITY: process.env.TEST_ERROR_PROBABILITY || '0.25',
    };

    // Common Lambda configuration
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_24_X,
      timeout: cdk.Duration.seconds(30),
      environment: lambdaEnvironment,
      bundling: {
        minify: false,
        sourceMap: true,
        externalModules: ['@aws-sdk/*'],
        forceDockerBundling: false, // Use local bundling (esbuild) instead of Docker
      },
    };

    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'online-zoo-users',
      partitionKey: {
        name: 'login',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // API Gateway with CORS enabled
    const api = new apigateway.RestApi(this, 'OnlineZooApi', {
      restApiName: 'Online Zoo API',
      description: 'Backend API for Online Zoo frontend assignment',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
      },
    });

    // Lambda Functions
    const apiInfoLambda = new lambdaNodejs.NodejsFunction(this, 'ApiInfoLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/api-info/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-api-info',
    });

    const getPetsLambda = new lambdaNodejs.NodejsFunction(this, 'GetPetsLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/get-pets/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-get-pets',
    });

    const getPetDetailLambda = new lambdaNodejs.NodejsFunction(this, 'GetPetDetailLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/get-pet-detail/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-get-pet-detail',
    });

    const getFeedbackLambda = new lambdaNodejs.NodejsFunction(this, 'GetFeedbackLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/get-feedback/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-get-feedback',
    });

    const getCamerasLambda = new lambdaNodejs.NodejsFunction(this, 'GetCamerasLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/get-cameras/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-get-cameras',
    });

    const authRegisterLambda = new lambdaNodejs.NodejsFunction(this, 'AuthRegisterLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/auth-register/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-auth-register',
      environment: {
        ...lambdaEnvironment,
        USERS_TABLE_NAME: usersTable.tableName,
      },
    });

    const authLoginLambda = new lambdaNodejs.NodejsFunction(this, 'AuthLoginLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/auth-login/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-auth-login',
      environment: {
        ...lambdaEnvironment,
        USERS_TABLE_NAME: usersTable.tableName,
      },
    });

    const authProfileLambda = new lambdaNodejs.NodejsFunction(this, 'AuthProfileLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/auth-profile/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-auth-profile',
      environment: {
        ...lambdaEnvironment,
        USERS_TABLE_NAME: usersTable.tableName,
      },
    });

    usersTable.grantReadWriteData(authRegisterLambda);
    usersTable.grantReadData(authLoginLambda);
    usersTable.grantReadData(authProfileLambda);

    const donateLambda = new lambdaNodejs.NodejsFunction(this, 'DonateLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/donate/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-donate',
    });

    const docsLambda = new lambdaNodejs.NodejsFunction(this, 'DocsLambda', {
      ...commonLambdaProps,
      entry: path.join(__dirname, '../lambdas/docs/handler.ts'),
      handler: 'handler',
      functionName: 'online-zoo-docs',
    });

    // API Gateway Routes

    // GET / - API info
    api.root.addMethod('GET', new apigateway.LambdaIntegration(apiInfoLambda));

    // /pets
    const petsResource = api.root.addResource('pets');
    petsResource.addMethod('GET', new apigateway.LambdaIntegration(getPetsLambda));

    // /pets/{id}
    const petByIdResource = petsResource.addResource('{id}');
    petByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getPetDetailLambda));

    // /feedback
    const feedbackResource = api.root.addResource('feedback');
    feedbackResource.addMethod('GET', new apigateway.LambdaIntegration(getFeedbackLambda));

    // /cameras
    const camerasResource = api.root.addResource('cameras');
    camerasResource.addMethod('GET', new apigateway.LambdaIntegration(getCamerasLambda));

    // /auth
    const authResource = api.root.addResource('auth');

    const registerResource = authResource.addResource('register');
    registerResource.addMethod('POST', new apigateway.LambdaIntegration(authRegisterLambda));

    const loginResource = authResource.addResource('login');
    loginResource.addMethod('POST', new apigateway.LambdaIntegration(authLoginLambda));

    const profileResource = authResource.addResource('profile');
    profileResource.addMethod('GET', new apigateway.LambdaIntegration(authProfileLambda));

    // /donations
    const donationsResource = api.root.addResource('donations');
    donationsResource.addMethod('POST', new apigateway.LambdaIntegration(donateLambda));

    // /docs
    const docsResource = api.root.addResource('docs');
    docsResource.addMethod('GET', new apigateway.LambdaIntegration(docsLambda));

    const openApiResource = docsResource.addResource('openapi.json');
    openApiResource.addMethod('GET', new apigateway.LambdaIntegration(docsLambda));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: api.restApiId,
      description: 'API Gateway ID',
    });

    new cdk.CfnOutput(this, 'DocsUrl', {
      value: `${api.url}docs`,
      description: 'Swagger UI URL',
    });
  }
}
