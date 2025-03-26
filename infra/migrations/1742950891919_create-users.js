exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()")
    },
    name: {
      type: "varchar(30)",
      notNull: true,
    },
    last_name: {
      type: "varchar(30)",
      notNull: true,
    },
    // why 254? see https://stackoverflow.com/a/1199238
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    // why 72? see https://security.stackexchange.com/q/39849
    password: {
      type: "varchar(72)",
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      default: pgm.func("now()")
    },
    updated_at: {
      type: 'timestamptz',
      default: pgm.func("now()")
    }
  })
};

exports.down = false
