import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
export class ProductManagementDB extends cdk.Stack {
  public readonly productsTableRN: dynamodb.Table; // for lambda to access tableName and other stuff.
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.productsTableRN = new dynamodb.Table(this, "ProductsTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: `${this.stackName}-products-table`,
    });
  }
}
