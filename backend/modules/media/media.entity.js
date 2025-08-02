import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Media',
  tableName: 'media',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    uri: { type: 'varchar' },
    dateCreation: { type: 'datetime', createDate: true },
  },
  relations: {
    utilisateur: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: true,
    },
  },
});
