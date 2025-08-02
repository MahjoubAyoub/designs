import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'ElementForme',
  tableName: 'element_forme',
  columns: {
    typeForme: { type: 'varchar' },
    couleur: { type: 'varchar', nullable: true },
  },
  relations: {},
  extends: 'ElementCanvas',
});
