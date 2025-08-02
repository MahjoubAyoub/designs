import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'ElementTexte',
  tableName: 'element_texte',
  columns: {
    contenu: { type: 'varchar' },
    police: { type: 'varchar', nullable: true },
    taillePolice: { type: 'int', nullable: true },
    couleur: { type: 'varchar', nullable: true },
  },
  relations: {},
  extends: 'ElementCanvas',
});
