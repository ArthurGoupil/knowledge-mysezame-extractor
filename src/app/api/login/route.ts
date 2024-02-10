import { NextApiRequest } from "next";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.password) {
    throw new Error("password not provided");
  }

  return Response.json({ isAllowed: body.password === process.env.PASSWORD });
}
