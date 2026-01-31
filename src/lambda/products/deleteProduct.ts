import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ProdctRecord } from "../../types/products";

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

// Environment variables
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME!;
const PRODUCTS_IMAGES_BUCKET_NAME = process.env.PRODUCT_IMAGES_BUCKET_NAME!;

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log("Delete Event", event);
  try {
    const productId = event.pathParameters?.id; // this is how you get the params
    if (productId)
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "product ID is required..." }),
      };
    // getting the item from the table
    let product: ProdctRecord;
    try {
      const getResult = await docClient.send(
        new GetCommand({
          TableName: PRODUCTS_TABLE_NAME,
          Key: { id: productId },
        }),
      );
      if (!getResult)
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "product not found" }),
        };
      product = getResult.Item as ProdctRecord;
    } catch (dynamoError: any) {
      console.error("Error retrieving product from dynamoDB", dynamoError);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "failed to retrieve product" }),
      };
    }
    // getting image from s3
    if (product.imageUrl) {
      try {
        const urlParts = product.imageUrl.split("/");
        const s3Key = urlParts.slice(3).join("/");
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: PRODUCTS_IMAGES_BUCKET_NAME,
            Key: s3Key,
          }),
        );
        console.log("Image deleted from s3", s3Key);
      } catch (s3Error) {
        console.error("Error deleting image from s3", s3Error);
      }
    }
    // deleting product from dynamoDB
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: PRODUCTS_TABLE_NAME,
          Key: { id: productId },
        }),
      );
      console.log("Product removed from dynamoDB", productId);
    } catch (dynamoError) {
      console.error("Error deleting product from dynamoDB", dynamoError);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "failed to delete product" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Product deleted", productId }),
    };
  } catch (error) {
    console.log("Error processing request", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
}
