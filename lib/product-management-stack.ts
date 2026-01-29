import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2_integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaRuntime from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { ProductManagementDB } from "./dynamodb-stack";
type ProductManagementProps = {
  dynamodbStack: ProductManagementDB;
} & cdk.StackProps;
export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ProductManagementProps) {
    super(scope, id, props);
    // setting-up lambdas
    const createProductLambda = new NodejsFunction(
      this,
      `${this.stackName}-create-product-lambda`,
      {
        runtime: lambdaRuntime.Runtime.NODEJS_22_X,
        handler: "handler",
        entry: path.join(__dirname, "../src/lambda/products/createProduct.ts"),
        functionName: `${this.stackName}-create-product-lambda`,
        environment: {
          PRODUCTS_TABLE_NAME: props.dynamodbStack.productsTableRN.tableName,
          PRODUCTS_IMAGES_BUCKET_NAME:
            props.dynamodbStack.productImagesBucket.bucketName,
        },
        timeout: cdk.Duration.seconds(60),
      },
    );
    const getAllProductsLambda = new NodejsFunction(
      this,
      `${this.stackName}-get-all-products-lambda`,
      {
        runtime: lambdaRuntime.Runtime.NODEJS_22_X,
        handler: "handler",
        entry: path.join(__dirname, "../src/lambda/products/getAllProducts.ts"),
        functionName: `${this.stackName}-get-all-products-lambda`,
        environment: {
          PRODUCTS_TABLE_NAME: props.dynamodbStack.productsTableRN.tableName,
        },
      },
    );
    const deleteProductLambda = new NodejsFunction(
      this,
      `${this.stackName}-delete-product-lambda`,
      {
        runtime: lambdaRuntime.Runtime.NODEJS_22_X,
        handler: "handler",
        entry: path.join(__dirname, "../src/lambda/products/deleteProduct.ts"),
        functionName: `${this.stackName}-delete-product-lambda`,
        environment: {
          PRODUCTS_TABLE_NAME: props.dynamodbStack.productsTableRN.tableName,
          PRODUCTS_IMAGES_BUCKET_NAME:
            props.dynamodbStack.productImagesBucket.bucketName,
        },
        timeout: cdk.Duration.seconds(60),
      },
    );
    // permissions
    // writing/reading DB
    props.dynamodbStack.productsTableRN.grantWriteData(createProductLambda);
    props.dynamodbStack.productsTableRN.grantReadData(getAllProductsLambda);
    props.dynamodbStack.productsTableRN.grantReadWriteData(deleteProductLambda);
    // Bucket
    props.dynamodbStack.productImagesBucket.grantWrite(createProductLambda);
    props.dynamodbStack.productImagesBucket.grantWrite(deleteProductLambda);
    // setting up the API
    const api = new apigatewayv2.HttpApi(this, `${this.stackName}-API`, {
      apiName: `${this.stackName}-API`,
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [apigatewayv2.CorsHttpMethod.ANY],
      },
    });
    // adding routes
    api.addRoutes({
      path: "/products",
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        "CreateProductIntegration",
        createProductLambda,
      ),
    });
    api.addRoutes({
      path: "/products",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        "GetAllProductsIntegration",
        getAllProductsLambda,
      ),
    });
    api.addRoutes({
      path: "/products/{id}",
      methods: [apigatewayv2.HttpMethod.DELETE],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        "DeleteProductIntegration",
        deleteProductLambda,
      ),
    });
    // print out url, products table name and product images bucket
    new cdk.CfnOutput(this, "ApiGatewayUrl", {
      value: api.url!,
      description: "Api Gateway URL for the products",
      exportName: `${this.stackName}-ApiGatewayUrl`,
    });
    new cdk.CfnOutput(this, "ProductsTableName", {
      value: props.dynamodbStack.productsTableRN.tableName,
      description: "DynamoDB products table name",
      exportName: `${this.stackName}-ProductsTableName`,
    });
    new cdk.CfnOutput(this, "ProductsImagesBucketName", {
      value: props.dynamodbStack.productImagesBucket.bucketName,
      description: "S3 Bucket products Images",
      exportName: `${this.stackName}-ProductsImagesBucketName`,
    });
  }
}
