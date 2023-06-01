import { NextApiRequest, NextApiResponse } from 'next';
import { without } from 'lodash';

import prismadb from '@/libs/prismadb';
import serverAuth from '@/libs/serverAuth'

export default function handler(req:NextApiRequest, res:NextApiResponse)