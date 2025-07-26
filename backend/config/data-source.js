import 'reflect-metadata';
import { DataSource } from 'typeorm';
import DesignModel from '../modules/designs/design.entity.js'
import userModel from '../modules/users/user.entity.js'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'canvas',
  synchronize: true,
  logging: true,
  entities: [DesignModel,userModel],
});
