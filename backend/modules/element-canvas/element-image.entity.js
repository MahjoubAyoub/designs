import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'ElementImage',
  tableName: 'element_image',
  columns: {
    url: { type: 'varchar' },
    titre: { type: 'varchar', nullable: true },
    source: { type: 'varchar', nullable: true },
  },
  relations: {},
  extends: 'ElementCanvas',
});
