import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Testimonial',
  tableName: 'testimonials',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    name: { type: 'varchar' },
    email: { type: 'varchar', nullable: true },
    message: { type: 'text' },
    jobTitle: { type: 'varchar', nullable: true },
    company: { type: 'varchar', nullable: true },
    isApproved: { type: 'boolean', default: false },
    dateCreation: { type: 'datetime', createDate: true },
    dateModification: { type: 'datetime', updateDate: true },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: true,
      nullable: true,
    }
  }
});