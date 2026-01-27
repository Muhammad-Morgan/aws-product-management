import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
export class ProductManagementDB extends cdk.Stack {
  public readonly productsTableRN: dynamodb.Table; // for lambda to access tableName and other stuff.
  public readonly productImagesBucket: s3.Bucket; // for lambda blah blah blah...
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
    this.productImagesBucket = new s3.Bucket(
      this,
      `${this.stackName}-Products-Images-Bucket`,
      {
        bucketName: `${this.stackName.toLocaleLowerCase()}-Products-Images`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      },
    );
  }
}
