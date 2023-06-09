import { NextApiRequest, NextApiResponse } from 'next';
import { without } from 'lodash';

import prismadb from '@/libs/prismadb';
import serverAuth from '@/libs/serverAuth'
console.log('llega por delete')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('llega aqui')
    
    
    try {
        if (req.method === 'POST') {
            console.log(req.method)
            const { currentUser } = await serverAuth(req, res);
            
            const { movieId } = req.body;
            
            const existingMovie = await prismadb.movie.findUnique({
                where: {
                    id: movieId,
                }
            });

            if (!existingMovie) {
               
                throw new Error('Invalid Id');
            }

            const user = await prismadb.user.update({
                where: {
                    email: currentUser.email || '',
                },
                data: {
                    favoriteIds: {
                        push: movieId,
                    }
                }
            });
            return res.status(200).json(user);
        }   

        if (req.method === 'DELETE') {
            console.log('llega al delete del if')
            const { currentUser } = await serverAuth(req, res);

            /* const movieId = req.query['movieId']; */
            
            //solucion del problema que recibe un array de string
            const movieId = Array.isArray(req.query['movieId']) ? req.query['movieId'][0] : req.query['movieId'];

            const existingMovie = await prismadb.movie.findUnique({
                where: {
                    id: movieId,
                }
            });

         if (!existingMovie) {
            throw new Error('Invalid ID')
         }   

          /* const updatedFavoriteIds = without(currentUser.favoriteIds, movieId); */
          //UTILIZO METODO FILTER EN LUGAR DEL WITHOUT PARA ARREGLAR PROBLEMA DE TYPESCRIPT
          const updatedFavoriteIds = currentUser.favoriteIds.filter(id => id !== movieId);

          const updateUser = await prismadb.user.update({
            
            where: {
                email: currentUser.email || '',
            },
            data: {
                favoriteIds: updatedFavoriteIds,
            }
          }); 
          
          return res.status(200).json(updateUser);
        }

        return res.status(405).end();
    } catch (error) {
        /* console.log(error); */
        return res.status(400).end();
    }
}