import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
  
    const databseVersionResult = await database.query("SHOW server_version;");
    const databaseVersionValue = databseVersionResult.rows[0].server_version;
  
    const databaseMaxConnections = await database.query("SHOW max_connections;");
    const databaseMaxConnectionsValue =
      databaseMaxConnections.rows[0].max_connections;
  
    const databaseName = process.env.POSTGRES_DB;
    const databaseOnpendConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const databaseOnpendConnectionsValue =
      databaseOnpendConnectionsResult.rows[0].count;
  
    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
          opend_connections: databaseOnpendConnectionsValue,
        },
      },
    });
  } catch (error) {
    const publicErrorbject = new InternalServerError({
      cause: error
    })

    console.log('\n Erro dentro do catch do controller:')
    console.log(publicErrorbject )

    response.status(500).json(publicErrorbject)
  }
}

export default status;
