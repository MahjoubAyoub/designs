import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Design',
  tableName: 'designs',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar' },
    public: { type: 'boolean', default: false },
    dateCreation: { type: 'datetime', createDate: true },
    dateModification: { type: 'datetime', updateDate: true },
    depuisTemplate: { type: 'boolean', default: false },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: true,
    }
  }
});
