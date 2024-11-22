import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status do Site</h1>
      <UpdatedAt />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";
  let database = {};

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    database = data.dependencies.database;
  }

  return (
    <div>
      <span>Última atualização: {updatedAtText}</span>
      <br />

      <h3>Banco de dados</h3>

      <span>Conexões diponíneis: {database.max_connections}</span>
      <br />

      <span>Conexões abertas: {database.opend_connections}</span>
      <br />

      <span>Versão do PostgreSQL: {database.version}</span>
      <br />
    </div>
  );
}
