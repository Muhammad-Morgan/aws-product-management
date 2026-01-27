#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { ProductManagementStack } from "../lib/product-management-stack";
import { ProductManagementDB } from "../lib/dynamodb-stack";
const app = new cdk.App();
const dynamodbStack = new ProductManagementDB(app, "ProductsDynamoDBStack"); //instaniating the db stack
const productsApiStack = new ProductManagementStack(app, "ProductsApiStack", {
  dynamodbStack,
}); //adding db stack into the products api stack as dep - which we are going to create :P -
productsApiStack.addDependency(dynamodbStack);
