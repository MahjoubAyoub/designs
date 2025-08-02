import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'ElementCanvas',
  tableName: 'element_canvas',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    position: { type: 'varchar' },
    ordre: { type: 'int' },
    type: { type: 'varchar' }, // Discriminator for inheritance
  },
  relations: {
    canvas: {
      type: 'many-to-one',
      target: 'Canvas',
      joinColumn: true,
    },
  },
  inheritance: {
    pattern: 'STI',
    column: { name: 'type', type: 'varchar' },
  },
});
