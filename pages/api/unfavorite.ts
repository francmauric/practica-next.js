import { NextApiRequest, NextApiResponse } from "next";
import prismadb from '@/libs/prismadb';

import { getServerSession } from "next-auth";
import { without } from "lodash";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  console.log('llega unfavorite')
  try {
    if (req.method !== 'POST') {
      console.log('llega aqui')
      return res.status(405).end();
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      throw new Error('Not signed in');
    }

    const { movieId } = req.body;

    const existingMovie = await prismadb.movie.findUnique({
      where: {
        id: movieId,
      }
    });

    if (!existingMovie) {
      throw new Error('Invalid ID');
    }

    const user = await prismadb.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      throw new Error('Invalid email');
    }

    const updatedFavoriteIds = without(user.favoriteIds, movieId);

    const updatedUser = await prismadb.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        favoriteIds: updatedFavoriteIds,
      }
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);

    return res.status(500).end();
  }
}
