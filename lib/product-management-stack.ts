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
          PRODUCTS_IMAGES_BUCKET_NAME:
            props.dynamodbStack.productImagesBucket.bucketName,
        },
        timeout: cdk.Duration.seconds(60),
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
  }
}
