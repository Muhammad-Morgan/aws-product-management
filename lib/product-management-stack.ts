import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigatewayv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigatewayv2_integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaRuntime from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { ProductManagementDB } from "./dynamodb-stack";
type ProductManagementProps = {
  dynamodbStack: ProductManagementDB;
} & cdk.StackProps;
export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ProductManagementProps) {
    super(scope, id, props);
  }
}
