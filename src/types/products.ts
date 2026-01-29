export type Product = {
  name: string;
  description: string;
  price: number;
  imageData: string; // coming as base64 encoded data
}; // what is prodvided from the api aka the frontend or the extension
export type ProdctRecord = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};
