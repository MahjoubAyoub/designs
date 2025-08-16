import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Template',
  tableName: 'templates',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar' },
    description: { type: 'text', nullable: true },
    content: { type: 'json', nullable: true }, // Store template design data as JSON
    category: { type: 'varchar', nullable: true },
    type: { type: 'varchar', nullable: true }, // Template type (e.g., 'json-resume', 'design')
    theme: { type: 'varchar', nullable: true }, // Template theme
    public: { type: 'boolean', default: true },
    preview: { type: 'longtext', nullable: true }, // Preview image as data URL
    dateCreation: { type: 'datetime', createDate: true },
    dateModification: { type: 'datetime', updateDate: true },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: true,
    },
  },
});