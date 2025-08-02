import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    nom: {
      type: 'varchar',
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    password: {
      type: 'varchar',
    },
    photoProfil: {
      type: 'varchar',
      nullable: true,
    },
    role: {
      type: 'varchar',
      default: 'user',
    },
    archive: {
      type: 'boolean',
      default: false,
    },
    dateCreation: {
      type: 'datetime',
      createDate: true,
    },
    dateModification: {
      type: 'datetime',
      updateDate: true,
    },
  },
  relations: {
    designs: {
      type: 'one-to-many',
      target: 'Design',
      inverseSide: 'user', // must match the relation field name in Design
      cascade: true,
    },
    
  },
});
