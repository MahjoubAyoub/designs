import 'reflect-metadata';
import { DataSource } from 'typeorm';
import DesignModel from '../modules/designs/design.entity.js'
import userModel from '../modules/users/user.entity.js'
import templateModal from '../modules/templates/template.entity.js';
import testimonialModel from '../modules/testimonials/testimonial.entity.js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'canvas',
  synchronize: true,
  logging: true,
  entities: [DesignModel,userModel,templateModal,testimonialModel],
});

export const initializeDataSource = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('DataSource initialized');
    }
  } catch (err) {
    console.error('Error initializing DataSource:', err);
    throw err;
  }
};