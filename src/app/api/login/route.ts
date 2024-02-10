import { NextApiRequest } from "next";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.password) {
      throw new Error("password not provided");
    }

    return Response.json({ isAllowed: body.password === process.env.PASSWORD });
  } catch (error) {
    console.error(error);
  }
}
